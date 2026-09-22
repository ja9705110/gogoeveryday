# 一直都在 — Pet MV renderer

Builds a 1920×1080 / 30fps YouTube-ready music video from the three pet
cut-outs plus an LRC subtitle file, with a KTV-style karaoke wipe.

## Output

`out/yizhidouzai_1080p.mp4` — H.264 High / yuv420p, AAC 320k @ 48kHz, `+faststart`.

## Pipeline

```
assets/source.png ───cutout.py───> assets/pet*.png  (alpha cut-outs)
audio (mp3) ────────analysis────> assets/beats.json (140.00 BPM grid + energy)
lyrics_source.txt ──align_lyrics.py─> lyrics.lrc  (forced-aligned to the vocal)
lyrics.lrc ────────┐
assets/* ──────────┴─render.py─> out/yizhidouzai_1080p.mp4
```

```sh
python3 cutout.py assets/source.png assets           # re-cut the pets
python3 render.py --audio /path/to/song.mp3          # full render (~6 min, 4 cores)
python3 render.py --audio song.mp3 --start 92 --dur 16 --out out/preview.mp4
```

Needs `ffmpeg`, plus `pillow`, `numpy`, `scipy` and the Noto Sans CJK fonts.

## Lyrics

`lyrics_source.txt` holds the lyric sheet, one line per subtitle line, blank
lines marking section breaks (never rendered). `align_lyrics.py` times it
against the vocal:

```sh
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/\
sherpa-onnx-paraformer-zh-2023-09-14.tar.bz2
tar xjf sherpa-onnx-paraformer-*.tar.bz2
python3 align_lyrics.py --audio song.mp3 --model sherpa-onnx-paraformer-zh-2023-09-14 --report
```

Paraformer transcribes the track with per-character timestamps; the transcript
is edit-distance aligned to the known lyrics, so every line takes the time its
own first character is actually sung. Recognition errors cost only their own
anchor. Two details earn their keep:

- **16-second windows.** Paraformer silently drops content past roughly 20s,
  so the pass tiles short windows with context on both sides rather than
  decoding long stretches.
- **Re-hearing.** Lines the pass never anchored, or squeezed below
  `SLOW_ENOUGH` seconds per character, are decoded again under several
  framings. The winner is the one that survives listening back at its own
  proposed time — a confident wrong answer is exactly what needs rejecting,
  and a repeated phrase produces one.

`--report` prints every line with its span and pace, which is the fastest way
to spot a line that drifted. To hand-correct one, edit its stamp in
`lyrics.lrc` and re-render — the aligner does not need to run again.

Any standard LRC file works. A stamp with no text after it closes the previous
phrase, which stops the wipe from stretching across an instrumental break:

```
[00:31.00]我們曾把不可能走成日常
[01:19.60]
```

The wipe sweeps each line over the first 82% of its slot (`draw_lyrics`).
Lines wider than the 1720px title-safe area are shrunk to fit.

## Timeline

Scene layout and energy are keyed to the song's sections in `SCENES`; pets hop
once every two beats, so the motion stays locked to the beat grid. Edit
`SCENES` / `LAYOUTS` in `render.py` to re-stage the video.
