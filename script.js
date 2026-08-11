
/* ==========================================================
   FOR YOU — script.js
   1. Configuration
   2. DOM references
   3. SVG flower creation
   4. Bouquet creation
   5. Bloom animations
   6. Petal system
   7. Mouse parallax
   8. Flower interaction
   9. Text reveal
   10. Final scene
   11. Responsive behaviour
   ========================================================== */

(function () {
  "use strict";

  /* ===================== 1. CONFIGURATION ===================== */

  const girlName = "FALAK";

  const introText = "A little something\u2026";
  const introText2 = "just for you.";

  const finalMessages = [
    "Because some people deserve flowers.",
    "Just because they are them."
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;

  const COLORS = {
    petals: ["#C77A8B", "#E8A9B8", "#FFF4E8"],
    gold: "#D8B878"
  };

  const TIMELINE = {
    stemsAt: 1900,
    leavesAt: 3400,
    firstBudAt: 4200,
    bloomStart: 5000,
    bloomStep: 480,
    settleAt: 10200,
    introAt: 10600,
    intro2At: 12100,
    darkenAt: 15600,
    forYouAt: 16400,
    nameStartAt: 18400,
    letterStep: 150,
    finalMsgGapAfterName: 1300,
    hintDelayAfterMsg2: 1800
  };

  const svgNS = "http://www.w3.org/2000/svg";

  /* ===================== 2. DOM REFERENCES ===================== */

  const bouquetSvg = document.getElementById("bouquet");
  const stemsLayer = document.getElementById("stems-layer");
  const leavesLayer = document.getElementById("leaves-layer");
  const flowersLayer = document.getElementById("flowers-layer");
  const bouquetWrap = document.getElementById("bouquet-wrap");

  const particlesLayer = document.getElementById("particles");
  const starsCanvas = document.getElementById("stars");
  const petalRainLayer = document.getElementById("petal-rain");
  const darkenOverlay = document.getElementById("darken-overlay");

  const introLineEl = document.getElementById("intro-line");
  const introLine2El = document.getElementById("intro-line-2");
  const forYouEl = document.getElementById("for-you");
  const nameEl = document.getElementById("name-reveal");
  const finalMsg1El = document.getElementById("final-msg-1");
  const finalMsg2El = document.getElementById("final-msg-2");
  const hintEl = document.getElementById("hint-text");

  const musicControl = document.getElementById("music-control");
  const musicIcon = document.getElementById("music-icon");
  const audioEl = document.getElementById("bg-audio");

  finalMsg1El.textContent = finalMessages[0] || "";
  finalMsg2El.textContent = finalMessages[1] || "";
  introLineEl.textContent = introText;
  introLine2El.textContent = introText2;

  /* ===================== 3. SVG FLOWER CREATION ===================== */

  function el(tag, attrs) {
    const node = document.createElementNS(svgNS, tag);
    if (attrs) {
      for (const k in attrs) node.setAttribute(k, attrs[k]);
    }
    return node;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function petalPath(length, width, curve) {
    const hw = width / 2;
    return (
      "M0,0 " +
      "C " + (-hw) + "," + (-length * 0.26) + " " + (-hw * curve) + "," + (-length * 0.72) + " 0," + (-length) + " " +
      "C " + (hw * curve) + "," + (-length * 0.72) + " " + hw + "," + (-length * 0.26) + " 0,0 Z"
    );
  }

  function addPetalLayer(parent, opts) {
    const {
      count, length, width, gradientId, radiusOffset,
      rotationOffset = 0, curve = 0.75, jitter = 8
    } = opts;

    for (let i = 0; i < count; i++) {
      const baseAngle = (360 / count) * i + rotationOffset;
      const angle = baseAngle + rand(-jitter, jitter);
      const len = length * rand(0.88, 1.12);
      const wid = width * rand(0.82, 1.18);
      const c = curve * rand(0.85, 1.1);
      const p = el("path", {
        d: petalPath(len, wid, c),
        fill: "url(#" + gradientId + ")",
        class: "petal-shape",
        transform: "rotate(" + angle.toFixed(2) + ") translate(0," + (-radiusOffset) + ")"
      });
      parent.appendChild(p);
    }
  }

  function addSepals(parent, size) {
    const g = el("g", { opacity: 0.9 });
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + rand(-6, 6) + 90;
      const p = el("path", {
        d: petalPath(size * 0.42, size * 0.22, 0.5),
        fill: "url(#leafGrad)",
        transform: "rotate(" + angle.toFixed(2) + ") translate(0," + (size * 0.12) + ")",
        opacity: "0.85"
      });
      g.appendChild(p);
    }
    parent.appendChild(g);
  }

  function paletteFor(name) {
    if (name === "rose") return { outer: "petalRose", mid: "petalRose", inner: "petalBlush" };
    if (name === "blush") return { outer: "petalBlush", mid: "petalBlush", inner: "petalIvory" };
    return { outer: "petalIvory", mid: "petalBlush", inner: "petalIvory" };
  }

  function createFlower(cx, cy, size, type, paletteName, delayMs) {
    const palette = paletteFor(paletteName);
    const g = el("g", {
      class: "flower",
      transform: "translate(" + cx + "," + cy + ")",
      "data-delay": delayMs
    });
    g.style.transitionDelay = "0s";

    const inner = el("g", { class: "flower-inner" });

    if (type === "large") {
      addSepals(inner, size);
      addPetalLayer(inner, { count: 8, length: size * 0.92, width: size * 0.56, gradientId: palette.outer, radiusOffset: size * 0.14, curve: 0.78, jitter: 7 });
      addPetalLayer(inner, { count: 6, length: size * 0.62, width: size * 0.4, gradientId: palette.mid, radiusOffset: size * 0.06, rotationOffset: 28, curve: 0.7, jitter: 9 });
      addPetalLayer(inner, { count: 5, length: size * 0.3, width: size * 0.22, gradientId: palette.inner, radiusOffset: size * 0.01, rotationOffset: 12, curve: 0.6, jitter: 10 });
      const center = el("circle", { r: size * 0.09, fill: "url(#flowerCenter)" });
      inner.appendChild(center);
      const dotCount = 6;
      for (let i = 0; i < dotCount; i++) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0, size * 0.06);
        const dot = el("circle", {
          cx: Math.cos(a) * r, cy: Math.sin(a) * r,
          r: rand(1.1, 2), class: "flower-center-dot"
        });
        inner.appendChild(dot);
      }
    } else if (type === "soft") {
      addSepals(inner, size * 0.8);
      addPetalLayer(inner, { count: 9, length: size * 0.78, width: size * 0.5, gradientId: palette.outer, radiusOffset: size * 0.08, curve: 0.55, jitter: 6 });
      addPetalLayer(inner, { count: 6, length: size * 0.4, width: size * 0.3, gradientId: palette.inner, radiusOffset: size * 0.02, rotationOffset: 20, curve: 0.5, jitter: 9 });
      const center = el("circle", { r: size * 0.07, fill: "url(#flowerCenter)" });
      inner.appendChild(center);
      for (let i = 0; i < 5; i++) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0, size * 0.045);
        inner.appendChild(el("circle", { cx: Math.cos(a) * r, cy: Math.sin(a) * r, r: rand(1, 1.8), class: "flower-center-dot" }));
      }
    } else if (type === "small") {
      addPetalLayer(inner, { count: 6, length: size * 0.85, width: size * 0.6, gradientId: palette.outer, radiusOffset: size * 0.08, curve: 0.7, jitter: 8 });
      const center = el("circle", { r: size * 0.16, fill: "url(#flowerCenter)" });
      inner.appendChild(center);
    } else if (type === "bud") {
      const bud = el("path", {
        d: petalPath(size, size * 0.62, 0.9),
        fill: "url(#" + palette.outer + ")"
      });
      inner.appendChild(bud);
      const calyx = el("path", {
        d: petalPath(size * 0.5, size * 0.5, 0.5),
        fill: "url(#leafGrad)",
        transform: "translate(0," + size * 0.35 + ")"
      });
      inner.appendChild(calyx);
    }

    g.appendChild(inner);

    g.addEventListener("mouseenter", () => g.classList.add("hovered"));
    g.addEventListener("mouseleave", () => g.classList.remove("hovered"));
    g.addEventListener("click", (e) => burstAt(e.clientX, e.clientY));
    g.addEventListener("touchstart", () => {
      g.classList.add("hovered");
      setTimeout(() => g.classList.remove("hovered"), 900);
    }, { passive: true });

    return g;
  }

  function createStem(cx, cy, size) {
    const baseX = 400 + (cx - 400) * 0.18 + rand(-14, 14);
    const baseY = 900;
    const endX = cx;
    const endY = cy + size * 0.75;
    const midX = (baseX + endX) / 2 + (cx - 400) * 0.12;
    const midY = (baseY + endY) / 2 + 30;
    const d = "M" + baseX + "," + baseY + " Q" + midX + "," + midY + " " + endX + "," + endY;
    return el("path", { d: d, class: "stem" });
  }

  function createLeaf(x, y, length, width, angleDeg) {
    const d = (
      "M0,0 C " + (width * 0.62) + "," + (-length * 0.24) + " " + (width * 0.5) + "," + (-length * 0.78) + " 0," + (-length) + " " +
      "C " + (-width * 0.5) + "," + (-length * 0.78) + " " + (-width * 0.62) + "," + (-length * 0.24) + " 0,0 Z"
    );
    const g = el("g", { class: "leaf", transform: "translate(" + x + "," + y + ") rotate(" + angleDeg + ")" });
    const shape = el("path", { d: d });
    const vein = el("path", { d: "M0,-3 L0," + (-length + 5), class: "leaf-vein" });
    g.appendChild(shape);
    g.appendChild(vein);
    return g;
  }

  /* ===================== 4. BOUQUET CREATION ===================== */

  const flowerSpecs = [
    // large (3)
    { x: 400, y: 300, size: 128, type: "large", palette: "rose" },
    { x: 296, y: 392, size: 100, type: "large", palette: "blush" },
    { x: 504, y: 380, size: 96, type: "large", palette: "rose" },

    // medium (5)
    { x: 236, y: 486, size: 74, type: "soft", palette: "blush" },
    { x: 562, y: 470, size: 70, type: "soft", palette: "rose" },
    { x: 336, y: 226, size: 62, type: "soft", palette: "ivory" },
    { x: 470, y: 214, size: 60, type: "large", palette: "rose" },
    { x: 400, y: 512, size: 66, type: "soft", palette: "blush" },

    // small fillers (6)
    { x: 190, y: 430, size: 36, type: "small", palette: "ivory" },
    { x: 606, y: 410, size: 34, type: "small", palette: "blush" },
    { x: 268, y: 300, size: 30, type: "small", palette: "rose" },
    { x: 540, y: 300, size: 32, type: "small", palette: "ivory" },
    { x: 400, y: 190, size: 28, type: "small", palette: "blush" },
    { x: 430, y: 470, size: 30, type: "small", palette: "rose" },

    // tiny buds (4)
    { x: 220, y: 246, size: 16, type: "bud", palette: "rose" },
    { x: 580, y: 250, size: 15, type: "bud", palette: "blush" },
    { x: 350, y: 560, size: 14, type: "bud", palette: "rose" },
    { x: 460, y: 556, size: 15, type: "bud", palette: "blush" }
  ];

  const leafSpecs = [
    { x: 340, y: 560, length: 100, width: 34, angle: -35 },
    { x: 460, y: 560, length: 100, width: 34, angle: 35 },
    { x: 260, y: 620, length: 120, width: 40, angle: -55 },
    { x: 540, y: 620, length: 120, width: 40, angle: 55 },
    { x: 400, y: 660, length: 90, width: 30, angle: 0 },
    { x: 320, y: 700, length: 110, width: 36, angle: -70 },
    { x: 480, y: 700, length: 110, width: 36, angle: 70 },
    { x: 220, y: 500, length: 80, width: 26, angle: -95 },
    { x: 580, y: 500, length: 80, width: 26, angle: 95 },
    { x: 400, y: 420, length: 70, width: 24, angle: 15 },
    { x: 460, y: 250, length: 60, width: 22, angle: 40 },
    { x: 330, y: 260, length: 60, width: 22, angle: -40 }
  ];

  const flowerNodes = [];

  function buildBouquet() {
    // stems (drawn first so they sit behind everything)
    flowerSpecs.forEach((f) => {
      const stem = createStem(f.x, f.y, f.size);
      stemsLayer.appendChild(stem);
    });

    // leaves
    leafSpecs.forEach((l) => {
      const leaf = createLeaf(l.x, l.y, l.length, l.width, l.angle);
      leavesLayer.appendChild(leaf);
    });

    // flowers, largest first so they layer under the smaller accents visually as needed
    const ordered = flowerSpecs.slice().sort((a, b) => b.size - a.size);
    ordered.forEach((f, i) => {
      const flower = createFlower(f.x, f.y, f.size, f.type, f.palette, i * TIMELINE.bloomStep);
      flowersLayer.appendChild(flower);
      flowerNodes.push(flower);
    });
  }

  /* ===================== 5. BLOOM ANIMATIONS ===================== */

  function runOpeningSequence() {
    const t = reducedMotion ? 0 : TIMELINE.stemsAt;
    setTimeout(() => bouquetSvg.classList.add("stems-ready"), reducedMotion ? 0 : TIMELINE.stemsAt);
    setTimeout(() => bouquetSvg.classList.add("leaves-ready"), reducedMotion ? 0 : TIMELINE.leavesAt);

    flowerNodes.forEach((f, i) => {
      const budDelay = reducedMotion ? 0 : TIMELINE.firstBudAt + i * (TIMELINE.bloomStep * 0.6) + rand(-60, 60);
      const bloomDelay = reducedMotion ? 0 : TIMELINE.bloomStart + i * TIMELINE.bloomStep + rand(-120, 140);
      setTimeout(() => f.classList.add("budded"), budDelay);
      setTimeout(() => f.classList.add("bloom"), bloomDelay);
    });

    setTimeout(startPetalRain, reducedMotion ? 400 : TIMELINE.settleAt);
    scheduleTextReveal();
  }

  /* ===================== 6. PETAL SYSTEM ===================== */

  let petals = [];
  let sparks = [];
  let petalSpawnTimer = null;
  let petalSpawnInterval = 900;
  let rainSlowed = false;
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let mouseX = vw / 2;
  let mouseY = vh / 2;

  function makePetalEl() {
    const size = rand(9, 18);
    const color = COLORS.petals[Math.floor(rand(0, COLORS.petals.length))];
    const d = document.createElement("div");
    d.className = "petal";
    d.style.width = size + "px";
    d.style.height = size * rand(0.75, 1) + "px";
    d.style.background = color;
    d.style.opacity = rand(0.5, 0.9).toFixed(2);
    return d;
  }

  function spawnPetal() {
    if (petals.length > (isMobile ? 16 : 34)) return;
    const elDiv = makePetalEl();
    petalRainLayer.appendChild(elDiv);
    const x = rand(vw * 0.12, vw * 0.88);
    const petal = {
      el: elDiv,
      x: x,
      y: -30,
      vy: rand(0.35, 0.85),
      vx: rand(-0.25, 0.25),
      rot: rand(0, 360),
      vr: rand(-0.6, 0.6),
      drift: rand(0.4, 1.2),
      seed: rand(0, 1000)
    };
    petals.push(petal);
  }

  function updatePetals(time) {
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      const speedMul = rainSlowed ? 0.45 : 1;
      p.y += p.vy * speedMul;
      p.x += (p.vx + Math.sin((time * 0.001) + p.seed) * 0.15) * p.drift * speedMul;
      p.rot += p.vr * speedMul;

      // subtle reaction near the cursor (desktop)
      if (!isMobile) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          p.x += (dx / (dist || 1)) * 0.6;
        }
      }

      let opacity = 0.85;
      if (p.y > vh - 120) opacity = Math.max(0, (vh - p.y) / 120) * 0.85;
      if (p.y < 30) opacity = (p.y / 30) * 0.85;

      p.el.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px) rotate(" + p.rot.toFixed(1) + "deg)";
      p.el.style.opacity = opacity.toFixed(2);

      if (p.y > vh + 40) {
        p.el.remove();
        petals.splice(i, 1);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.01;
      s.life -= 1;
      s.el.style.transform = "translate(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px)";
      s.el.style.opacity = Math.max(0, s.life / s.maxLife).toFixed(2);
      if (s.life <= 0) {
        s.el.remove();
        sparks.splice(i, 1);
      }
    }

    requestAnimationFrame(updatePetals);
  }

  function startPetalRain() {
    if (petalSpawnTimer) return;
    const tick = () => {
      spawnPetal();
      petalSpawnTimer = setTimeout(tick, rainSlowed ? petalSpawnInterval * 2.2 : petalSpawnInterval);
    };
    tick();
    requestAnimationFrame(updatePetals);
  }

  function burstAt(clientX, clientY) {
    const count = Math.floor(rand(3, 7));
    for (let i = 0; i < count; i++) {
      const d = makePetalEl();
      d.style.width = rand(6, 10) + "px";
      d.style.height = rand(6, 10) + "px";
      petalRainLayer.appendChild(d);
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1.2, 3.2);
      petals.push({
        el: d,
        x: clientX, y: clientY,
        vy: Math.sin(angle) * speed - 1.2,
        vx: Math.cos(angle) * speed,
        rot: rand(0, 360),
        vr: rand(-4, 4),
        drift: 1,
        seed: rand(0, 1000),
        gravity: true
      });
    }
    const sparkCount = Math.floor(rand(3, 6));
    for (let i = 0; i < sparkCount; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      const size = rand(3, 6);
      s.style.width = size + "px";
      s.style.height = size + "px";
      petalRainLayer.appendChild(s);
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.8, 2.2);
      sparks.push({
        el: s,
        x: clientX, y: clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        life: 45, maxLife: 45
      });
    }
  }

  /* ===================== 7. MOUSE PARALLAX ===================== */

  function initParallax() {
    if (isMobile || reducedMotion) return;
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const dx = (e.clientX / vw - 0.5) * 2;
      const dy = (e.clientY / vh - 0.5) * 2;
      const tx = dx * 5;
      const ty = dy * 4;
      bouquetWrap.style.transform = "translateX(calc(-50% + " + tx.toFixed(1) + "px)) translateY(" + ty.toFixed(1) + "px)";
    }, { passive: true });
  }

  /* ===================== 8. FLOWER INTERACTION ===================== */
  // hover/click handlers are attached per-flower inside createFlower()

  /* ===================== 9. TEXT REVEAL ===================== */

  function buildNameLetters() {
    nameEl.setAttribute("aria-label", girlName);
    nameEl.innerHTML = "";
    girlName.split("").forEach((ch) => {
      const span = document.createElement("span");
      span.className = "letter";
      span.textContent = ch;
      nameEl.appendChild(span);
    });
  }

  function scheduleTextReveal() {
    buildNameLetters();
    const f = reducedMotion ? (ms) => Math.min(ms, 400) : (ms) => ms;

    setTimeout(() => introLineEl.classList.add("show"), f(TIMELINE.introAt));
    setTimeout(() => introLine2El.classList.add("show"), f(TIMELINE.intro2At));

    setTimeout(() => darkenOverlay.classList.add("active"), f(TIMELINE.darkenAt));
    setTimeout(() => forYouEl.classList.add("show"), f(TIMELINE.forYouAt));

    setTimeout(() => {
      const letters = nameEl.querySelectorAll(".letter");
      letters.forEach((letter, i) => {
        setTimeout(() => letter.classList.add("show"), i * (reducedMotion ? 40 : TIMELINE.letterStep));
      });

      const totalLetterTime = letters.length * (reducedMotion ? 40 : TIMELINE.letterStep);
      setTimeout(() => {
        finalMsg1El.classList.add("show");
        setTimeout(() => finalMsg2El.classList.add("show"), reducedMotion ? 200 : 900);
        setTimeout(() => {
          hintEl.textContent = isMobile ? "tap the flowers" : "move your cursor around";
          hintEl.classList.add("show");
          startFinalScene();
        }, reducedMotion ? 400 : TIMELINE.hintDelayAfterMsg2 + 900);
      }, totalLetterTime + (reducedMotion ? 200 : TIMELINE.finalMsgGapAfterName));
    }, f(TIMELINE.nameStartAt));
  }

  /* ===================== 10. FINAL SCENE ===================== */

  function startFinalScene() {
    rainSlowed = true;
    petalSpawnInterval = 1500;
    if (!reducedMotion) bouquetWrap.classList.add("swaying");
    gatherGoldParticles();
  }

  function gatherGoldParticles() {
    if (reducedMotion) return;
    const rect = nameEl.getBoundingClientRect();
    const count = 16;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const p = document.createElement("div");
        p.className = "gold-gather";
        const startX = rect.left + rand(-30, rect.width + 30);
        const startY = rect.top + rand(-20, rect.height + 20);
        document.body.appendChild(p);
        p.style.left = startX + "px";
        p.style.top = startY + "px";
        p.style.transition = "transform 2.2s ease-out, opacity 2.2s ease-out";
        requestAnimationFrame(() => {
          p.style.opacity = "1";
          requestAnimationFrame(() => {
            const targetX = rect.left + rect.width / 2 - startX;
            const targetY = rect.top + rect.height / 2 - startY;
            p.style.transform = "translate(" + (targetX * 0.4).toFixed(1) + "px," + (targetY * 0.4).toFixed(1) + "px)";
            p.style.opacity = "0";
          });
        });
        setTimeout(() => p.remove(), 2600);
      }, i * 140);
    }
  }

  /* ===================== 11. RESPONSIVE BEHAVIOUR ===================== */

  function initBackgroundExtras() {
    const particleCount = isMobile ? 14 : 26;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = rand(1, 3);
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = rand(0, 100) + "%";
      p.style.top = rand(0, 100) + "%";
      p.style.opacity = rand(0.15, 0.55).toFixed(2);
      particlesLayer.appendChild(p);
      animateFloatingParticle(p);
    }
    drawStars();
  }

  function animateFloatingParticle(p) {
    if (reducedMotion) return;
    const duration = rand(6000, 13000);
    const amp = rand(6, 18);
    const start = performance.now() + rand(0, 4000);
    function frame(t) {
      const elapsed = (t - start) / duration;
      const y = Math.sin(elapsed * Math.PI * 2) * amp;
      p.style.transform = "translateY(" + y.toFixed(1) + "px)";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function drawStars() {
    const ctx = starsCanvas.getContext("2d");
    function size() {
      starsCanvas.width = window.innerWidth;
      starsCanvas.height = window.innerHeight;
    }
    size();
    const count = isMobile ? 22 : 45;
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rand(0, starsCanvas.width),
        y: rand(0, starsCanvas.height * 0.65),
        r: rand(0.4, 1.3),
        a: rand(0.15, 0.55),
        tw: rand(0.002, 0.006),
        seed: rand(0, 1000)
      });
    }
    function render(t) {
      ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
      stars.forEach((s) => {
        const flicker = reducedMotion ? s.a : s.a * (0.6 + 0.4 * Math.sin(t * s.tw + s.seed));
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,244,232," + flicker.toFixed(2) + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    window.addEventListener("resize", debounce(size, 200));
  }

  function debounce(fn, wait) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  window.addEventListener("resize", debounce(() => {
    vw = window.innerWidth;
    vh = window.innerHeight;
  }, 150));

  /* ---------------- Music control ---------------- */

  let playing = false;
  function toggleMusic() {
    if (!audioEl) return;
    if (playing) {
      audioEl.pause();
      musicIcon.innerHTML = "&#9658;";
      musicControl.setAttribute("aria-label", "Play music");
      playing = false;
    } else {
      audioEl.play().then(() => {
        musicIcon.innerHTML = "&#10074;&#10074;";
        musicControl.setAttribute("aria-label", "Pause music");
        playing = true;
      }).catch(() => {
        // audio unavailable or blocked — fail silently, site still works
        playing = false;
      });
    }
  }
  musicControl.addEventListener("click", toggleMusic);
  musicControl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMusic();
    }
  });

  /* ===================== BOOT ===================== */

  function init() {
    buildBouquet();
    initBackgroundExtras();
    initParallax();
    runOpeningSequence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
