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

function buildCardItem(item, lightbox, bgColor, buttonText) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Bekijk project');

  let buttonHtml = '';
  if (linkUrl) {
    buttonHtml = `<a href="${linkUrl}" class="is-card-btn">${safeButtonText}</a>`;
  }

  const lbAttr = lightbox ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const cardClass = linkUrl ? 'is-card is-card--has-btn' : 'is-card';
  const styleAttr = bgColor ? ` style="background-color: ${bgColor}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';

  return `
    <div class="${cardClass}"${lbAttr}${titleAttr}${styleAttr}>
      <div class="is-card-image">
        <img src="${thumbUrl}" alt="${title}" loading="lazy" />
      </div>
      <div class="is-card-footer">
        <span class="is-card-title">${title}</span>
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

function buildGridItem(item, lightbox, showTitle, bgColor) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');

  const captionHtml = showTitle && title
    ? `<span class="is-grid-caption">${title}</span>`
    : '';

  const lbAttr = lightbox ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const styleAttr = bgColor ? ` style="background-color: ${bgColor}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';

  return `
    <div class="is-grid-item"${lbAttr}${titleAttr}${styleAttr}>
      <img src="${thumbUrl}" alt="${title}" loading="lazy" />
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
  const itemsHtml = items.map((item) => buildCardItem(item, lightbox, bgColor, buttonText)).join('');

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

function buildNewsItem(item, buttonText, lightbox) {
  const rawUrl = normalizePluginMediaUrl(item.value?.imageUrl);
  const thumbUrl = escapeHtml(buildThumbUrl(rawUrl));
  const fullUrl = escapeHtml(buildFullUrl(rawUrl));
  const title = escapeHtml(item.value?.title || '');
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Lees het bericht');

  const linkHtml = linkUrl
    ? `<a href="${linkUrl}" class="is-news-card-link">${safeButtonText} ›</a>`
    : '';

  const lbAttr = lightbox ? ` data-is-lightbox data-is-full-src="${fullUrl}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';

  return `
    <div class="is-news-card"${lbAttr}${titleAttr}>
      <div class="is-news-card-image">
        <img src="${thumbUrl}" alt="${title}" loading="lazy" />
      </div>
      <div class="is-news-card-body">
        <span class="is-news-card-title">${title}</span>
        ${linkHtml}
      </div>
    </div>
  `;
}

function renderNews(collection, items) {
  const lightbox = collection.lightbox === true || collection.lightbox === 'true';
  const buttonText = collection.buttonText || 'Lees het bericht';
  const itemsHtml = items.map((item) => buildNewsItem(item, buttonText, lightbox)).join('');
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
  const itemsHtml = items.map((item) => buildGridItem(item, lightbox, showTitle, bgColor)).join('');

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

          return renderCards(collection, items);
        },
      },
    ];
  },
};
