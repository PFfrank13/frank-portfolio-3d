#!/usr/bin/env python3
"""Genera las texturas del carné 3D con los datos de Frank.

    python3 scripts/build_card.py

Salida (src/assets/card/):
  atlas.jpg   frente (mitad izquierda) y reverso (mitad derecha) con el mismo reparto de UV que card.glb
  strap.png   cinta sin costuras

Necesita Playwright (Chromium) y Pillow. Edita los textos aquí abajo para cambiar el carné.
"""
import base64
import io
import os
import tempfile

import segno

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'assets', 'card')
FONTS = os.path.join(ROOT, 'src', 'assets', 'fonts')
PHOTO = os.path.join(ROOT, 'src', 'assets', 'image_c70791.png')

# El modelo reparte los UV así: frente = u 0..0.499, v 0..0.755 · reverso = u 0.501..1, v 0..0.757
W, H = 2048, 1884
PW, PH = 1022, 1422

DATA = {
    'short': 'Frank Pineda',
    'full': 'Frank Farid Yampier Pineda Ferro',
    'role': 'Full-Stack Software Engineer',
    'city': 'Ica, Perú',
    'email': 'pinedaferrof@gmail.com',
    'phone': '+51 928 471 762',
    'github': '@Subaru_Natsuki',
    'school': 'UTP · egresado de SENATI',
    'linkedin': 'https://www.linkedin.com/in/frank-pineda-ferro-8960343a5',
}

VCARD = (
    'BEGIN:VCARD\nVERSION:3.0\nN:Pineda Ferro;Frank Farid Yampier\nFN:Frank Farid Yampier Pineda Ferro\n'
    'TEL;TYPE=CELL:+51928471762\nEMAIL:pinedaferrof@gmail.com\nURL:https://www.linkedin.com/in/frank-pineda-ferro-8960343a5\nEND:VCARD'
)


def qr_uri():
    return segno.make(VCARD, error='m').svg_data_uri(dark='#141414', light='#f4f1e8', scale=10, border=2, omitsize=True)


def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode()


def font_css():
    f = lambda name: b64(os.path.join(FONTS, name))
    return f"""
@font-face {{ font-family: 'Display'; src: url(data:font/woff2;base64,{f('bricolage-grotesque-latin-wght-normal.woff2')}) format('woff2'); font-weight: 200 800; }}
@font-face {{ font-family: 'Body'; src: url(data:font/woff2;base64,{f('instrument-sans-latin-wght-normal.woff2')}) format('woff2'); font-weight: 400 700; }}
@font-face {{ font-family: 'Mono'; src: url(data:font/woff2;base64,{f('jetbrains-mono-latin-500-normal.woff2')}) format('woff2'); font-weight: 500; }}
"""


