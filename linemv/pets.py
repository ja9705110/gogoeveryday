"""Line art of 曉萱's three animals, drawn from her own photographs.

An animal made of fur cannot be drawn as one smooth closed outline — that
gives a blob. Here the photograph drives three separate layers:

  edge    short strokes flicked outward along the silhouette normal, so the
          boundary reads as fur rather than as a cut-out
  hatch   parallel runs kept only where the photograph is dark, at two
          angles, which is what puts tone and volume back
  face    eyes, nose and mouth placed by hand from the same photographs

Everything is baked at build time into pets.json; the renderer just replays
the geometry.
"""
import json
import math
import os

import cv2
import numpy as np

import ink

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "mv", "assets")

PETS = {
    "rabbit_brown": "pet1_bunny_brown.png",
    "dog_small": "pet2_dog.png",
    "rabbit_white": "pet3_bunny_white.png",
}

# Faces placed by hand, in fractions of the animal's height. Thresholding the
# photograph finds shaded fur and the inside of an ear, never an eye.
# tone_lo, spacing — how dark a spot must be before it earns a stroke, and
# how close together the strokes sit.
TONE = {
    "rabbit_brown": (0.30, 10),
    "dog_small": (0.42, 11),
    "rabbit_white": (0.52, 12),
}

FACE = {
    "rabbit_brown": {
        "eyes": [(-0.175, -0.030, 0.034), (0.150, -0.030, 0.034)],
        "nose": (0.010, 0.170, 0.040), "mouth": 0.072, "tilt": 0.10,
    },
    "dog_small": {
        "eyes": [(-0.165, 0.005, 0.066), (0.155, 0.005, 0.066)],
        "nose": (-0.005, 0.185, 0.048), "mouth": 0.066, "tilt": 0.06,
    },
    "rabbit_white": {
        "eyes": [(-0.205, 0.015, 0.032), (0.185, 0.015, 0.032)],
        "nose": (-0.010, 0.170, 0.036), "mouth": 0.078, "tilt": 0.08,
    },
}


