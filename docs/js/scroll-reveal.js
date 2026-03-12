(() => {
  const elements = Array.from(document.querySelectorAll("[data-scroll-fade]"));
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    elements.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return;
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getConfig = (element) => {
    const distance = Number.parseFloat(element.dataset.scrollDistance || "32");
    const axis = (element.dataset.scrollAxis || "y").toLowerCase();
    const start = Number.parseFloat(element.dataset.scrollStart || "1.0");
    const end = Number.parseFloat(element.dataset.scrollEnd || "0.6");
    return {
      distance,
      axis: axis === "x" ? "x" : "y",
      start: Number.isFinite(start) ? start : 1.0,
      end: Number.isFinite(end) ? end : 0.6,
    };
  };

  const setInitial = (element) => {
    const { distance, axis } = getConfig(element);
    const x = axis === "x" ? distance : 0;
    const y = axis === "y" ? distance : 0;
    element.style.opacity = "0";
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    element.style.willChange = "transform, opacity";
  };

  elements.forEach(setInitial);

  const getViewportHeight = () => {
    const visualViewport = window.visualViewport;
    if (visualViewport && Number.isFinite(visualViewport.height)) {
      return visualViewport.height;
    }
    return window.innerHeight || 0;
  };

  const update = () => {
    const vh = getViewportHeight();
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const { distance, axis, start, end } = getConfig(element);
      const startPx = vh * start;
      const endPx = vh * end;
      const range = startPx - endPx || 1;
      const progressRaw = clamp((startPx - rect.top) / range, 0, 1);
      const progress = progressRaw * progressRaw * (3 - 2 * progressRaw);
      const offset = (1 - progress) * distance;
      const x = axis === "x" ? offset : 0;
      const y = axis === "y" ? offset : 0;
      element.style.opacity = progress.toFixed(3);
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  let ticking = false;
  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  update();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", update);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", update);
    window.visualViewport.addEventListener("scroll", requestTick, { passive: true });
  }
})();
