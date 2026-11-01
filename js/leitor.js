// Leitor da cartilha: liga o StPageFlip às páginas e aos botões.
(function () {
  const livroEl = document.getElementById("livro");
  const btnAnterior = document.getElementById("anterior");
  const btnProxima = document.getElementById("proxima");
  const contador = document.getElementById("contador");
  const btnTelaCheia = document.getElementById("tela-cheia");

  // Tamanho-base de UMA página (proporção A2 = 1 : 1,414).
  // Com size "stretch" o livro se ajusta à largura de #livro;
  // se #livro tiver menos de 2 × width, ele mostra uma página por vez (modo retrato).
  const livro = new St.PageFlip(livroEl, {
    width: 300,
    height: 424,
    size: "stretch",
    minWidth: 180,
    maxWidth: 1400,
    minHeight: 254,
    maxHeight: 1980,
    showCover: true,          // capa e contracapa sozinhas, o resto em pares
    usePortrait: true,        // celular: uma página por vez
    mobileScrollSupport: true,
    maxShadowOpacity: 0.4,
    flippingTime: 700,
  });

  livro.loadFromHTML(document.querySelectorAll(".pagina"));

  const total = livro.getPageCount();

  function atualizar() {
    const i = livro.getCurrentPageIndex(); // começa em 0
    const retrato = livro.getOrientation() === "portrait";
    const palco = livroEl.parentElement;
    if (palco.classList.contains("retrato") !== retrato) {
      palco.classList.toggle("retrato", retrato);
      setTimeout(() => livro.update(), 0); // largura mudou: recalcula
    }

    if (i === 0) {
      contador.textContent = "Capa";
    } else if (i === total - 1 && (retrato || i % 2 === 1)) {
      contador.textContent = "Contracapa";
    } else if (retrato) {
      contador.textContent = `Página ${i + 1} de ${total}`;
    } else {
      // no modo livro aberto o índice é sempre a página da esquerda
      const esq = i % 2 === 1 ? i : i - 1;
      contador.textContent = `Páginas ${esq + 1}–${Math.min(esq + 2, total)} de ${total}`;
    }
    btnAnterior.disabled = i === 0;
    btnProxima.disabled = i >= total - 1;
  }

  livro.on("flip", atualizar);
  livro.on("changeOrientation", atualizar);
  livro.on("init", atualizar);
  atualizar();

  btnAnterior.addEventListener("click", () => livro.flipPrev());
  btnProxima.addEventListener("click", () => livro.flipNext());

  // Setas do teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") livro.flipNext();
    if (e.key === "ArrowLeft") livro.flipPrev();
  });

  // Abre direto numa página se o link tiver #pagina-7, por exemplo
  const m = location.hash.match(/pagina-(\d+)/);
  if (m) {
    const n = Math.min(Math.max(parseInt(m[1], 10), 1), total);
    livro.turnToPage(n - 1);
    atualizar();
  }

  // Tela cheia
  btnTelaCheia.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    const cheia = !!document.fullscreenElement;
    document.body.classList.toggle("cheia", cheia);
    btnTelaCheia.textContent = cheia ? "Sair da tela cheia" : "Tela cheia";
    // o livro precisa recalcular o tamanho depois que o CSS muda
    setTimeout(() => livro.update(), 100);
  });

  // Celular sem suporte a tela cheia (iPhone): esconde o botão
  if (!document.documentElement.requestFullscreen) btnTelaCheia.hidden = true;
})();
