#!/usr/bin/env python3
"""Render the three-pet music video: 1920x1080 @30fps with KTV lyric wipe.

Pet motion is locked to the beat grid in assets/beats.json; subtitles come from
an LRC file, so re-subtitling the video only means swapping lyrics.lrc.
"""
import argparse
import glob
import json
import math
import os
import random
import re
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
from scipy import ndimage

W, H = 1920, 1080
FONT_PATH = "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"
FONT_TC = 3
PETS = ["pet1_bunny_brown", "pet2_dog", "pet3_bunny_white"]
PET_W = 420                     # width in px at scale 1.0

# Width, not height: the white bunny's ears are half its bounding box, so
# matching heights would shrink its face against the other two.

INK = (74, 43, 69)              # outline / text shadow plum
CREAM = (255, 252, 248)
HL_TOP = (255, 226, 112)        # karaoke wipe gradient
HL_BOT = (255, 118, 168)

LYRIC_Y = 876                   # centre of the active line
NEXT_Y = 998
SCRIM_TOP = 780
LINE_HOLD = 2.6                 # seconds a finished phrase stays up

PHOTO_W, PHOTO_H = 2560, 1440   # working canvas; the extra area is pan headroom
XFADE = 0.9                     # crossfade between slides
CORNER_LAYOUT = [               # where the pets sit once photos take the stage
    (1570, 202, 0.28), (1700, 236, 0.30), (1820, 202, 0.28),
]

# scene start, layout, energy (drives bounce height and particle rate)
SCENES = [
    (0.00, "triangle", 0.22),
    (27.57, "row", 0.55),
    (55.00, "rowalt", 0.62),
    (82.40, "huddle", 0.78),
    (96.14, "arc", 1.00),
    (123.60, "row", 0.60),
    (151.00, "arc", 1.00),
    (178.40, "huddle", 0.55),
    (192.10, "arc", 1.10),
    (219.60, "triangle", 0.28),
]
TRANS = 1.3                     # seconds to blend between layouts

LAYOUTS = {
    # (x, y, scale) per pet
    "triangle": [(960, 282, 1.02), (500, 520, 0.96), (1420, 520, 0.96)],
    "row": [(356, 448, 0.94), (960, 492, 1.00), (1564, 448, 0.94)],
    "rowalt": [(368, 500, 0.98), (960, 408, 0.94), (1552, 500, 0.98)],
    "huddle": [(486, 466, 1.06), (960, 512, 1.14), (1434, 466, 1.06)],
    "arc": [(340, 474, 1.06), (960, 334, 1.22), (1580, 474, 1.06)],
}

TITLE = "一直都在"
SUBTITLE = "給　曉萱（蹦蹦）"
END_LINE = "給　曉萱（蹦蹦）"

G = {}                          # per-process render assets


# --------------------------------------------------------------------------- #
# lyrics
# --------------------------------------------------------------------------- #
STAMP = re.compile(r"\[(\d+):(\d+(?:\.\d+)?)\]")


def load_lrc(path):
    """Standard LRC -> [{start, end, text}]. Empty-text stamps close a phrase."""
    marks = []
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if line.lstrip().startswith("#"):
                continue
            stamps = list(STAMP.finditer(line))
            if not stamps:
                continue
            text = line[stamps[-1].end():].strip()
            for m in stamps:
                marks.append((int(m.group(1)) * 60 + float(m.group(2)), text))
    marks.sort(key=lambda m: m[0])

    lines = []
    for i, (t, text) in enumerate(marks):
        if not text:
            continue
        end = marks[i + 1][0] if i + 1 < len(marks) else t + 4.0
        lines.append({"start": t, "end": end, "text": text})
    return lines


# --------------------------------------------------------------------------- #
# sprite builders
# --------------------------------------------------------------------------- #
def vgradient(size, stops):
    w, h = size
    pos = np.array([s[0] for s in stops], dtype=np.float32)
    cols = np.array([s[1] for s in stops], dtype=np.float32)
    y = np.linspace(0.0, 1.0, h, dtype=np.float32)
    out = np.empty((h, 3), dtype=np.float32)
    for c in range(3):
        out[:, c] = np.interp(y, pos, cols[:, c])
    return np.repeat(out[:, None, :], w, axis=1)


