/* ============================================================
   PRANAV DWIVEDI — scroll motion
   Adds staggered section reveals, soft image parallax and a
   small lime line draw. Everything is progressive: without JS
   the pages remain fully visible.
   ============================================================ */
(() => {
  const doc = document;
  const root = doc.documentElement;
  const main = doc.querySelector("main");
  if (!main) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;


  /* ==========================================================
     CINEMA MOTION
     The editorial pages mark each section with data-motion.
     A single observer gives every section its own reveal; the
     CSS supplies the actual choreography per section type.
     ========================================================== */
  const cinema = [...main.querySelectorAll("section[data-motion]")];

  if (cinema.length) {
    initCinema(cinema);
    return;
  }

  function initCinema(sections) {
    const TARGETS = {
      ledger: ".pg-ledger__row",
      matrix: ".pg-matrix__cell",
      facts: ".pg-fact",
      checks: ".pg-checks li",
      timeline: ".pg-timeline li",
      prose: ".pg-prose p",
      tags: ".pg-tag-cloud span",
      stack: ".pg-stack__row",
      quote: ".pg-quote p, .pg-quote cite, .pg-note-line",
      links: ".pg-link-card",
      rows: ".wk-row, .nw-row, .sg-row, .ct-list li",
      privacy: ".privacy-block",
      hero: ".pg-title, .pg-lede, .pg-hero__aside, .sg-hero__copy, .sg-hero__art, .wk-hero__meta, .sg-hero__foot",
      poster: ".pg-panel, .ct-card, .pg-split, .pg-link-grid",
      split: ".sg-principles article, .sg-manifesto__grid > div:last-child",
      band: ".pg-band__grid > div, .sg-release__grid > div",
    };

    const heads = ".pg-head, .wk-list-intro, .wk-hero__grid, .wk-branch__grid, .sg-systems__head, .sg-manifesto__grid > div, .sg-release__grid > div, .err-more, .nw-cat, .privacy-wrap > h1, .privacy-wrap > .pg-lede";
    const GAPS = {
      ledger: [45, 55, 65, 75],
      matrix: [55, 65, 75, 85],
      facts: [50, 60, 70, 80],
      checks: [60, 70, 80, 90],
      timeline: [55, 65, 75, 85],
      prose: [90, 110, 130, 150],
      tags: [22, 26, 30, 34],
      stack: [45, 55, 65, 75],
      links: [70, 80, 90, 100],
      rows: [40, 48, 56, 64],
      privacy: [50, 60, 70, 80],
      poster: [55, 65, 75, 85],
      split: [65, 75, 85, 95],
    };

    sections.forEach((section, sectionIndex) => {
      const kind = section.dataset.motion || "poster";
      const direction = section.dataset.dir || "up";
      const headX = direction === "left" ? -30 : direction === "right" ? 30 : 0;
      const gapSet = GAPS[kind] || GAPS.poster;
      section.style.setProperty("--m-head-x", headX + "px");
      section.style.setProperty("--m-gap", gapSet[sectionIndex % gapSet.length] + "ms");

      section.querySelectorAll(heads).forEach((el, index) => {
        el.style.setProperty("--i", String(Math.min(index, 8)));
      });

      const selector = TARGETS[kind] || TARGETS.poster;
      const targets = [...section.querySelectorAll(selector)];
      targets.forEach((el, index) => {
        const i = Math.min(index, 12);
        el.style.setProperty("--i", String(i));

        if (kind === "matrix") {
          const column = i % 3;
          el.style.setProperty("--m-x", column === 0 ? "-26px" : column === 2 ? "26px" : "0px");
        }
        if (kind === "facts") {
          el.style.setProperty("--m-rot", (i % 2 ? 0.7 : -0.7) + "deg");
        }
        if (kind === "tags") {
          el.style.setProperty("--m-rot", (i % 3 === 0 ? -3 : i % 3 === 1 ? 2 : -1) + "deg");
        }
        if (kind === "stack" || kind === "rows") {
          el.style.setProperty("--m-x", (i % 2 ? 20 : -20) + "px");
        }
        if (kind === "links") {
          el.style.setProperty("--m-ry", (i % 3 === 0 ? -7 : i % 3 === 1 ? 7 : 0) + "deg");
        }
      });

      const timeline = section.querySelectorAll(".pg-timeline li");
      timeline.forEach((li, i) => {
        const year = li.querySelector(".pg-timeline__year");
        if (year) year.style.setProperty("--i", String(Math.min(i, 12)));
      });
    });

    root.classList.add("has-cinema");

    const cinemaIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-cinema");
          cinemaIO.unobserve(entry.target);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );

    sections.forEach((section) => cinemaIO.observe(section));

    let cinemaRaf = 0;
    function cinemaPassed() {
      cinemaRaf = 0;
      const vh = window.innerHeight || 1;
      sections.forEach((section) => {
        if (section.classList.contains("is-cinema")) return;
        if (section.getBoundingClientRect().top < vh * 0.92) {
          section.classList.add("is-cinema");
        }
      });
    }
    function requestCinemaPassed() {
      if (!cinemaRaf) cinemaRaf = requestAnimationFrame(cinemaPassed);
    }
    window.addEventListener("scroll", requestCinemaPassed, { passive: true });
    window.addEventListener("resize", requestCinemaPassed);
    window.addEventListener("load", requestCinemaPassed);
    requestCinemaPassed();

    /* The band gets a soft pointer spotlight once it has revealed. */
    sections.forEach((section) => {
      if (section.dataset.motion !== "band") return;
      section.addEventListener(
        "pointermove",
        (event) => {
          const rect = section.getBoundingClientRect();
          section.style.setProperty("--mx", (event.clientX - rect.left) + "px");
          section.style.setProperty("--my", (event.clientY - rect.top) + "px");
        },
        { passive: true }
      );
    });
  }

  const ITEM_SELECTOR = [
    ".pg-topline",
    ".pg-head",
    ".pg-title",
    ".pg-lede",
    ".pg-hero__aside",
    ".wk-hero__meta",
    ".wk-branch__grid",
    ".wk-list-intro",
    ".wk-row",
    ".pg-panel",
    ".pg-band__grid",
    ".pg-fact",
    ".pg-timeline li",
    ".pg-link-card",
    ".nw-cat",
    ".nw-row",
    ".ct-card",
    ".ct-list",
    ".privacy-wrap > *",
    ".err-code",
    ".err-title",
    ".err-copy",
    ".err-links",
    ".sg-hero__top",
    ".sg-hero__copy",
    ".sg-hero__art",
    ".sg-hero__foot",
    ".sg-manifesto__grid > div:first-child",
    ".sg-principles article",
    ".sg-systems__head",
    ".sg-row",
    ".sg-list__more",
    ".sg-release__grid > div",
    ".sg-foot__top",
    ".sg-foot__base",
    ".season__top",
    ".season__title",
    ".season__copy",
    ".stats",
    ".season__foot",
    ".partners__marquee",
    ".social",
    ".gallery__action",
    ".tile",
    ".ot-hero__title",
    ".ot-hero__meta",
    ".ot-intro__grid",
    ".ot-strip__grid",
    ".ot-statement__inner",
    ".ck-callout__inner",
  ].join(",");

  const SKIP = new Set([
    "hero",
    "hscroll",
  ]);

  const items = [];
  const sections = [...main.querySelectorAll(":scope > section")];
  const roots = sections.length ? sections : [main];

  roots.forEach((section) => {
    if (SKIP.has(section.className.split(" ")[0])) return;
    section.classList.add("m-section");

    let found = [...section.querySelectorAll(ITEM_SELECTOR)];

    // Fallback: animate the top-level blocks of the section wrapper.
    if (!found.length) {
      const wrap = section.querySelector(".wrap, .sg-wrap, .ot-wrap");
      const scope = wrap || section;
      found = [...scope.children];
    }

    // Drop elements nested inside another candidate so transforms never stack.
    found = found.filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.closest(".menu, .nav, .footer, .sg-nav, .sg-foot")) return false;
      if (el.hasAttribute("data-reveal")) return false;
      if (el.matches(".cricketer__title, .stat, .gallery__title")) return false;
      return !found.some((other) => other !== el && other.contains(el));
    });

    found.slice(0, 12).forEach((el, index) => {
      el.classList.add("m-item");
      el.style.setProperty("--m-i", String(Math.min(index, 6)));
      if (el.matches(".pg-portrait, .sg-hero__art, .ot-collage__main, .tile")) {
        el.classList.add("m-item--scale");
      }
      items.push(el);
    });
  });

  if (!items.length) return;

  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealIO.unobserve(entry.target);
      });
    },
    { threshold: 0.06, rootMargin: "0px 0px -7% 0px" }
  );

  items.forEach((el) => revealIO.observe(el));
  root.classList.add("has-motion");

  // Anchor jumps and fast scrolls can skip sections. Once an item has passed
  // the reveal line, it should stay visible rather than being stranded hidden.
  let revealRaf = 0;
  function revealPassed() {
    revealRaf = 0;
    const vh = window.innerHeight || 1;
    items.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("is-in");
    });
  }
  function requestRevealPassed() {
    if (!revealRaf) revealRaf = requestAnimationFrame(revealPassed);
  }
  window.addEventListener("scroll", requestRevealPassed, { passive: true });
  window.addEventListener("resize", requestRevealPassed);
  window.addEventListener("load", requestRevealPassed);
  requestRevealPassed();

  /* ---------------- soft scroll parallax ---------------- */
  const parallaxFrames = new Map();

  roots.forEach((section) => {
    if (SKIP.has(section.className.split(" ")[0])) return;

    section.querySelectorAll("figure, .pg-portrait, .tile, .ph").forEach((el) => {
      if (el.closest(".hero, .hscroll")) return;
      el.classList.add("m-parallax");
      parallaxFrames.set(el, el);
    });
  });

  main.querySelectorAll(".sg-hero__art").forEach((el) => {
    el.classList.add("m-drift");
    parallaxFrames.set(el, el);
  });

  const parallaxEls = [...parallaxFrames.keys()];
  const geo = parallaxEls.map(() => ({ top: 0, height: 0 }));
  let pageTop = 0; // scrollY at time of geometry capture
  let raf = 0;

  function captureGeometry() {
    pageTop = window.scrollY || 0;
    parallaxEls.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      geo[i].top = rect.top + pageTop; // document-space offset
      geo[i].height = rect.height;
    });
  }

  function updateParallax() {
    raf = 0;
    const vh = window.innerHeight || 1;
    const sy = window.scrollY || 0;
    for (let i = 0; i < parallaxEls.length; i++) {
      const g = geo[i];
      const center = g.top - sy + g.height / 2;
      if (center < -160 || center > vh + 160) continue;
      const progress = (center - vh / 2) / vh;
      const shift = Math.max(-18, Math.min(18, -progress * 26));
      parallaxEls[i].style.setProperty("--m-py", `${shift.toFixed(2)}px`);
    }
  }

  function requestParallax(recompute) {
    if (recompute && window.scrollY < pageTop - 4) captureGeometry();
    if (!raf) raf = requestAnimationFrame(updateParallax);
  }

  captureGeometry();
  // lazy-loaded images change document offsets — recapture on each resource load
  window.addEventListener("load", () => { captureGeometry(); requestParallax(false); }, true);
  // scroll is now a pure read of window.scrollY — no layout reads per frame.
  window.addEventListener("scroll", () => requestParallax(false), { passive: true });
  window.addEventListener("resize", () => { captureGeometry(); requestParallax(false); });
  window.addEventListener("load", () => { captureGeometry(); requestParallax(false); });
  requestParallax(false);
})();
