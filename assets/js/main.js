/* ============================================================
   LN4 — blackout edition — interactions
   ============================================================ */
(() => {
  "use strict";

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const fastLoad = new URLSearchParams(location.search).has("fast");  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, n) => a + (b - a) * n;

  /* ---------------- preloader ---------------- */
  const loader = doc.querySelector(".loader");
  const loaderCount = doc.querySelector(".loader__count span");
  const loaderBar = doc.querySelector(".loader__bar i");
  const start = performance.now();
  const DURATION = fastLoad ? 0 : reduced ? 200 : 1050;

  function tickLoader(now) {
    const p = clamp((now - start) / DURATION, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    if (loaderCount) loaderCount.textContent = String(Math.round(eased * 100)).padStart(2, "0");
    if (loaderBar) loaderBar.style.transform = `scaleX(${eased})`;
    if (p < 1) requestAnimationFrame(tickLoader);
    else finishLoad();
  }

  function finishLoad() {
    body.classList.add("is-loaded");
    html.classList.add("is-loaded");
    if (loader) setTimeout(() => loader.setAttribute("aria-hidden", "true"), 1100);
    window.dispatchEvent(new Event("ln:loaded"));
  }

  if (loader) requestAnimationFrame(tickLoader);
  else finishLoad();
  if (fastLoad && loader) loader.remove();

  // safety: never leave the page hidden behind the mask
  setTimeout(() => {
    body.classList.add("is-loaded");
    html.classList.add("is-loaded");
  }, DURATION + 1400);

  /* ---------------- nav ---------------- */
  const nav = doc.querySelector(".nav");
  const setNav = () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 40);
  setNav();

  /* ---------------- menu ---------------- */
  const burger = doc.querySelector(".burger");
  const menu = doc.querySelector(".menu");
  const menuLinks = doc.querySelectorAll("[data-close]");

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    body.classList.toggle("is-locked", open);
    if (burger) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) menu.setAttribute("aria-hidden", String(!open));
  }

  if (burger) burger.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  menuLinks.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  doc.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = doc.querySelectorAll("[data-reveal], .cricketer__title, .stat, .gallery__title");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------------- counters ---------------- */
  const counters = doc.querySelectorAll("[data-count]");

  // reduced motion: show final values immediately
  if (reduced) {
    counters.forEach((el) => {
      el.textContent = String(parseFloat(el.dataset.count) || 0);
    });
  }

  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count) || 0;
        if (reduced) {
          el.textContent = String(target);
          countIO.unobserve(el);
          return;
        }
        const dur = 1400;
        const t0 = performance.now();
        const step = (now) => {
          const p = clamp((now - t0) / dur, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = String(target);
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => countIO.observe(c));
  /* ---------------- horizontal archive ---------------- */
  const hs = doc.querySelector("[data-hscroll]");
  const track = doc.querySelector("[data-track]");
  let trackDistance = 0;

  function layoutHorizontal() {
    if (!hs || !track) return;
    if (window.innerWidth <= 860) {
      hs.style.height = "";
      track.style.transform = "";
      return;
    }
    trackDistance = Math.max(0, track.scrollWidth - window.innerWidth);
    hs.style.height = `${window.innerHeight + trackDistance}px`;
  }

  let hTicking = false;
  function moveHorizontal() {
    if (!hs || !track) return;
    if (window.innerWidth <= 860) return;
    const rect = hs.getBoundingClientRect();
    const total = hs.offsetHeight - window.innerHeight;
    const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    track.style.transform = `translate3d(${-p * trackDistance}px, 0, 0)`;
  }

  /* ---------------- hero parallax ---------------- */
  const portrait = doc.querySelector("[data-parallax]");
  let ticking = false;

  function onFrame() {
    const y = window.scrollY;
    if (portrait && fine && !reduced && window.innerWidth > 860) {
      portrait.style.transform = `translate(-50%, ${Math.min(y * 0.14, 90)}px)`;
    }
    moveHorizontal();
    if (nav) nav.classList.toggle("is-scrolled", y > 40);
    const docH = doc.documentElement.scrollHeight - window.innerHeight;
    const bar = doc.querySelector(".progress span");
    if (bar) bar.style.transform = `scaleX(${docH > 0 ? clamp(y / docH, 0, 1) : 0})`;
    ticking = false;
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }

  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", () => {
    layoutHorizontal();
    requestFrame();
  });

  /* ---------------- magnetic ---------------- */
  if (fine && !reduced) {
    doc.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * 9}px, ${y * 7}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------------- custom cursor ---------------- */
  /* Keep this block running on touch devices too: the hero helmet
     animation lives inside it and must be available without hover. */
  if (!reduced) {
    const cursor = doc.querySelector(".cursor");
    const dot = doc.querySelector(".cursor__dot");
    const ring = doc.querySelector(".cursor__ring");
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let started = false;

    const cMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!started && cursor) {
        cursor.classList.add("is-on");
        started = true;
      }
      if (dot) dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };
    window.addEventListener("mousemove", cMove, { passive: true });

    const loop = () => {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const hoverables = "a, button, input, [data-magnetic], .hero__portrait";
    doc.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener("mouseenter", () => cursor && cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor && cursor.classList.remove("is-hover"));
    });

    /* ---------------- hero lime cursor glow ---------------- */
    const heroPortrait = doc.querySelector(".hero__portrait");
    const canvas = doc.querySelector(".hero__canvas");
    if (heroPortrait && canvas) {
      const ctx = canvas.getContext("2d");
      const helmetImg = new Image();
      helmetImg.src = "assets/img/helmet.webp";
      let imgLoaded = false;
      let helmetFX = null;

      helmetImg.onload = () => {
        const W = 900;
        const H = Math.round(W * (helmetImg.naturalHeight || 1) / (helmetImg.naturalWidth || 1));
        const off = document.createElement("canvas");
        off.width = W;
        off.height = H;
        const octx = off.getContext("2d");
        octx.drawImage(helmetImg, 0, 0, W, H);
        try {
          const data = octx.getImageData(0, 0, W, H);
          const px = data.data;
          for (let i = 0; i < px.length; i += 4) {
            px[i + 3] = Math.max(px[i], px[i + 1], px[i + 2]);
          }
          octx.putImageData(data, 0, 0);
          helmetFX = off;
        } catch (err) {
          helmetFX = null;
        }
        imgLoaded = true;
      };

      let cw = 0;
      let ch = 0;
      let dpr = 1;

      function resizeCanvas() {
        const rect = heroPortrait.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        cw = rect.width;
        ch = rect.height;
        if (cw <= 0 || ch <= 0) return;
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(ch * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("load", resizeCanvas);
      if ("ResizeObserver" in window) {
        new ResizeObserver(resizeCanvas).observe(heroPortrait);
      }
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(resizeCanvas);
      resizeCanvas();

      // Fixed-geometry comet bean shape with speed-based sizing
      const blob = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        speed: 0,
        headingAngle: 0,
        baseRadius: 0,
        radius: 0,
        targetRadius: 0,
        opacity: 0,
        targetOpacity: 0,
        time: 0,
        fixedHeadRadius: 0, // fixed dimension base
        fixedLength: 0,     // fixed dimension length
        cursorSpeed: 0,     // smoothed real cursor speed in px/ms
        prevTargetX: 0,
        prevTargetY: 0
      };

      function updateBlobSize() {
        // Crisp baseline scale
        blob.baseRadius = Math.max(130, Math.min(cw, ch) * 0.26);
        blob.fixedHeadRadius = blob.baseRadius;
        blob.fixedLength = blob.baseRadius * 1.85; // fixed signature ratio
      }

      let isHovering = false;
      let lastFrameTime = performance.now();
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      let lastUserInteraction = performance.now();
      let autoPhase = 0;
      let nextAutoTime = performance.now() + 1500;

      function triggerRandomAutoHover() {
        if (isHovering || reduced || cw === 0 || ch === 0) return;
        updateBlobSize();

        // Random 360 trajectory
        const angle = Math.random() * Math.PI * 2;
        blob.headingAngle = angle;

        const centerX = cw * (0.35 + Math.random() * 0.3);
        const centerY = ch * (0.28 + Math.random() * 0.3);
        const travelDist = Math.min(cw, ch) * 0.35;
        const startX = centerX - Math.cos(angle) * (travelDist * 0.5);
        const startY = centerY - Math.sin(angle) * (travelDist * 0.5);
        const endX = centerX + Math.cos(angle) * (travelDist * 0.5);
        const endY = centerY + Math.sin(angle) * (travelDist * 0.5);

        blob.x = startX;
        blob.y = startY;
        blob.targetX = endX;
        blob.targetY = endY;
        blob.prevTargetX = endX;
        blob.prevTargetY = endY;
        blob.targetOpacity = 0.95;
        autoPhase = 1;

        setTimeout(() => {
          if (!isHovering && autoPhase === 1) {
            blob.targetOpacity = 0;
            autoPhase = 0;
            nextAutoTime = performance.now() + 2000 + Math.random() * 2500;
          }
        }, 1600 + Math.random() * 600);
      }

      heroPortrait.addEventListener("mouseenter", (e) => {
        isHovering = true;
        autoPhase = 0;
        lastUserInteraction = performance.now();
        resizeCanvas();
        updateBlobSize();

        const rect = heroPortrait.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        blob.x = x;
        blob.y = y;
        blob.targetX = x;
        blob.targetY = y;
        blob.vx = 0;
        blob.vy = 0;
        blob.targetOpacity = 1;
        blob.cursorSpeed = 0;
        blob.prevTargetX = x;
        blob.prevTargetY = y;
        if (blob.radius < 1) blob.radius = blob.baseRadius * 0.85;
      });

      heroPortrait.addEventListener("mousemove", (e) => {
        isHovering = true;
        autoPhase = 0;
        lastUserInteraction = performance.now();
        blob.targetOpacity = 1;
        const rect = heroPortrait.getBoundingClientRect();
        blob.targetX = e.clientX - rect.left;
        blob.targetY = e.clientY - rect.top;
      });

      heroPortrait.addEventListener("mouseleave", () => {
        isHovering = false;
        lastUserInteraction = performance.now();
        blob.targetOpacity = 0;
        nextAutoTime = performance.now() + 1800;
      });

      let touchHideTimer = 0;
      const showTouchBlob = (event) => {
        const point = event.touches ? event.touches[0] : event;
        if (!point) return;
        clearTimeout(touchHideTimer);
        resizeCanvas();
        updateBlobSize();
        isHovering = true;
        autoPhase = 0;
        lastUserInteraction = performance.now();
        const rect = heroPortrait.getBoundingClientRect();
        const x = point.clientX - rect.left;
        const y = point.clientY - rect.top;
        blob.x = x;
        blob.y = y;
        blob.targetX = x;
        blob.targetY = y;
        blob.prevTargetX = x;
        blob.prevTargetY = y;
        blob.cursorSpeed = 0;
        blob.targetOpacity = 1;
      };
      const hideTouchBlob = () => {
        isHovering = false;
        blob.targetOpacity = 0;
        lastUserInteraction = performance.now();
        nextAutoTime = performance.now() + 1800;
      };
      heroPortrait.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch") showTouchBlob(event);
      }, { passive: true });
      heroPortrait.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") showTouchBlob(event);
      }, { passive: true });
      heroPortrait.addEventListener("pointerup", (event) => {
        if (event.pointerType !== "touch") return;
        touchHideTimer = setTimeout(hideTouchBlob, 900);
      }, { passive: true });
      heroPortrait.addEventListener("pointercancel", () => {
        clearTimeout(touchHideTimer);
        hideTouchBlob();
      }, { passive: true });

      function buildBlobPath(headR) {
        // Fixed head & tail geometry. Proportions never change, so the comet
        // can scale without deforming.
        const tailR = headR * 0.58;
        const length = headR * 1.85;
        const pad = Math.asin(Math.min(1, Math.max(-1, (headR - tailR) / length)));
        const top = Math.PI / 2 + pad;
        const btm = -Math.PI / 2 - pad;

        const p = new Path2D();
        p.arc(0, 0, headR, top, btm, true);
        p.arc(-length, 0, tailR, btm, top, true);
        p.closePath();
        return p;
      }

      let heroVisible = true;
      if ("IntersectionObserver" in window) {
        const heroIO = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            heroVisible = e.isIntersecting && !document.hidden;
            if (heroVisible && !heroRafId) heroRafId = requestAnimationFrame(renderLoopTick);
          });
        }, { threshold: 0.02 });
        heroIO.observe(heroPortrait);
        document.addEventListener("visibilitychange", () => {
          heroVisible = heroVisible && !document.hidden;
          if (heroVisible && !heroRafId) heroRafId = requestAnimationFrame(renderLoopTick);
        });
      }
      let heroRafId = 0;

      function renderLoopTick() {
        heroRafId = 0;
        renderLoop();
      }

      function renderLoop() {
        const now = performance.now();
        const liveRect = heroPortrait.getBoundingClientRect();
        const wantW = Math.round(liveRect.width * dpr);
        const wantH = Math.round(liveRect.height * dpr);
        if (liveRect.width > 0 && liveRect.height > 0 && (canvas.width !== wantW || canvas.height !== wantH)) {
          resizeCanvas();
        }
        const dt = Math.min(64, Math.max(1, now - lastFrameTime));
        lastFrameTime = now;

        ctx.clearRect(0, 0, cw, ch);

        if (!isHovering && now >= nextAutoTime && autoPhase === 0) {
          triggerRandomAutoHover();
        }

        // Frame-rate independent follow (same feel at 60 and 120Hz)
        const tdx = blob.targetX - blob.x;
        const tdy = blob.targetY - blob.y;
        const followK = 1 - Math.exp(-dt / (isHovering ? 105 : 200));
        blob.x += tdx * followK;
        blob.y += tdy * followK;

        // Pointer speed measured per frame, then smoothed
        const mvx = blob.targetX - blob.prevTargetX;
        const mvy = blob.targetY - blob.prevTargetY;
        blob.prevTargetX = blob.targetX;
        blob.prevTargetY = blob.targetY;
        const instSpeed = Math.min(Math.hypot(mvx, mvy) / dt, 3);
        blob.cursorSpeed += (instSpeed - blob.cursorSpeed) * (1 - Math.exp(-dt / 110));

        // Heading: shortest-arc ease, so direction changes never snap
        if (Math.hypot(tdx, tdy) > 0.8) {
          const targetAngle = Math.atan2(tdy, tdx);
          const delta = ((targetAngle - blob.headingAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          blob.headingAngle += delta * (1 - Math.exp(-dt / 85));
        }

        blob.time += dt;

        // CURSOR SPEED SLOW = BIGGER
        // Slow/resting: 1.12x. Fast sweep: 0.92x. Shape stays identical.
        const speedNorm = Math.min(blob.cursorSpeed / 1.1, 1);
        const speedScale = 1.12 - speedNorm * 0.2;
        blob.targetRadius = (blob.baseRadius || 140) * (isHovering ? speedScale : 1.0);
        blob.radius += (blob.targetRadius - blob.radius) * (1 - Math.exp(-dt / 90));
        blob.opacity += (blob.targetOpacity - blob.opacity) * (1 - Math.exp(-dt / (isHovering ? 70 : 160)));

        if (blob.opacity > 0.005 && helmetFX && cw > 0 && ch > 0) {
          const breathe = 1 + Math.sin(blob.time * 0.0022) * 0.012;
          const headR = blob.radius * breathe;
          const path = buildBlobPath(headR);

          const imgAspect = helmetImg.naturalWidth / (helmetImg.naturalHeight || 1);
          const boxAspect = cw / (ch || 1);
          let drawW, drawH, drawX, drawY;
          if (boxAspect > imgAspect) {
            drawH = ch;
            drawW = ch * imgAspect;
            drawX = (cw - drawW) / 2;
            drawY = 0;
          } else {
            drawW = cw;
            drawH = cw / imgAspect;
            drawX = 0;
            drawY = ch - drawH;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, blob.opacity));
          ctx.globalCompositeOperation = "lighter";
          ctx.translate(blob.x, blob.y);
          ctx.rotate(blob.headingAngle);
          ctx.clip(path);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          // Soft lime wash inside the cloud. No outline or hard border.
          const wash = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, headR * 1.02
          );
          wash.addColorStop(0, "rgba(210, 255, 0, 0.16)");
          wash.addColorStop(0.6, "rgba(210, 255, 0, 0.07)");
          wash.addColorStop(1, "rgba(210, 255, 0, 0)");
          ctx.fillStyle = wash;
          ctx.fillRect(blob.x - headR, blob.y - headR, headR * 2, headR * 2);

          // Helmet glyphs only; the lime tint and outline are removed.
          ctx.globalAlpha = Math.max(0, Math.min(1, blob.opacity));
          ctx.drawImage(helmetFX, drawX, drawY, drawW, drawH);
          ctx.restore();
        }

        if (heroVisible && !document.hidden) heroRafId = requestAnimationFrame(renderLoopTick);
      }

      if (doc && doc.querySelector && doc.querySelector(".hero__portrait") && doc.querySelector(".hero__canvas")) requestAnimationFrame(renderLoopTick);
    }

    doc.addEventListener("mouseleave", () => cursor && cursor.classList.remove("is-on"));
    doc.addEventListener("mouseenter", () => cursor && started && cursor.classList.add("is-on"));
  }

  /* ---------------- hero portrait onion-skin reveal ---------------- */
  const heroRevealHost = doc.querySelector(".hero__portrait");
  const heroRevealPanel = doc.querySelector(".hero__reveal");

  if (!reduced && heroRevealHost && heroRevealPanel) {
    const REVEAL_MS = 780;
    let hx = 0;
    let hy = 0;
    let htx = 0;
    let hty = 0;
    let heroRaf = 0;
    let heroLast = 0;
    let heroStart = 0;
    let heroProg = 0;
    let heroRadius = 0;

    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const placeReveal = () => {
      heroRevealPanel.style.setProperty("--mx", `${hx.toFixed(1)}px`);
      heroRevealPanel.style.setProperty("--my", `${hy.toFixed(1)}px`);
      heroRevealPanel.style.setProperty(
        "--hero-r",
        `${(easeInOut(heroProg) * heroRadius).toFixed(1)}px`
      );
    };

    const heroStep = (now) => {
      const dt = Math.min(now - heroLast || 16, 48);
      heroLast = now;
      const k = 1 - Math.exp(-dt / 90);
      hx = lerp(hx, htx, k);
      hy = lerp(hy, hty, k);
      heroProg = Math.min((now - heroStart) / REVEAL_MS, 1);
      placeReveal();
      const settled = Math.abs(hx - htx) < 0.15 && Math.abs(hy - hty) < 0.15;
      if (settled && heroProg >= 1) {
        hx = htx;
        hy = hty;
        placeReveal();
        heroRaf = 0;
        return;
      }
      heroRaf = requestAnimationFrame(heroStep);
    };

    const playReveal = () => {
      if (heroRaf) return;
      heroLast = performance.now();
      heroRaf = requestAnimationFrame(heroStep);
    };

    const heroEnter = (event) => {
      const rect = heroRevealHost.getBoundingClientRect();
      htx = event.clientX - rect.left;
      hty = event.clientY - rect.top - (event.pointerType === "touch" ? 0 : 20);
      hx = htx;
      hy = hty;
      heroRadius = event.pointerType === "touch"
        ? Math.min(190, Math.max(96, window.innerWidth * 0.38))
        : Math.min(300, Math.max(150, window.innerWidth * 0.21));
      heroProg = 0;
      heroStart = performance.now();
      placeReveal();
      heroRevealHost.classList.add("is-revealing");
      playReveal();
    };

    const heroMove = (event) => {
      const rect = heroRevealHost.getBoundingClientRect();
      htx = clamp(event.clientX - rect.left, 0, rect.width);
      hty = clamp(event.clientY - rect.top - 20, -20, rect.height);
      if (!heroRevealHost.classList.contains("is-revealing")) {
        hx = htx;
        hy = hty;
        placeReveal();
        return;
      }
      playReveal();
    };

    const hideReveal = () => {
      heroRevealHost.classList.remove("is-revealing");
      if (heroRaf) cancelAnimationFrame(heroRaf);
      heroRaf = 0;
    };

    heroRevealHost.addEventListener("pointerenter", heroEnter);
    heroRevealHost.addEventListener("pointerdown", heroEnter);
    heroRevealHost.addEventListener("pointermove", heroMove);
    heroRevealHost.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "touch") return;
      hideReveal();
    });
    heroRevealHost.addEventListener("pointerup", (event) => {
      if (event.pointerType === "touch") setTimeout(hideReveal, 2200);
    });
    heroRevealHost.addEventListener("pointercancel", hideReveal);

    /* On phones there is no hover, so sweep the helmet lens across the
       portrait periodically. A tap still takes over the same lens. */
    if (!fine) {
      let autoLensTimer = 0;
      const autoReveal = () => {
        if (document.hidden || (heroRevealHost.getBoundingClientRect().bottom < 0 && heroRevealHost.getBoundingClientRect().top > (window.innerHeight || 1))) return;
        if (document.hidden || heroRevealHost.classList.contains("is-revealing")) return;
        const rect = heroRevealHost.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const radius = Math.min(170, Math.max(92, rect.width * 0.34));
        const start = performance.now();
        const duration = 1800;
        heroRevealHost.classList.add("is-revealing");

        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = easeInOut(t);
          heroRevealPanel.style.setProperty("--mx", `${(rect.width * (0.32 + eased * 0.36)).toFixed(1)}px`);
          heroRevealPanel.style.setProperty("--my", `${(rect.height * 0.34).toFixed(1)}px`);
          heroRevealPanel.style.setProperty("--hero-r", `${(radius * Math.min(1, Math.sin(t * Math.PI) * 1.5)).toFixed(1)}px`);
          if (t < 1) requestAnimationFrame(step);
          else {
            autoLensTimer = setTimeout(() => {
              if (!heroRevealHost.matches(":active")) hideReveal();
            }, 320);
          }
        };
        requestAnimationFrame(step);
      };

      setTimeout(autoReveal, 1800);
      const autoLoop = setInterval(autoReveal, 6200);
      heroRevealHost.addEventListener("pointerdown", () => {
        clearInterval(autoLoop);
        clearTimeout(autoLensTimer);
      }, { passive: true });
    }
  }

  /* ---------------- init ---------------- */
  window.addEventListener("load", () => {
    layoutHorizontal();
    requestFrame();
  });
  window.addEventListener("ln:loaded", () => {
    layoutHorizontal();
    requestFrame();
  });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(layoutHorizontal);

  layoutHorizontal();
  requestFrame();
})();


/* ---------------- pinned scroll sections (pin + scrub) ---------------- */
(function () {
  const pins = Array.prototype.slice.call(document.querySelectorAll("[data-pin]"));
  if (!pins.length) return;
  const mq = window.matchMedia("(min-width: 901px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;

  function update() {
    raf = 0;
    const vh = window.innerHeight || 1;
    const small = !mq.matches || reduced.matches;
    pins.forEach((pinSec) => {
      const track = pinSec.querySelector("[data-pin-track]");
      if (small) {
        pinSec.style.removeProperty("--p");
        if (track) track.style.transform = "";
        return;
      }
      const top = pinSec.getBoundingClientRect().top;
      const len = Math.max(1, pinSec.offsetHeight - vh);
      const prog = Math.min(1, Math.max(0, -top / len));
      pinSec.style.setProperty("--p", prog.toFixed(4));
      if (track) {
        const host = track.parentElement;
        const dist = Math.max(0, track.scrollWidth - host.clientWidth);
        track.style.transform = "translate3d(" + (-prog * dist).toFixed(2) + "px,0,0)";
      }
    });
  }
  function queue() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  window.addEventListener("load", queue);
  update();
})();