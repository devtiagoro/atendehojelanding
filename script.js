document.addEventListener('DOMContentLoaded', () => {

  /* Ano dinâmico no rodapé */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Header: sombra ao rolar + barra de progresso de leitura */
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('progressBar');

  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);

    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const closeMobileNav = () => {
    if (!navToggle || !mainNav) return;
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        closeMobileNav();
        navToggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.classList.contains('open')) return;
      if (mainNav.contains(e.target) || navToggle.contains(e.target)) return;
      closeMobileNav();
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

  /* Acordeão de FAQ */
  const accItems = document.querySelectorAll('.acc-item');

  const setPanelHeight = (item, open) => {
    const panel = item.querySelector('.acc-panel');
    const trigger = item.querySelector('.acc-trigger');
    if (!panel || !trigger) return;

    if (open) {
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 24 + 'px';
    } else {
      item.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = null;
    }
  };

  accItems.forEach((item, index) => {
    const trigger = item.querySelector('.acc-trigger');
    if (!trigger) return;

    // Primeiro item aberto por padrão
    if (index === 0) setPanelHeight(item, true);

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      accItems.forEach(other => setPanelHeight(other, false));
      if (!isOpen) setPanelHeight(item, true);
    });
  });

  /* Lightbox das imagens do produto (clique para ampliar) */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const shotFrames = document.querySelectorAll('.shot-frame');

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

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    resetZoom(false);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetZoom(false);
  };

  shotFrames.forEach(frame => {
    const img = frame.querySelector('img');
    if (!img) return;

    const tryOpen = () => {
      if (frame.classList.contains('shot-missing')) return;
      openLightbox(img.src, img.alt);
    };

    frame.addEventListener('click', tryOpen);
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tryOpen();
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox && !hasDragged) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
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
        const newScale = pinchStartScale * (dist / pinchStartDist);
        zoomAt(newScale, midX, midY);
      } else if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        posX = startPosX + dx;
        posY = startPosY + dy;
        applyTransform(false);
      }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

});
