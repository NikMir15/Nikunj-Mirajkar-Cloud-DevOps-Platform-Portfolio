document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) toggle.addEventListener("click", () => nav.classList.toggle("is-open"));

  // Active link on scroll (single-page)
  const links = Array.from(document.querySelectorAll("#main-nav a"));
  const sections = links
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = () => {
    const offset = 140; // sticky header offset
    const pos = window.scrollY + offset;

    let current = sections[0]?.id || "home";
    for (const s of sections) {
      if (s.offsetTop <= pos) current = s.id;
    }
    links.forEach(a => {
      const id = a.getAttribute("href").replace("#", "");
      a.classList.toggle("active", id === current);
    });
  };

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  // Matrix background
  const canvas = document.getElementById("matrix");
  if (!canvas) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext("2d");

  let w, h, cols, drops, fontSize;
  const chars =
    "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    fontSize = Math.max(14, Math.floor(w / 90));
    cols = Math.floor(w / fontSize);
    drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * h / fontSize));
  }

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.10)";
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;

    for (let i = 0; i < cols; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = "rgba(0,255,120,0.92)";
      ctx.fillText(text, x, y);

      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
});
