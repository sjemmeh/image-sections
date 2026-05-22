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
 * Build a thumbnail URL for card/grid/news display.
 *
 * - Main CMS images  (/images/filename):  /images/800/0/filename  (path-based sharp)
 * - Plugin uploads   (/api/plugins/…):    append ?w=800            (query-param sharp)
 * - SVG / ICO:                            returned as-is
 */
function buildThumbUrl(url) {
  if (!url) return url;
  if (/\.(svg|ico)(\?|$)/i.test(url)) return url;
  if (url.startsWith('/images/')) {
    const filename = url.slice('/images/'.length);
    return `/images/800/0/${filename}`;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=800`;
}

/**
 * Build a full-resolution URL for the lightbox.
 *
 * - Main CMS images  (/images/filename):  /images/0/0/filename    (no resize)
 * - Plugin uploads:                        returned as-is (original)
 */
function buildFullUrl(url) {
  if (!url) return url;
  if (url.startsWith('/images/')) {
    const filename = url.slice('/images/'.length);
    return `/images/0/0/${filename}`;
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

function buildCardItem(item, lightbox, bgColor, buttonText, idx) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const altText = escapeHtml(resolveAlt(item));
  const caption = escapeHtml(item.value?.caption || '');
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Bekijk project');

  let buttonHtml = '';
  if (linkUrl) {
    buttonHtml = `<a href="${linkUrl}" class="is-card-btn">${safeButtonText}</a>`;
  }

  const captionHtml = caption ? `<span class="is-card-caption">${caption}</span>` : '';

  const lbAttr = lightbox ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const cardClass = linkUrl ? 'is-card is-card--has-btn' : 'is-card';
  const styleAttr = bgColor ? ` style="background-color: ${bgColor}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  return `
    <div class="${cardClass}"${lbAttr}${titleAttr}${captionAttr}${styleAttr}${animateAttr(idx)}>
      <div class="is-card-image">
        <img src="${thumbUrl}" alt="${altText}" loading="lazy" />
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

function buildGridItem(item, lightbox, showTitle, bgColor, idx) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const altText = escapeHtml(resolveAlt(item));
  const caption = escapeHtml(item.value?.caption || '');

  const captionHtml = showTitle && title
    ? `<span class="is-grid-caption">${title}</span>`
    : '';

  const lbAttr = lightbox ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const styleAttr = bgColor ? ` style="background-color: ${bgColor}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  return `
    <div class="is-grid-item"${lbAttr}${titleAttr}${captionAttr}${styleAttr}${animateAttr(idx)}>
      <img src="${thumbUrl}" alt="${altText}" loading="lazy" />
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
  const itemsHtml = items.map((item, idx) => buildCardItem(item, lightbox, bgColor, buttonText, idx)).join('');

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

function buildNewsItem(item, buttonText, lightbox, idx) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const altText = escapeHtml(resolveAlt(item));
  const caption = escapeHtml(item.value?.caption || '');
  const date = formatItemDate(item.value?.date);
  const dateHtml = date ? `<time class="is-news-card-date" datetime="${escapeHtml(item.value?.date || '')}">${escapeHtml(date)}</time>` : '';
  const captionHtml = caption ? `<p class="is-news-card-caption">${caption}</p>` : '';
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Lees het bericht');

  const linkHtml = linkUrl
    ? `<a href="${linkUrl}" class="is-news-card-link">${safeButtonText} ›</a>`
    : '';

  const lbAttr = lightbox ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  return `
    <div class="is-news-card"${lbAttr}${titleAttr}${captionAttr}${animateAttr(idx)}>
      <div class="is-news-card-image">
        <img src="${thumbUrl}" alt="${altText}" loading="lazy" />
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
  const itemsHtml = items.map((item, idx) => buildNewsItem(item, buttonText, lightbox, idx)).join('');
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
  const itemsHtml = items.map((item, idx) => buildGridItem(item, lightbox, showTitle, bgColor, idx)).join('');

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
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const altText = escapeHtml(resolveAlt(item));
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

  const lbAttr = lightbox ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';
  const captionAttr = caption ? ` data-is-caption="${caption}"` : '';

  // Slides need explicit indices for the public JS dot pagination + aria.
  return `
    <div class="is-slide" role="group" aria-roledescription="slide" aria-label="${idx + 1} / ${total}" data-is-slide-index="${idx}"${lbAttr}${titleAttr}${captionAttr}>
      <div class="is-slide-image">
        <img src="${thumbUrl}" alt="${altText}" loading="${idx === 0 ? 'eager' : 'lazy'}" />
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

          const collection = collectionRecord.value;
          const items = allItems
            .filter((item) => item.value?.collectionSlug === collectionSlug)
            .sort(sortByOrder);

          if (items.length === 0) {
            return `<!-- image-section: collection "${escapeHtml(collectionSlug)}" has no items -->`;
          }

          const layout = String(collection.layout || 'cards');

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
