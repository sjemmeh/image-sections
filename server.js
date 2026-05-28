/**
 * Image Sections Plugin
 *
 * Provides the {{plugin:image-section collection="slug"}} shortcode for rendering
 * image collections in three layout modes: "cards" (project cards with CTA buttons),
 * "grid" (gallery with optional lightbox), and "news" (horizontally scrolling cards).
 */

const path = require('path');
const fs = require('fs');

// Cache-bust public assets with the plugin version from plugin.json so each
// release auto-invalidates browser caches. Loaded once at module init.
const ASSET_VERSION = (function () {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'plugin.json'), 'utf8'),
    );
    return String(manifest.version || '0');
  } catch (_err) {
    return '0';
  }
})();

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePluginMediaUrl(url) {
  if (!url) return '';
  let normalized = String(url).replace('/api/admin/plugins/', '/api/plugins/');
  // Strip duplicated `plugins/<pluginName>/` segment from legacy uploads
  // (caused by an old backend bug where relativePath was computed against uploadsRoot).
  normalized = normalized.replace(
    /(\/api\/plugins\/([^/]+)\/uploads\/)plugins\/\2\//,
    '$1',
  );
  return normalized;
}

/**
 * Strip the optional `<W>/<H>/` sharp-resize prefix from a `/images/...` URL
 * and return just the filename. Accepts both legacy bare form
 * (`/images/foo.webp`) and the sharded form the backend now emits
 * (`/images/0/0/foo.webp`, `/images/800/0/foo.webp`, etc.) so URL builders
 * can re-prepend whatever dimensions they need without doubling up the
 * prefix into nonsense like `/images/800/0/0/0/foo.webp`.
 */
function cmsImageFilename(url) {
  let rest = url.slice('/images/'.length);
  const sharded = rest.match(/^\d+\/\d+\/(.+)$/);
  return sharded ? sharded[1] : rest;
}

/**
 * Build a thumbnail URL for card/grid/news display.
 *
 * - Main CMS images  (/images/[W/H/]filename):  /images/800/0/filename  (path-based sharp)
 * - Plugin uploads   (/api/plugins/…):          append ?w=800            (query-param sharp)
 * - SVG / ICO:                                  returned as-is
 */
