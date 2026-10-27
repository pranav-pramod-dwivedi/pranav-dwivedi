/* ============================================================
   PRANAV DWIVEDI — touch states
   Mobile devices do not have hover, so tap/hold a card, row or
   tile to get the same visual state the desktop hover provides.
   ============================================================ */
(() => {
  const doc = document;
  const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (!coarse) return;

  doc.documentElement.classList.add("is-touch-device");

  const targets = [
    "a", "button",
    ".wk-row", ".nw-row", ".sg-row", ".tile", ".social",
    ".pg-panel", ".ct-card", ".pg-link-card", ".pg-fact",
    ".pg-ledger__row", ".pg-stack__row", ".pg-matrix__cell",
    ".pg-checks li", ".pg-tag-cloud span",
    ".panel", ".panel--img-hoverable", ".ph",
    ".ck-wall__cell", ".ck-knocks li", ".ck-moments figure",
    ".ck-arc__list li", ".ck-honours__list li",
    ".ck-table tbody tr", ".ot-card", ".ot-kit__card",
    ".ot-results__row", ".ot-record-pill", ".ot-cta",
    ".hero__portrait", ".race__cta", ".newsletter__field button"
  ].join(",");

  const clear = (el) => {
    if (el._touchTimer) clearTimeout(el._touchTimer);
    el._touchTimer = setTimeout(() => {
      el.classList.remove("is-touch");
      el._touchTimer = 0;
    }, 900);
  };

  doc.addEventListener("pointerdown", (event) => {
    const el = event.target.closest(targets);
    if (!el) return;
    el.classList.add("is-touch");
    clear(el);
  }, { passive: true });

  // Keep the touch state visible while the finger scrolls across a row.
  doc.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch") return;
    const el = event.target.closest(targets);
    if (!el) return;
    if (!el.classList.contains("is-touch")) el.classList.add("is-touch");
    clear(el);
  }, { passive: true });
})();
