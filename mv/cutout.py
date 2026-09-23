#!/usr/bin/env python3
"""Lift the pets off their flat backdrop into alpha-cut PNGs.

Two shapes of input:
  --single name=file ...   one subject per file
  --sheet file             three subjects stacked on one sheet

The white bunny is the hard case either way: white fur on a near-white
backdrop, so the ramp has to start just above the backdrop's own noise.
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

SHEET_NAMES = ["pet1_bunny_brown", "pet2_dog", "pet3_bunny_white"]


def backdrop(rgb):
    border = np.concatenate([
        rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3),
        rgb[:, :6].reshape(-1, 3), rgb[:, -6:].reshape(-1, 3),
    ])
    return np.median(border, axis=0), float(border.std())


def cut(rgb, bg, noise, region=None, close=5):
    """Alpha for the largest subject, optionally inside a row band."""
    dist = np.abs(rgb - bg).max(axis=2)
    lo = max(2.0, noise * 4.0)          # just clear of the backdrop's grain
    hi = lo + 9.0
    hard = lo + 5.0

    core = dist > hard
    if region is not None:
        band = np.zeros_like(core)
        band[region[0]:region[1]] = core[region[0]:region[1]]
        core = band

    filled = ndimage.binary_closing(core, structure=np.ones((close, close)), iterations=2)
    filled = ndimage.binary_fill_holes(filled)
    labels, n = ndimage.label(filled)
    if n == 0:
        return None
    sizes = ndimage.sum(filled, labels, range(1, n + 1))
    blob = labels == (int(np.argmax(sizes)) + 1)

    soft = np.clip((dist - lo) / (hi - lo), 0.0, 1.0)
    inner = ndimage.binary_erosion(blob, structure=np.ones((3, 3)), iterations=2)
    alpha = np.where(blob, np.maximum(soft, inner.astype(np.float32)), 0.0)
    alpha = ndimage.gaussian_filter(alpha, 0.5)
    alpha = np.where(blob, alpha, 0.0)

    # Drop specks a band split or a stray mark left behind.
    solid, sn = ndimage.label(alpha > 0.5)
    if sn > 1:
        areas = ndimage.sum(alpha > 0.5, solid, range(1, sn + 1))
        near = ndimage.binary_dilation(solid == (int(np.argmax(areas)) + 1), iterations=3)
        alpha = np.where(near, alpha, 0.0)
    return alpha


def save(rgb, alpha, path, pad=6):
    out = np.dstack([np.clip(rgb, 0, 255), alpha * 255.0]).astype(np.uint8)
    ys, xs = np.where(alpha > 0.06)
    y0, y1 = max(0, ys.min() - pad), min(alpha.shape[0], ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(alpha.shape[1], xs.max() + pad + 1)
    crop = Image.fromarray(out[y0:y1, x0:x1], "RGBA")
    crop.save(path)
    print(f"{path}  {crop.size[0]}x{crop.size[1]}  px={int((alpha > 0.5).sum())}")


def bands_of(core, count=3):
    """Row-profile minima: the dog's chin nearly touches the bunny's ears."""
    rows = ndimage.uniform_filter1d(core.sum(axis=1).astype(np.float32), 5)
    filled = np.where(rows > 2)[0]
    top, bot = int(filled.min()), int(filled.max())
    cuts = []
    for _ in range(count - 1):
        window = rows.copy()
        window[:top + 20] = np.inf
        window[bot - 20:] = np.inf
        for c in cuts:
            window[max(0, c - 40):c + 40] = np.inf
        cuts.append(int(np.argmin(window)))
    cuts.sort()
    edges = [top] + cuts + [bot + 1]
    return list(zip(edges[:-1], edges[1:]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--sheet")
    ap.add_argument("--single", nargs="*", default=[], metavar="NAME=FILE")
    args = ap.parse_args()

    for spec in args.single:
        name, _, path = spec.partition("=")
        rgb = np.array(Image.open(path).convert("RGB")).astype(np.float32)
        bg, noise = backdrop(rgb)
        alpha = cut(rgb, bg, noise)
        if alpha is None:
            print(f"warning: nothing found in {path}", file=sys.stderr)
            continue
        save(rgb, alpha, os.path.join(args.out, name + ".png"))

    if args.sheet:
        rgb = np.array(Image.open(args.sheet).convert("RGB")).astype(np.float32)
        bg, noise = backdrop(rgb)
        core = np.abs(rgb - bg).max(axis=2) > 12.0
        for idx, region in enumerate(bands_of(core)):
            alpha = cut(rgb, bg, noise, region)
            if alpha is None:
                print(f"warning: band {idx} empty", file=sys.stderr)
                continue
            save(rgb, alpha, os.path.join(args.out, SHEET_NAMES[idx] + ".png"))


if __name__ == "__main__":
    main()
