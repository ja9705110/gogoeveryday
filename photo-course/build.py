#!/usr/bin/env python3
"""把 src/ 底下的檔案組成單一、可離線使用的 index.html。

用法：python3 build.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

PARTS = {
    "/*__CSS__*/": "styles.css",
    "/*__ART__*/": "art.js",
    "/*__SLIDES_A__*/": "slides-a.js",
    "/*__SLIDES_B__*/": "slides-b.js",
    "/*__SLIDES_C__*/": "slides-c.js",
    "/*__ENGINE__*/": "engine.js",
}

def main() -> None:
    html = (SRC / "shell.html").read_text(encoding="utf-8")
    for token, name in PARTS.items():
        body = (SRC / name).read_text(encoding="utf-8")
        if "</script" in body.lower():
            raise SystemExit(f"{name} 內含 </script，會提前結束區塊")
        if token not in html:
            raise SystemExit(f"shell.html 找不到佔位符 {token}")
        html = html.replace(token, body)
    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"已產生 {out}　（{out.stat().st_size/1024:.0f} KB）")

if __name__ == "__main__":
    main()
