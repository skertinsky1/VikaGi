// ===== congrats.js — интро → текст → салют с ракетами + милый фон (текст всегда поверх) =====
(function () {
  "use strict";
  // Интро уже показало «С днём рождения, Вика. Сегодня твой день. Официально.»,
  // поэтому печатаем остальное — с «викчк лапчк пятчк».
  var MAIN = "С днём рождения викчк лапчк пятчк! Сегодня твой день. Официально. Можешь делать что хочешь: украсть у меня всех котят, задепать всю квартиру в казик, вот кстати промик сочный(VIKA-VIKA-VIKA), притворяться что ты с белоруси и тебе 16. Всё можно. Даже бесплатное желание даю.\n\nХочу сказать тебе несколько важных вещей. Во-первых, ты классная. Не потому что день рождения, а вообще прост факт. Во-вторых, ты умеешь делать мир вокруг себя лучше, даже когда сама этого не замечаешь. В-третьих, с тобой очень интересно и спокойно. Это редкость, между прочим.\n\nЖелаю тебе в этом году:\n- чтобы всё, что ты планируешь, сбывалось\n- чтобы люди вокруг были нормальные\n- чтобы еда всегда была вкусной и разнообразной(признак богатства)\n- миллион миллиардов денег\n- чтобы сон был крепким и без кошмаров\n- чтобы ты меньше переживала по пустякам\n- и чтобы у тебя всегда был заряд на телефоне!!!\n- ну и любви конешн и тонну счастья\n\nА ещё желаю тебе побольше моментов, когда ты просто сидишь и думаешь: \"Блин, как же хорошо\". Вот таких моментов. Чтобы их было много. И чтобы ты их замечала.\n\nСпасибо, что ты есть. Серьёзно. Своим появлением ты делаешь мою жизнь лучше просто тем, что ты в ней есть. Это не громкие слова, это правда\n\nС днём рождения, Вика. Будь счастлива. И ешь торт. Ты заслужила";
  var INTRO_MS = 3400; // сколько держим интро перед уходом
  var intro = document.getElementById("intro");
  var wrap = document.getElementById("mainWrap");
  var el = document.getElementById("typed");
  var cv = document.getElementById("fireworks");
  var ctx = cv.getContext("2d");
  var W = 0, H = 0;
  var sparks = [], rockets = [], flashes = [], ambient = [];
  var saluteOn = false;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MOBILE = window.innerWidth < 640;
  var COLORS = ["#ffd66e", "#ff8fb2", "#a78bfa", "#7ef9c6", "#fff", "#ffb3c9"];
  var CUTE = ["♥", "✦", "★", "✧", "♡"];

  function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
  window.addEventListener("resize", resize); resize();

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- милый фон: сердечки и звёздочки плывут всегда ---------- */
  function spawnAmbient() {
    if (ambient.length > 26 || reduced) return;
    ambient.push({
      x: Math.random() * W, y: H + 24,
      vy: -(0.25 + Math.random() * 0.5),
      ph: Math.random() * Math.PI * 2,
      ch: pick(CUTE), c: pick(COLORS),
      s: 10 + Math.random() * 12,
      a: 0.14 + Math.random() * 0.2
    });
  }
  setInterval(spawnAmbient, 600);
  for (var k = 0; k < 14; k++) {
    spawnAmbient();
    ambient[k].y = Math.random() * H; // сразу рассыпать по экрану
  }

  /* ---------- ракеты ---------- */
  function launchRocket() {
    if (rockets.length > 4) return;
    var x = W * (0.12 + Math.random() * 0.76);
    rockets.push({
      x: x, y: H + 8,
      px: x, py: H + 8,
      vy: -(H * 0.014 + Math.random() * H * 0.004),
      target: H * (0.18 + Math.random() * 0.3),
      c: pick(COLORS)
    });
  }

  /* ---------- взрывы ---------- */
  function explode(x, y, c, kind) {
    flashes.push({ x: x, y: y, r: 6, life: 1, c: c });
    var n = MOBILE ? 46 : 90, i, a, sp;
    if (kind === "heart") {
      for (i = 0; i < n; i++) {
        var t = (Math.PI * 2 * i) / n;
        var hx = 16 * Math.pow(Math.sin(t), 3);
        var hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        var sc = (MOBILE ? 5 : 8) * (0.9 + Math.random() * 0.25);
        sparks.push({ x: x, y: y, px: x, py: y,
          vx: hx / 16 * sc, vy: hy / 16 * sc,
          life: 1, decay: 0.008 + Math.random() * 0.006,
          c: c, grav: 0.02, glyph: Math.random() < 0.4 ? "♥" : null, s: 11 + Math.random() * 7 });
      }
    } else if (kind === "ring") {
      for (i = 0; i < n; i++) {
        a = (Math.PI * 2 * i) / n;
        sp = MOBILE ? 2.6 : 3.4;
        sparks.push({ x: x, y: y, px: x, py: y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, decay: 0.011, c: "#fff", grav: 0.008,
          glyph: Math.random() < 0.25 ? pick(CUTE) : null, s: 10 + Math.random() * 8 });
      }
    } else {
      for (i = 0; i < n; i++) {
        a = Math.random() * Math.PI * 2;
        sp = 0.8 + Math.random() * (MOBILE ? 3 : 4.2);
        sparks.push({ x: x, y: y, px: x, py: y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, decay: 0.009 + Math.random() * 0.01,
          c: Math.random() < 0.25 ? "#fff" : c, grav: 0.035,
          glyph: Math.random() < 0.14 ? pick(CUTE) : null, s: 10 + Math.random() * 8 });
      }
    }
    if (sparks.length > 600) sparks.splice(0, sparks.length - 600);
  }

  /* ---------- залпы после текста ---------- */
  function volley() {
    if (!saluteOn || reduced) return;
    var n = 2 + Math.floor(Math.random() * 2);
    for (var i = 0; i < n; i++) {
      (function (d) {
        setTimeout(launchRocket, d);
      })(i * 350);
    }
    // каждый 4-й залп — сердечком
    if (Math.random() < 0.3) {
      setTimeout(function () {
        explode(W * (0.25 + Math.random() * 0.5), H * (0.25 + Math.random() * 0.25), pick(COLORS), "heart");
      }, n * 350 + 900);
    }
    setTimeout(volley, 3200 + Math.random() * 1500);
  }
  function launchSalute() {
    saluteOn = true;
    volley();
  }

  /* ---------- кадр ---------- */
  function frame() {
    ctx.fillStyle = "rgba(10,5,25,0.2)";
    ctx.fillRect(0, 0, W, H);
    var i, p;

    // милый фон
    for (i = ambient.length - 1; i >= 0; i--) {
      p = ambient[i];
      p.y += p.vy;
      p.x += Math.sin(Date.now() / 1800 + p.ph) * 0.3;
      if (p.y < -30) { ambient.splice(i, 1); continue; }
      ctx.globalAlpha = p.a;
      ctx.font = p.s + "px serif";
      ctx.fillStyle = p.c;
      ctx.fillText(p.ch, p.x, p.y);
    }

    // ракеты со шлейфом
    for (i = rockets.length - 1; i >= 0; i--) {
      p = rockets[i];
      p.px = p.x; p.py = p.y;
      p.y += p.vy;
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = p.c;
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7); ctx.fill();
      if (p.y <= p.target) {
        rockets.splice(i, 1);
        var kinds = ["sphere", "sphere", "ring", "heart"];
        explode(p.x, p.y, p.c, kinds[Math.floor(Math.random() * kinds.length)]);
      }
    }

    // вспышки
    for (i = flashes.length - 1; i >= 0; i--) {
      p = flashes[i];
      p.r += 7; p.life -= 0.09;
      if (p.life <= 0) { flashes.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life) * 0.5;
      ctx.strokeStyle = p.c;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.stroke();
    }

    // искры со шлейфами и мерцанием
    for (i = sparks.length - 1; i >= 0; i--) {
      p = sparks[i];
      p.px = p.x; p.py = p.y;
      p.x += p.vx; p.y += p.vy;
      p.vy += p.grav; p.vx *= 0.986; p.vy *= 0.986;
      p.life -= p.decay;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      var tw = 0.65 + 0.35 * Math.sin(Date.now() / 90 + p.x);
      ctx.globalAlpha = Math.max(0, p.life) * tw;
      if (p.glyph) {
        ctx.font = p.s + "px serif";
        ctx.fillStyle = p.c;
        ctx.fillText(p.glyph, p.x, p.y);
      } else {
        ctx.strokeStyle = p.c;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  /* ---------- 1. интро → плавный уход → печать ---------- */
  setTimeout(function () {
    intro.classList.add("hide");
    wrap.classList.remove("pre");
    setTimeout(function () { intro.style.display = "none"; }, 1200);
    type();
  }, reduced ? 400 : INTRO_MS);

  /* ---------- 2. печать по одной букве ---------- */
  var i = 0;
  function type() {
    if (i <= MAIN.length) {
      el.textContent = MAIN.slice(0, i) + (i < MAIN.length ? "▌" : "");
      i++;
      setTimeout(type, MAIN[i - 1] === "\n" ? 70 : MAIN[i - 1] === " " ? 28 : 36);
    } else {
      el.textContent = MAIN;
      launchSalute();
    }
  }

  if (!reduced) requestAnimationFrame(frame);
})();