def soft_blob(radius, color, peak, falloff=2.2):
    d = radius * 2
    yy, xx = np.mgrid[0:d, 0:d].astype(np.float32)
    r = np.hypot(xx - radius, yy - radius) / radius
    a = np.clip(1.0 - r, 0.0, 1.0) ** falloff * peak
    arr = np.zeros((d, d, 4), dtype=np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = color
    arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def _shape(kind, size, color, alpha=235):
    """Draw a particle at 4x and downsample for clean edges."""
    s = size * 4
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    fill = color + (alpha,)
    if kind == "heart":
        pts = []
        for i in range(90):
            a = i / 89 * 2 * math.pi
            x = 16 * math.sin(a) ** 3
            y = -(13 * math.cos(a) - 5 * math.cos(2 * a)
                  - 2 * math.cos(3 * a) - math.cos(4 * a))
            pts.append((s / 2 + x * s / 38, s / 2 + y * s / 38))
        d.polygon(pts, fill=fill)
    elif kind == "paw":
        d.ellipse([s * .26, s * .40, s * .74, s * .84], fill=fill)
        for cx, cy, r in ((.22, .30, .11), (.42, .20, .12),
                          (.62, .20, .12), (.80, .32, .11)):
            d.ellipse([(cx - r) * s, (cy - r) * s, (cx + r) * s, (cy + r) * s], fill=fill)
    elif kind == "star":
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            rr = s * (0.47 if i % 2 == 0 else 0.20)
            pts.append((s / 2 + rr * math.cos(a), s / 2 + rr * math.sin(a)))
        d.polygon(pts, fill=fill)
    else:
        d.ellipse([s * .18, s * .18, s * .82, s * .82], fill=fill)
    return im.resize((size, size), Image.LANCZOS)


def stickerize(im, ring=11, drop=12):
    """Cream sticker border plus a soft drop shadow.

    The cutouts are 3x upscales of a small sheet, so a crisp border does more
    for the silhouette than sharpening ever could, and it hides the faint
    contour the white bunny carries in the source art.
    """
    pad = ring + drop + 22
    cw, ch = im.width + pad * 2, im.height + pad * 2
    a = np.zeros((ch, cw), dtype=np.uint8)
    a[pad:pad + im.height, pad:pad + im.width] = np.array(im.getchannel("A"))

    dist = ndimage.distance_transform_edt(a <= 110)
    band = np.clip((ring + 1.0 - dist) / 1.8, 0.0, 1.0).astype(np.float32)

    shadow = np.zeros((ch, cw, 4), dtype=np.uint8)
    shadow[..., 0], shadow[..., 1], shadow[..., 2] = 104, 62, 98
    shadow[..., 3] = (ndimage.gaussian_filter(band, 9.0) * 0.45 * 255).astype(np.uint8)
    out = Image.fromarray(shadow, "RGBA")
    out = Image.fromarray(np.roll(np.array(out), drop, axis=0), "RGBA")

    border = np.zeros((ch, cw, 4), dtype=np.uint8)
    border[..., 0], border[..., 1], border[..., 2] = CREAM
    border[..., 3] = (band * 255).astype(np.uint8)
    out.alpha_composite(Image.fromarray(border, "RGBA"))
    out.alpha_composite(im, (pad, pad))
    return out


# --------------------------------------------------------------------------- #
# photo slideshow
# --------------------------------------------------------------------------- #
def load_photo(path):
    """One slide on the working canvas, portrait shots filled out behind."""
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    ratio = im.width / im.height
    if 1.45 <= ratio <= 2.2:
        # 16:9, 3:2 and friends: crop to full bleed, biased high so faces
        # survive the trim.
        return ImageOps.fit(im, (PHOTO_W, PHOTO_H), Image.LANCZOS,
                            centering=(0.5, 0.42))

    # Anything squarer, taller or panoramic keeps all of itself: a blurred,
    # dimmed copy fills the frame behind, the photo is matted in front.
    back = ImageOps.fit(im, (PHOTO_W, PHOTO_H), Image.LANCZOS, centering=(0.5, 0.45))
    back = ImageEnhance.Brightness(back.filter(ImageFilter.GaussianBlur(44))).enhance(0.8)
    front = im.copy()
    front.thumbnail((int(PHOTO_W * 0.86), int(PHOTO_H * 0.93)), Image.LANCZOS)
    x, y = (PHOTO_W - front.width) // 2, int(PHOTO_H * 0.5 - front.height / 2)
    pad = 10
    mat = Image.new("RGB", (front.width + pad * 2, front.height + pad * 2), CREAM)
    shadow = Image.new("RGBA", back.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle(
        [x - pad, y - pad + 14, x + front.width + pad, y + front.height + pad + 14],
        fill=(40, 22, 38, 150))
    back = Image.alpha_composite(
        back.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(22))).convert("RGB")
    back.paste(mat, (x - pad, y - pad))
    back.paste(front, (x, y))
    return back


def photo_schedule(count, duration, b0, bar):
    """Even slots, each boundary pulled onto the nearest bar line."""
    edges = []
    for k in range(count + 1):
        t = k * duration / count
        edges.append(round((t - b0) / bar) * bar + b0)
    edges[0], edges[-1] = 0.0, duration
    for k in range(1, count):                       # keep them strictly rising
        edges[k] = min(max(edges[k], edges[k - 1] + bar), duration - bar)
    return list(zip(edges[:-1], edges[1:]))


def ken_burns(idx):
    """Slow push or pull across the slide, different every time but stable."""
    rng = random.Random(9001 + idx * 7)
    near = rng.uniform(0.84, 0.90)
    far = min(1.0, near + rng.uniform(0.07, 0.13))
    a, b = (near, far) if rng.random() < 0.5 else (far, near)
    return ((a, rng.uniform(0.2, 0.8), rng.uniform(0.25, 0.75)),
            (b, rng.uniform(0.2, 0.8), rng.uniform(0.25, 0.75)))


def slide(idx, u):
    """Frame `idx` of the slideshow, `u` in 0..1 across its slot."""
    cache = G["slides"]
    if idx not in cache:
        cache[idx] = load_photo(G["photos"][idx])
        for stale in sorted(cache)[:-4]:
            if stale != idx:
                del cache[stale]
    base = cache[idx]

    (z0, x0, y0), (z1, x1, y1) = G["moves"][idx]
    k = smoothstep(u)
    z, cx, cy = z0 + (z1 - z0) * k, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k
    cw, ch = PHOTO_W * z, PHOTO_H * z
    left, top = (PHOTO_W - cw) * cx, (PHOTO_H - ch) * cy
    box = (int(left), int(top), int(left + cw), int(top + ch))
    return base.resize((W, H), Image.BICUBIC, box=box)


def photo_frame(t):
    for idx, (start, end) in enumerate(G["shots"]):
        if start <= t < end or idx == len(G["shots"]) - 1:
            frame = slide(idx, (t - start) / max(0.1, end - start))
            if idx and t - start < XFADE:
                prev_start, prev_end = G["shots"][idx - 1]
                back = slide(idx - 1, min(1.0, (t - prev_start) /
                                          max(0.1, prev_end - prev_start)))
                frame = Image.blend(back, frame, smoothstep((t - start) / XFADE))
            return frame
    return Image.new("RGB", (W, H), (0, 0, 0))


def load_pets(assets):
    out = []
    for name in PETS:
        # Prefer the super-resolved cut-out so the layout scales down, not up.
        path = os.path.join(assets, name + "_x4.png")
        if not os.path.exists(path):
            path = os.path.join(assets, name + ".png")
        im = Image.open(path).convert("RGBA")
        scale = PET_W / im.width
        im = im.resize((PET_W, max(1, round(im.height * scale))), Image.LANCZOS)
        # Sharpen colour only; sharpening alpha would re-introduce a fringe.
        rgb, a = im.convert("RGB"), im.getchannel("A")
        rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=3))
        im = rgb.convert("RGBA")
        im.putalpha(a)
        out.append(stickerize(im))
    return out


