(() => {
  const root = document.documentElement;
  if (!root) return;

  const viewportHeight =
    window.visualViewport && Number.isFinite(window.visualViewport.height)
      ? window.visualViewport.height
      : window.innerHeight;

  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return;

  const initialDvh = viewportHeight * 0.98;
  root.style.setProperty("--initial-dvh", `${initialDvh}px`);
})();
