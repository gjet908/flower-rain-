
(function(){
  "use strict";

  var shower = document.getElementById('shower');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = window.innerWidth, H = window.innerHeight;

  var COLORS = [
    ['#f6d4dd', '#e79fb2'],   // soft pink
    ['#f3e3d8', '#e6bfa4'],   // blush
    ['#fbf6ee', '#e9dccb'],   // white / cream
    ['#f2e9da', '#dcc6a3'],   // cream
    ['#e6d7ec', '#c9a9d9'],   // subtle lavender
    ['#fbf1ee', '#eec2cf']    // pale rose
  ];

  var SHAPES = ['petal', 'blossom', 'rose'];

  function rand(a, b){ return a + Math.random() * (b - a); }
  function pick(arr){ return arr[(Math.random() * arr.length) | 0]; }

  // ---- flower count scaled to viewport / device, target 100-150 on desktop ----
  function targetCount(){
    var area = W * H;
    var n = Math.round(area / 8500);
    return Math.max(60, Math.min(150, n));
  }

  var flowers = [];

  function makeFlowerEl(sizeTier){
    var el = document.createElement('div');
    var shape = sizeTier === 'tiny' ? 'petal' : pick(SHAPES);
    el.className = 'bloom ' + shape;
    var pair = pick(COLORS);
    el.style.background = 'radial-gradient(circle at 35% 30%, ' + pair[0] + ', ' + pair[1] + ' 75%)';
    shower.appendChild(el);
    return el;
  }

  function sizeForTier(tier){
    switch(tier){
      case 'tiny': return rand(5, 9);
      case 'small': return rand(10, 17);
      case 'medium': return rand(18, 28);
      default: return rand(32, 48); // large
    }
  }

  function pickTier(){
    var r = Math.random();
    if (r < 0.32) return 'tiny';
    if (r < 0.66) return 'small';
    if (r < 0.92) return 'medium';
    return 'large';
  }

  function initFlower(f, firstRun){
    var tier = pickTier();
    var size = sizeForTier(tier);
    var layer = tier === 'tiny' || tier === 'small' ? (Math.random() < 0.55 ? 'back' : 'mid') : (Math.random() < 0.3 ? 'mid' : 'front');

    f.tier = tier;
    f.size = size;
    f.baseX = rand(-20, W + 20);
    f.x = f.baseX;
    f.y = firstRun ? rand(-H, 0) : rand(-160, -20);
    f.speed = layer === 'back' ? rand(18, 34) : layer === 'mid' ? rand(30, 52) : rand(46, 78);
    f.speed *= size < 12 ? 1.15 : 1; // tiny petals drift a touch faster relatively
    f.swayAmp = rand(10, 38) * (size > 30 ? 1.3 : 1);
    f.swayFreq = rand(0.25, 0.7);
    f.phase = rand(0, Math.PI * 2);
    f.rot = rand(0, 360);
    f.rotSpeed = rand(-24, 24);
    f.opacity = layer === 'back' ? rand(0.35, 0.55) : layer === 'mid' ? rand(0.55, 0.8) : rand(0.75, 0.95);
    f.layer = layer;
    f.pushX = 0;
    f.pushY = 0;

    var el = f.el;
    el.className = 'bloom ' + f.shape + (layer === 'back' ? ' layer-back' : layer === 'mid' ? ' layer-mid' : '');
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.opacity = f.opacity;
    el.style.zIndex = layer === 'back' ? 1 : layer === 'mid' ? 2 : 3;
  }

  function createFlowers(){
    var n = targetCount();
    for (var i = 0; i < n; i++){
      var tier = pickTier();
      var shape = tier === 'tiny' ? 'petal' : pick(SHAPES);
      var el = document.createElement('div');
      var pair = pick(COLORS);
      el.style.background = 'radial-gradient(circle at 35% 30%, ' + pair[0] + ', ' + pair[1] + ' 75%)';
      shower.appendChild(el);

      var f = { el: el, shape: shape };
      initFlower(f, true);
      flowers.push(f);
    }
  }

  // ---- pointer interaction ----
  var pointer = { x: -9999, y: -9999, active: false };
  var REPEL_RADIUS = 130;

  function onPointerMove(x, y){
    pointer.x = x; pointer.y = y; pointer.active = true;
  }

  window.addEventListener('mousemove', function(e){ onPointerMove(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('mouseleave', function(){ pointer.active = false; });
  window.addEventListener('touchmove', function(e){
    if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('touchend', function(){ pointer.active = false; });

  // ---- background dust particles on canvas ----
  var canvas = document.getElementById('dust');
  var ctx = canvas.getContext('2d');
  var dust = [];

  function initDust(){
    canvas.width = W;
    canvas.height = H;
    var n = Math.max(24, Math.min(60, Math.round((W * H) / 26000)));
    dust = [];
    for (var i = 0; i < n; i++){
      dust.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.5, 1.8),
        a: rand(0.15, 0.5),
        vy: rand(-4, -10) / 60,
        vx: rand(-3, 3) / 60,
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  function drawDust(t){
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f6ecdd';
    for (var i = 0; i < dust.length; i++){
      var d = dust[i];
      d.y += d.vy;
      d.x += d.vx + Math.sin(t * 0.0006 + d.phase) * 0.05;

      if (pointer.active){
        var dx = d.x - pointer.x, dy = d.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist > 0.01){
          var f = (90 - dist) / 90 * 0.6;
          d.x += (dx / dist) * f;
          d.y += (dy / dist) * f;
        }
      }

      if (d.y < -10) { d.y = H + 10; d.x = rand(0, W); }
      if (d.x < -10) d.x = W + 10;
      if (d.x > W + 10) d.x = -10;

      ctx.globalAlpha = d.a * (0.7 + 0.3 * Math.sin(t * 0.001 + d.phase));
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---- main animation loop ----
  var last = performance.now();

  function frame(now){
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    drawDust(now);

    for (var i = 0; i < flowers.length; i++){
      var f = flowers[i];

      f.y += f.speed * dt;
      f.rot += f.rotSpeed * dt;

      var sway = Math.sin(now * 0.001 * f.swayFreq + f.phase) * f.swayAmp;
      var targetX = f.baseX + sway;

      // pointer repulsion (recomputed each frame -> smoothly releases)
      var pushX = 0, pushY = 0;
      if (pointer.active){
        var dx = targetX - pointer.x;
        var dy = f.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.01){
          var force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          force = force * force * 46;
          pushX = (dx / dist) * force;
          pushY = (dy / dist) * force * 0.4;
        }
      }

      // ease current push toward target push for smoothness
      f.pushX += (pushX - f.pushX) * Math.min(1, dt * 6);
      f.pushY += (pushY - f.pushY) * Math.min(1, dt * 6);

      f.x = targetX + f.pushX;
      var y = f.y + f.pushY;

      f.el.style.transform = 'translate3d(' + f.x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + f.rot.toFixed(1) + 'deg)';

      if (f.y > H + 60){
        initFlower(f, false);
      }
    }

    requestAnimationFrame(frame);
  }

  function handleResize(){
    W = window.innerWidth;
    H = window.innerHeight;
    initDust();
  }

  window.addEventListener('resize', handleResize);

  createFlowers();
  initDust();
  requestAnimationFrame(frame);

})();