function buildThumbUrl(url) {
  if (!url) return url;
  if (/\.(svg|ico)(\?|$)/i.test(url)) return url;
  if (url.startsWith('/images/')) {
    return `/images/800/0/${cmsImageFilename(url)}`;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=800`;
}

/**
 * Build a full-resolution URL for the lightbox.
 *
 * - Main CMS images  (/images/[W/H/]filename):  /images/0/0/filename    (no resize)
 * - Plugin uploads:                              returned as-is (original)
 */
function buildFullUrl(url) {
  if (!url) return url;
  if (url.startsWith('/images/')) {
    return `/images/0/0/${cmsImageFilename(url)}`;
  }
  return url;
}

function sortByOrder(a, b) {
  const orderA = Number(a?.value?.sortOrder ?? 9999);
  const orderB = Number(b?.value?.sortOrder ?? 9999);
  if (orderA !== orderB) return orderA - orderB;
  return String(a?.value?.title || '').localeCompare(String(b?.value?.title || ''));
}

/**
 * Build the data-animate attribute string for staggered entrance animations.
 * Cycles delays over 3 items (0ms, 100ms, 200ms) so each row of a 3-col
 * grid starts at 0ms — works visually for 2/3/4-col layouts and horizontal
 * news scrollers alike.
 */
function animateAttr(idx) {
  const delay = (idx % 3) * 100;
  return delay === 0 ? ' data-animate' : ` data-animate data-animate-delay="${delay}"`;
}

/**
 * Convert a YouTube or Vimeo watch URL into the corresponding embed URL.
 * Returns '' for anything we don't recognise so the renderer can short-
 * circuit to an HTML comment rather than embedding arbitrary iframes —
 * this is the only place untrusted URLs hit an iframe `src`, so the
 * whitelist matters.
 */
function coerceEmbedUrl(url) {
  if (!url) return '';
  let parsed;
  try {
    parsed = new URL(url);
  } catch (_err) {
    return '';
  }
  const host = parsed.hostname.toLowerCase();

  // YouTube watch URL → /embed/<id>
  if (/(^|\.)youtube\.com$/.test(host)) {
    const id = parsed.searchParams.get('v');
    if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube.com/embed/${id}`;
    const m = parsed.pathname.match(/^\/embed\/([\w-]{6,20})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  // Short-form youtu.be/<id>
  if (host === 'youtu.be') {
    const id = parsed.pathname.replace(/^\/+/, '').split('/')[0];
    if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube.com/embed/${id}`;
  }
  // Vimeo numeric ID
  if (/(^|\.)vimeo\.com$/.test(host)) {
    const id = parsed.pathname.replace(/^\/+/, '').split('/')[0];
    if (/^\d{5,12}$/.test(id)) return `https://player.vimeo.com/video/${id}`;
  }
  // Already a Vimeo player embed URL
  if (host === 'player.vimeo.com' && /^\/video\/\d{5,12}/.test(parsed.pathname)) {
    return parsed.toString();
  }

  return '';
}

/**
 * Build a `srcset` attribute string for raster images. Both URL families
 * the plugin produces (main CMS path-based and plugin uploads with ?w=)
 * support on-the-fly resizing, so we can emit a multi-width srcset that
 * lets the browser pick the best resolution for the layout + device.
 *
 * Returns '' for SVG/ICO (already vector / tiny) and for empty URLs.
 */
function buildSrcsetAttrs(rawUrl) {
  if (!rawUrl) return '';
  if (/\.(svg|ico)(\?|$)/i.test(rawUrl)) return '';

  const widths = [400, 800, 1600];

  if (rawUrl.startsWith('/images/')) {
    const filename = cmsImageFilename(rawUrl);
    const srcset = widths
      .map((w) => `/images/${w}/0/${filename} ${w}w`)
      .join(', ');
    return ` srcset="${srcset}"`;
  }

  // Plugin uploads (or arbitrary external URLs that accept ?w=). Strip
  // any pre-existing w= param so we don't double-up on it.
  const stripped = rawUrl.replace(/([?&])w=\d+(&|$)/g, function (_m, lead, trail) {
    return trail === '&' ? lead : '';
  }).replace(/[?&]$/, '');
  const sep = stripped.includes('?') ? '&' : '?';
  const srcset = widths
    .map((w) => `${escapeHtml(stripped)}${sep}w=${w} ${w}w`)
    .join(', ');
  return ` srcset="${srcset}"`;
}

/**
 * Build a tiny (24px wide) "low-quality image placeholder" URL that we
 * can use as a background-image on the wrapper element so the user sees
 * something colourful immediately instead of an empty box while the
 * full-size image loads. Same URL families as buildSrcsetAttrs.
 */
function buildLqipUrl(rawUrl) {
  if (!rawUrl) return '';
  if (/\.(svg|ico)(\?|$)/i.test(rawUrl)) return '';
  if (rawUrl.startsWith('/images/')) {
    return `/images/24/0/${cmsImageFilename(rawUrl)}`;
  }
  const stripped = rawUrl.replace(/([?&])w=\d+(&|$)/g, function (_m, lead, trail) {
    return trail === '&' ? lead : '';
  }).replace(/[?&]$/, '');
  const sep = stripped.includes('?') ? '&' : '?';
  return `${stripped}${sep}w=24`;
}

/**
 * Render the right <img>/<video>/<iframe> for an item based on its
 * mediaType. Defaults to image so pre-PR-19 items keep rendering as
 * before. opts.loading defaults to 'eager' for idx 0, 'lazy' otherwise.
 * opts.sizes lets each layout pass a sensible `sizes` attribute so the
 * browser picks the right srcset variant.
 */
function buildMediaElement(item, idx, opts) {
  const mediaType = String(item.value?.mediaType || 'image').toLowerCase();
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl || '');
  const altText = escapeHtml(resolveAlt(item));
  const loading = (opts && opts.loading) || (idx === 0 ? 'eager' : 'lazy');

  if (mediaType === 'video') {
    if (!rawUrl) return '<!-- image-section: video item missing URL -->';
    const posterRaw = normalizePluginMediaUrl(item.value?.videoPoster || '');
    const posterAttr = posterRaw ? ` poster="${escapeHtml(posterRaw)}"` : '';
    // preload="metadata" is the gentlest default — fetches enough to draw
    // the first frame + duration without pulling the entire file.
    return `<video src="${escapeHtml(rawUrl)}"${posterAttr} controls preload="metadata" playsinline></video>`;
  }

  if (mediaType === 'embed') {
    const embedUrl = coerceEmbedUrl(rawUrl);
    if (!embedUrl) return '<!-- image-section: invalid or unsupported embed URL -->';
    // The allow= list mirrors what YouTube/Vimeo expect for their players.
    // title= takes the alt text so screen readers announce something
    // meaningful when they hit the iframe.
    return `<iframe src="${escapeHtml(embedUrl)}" title="${altText}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" frameborder="0"></iframe>`;
  }

  // Default — image. The browser uses src as the fallback / smallest
  // baseline (most-compatible variant) and the srcset entries to pick a
  // better-fitting size. sizes tells it how wide the image actually
  // renders so it can resolve the srcset.
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const srcsetAttr = buildSrcsetAttrs(rawUrl);
  const sizesAttr = (opts && opts.sizes)
    ? ` sizes="${escapeHtml(opts.sizes)}"`
    : '';
  return `<img src="${thumbUrl}"${srcsetAttr}${sizesAttr} alt="${altText}" loading="${loading}" />`;
}

/**
 * Compute the eager/lazy threshold for a layout. The first `eagerCount`
 * items render with loading="eager" so above-the-fold content paints
 * immediately; everything else stays lazy.
 */
function eagerCountFor(layout, columns) {
  if (layout === 'slider') return 1;       // hero LCP candidate
  if (layout === 'news') return 3;         // ~ first row of visible cards
  if (layout === 'grid' || layout === 'cards') {
    const cols = Number(columns) || 3;
    return Math.max(1, Math.min(cols, 4)); // first row
  }
  return 1;
}

/**
 * Whether a lightbox-enabled item should actually open a lightbox.
 * Only still images participate — videos have their own controls and
 * iframes are already interactive.
 */
function lightboxEligible(item) {
  const mediaType = String(item.value?.mediaType || 'image').toLowerCase();
  return mediaType === 'image';
}

/**
 * Resolve the alt attribute for an item. Prefer the explicit altText
 * field (set in the admin) over the title — alt and title serve
 * different a11y purposes, but pre-enrichment items only have title,
 * so fall back to it for backwards compatibility.
 */
function resolveAlt(item) {
  const explicit = item.value?.altText;
  if (typeof explicit === 'string' && explicit.trim()) return explicit;
  return item.value?.title || '';
}

/**
 * Format an ISO date string for display. Empty / unparseable inputs return
 * '' so the template can drop the slot. Uses the host's default locale.
 */
function formatItemDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (_err) {
    return d.toISOString().slice(0, 10);
  }
}

