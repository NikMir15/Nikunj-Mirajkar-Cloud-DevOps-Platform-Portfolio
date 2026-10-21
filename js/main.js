
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // COPYRIGHT YEAR
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // MOBILE NAVIGATION
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // MATRIX BACKGROUND
  const canvas = document.getElementById("matrix");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const chars =
    "01ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "アイウエオカキクケコサシスセソタチツテト";

  let columns = [];
  let fontSize = 14;
  let width = 0;
  let height = 0;
  let lastFrame = 0;
  let animationId = null;

  const frameInterval = 65;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fontSize = width < 600 ? 11 : 14;

    const count = Math.ceil(width / fontSize);

    columns = Array.from({ length: count }, () => ({
      y: Math.random() * -height / fontSize,
      speed: 0.35 + Math.random() * 0.7
    }));

    ctx.fillStyle = "#030b08";
    ctx.fillRect(0, 0, width, height);
  }

  function draw(timestamp) {
    animationId = requestAnimationFrame(draw);

    if (timestamp - lastFrame < frameInterval) return;

    lastFrame = timestamp;

    ctx.fillStyle = "rgba(0, 8, 4, 0.075)";
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + "px monospace";

    columns.forEach((column, index) => {
      const character = chars.charAt(
        Math.floor(Math.random() * chars.length)
      );

      const x = index * fontSize;
      const y = column.y * fontSize;

      ctx.fillStyle = Math.random() > 0.985
        ? "#9affc6"
        : "#008d45";

      ctx.fillText(character, x, y);

      column.y += column.speed;

      if (y > height && Math.random() > 0.975) {
        column.y = -Math.random() * 30;
      }
    });
  }

  function startMatrix() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    resizeCanvas();

    if (!reducedMotion.matches) {
      animationId = requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", startMatrix);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      startMatrix();
    }
  });

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", startMatrix);
  }

  startMatrix();
});
