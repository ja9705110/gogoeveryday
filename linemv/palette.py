"""Colour for 《一直都在》. Five moods, one warm paper underneath them all."""

PAPER = {
    "day": "#FAF4EA",
    "soft": "#F8F1E6",
    "dusk": "#EFE6DC",
    "night": "#1B2740",
    "warm": "#FBF0DC",
}

INK = {
    "day": "#2B2118",
    "soft": "#2E241B",
    "dusk": "#33291F",
    "night": "#E8D6AE",      # night flips: warm ink on deep blue
    "warm": "#33261B",
}

# Second-weight line: distance, crowds, things behind
FAINT = {
    "day": "#A79683",
    "soft": "#AC9C89",
    "dusk": "#9C8C7B",
    "night": "#6E7B99",
    "warm": "#B09B80",
}

ACCENT = {
    "vermilion": "#C4442E",
    "rose": "#C2707F",
    "gold": "#D9A441",
}

GLOW = {
    "day": "#F2D9A8",
    "soft": "#F0D6A6",
    "dusk": "#E6C79A",
    "night": "#F2C97A",
    "warm": "#F5C878",
}


def mood(name):
    """All five colours for one mood, ready to hand to a template."""
    return {
        "paper": PAPER[name],
        "ink": INK[name],
        "faint": FAINT[name],
        "glow": GLOW[name],
        **ACCENT,
    }


def blend(a, b, k):
    """Mix two hex colours; k=0 gives a, k=1 gives b."""
    k = max(0.0, min(1.0, k))
    pa = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    pb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * k):02x}" for x, y in zip(pa, pb))


def mood_blend(one, two, k):
    """Cross-fade a whole mood into another, for scene transitions."""
    a, b = mood(one), mood(two)
    return {key: blend(a[key], b[key], k) for key in a}
