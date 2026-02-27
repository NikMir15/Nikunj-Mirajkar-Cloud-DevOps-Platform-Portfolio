(() => {
  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close nav after click (mobile)
    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Smooth scroll (native + small fallback)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  // MATRIX RAIN
  const canvas = document.getElementById("matrix");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0, dpr = 1;
  let cols = 0;
  let drops = [];
  let fontSize = 16;
  let speedBase = 1;
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function computeSettings() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);

    // more rain on mobile + big screens
    const isMobile = w < 720;
    fontSize = isMobile ? 14 : 16;

    // density tweak: smaller columnWidth => more columns
    const colWidth = isMobile ? 12 : 14;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;

    cols = Math.floor(w / colWidth);
    drops = new Array(cols).fill(0).map(() => Math.random() * h);

    // speed
    speedBase = prefersReduced ? 0.6 : (isMobile ? 1.15 : 1.0);
  }

  function randChar() {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  // Subtle tuning: slower fade => softer look, but not heavy
  function draw() {
    // fade
    ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < cols; i++) {
      const x = i * (w / cols);
      const y = drops[i];

      // green glow
      ctx.fillStyle = "rgba(0, 255, 120, 0.85)";
      ctx.fillText(randChar(), x, y);

      // drop update
      drops[i] = y + fontSize * speedBase;

      // reset
      if (drops[i] > h + 20 && Math.random() > 0.975) {
        drops[i] = -Math.random() * 120;
      }
    }

    requestAnimationFrame(draw);
  }

  computeSettings();
  window.addEventListener("resize", () => {
    computeSettings();
  }, { passive: true });

  // Start
  requestAnimationFrame(draw);
})();