
(() => {
  'use strict';

  // Update footer year
  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Mobile navigation
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Matrix rain animation
  const canvas = document.getElementById('matrix');

  if (
    !canvas ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) return;

  const chars = '01アイウエオカキクケコサシスセソタチツテト';

  let columns = [];
  let fontSize = 15;
  let width = 0;
  let height = 0;
  let last = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // More Matrix columns on mobile
    fontSize = width < 650 ? 12 : 16;

    columns = Array.from(
      { length: Math.ceil(width / fontSize) },
      () => Math.random() * -(height / fontSize)
    );

    ctx.fillStyle = '#020b07';
    ctx.fillRect(0, 0, width, height);
  }

  function draw(now) {
    requestAnimationFrame(draw);

    // Pause when tab is hidden and limit frame rate
    if (document.hidden || now - last < 65) return;

    last = now;

    // Transparent overlay creates fading character trails
    ctx.fillStyle = 'rgba(2, 11, 7, 0.09)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < columns.length; i++) {
      const char = chars[
        Math.floor(Math.random() * chars.length)
      ];

      ctx.fillStyle = Math.random() > .985
        ? '#72ffc0'
        : '#007c4c';

      ctx.fillText(
        char,
        i * fontSize,
        columns[i] * fontSize
      );

      if (
        columns[i] * fontSize > height &&
        Math.random() > .975
      ) {
        columns[i] = 0;
      } else {
        columns[i] += .48;
      }
    }
  }

  window.addEventListener('resize', resize, {
    passive: true
  });

  resize();
  requestAnimationFrame(draw);
})();
