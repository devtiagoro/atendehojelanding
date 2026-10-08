document.addEventListener('DOMContentLoaded', () => {

  /* Ano dinâmico no rodapé */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Header: superfície sólida ao rolar */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const setNav = (open) => {
    if (!navToggle || !mainNav) return;
    mainNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  const isNavOpen = () => mainNav && mainNav.classList.contains('is-open');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => setNav(!isNavOpen()));

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setNav(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isNavOpen()) {
        setNav(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!isNavOpen()) return;
      if (mainNav.contains(e.target) || navToggle.contains(e.target)) return;
      setNav(false);
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
      if (e.matches) setNav(false);
    });
  }

  /* Revelar elementos ao rolar a página */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* Lightbox das imagens do produto (clique para ampliar) */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const shots = document.querySelectorAll('.lp-shot');
  let lastFocused = null;

  /* Zoom e pan da imagem dentro do lightbox, isolado do zoom da página */
  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  let scale = 1;
  let posX = 0;
  let posY = 0;
  let isPanning = false;
  let hasDragged = false;
  let startX = 0;
  let startY = 0;
  let startPosX = 0;
  let startPosY = 0;
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  const applyTransform = (animated) => {
    if (!lightboxImg) return;
    lightboxImg.style.transition = animated ? 'transform 0.2s ease-out' : 'none';
    lightboxImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    lightboxImg.classList.toggle('zoomed', scale > 1);
  };

  const resetZoom = (animated) => {
    scale = 1;
    posX = 0;
    posY = 0;
    applyTransform(animated);
  };

  const zoomAt = (newScale, clientX, clientY) => {
    if (!lightboxImg) return;
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    if (clamped === scale) return;

    const rect = lightboxImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 - posX;
    const centerY = rect.top + rect.height / 2 - posY;
    const originX = clientX - centerX;
    const originY = clientY - centerY;
    const ratio = clamped / scale;

    posX = posX * ratio + originX * (1 - ratio);
    posY = posY * ratio + originY * (1 - ratio);
    scale = clamped;
    if (scale === MIN_SCALE) { posX = 0; posY = 0; }
    applyTransform(false);
  };

  const isLightboxOpen = () => lightbox && !lightbox.hidden;

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    resetZoom(false);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  };

  const closeLightbox = () => {
    if (!isLightboxOpen()) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    resetZoom(false);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  shots.forEach(shot => {
    const img = shot.querySelector('img');
    if (!img) return;
    shot.addEventListener('click', () => {
      openLightbox(shot.dataset.full || img.currentSrc || img.src, img.alt);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox && !hasDragged) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!isLightboxOpen()) return;
    if (e.key === 'Escape') closeLightbox();
    /* Mantém o foco dentro do diálogo: só existe um controle focável */
    if (e.key === 'Tab') {
      e.preventDefault();
      if (lightboxClose) lightboxClose.focus();
    }
  });

  if (lightboxImg) {
    lightboxImg.setAttribute('draggable', 'false');
    lightboxImg.addEventListener('dragstart', (e) => e.preventDefault());

    /* Roda do mouse / trackpad: amplia a imagem no ponto do cursor, nunca a página */
    lightboxImg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0016);
      zoomAt(scale * factor, e.clientX, e.clientY);
    }, { passive: false });

    /* Duplo clique: alterna entre 1x e 2.5x no ponto clicado */
    lightboxImg.addEventListener('dblclick', (e) => {
      if (scale > 1) {
        resetZoom(true);
      } else {
        zoomAt(2.5, e.clientX, e.clientY);
        applyTransform(true);
      }
    });

    /* Arrastar com o mouse quando ampliada */
    lightboxImg.addEventListener('mousedown', (e) => {
      if (scale <= 1) return;
      isPanning = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      startPosX = posX;
      startPosY = posY;
      lightboxImg.classList.add('dragging');
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
      posX = startPosX + dx;
      posY = startPosY + dy;
      applyTransform(false);
    });
    window.addEventListener('mouseup', () => {
      if (!isPanning) return;
      isPanning = false;
      lightboxImg.classList.remove('dragging');
      setTimeout(() => { hasDragged = false; }, 0);
    });

    /* Toque: pinça para ampliar, um dedo para arrastar quando ampliada */
    lightboxImg.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const [t1, t2] = e.touches;
        pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        pinchStartScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startPosX = posX;
        startPosY = posY;
      }
    }, { passive: true });

    lightboxImg.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const [t1, t2] = e.touches;
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        zoomAt(pinchStartScale * (dist / pinchStartDist), midX, midY);
      } else if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        posX = startPosX + (e.touches[0].clientX - startX);
        posY = startPosY + (e.touches[0].clientY - startY);
        applyTransform(false);
      }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

});
