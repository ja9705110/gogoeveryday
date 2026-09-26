"""Hand-drawn strokes as SVG.

Every line in the film is a Stroke: a sampled polyline carrying a little
deliberate tremble, emitted as a smooth cubic path. Strokes know their own
length, which is what lets the renderer write them on with dashoffset.

The tremble is deterministic — derived from the geometry and an explicit
seed — so a shape looks identical on every frame it appears. A line that
re-rolled its noise each frame would boil, and boil that nobody asked for
just reads as noise.
"""
import hashlib
import math
import random
from dataclasses import dataclass, field

JITTER = 1.6            # px of tremble, the whole point of not looking vector
STEP = 9.0              # resample spacing before trembling


def _rng(points, seed):
    key = hashlib.md5(
        (repr([(round(x, 1), round(y, 1)) for x, y in points[:24]])
         + str(seed)).encode()).hexdigest()
    return random.Random(int(key[:16], 16))


def resample(points, step=STEP, close=False):
    """Walk the polyline at a fixed spacing so tremble reads along its length."""
    pts = list(points) + ([points[0]] if close and points[0] != points[-1] else [])
    if len(pts) < 2:
        return list(pts)
    out, carry = [pts[0]], 0.0
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg < 1e-9:
            continue
        t = step - carry
        while t < seg:
            out.append((x0 + (x1 - x0) * t / seg, y0 + (y1 - y0) * t / seg))
            t += step
        carry = (carry + seg) % step
    if out[-1] != pts[-1]:
        out.append(pts[-1])
    return out


def densify(points, close=False, per=6):
    """Catmull-Rom the control points into a dense polyline.

    Resampling walks straight segments, so a corner in the control points
    survives as a corner. Curves that are meant to be organic get smoothed
    into place first, then trembled.
    """
    p = list(points)
    if len(p) < 3:
        return p
    ring = p + [p[0]] if close else p
    pad = ([ring[-2]] + ring + [ring[1]]) if close else ([ring[0]] + ring + [ring[-1]])
    out = []
    for i in range(1, len(pad) - 2):
        (x0, y0), (x1, y1), (x2, y2), (x3, y3) = pad[i - 1:i + 3]
        for j in range(per):
            t = j / per
            t2, t3 = t * t, t * t * t
            out.append((
                0.5 * ((2 * x1) + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2
                       + (-x0 + 3 * x1 - 3 * x2 + x3) * t3),
                0.5 * ((2 * y1) + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2
                       + (-y0 + 3 * y1 - 3 * y2 + y3) * t3)))
    out.append(ring[-1])
    return out


def tremble(points, amount=JITTER, seed=0, close=False):
    rng = _rng(points, seed)
    pts = resample(points, close=close)
    out = []
    # low-frequency wander plus a little per-point grain
    phase = rng.uniform(0, math.tau)
    wobble = rng.uniform(0.05, 0.16)
    for i, (x, y) in enumerate(pts):
        drift = math.sin(phase + i * wobble) * amount
        out.append((x + drift * 0.7 + rng.uniform(-amount, amount) * 0.45,
                    y - drift * 0.7 + rng.uniform(-amount, amount) * 0.45))
    if close and out:
        out[-1] = out[0]
    return out


def catmull(points, close=False):
    """Cubic path through every point, so corners stay soft."""
    p = list(points)
    if len(p) < 2:
        return ""
    if close:
        p = [p[-2]] + p + [p[1]]
    else:
        p = [p[0]] + p + [p[-1]]
    d = [f"M{p[1][0]:.1f},{p[1][1]:.1f}"]
    for i in range(1, len(p) - 2):
        x0, y0 = p[i - 1]
        x1, y1 = p[i]
        x2, y2 = p[i + 1]
        x3, y3 = p[i + 2]
        d.append(f"C{x1 + (x2 - x0) / 6:.1f},{y1 + (y2 - y0) / 6:.1f}"
                 f" {x2 - (x3 - x1) / 6:.1f},{y2 - (y3 - y1) / 6:.1f}"
                 f" {x2:.1f},{y2:.1f}")
    if close:
        d.append("Z")
    return "".join(d)


