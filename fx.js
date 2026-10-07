// ===== fx.js — TEST: только визуальные эффекты, логика живёт в script.js =====
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    return;
  }

  // 1. появление блоков при скролле
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach(function (el) {
    if (io) io.observe(el); else el.classList.add("in");
  });
  // hero виден сразу
  setTimeout(function () {
    document.querySelectorAll(".hero .reveal, .ticker.reveal").forEach(function (el, i) {
      setTimeout(function () { el.classList.add("in"); }, i * 120);
    });
  }, 60);

  // 2. ripple на кнопках
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      var r = btn.getBoundingClientRect();
      var s = document.createElement("span");
      s.className = "ripple";
      var size = Math.max(r.width, r.height);
      s.style.width = s.style.height = size + "px";
      s.style.left = (ev.clientX - r.left - size / 2) + "px";
      s.style.top = (ev.clientY - r.top - size / 2) + "px";
      btn.appendChild(s);
      setTimeout(function () { s.remove(); }, 750);
    });
  });

  // 3. залп сердечек при комплименте
  var cBtn = document.getElementById("complimentBtn");
  var GLYPHS = ["💛", "💖", "✨", "🌷", "💕"];
  if (cBtn) cBtn.addEventListener("click", function (ev) {
    var n = 10;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "cf-heart";
      s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      s.style.left = ev.clientX + "px";
      s.style.top = ev.clientY + "px";
      s.style.setProperty("--dx", (Math.random() * 220 - 110) + "px");
      s.style.setProperty("--rr", (Math.random() * 120 - 60) + "deg");
      s.style.fontSize = (14 + Math.random() * 16) + "px";
      document.body.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 1200); })(s);
    }
  });

  // 4. лёгкий параллакс орб (только десктоп)
  if (window.innerWidth > 760) {
    var orbs = document.querySelectorAll(".orb");
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        orbs.forEach(function (o, i) {
          o.style.marginTop = (y * (0.04 + i * 0.02)) + "px";
        });
        ticking = false;
      });
    }, { passive: true });
  }
})();
