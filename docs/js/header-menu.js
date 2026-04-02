const toggleButton = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const menuItems = mobileMenu ? mobileMenu.querySelectorAll(".menu-item") : [];
const lineTop = document.querySelector("[data-line-top]");
const lineMiddle = document.querySelector("[data-line-middle]");
const lineBottom = document.querySelector("[data-line-bottom]");
const siteHeader = document.querySelector("[data-site-header]");

if (toggleButton && mobileMenu && mobilePanel) {
  const openMenu = () => {
    mobileMenu.classList.remove("opacity-0", "pointer-events-none");
    mobileMenu.classList.add("opacity-100", "pointer-events-auto");
    mobilePanel.classList.remove("opacity-0", "scale-95", "translate-y-4");
    mobilePanel.classList.add("opacity-100", "scale-100", "translate-y-0");
    menuItems.forEach((item) => {
      item.classList.remove("opacity-0", "-translate-y-2");
      item.classList.add("opacity-100", "translate-y-0");
    });
    toggleButton.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
    lineTop?.classList.add("translate-y-[9px]", "rotate-45");
    lineMiddle?.classList.add("opacity-0");
    lineBottom?.classList.add("-translate-y-[9px]", "-rotate-45");
  };

  const closeMenu = () => {
    mobileMenu.classList.add("opacity-0", "pointer-events-none");
    mobileMenu.classList.remove("opacity-100", "pointer-events-auto");
    mobilePanel.classList.add("opacity-0", "scale-95", "translate-y-4");
    mobilePanel.classList.remove("opacity-100", "scale-100", "translate-y-0");
    menuItems.forEach((item) => {
      item.classList.add("opacity-0", "-translate-y-2");
      item.classList.remove("opacity-100", "translate-y-0");
    });
    toggleButton.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
    lineTop?.classList.remove("translate-y-[9px]", "rotate-45");
    lineMiddle?.classList.remove("opacity-0");
    lineBottom?.classList.remove("-translate-y-[9px]", "-rotate-45");
  };

  const isOpen = () => toggleButton.getAttribute("aria-expanded") === "true";

  toggleButton.addEventListener("click", () => {
    if (isOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileMenu.addEventListener("click", (event) => {
    const target = event.target;
    if (target === mobileMenu || target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isOpen()) {
      return;
    }
    const target = event.target;
    if (!mobilePanel.contains(target) && !toggleButton.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      closeMenu();
    }
  });

  const desktopMediaQuery = window.matchMedia("(min-width: 1024px)");
  const closeOnDesktop = (event) => {
    if (event.matches) {
      closeMenu();
    }
  };

  if (typeof desktopMediaQuery.addEventListener === "function") {
    desktopMediaQuery.addEventListener("change", closeOnDesktop);
  } else if (typeof desktopMediaQuery.addListener === "function") {
    desktopMediaQuery.addListener(closeOnDesktop);
  }

  closeOnDesktop(desktopMediaQuery);
}

if (siteHeader) {
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const glassClasses = [
    "bg-black/80",
    "border-white/10",
    "shadow-[0_12px_30px_rgba(15,23,42,0.2)]",
  ];

  if (!isCoarsePointer) {
    glassClasses.push("backdrop-blur-lg");
  }

  const applyGlass = () => {
    const shouldApply = window.scrollY > 12;
    if (shouldApply) {
      siteHeader.classList.add(...glassClasses);
      siteHeader.classList.remove("bg-transparent", "border-transparent");
      return;
    }

    siteHeader.classList.remove(...glassClasses);
    siteHeader.classList.add("bg-transparent", "border-transparent");
  };

  let isTicking = false;
  const onScroll = () => {
    if (isTicking) {
      return;
    }
    isTicking = true;
    window.requestAnimationFrame(() => {
      applyGlass();
      isTicking = false;
    });
  };

  applyGlass();
  window.addEventListener("scroll", onScroll, { passive: true });
}
