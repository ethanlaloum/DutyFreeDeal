"""Writes the DutyFreeDeal logo files (symbol, complete logo for light and dark grounds, app icon) from the traced paths."""
import json, os, re, sys
d = json.load(open(sys.argv[1])); out = sys.argv[2]
os.makedirs(out, exist_ok=True)
NAVY, COPPER = '#12324B', '#CB6831'
PAIR = re.compile(r'(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)')

def move(path, x0, y0, s, tx=0, ty=0):
    def r(m):
        x = (float(m.group(1)) - x0) * s + tx
        y = (float(m.group(2)) - y0) * s + ty
        return f'{x:.1f} {y:.1f}'
    return PAIR.sub(r, path).replace('.0 ', ' ').replace('.0C', 'C').replace('.0L', 'L').replace('.0Z', 'Z')

def svg(vb_w, vb_h, body, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb_w:.1f} {vb_h:.1f}" role="img" aria-label="{label}">'
            f'{body}</svg>\n')

sym, word = d['symbol'], d['wordmark']
sx0, sy0, sx1, sy1 = sym['bbox']
bi, bd = word['bbox_ink'], word['bbox_deal']
wx0, wy0, wx1, wy1 = bi[0], min(bi[1], bd[1]), bi[2], max(bi[3], bd[3])

# Standalone symbol, at the traced scale.
sw, sh = sx1 - sx0, sy1 - sy0
tag, letters = move(sym['tag'], sx0, sy0, 1), move(sym['letters'], sx0, sy0, 1)
symbol_body = f'<path fill="{COPPER}" d="{tag}"/><path fill="#fff" d="{letters}"/>'
open(os.path.join(out, 'symbol.svg'), 'w').write(svg(sw, sh, symbol_body, 'DutyFreeDeal'))

# Complete logo, proportions measured on the board's "complete logo" panel:
# symbol 167 x 148 at the left, wordmark 617 wide starting 13 units after the symbol, both centred as on the board.
ss = 0.436
s_w = 617 / (wx1 - wx0)
sym_w, sym_h = sw * ss, sh * ss
word_h = (wy1 - wy0) * s_w
sym_cy, word_top = 149 - 75, 108 - 75          # board panel coordinates, relative to the symbol's top edge (y = 75)
sym_top = sym_cy - sym_h / 2
word_x = sym_w + 13 + (171 - sym_w) * 0       # gap after the symbol
top = min(sym_top, word_top); bottom = max(sym_top + sym_h, word_top + word_h)
H = bottom - top; W = word_x + 617
c_tag = move(sym['tag'], sx0, sy0, ss, 0, sym_top - top)
c_letters = move(sym['letters'], sx0, sy0, ss, 0, sym_top - top)
c_ink = move(word['ink'], wx0, wy0, s_w, word_x, word_top - top)
c_deal = move(word['deal'], wx0, wy0, s_w, word_x, word_top - top)
for name, ink in (('logo.svg', NAVY), ('logo-on-dark.svg', '#fff')):
    body = (f'<path fill="{COPPER}" d="{c_tag}"/><path fill="#fff" d="{c_letters}"/>'
            f'<path fill="{ink}" d="{c_ink}"/><path fill="{COPPER}" d="{c_deal}"/>')
    open(os.path.join(out, name), 'w').write(svg(W, H, body, 'dutyfreedeal.com'))

# App icon: the symbol on a midnight rounded square, as on the board.
A = 512; pad = 0.13 * A; scale = (A - 2 * pad) / max(sw, sh)
ox = (A - sw * scale) / 2; oy = (A - sh * scale) / 2
a_tag = move(sym['tag'], sx0, sy0, scale, ox, oy); a_letters = move(sym['letters'], sx0, sy0, scale, ox, oy)
icon = (f'<rect width="{A}" height="{A}" rx="{0.225 * A:.0f}" fill="{NAVY}"/>'
        f'<path fill="{COPPER}" d="{a_tag}"/><path fill="#fff" d="{a_letters}"/>')
open(os.path.join(out, 'app-icon.svg'), 'w').write(svg(A, A, icon, 'DutyFreeDeal'))
print(f'symbol {sw:.1f}x{sh:.1f}  logo {W:.1f}x{H:.1f} (ratio {W / H:.2f})')