# --------------------------------------------------------------------------- #
# text layers
# --------------------------------------------------------------------------- #
def text_layers(text, size, stroke, grad=True, max_w=1720):
    """Return (base, highlight) RGBA layers of identical size, text centred."""
    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    font = ImageFont.truetype(FONT_PATH, size, index=FONT_TC)
    box = probe.textbbox((0, 0), text, font=font, stroke_width=stroke)
    if box[2] - box[0] > max_w:                       # shrink to fit the safe area
        size = max(28, int(size * max_w / (box[2] - box[0])))
        font = ImageFont.truetype(FONT_PATH, size, index=FONT_TC)
        box = probe.textbbox((0, 0), text, font=font, stroke_width=stroke)
    pad = stroke * 3 + 8
    cw, ch = box[2] - box[0] + pad * 2, box[3] - box[1] + pad * 2
    org = (pad - box[0], pad - box[1])

    outline = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    ImageDraw.Draw(outline).text(org, text, font=font, fill=INK + (255,),
                                 stroke_width=stroke, stroke_fill=INK + (255,))
    outline = outline.filter(ImageFilter.GaussianBlur(0.6))

    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).text(org, text, font=font, fill=255)

    base = outline.copy()
    fill = Image.new("RGBA", (cw, ch), CREAM + (255,))
    base.paste(fill, (0, 0), mask)

    hl = outline.copy()
    if grad:
        arr = vgradient((cw, ch), [(0.0, HL_TOP), (1.0, HL_BOT)])
        gfill = Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")
    else:
        gfill = Image.new("RGBA", (cw, ch), HL_TOP + (255,))
    hl.paste(gfill, (0, 0), mask)
    return base, hl