function buildCardItem(item, lightbox, bgColor, buttonText, idx, eagerCount, cardSizes) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const caption = escapeHtml(item.value?.caption || '');
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Bekijk project');

  let buttonHtml = '';
  if (linkUrl) {
    buttonHtml = `<a href="${linkUrl}" class="is-card-btn">${safeButtonText}</a>`;
  }

  const captionHtml = caption ? `<span class="is-card-caption">${caption}</span>` : '';
  const mediaHtml = buildMediaElement(item, idx, {
    loading: idx < eagerCount ? 'eager' : 'lazy',
    sizes: cardSizes,
  });
  const lqip = buildLqipUrl(rawUrl);
  const lqipStyle = lqip
    ? ` style="background-image:url('${escapeHtml(lqip)}'); background-size:cover; background-position:center;"`
    : '';

  const lbAttr = (lightbox && lightboxEligible(item)) ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const cardClass = linkUrl ? 'is-card is-card--has-btn' : 'is-card';
  const styleAttr = bgColor ? ` style="background-color: ${bgColor}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  return `
    <div class="${cardClass}"${lbAttr}${titleAttr}${captionAttr}${styleAttr}${animateAttr(idx)}>
      <div class="is-card-image"${lqipStyle} data-is-lqip>
        ${mediaHtml}
      </div>
      <div class="is-card-footer">
        <div class="is-card-text">
          <span class="is-card-title">${title}</span>
          ${captionHtml}
        </div>
        ${buttonHtml}
      </div>
    </div>
  `;
}

// Validates a CSS color string. Accepts only #hex (3/4/6/8) and a small
// allowlist of keywords. Returns the trimmed value if safe, else ''.
function sanitizeCssColor(value) {
  if (!value) return '';
  const v = String(value).trim();
  if (!v) return '';
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
  if (/^(transparent|inherit|initial|unset|currentColor)$/i.test(v)) return v;
  return '';
}

function buildGridItem(item, lightbox, showTitle, bgColor, idx, eagerCount, gridSizes) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const caption = escapeHtml(item.value?.caption || '');

  const captionHtml = showTitle && title
    ? `<span class="is-grid-caption">${title}</span>`
    : '';
  const mediaHtml = buildMediaElement(item, idx, {
    loading: idx < eagerCount ? 'eager' : 'lazy',
    sizes: gridSizes,
  });
  const lqip = buildLqipUrl(rawUrl);
  // For grid items the LQIP lives on the item itself (no separate
  // wrapper) — same effect, one fewer element.
  const lqipBg = lqip
    ? `background-image:url('${escapeHtml(lqip)}'); background-size:cover; background-position:center;`
    : '';
  const bgStyle = bgColor ? `background-color: ${bgColor};` : '';
  const combinedStyle = [lqipBg, bgStyle].filter(Boolean).join(' ');
  const styleAttr = combinedStyle ? ` style="${combinedStyle}"` : '';
  const lqipAttr = lqip ? ' data-is-lqip' : '';

  const lbAttr = (lightbox && lightboxEligible(item)) ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  return `
    <div class="is-grid-item"${lbAttr}${titleAttr}${captionAttr}${styleAttr}${lqipAttr}${animateAttr(idx)}>
      ${mediaHtml}
      ${captionHtml}
    </div>
  `;
}

function renderCards(collection, items) {
  const lightbox = collection.lightbox === true || collection.lightbox === 'true';
  const titlePos = String(collection.titlePosition || 'below');
  const titleAlign = String(collection.titleAlign || 'left');
  const columns = Number(collection.columns) || 3;
  const bgColor = sanitizeCssColor(collection.backgroundColor);
  const buttonText = collection.buttonText || 'Bekijk project';
  const eagerCount = eagerCountFor('cards', columns);
  // `sizes` matches the grid CSS rules in image-sections.css: 1 col on
  // <640, 2 cols on <1024, then `columns` cols on desktop. The fractions
  // are inverses (100/columns vw).
  const desktopVw = Math.round(100 / Math.max(1, columns));
  const cardSizes = `(min-width: 1024px) ${desktopVw}vw, (min-width: 640px) 50vw, 100vw`;
  const itemsHtml = items.map((item, idx) => buildCardItem(item, lightbox, bgColor, buttonText, idx, eagerCount, cardSizes)).join('');

  const classes = [
    'is-section',
    'is-layout-cards',
    lightbox ? 'is-has-lightbox' : '',
    titlePos === 'above' ? 'is-title-above' : '',
    `is-title-${titleAlign}`,
  ].filter(Boolean).join(' ');

  return `
    <div class="${classes}" style="--is-columns: ${columns}">
      <div class="is-grid">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function buildNewsItem(item, buttonText, lightbox, idx, eagerCount) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const caption = escapeHtml(item.value?.caption || '');
  const date = formatItemDate(item.value?.date);
  const dateHtml = date ? `<time class="is-news-card-date" datetime="${escapeHtml(item.value?.date || '')}">${escapeHtml(date)}</time>` : '';
  const captionHtml = caption ? `<p class="is-news-card-caption">${caption}</p>` : '';
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Lees het bericht');

  const linkHtml = linkUrl
    ? `<a href="${linkUrl}" class="is-news-card-link">${safeButtonText} ›</a>`
    : '';
  const mediaHtml = buildMediaElement(item, idx, {
    loading: idx < eagerCount ? 'eager' : 'lazy',
    // ~29% width at >=1024, 44% at >=640, else 80% (matches the CSS rules
    // in image-sections.css for .is-news-card flex-basis).
    sizes: '(min-width: 1024px) 29vw, (min-width: 640px) 44vw, 80vw',
  });
  const lqip = buildLqipUrl(rawUrl);
  const lqipStyle = lqip
    ? ` style="background-image:url('${escapeHtml(lqip)}'); background-size:cover; background-position:center;"`
    : '';

  const lbAttr = (lightbox && lightboxEligible(item)) ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  return `
    <div class="is-news-card"${lbAttr}${titleAttr}${captionAttr}${animateAttr(idx)}>
      <div class="is-news-card-image"${lqipStyle} data-is-lqip>
        ${mediaHtml}
      </div>
      <div class="is-news-card-body">
        ${dateHtml}
        <span class="is-news-card-title">${title}</span>
        ${captionHtml}
        ${linkHtml}
      </div>
    </div>
  `;
}

