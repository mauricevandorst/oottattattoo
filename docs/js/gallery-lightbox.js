const gallery = document.querySelector('[data-lightbox-gallery]');

if (gallery) {
  const images = Array.from(gallery.querySelectorAll('img'));
  const modal = document.querySelector('[data-lightbox-modal]');
  const panel = modal?.querySelector('[data-lightbox-panel]');
  const modalImage = modal?.querySelector('[data-lightbox-image]');
  const closeButton = modal?.querySelector('[data-lightbox-close]');
  const prevButton = modal?.querySelector('[data-lightbox-prev]');
  const nextButton = modal?.querySelector('[data-lightbox-next]');

  if (
    images.length &&
    modal &&
    panel &&
    modalImage &&
    closeButton &&
    prevButton &&
    nextButton
  ) {
    const focusableSelector = 'button, [href], [tabindex]:not([tabindex="-1"])';
    const swipeThreshold = 60;
    const maxSwipeOffset = 120;

    let activeIndex = 0;
    let isOpen = false;
    let isAnimating = false;
    let lastFocusedElement = null;

    let pointerTracking = false;
    let pointerId = null;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerCurrentX = 0;
    let pointerCurrentY = 0;
    let isHorizontalSwipe = false;
    let currentDragOffsetX = 0;

    const getImageSource = (image) => image.currentSrc || image.src;
    const preloadedSources = new Set();

    const preloadSource = (source) => {
      if (!source || preloadedSources.has(source)) {
        return;
      }

      const preloadImage = new Image();
      preloadImage.src = source;
      if (typeof preloadImage.decode === 'function') {
        preloadImage.decode().catch(() => {});
      }
      preloadedSources.add(source);
    };

    const setImage = (index) => {
      const currentIndex = (index + images.length) % images.length;
      const source = images[currentIndex];
      const previousSource = images[(currentIndex - 1 + images.length) % images.length];
      const nextSource = images[(currentIndex + 1) % images.length];

      activeIndex = currentIndex;
      modalImage.src = getImageSource(source);
      modalImage.alt = source.alt || 'Vergrote galerij-afbeelding';

      preloadSource(getImageSource(previousSource));
      preloadSource(getImageSource(nextSource));
    };

    const resetDragPreview = () => {
      modalImage.style.transition = '';
      modalImage.style.transform = '';
      modalImage.style.opacity = '';
      currentDragOffsetX = 0;
    };

    const animateImageSwap = (nextIndex, direction, startOffset = 0) => {
      if (isAnimating) {
        return;
      }

      if (!modalImage.animate) {
        setImage(nextIndex);
        return;
      }

      isAnimating = true;
      const baseOutOffset = direction > 0 ? -140 : 140;
      const inOffset = -baseOutOffset;
      const hasValidDirection = startOffset === 0 || Math.sign(startOffset) === Math.sign(baseOutOffset);
      const outFrom = hasValidDirection ? startOffset : 0;
      const outOffset =
        direction > 0
          ? Math.min(outFrom - 80, baseOutOffset)
          : Math.max(outFrom + 80, baseOutOffset);
      const outFromOpacity = 1 - Math.min(Math.abs(outFrom) / 220, 0.35);

      const outAnimation = modalImage.animate(
        [
          { opacity: outFromOpacity, transform: `translateX(${outFrom}px)` },
          { opacity: 0, transform: `translateX(${outOffset}px)` }
        ],
        {
          duration: 190,
          easing: 'cubic-bezier(0.32, 0.02, 0.22, 0.98)',
          fill: 'forwards'
        }
      );

      outAnimation.onfinish = () => {
        setImage(nextIndex);

        window.requestAnimationFrame(() => {
          const inAnimation = modalImage.animate(
            [
              { opacity: 0, transform: `translateX(${inOffset}px)` },
              { opacity: 1, transform: 'translateX(0px)' }
            ],
            {
              duration: 260,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'forwards'
            }
          );

          inAnimation.onfinish = () => {
            isAnimating = false;
            resetDragPreview();
          };

          inAnimation.oncancel = () => {
            isAnimating = false;
            resetDragPreview();
          };
        });
      };

      outAnimation.oncancel = () => {
        isAnimating = false;
        resetDragPreview();
      };
    };

    const stepImage = (step) => {
      if (isAnimating) {
        return;
      }

      const nextIndex = (activeIndex + step + images.length) % images.length;
      const direction = step > 0 ? 1 : -1;
      animateImageSwap(nextIndex, direction);
    };

    const openModal = (index) => {
      if (isOpen) {
        return;
      }

      lastFocusedElement = document.activeElement;
      setImage(index);
      isOpen = true;

      modal.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
      modal.classList.add('opacity-100', 'visible');
      panel.classList.remove('translate-y-3', 'scale-95');
      panel.classList.add('translate-y-0', 'scale-100');
      document.body.classList.add('overflow-hidden');
      closeButton.focus();
    };

    const closeModal = () => {
      if (!isOpen) {
        return;
      }

      isOpen = false;
      pointerTracking = false;
      isHorizontalSwipe = false;
      modal.classList.remove('opacity-100', 'visible');
      modal.classList.add('opacity-0', 'invisible', 'pointer-events-none');
      panel.classList.remove('translate-y-0', 'scale-100');
      panel.classList.add('translate-y-3', 'scale-95');
      document.body.classList.remove('overflow-hidden');
      modalImage.src = '';
      resetDragPreview();

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    };

    const trapFocus = (event) => {
      if (!isOpen || event.key !== 'Tab') {
        return;
      }

      const focusableItems = Array.from(modal.querySelectorAll(focusableSelector)).filter(
        (item) => !item.hasAttribute('disabled') && item.offsetParent !== null
      );

      if (!focusableItems.length) {
        return;
      }

      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    const handlePointerDown = (event) => {
      if (!isOpen || isAnimating) {
        return;
      }

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      if (event.target.closest('[data-lightbox-prev], [data-lightbox-next], [data-lightbox-close]')) {
        return;
      }

      pointerTracking = true;
      pointerId = event.pointerId;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerCurrentX = event.clientX;
      pointerCurrentY = event.clientY;
      isHorizontalSwipe = false;
      currentDragOffsetX = 0;

      if (panel.setPointerCapture) {
        panel.setPointerCapture(event.pointerId);
      }
    };

    const handlePointerMove = (event) => {
      if (!pointerTracking || event.pointerId !== pointerId || isAnimating) {
        return;
      }

      pointerCurrentX = event.clientX;
      pointerCurrentY = event.clientY;
      const deltaX = pointerCurrentX - pointerStartX;
      const deltaY = pointerCurrentY - pointerStartY;

      if (!isHorizontalSwipe) {
        if (Math.abs(deltaX) < 8) {
          return;
        }

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          pointerTracking = false;
          if (panel.hasPointerCapture && panel.hasPointerCapture(event.pointerId)) {
            panel.releasePointerCapture(event.pointerId);
          }
          resetDragPreview();
          return;
        }

        isHorizontalSwipe = true;
      }

      const constrainedOffset = Math.max(-maxSwipeOffset, Math.min(maxSwipeOffset, deltaX));
      currentDragOffsetX = constrainedOffset;
      modalImage.style.transition = 'none';
      modalImage.style.transform = `translateX(${constrainedOffset}px)`;
      modalImage.style.opacity = `${1 - Math.min(Math.abs(constrainedOffset) / 220, 0.35)}`;
    };

    const finalizeSwipe = () => {
      const deltaX = pointerCurrentX - pointerStartX;
      const deltaY = pointerCurrentY - pointerStartY;
      pointerTracking = false;
      isHorizontalSwipe = false;

      const isValidSwipe = Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaY) <= 80;

      if (isValidSwipe) {
        const step = deltaX > 0 ? -1 : 1;
        const direction = step > 0 ? 1 : -1;
        const nextIndex = (activeIndex + step + images.length) % images.length;
        modalImage.style.transition = '';
        animateImageSwap(nextIndex, direction, currentDragOffsetX);
        return;
      }

      modalImage.style.transition = 'transform 180ms ease, opacity 180ms ease';
      modalImage.style.transform = 'translateX(0px)';
      modalImage.style.opacity = '1';
      window.setTimeout(() => {
        modalImage.style.transition = '';
      }, 190);
    };

    const handlePointerUp = (event) => {
      if (!pointerTracking || event.pointerId !== pointerId) {
        return;
      }

      if (panel.hasPointerCapture && panel.hasPointerCapture(event.pointerId)) {
        panel.releasePointerCapture(event.pointerId);
      }

      pointerCurrentX = event.clientX;
      pointerCurrentY = event.clientY;
      finalizeSwipe();
    };

    const handlePointerCancel = (event) => {
      if (!pointerTracking || event.pointerId !== pointerId) {
        return;
      }

      if (panel.hasPointerCapture && panel.hasPointerCapture(event.pointerId)) {
        panel.releasePointerCapture(event.pointerId);
      }

      pointerTracking = false;
      isHorizontalSwipe = false;
      resetDragPreview();
    };

    images.forEach((image, index) => {
      preloadSource(getImageSource(image));
      image.classList.add('cursor-zoom-in');
      image.setAttribute('role', 'button');
      image.setAttribute('tabindex', '0');
      image.setAttribute('aria-haspopup', 'dialog');
      image.setAttribute('aria-label', `${image.alt || 'Afbeelding'} vergroten`);

      image.addEventListener('click', () => openModal(index));
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openModal(index);
        }
      });
    });

    closeButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', () => stepImage(-1));
    nextButton.addEventListener('click', () => stepImage(1));

    panel.addEventListener('pointerdown', handlePointerDown);
    panel.addEventListener('pointermove', handlePointerMove);
    panel.addEventListener('pointerup', handlePointerUp);
    panel.addEventListener('pointercancel', handlePointerCancel);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!isOpen) {
        return;
      }

      if (event.key === 'Escape') {
        closeModal();
      }

      if (event.key === 'ArrowLeft') {
        stepImage(-1);
      }

      if (event.key === 'ArrowRight') {
        stepImage(1);
      }

      trapFocus(event);
    });
  }
}