# --------------------------------------------------------------------------- #
# per-process setup
# --------------------------------------------------------------------------- #
def init(assets, lrc_path, photos=None, pets="full", energy_boost=1.0):
    beats = json.load(open(os.path.join(assets, "beats.json")))
    G["beats"] = np.array(beats["beats"], dtype=np.float32)
    G["bpm"] = beats["bpm"]
    G["b0"] = beats["phase"]
    G["period"] = 60.0 / beats["bpm"]
    G["duration"] = beats["duration"]
    G["boost"] = energy_boost
    G["pets_mode"] = pets

    G["photos"] = sorted(glob.glob(os.path.join(photos, "*"))) if photos else []
    G["photos"] = [f for f in G["photos"]
                   if os.path.splitext(f)[1].lower() in
                   (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff")]
    if G["photos"]:
        bar = 4 * G["period"]
        G["shots"] = photo_schedule(len(G["photos"]), G["duration"], G["b0"], bar)
        G["moves"] = [ken_burns(i) for i in range(len(G["photos"]))]
        G["slides"] = {}

    G["bg"] = vgradient((W, H), [
        (0.00, (255, 219, 198)), (0.38, (255, 198, 214)),
        (0.72, (226, 199, 240)), (1.00, (198, 198, 242)),
    ]).astype(np.uint8)

    G["blobs"] = [
        (soft_blob(560, (185, 236, 216), 0.30), 300, 300, 520, 180, 31.0, 23.0, 0.0),
        (soft_blob(620, (255, 240, 176), 0.26), 1550, 260, 420, 200, 37.0, 27.0, 1.7),
        (soft_blob(520, (214, 190, 250), 0.28), 1400, 760, 480, 190, 29.0, 33.0, 3.1),
        (soft_blob(480, (255, 186, 178), 0.24), 420, 820, 440, 170, 41.0, 25.0, 4.6),
        (soft_blob(560, (190, 226, 255), 0.22), 960, 540, 620, 240, 34.0, 30.0, 2.4),
    ]
    G["bokeh"] = [soft_blob(r, (255, 255, 255), 0.42, 1.6) for r in (8, 13, 19, 26)]

    G["pets"] = load_pets(assets)
    G["xcache"] = {}
    G["pcache"] = {}

    G["particles"] = build_particles(G["beats"])

    lines = load_lrc(lrc_path)
    G["lines"] = lines
    G["layers"] = [text_layers(ln["text"], 88, 8) for ln in lines]
    G["next"] = [text_layers(ln["text"], 50, 5, grad=False)[0] for ln in lines]

    G["title"] = text_layers(TITLE, 132, 10)[0]
    G["subtitle"] = text_layers(SUBTITLE, 46, 5)[0]
    G["endline"] = text_layers(END_LINE, 76, 8)[0]

    scrim = np.zeros((H, W, 4), dtype=np.float32)
    ramp = np.clip((np.arange(H) - SCRIM_TOP) / (H - SCRIM_TOP), 0, 1) ** 1.4
    weight = 0.58 if G["photos"] else 0.34   # photos need a firmer bed
    scrim[..., 3] = (ramp * weight * 255)[:, None]
    scrim[..., 0], scrim[..., 1], scrim[..., 2] = 78, 46, 72
    G["scrim"] = Image.fromarray(scrim.astype(np.uint8), "RGBA")

    vig = np.zeros((H, W, 4), dtype=np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
    vig[..., 3] = np.clip((r - 0.72) / 0.75, 0, 1) * 0.30 * 255
    vig[..., 0], vig[..., 1], vig[..., 2] = 92, 58, 84
    G["vignette"] = Image.fromarray(vig.astype(np.uint8), "RGBA")


def build_particles(beats):
    rng = np.random.default_rng(20260922)
    kinds = ["heart", "paw", "star", "dot"]
    colors = [(255, 128, 168), (255, 196, 96), (168, 220, 255),
              (198, 168, 246), (255, 246, 214)]
    out = []
    for i, t in enumerate(beats):
        if i % 2:
            continue
        e = scene_at(float(t))[1]
        n = int(round(3.2 * e))
        for _ in range(n):
            size = int(rng.integers(34, 86))
            out.append({
                "t0": float(t),
                "x": float(rng.uniform(80, W - 80)),
                "y": float(rng.uniform(600, 960)),
                "vx": float(rng.uniform(-38, 38)),
                "vy": float(rng.uniform(-190, -110)),
                "rot": float(rng.uniform(0, 360)),
                "spin": float(rng.uniform(-70, 70)),
                "kind": kinds[int(rng.integers(0, len(kinds)))],
                "color": colors[int(rng.integers(0, len(colors)))],
                "size": size,
                "life": float(rng.uniform(2.1, 3.0)),
            })
    out.sort(key=lambda p: p["t0"])
    return out


# --------------------------------------------------------------------------- #
# timeline helpers
# --------------------------------------------------------------------------- #
def scene_at(t):
    idx = 0
    for i, (start, _, _) in enumerate(SCENES):
        if t >= start:
            idx = i
    return SCENES[idx][1], SCENES[idx][2], idx


def smoothstep(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def layout_at(t):
    name, energy, idx = scene_at(t)
    cur = LAYOUTS[name]
    start = SCENES[idx][0]
    if idx > 0 and t - start < TRANS:
        prev = LAYOUTS[SCENES[idx - 1][1]]
        k = smoothstep((t - start) / TRANS)
        cur = [tuple(p * (1 - k) + c * k for p, c in zip(pp, cc))
               for pp, cc in zip(prev, cur)]
        energy = SCENES[idx - 1][2] * (1 - k) + energy * k
    return cur, energy


def xform(i, scale, angle, sx=1.0, sy=1.0):
    key = (i, round(scale, 2), round(angle, 1), round(sx, 2), round(sy, 2))
    hit = G["xcache"].get(key)
    if hit is not None:
        return hit
    im = G["pets"][i]
    w = max(1, round(im.width * scale * sx))
    h = max(1, round(im.height * scale * sy))
    im = im.resize((w, h), Image.BICUBIC)
    if abs(angle) > 0.05:
        im = im.rotate(angle, Image.BICUBIC, expand=True)
    if len(G["xcache"]) > 4000:
        G["xcache"].clear()
    G["xcache"][key] = im
    return im


def particle_sprite(kind, size, color, rot):
    key = (kind, size, color, int(rot) // 6 * 6)
    hit = G["pcache"].get(key)
    if hit is not None:
        return hit
    im = _shape(kind, size, color).rotate(rot, Image.BICUBIC, expand=True)
    if len(G["pcache"]) > 3000:
        G["pcache"].clear()
    G["pcache"][key] = im
    return im


def fade(t, a, b, c, d):
    """Trapezoid envelope: 0 before a, 1 between b and c, 0 after d."""
    if t <= a or t >= d:
        return 0.0
    if t < b:
        return smoothstep((t - a) / max(1e-6, b - a))
    if t > c:
        return 1.0 - smoothstep((t - c) / max(1e-6, d - c))
    return 1.0


def paste_alpha(dst, src, xy, alpha=1.0):
    if alpha <= 0.003:
        return
    if alpha < 0.997:
        a = src.getchannel("A").point(lambda v: int(v * alpha))
        dst.paste(src, xy, a)
    else:
        dst.paste(src, xy, src)


# --------------------------------------------------------------------------- #
# frame
# --------------------------------------------------------------------------- #
def render_frame(t):
    if G["photos"]:
        frame = photo_frame(t)
        draw_pets(frame, t)
        frame = frame.convert("RGBA")
        frame.alpha_composite(G["vignette"])
        frame.alpha_composite(G["scrim"])
        draw_lyrics(frame, t)
        return frame.convert("RGB")

    frame = Image.fromarray(G["bg"].copy(), "RGB")

    for sprite, cx, cy, ax, ay, tx, ty, ph in G["blobs"]:
        x = cx + ax * math.sin(2 * math.pi * t / tx + ph)
        y = cy + ay * math.sin(2 * math.pi * t / ty + ph * 1.7)
        frame.paste(sprite, (int(x - sprite.width / 2), int(y - sprite.height / 2)), sprite)

    # drifting bokeh
    for i, sprite in enumerate(G["bokeh"]):
        for k in range(7):
            seed = i * 7 + k
            sx = (seed * 263 % W)
            speed = 26 + (seed % 5) * 9
            y = (H + 120 - (t * speed + seed * 151) % (H + 260))
            x = sx + 70 * math.sin(2 * math.pi * t / (17 + seed % 9) + seed)
            tw = 0.55 + 0.45 * math.sin(2 * math.pi * t / 3.3 + seed)
            paste_alpha(frame, sprite,
                        (int(x - sprite.width / 2), int(y - sprite.height / 2)), tw)

    draw_pets(frame, t)

    # particles
    for p in G["particles"]:
        dt = t - p["t0"]
        if dt < 0:
            break
        if dt > p["life"]:
            continue
        a = min(1.0, dt / 0.22) * (1.0 - smoothstep((dt - (p["life"] - 0.8)) / 0.8))
        if a <= 0.01:
            continue
        x = p["x"] + p["vx"] * dt
        y = p["y"] + p["vy"] * dt + 42 * dt * dt
        sprite = particle_sprite(p["kind"], p["size"], p["color"], p["rot"] + p["spin"] * dt)
        paste_alpha(frame, sprite,
                    (int(x - sprite.width / 2), int(y - sprite.height / 2)), a * 0.9)

    frame = frame.convert("RGBA")
    frame.alpha_composite(G["vignette"])
    frame.alpha_composite(G["scrim"])
    draw_lyrics(frame, t)
    return frame.convert("RGB")


def draw_pets(frame, t):
    """Beat-locked hop; a small corner huddle once photos hold the frame."""
    if G["pets_mode"] == "none":
        return
    corner = G["pets_mode"] == "corner"
    if corner:
        layout, energy = CORNER_LAYOUT, 0.45
    else:
        layout, energy = layout_at(t)
    energy *= G["boost"]
    cycle = G["period"] * 2                  # one bounce every two beats

    for i, (x, y, sc) in enumerate(layout):
        ph = (t - G["b0"]) / cycle + i / 3.0
        f = ph % 1.0
        hop = 1.0 - (2 * f - 1) ** 2         # parabolic arc
        lift = (26 if corner else 74) * energy * hop
        land = max(0.0, 1.0 - abs(2 * f - 1) * 4.0)   # squash near touchdown
        sx = 1.0 + 0.09 * land * energy
        sy = 1.0 - 0.09 * land * energy
        tilt = 7.0 * math.sin(2 * math.pi * t / 3.4 + i * 2.1) * (0.4 + 0.6 * energy)
        sway = (5 if corner else 16) * math.sin(2 * math.pi * t / 5.1 + i * 1.3)

        sprite = xform(i, sc, tilt, sx, sy)
        # staggered entrance during the intro
        alpha = fade(t, 2.0 + i * 1.7, 4.0 + i * 1.7, G["duration"] - 8.0,
                     G["duration"] - 2.0)
        paste_alpha(frame, sprite,
                    (int(x + sway - sprite.width / 2),
                     int(y - lift - sprite.height / 2)), alpha)


def draw_lyrics(frame, t):
    lines, layers = G["lines"], G["layers"]
    first = lines[0]["start"] if lines else 1e9
    last_end = lines[-1]["end"] if lines else 0.0

    # title card before the first line
    a = fade(t, 1.2, 3.4, first - 3.0, first - 0.6)
    if a > 0:
        ttl = G["title"]
        paste_alpha(frame, ttl, ((W - ttl.width) // 2, 846 - ttl.height // 2), a)
        sub = G["subtitle"]
        paste_alpha(frame, sub, ((W - sub.width) // 2, 974 - sub.height // 2), a * 0.95)

    # end card
    a = fade(t, last_end + 1.5, last_end + 3.2, G["duration"] - 5.0, G["duration"] - 1.5)
    if a > 0:
        ttl = G["title"]
        paste_alpha(frame, ttl, ((W - ttl.width) // 2, 848 - ttl.height // 2), a)
        end = G["endline"]
        paste_alpha(frame, end, ((W - end.width) // 2, 980 - end.height // 2), a * 0.95)

    # A finished phrase lingers, fully lit, until the next one or the
    # instrumental takes over -- the LRC's end is where singing stops, which
    # is what the wipe follows, not how long the line stays up.
    idx = None
    for i, ln in enumerate(lines):
        if ln["start"] <= t:
            idx = i
        else:
            break
    if idx is not None:
        nxt = lines[idx + 1]["start"] if idx + 1 < len(lines) else 1e9
        if t >= min(nxt, lines[idx]["end"] + LINE_HOLD):
            idx = None
    if idx is None:
        # show the upcoming line during a gap, plus the KTV count-in
        nxt = next((i for i, ln in enumerate(lines) if ln["start"] > t), None)
        if nxt is not None and lines[nxt]["start"] - t <= 1.72 and t > first - 1.8:
            count_in(frame, lines[nxt]["start"] - t)
            base = layers[nxt][0]
            paste_alpha(frame, base, ((W - base.width) // 2, LYRIC_Y - base.height // 2), 0.75)
        return

    ln, (base, hl) = lines[idx], layers[idx]
    x0, y0 = (W - base.width) // 2, LYRIC_Y - base.height // 2
    paste_alpha(frame, base, (x0, y0))

    # wipe across exactly the span the line is sung over
    span = max(0.25, ln["end"] - ln["start"])
    k = min(1.0, max(0.0, (t - ln["start"]) / span))
    cut = int(round(hl.width * k))
    if cut > 0:
        paste_alpha(frame, hl.crop((0, 0, cut, hl.height)), (x0, y0))

    if idx + 1 < len(lines) and lines[idx + 1]["start"] - ln["end"] < 4.0:
        nb = G["next"][idx + 1]
        paste_alpha(frame, nb, ((W - nb.width) // 2, NEXT_Y - nb.height // 2), 0.62)


def count_in(frame, remain):
    """Four shrinking dots over the last bar before a phrase starts."""
    bar = 4 * G["period"]
    if remain > bar:
        return
    lit = int(math.ceil(remain / (bar / 4)))
    d = ImageDraw.Draw(frame)
    r, gap = 15, 52
    total = gap * 3
    cx, cy = W // 2 - total // 2, LYRIC_Y - 92
    for i in range(4):
        on = i < lit
        col = HL_BOT + (235,) if on else CREAM + (110,)
        x = cx + i * gap
        d.ellipse([x - r, cy - r, x + r, cy + r], fill=col,
                  outline=INK + (200,), width=3)


# --------------------------------------------------------------------------- #
# encoding
# --------------------------------------------------------------------------- #
def render_segment(job):
    a, b, fps, path = job
    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
        "-pix_fmt", "yuv420p", "-g", str(fps * 2), path,
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(a, b):
        proc.stdin.write(render_frame(f / fps).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError(f"segment {path} failed")
    return path


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--assets", default=os.path.join(here, "assets"))
    ap.add_argument("--lrc", default=os.path.join(here, "lyrics.lrc"))
    ap.add_argument("--out", default=os.path.join(here, "out", "pets_mv.mp4"))
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--jobs", type=int, default=max(1, os.cpu_count() or 1))
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--dur", type=float, default=None, help="preview length")
    ap.add_argument("--photos", default=None,
                    help="directory of slideshow stills, shown in filename order")
    ap.add_argument("--pets", default=None, choices=("full", "corner", "none"),
                    help="default: full without photos, corner with them")
    ap.add_argument("--tmp", default=None)
    args = ap.parse_args()

    pets = args.pets or ("corner" if args.photos else "full")
    beats = json.load(open(os.path.join(args.assets, "beats.json")))
    duration = beats["duration"] if args.dur is None else args.dur
    f0 = int(round(args.start * args.fps))
    f1 = f0 + int(math.ceil(duration * args.fps))

    tmp = args.tmp or os.path.join(here, "out", "segments")
    os.makedirs(tmp, exist_ok=True)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)

    nseg = max(1, args.jobs * 2)
    edges = np.linspace(f0, f1, nseg + 1).round().astype(int)
    jobs = [(int(edges[i]), int(edges[i + 1]), args.fps,
             os.path.join(tmp, f"seg{i:03d}.mp4"))
            for i in range(nseg) if edges[i + 1] > edges[i]]

    if args.photos:
        n = len([f for f in sorted(glob.glob(os.path.join(args.photos, "*")))
                 if os.path.splitext(f)[1].lower() in
                 (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff")])
        print(f"slideshow: {n} photos, {duration / max(1, n):.1f}s each, pets={pets}")
    print(f"frames {f0}..{f1} ({f1 - f0}) in {len(jobs)} segments on {args.jobs} workers")
    with Pool(args.jobs, initializer=init, initargs=(args.assets, args.lrc, args.photos, pets)) as pool:
        for i, path in enumerate(pool.imap(render_segment, jobs), 1):
            print(f"  segment {i}/{len(jobs)} done", flush=True)

    listing = os.path.join(tmp, "segments.txt")
    with open(listing, "w") as fh:
        for job in jobs:
            fh.write(f"file '{os.path.abspath(job[3])}'\n")

    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", listing,
        "-ss", str(args.start), "-t", str(duration), "-i", args.audio,
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
        "-shortest", "-movflags", "+faststart", args.out,
    ]
    subprocess.run(cmd, check=True)
    size = os.path.getsize(args.out) / 1e6
    print(f"wrote {args.out}  ({size:.1f} MB)")


if __name__ == "__main__":
    main()
