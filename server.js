/**
 * Image Sections Plugin
 *
 * Provides the {{plugin:image-section collection="slug"}} shortcode for rendering
 * image collections in two layout modes: "cards" (project cards with CTA buttons)
 * and "grid" (gallery grid with optional lightbox).
 */

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

function sortByOrder(a, b) {
  const orderA = Number(a?.value?.sortOrder ?? 9999);
  const orderB = Number(b?.value?.sortOrder ?? 9999);
  if (orderA !== orderB) return orderA - orderB;
  return String(a?.value?.title || '').localeCompare(String(b?.value?.title || ''));
}

function buildCardItem(item, lightbox, bgColor, buttonText) {
  const imageUrl = escapeHtml(normalizePluginMediaUrl(item.value?.imageUrl));
  const title = escapeHtml(item.value?.title || '');
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const safeButtonText = escapeHtml(buttonText || 'Bekijk project');

  let buttonHtml = '';
  if (linkUrl) {
    buttonHtml = `<a href="${linkUrl}" class="is-card-btn">${safeButtonText}</a>`;
  }

  const lbAttr = lightbox ? ' data-is-lightbox' : '';
  const cardClass = linkUrl ? 'is-card is-card--has-btn' : 'is-card';
  const styleAttr = bgColor ? ` style="background-color: ${bgColor}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';

  return `
    <div class="${cardClass}"${lbAttr}${titleAttr}${styleAttr}>
      <div class="is-card-image">
        <img src="${imageUrl}" alt="${title}" loading="lazy" />
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
  const imageUrl = escapeHtml(normalizePluginMediaUrl(item.value?.imageUrl));
  const title = escapeHtml(item.value?.title || '');

  const captionHtml = showTitle && title
    ? `<span class="is-grid-caption">${title}</span>`
    : '';

  const lbAttr = lightbox ? ' data-is-lightbox' : '';
  const styleAttr = bgColor ? ` style="background-color: ${bgColor}"` : '';
  const titleAttr = title ? ` data-is-title="${title}"` : '';

  return `
    <div class="is-grid-item"${lbAttr}${titleAttr}${styleAttr}>
      <img src="${imageUrl}" alt="${title}" loading="lazy" />
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

    return [
      `<link rel="stylesheet" href="${assetBase}/image-sections.css?v=9" />`,
      `<script defer src="${assetBase}/image-sections.js?v=9"></script>`,
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

          return renderCards(collection, items);
        },
      },
    ];
  },
};
