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

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
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
  const deviceFrames = document.querySelectorAll('.device-frame');

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  deviceFrames.forEach(frame => {
    const img = frame.querySelector('img');
    if (!img) return;

    frame.addEventListener('click', () => openLightbox(img.src, img.alt));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img.src, img.alt);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* Reanima o fluxo de mensagens do hero periodicamente */
  const bubbleStream = document.getElementById('bubbleStream');
  const flowAgenda = document.querySelector('.flow-agenda');
  if (bubbleStream && flowAgenda) {
    setInterval(() => {
      bubbleStream.querySelectorAll('.bubble').forEach(b => {
        b.style.animation = 'none';
        void b.offsetWidth; /* reinicia a animação */
        b.style.animation = '';
      });
      flowAgenda.style.animation = 'none';
      void flowAgenda.offsetWidth;
      flowAgenda.style.animation = '';
    }, 7000);
  }

});
