/**
 * Image Sections Plugin – Public JavaScript
 * Provides lightbox functionality for layouts with lightbox enabled.
 */
(function () {
  'use strict';

  let overlay = null;
  let currentItems = [];
  let currentIndex = 0;
  let triggerElement = null;

  const LABELS = {
    en: { close: 'Close', prev: 'Previous', next: 'Next', dialogTitle: 'Image viewer' },
    nl: { close: 'Sluiten', prev: 'Vorige', next: 'Volgende', dialogTitle: 'Afbeelding bekijken' },
  };

  function getLabels() {
    const docLang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    return LABELS[docLang] || LABELS.en;
  }

  function focusableInOverlay() {
    if (!overlay) return [];
    return Array.from(
      overlay.querySelectorAll('button:not([disabled]):not([style*="display: none"]):not([style*="display:none"])'),
    ).filter(function (node) {
      return node.offsetParent !== null;
    });
  }

  function createOverlay() {
    if (overlay) return overlay;

    const labels = getLabels();

    overlay = document.createElement('div');
    overlay.className = 'is-lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'is-lightbox-title');
    overlay.style.display = 'none';
    overlay.innerHTML =
      '<h2 id="is-lightbox-title" class="is-sr-only">' + labels.dialogTitle + '</h2>' +
      '<button type="button" class="is-lightbox-close" aria-label="' + labels.close + '">&times;</button>' +
      '<button type="button" class="is-lightbox-nav is-lightbox-prev" aria-label="' + labels.prev + '">&lsaquo;</button>' +
      '<figure class="is-lightbox-figure">' +
      '<img src="" alt="" />' +
      '<figcaption class="is-lightbox-caption" aria-live="polite"></figcaption>' +
      '</figure>' +
      '<button type="button" class="is-lightbox-nav is-lightbox-next" aria-label="' + labels.next + '">&rsaquo;</button>';

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

    var caption = overlay.querySelector('.is-lightbox-caption');
    var title = (item.title || item.alt || '').trim();
    caption.textContent = title;
    caption.style.display = title ? '' : 'none';

    var prevBtn = overlay.querySelector('.is-lightbox-prev');
    var nextBtn = overlay.querySelector('.is-lightbox-next');
    prevBtn.style.display = currentItems.length > 1 ? '' : 'none';
    nextBtn.style.display = currentItems.length > 1 ? '' : 'none';
  }

  function open(items, startIndex, trigger) {
    currentItems = items;
    currentIndex = startIndex || 0;
    triggerElement = trigger || document.activeElement;

    var el = createOverlay();
    showImage(currentIndex);

    el.style.display = 'flex';
    // Force reflow before adding class for transition
    void el.offsetWidth;
    el.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    // Move focus into the dialog so keyboard users land on the close button.
    var closeBtn = overlay.querySelector('.is-lightbox-close');
    if (closeBtn) closeBtn.focus();
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

    // Restore focus to whatever opened the lightbox.
    if (triggerElement && typeof triggerElement.focus === 'function') {
      try { triggerElement.focus(); } catch (_err) { /* element may be gone */ }
    }
    triggerElement = null;
  }

  function navigate(direction) {
    var nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = currentItems.length - 1;
    if (nextIndex >= currentItems.length) nextIndex = 0;
    showImage(nextIndex);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusables = focusableInOverlay();
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !overlay.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !overlay.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'Tab') trapFocus(e);
  }

  function initNewsScrollers() {
    var labels = getLabels();
    document.querySelectorAll('.is-layout-news').forEach(function (section) {
      var scroll = section.querySelector('.is-news-scroll');
      if (!scroll) return;

      var prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'is-news-prev';
      prevBtn.setAttribute('aria-label', labels.prev);
      prevBtn.innerHTML = '&lsaquo;';
      section.appendChild(prevBtn);

      var nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'is-news-next';
      nextBtn.setAttribute('aria-label', labels.next);
      nextBtn.innerHTML = '&rsaquo;';
      section.appendChild(nextBtn);

      function scrollAmount() {
        var card = scroll.querySelector('.is-news-card');
        var gap = parseFloat(getComputedStyle(scroll).gap) || 20;
        return card ? card.offsetWidth + gap : 300;
      }

      function updateBtns() {
        var isScrollable = scroll.scrollWidth > scroll.clientWidth + 4;
        scroll.classList.toggle('is-news-scrollable', isScrollable);

        var atStart = scroll.scrollLeft <= 4;
        var atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
        prevBtn.style.display = atStart ? 'none' : '';
        nextBtn.style.display = atEnd ? 'none' : '';
      }

      prevBtn.addEventListener('click', function () {
        scroll.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', function () {
        scroll.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      });
      scroll.addEventListener('scroll', updateBtns, { passive: true });
      window.addEventListener('resize', updateBtns, { passive: true });
      updateBtns();
    });
  }

  function init() {
    initNewsScrollers();

    var sections = document.querySelectorAll('.is-has-lightbox');

    sections.forEach(function (section) {
      var gridItems = section.querySelectorAll('[data-is-lightbox]');

      gridItems.forEach(function (gridItem, index) {
        // Make non-button triggers keyboard-activatable so the lightbox
        // is reachable without a mouse.
        if (!gridItem.hasAttribute('tabindex')) gridItem.setAttribute('tabindex', '0');
        if (!gridItem.hasAttribute('role')) gridItem.setAttribute('role', 'button');

        var openFromEvent = function (e) {
          // Ignore clicks/keys that originated on an interactive element
          // (e.g. the card's CTA button/link) so only the image opens the lightbox.
          if (e.target.closest('a, button')) return;

          var items = [];
          gridItems.forEach(function (gi) {
            var img = gi.querySelector('img');
            if (img) {
              var title = gi.getAttribute('data-is-title') || img.alt || '';
              var src = gi.getAttribute('data-is-full-src') || img.src;
              items.push({ src: src, alt: img.alt || '', title: title });
            }
          });
          open(items, index, gridItem);
        };

        gridItem.addEventListener('click', openFromEvent);
        gridItem.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFromEvent(e);
          }
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
