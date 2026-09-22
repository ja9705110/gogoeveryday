#!/usr/bin/env python3
"""Lay the lyric sheet onto the sung regions detected in the track.

The regions come from centre-channel vocal-band energy: the gaps between them
are instrumental, so no line is ever placed over one. Line spacing inside a
region is even -- adjust REGIONS (or the generated .lrc) to fine-tune.
"""
import sys

# start, end of each sung region in seconds (instrumental gaps excluded)
REGIONS = [
    (31.00, 79.60),
    (85.80, 96.70),
    (101.60, 149.90),
    (155.30, 216.20),
    (222.90, 229.60),
]

TITLE = "一直都在"
DEDICATION = "給　曉萱（蹦蹦）"

# Section names are for pacing/reference only -- they are never rendered.
SECTIONS = [
    ("Verse 1", [
        "我們曾把不可能走成日常",
        "把跌跌撞撞走成一道光",
        "多少次站在世界的逆向",
        "還是笑著　把路走得漂亮",
        "那些沒有人相信的遠方",
        "我們真的一站一站抵達",
        "不是因為從來都不害怕",
        "是你讓勇敢　有了新的模樣",
    ]),
    ("Pre-Chorus", [
        "一路上有風　也有重量",
        "有些故事說起來還會紅了眼眶",
        "可那些我們一起走過的地方",
        "到今天　依然在心裡發亮",
    ]),
    ("Chorus", [
        "你一直都是那麼有力量",
        "不是因為從來沒有受過傷",
        "是走過那麼多風浪",
        "依然把溫柔留在身旁",
        "我們一起闖過多少不可能的牆",
        "也一起把平凡活得不一樣",
        "所以今天什麼都不用再證明",
        "你走過的每一步",
        "早已足夠有重量",
    ]),
    ("Verse 2", [
        "還記得那些任性的願望",
        "說出口時像玩笑一場",
        "後來才發現好多想像",
        "竟然真的被我們寫成篇章",
        "有些日子瘋狂得不像話",
        "有些夜晚也曾沉默很長",
        "可是回頭看一路的形狀",
        "每一段都有彼此站在身旁",
    ]),
    ("Pre-Chorus 2", [
        "時間帶走一些年少模樣",
        "卻帶不走我們熟悉的目光",
        "那些笑聲　那些倔強",
        "都成了生命裡最真的收藏",
    ]),
    ("Chorus 2", [
        "你一直都是那麼有力量",
        "不是因為從來沒有受過傷",
        "是走過那麼多風浪",
        "依然把溫柔留在身旁",
        "我們一起闖過多少不可能的牆",
        "也一起把平凡活得不一樣",
        "所以今天什麼都不用再證明",
        "你走過的每一步",
        "早已足夠有重量",
    ]),
    ("Bridge", [
        "如果有些話　不用說完",
        "我們也懂沉默裡的答案",
        "如果有些路　不必再趕",
        "就讓我們陪你慢慢地看",
        "看那些曾一起翻過的山",
        "看那些笑到流淚的夜晚",
        "原來真正留下來的",
        "從來不是終點有多遠",
        "而是一路上",
        "我們曾經彼此陪伴",
    ]),
    ("Final Chorus", [
        "你一直都是那麼有力量",
        "早已不需要誰替你衡量",
        "那些一起走過的風浪",
        "都讓我們成為今天的模樣",
        "我們一起創造多少不可能的篇章",
        "也一起讓彼此的人生不一樣",
        "所以此刻什麼都不用再勉強",
        "不必回答　不必逞強",
        "我們就在你的身旁",
    ]),
    ("Outro", [
        "有些故事不必說完",
        "也會一直留在心上",
        "你不用往哪裡趕",
        "我們都在",
        "和從前一樣",
    ]),
]


def allocate(lines, regions):
    """Split the line count across regions in proportion to their length."""
    spans = [e - s for s, e in regions]
    total = sum(spans)
    raw = [len(lines) * sp / total for sp in spans]
    counts = [int(r) for r in raw]
    # largest remainder until the counts add up
    order = sorted(range(len(raw)), key=lambda i: raw[i] - counts[i], reverse=True)
    i = 0
    while sum(counts) < len(lines):
        counts[order[i % len(order)]] += 1
        i += 1
    return counts


def stamp(t):
    m = int(t // 60)
    return f"[{m:02d}:{t - m * 60:05.2f}]"


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else "lyrics.lrc"
    lines = [text for _, block in SECTIONS for text in block]
    counts = allocate(lines, REGIONS)

    rows = []
    cursor = 0
    for (start, end), n in zip(REGIONS, counts):
        step = (end - start) / n
        for k in range(n):
            rows.append((start + k * step, lines[cursor]))
            cursor += 1
        rows.append((end, ""))          # close the phrase before the break

    body = [
        f"[ti:{TITLE}]",
        f"[al:{DEDICATION}]",
        "[re:mv/build_lrc.py]",
        "[ve:1.0]",
        "# Line times are estimated from centre-channel vocal-band energy.",
        "# Gaps between REGIONS are instrumental and carry no lyrics.",
        "",
    ]
    body += [stamp(t) + text for t, text in rows]
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(body) + "\n")

    print(f"{len(lines)} lines -> {out_path}")
    for (s, e), n in zip(REGIONS, counts):
        print(f"  region {s:6.1f}-{e:6.1f}s  {n:2d} lines  {(e - s) / n:4.2f}s each")


if __name__ == "__main__":
    main()
