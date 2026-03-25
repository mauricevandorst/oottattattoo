const instagramLazyVideos = document.querySelectorAll("[data-instagram-lazy-video]");
const instagramSection = document.querySelector("#instagram");

if (instagramLazyVideos.length > 0) {
  const loadAndPlayVideo = (video) => {
    if (video.dataset.loaded === "true") return;

    const source = video.querySelector("source[data-src]");
    if (!source) return;

    source.src = source.dataset.src;
    video.load();
    video.dataset.loaded = "true";

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Sommige browsers blokkeren autoplay zonder interactie.
      });
    }
  };

  if ("IntersectionObserver" in window && instagramSection) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          instagramLazyVideos.forEach((video) => loadAndPlayVideo(video));
          sectionObserver.disconnect();
        });
      },
      { rootMargin: "200px 0px", threshold: 0.05 }
    );

    sectionObserver.observe(instagramSection);
  } else {
    instagramLazyVideos.forEach((video) => loadAndPlayVideo(video));
  }
}
