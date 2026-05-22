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

    var captionEl = overlay.querySelector('.is-lightbox-caption');
    var title = (item.title || item.alt || '').trim();
    var sub = (item.caption || '').trim();
    // Lightbox caption shows the title prominently; subtitle (if any) renders
    // below in a lighter weight so screen readers announce both via aria-live.
    captionEl.innerHTML = '';
    if (title) {
      var t = document.createElement('span');
      t.className = 'is-lightbox-caption-title';
      t.textContent = title;
      captionEl.appendChild(t);
    }
    if (sub) {
      var s = document.createElement('span');
      s.className = 'is-lightbox-caption-sub';
      s.textContent = sub;
      captionEl.appendChild(s);
    }
    captionEl.style.display = (title || sub) ? '' : 'none';

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

  function initSliders() {
    var prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.is-layout-slider').forEach(function (root) {
      var slides = Array.from(root.querySelectorAll('.is-slide'));
      if (slides.length <= 1) {
        if (slides[0]) slides[0].classList.add('is-slide-active');
        return;
      }

      var dotsContainer = root.querySelector('.is-slider-dots');
      var prevBtn = root.querySelector('.is-slider-prev');
      var nextBtn = root.querySelector('.is-slider-next');
      var track = root.querySelector('.is-slider-track');

      var autoplay = root.dataset.isAutoplay === '1' && !prefersReduce;
      var interval = Number(root.dataset.isInterval) || 5000;
      var timer = null;
      var current = 0;
      var isSlide = root.classList.contains('is-slider-slide');

      // Build dot pagination buttons. ARIA tab pattern — selected dot
      // gets aria-selected="true", others get "false".
      var dots = [];
      if (dotsContainer) {
        slides.forEach(function (_slide, i) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'is-slider-dot';
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', 'Slide ' + (i + 1));
          dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
          dot.addEventListener('click', function () { goTo(i, true); });
          dotsContainer.appendChild(dot);
          dots.push(dot);
        });
      }

      function applyTransform() {
        if (isSlide && track) {
          track.style.setProperty('--is-slider-offset', String(current));
        }
      }

      function goTo(idx, userInitiated) {
        var n = slides.length;
        current = ((idx % n) + n) % n;

        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-slide-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
          dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });

        applyTransform();
        if (userInitiated) restartTimer();
      }

      function next() { goTo(current + 1); }
      function prev() { goTo(current - 1); }

      function startTimer() {
        if (!autoplay || timer) return;
        timer = setInterval(next, interval);
      }
      function stopTimer() {
        if (timer) { clearInterval(timer); timer = null; }
      }
      function restartTimer() {
        if (!autoplay) return;
        stopTimer();
        startTimer();
      }

      if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartTimer(); });

      // Pause autoplay on hover or keyboard focus inside the carousel
      // so users actively engaging with content don't lose their place.
      root.addEventListener('mouseenter', stopTimer);
      root.addEventListener('mouseleave', startTimer);
      root.addEventListener('focusin', stopTimer);
      root.addEventListener('focusout', function (e) {
        // Only resume when focus actually leaves the carousel (not when
        // moving between internal elements).
        if (!root.contains(e.relatedTarget)) startTimer();
      });

      // Keyboard arrows on the carousel container
      root.setAttribute('tabindex', '0');
      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); restartTimer(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); restartTimer(); }
      });

      // Touch swipe (no library — minimum viable threshold detection).
      var touchStartX = 0;
      var touchStartTime = 0;
      root.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartTime = Date.now();
        stopTimer();
      }, { passive: true });
      root.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dt = Date.now() - touchStartTime;
        // Swipe needs >40px in <500ms — anything else is a tap or a drag.
        if (Math.abs(dx) > 40 && dt < 500) {
          if (dx < 0) next(); else prev();
        }
        restartTimer();
      }, { passive: true });

      goTo(0);
      startTimer();
    });
  }

  function initLqip() {
    // Each rendered raster image sits on top of a low-res background
    // placeholder set inline on its wrapper. Once the full-res variant
    // loads we drop the placeholder so the browser doesn't keep both
    // bitmaps around. Skip when no images present.
    document.querySelectorAll('[data-is-lqip]').forEach(function (wrapper) {
      var img = wrapper.querySelector('img');
      if (!img) {
        // Wrapper without a child img (e.g. video / iframe item) —
        // clear the placeholder since there's no fade-target.
        wrapper.style.backgroundImage = '';
        return;
      }
      var clear = function () { wrapper.style.backgroundImage = ''; };
      if (img.complete && img.naturalWidth > 0) {
        clear();
      } else {
        img.addEventListener('load', clear, { once: true });
        // Errors leave the LQIP visible — better than an empty void.
      }
    });
  }

  function init() {
    initSliders();
    initNewsScrollers();
    initLqip();

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
              var caption = gi.getAttribute('data-is-caption') || '';
              var src = gi.getAttribute('data-is-full-src') || img.src;
              items.push({ src: src, alt: img.alt || '', title: title, caption: caption });
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