@dataclass
class Stroke:
    pts: list = field(default_factory=list)
    width: float = 3.2
    color: str = "ink"
    close: bool = False
    fill: str = None
    opacity: float = 1.0
    cap: str = "round"

    def length(self):
        n = self.pts + ([self.pts[0]] if self.close and self.pts else [])
        return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(n, n[1:]))

    def d(self):
        return catmull(self.pts, self.close)

    def svg(self, palette, draw=1.0, alpha=1.0, extra=""):
        """`draw` 0..1 writes the stroke on; 1.0 is fully drawn."""
        if alpha * self.opacity <= 0.004 or len(self.pts) < 2:
            return ""
        stroke = palette.get(self.color, self.color)
        fill = palette.get(self.fill, self.fill) if self.fill else "none"
        bits = [f'<path d="{self.d()}" fill="{fill}" stroke="{stroke}"',
                f'stroke-width="{self.width:.2f}"',
                f'stroke-linecap="{self.cap}" stroke-linejoin="round"']
        if alpha * self.opacity < 0.996:
            bits.append(f'opacity="{alpha * self.opacity:.3f}"')
        if draw < 0.999:
            L = self.length() + 2
            bits.append(f'stroke-dasharray="{L:.1f}" '
                        f'stroke-dashoffset="{L * (1 - max(0.0, draw)):.1f}"')
        if extra:
            bits.append(extra)
        return " ".join(bits) + "/>"

    def shift(self, dx, dy):
        return Stroke([(x + dx, y + dy) for x, y in self.pts], self.width,
                      self.color, self.close, self.fill, self.opacity, self.cap)

    def scaled(self, k, about=(0, 0)):
        ax, ay = about
        return Stroke([(ax + (x - ax) * k, ay + (y - ay) * k) for x, y in self.pts],
                      max(0.4, self.width * (0.35 + 0.65 * k)),
                      self.color, self.close, self.fill, self.opacity, self.cap)


def stroke(points, width=3.2, color="ink", close=False, fill=None,
           opacity=1.0, jitter=JITTER, seed=0, cap="round", smooth=False):
    pts = densify(points, close) if smooth else points
    return Stroke(tremble(pts, jitter, seed, close), width, color, close,
                  fill, opacity, cap)


def line(a, b, **kw):
    return stroke([a, b], **kw)


def curve(points, **kw):
    kw.setdefault("smooth", True)
    return stroke(points, **kw)


def circle(cx, cy, r, n=28, **kw):
    kw.setdefault("close", True)
    pts = [(cx + r * math.cos(i / n * math.tau), cy + r * math.sin(i / n * math.tau))
           for i in range(n)]
    return stroke(pts, **kw)


def ellipse(cx, cy, rx, ry, rot=0.0, n=28, **kw):
    kw.setdefault("close", True)
    c, s = math.cos(rot), math.sin(rot)
    pts = []
    for i in range(n):
        a = i / n * math.tau
        x, y = rx * math.cos(a), ry * math.sin(a)
        pts.append((cx + x * c - y * s, cy + x * s + y * c))
    return stroke(pts, **kw)


def box(x, y, w, h, **kw):
    kw.setdefault("close", True)
    return stroke([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], **kw)


def wave(x0, x1, y, amp, waves=3.0, phase=0.0, n=None, **kw):
    n = n or max(12, int(abs(x1 - x0) / 10))
    pts = [(x0 + (x1 - x0) * i / n,
            y + amp * math.sin(phase + i / n * math.tau * waves))
           for i in range(n + 1)]
    return stroke(pts, **kw)


def arc(cx, cy, r, a0, a1, n=20, **kw):
    pts = [(cx + r * math.cos(a0 + (a1 - a0) * i / n),
            cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]
    return stroke(pts, **kw)


def render(strokes, palette, width=1920, height=1080, draw=1.0, alpha=1.0,
           background=True, defs="", overlay=""):
    """A full frame of SVG from a list of strokes."""
    body = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" '
            f'height="{height}" viewBox="0 0 {width} {height}">']
    if defs:
        body.append(f"<defs>{defs}</defs>")
    if background:
        body.append(f'<rect width="{width}" height="{height}" '
                    f'fill="{palette["paper"]}"/>')
    for s in strokes:
        piece = s.svg(palette, draw, alpha)
        if piece:
            body.append(piece)
    if overlay:
        body.append(overlay)
    body.append("</svg>")
    return "".join(body)
