// ===== congrats.js — печать по буквам + салют (чистый canvas) =====
(function () {
  "use strict";
  var TEXT = "С днём рождения, Вика! 🎉\nСегодня твой день. Официально...\n\nС днём рождения викчк лапчк пятчк! Сегодня твой день. Официально. Можешь делать что хочешь: украсть у меня всех котят, задепать всю квартиру в казик, вот кстати промик сочный(VIKA-VIKA-VIKA), притворяться что ты с белоруси и тебе 16. Всё можно. Даже бесплатное желание даю.\n\nХочу сказать тебе несколько важных вещей. Во-первых, ты классная. Не потому что день рождения, а вообще прост факт. Во-вторых, ты умеешь делать мир вокруг себя лучше, даже когда сама этого не замечаешь. В-третьих, с тобой очень интересно и спокойно. Это редкость, между прочим.\n\nЖелаю тебе в этом году:\n- чтобы всё, что ты планируешь, сбывалось\n- чтобы люди вокруг были нормальные\n- чтобы еда всегда была вкусной и разнообразной(признак богатства)\n- миллион миллиардов денег\n- чтобы сон был крепким и без кошмаров\n- чтобы ты меньше переживала по пустякам\n- и чтобы у тебя всегда был заряд на телефоне!!!\n- ну и любви конешн и тонну счастья\n\nА ещё желаю тебе побольше моментов, когда ты просто сидишь и думаешь: \"Блин, как же хорошо\". Вот таких моментов. Чтобы их было много. И чтобы ты их замечала.\n\nСпасибо, что ты есть. Серьёзно. Своим появлением ты делаешь мою жизнь лучше просто тем, что ты в ней есть. Это не громкие слова, это правда\n\nС днём рождения, Вика. Будь счастлива. И ешь торт. Ты заслужила";
  var el = document.getElementById("typed");
  var cv = document.getElementById("fireworks");
  var ctx = cv.getContext("2d");
  var W, H, parts = [], rockets = [];
  var started = false;

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  window.addEventListener("resize", resize); resize();

  // 1. печать по одной букве
  var i = 0;
  function type() {
    if (i <= TEXT.length) {
      el.textContent = TEXT.slice(0, i) + (i < TEXT.length ? "▌" : "");
      i++;
      setTimeout(type, TEXT[i - 1] === "\n" ? 70 : TEXT[i - 1] === " " ? 28 : 36);
    } else {
      el.textContent = TEXT;
      launchSalute();
    }
  }

  // 2. салют
  function boom(x, y) {
    var colors = ["#ffd66e", "#ff8fb2", "#a78bfa", "#7ef9c6", "#fff"];
    var c = colors[Math.floor(Math.random() * colors.length)];
    for (var k = 0; k < 70; k++) {
      var a = (Math.PI * 2 * k) / 70 + Math.random() * 0.3;
      var sp = 1.5 + Math.random() * 3.5;
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: c });
    }
  }
  function launchSalute() {
    if (started) return; started = true;
    // 5 залпов подряд
    var n = 0;
    var timer = setInterval(function () {
      boom(W * (0.15 + Math.random() * 0.7), H * (0.2 + Math.random() * 0.35));
      if (++n >= 6) clearInterval(timer);
    }, 450);
    requestAnimationFrame(frame);
  }
  function frame() {
    ctx.fillStyle = "rgba(10,5,25,0.22)";
    ctx.fillRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.vx *= 0.985; p.vy *= 0.985;
      p.life -= 0.012;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (parts.length || !started) requestAnimationFrame(frame);
    else {
      setTimeout(function () { started = false; launchSalute(); }, 2500);
    }
  }

  type();
})();
