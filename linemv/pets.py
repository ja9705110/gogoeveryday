"""Line art of 曉萱's three animals, traced from her own photographs.

The silhouette comes from the alpha of the cut-outs in ../mv/assets, so the
shape on screen is the shape of her actual rabbits and her actual dog rather
than a generic drawn animal. Interior marks (eyes, nose, the inside of an ear)
are picked out of the photograph's own dark regions and long edges.
"""
import json
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


def _contours(mask, min_area, epsilon):
    found, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL,
                                cv2.CHAIN_APPROX_SIMPLE)
    out = []
    for c in found:
        if cv2.contourArea(c) < min_area:
            continue
        simple = cv2.approxPolyDP(c, epsilon, True)
        if len(simple) >= 4:
            out.append(simple.reshape(-1, 2).astype(float))
    return out


def trace(path, height=260.0):
    """-> (outline points, [interior point lists]), normalised to `height`."""
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    alpha = img[..., 3]
    rgb = cv2.cvtColor(img[..., :3], cv2.COLOR_BGR2GRAY)
    solid = (alpha > 128).astype(np.uint8)

    # Outer shape, smoothed hard: fur traced literally becomes a saw edge,
    # and a calm silhouette with a few interior marks reads as drawn.
    soft = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    soft = cv2.GaussianBlur(soft * 255, (0, 0), 7.0) > 118
    outer = _contours(soft, 2000, 2.2)
    if not outer:
        raise RuntimeError(f"no silhouette in {path}")
    outline = max(outer, key=lambda c: cv2.contourArea(c.astype(np.float32)))

    k = height / img.shape[0]
    cx = img.shape[1] / 2.0

    def norm(pts):
        return [((x - cx) * k, (y - img.shape[0] / 2.0) * k) for x, y in pts]

    return norm(outline)


# Faces placed by hand from the photographs, in fractions of the animal's
# height. Thresholding the photo finds shaded fur and the inside of an ear,
# not eyes, so the silhouette is traced and the face is drawn.
FACE = {
    "rabbit_brown": {
        "eyes": [(-0.175, -0.03, 0.030), (0.150, -0.03, 0.030)],
        "nose": (0.010, 0.170, 0.042),
        "mouth": 0.075,
        "ears": [],
        "cheeks": [[(-0.34, 0.05), (-0.25, 0.11)], [(0.30, 0.05), (0.22, 0.11)]],
    },
    "dog_small": {
        "eyes": [(-0.165, 0.005, 0.062), (0.155, 0.005, 0.062)],
        "nose": (-0.005, 0.185, 0.050),
        "mouth": 0.070,
        "ears": [],
        "cheeks": [],
    },
    "rabbit_white": {
        "eyes": [(-0.205, 0.015, 0.028), (0.185, 0.015, 0.028)],
        "nose": (-0.010, 0.170, 0.038),
        "mouth": 0.080,
        "ears": [[(-0.20, -0.40), (-0.17, -0.27), (-0.14, -0.16)],
                 [(0.155, -0.42), (0.145, -0.28), (0.130, -0.16)]],
        "cheeks": [],
    },
}


def build(height=260.0):
    out = {}
    for name, fname in PETS.items():
        out[name] = {"outline": trace(os.path.join(SRC, fname), height),
                     "height": height}
    return out


def strokes(traced, name, x, y, scale=1.0, color="ink", seed=0, detail=True):
    """Place one animal at (x, y) as a list of Strokes."""
    data = traced[name]
    h = data["height"] * scale
    w = max(0.6, scale)
    out = [ink.stroke([(x + px * scale, y + py * scale) for px, py in data["outline"]],
                      width=3.0 * w, color=color, close=True,
                      jitter=1.3, seed=seed, smooth=True)]
    if not detail:
        return out

    face = FACE[name]
    for i, (ex, ey, er) in enumerate(face["eyes"]):
        out.append(ink.ellipse(x + ex * h, y + ey * h, er * h, er * h * 1.15,
                               color=color, fill=color, width=1.2 * w,
                               jitter=0.5, seed=seed + 11 + i))
    nx, ny, nr = face["nose"]
    out.append(ink.stroke([(x + (nx - nr) * h, y + (ny - nr * 0.55) * h),
                           (x + (nx + nr) * h, y + (ny - nr * 0.55) * h),
                           (x + nx * h, y + (ny + nr * 0.75) * h)],
                          width=1.6 * w, color=color, close=True, fill=color,
                          jitter=0.5, seed=seed + 21))
    out.append(ink.line((x + nx * h, y + (ny + nr * 0.75) * h),
                        (x + nx * h, y + (ny + face["mouth"]) * h),
                        width=1.9 * w, color=color, jitter=0.6, seed=seed + 22))
    for i, arm in enumerate((-1, 1)):
        out.append(ink.curve([(x + nx * h, y + (ny + face["mouth"]) * h),
                              (x + (nx + arm * 0.045) * h,
                               y + (ny + face["mouth"] * 1.25) * h),
                              (x + (nx + arm * 0.085) * h,
                               y + (ny + face["mouth"] * 0.95) * h)],
                             width=1.7 * w, color=color, jitter=0.5,
                             seed=seed + 31 + i))
    for i, ear in enumerate(face["ears"]):
        out.append(ink.curve([(x + ex * h, y + ey * h) for ex, ey in ear],
                             width=1.6 * w, color=color, opacity=0.5,
                             jitter=0.8, seed=seed + 41 + i))
    for i, cheek in enumerate(face["cheeks"]):
        out.append(ink.curve([(x + ex * h, y + ey * h) for ex, ey in cheek],
                             width=1.4 * w, color=color, opacity=0.4,
                             jitter=0.8, seed=seed + 51 + i))
    return out


def main():
    traced = build()
    for name, d in traced.items():
        print(f"{name:14s} outline {len(d['outline']):3d} pts")
    with open(os.path.join(HERE, "pets.json"), "w") as fh:
        json.dump(traced, fh)
    print("wrote pets.json")


if __name__ == "__main__":
    main()