function renderNews(collection, items) {
  const lightbox = collection.lightbox === true || collection.lightbox === 'true';
  const buttonText = collection.buttonText || 'Lees het bericht';
  const eagerCount = eagerCountFor('news');
  const itemsHtml = items.map((item, idx) => buildNewsItem(item, buttonText, lightbox, idx, eagerCount)).join('');
  const classes = [
    'is-section',
    'is-layout-news',
    lightbox ? 'is-has-lightbox' : '',
  ].filter(Boolean).join(' ');

  return `
    <div class="${classes}">
      <div class="is-news-scroll">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function renderGrid(collection, items) {
  const lightbox = collection.lightbox === true || collection.lightbox === 'true';
  const titlePos = String(collection.titlePosition || 'below');
  const titleAlign = String(collection.titleAlign || 'left');
  const showTitle = collection.showTitle === true || collection.showTitle === 'true';
  const columns = Number(collection.columns) || 3;
  const bgColor = sanitizeCssColor(collection.backgroundColor);
  const eagerCount = eagerCountFor('grid', columns);
  const desktopVw = Math.round(100 / Math.max(1, columns));
  const gridSizes = `(min-width: 1024px) ${desktopVw}vw, (min-width: 640px) 50vw, 100vw`;
  const itemsHtml = items.map((item, idx) => buildGridItem(item, lightbox, showTitle, bgColor, idx, eagerCount, gridSizes)).join('');

  const classes = [
    'is-section',
    'is-layout-grid',
    lightbox ? 'is-has-lightbox' : '',
    titlePos === 'above' ? 'is-title-above' : '',
    `is-title-${titleAlign}`,
  ].filter(Boolean).join(' ');

  return `
    <div class="${classes}" style="--is-columns: ${columns}">
      <div class="is-grid">
        ${itemsHtml}
      </div>
    </div>
  `;
}

/**
 * Whitelist the height value to a small set of CSS lengths so we don't
 * inject arbitrary CSS via the style attribute. Anything else falls back
 * to the default.
 */
function sanitizeSliderHeight(value) {
  if (!value) return '60vh';
  const v = String(value).trim();
  // Accept N(vh|vw|px|rem|em|%) with up to 4 digits + 0-2 decimals.
  if (/^\d{1,4}(\.\d{1,2})?(vh|vw|px|rem|em|%)$/i.test(v)) return v;
  if (/^(auto|fit-content)$/i.test(v)) return v;
  return '60vh';
}

function sliderTransition(value) {
  const v = String(value || 'fade').toLowerCase();
  return v === 'slide' ? 'slide' : 'fade';
}

function sliderCaptionPos(value) {
  const v = String(value || 'bottom-left').toLowerCase();
  const allowed = ['center', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'];
  return allowed.indexOf(v) >= 0 ? v : 'bottom-left';
}

function buildSliderItem(item, lightbox, buttonText, idx, total) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const caption = escapeHtml(item.value?.caption || '');
  const date = formatItemDate(item.value?.date);
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Lees meer');

  const dateHtml = date ? `<time class="is-slide-date" datetime="${escapeHtml(item.value?.date || '')}">${escapeHtml(date)}</time>` : '';
  const titleHtml = title ? `<h2 class="is-slide-title">${title}</h2>` : '';
  const captionHtml = caption ? `<p class="is-slide-caption">${caption}</p>` : '';
  const buttonHtml = linkUrl
    ? `<a href="${linkUrl}" class="is-slide-btn">${safeButtonText}</a>`
    : '';

  const contentHtml = (dateHtml || titleHtml || captionHtml || buttonHtml)
    ? `<div class="is-slide-content"><div class="is-slide-content-inner">${dateHtml}${titleHtml}${captionHtml}${buttonHtml}</div></div>`
    : '';

  // The hero slide is the page's LCP candidate — eager-load only it
  // (idx 0). Sliders always fill the viewport so sizes is always 100vw.
  const mediaHtml = buildMediaElement(item, idx, {
    loading: idx === 0 ? 'eager' : 'lazy',
    sizes: '100vw',
  });
  const lqip = buildLqipUrl(rawUrl);
  const lqipStyle = lqip
    ? ` style="background-image:url('${escapeHtml(lqip)}'); background-size:cover; background-position:center;"`
    : '';

  const lbAttr = (lightbox && lightboxEligible(item)) ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  // Slides need explicit indices for the public JS dot pagination + aria.
  return `
    <div class="is-slide" role="group" aria-roledescription="slide" aria-label="${idx + 1} / ${total}" data-is-slide-index="${idx}"${lbAttr}${titleAttr}${captionAttr}>
      <div class="is-slide-image"${lqipStyle} data-is-lqip>
        ${mediaHtml}
      </div>
      ${contentHtml}
    </div>
  `;
}

function renderSlider(collection, items) {
  const lightbox = collection.lightbox === true || collection.lightbox === 'true';
  const buttonText = collection.buttonText || 'Lees meer';
  const autoplay = collection.sliderAutoplay !== false && collection.sliderAutoplay !== 'false';
  const interval = Math.max(2000, Math.min(20000, Number(collection.sliderInterval) || 5000));
  const transition = sliderTransition(collection.sliderTransition);
  const showDots = collection.sliderShowDots !== false && collection.sliderShowDots !== 'false';
  const showArrows = collection.sliderShowArrows !== false && collection.sliderShowArrows !== 'false';
  const height = sanitizeSliderHeight(collection.sliderHeight);
  const captionPos = sliderCaptionPos(collection.sliderCaptionPos);
  const bgColor = sanitizeCssColor(collection.backgroundColor);

  const itemsHtml = items.map((item, idx) => buildSliderItem(item, lightbox, buttonText, idx, items.length)).join('');

  const classes = [
    'is-section',
    'is-layout-slider',
    `is-slider-${transition}`,
    `is-slide-caption-${captionPos}`,
    lightbox ? 'is-has-lightbox' : '',
  ].filter(Boolean).join(' ');

  const styleParts = [`--is-slider-height: ${height}`];
  if (bgColor) styleParts.push(`background-color: ${bgColor}`);
  const styleAttr = ` style="${styleParts.join('; ')}"`;

  // aria-roledescription="carousel" + aria-live="polite" announces slide
  // changes to screen readers. The track + dots get their own ARIA in JS
  // once it initialises.
  return `
    <div class="${classes}"${styleAttr}
         role="region"
         aria-roledescription="carousel"
         aria-label="${escapeHtml(collection.name || 'Image slider')}"
         data-is-autoplay="${autoplay ? '1' : '0'}"
         data-is-interval="${interval}">
      <div class="is-slider-track" aria-live="polite">
        ${itemsHtml}
      </div>
      ${showArrows ? `
        <button type="button" class="is-slider-prev" aria-label="Vorige">&lsaquo;</button>
        <button type="button" class="is-slider-next" aria-label="Volgende">&rsaquo;</button>
      ` : ''}
      ${showDots ? `<div class="is-slider-dots" role="tablist"></div>` : ''}
    </div>
  `;
}

module.exports = {
  registerHeadSnippet: async (_config, context) => {
    const pluginName = context?.pluginName || 'image-sections';
    const assetBase = `/api/plugins/${encodeURIComponent(pluginName)}/assets`;

    const v = encodeURIComponent(ASSET_VERSION);
    return [
      `<link rel="stylesheet" href="${assetBase}/image-sections.css?v=${v}" />`,
      `<script defer src="${assetBase}/image-sections.js?v=${v}"></script>`,
    ].join('\n');
  },

  /**
   * Internal helpers exposed for the test suite. Not part of the plugin SPI —
   * the plugin host only consumes registerHeadSnippet / registerShortcodes.
   * Stable enough for tests, but treat as private from any other consumer.
   */
  __test: {
    escapeHtml,
    normalizePluginMediaUrl,
    cmsImageFilename,
    buildThumbUrl,
    buildFullUrl,
    sortByOrder,
    animateAttr,
    coerceEmbedUrl,
    buildSrcsetAttrs,
    buildLqipUrl,
    resolveAlt,
    formatItemDate,
    sanitizeCssColor,
    sanitizeSliderHeight,
    sliderTransition,
    sliderCaptionPos,
    eagerCountFor,
    lightboxEligible,
  },

  registerShortcodes: (_config, context) => {
    return [
      {
        name: 'image-section',
        handler: async (params, _pluginConfig, renderContext) => {
          const collectionSlug = params.collection;
          if (!collectionSlug) {
            return '<!-- image-section: missing collection parameter -->';
          }

          const getScopeRecords = renderContext?.getDataScopeRecords;
          if (!getScopeRecords) {
            return '<!-- image-section: no data scope access -->';
          }

          // Fetch collection config and items
          const [collections, allItems] = await Promise.all([
            getScopeRecords('collections'),
            getScopeRecords('items'),
          ]);

          const collectionRecord = collections.find(
            (r) => r.value?.slug === collectionSlug,
          );

          if (!collectionRecord) {
            return `<!-- image-section: collection "${escapeHtml(collectionSlug)}" not found -->`;
          }

          let items = allItems
            .filter((item) => item.value?.collectionSlug === collectionSlug)
            .sort(sortByOrder);

          // ---------- Shortcode parameter overrides ----------
          // tag=foo — filter items whose tags include "foo" (case-
          // insensitive, exact match after trimming). Tags can be stored
          // as either an array or a comma-separated string for hand-
          // edited data, so accept both shapes.
          const tagFilter = typeof params.tag === 'string' ? params.tag.trim().toLowerCase() : '';
          if (tagFilter) {
            items = items.filter((item) => {
              const raw = item.value?.tags;
              if (!raw) return false;
              const list = Array.isArray(raw)
                ? raw
                : String(raw).split(',');
              return list.some((t) => String(t).trim().toLowerCase() === tagFilter);
            });
          }

          // offset=N — skip the first N items. Clamped to [0, items.length].
          const offsetRaw = Number(params.offset);
          const offset = Number.isFinite(offsetRaw)
            ? Math.max(0, Math.min(items.length, Math.floor(offsetRaw)))
            : 0;
          if (offset > 0) items = items.slice(offset);

          // limit=N — keep only the first N items after offset. Clamped to
          // [1, 200] so an unbounded value can't render a huge page.
          const limitRaw = Number(params.limit);
          if (Number.isFinite(limitRaw) && limitRaw > 0) {
            const limit = Math.min(200, Math.max(1, Math.floor(limitRaw)));
            items = items.slice(0, limit);
          }

          if (items.length === 0) {
            return `<!-- image-section: collection "${escapeHtml(collectionSlug)}" has no items${tagFilter ? ` (tag="${escapeHtml(tagFilter)}")` : ''} -->`;
          }

          // layout=foo — per-shortcode layout override, validated against
          // the supported set. Falls back to the collection's stored layout
          // if missing or unknown.
          const ALLOWED_LAYOUTS = ['cards', 'grid', 'news', 'slider'];
          const layoutOverride = typeof params.layout === 'string' ? params.layout.toLowerCase() : '';
          const collection = collectionRecord.value;
          const layout = ALLOWED_LAYOUTS.indexOf(layoutOverride) >= 0
            ? layoutOverride
            : String(collection.layout || 'cards');

          if (layout === 'grid') {
            return renderGrid(collection, items);
          }

          if (layout === 'news') {
            return renderNews(collection, items);
          }

          if (layout === 'slider') {
            return renderSlider(collection, items);
          }

          return renderCards(collection, items);
        },
      },
    ];
  },
};
