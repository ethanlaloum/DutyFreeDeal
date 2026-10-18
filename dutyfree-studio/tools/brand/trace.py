"""Traces the DutyFreeDeal logo from the brand board "01 / Midnight + Copper" (brand-board.jpeg, received 18 October 2026)
into SVG paths, written as JSON for build_assets.py.

Usage (from dutyfree-studio/, Python with pillow, numpy, scipy and potracer):
  python3 tools/brand/trace.py tools/brand/brand-board.jpeg /tmp/trace.json
  python3 tools/brand/build_assets.py /tmp/trace.json assets/brand
"""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage
import potrace

SRC, OUT = sys.argv[1], sys.argv[2]
board = Image.open(SRC).convert('RGB')
WHITE = np.array([254, 254, 254.])
NAVY = np.array([0x12, 0x32, 0x4b], float)
COPPER = np.array([0xcb, 0x68, 0x31], float)
K = 5  # upscale factor before thresholding: smooth sub-pixel edges

def crop_up(box):
    im = board.crop(box)
    im = im.resize((im.width * K, im.height * K), Image.LANCZOS)
    return np.asarray(im).astype(float)

def along(px, bg, ink):
    """Position of each pixel on the segment bg->ink (0 = bg, 1 = ink) and its distance off that segment."""
    v = ink - bg
    t = ((px - bg) @ v) / (v @ v)
    off = np.linalg.norm(px - (bg + np.clip(t, 0, 1)[..., None] * v), axis=-1)
    return t, off

def to_d(mask, ox, oy):
    bm = potrace.Bitmap(~mask)  # potracer inverts: False pixels are ink
    plist = bm.trace(turdsize=8 * K, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.45)
    f = lambda p: f'{(p.x / K + ox):.2f} {(p.y / K + oy):.2f}'
    parts = []
    for curve in plist:
        parts.append('M' + f(curve.start_point))
        for s in curve.segments:
            if s.is_corner:
                parts.append('L' + f(s.c) + 'L' + f(s.end_point))
            else:
                parts.append('C' + f(s.c1) + ' ' + f(s.c2) + ' ' + f(s.end_point))
        parts.append('Z')
    return ''.join(parts)

def bbox(mask, ox, oy):
    ys, xs = np.nonzero(mask)
    return [xs.min() / K + ox, ys.min() / K + oy, (xs.max() + 1) / K + ox, (ys.max() + 1) / K + oy]

out = {}

# 1. Standalone symbol (panel 1): copper tag, white DFD letters, punched hole.
box = (140, 95, 575, 455)
px = crop_up(box)
t, off = along(px, WHITE, COPPER)
t = ndimage.gaussian_filter(t, K * 0.7)  # irons out JPEG noise before thresholding
copper = (t > 0.5) & (off < 60)
copper = ndimage.binary_opening(copper, iterations=2)
lab, n = ndimage.label(copper)
sizes = ndimage.sum(copper, lab, range(1, n + 1))
copper = lab == (1 + int(np.argmax(sizes)))
silhouette = ndimage.binary_fill_holes(copper)
inside = silhouette & ~copper
lab, n = ndimage.label(inside)
comps = []
for i in range(1, n + 1):
    m = lab == i
    ys, xs = np.nonzero(m)
    h, w = np.ptp(ys) + 1, np.ptp(xs) + 1
    comps.append((m.sum(), w / h, i, xs.mean(), ys.mean()))
comps.sort(reverse=True)
print('inside components (area, w/h, id, cx, cy):', [(int(a), round(r, 2), i, int(cx / K), int(cy / K)) for a, r, i, cx, cy in comps[:8]])
# The punched hole is the roundest compact component in the upper right; the letters are the rest.
hole_id = min(comps[:6], key=lambda c: abs(c[1] - 1) + (0 if c[3] > inside.shape[1] * 0.7 and c[4] < inside.shape[0] * 0.4 else 9))[2]
hole = lab == hole_id
letters = inside & ~hole
letters = ndimage.binary_opening(letters, iterations=1)
tag = silhouette & ~hole
ox, oy = box[0], box[1]
out['symbol'] = {'tag': to_d(tag, ox, oy), 'letters': to_d(letters, ox, oy), 'bbox': bbox(tag, ox, oy)}

# 2. Wordmark (panel 2): navy "dutyfree" + ".com", copper "deal".
box = (660, 190, 1492, 345)
px = crop_up(box)
tn, on = along(px, WHITE, NAVY)
tc, oc = along(px, WHITE, COPPER)
is_copper = oc < on
tn = ndimage.gaussian_filter(tn, K * 0.5)
tc = ndimage.gaussian_filter(tc, K * 0.5)
navy = (tn > 0.5) & ~is_copper
cop = (tc > 0.5) & is_copper
navy = ndimage.binary_opening(navy, iterations=1)
cop = ndimage.binary_opening(cop, iterations=1)
ox, oy = box[0], box[1]
out['wordmark'] = {'ink': to_d(navy, ox, oy), 'deal': to_d(cop, ox, oy), 'bbox_ink': bbox(navy, ox, oy), 'bbox_deal': bbox(cop, ox, oy)}

# 3. Proportions of the complete logo (panel 4, on navy): symbol box vs wordmark box.
box = (655, 475, 1498, 762)
im = np.asarray(board.crop(box)).astype(float)
tc4, oc4 = along(im, NAVY, COPPER)
tw4, ow4 = along(im, NAVY, WHITE)
c4 = (tc4 > 0.5) & (oc4 < ow4)
w4 = (tw4 > 0.5) & (ow4 <= oc4)
lab, n = ndimage.label(c4)
sizes = ndimage.sum(c4, lab, range(1, n + 1))
big = lab == (1 + int(np.argmax(sizes)))
sym_fill = ndimage.binary_fill_holes(big)
word = (c4 | w4) & ~sym_fill
word[:40] = False  # panel title
ys, xs = np.nonzero(sym_fill); sb = [xs.min(), ys.min(), xs.max() + 1, ys.max() + 1]
ys, xs = np.nonzero(word); wb = [xs.min(), ys.min(), xs.max() + 1, ys.max() + 1]
out['complete'] = {'symbol_box': [int(v) for v in sb], 'word_box': [int(v) for v in wb]}
print('complete logo boxes', out['complete'])
print('symbol bbox', out['symbol']['bbox'], 'wordmark', out['wordmark']['bbox_ink'], out['wordmark']['bbox_deal'])
json.dump(out, open(OUT, 'w'))