def atlas_html():
    d = DATA
    return f"""<!doctype html><meta charset="utf-8"><style>
{font_css()}
*{{box-sizing:border-box;margin:0}}
html,body{{width:{W}px;height:{H}px;background:#0c0d0e;overflow:hidden}}
.panel{{position:absolute;top:0;width:{PW}px;height:{PH}px;overflow:hidden}}
.front{{left:0;background:linear-gradient(165deg,#212225 0%,#151618 52%,#0e0f10 100%);color:#ebe7df}}
.front::before{{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 2px,transparent 2px 6px)}}
.front .edge{{position:absolute;inset:16px;border:2px solid rgba(235,231,223,.12);border-radius:60px}}
.photo{{position:absolute;left:231px;top:196px;width:560px;height:700px;border-radius:30px;overflow:hidden;border:2px solid rgba(235,231,223,.26);background:#fff}}
.photo img{{width:100%;height:100%;object-fit:cover;object-position:50% 12%;filter:grayscale(1) contrast(1.06) brightness(.98)}}
.name{{position:absolute;left:96px;right:96px;top:948px;font:600 112px/1 Display;letter-spacing:-.035em}}
.role{{position:absolute;left:96px;right:96px;top:1076px;font:500 42px/1.2 Body;color:#a4a39e}}
.rule{{position:absolute;left:96px;top:1158px;width:112px;height:6px;background:#d5b05a;border-radius:3px}}
.foot{{position:absolute;left:96px;right:96px;bottom:92px;display:flex;justify-content:space-between;align-items:baseline;font:500 36px/1 Body;color:#a4a39e}}
.foot span:last-child{{font:500 30px/1 Mono;color:#74757a}}
.back{{left:{W - PW}px;background:#e9e5db;color:#141414}}
.back::before{{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,.018) 0 2px,transparent 2px 6px)}}
.back .edge{{position:absolute;inset:16px;border:2px solid rgba(20,20,20,.16);border-radius:60px}}
.bk-top{{position:absolute;left:96px;right:96px;top:96px;display:flex;justify-content:space-between;align-items:center}}
.mono{{position:relative;font:700 108px/1 Display;letter-spacing:-.05em}}
.mono i{{position:absolute;left:3px;bottom:-14px;width:76px;height:7px;background:#b88f34;border-radius:4px}}
.tag{{font:500 26px/1.2 Mono;color:#6b6a65;text-align:right}}
.full{{position:absolute;left:96px;right:96px;top:262px;font:600 70px/1.04 Display;letter-spacing:-.03em}}
.brole{{position:absolute;left:96px;right:96px;top:420px;font:500 38px/1.2 Body;color:#4d4c48}}
.qr{{position:absolute;left:276px;top:480px;width:470px;height:470px;background:#f4f1e8;border:3px solid #141414;border-radius:24px;padding:22px}}
.qr img{{width:100%;height:100%;display:block;image-rendering:pixelated}}
.cap{{position:absolute;left:60px;right:60px;top:978px;text-align:center;font:600 36px/1.2 Body}}
.cap small{{display:block;margin-top:8px;font:500 25px/1.2 Mono;color:#6b6a65}}
.rows{{position:absolute;left:96px;right:96px;top:1098px}}
.row{{display:flex;justify-content:space-between;align-items:baseline;gap:20px;padding:13px 0;border-top:2px solid rgba(20,20,20,.18)}}
.row small{{font:500 24px/1 Mono;color:#6b6a65}}
.row b{{font:600 34px/1.1 Body;letter-spacing:-.01em;white-space:nowrap}}
.avail{{position:absolute;left:96px;right:96px;bottom:62px;display:flex;align-items:center;gap:16px;font:500 28px/1 Body;color:#4d4c48}}
.avail i{{width:16px;height:16px;border-radius:50%;background:#3a9b5f}}
</style>
<div class="panel front"><div class="edge"></div>
  <div class="photo"><img src="data:image/png;base64,{b64(PHOTO)}"></div>
  <div class="name">{d['short']}</div>
  <div class="role">{d['role']}</div><div class="rule"></div>
  <div class="foot"><span>{d['city']}</span><span>{d['github']}</span></div>
</div>
<div class="panel back"><div class="edge"></div>
  <div class="bk-top"><div class="mono">FP<i></i></div><div class="tag">ID · INGENIERÍA<br>DE SOFTWARE</div></div>
  <div class="full">Frank Farid Yampier<br>Pineda Ferro</div>
  <div class="brole">{d['role']}</div>
  <div class="qr"><img src="{qr_uri()}"></div>
  <div class="cap">Escanea y guarda mi contacto<small>vCard · correo · teléfono · LinkedIn</small></div>
  <div class="rows">
    <div class="row"><small>correo</small><b>{d['email']}</b></div>
    <div class="row"><small>whatsapp</small><b>{d['phone']}</b></div>
    <div class="row"><small>github</small><b>{d['github']}</b></div>
  </div>
  <div class="avail"><i></i>Disponible para contratación · {d['city']}</div>
</div>"""


def strap_html(w=1536, h=512):
    # El texto corre a lo largo de la cinta; `w` es el periodo exacto, así que la textura se repite sin costuras.
    return f"""<!doctype html><meta charset="utf-8"><style>
{font_css()}
*{{box-sizing:border-box;margin:0}}
html,body{{width:{w}px;height:{h}px;background:#17181a;overflow:hidden}}
body{{position:relative}}
.l{{position:absolute;left:0;right:0;height:10px;background:#d5b05a;opacity:.9}}
.t{{top:46px}} .b{{bottom:46px}}
.txt{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 132px/1 Body;letter-spacing:.09em;color:#d6d0c2;white-space:nowrap;text-transform:uppercase}}
.txt s{{display:inline-block;width:30px;height:30px;margin:0 56px 0 48px;background:#d5b05a;border-radius:50%}}
</style><div class="l t"></div><div class="l b"></div>
<div class="txt">Frank Pineda<s></s></div>"""


def shot(page, html, path, w, h):
    tmp = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html)
    tmp.close()
    page.set_viewport_size({'width': w, 'height': h})
    page.goto('file://' + tmp.name)
    page.evaluate('document.fonts.ready')
    page.wait_for_timeout(300)
    page.screenshot(path=path, clip={'x': 0, 'y': 0, 'width': w, 'height': h})
    os.unlink(tmp.name)


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=1)
        raw = os.path.join(tempfile.gettempdir(), 'atlas_raw.png')
        shot(page, atlas_html(), raw, W, H)
        shot(page, strap_html(), os.path.join(OUT, 'strap.png'), 1536, 512)
        browser.close()
    Image.open(raw).convert('RGB').save(os.path.join(OUT, 'atlas.jpg'), quality=90, optimize=True, progressive=True)
    for name in ('atlas.jpg', 'strap.png'):
        print(name, os.path.getsize(os.path.join(OUT, name)) // 1024, 'KB')


if __name__ == '__main__':
    main()
