const video = document.querySelector("[data-hero-video]");
const heroOverlay = document.querySelector("[data-hero-overlay]");

if (video && heroOverlay) {
  const revealDelayMs = 250;
  const replayDelayMs = 200;
  const stallThresholdMs = 6000;
  const interactionRecoveryCooldownMs = 350;
  let revealed = false;
  let stallTimerId = null;
  let recoveryTimerId = null;
  let lastPlaybackTime = -1;
  let lastInteractionRecoveryAt = 0;

  const reveal = () => {
    if (revealed) return;
    revealed = true;
    video.classList.remove("opacity-0");
    heroOverlay.classList.remove("opacity-0");
  };

  const scheduleReveal = () => {
    window.setTimeout(reveal, revealDelayMs);
  };

  const tryPlay = () => {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Sommige mobiele browsers blokkeren autoplay tijdelijk na lifecycle-events.
      });
    }
  };

  const restorePlayback = () => {
    if (document.hidden) return;

    window.setTimeout(() => {
      if (video.paused || video.ended) {
        tryPlay();
      }
    }, replayDelayMs);
  };

  const recoverPlaybackFromInteraction = () => {
    if (document.hidden) return;

    const now = window.performance?.now?.() ?? Date.now();
    if (now - lastInteractionRecoveryAt < interactionRecoveryCooldownMs) {
      return;
    }
    lastInteractionRecoveryAt = now;

    if (recoveryTimerId) {
      window.clearTimeout(recoveryTimerId);
    }

    recoveryTimerId = window.setTimeout(() => {
      if (video.paused || video.ended || video.readyState < 2) {
        tryPlay();
      }
    }, 60);
  };

  const resetStallWatcher = () => {
    if (stallTimerId) {
      window.clearInterval(stallTimerId);
    }

    stallTimerId = window.setInterval(() => {
      if (document.hidden) return;
      if (video.paused || video.ended || video.readyState < 2) return;

      if (lastPlaybackTime === video.currentTime) {
        tryPlay();
      }

      lastPlaybackTime = video.currentTime;
    }, stallThresholdMs);
  };

  const startVideo = () => {
    // Keep this explicit for stricter mobile browsers.
    video.muted = true;
    video.playsInline = true;
    tryPlay();

    if (video.readyState >= 2) {
      scheduleReveal();
    } else {
      video.addEventListener("canplay", scheduleReveal, { once: true });
    }
  };

  video.addEventListener("play", () => {
    lastPlaybackTime = video.currentTime;
  });

  video.addEventListener("pause", () => {
    restorePlayback();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      restorePlayback();
    }
  });

  window.addEventListener("pageshow", () => {
    restorePlayback();
  });

  window.addEventListener("focus", () => {
    restorePlayback();
  });

  window.addEventListener("scroll", recoverPlaybackFromInteraction, { passive: true });
  window.addEventListener("touchstart", recoverPlaybackFromInteraction, { passive: true });
  window.addEventListener("pointerdown", recoverPlaybackFromInteraction, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("scroll", recoverPlaybackFromInteraction, { passive: true });
    window.visualViewport.addEventListener("resize", recoverPlaybackFromInteraction, { passive: true });
  }

  window.addEventListener("beforeunload", () => {
    if (stallTimerId) {
      window.clearInterval(stallTimerId);
    }
    if (recoveryTimerId) {
      window.clearTimeout(recoveryTimerId);
    }
  });

  startVideo();
  resetStallWatcher();
}
