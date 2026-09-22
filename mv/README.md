# 毛孩每一天 — Pet MV renderer

Builds a 1920×1080 / 30fps YouTube-ready music video from the three pet
cut-outs plus an LRC subtitle file, with a KTV-style karaoke wipe.

## Output

`out/pets_mv_1080p.mp4` — H.264 High / yuv420p, AAC 320k @ 48kHz, `+faststart`.

## Pipeline

```
assets/source.png ──cutout.py──> assets/pet*.png  (alpha cut-outs)
audio (mp3) ───────analysis───> assets/beats.json (140.00 BPM grid + energy)
lyrics.lrc ────────┐
assets/* ──────────┴─render.py─> out/pets_mv_1080p.mp4
```

```sh
python3 cutout.py assets/source.png assets           # re-cut the pets
python3 render.py --audio /path/to/song.mp3          # full render (~6 min, 4 cores)
python3 render.py --audio song.mp3 --start 92 --dur 16 --out out/preview.mp4
```

Needs `ffmpeg`, plus `pillow`, `numpy`, `scipy` and the Noto Sans CJK fonts.

## Lyrics

`lyrics.lrc` is **original wording written for this video** — it is not a
transcription of the supplied track, which is a copyrighted commercial
recording. Lines are placed on the 140 BPM bar grid (one line every two bars).

To re-subtitle, replace `lyrics.lrc` with any standard LRC file and re-render.
A stamp with no text after it closes the previous phrase, which stops the wipe
from stretching across an instrumental break:

```
[00:27.57]棕色的耳朵 垂在風裡
[00:31.00]
```

The wipe sweeps each line over the first 82% of its slot (`draw_lyrics`).

## Timeline

Scene layout and energy are keyed to the song's sections in `SCENES`; pets hop
once every two beats, so the motion stays locked to the beat grid. Edit
`SCENES` / `LAYOUTS` in `render.py` to re-stage the video.
