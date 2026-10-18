#!/usr/bin/env python3
"""Quita la textura incrustada de un GLB y deja solo geometría + materiales.

Uso:  python3 scripts/strip_glb.py <entrada.glb> src/assets/card/card.glb

La textura de la cara del carné la genera `scripts/build_card.py` con los datos de Frank.
"""
import json
import struct
import sys


def main(src, dst):
    data = open(src, 'rb').read()
    off, doc, binc = 12, None, None
    while off < len(data):
        clen, ctype = struct.unpack('<I4s', data[off:off + 8])
        off += 8
        if ctype == b'JSON':
            doc = json.loads(data[off:off + clen])
        elif ctype == b'BIN\x00':
            binc = data[off:off + clen]
        off += clen

    drop = {img['bufferView'] for img in doc.get('images', []) if 'bufferView' in img}
    remap, out, cursor = {}, bytearray(), 0
    new_views = []
    for i, bv in enumerate(doc['bufferViews']):
        if i in drop:
            continue
        start = bv.get('byteOffset', 0)
        chunk = binc[start:start + bv['byteLength']]
        pad = (-cursor) % 4
        out += b'\x00' * pad
        cursor += pad
        nv = dict(bv)
        nv['byteOffset'] = cursor
        nv['buffer'] = 0
        remap[i] = len(new_views)
        new_views.append(nv)
        out += chunk
        cursor += len(chunk)

    doc['bufferViews'] = new_views
    for acc in doc['accessors']:
        if 'bufferView' in acc:
            acc['bufferView'] = remap[acc['bufferView']]
    for key in ('images', 'textures', 'samplers'):
        doc.pop(key, None)
    for mat in doc.get('materials', []):
        mat.get('pbrMetallicRoughness', {}).pop('baseColorTexture', None)
    doc['buffers'] = [{'byteLength': len(out)}]

    js = json.dumps(doc, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    out += b'\x00' * ((-len(out)) % 4)
    total = 12 + 8 + len(js) + 8 + len(out)
    with open(dst, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total))
        f.write(struct.pack('<I4s', len(js), b'JSON') + js)
        f.write(struct.pack('<I4s', len(out), b'BIN\x00') + bytes(out))
    print(f'{dst}: {total // 1024} KB')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
