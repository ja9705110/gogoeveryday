#!/usr/bin/env python3
"""Rebuild the pet cut-outs at 4x with a super-resolution model.

The sheet gives each subject about 120px, so the video was upscaling roughly
3x at render time and it showed. EDSR carries real detail up to 4x instead,
and the render then scales *down* into its layout.

Model (39 MB, not vendored):
  curl -LO https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb
"""
import argparse
import os

import cv2
import numpy as np
from PIL import Image

NAMES = ["pet1_bunny_brown", "pet2_dog", "pet3_bunny_white"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="EDSR_x4.pb")
    ap.add_argument("--assets", default=os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "assets"))
    ap.add_argument("--scale", type=int, default=4)
    args = ap.parse_args()

    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(args.model)
    sr.setModel("edsr", args.scale)

    for name in NAMES:
        src = os.path.join(args.assets, name + ".png")
        arr = np.array(Image.open(src).convert("RGBA"))
        big = sr.upsample(cv2.cvtColor(arr[..., :3], cv2.COLOR_RGB2BGR))
        h, w = big.shape[:2]

        # The mask was traced at 1x, so it carries 1x stair-steps into the
        # upscale; a light blur at the new size puts the edge back.
        alpha = cv2.resize(arr[..., 3], (w, h), interpolation=cv2.INTER_CUBIC)
        alpha = cv2.GaussianBlur(alpha, (0, 0), args.scale * 0.4)

        out = np.dstack([cv2.cvtColor(big, cv2.COLOR_BGR2RGB), alpha])
        dst = os.path.join(args.assets, f"{name}_x{args.scale}.png")
        Image.fromarray(out, "RGBA").save(dst)
        print(f"{dst}  {w}x{h}  (from {arr.shape[1]}x{arr.shape[0]})")


if __name__ == "__main__":
    main()
