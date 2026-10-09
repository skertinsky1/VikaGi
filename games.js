// ===== games.js — ТЕСТ: табы + счётчик + лимит 2 + РУЛЕТКА + СЛОТЫ (всегда выигрыш) =====
(function () {
  "use strict";

  var LIMIT = 2;                                  // максимум шоколадок с одной игры
  var NO_LIMIT = false; // лимиты возвращены: максимум 2 шоколадки с игры
  var ORDER = ["roulette", "slots", "scratch", "coin"];
  var NEXT_LABEL = {
    roulette: "Дальше: слоты →",
    slots: "Дальше: скретч →",
    scratch: "Дальше: монетка →",
    coin: "Ещё разок ↻"
  };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lsGet(k, fb) { try { var v = localStorage.getItem(k); return v === null ? fb : v; } catch (e) { return fb; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- счётчик шоколадок ---------- */
  var choco = parseInt(lsGet("vika_choco", "0"), 10) || 0;
  function renderChoco() {
    var a = document.getElementById("chocoCount");
    var b = document.getElementById("chocoTotal");
    if (a) a.textContent = choco;
    if (b) b.textContent = choco;
  }
  function addChoco() { choco++; lsSet("vika_choco", String(choco)); renderChoco(); }
  renderChoco();

  /* ---------- победы по играм ---------- */
  function getWins(g) { return parseInt(lsGet("vika_win_" + g, "0"), 10) || 0; }
  function addWin(g) { lsSet("vika_win_" + g, String(getWins(g) + 1)); }
  function maxed(g) { return !NO_LIMIT && getWins(g) >= LIMIT; }
  function countLabel(g) { return NO_LIMIT ? "" : " (" + getWins(g) + "/" + LIMIT + ")"; }
  function nextGame(g) {
    var i = ORDER.indexOf(g);
    return ORDER[(i + 1) % ORDER.length];
  }

  /* ---------- табы ---------- */
  function goGame(g) {
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("active", t.dataset.game === g);
    });
    document.querySelectorAll(".panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "game-" + g);
    });
    var panel = document.getElementById("game-" + g);
    if (panel) panel.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
  }
  document.querySelectorAll(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () { goGame(btn.dataset.game); });
  });

  function popResult(el, text) {
    el.textContent = text;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  /* ---------- салют (общий для всех игр) ---------- */
  var scv = document.getElementById("salute");
  var sctx = scv.getContext("2d");
  var SW = 0, SH = 0, parts = [], flashes = [], sOn = false;
  var SCOLORS = ["#ffd66e", "#ff8fb2", "#a78bfa", "#7ef9c6", "#fff"];
  function sResize() { SW = scv.width = window.innerWidth; SH = scv.height = window.innerHeight; }
  window.addEventListener("resize", sResize); sResize();

  function salute(n) {
    if (REDUCED) return;
    n = n || 5;
    var i = 0;
    var timer = setInterval(function () {
      boom(SW * (0.15 + Math.random() * 0.7), SH * (0.2 + Math.random() * 0.35));
      if (++i >= n) clearInterval(timer);
    }, 380);
    if (!sOn) { sOn = true; requestAnimationFrame(sFrame); }
  }
  function boom(x, y) {
    var c = SCOLORS[Math.floor(Math.random() * SCOLORS.length)];
    var count = window.innerWidth < 640 ? 70 : 130;
    for (var k = 0; k < count; k++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 1.2 + Math.random() * 4;
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: 0.008 + Math.random() * 0.008,
        c: Math.random() < 0.3 ? "#ffffff" : c, r: 2.6 + Math.random() * 3 });
    }
    flashes.push({ x: x, y: y, r: 8, life: 1, c: c });
    if (parts.length > 700) parts.splice(0, parts.length - 700);
  }
  function sFrame() {
    // затухание в прозрачность: фон страницы остаётся видимым
    sctx.globalCompositeOperation = "destination-out";
    sctx.fillStyle = "rgba(0,0,0,0.16)";
    sctx.fillRect(0, 0, SW, SH);
    sctx.globalCompositeOperation = "source-over";
    var i, p;
    // вспышки
    for (i = flashes.length - 1; i >= 0; i--) {
      p = flashes[i];
      p.r += 9; p.life -= 0.08;
      if (p.life <= 0) { flashes.splice(i, 1); continue; }
      sctx.globalAlpha = Math.max(0, p.life) * 0.55;
      sctx.fillStyle = p.c;
      sctx.beginPath(); sctx.arc(p.x, p.y, p.r, 0, 7); sctx.fill();
      sctx.globalAlpha = Math.max(0, p.life);
      sctx.lineWidth = 4;
      sctx.strokeStyle = "#ffffff";
      sctx.beginPath(); sctx.arc(p.x, p.y, p.r * 0.7, 0, 7); sctx.stroke();
    }
    // пышные искры: ореол + яркое ядро
    for (i = parts.length - 1; i >= 0; i--) {
      p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.vx *= 0.986; p.vy *= 0.986;
      p.life -= p.decay;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      var a = Math.max(0, p.life);
      sctx.globalAlpha = a * 0.4;
      sctx.fillStyle = p.c;
      sctx.beginPath(); sctx.arc(p.x, p.y, p.r * 2.4, 0, 7); sctx.fill();
      sctx.globalAlpha = a;
      sctx.beginPath(); sctx.arc(p.x, p.y, p.r, 0, 7); sctx.fill();
    }
    sctx.globalAlpha = 1;
    if (parts.length || flashes.length) requestAnimationFrame(sFrame);
    else { sOn = false; sctx.clearRect(0, 0, SW, SH); }
  }

  /* ---------- звук казино (Web Audio API) ---------- */
  var AC = null;
  function audio() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { AC = null; }
    }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }
  function beep(freq, ms, type, gain) {
    var ac = audio();
    if (!ac || REDUCED) return;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.035, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + ms / 1000);
  }
  function winJingle() {
    var notes = [523, 659, 784, 1047, 1319];
    notes.forEach(function (f, i) {
      setTimeout(function () { beep(f, 180, "triangle", 0.07); }, i * 110);
    });
  }

  /* ---------- 1. РУЛЕТКА ---------- */
  var SECTORS = 8;            // 0 = шоколадка, 1..7 = ничего
  var SPIN_TURNS = 5;         // оборотов
  var SPIN_MS = 5200;         // длительность
  var wheel = document.getElementById("wheel");
  var wctx = wheel.getContext("2d");
  var spinBtn = document.getElementById("spinRoulette");
  var resultEl = document.getElementById("rouletteResult");
  var rotation = 0;
  var spinning = false;

  var rouletteNext = document.getElementById("rouletteNext");
  function refreshRouletteBtn() {
    var done = maxed("roulette");
    spinBtn.disabled = done;
    spinBtn.classList.toggle("is-max", done);
    rouletteNext.hidden = !done;
  }
  refreshRouletteBtn();
  rouletteNext.addEventListener("click", function () { goGame(nextGame("roulette")); });

  function sectorColor(i) {
    if (i === 0) return "#ffd66e";
    return i % 2 ? "#3b0f2e" : "#141433";
  }

  function drawWheel(rot) {
    var S = wheel.width, C = S / 2, R = C - 8;
    var step = (Math.PI * 2) / SECTORS;
    wctx.clearRect(0, 0, S, S);
    wctx.save();
    wctx.translate(C, C);
    wctx.rotate((rot * Math.PI) / 180);
    for (var i = 0; i < SECTORS; i++) {
      wctx.beginPath();
      wctx.moveTo(0, 0);
      wctx.arc(0, 0, R, i * step, (i + 1) * step);
      wctx.closePath();
      wctx.fillStyle = sectorColor(i);
      wctx.fill();
      wctx.strokeStyle = "rgba(255,214,110,.7)";
      wctx.lineWidth = 3;
      wctx.stroke();
      wctx.save();
      wctx.rotate(i * step + step / 2);
      wctx.textAlign = "right";
      wctx.fillStyle = i === 0 ? "#3b1d2e" : "#ffe9c8";
      wctx.font = "700 " + (i === 0 ? 34 : 26) + "px Manrope, sans-serif";
      wctx.fillText(i === 0 ? "🍫 Шоколадка" : "Ничего", R - 22, 10);
      wctx.restore();
    }
    wctx.beginPath(); wctx.arc(0, 0, R * 0.16, 0, 7);
    wctx.fillStyle = "#ffd66e"; wctx.fill();
    wctx.lineWidth = 4; wctx.strokeStyle = "#fff"; wctx.stroke();
    wctx.fillStyle = "#3b1d2e";
    wctx.font = "700 40px serif"; wctx.textAlign = "center";
    wctx.fillText("★", 0, 14);
    wctx.restore();
  }

  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

  spinBtn.addEventListener("click", function () {
    if (spinning) return;
    if (maxed("roulette")) return; // лимит: кнопка погасла, жми «Дальше»
    spinning = true;
    spinBtn.disabled = true;
    wheel.classList.add("spinning");
    resultEl.textContent = "";

    var landing = 7 + Math.random() * 31;             // случайная точка внутри сектора
    var need = (((270 - landing - rotation) % 360) + 360) % 360;
    var target = rotation + SPIN_TURNS * 360 + need;
    var from = rotation;
    var t0 = performance.now();
    var dur = REDUCED ? 400 : SPIN_MS;

    function frame(t) {
      var k = Math.min(1, (t - t0) / dur);
      rotation = from + (target - from) * easeOutQuint(k);
      drawWheel(rotation);
      if (k < 1) requestAnimationFrame(frame);
      else {
        rotation = target % 360;
        drawWheel(rotation);
        spinning = false;
        spinBtn.disabled = false;
        wheel.classList.remove("spinning");
        addChoco();
        addWin("roulette");
        if (maxed("roulette")) {
          refreshRouletteBtn();
          popResult(resultEl, "Джекпот! Шоколадка! 🍫 Это максимум — дальше!");
        } else {
          popResult(resultEl, "Джекпот! Шоколадка! 🍫" + countLabel("roulette"));
        }
        salute(6);
        beep(880, 200, "triangle", 0.07);
        setTimeout(winJingle, 250);
      }
    }
    requestAnimationFrame(frame);
  });
  drawWheel(0);

  /* ---------- 2. СЛОТ-МАШИНА ---------- */
  var SYMBOLS = ["🍫", "🍒", "🍋", "7️⃣", "⬜"];
  var machine = document.getElementById("slotMachine");
  var slotBtn = document.getElementById("spinSlots");
  var slotsResult = document.getElementById("slotsResult");
  var reels = [
    document.getElementById("reel0"),
    document.getElementById("reel1"),
    document.getElementById("reel2")
  ];
  var slotSpinning = false;

  var slotsNext = document.getElementById("slotsNext");
  function refreshSlotsBtn() {
    var done = maxed("slots");
    slotBtn.disabled = done;
    slotBtn.classList.toggle("is-max", done);
    slotsNext.hidden = !done;
  }
  refreshSlotsBtn();
  slotsNext.addEventListener("click", function () { goGame(nextGame("slots")); });

  function reelEls() { return reels; }

  slotBtn.addEventListener("click", function () {
    if (slotSpinning) return;
    if (maxed("slots")) return; // лимит: кнопка погасла, жми «Дальше»
    audio();
    slotSpinning = true;
    slotBtn.disabled = true;
    slotsResult.textContent = "";
    machine.classList.remove("jackpot");

    var timers = [];
    reelEls().forEach(function (r) {
      r.parentElement.classList.add("spinning");
      r.parentElement.classList.remove("landed");
      var tm = setInterval(function () {
        r.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        beep(300 + Math.random() * 500, 30, "square", 0.02);
      }, 80);
      timers.push(tm);
    });

    var stops = REDUCED ? [200, 300, 400] : [1300, 1800, 2300];
    reels.forEach(function (r, i) {
      setTimeout(function () {
        clearInterval(timers[i]);
        r.textContent = "🍫"; // всегда три шоколадки
        r.parentElement.classList.remove("spinning");
        r.parentElement.classList.add("landed");
        beep(660, 90, "square", 0.05);
        if (i === 2) {
          slotSpinning = false;
          slotBtn.disabled = false;
          machine.classList.add("jackpot");
          addChoco();
          addWin("slots");
          if (maxed("slots")) {
            refreshSlotsBtn();
            popResult(slotsResult, "Три шоколадки! 🍫🍫🍫 Это максимум — дальше!");
          } else {
            popResult(slotsResult, "Три шоколадки! 🍫🍫🍫" + countLabel("slots"));
          }
          salute(6);
          winJingle();
        }
      }, stops[i]);
    });
  });

  /* ---------- 3. СКРЕТЧ-КАРТА (3 билета, все выигрышные, в зачёт — 2) ---------- */
  var scratchResult = document.getElementById("scratchResult");
  var scratchNext = document.getElementById("scratchNext");

  function refreshScratchNext() {
    scratchNext.hidden = !maxed("scratch");
  }
  function lockTickets() {
    document.querySelectorAll(".ticket").forEach(function (t) {
      if (!t.classList.contains("done")) t.classList.add("locked");
    });
  }
  refreshScratchNext();
  if (maxed("scratch")) lockTickets();
  scratchNext.addEventListener("click", function () { goGame(nextGame("scratch")); });

  function paintSilver(cv) {
    var c = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#c9ccd4");
    g.addColorStop(0.5, "#f2f3f6");
    g.addColorStop(1, "#a9adb8");
    c.globalCompositeOperation = "source-over";
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.strokeStyle = "rgba(255,255,255,.7)";
    c.lineWidth = 3;
    for (var x = -H; x < W + H; x += 34) {
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke();
    }
    c.fillStyle = "rgba(60,50,70,.75)";
    c.font = "700 44px Manrope, sans-serif";
    c.textAlign = "center";
    c.fillText("СОТРИ МЕНЯ ✦", W / 2, H / 2 - 6);
    c.font = "600 30px Manrope, sans-serif";
    c.fillText("пальцем или монеткой", W / 2, H / 2 + 38);
  }

  function erasedPct(cv) {
    var c = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var d = c.getImageData(0, 0, W, H).data;
    var clear = 0, total = 0;
    for (var i = 3; i < d.length; i += 4 * 10) { // каждый 10-й пиксель
      total++;
      if (d[i] < 128) clear++;
    }
    return total ? clear / total : 0;
  }

  document.querySelectorAll(".ticket").forEach(function (ticket) {
    var cv = ticket.querySelector("canvas.scratch");
    var c = cv.getContext("2d");
    var drawing = false;
    var done = false;
    var checkTimer = null;
    paintSilver(cv);

    function pos(ev) {
      var r = cv.getBoundingClientRect();
      return {
        x: (ev.clientX - r.left) * (cv.width / r.width),
        y: (ev.clientY - r.top) * (cv.height / r.height)
      };
    }
    function erase(ev) {
      var p = pos(ev);
      c.globalCompositeOperation = "destination-out";
      c.beginPath();
      c.arc(p.x, p.y, 52, 0, 7); // толстый «палец»
      c.fill();
    }
    cv.addEventListener("pointerdown", function (ev) {
      if (done) return;
      drawing = true;
      try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
      erase(ev);
      ev.preventDefault();
      if (!checkTimer) {
        checkTimer = setInterval(function () {
          if (erasedPct(cv) > 0.6) finishTicket();
        }, 250);
      }
    });
    cv.addEventListener("pointermove", function (ev) {
      if (!drawing || done) return;
      erase(ev);
      ev.preventDefault();
    });
    function stop() {
      drawing = false;
      if (checkTimer && !done) { /* ждём добивки */ }
      if (done && checkTimer) { clearInterval(checkTimer); checkTimer = null; }
      if (!done && erasedPct(cv) > 0.6) finishTicket();
    }
    cv.addEventListener("pointerup", stop);
    cv.addEventListener("pointercancel", stop);

    function finishTicket() {
      if (done) return;
      done = true;
      if (checkTimer) { clearInterval(checkTimer); checkTimer = null; }
      ticket.classList.add("done");
      if (!maxed("scratch")) {
        addChoco();
        addWin("scratch");
        if (maxed("scratch")) {
          refreshScratchNext();
          lockTickets();
          popResult(scratchResult, "Шоколадка! 🍫 Это максимум — дальше!");
        } else {
          popResult(scratchResult, "Шоколадка! 🍫" + countLabel("scratch"));
        }
        salute(5);
        winJingle();
      } else {
        popResult(scratchResult, "Шоколадка! 🍫 Бонусная — уже максимум 😏");
        salute(3);
        beep(880, 200, "triangle", 0.07);
      }
    }
  });

  /* ---------- 4. МОНЕТКА (выбор стороны: выпадает 100% нажатая, выигрывают обе) ---------- */
  var coinEl = document.getElementById("coin");
  var coinStage = document.getElementById("coinStage");
  var headsBtn = document.getElementById("tossHeads");
  var tailsBtn = document.getElementById("tossTails");
  var coinResult = document.getElementById("coinResult");
  var coinRot = 0;
  var flipping = false;

  var coinNext = document.getElementById("coinNext");
  function refreshCoinBtn() {
    var done = maxed("coin");
    headsBtn.disabled = done;
    tailsBtn.disabled = done;
    headsBtn.classList.toggle("is-max", done);
    tailsBtn.classList.toggle("is-max", done);
    coinNext.hidden = !done;
  }
  refreshCoinBtn();
  coinNext.addEventListener("click", function () { goGame(nextGame("coin")); });

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function tossCoin(isHeads) {
    if (flipping) return;
    if (maxed("coin")) return; // лимит: кнопки погасли, жми «Дальше»
    audio();
    flipping = true;
    headsBtn.disabled = true;
    tailsBtn.disabled = true;
    coinResult.textContent = "";

    // выпадает ровно нажатая сторона (лёгкий живой доворот ±5°)
    var landing = (isHeads ? 0 : 180) + (Math.random() * 10 - 5);
    var delta = (((landing - coinRot) % 360) + 360) % 360;
    var target = coinRot + 5 * 360 + delta;
    var from = coinRot;
    var t0 = performance.now();
    var dur = REDUCED ? 400 : 2300;

    coinStage.classList.remove("tossing");
    void coinStage.offsetWidth;
    coinStage.classList.add("tossing");
    beep(440, 120, "sine", 0.05);

    function frame(t) {
      var k = Math.min(1, (t - t0) / dur);
      coinRot = from + (target - from) * easeOutCubic(k);
      coinEl.style.transform = "rotateX(" + coinRot + "deg)";
      if (k < 1) requestAnimationFrame(frame);
      else {
        coinRot = target % 360;
        coinEl.style.transform = "rotateX(" + coinRot + "deg)";
        coinStage.classList.remove("tossing");
        flipping = false;
        headsBtn.disabled = false;
        tailsBtn.disabled = false;
        addChoco();
        addWin("coin");
        if (isHeads) {
          popResult(coinResult, maxed("coin")
            ? "Орёл! Шоколадка! 🍫 Это максимум — дальше!"
            : "Орёл! Шоколадка! 🍫" + countLabel("coin"));
        } else {
          popResult(coinResult, maxed("coin")
            ? "Решка! Тут «Ничего»… шучу — держи шоколадку! 🍫 Это максимум — дальше!"
            : "Решка! Тут «Ничего»… шучу — держи шоколадку! 🍫" + countLabel("coin"));
        }
        if (maxed("coin")) refreshCoinBtn();
        salute(6);
        winJingle();
      }
    }
    requestAnimationFrame(frame);
  }
  headsBtn.addEventListener("click", function () { tossCoin(true); });
  tailsBtn.addEventListener("click", function () { tossCoin(false); });
})();
