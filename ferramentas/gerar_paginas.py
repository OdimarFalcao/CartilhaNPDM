"""Gera as imagens das páginas (WebP) a partir do PDF da cartilha.

Instalação (uma vez):  pip install pymupdf pillow
Uso:                   python ferramentas/gerar_paginas.py cartilha-museu-vai-a-escola.pdf paginas
"""
import sys
from pathlib import Path

import pymupdf as fitz
from PIL import Image

LARGURA = 1800   # px — nítido em tela de celular e de notebook
QUALIDADE = 82   # WebP: 80–85 é um bom equilíbrio tamanho × qualidade

pdf_path, pasta_saida = Path(sys.argv[1]), Path(sys.argv[2])
pasta_saida.mkdir(exist_ok=True)

doc = fitz.open(pdf_path)
for i, pagina in enumerate(doc, start=1):
    escala = LARGURA / pagina.rect.width
    pix = pagina.get_pixmap(matrix=fitz.Matrix(escala, escala), alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    destino = pasta_saida / f"pagina-{i:02d}.webp"
    img.save(destino, "WEBP", quality=QUALIDADE, method=6)
    print(f"{destino}  {destino.stat().st_size // 1024} KB")
