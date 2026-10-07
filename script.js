// ===== script.js — вся логика сайта-подарка (чистый JS, без бэкенда) =====
(function () {
  "use strict";

  var hasData = typeof DATA !== "undefined";
  var START = hasData ? new Date(DATA.startDate) : new Date("2026-09-19T00:00:00");
  var BDAY_MONTH = hasData ? DATA.birthdayMonth : 10; // 1-12
  var BDAY_DAY = hasData ? DATA.birthdayDay : 10;

  var LS = { last: "vika_last", streak: "vika_streak", compl: "vika_compl_count", lastCompl: "vika_compl_last", unlocked: "vika_unlocked" };

  function $(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function plural(n, f) {
    n = Math.abs(n) % 100; var d = n % 10;
    if (n > 10 && n < 20) return f[2];
    if (d > 1 && d < 5) return f[1];
    if (d === 1) return f[0];
    return f[2];
  }
  function dayKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function mmdd(d) { return pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function getLS(k, fb) { try { var v = localStorage.getItem(k); return v === null ? fb : v; } catch (e) { return fb; } }
  function setLS(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];

  /* ---------- 5. ФОН ПО ВРЕМЕНИ СУТОК ---------- */
  function applyPeriod(d) {
    d = d || new Date();
    var h = d.getHours(), p;
    if (h >= 5 && h < 11) p = "morning";
    else if (h >= 11 && h < 18) p = "day";
    else if (h >= 18 && h < 23) p = "evening";
    else p = "night";
    document.body.dataset.period = p;
    return p;
  }

  /* ---------- 1. ТАЙМЕР ---------- */
  var mode = "birthday"; // 'birthday' | 'together'
  var manual = false;

  function nextBirthday(from) {
    var y = from.getFullYear();
    var t = new Date(y, BDAY_MONTH - 1, BDAY_DAY, 0, 0, 0);
    // если ДР был больше суток назад — целимся в следующий год
    if (from - t > 24 * 3600 * 1000) t = new Date(y + 1, BDAY_MONTH - 1, BDAY_DAY, 0, 0, 0);
    return t;
  }

  function setNum(id, val) {
    var el = $(id);
    if (!el || el.textContent === val) return;
    el.textContent = val;
    el.classList.remove("flip");
    void el.offsetWidth; // перезапуск анимации
    el.classList.add("flip");
  }

  function tick() {
    var now = new Date();
    var target = nextBirthday(now);
    var msLeft = target - now;
    if (msLeft < 0) msLeft = 0;

    // автопереключение: меньше 14 дней до ДР — режим ДР
    if (!manual) {
      var daysLeftAuto = Math.ceil(msLeft / 86400000);
      mode = daysLeftAuto < 14 ? "birthday" : "together";
      syncToggle();
    }

    var pill = $("timerMode"), title = $("timerTitle"), sub = $("timerSub");
    var pl = $("progressLabel"), pp = $("progressPct"), pf = $("progressFill");

    if (mode === "birthday") {
      var d = Math.floor(msLeft / 86400000),
          h = Math.floor(msLeft / 3600000) % 24,
          m = Math.floor(msLeft / 60000) % 60,
          s = Math.floor(msLeft / 1000) % 60;
      setNum("numDays", pad(d)); setNum("numHours", pad(h));
      setNum("numMins", pad(m)); setNum("numSecs", pad(s));
      if (pill) pill.textContent = "⏳ до дня рождения";
      if (title) title.textContent = msLeft <= 0 ? "Сегодня твой день!" : "До твоего дня осталось совсем чуть-чуть";
      if (sub) sub.textContent = msLeft <= 0 ? "ура — дождались" : "каждая секунда — ближе к празднику";
      var total = target - START, done = now - START;
      var pct = Math.max(0, Math.min(100, (done / total) * 100));
      if (pl) pl.textContent = "до 10 октября";
      if (pp) pp.textContent = Math.floor(pct) + "%";
      if (pf) pf.style.width = pct + "%";
    } else {
      var diff = now - START;
      if (diff < 0) diff = 0;
      var td = Math.floor(diff / 86400000),
          th = Math.floor(diff / 3600000) % 24,
          tm = Math.floor(diff / 60000) % 60,
          ts = Math.floor(diff / 1000) % 60;
      setNum("numDays", pad(td)); setNum("numHours", pad(th));
      setNum("numMins", pad(tm)); setNum("numSecs", pad(ts));
      if (pill) pill.textContent = "💛 мы знакомы";
      if (title) title.textContent = "Мы знакомы уже " + td + " " + plural(td, ["день", "дня", "дней"]);
      if (sub) sub.textContent = "с 19 сентября — и это только начало";
      var pct2 = Math.min(100, (td / 30) * 100);
      if (pl) pl.textContent = "с 19 сентября";
      if (pp) pp.textContent = td + " " + plural(td, ["день", "дня", "дней"]);
      if (pf) pf.style.width = pct2 + "%";
    }

    // верхняя плашка
    var togetherDays = Math.max(0, Math.floor((now - START) / 86400000));
    var leftDays = Math.max(0, Math.ceil(msLeft / 86400000));
    var badge = $("topBadgeText");
    if (badge) {
      badge.textContent = msLeft <= 0
        ? "🎉 сегодня твой день! • мы знакомы " + togetherDays + " " + plural(togetherDays, ["день", "дня", "дней"])
        : "мы знакомы " + togetherDays + " " + plural(togetherDays, ["день", "дня", "дней"]) + " • до дня рождения " + leftDays + " " + plural(leftDays, ["день", "дня", "дней"]);
    }
    checkUnlock(now);
  }

  function syncToggle() {
    var a = $("btnTogether"), b = $("btnBirthday");
    if (!a || !b) return;
    a.classList.toggle("active", mode === "together");
    b.classList.toggle("active", mode === "birthday");
  }

  /* ---------- 3. ФРАЗА ДНЯ (по кругу) ---------- */
  function applyPhrase() {
    if (!hasData || !DATA.dailyPhrases || !DATA.dailyPhrases.length) return;
    var list = DATA.dailyPhrases;
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var s = new Date(START); s.setHours(0, 0, 0, 0);
    var n = Math.floor((t - s) / 86400000);
    if (n < 0) n = 0;
    var idx = n % list.length;
    var el = $("dailyPhrase");
    if (el) el.textContent = "«" + list[idx] + "»";
    var hint = $("phraseHint");
    if (hint) hint.textContent = "день " + (n + 1) + " из " + list.length + " • обновляется в полночь";
  }

  /* ---------- визиты (localStorage) ---------- */
  function trackVisit() {
    var now = new Date();
    var today = dayKey(now);
    var y = new Date(now); y.setDate(y.getDate() - 1);
    var yesterday = dayKey(y);
    var last = getLS(LS.last, null);
    var streak = parseInt(getLS(LS.streak, "0"), 10) || 0;
    var type = "first", gap = null;

    if (last === today) {
      type = "returned";
    } else if (last === null) {
      type = "first"; streak = 1;
    } else if (last === yesterday) {
      type = "first"; streak = streak + 1;
    } else {
      var p = last.split("-").map(Number);
      var lastDate = new Date(p[0], p[1] - 1, p[2]);
      var t0 = new Date(now); t0.setHours(0, 0, 0, 0);
      gap = Math.round((t0 - lastDate) / 86400000);
      if (gap >= 3) { type = "missed"; streak = 1; }
      else { type = "first"; streak = 1; }
    }
    if (last !== today) { setLS(LS.last, today); setLS(LS.streak, String(streak)); }
    return { type: type, streak: streak, gap: gap };
  }

  /* ---------- 2. ПОГОДА ДНЯ ---------- */
  // Приоритет: overrides → личные даты → серия/пропуск → время суток → пн/сб → визиты → остальные дни недели → дефолт
  function getWeather(now, visit) {
    var W = hasData ? DATA.weather : null;
    if (!W) return { emoji: "🌤️", text: "Обычный день", src: "авто-прогноз" };
    var key = mmdd(now);

    if (typeof OVERRIDES !== "undefined" && OVERRIDES && OVERRIDES[key]) {
      return { emoji: OVERRIDES[key].emoji, text: OVERRIDES[key].text, src: "ручной прогноз" };
    }
    var mo = now.getMonth(), dy = now.getDate();
    if (mo === BDAY_MONTH - 1 && dy === BDAY_DAY) return ext(W.birthday, "твой день");
    if (mo === 2 && dy === 8) return ext(W.march8, "8 марта");
    if (mo === 1 && dy === 14) return ext(W.feb14, "14 февраля");
    if (mo === 0 && dy === 1) return ext(W.jan1, "1 января");

    if (visit.streak >= 5) return ext(W.streak, visit.streak + " дней подряд");
    if (visit.type === "missed") return ext(W.missed, "пауза " + visit.gap + " дн.");

    var h = now.getHours();
    if (h < 7) return ext(W.earlyMorning, "раннее утро");
    if (h >= 23) return ext(W.lateNight, "глубокая ночь");

    var dow = now.getDay();
    if (dow === 1 || dow === 6) return ext(W.weekday[dow], WEEKDAYS[dow]);

    if (visit.type === "returned") return ext(W.returned, "повторный визит");
    if (visit.type === "first" && dayKey(now) !== dayKey(START)) {
      // первый заход за день показываем только если сегодня уже виделись? нет — показываем как тёплую встречу,
      // но только когда нет яркого weekday-повода (чтобы пн/сб не терялись)
    }
    if (W.weekday && W.weekday[dow]) return ext(W.weekday[dow], WEEKDAYS[dow]);
    if (visit.type === "first") return ext(W.firstVisit, "первый визит за день");
    return ext(W.def, "авто-прогноз");
  }
  function ext(o, src) { return { emoji: o.emoji, text: o.text, src: src || "авто-прогноз" }; }

  function applyWeather(visit) {
    var now = new Date();
    var w = getWeather(now, visit);
    if ($("weatherEmoji")) $("weatherEmoji").textContent = w.emoji;
    if ($("weatherText")) $("weatherText").textContent = w.text;
    if ($("weatherHint")) $("weatherHint").textContent = WEEKDAYS[now.getDay()] + " • " + w.src;
  }

  /* ---------- 4. КОМПЛИМЕНТЫ ---------- */
  function initCompliments() {
    var btn = $("complimentBtn"), txt = $("complimentText"), cnt = $("complimentCount");
    if (!btn || !hasData) return;
    var n = parseInt(getLS(LS.compl, "0"), 10) || 0;
    if (cnt) cnt.textContent = n;
    btn.addEventListener("click", function () {
      var list = DATA.compliments;
      if (!list || !list.length) return;
      var last = parseInt(getLS(LS.lastCompl, "-1"), 10);
      var i, guard = 0;
      do { i = Math.floor(Math.random() * list.length); guard++; } while (list.length > 1 && i === last && guard < 10);
      setLS(LS.lastCompl, String(i));
      if (txt) {
        txt.textContent = list[i];
        txt.classList.remove("pop"); void txt.offsetWidth; txt.classList.add("pop");
      }
      n++;
      setLS(LS.compl, String(n));
      if (cnt) {
        cnt.textContent = n;
        cnt.classList.remove("bump"); void cnt.offsetWidth; cnt.classList.add("bump");
      }
    });
  }

  /* ---------- 7. ЧАСТИЦЫ ---------- */
  function initParticles() {
    var cv = $("particles");
    if (!cv) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ctx = cv.getContext("2d");
    var P = [], W = 0, H = 0;
    var SHAPES = ["♡", "✦", "✧", "♥"];
    var COLORS = ["255,255,255", "255,214,110", "255,143,178", "167,139,250"];
    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    function spawn(n) {
      P = [];
      for (var i = 0; i < n; i++) {
        P.push({
          x: Math.random() * W, y: Math.random() * H,
          s: 9 + Math.random() * 13,
          v: 0.15 + Math.random() * 0.45,
          ph: Math.random() * Math.PI * 2,
          ch: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
          a: 0.18 + Math.random() * 0.3
        });
      }
    }
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.y -= p.v;
        p.x += Math.sin(t / 1600 + p.ph) * 0.25;
        if (p.y < -24) { p.y = H + 24; p.x = Math.random() * W; }
        ctx.globalAlpha = p.a;
        ctx.font = p.s + "px serif";
        ctx.fillStyle = "rgba(" + p.c + ",1)";
        ctx.fillText(p.ch, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    resize();
    spawn(window.innerWidth < 640 ? 26 : 44);
    window.addEventListener("resize", function () { resize(); spawn(window.innerWidth < 640 ? 26 : 44); });
    requestAnimationFrame(frame);
  }

  /* ---------- 8. СЕКРЕТНАЯ КНОПКА ---------- */
  function checkUnlock(now) {
    now = now || new Date();
    var forced = /[?&]party=1/.test(location.search);
    var saved = getLS(LS.unlocked, "0") === "1";
    var bday = new Date(now.getFullYear(), BDAY_MONTH - 1, BDAY_DAY, 0, 0, 0);
    var debug = new Date(2026, 9, 7); // DEBUG: показать сразу для просмотра
    var isOpen = forced || saved || now >= debug || now >= bday;
    if (isOpen && !saved) setLS(LS.unlocked, "1");
    var sec = $("congratsSection"), hint = $("congratsHint");
    if (!sec) return;
    sec.hidden = !isOpen;
    if (hint) hint.style.display = isOpen ? "none" : "";
  }

  /* ---------- init ---------- */
  function init() {
    applyPeriod();
    setInterval(applyPeriod, 60000);
    var visit = trackVisit();
    applyPhrase();
    applyWeather(visit);
    initCompliments();
    initParticles();
    var a = $("btnTogether"), b = $("btnBirthday");
    if (a) a.addEventListener("click", function () { mode = "together"; manual = true; syncToggle(); tick(); });
    if (b) b.addEventListener("click", function () { mode = "birthday"; manual = true; syncToggle(); tick(); });
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
