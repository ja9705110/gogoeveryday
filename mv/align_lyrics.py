#!/usr/bin/env python3
"""Time the lyric sheet against the vocal by forced alignment.

Paraformer transcribes the track with per-character timestamps; the transcript
is then edit-distance aligned to the known lyrics, so each line gets the time
its own first character is actually sung. Recognition errors only cost their
own anchor -- the surrounding matches still carry the timing.

Model (234 MB, not vendored):
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/\
sherpa-onnx-paraformer-zh-2023-09-14.tar.bz2 && tar xjf sherpa-onnx-paraformer-*.tar.bz2
"""
import argparse
import os
import re
import subprocess
import sys

import numpy as np
import opencc
import sherpa_onnx

SR = 16000
CJK = re.compile(r"[㐀-䶿一-鿿]")


FILTERS = {
    "plain": "pan=mono|c0=0.5*c0+0.5*c1",
    "boost": "pan=mono|c0=0.5*c0+0.5*c1,loudnorm=I=-14:TP=-1.5",
}


def read_audio(path, flt="plain"):
    """Decode to 16k mono, centre-weighted to favour the lead vocal."""
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-af", FILTERS[flt],
           "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def make_recognizer(model_dir, threads=4):
    return sherpa_onnx.OfflineRecognizer.from_paraformer(
        paraformer=os.path.join(model_dir, "model.int8.onnx"),
        tokens=os.path.join(model_dir, "tokens.txt"),
        num_threads=threads, sample_rate=SR, feature_dim=80,
        decoding_method="greedy_search",
    )


def hear(rec, audio, t0, t1):
    """One window, one pass -> [(char, absolute time)]."""
    seg = audio[int(t0 * SR):int(t1 * SR)]
    if len(seg) < SR // 2:
        return []
    stream = rec.create_stream()
    stream.accept_waveform(SR, seg)
    rec.decode_stream(stream)
    res = stream.result
    return [(tok, t0 + ts) for tok, ts in zip(res.tokens, res.timestamps)
            if CJK.fullmatch(tok)]


def transcribe(rec, audio, chunk=16.0, hop=8.0):
    """Short windows matter: Paraformer silently drops content past ~20s."""
    dur = len(audio) / SR
    margin = (chunk - hop) / 2.0
    out = []
    start = 0.0
    while start < dur:
        end = min(dur, start + chunk)
        # Keep only this window's core so the kept spans tile without overlap,
        # leaving each character `margin` seconds of context on both sides.
        lo = 0.0 if start == 0.0 else start + margin
        hi = dur if end >= dur else start + margin + hop
        out += [(tok, t) for tok, t in hear(rec, audio, start, end) if lo <= t < hi]
        start += hop

    out.sort(key=lambda p: p[1])
    # keep times non-decreasing for the interpolation later
    clean, last = [], -1.0
    for tok, t in out:
        if t >= last:
            clean.append((tok, t))
            last = t
    return clean


def load_anchors(path):
    """Hand-placed timings: `<line> start|end <m:ss>`, 1-based line numbers."""
    marks = []
    if not path or not os.path.exists(path):
        return marks
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            row = raw.split("#", 1)[0].split()
            if len(row) != 3:
                continue
            idx, bound, clock = int(row[0]) - 1, row[1].lower(), row[2]
            mins, _, secs = clock.rpartition(":")
            marks.append((idx, bound, int(mins or 0) * 60 + float(secs)))
    return marks


def load_lines(path):
    lines = []
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            text = raw.rstrip("\n")
            if text.strip():
                lines.append(text)
    return lines


def align(ref, hyp):
    """Levenshtein traceback -> list of (ref_idx, hyp_idx) exact matches."""
    n, m = len(ref), len(hyp)
    prev = np.arange(m + 1, dtype=np.int32)
    bp = np.zeros((n + 1, m + 1), dtype=np.int8)
    bp[0, 1:] = 2
    bp[1:, 0] = 1
    cur = np.empty(m + 1, dtype=np.int32)
    for i in range(1, n + 1):
        cur[0] = i
        ri = ref[i - 1]
        row = bp[i]
        for j in range(1, m + 1):
            d = prev[j - 1] + (0 if ri == hyp[j - 1] else 1)
            u = prev[j] + 1
            l = cur[j - 1] + 1
            if d <= u and d <= l:
                cur[j] = d
                row[j] = 0
            elif u <= l:
                cur[j] = u
                row[j] = 1
            else:
                cur[j] = l
                row[j] = 2
        prev, cur = cur, prev

    pairs = []
    i, j = n, m
    while i > 0 and j > 0:
        move = bp[i, j]
        if move == 0:
            if ref[i - 1] == hyp[j - 1]:
                pairs.append((i - 1, j - 1))
            i -= 1
            j -= 1
        elif move == 1:
            i -= 1
        else:
            j -= 1
    pairs.reverse()
    return pairs


