# 一直都在 — Pet MV renderer

Builds a 1920×1080 / 30fps YouTube-ready music video from the three pet
cut-outs plus an LRC subtitle file, with a KTV-style karaoke wipe. One lyric line is on screen at a time.

## Output

`out/yizhidouzai_1080p.mp4` — H.264 High / yuv420p, AAC @ 48kHz, `+faststart`. The fur detail is
expensive: the CRF 17 master runs ~186 MB for 4:13.

## Pipeline

```
assets/hires/*.png ──cutout.py───> assets/pet*.png  (alpha cut-outs)
audio (mp3) ────────analysis────> assets/beats.json (140.00 BPM grid + energy)
lyrics_source.txt ─┐
anchors.txt ───────┴─align_lyrics.py─> lyrics.lrc  (aligned to the vocal)
lyrics.lrc ────────┐
assets/* ──────────┴─render.py─> out/yizhidouzai_1080p.mp4
```

```sh
python3 cutout.py --out assets --single \
    pet1_bunny_brown=assets/hires/brown_bunny.png \
    pet2_dog=assets/hires/dog.png \
    pet3_bunny_white=assets/hires/white_bunny.png
python3 render.py --audio /path/to/song.mp3          # full render (~6 min, 4 cores)
python3 render.py --audio song.mp3 --photos photos/  # slideshow instead of pastel
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

### Hand-placed marks

`anchors.txt` holds timings the author took by ear, one per row:

```
 1  end    0:17
47  start  2:51
```

They outrank everything the recogniser proposes and come through to the LRC
exactly. A marked **end** leaves that line's start free, so the aligner still
places it; a marked end that runs past the next line's start wins, and the
next line is pushed back to meet it — the author timed the phrase, the
aligner only guessed where the next one began.

`--report` prints every line with its span and pace, which is the fastest way
to spot a line that drifted. To hand-correct one, add a row to `anchors.txt`
and re-run, or edit its stamp in `lyrics.lrc` and re-render.

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

## Slideshow

`--photos DIR` puts stills behind the lyrics instead of the pastel stage, in
filename order. Slots are even and each boundary is pulled onto the nearest
bar line, so slides turn over with the music rather than against it; every
slide gets its own slow push or pull and an `XFADE`-second dissolve.

Aspect is handled per photo. Between 1.45 and 2.2 (16:9, 3:2) a photo is
cropped to full bleed, biased high so faces survive the trim. Squarer, taller
or panoramic photos keep all of themselves: a blurred, dimmed copy of the same
photo fills the frame behind, and the photo is matted in front. Orientation
follows the EXIF tag.

`--pets full|corner|none` says what becomes of the three cut-outs. With photos
the default is `corner`: a small huddle in the top right that still hops on
the beat. The lyric scrim deepens automatically so text stays legible over
whatever is underneath.

## Pets

`assets/hires/` holds one ~1250px portrait per animal on a flat white
backdrop; `cutout.py --single` lifts each onto alpha. The white bunny is the
hard case, white fur on near-white, so the alpha ramp starts just above the
backdrop's measured grain rather than at a fixed threshold.

`upscale_pets.py` (EDSR via `cv2.dnn_superres`) remains for low-resolution
sources — it rebuilt the earlier ~120px cut-outs at 4x — and `load_pets`
prefers `*_x4.png` when one exists. The current sources need no upscale.
Tracing to real vectors was tried and rejected: a colour trace turns fur into
flat blobs with contour lines, which reads as a poster, not as these animals.

Sprites are normalised to `PET_W`, not to a common height: the white bunny's
ears are half its bounding box, so matching heights shrinks its face against
the other two.

## Checking the timings

`align_lyrics.py` verifies its own work. `verify_line` re-decodes a window and
requires the line's opening characters to land **within a second of the
proposed time** — checking only that the words appear somewhere nearby passes
a line that is seconds early, which is the error worth catching. Lines that
fail get their start re-measured from the recogniser's timestamps
(`snap_lines`) and are kept only if the new time verifies. The run prints
`N/66 verified against the vocal`; anything under 66 names the lines.
