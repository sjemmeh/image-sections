/**
 * Image Sections Plugin – Public JavaScript
 * Provides lightbox functionality for grid layouts with lightbox enabled.
 */
(function () {
  'use strict';

  let overlay = null;
  let currentItems = [];
  let currentIndex = 0;

  function createOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'is-lightbox-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <button class="is-lightbox-close" aria-label="Sluiten">&times;</button>
      <button class="is-lightbox-nav is-lightbox-prev" aria-label="Vorige">&lsaquo;</button>
      <img src="" alt="" />
      <button class="is-lightbox-nav is-lightbox-next" aria-label="Volgende">&rsaquo;</button>
    `;

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    overlay.querySelector('.is-lightbox-close').addEventListener('click', close);
    overlay.querySelector('.is-lightbox-prev').addEventListener('click', function (e) {
      e.stopPropagation();
      navigate(-1);
    });
    overlay.querySelector('.is-lightbox-next').addEventListener('click', function (e) {
      e.stopPropagation();
      navigate(1);
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  function showImage(index) {
    if (index < 0 || index >= currentItems.length) return;
    currentIndex = index;

    var el = overlay.querySelector('img');
    var item = currentItems[currentIndex];
    el.src = item.src;
    el.alt = item.alt || '';

    var prevBtn = overlay.querySelector('.is-lightbox-prev');
    var nextBtn = overlay.querySelector('.is-lightbox-next');
    prevBtn.style.display = currentItems.length > 1 ? '' : 'none';
    nextBtn.style.display = currentItems.length > 1 ? '' : 'none';
  }

  function open(items, startIndex) {
    currentItems = items;
    currentIndex = startIndex || 0;

    var el = createOverlay();
    showImage(currentIndex);

    el.style.display = 'flex';
    // Force reflow before adding class for transition
    void el.offsetWidth;
    el.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);
    // Hide after transition so it no longer intercepts pointer events
    overlay.addEventListener('transitionend', function onEnd() {
      overlay.removeEventListener('transitionend', onEnd);
      if (!overlay.classList.contains('is-active')) {
        overlay.style.display = 'none';
      }
    });
  }

  function navigate(direction) {
    var nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = currentItems.length - 1;
    if (nextIndex >= currentItems.length) nextIndex = 0;
    showImage(nextIndex);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  }

  function init() {
    var sections = document.querySelectorAll('.is-has-lightbox');

    sections.forEach(function (section) {
      var gridItems = section.querySelectorAll('[data-is-lightbox]');

      gridItems.forEach(function (gridItem, index) {
        gridItem.addEventListener('click', function () {
          var items = [];
          gridItems.forEach(function (gi) {
            var img = gi.querySelector('img');
            if (img) {
              items.push({ src: img.src, alt: img.alt || '' });
            }
          });
          open(items, index);
        });
      });
    });
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
