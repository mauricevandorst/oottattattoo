const INTRO_STORAGE_KEY = "oottat_intro_shown";
const INTRO_COMPLETE_EVENT = "oottat:intro-complete";

const overlay = document.querySelector("[data-intro-overlay]");
const logoContainer = document.querySelector("[data-intro-logo]");

if (overlay && logoContainer) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const alreadyShown = sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";

  if (alreadyShown || prefersReducedMotion) {
    overlay.classList.add("hidden");
    window.dispatchEvent(new CustomEvent(INTRO_COMPLETE_EVENT));
  } else {
    const brand = overlay.querySelector("[data-intro-brand]");
    const timeline = overlay.querySelector("[data-intro-timeline]");
    const steps = [...overlay.querySelectorAll("[data-intro-step]")];
    const progressBar = overlay.querySelector("[data-intro-progress]");
    const skipButton = overlay.querySelector("[data-intro-skip]");

    const AUTO_DURATION = 1800;
    const TIMELINE_REVEAL_DELAY = 120;
    const OVERLAY_FADE_DURATION = 800;
    const LOGO_FADE_DURATION = 700;
    const COMPLETE_HIDE_DELAY = Math.max(
      OVERLAY_FADE_DURATION,
      LOGO_FADE_DURATION
    );
    const WHEEL_SPEED = 900;
    const TOUCH_SPEED = 260;
    const KEY_STEP = 0.14;

    let progress = 0;
    let animationFrameId = 0;
    let autoStart = 0;
    let touchY = null;
    let isCompleting = false;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const setStepState = () => {
      if (!steps.length) {
        return;
      }

      const rawIndex = Math.floor(progress * steps.length);
      const activeIndex = Math.min(rawIndex, steps.length - 1);

      steps.forEach((step, index) => {
        const isActive = index === activeIndex;
        step.classList.toggle("opacity-100", isActive);
        step.classList.toggle("translate-y-0", isActive);
        step.classList.toggle("opacity-0", !isActive);
        step.classList.toggle("translate-y-4", !isActive);
      });
    };

    const applyProgress = (nextProgress) => {
      progress = clamp(nextProgress, 0, 1);

      if (progressBar) {
        progressBar.style.transform = `scaleX(${progress})`;
      }

      setStepState();

      if (progress >= 1) {
        completeIntro();
      }
    };

    const tick = (timestamp) => {
      if (isCompleting) {
        return;
      }

      if (!autoStart) {
        autoStart = timestamp;
      }

      const elapsed = timestamp - autoStart;
      const autoProgress = elapsed / AUTO_DURATION;

      applyProgress(Math.max(progress, autoProgress));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(tick);
      }
    };

    const cleanupInteractionListeners = () => {
      window.removeEventListener("wheel", onWheel, { passive: false });
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart, { passive: true });
      window.removeEventListener("touchmove", onTouchMove, { passive: false });
      if (skipButton) {
        skipButton.removeEventListener("click", completeIntro);
      }
    };

    function completeIntro() {
      if (isCompleting) {
        return;
      }

      isCompleting = true;
      window.cancelAnimationFrame(animationFrameId);
      cleanupInteractionListeners();

      logoContainer.classList.add(
        "opacity-0",
        "scale-95",
        "transition-all"
      );
      logoContainer.style.transitionDuration = `${LOGO_FADE_DURATION}ms`;
      overlay.classList.remove("opacity-100");
      overlay.classList.add("opacity-0");

      window.setTimeout(() => {
        overlay.classList.add("hidden", "pointer-events-none");
        overlay.style.transitionDuration = "";
        logoContainer.style.transitionDuration = "";
        document.body.classList.remove("overflow-hidden");
        sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
        window.dispatchEvent(new CustomEvent(INTRO_COMPLETE_EVENT));
      }, COMPLETE_HIDE_DELAY);
    }

    const onWheel = (event) => {
      event.preventDefault();
      applyProgress(progress + Math.abs(event.deltaY) / WHEEL_SPEED);
    };

    const onTouchStart = (event) => {
      touchY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event) => {
      if (touchY === null) {
        return;
      }

      const nextY = event.touches[0]?.clientY ?? touchY;
      const delta = Math.abs(touchY - nextY);
      if (delta < 1) {
        return;
      }

      event.preventDefault();
      touchY = nextY;
      applyProgress(progress + delta / TOUCH_SPEED);
    };

    const onKeyDown = (event) => {
      const forwardKeys = ["ArrowDown", "PageDown", " ", "Enter"];
      if (!forwardKeys.includes(event.key)) {
        return;
      }

      event.preventDefault();
      applyProgress(progress + KEY_STEP);
    };

    document.body.classList.add("overflow-hidden");
    overlay.classList.remove("pointer-events-none");
    overlay.classList.add("transition-opacity");
    overlay.style.transitionDuration = `${OVERLAY_FADE_DURATION}ms`;

    requestAnimationFrame(() => {
      overlay.classList.add("opacity-100");
      if (brand) {
        brand.classList.remove("opacity-0", "scale-90");
        brand.classList.add("opacity-100", "scale-100");
      }

      window.setTimeout(() => {
        if (timeline) {
          timeline.classList.remove("opacity-0", "translate-y-3");
          timeline.classList.add("opacity-100", "translate-y-0");
        }

        applyProgress(0);
        animationFrameId = window.requestAnimationFrame(tick);
      }, TIMELINE_REVEAL_DELAY);
    });

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    if (skipButton) {
      skipButton.addEventListener("click", completeIntro);
    }
  }
}