def stamp(t):
    m = int(t // 60)
    return f"[{m:02d}:{t - m * 60:05.2f}]"


def monotonic(anchors):
    """Heaviest run of anchors whose times rise with lyric position.

    Anchors are (position, time, weight). A repeated phrase can make the
    whole-song pass match a line against its second airing, so re-heard
    anchors carry more weight and win those ties.
    """
    a = sorted(anchors, key=lambda x: (x[0], x[1]))
    n = len(a)
    if not n:
        return np.zeros(0), np.zeros(0)
    best = [x[2] for x in a]
    prev = [-1] * n
    for i in range(n):
        ti, wi = a[i][1], a[i][2]
        for j in range(i):
            if a[j][1] <= ti and best[j] + wi > best[i]:
                best[i] = best[j] + wi
                prev[i] = j
    i = max(range(n), key=lambda k: best[k])
    chain = []
    while i >= 0:
        chain.append(a[i])
        i = prev[i]
    chain.reverse()
    return (np.array([c[0] for c in chain], dtype=np.float64),
            np.array([c[1] for c in chain], dtype=np.float64))


def line_bounds(owner, n_lines, xs, ts, fixed=None):
    """Start and end of each line, in the vocal's own time.

    The end is one character past the last one, *not* wherever the next line
    begins -- interpolating to the next character hands a line the whole
    instrumental behind it, and the wipe then crawls a beat behind the voice.
    """
    starts, ends = [], []
    for idx in range(n_lines):
        where = np.flatnonzero(owner == idx)
        first = float(np.interp(where[0], xs, ts))
        last = float(np.interp(where[-1], xs, ts))
        step = (last - first) / (len(where) - 1) if len(where) > 1 else 0.33
        tail = max(0.18, min(0.8, step))
        end = max(min(float(np.interp(where[-1] + 1, xs, ts)), last + tail),
                  first + 0.4)
        if fixed:
            first = fixed.get((idx, "start"), first)
            end = max(fixed.get((idx, "end"), end), first + 0.4)
        starts.append(first)
        ends.append(end)
    return starts, ends


SLOW_ENOUGH = 0.23          # seconds per character below which a line is bogus


def suspect_lines(lines, counts, starts, ends):
    """Lines the full pass either never heard or squeezed to nothing."""
    out = []
    for i, text in enumerate(lines):
        chars = sum(1 for c in text if CJK.fullmatch(c))
        if not counts[i] or (chars and ends[i] - starts[i] < SLOW_ENOUGH * chars):
            out.append(i)
    return out


def verify_line(rec, audio, t, text, to_s, tol=0.6):
    """Is this line sung *at* t -- not merely somewhere nearby?

    Checking only that the words turn up in the window passes a line that is
    seconds early, which is exactly the error worth catching, so the opening
    characters have to land within `tol` of the proposed time.
    """
    want = "".join(c for c in to_s.convert(text) if CJK.fullmatch(c))[:3]
    if not want:
        return True
    heard = hear(rec, audio, max(0.0, t - 2.5), t + 4.0)
    for i in range(len(heard) - len(want) + 1):
        hit = sum(heard[i + k][0] == want[k] for k in range(len(want)))
        if hit >= max(2, len(want) - 1) and abs(heard[i][1] - t) <= tol:
            return True
    return False


def refine_gaps(rec, variants, lines, ref, owner, base, bad, starts, ends, dur, to_s):
    """Re-hear the lines the full pass got wrong, and check the result.

    A whole-song pass reads at a steady rate, so a line next to an
    instrumental break -- or one whose words the singer repeats -- gets
    dragged off its mark. Each hole is re-decoded under several framings and
    the winner is the one that survives listening back, not the one with the
    most anchors: a confident wrong answer is exactly what needs rejecting.
    """
    extra, redone = [], set()
    n = len(starts)
    bad = sorted(bad)
    k = 0
    while k < len(bad):
        idx = bad[k]
        stop = idx
        while k + 1 < len(bad) and bad[k + 1] == stop + 1:
            k += 1
            stop += 1
        k += 1

        hole = set(range(idx, stop + 1))
        outside = [a for a in base if owner[int(a[0])] not in hole]
        # context lines on both sides keep the sub-alignment honest
        span = np.flatnonzero((owner >= max(0, idx - 1)) & (owner <= min(n - 1, stop + 1)))
        sub = [ref[i] for i in span]

        # Two framings: the hole alone, and the hole plus its neighbours.
        # Short windows decode better, but a bare hole can be too tight.
        # Three framings. The neighbours' own bounds can be wrong -- a
        # repeated phrase stretches the line before the hole -- so one shape
        # reaches back well before them rather than trusting that edge.
        shapes = []
        prev_end = ends[idx - 1] if idx else starts[idx] - 3.0
        next_start = starts[stop + 1] if stop + 1 < n else ends[stop] + 3.0
        candidates = [
            (prev_end - 0.8, next_start + 0.8),
            (prev_end - 3.0, next_start + 1.5),
            (starts[idx - 1] if idx else prev_end - 0.8,
             ends[stop + 1] if stop + 1 < n else next_start + 0.8),
        ]
        for a, b in candidates:
            if b - a < 6.0:
                mid = (a + b) / 2.0
                a, b = mid - 3.0, mid + 3.0
            shapes.append((max(0.0, a), min(dur, b)))

        best = None
        for lo, hi in shapes:
            for audio in variants:
                heard = (hear(rec, audio, lo, hi) if hi - lo <= 18.0
                         else [(c, t + lo) for c, t in
                               transcribe(rec, audio[int(lo * SR):int(hi * SR)])])
                hyp = [to_s.convert(c)[0] for c, _ in heard]
                times = [t for _, t in heard]
                got = [(int(span[r]), times[h], 4.0) for r, h in align(sub, hyp)
                       if idx <= owner[span[r]] <= stop]
                if not got:
                    continue
                xs, ts = monotonic(outside + got)
                trial, _ = line_bounds(owner, n, xs, ts)
                score = sum(verify_line(rec, variants[0], trial[i], lines[i], to_s)
                            for i in hole)
                key = (score, len(got))
                if best is None or key > best[0]:
                    best = (key, got, (lo, hi))

        if best:
            (score, count), got, (lo, hi) = best
            extra += got
            redone.update(hole)
            print(f"  lines {idx + 1}-{stop + 1}: re-heard {lo:.1f}-{hi:.1f}s, "
                  f"{count} anchors, {score}/{len(hole)} verified", file=sys.stderr)
        else:
            print(f"  lines {idx + 1}-{stop + 1}: nothing heard", file=sys.stderr)
    return extra, redone


def snap_lines(rec, variants, lines, ref, owner, starts, ends, dur, to_s,
               keep=frozenset()):
    """Last pass: re-measure the start of any line that fails the check.

    Interpolation reads at a steady rate, so a line that follows a held note
    or a short instrumental gets pulled a second or two early. Here the line
    is re-decoded on its own and its start is taken from the recogniser's
    timestamps -- and only kept if the result then verifies.
    """
    moved = 0
    for i, text in enumerate(lines):
        if i in keep or verify_line(rec, variants[0], starts[i], text, to_s):
            continue
        lo, hi = max(0.0, starts[i] - 3.5), min(dur, starts[i] + 6.5)
        span = np.flatnonzero(owner == i)
        sub = [ref[j] for j in span]
        best = None
        for audio in variants:
            heard = hear(rec, audio, lo, hi)
            hyp = [to_s.convert(c)[0] for c, _ in heard]
            times = [t for _, t in heard]
            pairs = align(sub, hyp)
            if not pairs:
                continue
            (r0, h0), (r1, h1) = pairs[0], pairs[-1]
            rate = ((times[h1] - times[h0]) / (r1 - r0)) if r1 > r0 else 0.3
            t0 = times[h0] - r0 * max(0.12, min(0.6, rate))
            if not verify_line(rec, variants[0], t0, text, to_s):
                continue
            cand = (abs(t0 - starts[i]), t0)
            if best is None or cand < best:
                best = cand
        if best:
            print(f"  line {i + 1}: {starts[i]:.2f} -> {best[1]:.2f}", file=sys.stderr)
            starts[i] = best[1]
            moved += 1

    # keep the sequence sane after the moves
    chars = [sum(1 for c in t if CJK.fullmatch(c)) for t in lines]
    for i in range(len(lines)):
        if i and starts[i] < starts[i - 1]:
            starts[i] = starts[i - 1] + 0.3
        nxt = starts[i + 1] if i + 1 < len(lines) else dur
        ends[i] = min(max(ends[i], starts[i] + 0.22 * chars[i], starts[i] + 0.4), nxt)
    return moved


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--model", required=True, help="sherpa-onnx paraformer dir")
    ap.add_argument("--lyrics", default=os.path.join(here, "lyrics_source.txt"))
    ap.add_argument("--out", default=os.path.join(here, "lyrics.lrc"))
    ap.add_argument("--title", default="一直都在")
    ap.add_argument("--album", default="給　曉萱（蹦蹦）")
    ap.add_argument("--gap", type=float, default=0.25,
                    help="close a phrase when the next line is this far off, so\n"
                         "the wipe spans only what is actually sung")
    ap.add_argument("--anchors", default=os.path.join(here, "anchors.txt"),
                    help="hand-placed timings that win over the aligner")
    ap.add_argument("--report", action="store_true")
    args = ap.parse_args()

    rec = make_recognizer(args.model)
    variants = [read_audio(args.audio, f) for f in ("boost", "plain")]
    dur = len(variants[0]) / SR

    lines = load_lines(args.lyrics)
    to_s = opencc.OpenCC("t2s")
    ref, owner = [], []
    for idx, text in enumerate(lines):
        for ch in to_s.convert(text):
            if CJK.fullmatch(ch):
                ref.append(ch)
                owner.append(idx)
    owner = np.array(owner)

    heard = transcribe(rec, variants[0])
    hyp = [to_s.convert(c)[0] for c, _ in heard]
    times = [t for _, t in heard]
    pairs = align(ref, hyp)
    print(f"heard {len(heard)} characters, matched {len(pairs)}/{len(ref)} "
          f"({100 * len(pairs) / len(ref):.0f}%)", file=sys.stderr)

    anchors = [(r, times[h], 1.0) for r, h in pairs]

    # Hand-placed marks outrank anything the recogniser proposes.
    fixed, pinned = {}, set()
    for idx, bound, when in load_anchors(args.anchors):
        fixed[(idx, bound)] = when
        if bound == "start":
            # A start is a real position in the lyric, so it anchors the fit.
            anchors.append((int(np.flatnonzero(owner == idx)[0]), when, 50.0))
            pinned.add(idx)          # a marked END still leaves the start free
        # An END is deliberately NOT fed to the fit. "Just past the last
        # character of this line" and "the first character of the next" are
        # the same position, so anchoring it there drags the next line's
        # start back onto the moment this one stopped. It is applied to this
        # line's end alone, further down.
    if fixed:
        print(f"{len(fixed)} hand-placed marks", file=sys.stderr)
    counts = np.zeros(len(lines), dtype=int)
    for r, _ in pairs:
        counts[owner[r]] += 1

    xs, ts = monotonic(anchors)
    starts, ends = line_bounds(owner, len(lines), xs, ts)
    bad = suspect_lines(lines, counts, starts, ends)
    if bad:
        extra, redone = refine_gaps(rec, variants, lines, ref, owner, anchors,
                                    bad, starts, ends, dur, to_s)
        # a re-heard line speaks for itself; forget what the full pass said
        anchors = [a for a in anchors if owner[int(a[0])] not in redone] + extra

    xs, ts = monotonic(anchors)
    starts, ends = line_bounds(owner, len(lines), xs, ts, fixed)

    moved = snap_lines(rec, variants, lines, ref, owner, starts, ends, dur, to_s, pinned)

    # Re-assert the hand-placed marks, then make room for them: a marked end
    # that runs past the next line's start wins, because the author timed the
    # phrase and the aligner only guessed where the next one began.
    for (idx, bound), when in fixed.items():
        if bound == "start":
            starts[idx] = when
        else:
            ends[idx] = max(when, starts[idx] + 0.4)
    for idx in sorted({i for i, b in fixed if b == "end"}):
        if idx + 1 < len(lines) and starts[idx + 1] < ends[idx]:
            starts[idx + 1] = ends[idx]
            ends[idx + 1] = max(ends[idx + 1], starts[idx + 1] + 0.4)
    checked = sum(verify_line(rec, variants[0], starts[i], lines[i], to_s)
                  for i in range(len(lines)))
    print(f"snapped {moved} lines; {checked}/{len(lines)} verified against the vocal",
          file=sys.stderr)

    rows = []
    for idx, text in enumerate(lines):
        rows.append((starts[idx], text))
        nxt = starts[idx + 1] if idx + 1 < len(lines) else ends[idx] + args.gap
        if nxt - ends[idx] > args.gap:
            rows.append((ends[idx], ""))
    rows.append((min(dur, ends[-1] + 0.6), ""))

    body = [
        f"[ti:{args.title}]", f"[al:{args.album}]",
        "[re:mv/align_lyrics.py]", "[ve:2.0]",
        "# Times are forced-aligned to the vocal, not estimated.",
        "",
    ]
    body += [stamp(t) + text for t, text in rows]
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write("\n".join(body) + "\n")
    print(f"wrote {args.out}", file=sys.stderr)

    if args.report:
        for idx, text in enumerate(lines):
            chars = sum(1 for c in text if CJK.fullmatch(c))
            rate = (ends[idx] - starts[idx]) / max(1, chars)
            flag = " " if counts[idx] else "*"
            print(f"{idx + 1:3d}{flag} {starts[idx]:7.2f} -> {ends[idx]:7.2f}  {rate:4.2f}s/字  {text}")


if __name__ == "__main__":
    main()
