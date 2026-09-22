"""Extract the three pet heads from the source sheet into alpha-cut PNGs.

The sheet is three subjects stacked on a flat cream backdrop. The dog's chin
nearly touches the white bunny's ear tips, so the sheet is sliced into bands at
the row-profile minima before each subject is isolated.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

NAMES = ["pet1_bunny_brown", "pet2_dog", "pet3_bunny_white"]


def backdrop(rgb):
    border = np.concatenate([
        rgb[:4].reshape(-1, 3), rgb[-4:].reshape(-1, 3),
        rgb[:, :4].reshape(-1, 3), rgb[:, -4:].reshape(-1, 3),
    ])
    return np.median(border, axis=0)


def bands_of(core, count=3):
    rows = ndimage.uniform_filter1d(core.sum(axis=1).astype(np.float32), 5)
    occupied = np.where(rows > 2)[0]
    top, bot = int(occupied.min()), int(occupied.max())
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


def subject_mask(band_core):
    """Largest blob in the band, closed and hole-filled."""
    filled = ndimage.binary_closing(band_core, structure=np.ones((5, 5)), iterations=2)
    filled = ndimage.binary_fill_holes(filled)
    labels, n = ndimage.label(filled)
    if n == 0:
        return None
    sizes = ndimage.sum(filled, labels, range(1, n + 1))
    return labels == (int(np.argmax(sizes)) + 1)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "source.png"
    outdir = sys.argv[2] if len(sys.argv) > 2 else "assets"

    rgb = np.array(Image.open(src).convert("RGB")).astype(np.float32)
    bg = backdrop(rgb)
    dist = np.abs(rgb - bg).max(axis=2)
    core = dist > 12.0

    # Tight ramp: cream-adjacent pixels go transparent so fur keeps no halo.
    soft = np.clip((dist - 9.0) / 14.0, 0.0, 1.0)

    for idx, (y0, y1) in enumerate(bands_of(core)):
        band = np.zeros_like(core)
        band[y0:y1] = core[y0:y1]
        blob = subject_mask(band)
        if blob is None:
            print(f"warning: band {idx} empty", file=sys.stderr)
            continue

        inner = ndimage.binary_erosion(blob, structure=np.ones((3, 3)), iterations=2)
        alpha = np.where(blob, np.maximum(soft, inner.astype(np.float32)), 0.0)
        alpha = ndimage.gaussian_filter(alpha, 0.5)
        # Shrink a hair to drop the last ring of backdrop-tinted pixels.
        alpha = np.clip((alpha - 0.12) / 0.88, 0.0, 1.0)
        alpha = np.where(blob, alpha, 0.0)

        # Drop specks the band split left behind (a neighbour's ear tip).
        solid, sn = ndimage.label(alpha > 0.5)
        if sn > 1:
            areas = ndimage.sum(alpha > 0.5, solid, range(1, sn + 1))
            biggest = int(np.argmax(areas)) + 1
            near = ndimage.binary_dilation(solid == biggest, iterations=3)
            alpha = np.where(near, alpha, 0.0)

        out = np.dstack([np.clip(rgb, 0, 255), alpha * 255.0]).astype(np.uint8)
        ys, xs = np.where(alpha > 0.06)
        pad = 3
        y0c, y1c = max(0, ys.min() - pad), min(alpha.shape[0], ys.max() + pad + 1)
        x0c, x1c = max(0, xs.min() - pad), min(alpha.shape[1], xs.max() + pad + 1)
        crop = Image.fromarray(out[y0c:y1c, x0c:x1c], "RGBA")

        path = f"{outdir}/{NAMES[idx]}.png"
        crop.save(path)
        print(f"{path}  {crop.size[0]}x{crop.size[1]}  px={int((alpha > 0.5).sum())}")


if __name__ == "__main__":
    main()
