"""Recomprime as imagens de um PDF sem mexer em texto e vetores.
Uso: python3 comprimir.py entrada.pdf saida.pdf <lado_max_px> <qualidade_jpeg>
Ex.: python3 comprimir.py original.pdf cartilha.pdf 2000 80
"""
import sys, io, pikepdf
from pikepdf import PdfImage, Name
from PIL import Image

src, dst, maxpx, q = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
pdf = pikepdf.open(src)

# Percorre TODOS os objetos (no Canva as imagens ficam dentro de Form XObjects,
# então page.images não as encontra).
for raw in pdf.objects:
    if not isinstance(raw, pikepdf.Stream) or raw.get('/Subtype') != Name.Image:
        continue
    try:
        im = PdfImage(raw).as_pil_image()
    except Exception as e:
        print("pulando imagem:", e); continue
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    if max(im.size) > maxpx:                      # reduz resolução
        im.thumbnail((maxpx, maxpx), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=q, optimize=True)
    raw.write(buf.getvalue(), filter=Name.DCTDecode)   # grava como JPEG
    raw.Width, raw.Height = im.size
    raw.ColorSpace = Name.DeviceRGB if im.mode == "RGB" else Name.DeviceGray
    raw.BitsPerComponent = 8
    for k in ("/DecodeParms", "/Decode"):
        if k in raw: del raw[k]

pdf.save(dst, compress_streams=True,
         object_stream_mode=pikepdf.ObjectStreamMode.generate)