def _silhouette(alpha):
    solid = (alpha > 128).astype(np.uint8)
    calm = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    calm = (cv2.GaussianBlur(calm * 255, (0, 0), 3.0) > 120).astype(np.uint8)
    found, _ = cv2.findContours(calm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    return calm, max(found, key=cv2.contourArea).reshape(-1, 2).astype(float)


def _fur(contour, mask, step=9, seed=0):
    """Short strokes flicked outward along the normal: a furred boundary."""
    rng = np.random.default_rng(1000 + seed)
    n = len(contour)
    out = []
    for i in range(0, n, step):
        x, y = contour[i]
        ax, ay = contour[(i - 6) % n]
        bx, by = contour[(i + 6) % n]
        tx, ty = bx - ax, by - ay
        L = math.hypot(tx, ty) or 1.0
        nx, ny = ty / L, -tx / L                       # outward normal
        if mask[min(mask.shape[0] - 1, max(0, int(y + ny * 4))),
                min(mask.shape[1] - 1, max(0, int(x + nx * 4)))]:
            nx, ny = -nx, -ny
        lean = rng.uniform(-0.45, 0.45)
        tip = rng.uniform(7.0, 19.0)
        root = rng.uniform(5.0, 11.0)
        out.append([(x - nx * root + tx / L * lean * root,
                     y - ny * root + ty / L * lean * root),
                    (x + nx * tip * 0.45, y + ny * tip * 0.45),
                    (x + nx * tip + tx / L * lean * tip,
                     y + ny * tip + ty / L * lean * tip)])
    return out


def _flow(gray, mask, seed, spacing=11, tone_lo=0.18, tone_hi=0.92,
          centre=None, steps=9, step=3.2):
    """Fur strokes that follow the form.

    Cross-hatching at two fixed angles reads as a halftone screen. Fur grows
    outward from the face, so each stroke traces that radial field, and its
    length comes from how dark the photograph is at that point — light areas
    keep no strokes at all rather than a thinner screen.
    """
    rng = np.random.default_rng(3000 + seed)
    h, w = gray.shape
    cx, cy = centre or (w / 2.0, h * 0.46)
    inside = mask > 0
    lit = gray[inside]
    lo, hi = np.percentile(lit, 6), np.percentile(lit, 97)
    span = max(1.0, float(hi - lo))

    out = []
    for gy in range(0, h, spacing):
        for gx in range(0, w, spacing):
            x = gx + rng.uniform(-spacing * 0.45, spacing * 0.45)
            y = gy + rng.uniform(-spacing * 0.45, spacing * 0.45)
            xi, yi = int(x), int(y)
            if not (0 <= xi < w and 0 <= yi < h and inside[yi, xi]):
                continue
            dark = 1.0 - min(1.0, max(0.0, (gray[yi, xi] - lo) / span))
            if dark < tone_lo or rng.random() > min(1.0, dark / tone_hi):
                continue
            dx, dy = x - cx, y - cy
            L = math.hypot(dx, dy) or 1.0
            dx, dy = dx / L, dy / L
            dx += rng.uniform(-0.22, 0.22)
            dy += rng.uniform(-0.22, 0.22)
            L = math.hypot(dx, dy) or 1.0
            dx, dy = dx / L, dy / L

            run = int(steps * (0.45 + 0.55 * dark))
            pts, px, py = [], x - dx * step * run * 0.4, y - dy * step * run * 0.4
            for _ in range(run):
                xi, yi = int(px), int(py)
                if not (0 <= xi < w and 0 <= yi < h and inside[yi, xi]):
                    break
                pts.append((px, py))
                px += dx * step
                py += dy * step
            if len(pts) > 2:
                out.append(pts)
    return out


def build(height=260.0):
    out = {}
    for name, fname in PETS.items():
        img = cv2.imread(os.path.join(SRC, fname), cv2.IMREAD_UNCHANGED)
        gray = cv2.cvtColor(img[..., :3], cv2.COLOR_BGR2GRAY)
        gray = cv2.bilateralFilter(gray, 9, 60, 60).astype(np.int16)
        mask, contour = _silhouette(img[..., 3])
        inner = cv2.erode(mask, np.ones((5, 5), np.uint8))

        fur = _fur(contour, mask, seed=hash(name) % 97)
        # broken base contour: three arcs with gaps read as drawn, not cut out
        n = len(contour)
        arcs = [contour[int(n * a):int(n * b)].tolist()
                for a, b in ((0.02, 0.31), (0.36, 0.64), (0.69, 0.97))]
        # Each animal is calibrated separately, or all three come out the
        # same grey: she had a dark rabbit, a cream dog and a white rabbit.
        lo, sp = TONE[name]
        hatch = _flow(gray, inner, seed=hash(name) % 89,
                      spacing=sp, tone_lo=lo)

        k = height / img.shape[0]
        cx, cy = img.shape[1] / 2.0, img.shape[0] / 2.0

        def norm(seq):
            return [[((x - cx) * k, (y - cy) * k) for x, y in part] for part in seq]

        out[name] = {"height": height, "arcs": norm(arcs),
                     "fur": norm(fur), "hatch": norm(hatch)}
        print(f"{name:14s} {len(arcs)} arcs, {len(fur)} fur, {len(hatch)} hatch")
    return out


def strokes(data, name, x, y, scale=1.0, color="ink", seed=0, detail=1.0):
    """Place one animal at (x, y). `detail` 0..1 thins the fur and hatching."""
    d = data[name]
    h = d["height"] * scale
    w = max(0.45, scale)
    out = []

    def place(part):
        return [(x + px * scale, y + py * scale) for px, py in part]

    for i, arc in enumerate(d["arcs"]):
        out.append(ink.stroke(place(arc[::3]), width=(2.6 + 0.5 * (i % 2)) * w,
                              color=color, jitter=1.0, seed=seed + i, smooth=True))
    keep = max(1, int(round(1 / max(0.08, detail))))
    for i, f in enumerate(d["fur"][::keep]):
        out.append(ink.stroke(place(f), width=1.5 * w, color=color,
                              opacity=0.85, jitter=0.5, seed=seed + 100 + i,
                              smooth=True))
    for i, hh in enumerate(d["hatch"][::keep]):
        out.append(ink.stroke(place(hh), width=1.25 * w, color=color,
                              opacity=0.5, jitter=0.45, seed=seed + 300 + i,
                              smooth=True))

    face = FACE[name]
    for i, (ex, ey, er) in enumerate(face["eyes"]):
        px, py = x + ex * h, y + ey * h
        out.append(ink.ellipse(px, py, er * h, er * h * 1.12, color=color,
                               fill=color, width=1.1 * w, jitter=0.4,
                               seed=seed + 11 + i))
        out.append(ink.ellipse(px - er * h * 0.30, py - er * h * 0.34,
                               er * h * 0.26, er * h * 0.22, color="paper",
                               fill="paper", width=0.6 * w, jitter=0.3,
                               seed=seed + 15 + i))
        out.append(ink.arc(px, py, er * h * 1.45, math.pi * 1.16, math.pi * 1.86,
                           color=color, width=1.5 * w, jitter=0.5,
                           seed=seed + 17 + i))
    nx, ny, nr = face["nose"]
    out.append(ink.stroke([(x + (nx - nr) * h, y + (ny - nr * 0.5) * h),
                           (x + (nx + nr) * h, y + (ny - nr * 0.5) * h),
                           (x + nx * h, y + (ny + nr * 0.8) * h)],
                          width=1.5 * w, color=color, close=True, fill=color,
                          jitter=0.4, seed=seed + 21))
    out.append(ink.line((x + nx * h, y + (ny + nr * 0.8) * h),
                        (x + nx * h, y + (ny + face["mouth"]) * h),
                        width=1.8 * w, color=color, jitter=0.5, seed=seed + 22))
    for i, arm in enumerate((-1, 1)):
        out.append(ink.curve([(x + nx * h, y + (ny + face["mouth"]) * h),
                              (x + (nx + arm * 0.05) * h,
                               y + (ny + face["mouth"] * 1.3) * h),
                              (x + (nx + arm * 0.095) * h,
                               y + (ny + face["mouth"] * 0.92) * h)],
                             width=1.6 * w, color=color, jitter=0.4,
                             seed=seed + 31 + i))
    return out


if __name__ == "__main__":
    data = build()
    with open(os.path.join(HERE, "pets.json"), "w") as fh:
        json.dump(data, fh)
    print("wrote pets.json",
          f"{os.path.getsize(os.path.join(HERE, 'pets.json')) / 1024:.0f} KB")
