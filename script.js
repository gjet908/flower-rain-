
/* ==========================================================
   FOR YOU — script.js
   1. Configuration
   2. DOM references
   3. SVG flower creation
   4. Bouquet creation (fixed, intentional positions)
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
    petals: ["#C77A8B", "#E8A9B8", "#FFF4E8"]
  };

  const TIMELINE = {
    stemsAt: 1900,
    leavesAt: 3400,
    firstBudAt: 4200,
    bloomStart: 5000,
    bloomStep: 260,
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
  const leavesLayer = document.getElementById("leaves-layer");
  const flowersBackLayer = document.getElementById("flowers-back-layer");
  const stemsLayer = document.getElementById("stems-layer");
  const flowersMiddleLayer = document.getElementById("flowers-middle-layer");
  const flowersFrontLayer = document.getElementById("flowers-front-layer");
  const wrapperLayer = document.getElementById("wrapper-layer");
  const bouquetWrap = document.getElementById("bouquet-wrap");

  const particlesLayer = document.getElementById("particles");
  const starsCanvas = document.getElementById("stars");
  const petalRainBack = document.getElementById("petal-rain-back");
  const petalRainFront = document.getElementById("petal-rain-front");
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

  // NOTE: Math.random() below is used ONLY for cosmetic micro-variation
  // (petal curvature / rotation jitter, falling petals, background particles)
  // — never for bouquet flower or leaf positions, which are fixed below.
  function addPetalLayer(parent, opts) {
    const {
      count, length, width, gradientId, radiusOffset,
      rotationOffset = 0, curve = 0.75, jitter = 6
    } = opts;

    for (let i = 0; i < count; i++) {
      const baseAngle = (360 / count) * i + rotationOffset;
      const angle = baseAngle + rand(-jitter, jitter);
      const len = length * rand(0.92, 1.08);
      const wid = width * rand(0.88, 1.12);
      const c = curve * rand(0.9, 1.05);
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
      const angle = (360 / count) * i + 90;
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

  function createFlower(spec, bloomDelayIndex) {
    const { x: cx, y: cy, size, type, palette: paletteName } = spec;
    const palette = paletteFor(paletteName);
    const g = el("g", {
      class: "flower",
      transform: "translate(" + cx + "," + cy + ")",
      "data-bloom-index": bloomDelayIndex
    });

    const inner = el("g", { class: "flower-inner" });

    if (type === "large") {
      addSepals(inner, size);
      addPetalLayer(inner, { count: 8, length: size * 0.92, width: size * 0.56, gradientId: palette.outer, radiusOffset: size * 0.14, curve: 0.78, jitter: 5 });
      addPetalLayer(inner, { count: 6, length: size * 0.62, width: size * 0.4, gradientId: palette.mid, radiusOffset: size * 0.06, rotationOffset: 28, curve: 0.7, jitter: 7 });
      addPetalLayer(inner, { count: 5, length: size * 0.3, width: size * 0.22, gradientId: palette.inner, radiusOffset: size * 0.01, rotationOffset: 12, curve: 0.6, jitter: 8 });
      const center = el("circle", { r: size * 0.09, fill: "url(#flowerCenter)" });
      inner.appendChild(center);
      for (let i = 0; i < 6; i++) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0, size * 0.06);
        inner.appendChild(el("circle", { cx: Math.cos(a) * r, cy: Math.sin(a) * r, r: rand(1.1, 2) * 0.14, class: "flower-center-dot" }));
      }
    } else if (type === "soft") {
      addSepals(inner, size * 0.8);
      addPetalLayer(inner, { count: 9, length: size * 0.78, width: size * 0.5, gradientId: palette.outer, radiusOffset: size * 0.08, curve: 0.55, jitter: 5 });
      addPetalLayer(inner, { count: 6, length: size * 0.4, width: size * 0.3, gradientId: palette.inner, radiusOffset: size * 0.02, rotationOffset: 20, curve: 0.5, jitter: 7 });
      const center = el("circle", { r: size * 0.07, fill: "url(#flowerCenter)" });
      inner.appendChild(center);
      for (let i = 0; i < 5; i++) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0, size * 0.045);
        inner.appendChild(el("circle", { cx: Math.cos(a) * r, cy: Math.sin(a) * r, r: rand(1, 1.8) * 0.14, class: "flower-center-dot" }));
      }
    } else if (type === "small") {
      addPetalLayer(inner, { count: 6, length: size * 0.85, width: size * 0.6, gradientId: palette.outer, radiusOffset: size * 0.08, curve: 0.7, jitter: 6 });
      const center = el("circle", { r: size * 0.16, fill: "url(#flowerCenter)" });
      inner.appendChild(center);
    } else if (type === "bud") {
      const bud = el("path", { d: petalPath(size, size * 0.62, 0.9), fill: "url(#" + palette.outer + ")" });
      inner.appendChild(bud);
      const calyx = el("path", { d: petalPath(size * 0.5, size * 0.5, 0.5), fill: "url(#leafGrad)", transform: "translate(0," + size * 0.35 + ")" });
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

  function createStem(baseX, baseY, endX, endY) {
    const midX = (baseX + endX) / 2;
    const midY = (baseY + endY) / 2 + 4;
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
    const vein = el("path", { d: "M0,-0.4 L0," + (-length + 0.6), class: "leaf-vein" });
    g.appendChild(shape);
    g.appendChild(vein);
    return g;
  }

  function createWrapper() {
    // A simple folded-paper cone beneath the stems — champagne with a soft shadow.
    const d = "M34,75 L66,75 L61,90 L39,90 Z";
    const shape = el("path", { d: d, fill: "url(#wrapperGrad)", class: "wrapper-shape" });
    const fold = el("path", {
      d: "M50,75 L50,90",
      stroke: "rgba(155,110,60,0.35)",
      "stroke-width": "0.3",
      fill: "none",
      class: "wrapper-shape"
    });
    wrapperLayer.appendChild(shape);
    wrapperLayer.appendChild(fold);
  }

  /* ===================== 4. BOUQUET CREATION (fixed positions) ===================== */
  // All x / y values are percentages within the 0–100 bouquet viewBox.
  // Positions are intentional and fixed — Math.random() is never used here.

  const WRAPPER_APEX = { x: 50, y: 78 };

  const largeFlowers = [
    { x: 50, y: 8,  size: 15,   type: "large", palette: "rose"  }, // center top
    { x: 30, y: 20, size: 13,   type: "large", palette: "blush" }, // upper left
    { x: 70, y: 20, size: 13,   type: "large", palette: "rose"  }, // upper right
    { x: 38, y: 40, size: 12.5, type: "large", palette: "blush" }, // lower left
    { x: 62, y: 40, size: 12.5, type: "large", palette: "rose"  }  // lower right
  ];

  const mediumFlowers = [
    { x: 18, y: 30, size: 8,   type: "soft", palette: "blush" },
    { x: 24, y: 43, size: 8,   type: "soft", palette: "rose"  },
    { x: 32, y: 48, size: 7.5, type: "soft", palette: "ivory" },
    { x: 44, y: 28, size: 8,   type: "soft", palette: "rose"  },
    { x: 56, y: 30, size: 8,   type: "soft", palette: "blush" },
    { x: 68, y: 48, size: 7.5, type: "soft", palette: "rose"  },
    { x: 76, y: 30, size: 8,   type: "soft", palette: "ivory" },
    { x: 82, y: 43, size: 7.5, type: "soft", palette: "blush" }
  ];

  const smallFlowers = [
    { x: 18, y: 55, size: 4.6, type: "small", palette: "rose"  },
    { x: 22, y: 62, size: 4.4, type: "small", palette: "blush" },
    { x: 20, y: 45, size: 4.4, type: "small", palette: "ivory" },
    { x: 78, y: 55, size: 4.6, type: "small", palette: "blush" },
    { x: 82, y: 45, size: 4.4, type: "small", palette: "rose"  },
    { x: 80, y: 62, size: 4.4, type: "small", palette: "ivory" },
    { x: 40, y: 18, size: 4.2, type: "small", palette: "rose"  },
    { x: 60, y: 18, size: 4.2, type: "small", palette: "blush" },
    { x: 50, y: 50, size: 4.6, type: "small", palette: "ivory" },
    { x: 45, y: 58, size: 4.2, type: "small", palette: "rose"  },
    { x: 55, y: 58, size: 4.2, type: "small", palette: "blush" },
    { x: 50, y: 62, size: 4.4, type: "small", palette: "rose"  }
  ];

  const fillerFlowers = [
    { x: 28, y: 33, size: 2.4, type: "small", palette: "blush" },
    { x: 72, y: 33, size: 2.4, type: "small", palette: "rose"  },
    { x: 34, y: 24, size: 2.2, type: "bud",   palette: "rose"  },
    { x: 66, y: 24, size: 2.2, type: "bud",   palette: "blush" },
    { x: 44, y: 42, size: 2.3, type: "small", palette: "ivory" },
    { x: 56, y: 42, size: 2.3, type: "small", palette: "ivory" },
    { x: 36, y: 52, size: 2.2, type: "bud",   palette: "rose"  },
    { x: 64, y: 52, size: 2.2, type: "bud",   palette: "blush" },
    { x: 50, y: 30, size: 2.4, type: "small", palette: "rose"  },
    { x: 50, y: 40, size: 2.3, type: "small", palette: "blush" }
  ];

  const leafSpecs = [
    { x: 15, y: 38, length: 14, width: 5,   angle: -110 },
    { x: 22, y: 52, length: 16, width: 6,   angle: -70 },
    { x: 30, y: 58, length: 14, width: 5,   angle: -55 },
    { x: 40, y: 52, length: 10, width: 4,   angle: -20 },
    { x: 60, y: 52, length: 10, width: 4,   angle: 20 },
    { x: 70, y: 58, length: 14, width: 5,   angle: 55 },
    { x: 78, y: 52, length: 16, width: 6,   angle: 70 },
    { x: 85, y: 38, length: 14, width: 5,   angle: 110 },
    { x: 25, y: 45, length: 10, width: 4,   angle: -90 },
    { x: 75, y: 45, length: 10, width: 4,   angle: 90 },
    { x: 35, y: 35, length: 8,  width: 3,   angle: -130 },
    { x: 65, y: 35, length: 8,  width: 3,   angle: 130 },
    { x: 50, y: 46, length: 8,  width: 3,   angle: 178 },
    { x: 50, y: 20, length: 6,  width: 2.5, angle: 0 }
  ];

  // Only 6–8 short stems, converging beneath the flower cluster into the wrapper.
  const stemAnchors = [
    { x: 50, y: 48 },
    { x: 36, y: 55 },
    { x: 64, y: 55 },
    { x: 44, y: 42 },
    { x: 56, y: 42 },
    { x: 50, y: 60 },
    { x: 70, y: 58 }
  ];

  const flowerNodes = [];

  function buildBouquet() {
    // 1. leaves (back)
    leafSpecs.forEach((l) => leavesLayer.appendChild(createLeaf(l.x, l.y, l.length, l.width, l.angle)));

    // 2. back-layer flowers: filler + small — bloom first, fill the base
    [...fillerFlowers, ...smallFlowers].forEach((f) => {
      const flower = createFlower(f, flowerNodes.length);
      flowersBackLayer.appendChild(flower);
      flowerNodes.push(flower);
    });

    // 3. stems, short, converging into the wrapper
    stemAnchors.forEach((s) => {
      stemsLayer.appendChild(createStem(WRAPPER_APEX.x, WRAPPER_APEX.y, s.x, s.y));
    });

    // 4. middle-layer flowers
    mediumFlowers.forEach((f) => {
      const flower = createFlower(f, flowerNodes.length);
      flowersMiddleLayer.appendChild(flower);
      flowerNodes.push(flower);
    });

    // 5. front-layer flowers — the 5 hero blooms, the visual climax
    largeFlowers.forEach((f) => {
      const flower = createFlower(f, flowerNodes.length);
      flowersFrontLayer.appendChild(flower);
      flowerNodes.push(flower);
    });

    // 6. wrapper, tying the stems together
    createWrapper();
  }

  /* ===================== 5. BLOOM ANIMATIONS ===================== */

  function runOpeningSequence() {
    setTimeout(() => bouquetSvg.classList.add("stems-ready"), reducedMotion ? 0 : TIMELINE.stemsAt);
    setTimeout(() => bouquetSvg.classList.add("leaves-ready"), reducedMotion ? 0 : TIMELINE.leavesAt);

    flowerNodes.forEach((f, i) => {
      const budDelay = reducedMotion ? 0 : TIMELINE.firstBudAt + i * (TIMELINE.bloomStep * 0.55) + rand(-40, 40);
      const bloomDelay = reducedMotion ? 0 : TIMELINE.bloomStart + i * TIMELINE.bloomStep + rand(-70, 90);
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
  let petalSpawnInterval = 850;
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

  // Petals spawn with a bias toward the left/right thirds of the screen,
  // keeping the column above "FOR YOU" / "FALAK" comparatively clear.
  function biasedSpawnX() {
    const roll = Math.random();
    if (roll < 0.72) {
      return Math.random() < 0.5 ? rand(vw * 0.02, vw * 0.32) : rand(vw * 0.68, vw * 0.98);
    }
    return rand(vw * 0.32, vw * 0.68);
  }

  function spawnPetal() {
    if (petals.length > (isMobile ? 20 : 40)) return;
    const behind = Math.random() < 0.32;
    const layer = behind ? petalRainBack : petalRainFront;
    const elDiv = makePetalEl();
    layer.appendChild(elDiv);
    const x = biasedSpawnX();
    petals.push({
      el: elDiv,
      x: x,
      y: -30,
      vy: rand(0.35, 0.85),
      vx: rand(-0.25, 0.25),
      rot: rand(0, 360),
      vr: rand(-0.6, 0.6),
      drift: rand(0.4, 1.2),
      seed: rand(0, 1000)
    });
  }

  function updatePetals(time) {
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      const speedMul = rainSlowed ? 0.45 : 1;
      p.y += p.vy * speedMul;
      p.x += (p.vx + Math.sin((time * 0.001) + p.seed) * 0.15) * p.drift * speedMul;
      p.rot += p.vr * speedMul;

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
      petalRainFront.appendChild(d);
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
        seed: rand(0, 1000)
      });
    }
    const sparkCount = Math.floor(rand(3, 6));
    for (let i = 0; i < sparkCount; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      const size = rand(3, 6);
      s.style.width = size + "px";
      s.style.height = size + "px";
      petalRainFront.appendChild(s);
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
        y: rand(0, starsCanvas.height * 0.5),
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
