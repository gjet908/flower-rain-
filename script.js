(function () {
  "use strict";

  var backLayer = document.getElementById('rain-back');
  var frontLayer = document.getElementById('rain-front');
  var bouquet = document.getElementById('bouquet');

  // The entrance animation (defined in CSS) owns `transform` while it runs.
  // Once it finishes we hand control over to the JS parallax loop below,
  // so the two never fight over the same property.
  var bouquetReady = false;
  if (bouquet) {
    bouquet.addEventListener('animationend', function (e) {
      if (e.animationName === 'bouquet-in') {
        bouquet.style.animation = 'none';
        bouquet.style.opacity = '1';
        bouquet.style.transform = 'translate(0px,0px) rotate(0deg)';
        bouquetReady = true;
      }
    });
  }

  var W = window.innerWidth, H = window.innerHeight;

  var COLORS = [
    ['#f6d9e1', '#e79db0'],  // soft pink
    ['#faf3eb', '#e3d3c5'],  // warm white
    ['#f2e0e5', '#d99cae'],  // muted rose
    ['#f7ecdf', '#d8bd94']   // faint gold-cream
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  // ---------------- petal rain (kept light so it never hides the bouquet/text) ----------------

  var petals = [];

  function buildPetal(container, isFront) {
    var el = document.createElement('div');
    var pair = pick(COLORS);
    var round = Math.random() < 0.4;
    el.className = 'petal' + (round ? ' round' : '') + (!isFront && Math.random() < 0.4 ? ' blurred' : '');
    el.style.background = 'radial-gradient(circle at 35% 30%, ' + pair[0] + ', ' + pair[1] + ' 75%)';
    container.appendChild(el);

    var p = { el: el, front: isFront };
    resetPetal(p, true);
    return p;
  }

  function resetPetal(p, firstRun) {
    var size = p.front ? rand(4, 9) : rand(7, 20);
    p.size = size;
    p.baseX = rand(-10, W + 10);
    p.x = p.baseX;
    p.y = firstRun ? rand(-H, H) : rand(-140, -20);
    p.speed = rand(16, 34) * (size < 10 ? 1.15 : 1);
    p.swayAmp = rand(8, 26);
    p.swayFreq = rand(0.2, 0.55);
    p.phase = rand(0, Math.PI * 2);
    p.rot = rand(0, 360);
    p.rotSpeed = rand(-16, 16);
    p.opacity = p.front ? rand(0.18, 0.32) : rand(0.35, 0.72);
    p.pushX = 0;
    p.pushY = 0;

    p.el.style.width = size + 'px';
    p.el.style.height = size + 'px';
    p.el.style.opacity = p.opacity;
  }

  function createRain() {
    var area = W * H;
    var backCount = Math.max(26, Math.min(55, Math.round(area / 22000)));
    var frontCount = Math.max(6, Math.min(14, Math.round(area / 90000)));

    for (var i = 0; i < backCount; i++) petals.push(buildPetal(backLayer, false));
    for (var j = 0; j < frontCount; j++) petals.push(buildPetal(frontLayer, true));
  }

  // ---------------- pointer interaction ----------------

  var pointer = { x: -9999, y: -9999, active: false };
  var REPEL_RADIUS = 110;

  function setPointer(x, y) { pointer.x = x; pointer.y = y; pointer.active = true; }

  window.addEventListener('mousemove', function (e) { setPointer(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('mouseleave', function () { pointer.active = false; });
  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('touchend', function () { pointer.active = false; });

  // ---------------- subtle bouquet parallax ----------------

  var tilt = { x: 0, y: 0 };
  var tiltTarget = { x: 0, y: 0 };

  function updateTiltTarget() {
    if (!pointer.active) { tiltTarget.x = 0; tiltTarget.y = 0; return; }
    var nx = (pointer.x / W) * 2 - 1; // -1..1
    var ny = (pointer.y / H) * 2 - 1;
    tiltTarget.x = nx * 8;   // max 8px horizontal drift
    tiltTarget.y = ny * 6;   // max 6px vertical drift
  }

  // ---------------- main loop ----------------

  var last = performance.now();

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    updateTiltTarget();
    tilt.x += (tiltTarget.x - tilt.x) * Math.min(1, dt * 2.2);
    tilt.y += (tiltTarget.y - tilt.y) * Math.min(1, dt * 2.2);

    if (bouquet && bouquetReady) {
      bouquet.style.transform =
        'translate(' + tilt.x.toFixed(2) + 'px,' + tilt.y.toFixed(2) + 'px) ' +
        'rotate(' + (tilt.x * 0.12).toFixed(2) + 'deg)';
    }

    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];

      p.y += p.speed * dt;
      p.rot += p.rotSpeed * dt;

      var sway = Math.sin(now * 0.001 * p.swayFreq + p.phase) * p.swayAmp;
      var targetX = p.baseX + sway;

      var pushX = 0, pushY = 0;
      if (pointer.active) {
        var dx = targetX - pointer.x;
        var dy = p.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.01) {
          var force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          force = force * force * 34;
          pushX = (dx / dist) * force;
          pushY = (dy / dist) * force * 0.35;
        }
      }

      p.pushX += (pushX - p.pushX) * Math.min(1, dt * 6);
      p.pushY += (pushY - p.pushY) * Math.min(1, dt * 6);

      p.x = targetX + p.pushX;
      var y = p.y + p.pushY;

      p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + p.rot.toFixed(1) + 'deg)';

      if (p.y > H + 40) resetPetal(p, false);
    }

    requestAnimationFrame(frame);
  }

  function handleResize() {
    W = window.innerWidth;
    H = window.innerHeight;
  }

  window.addEventListener('resize', handleResize);

  createRain();
  requestAnimationFrame(frame);

})();
