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

function buildCardItem(item, lightbox) {
  const imageUrl = escapeHtml(normalizePluginMediaUrl(item.value?.imageUrl));
  const title = escapeHtml(item.value?.title || '');
  const linkUrl = item.value?.linkUrl ? escapeHtml(item.value.linkUrl) : '';
  const buttonText = escapeHtml(item.value?.buttonText || 'Bekijk project');

  let buttonHtml = '';
  if (linkUrl) {
    buttonHtml = `<a href="${linkUrl}" class="is-card-btn">${buttonText}</a>`;
  }

  const lbAttr = lightbox ? ' data-is-lightbox' : '';

  return `
    <div class="is-card"${lbAttr}>
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

function buildGridItem(item, lightbox, showTitle) {
  const imageUrl = escapeHtml(normalizePluginMediaUrl(item.value?.imageUrl));
  const title = escapeHtml(item.value?.title || '');

  const captionHtml = showTitle && title
    ? `<span class="is-grid-caption">${title}</span>`
    : '';

  if (lightbox) {
    return `
      <div class="is-grid-item" data-is-lightbox>
        <img src="${imageUrl}" alt="${title}" loading="lazy" />
        ${captionHtml}
      </div>
    `;
  }

  return `
    <div class="is-grid-item">
      <img src="${imageUrl}" alt="${title}" loading="lazy" />
      ${captionHtml}
    </div>
  `;
}

function renderCards(collection, items) {
  const columns = Number(collection.columns) || 3;
  const lightbox = collection.lightbox === true || collection.lightbox === 'true';
  const titlePos = String(collection.titlePosition || 'below');
  const titleAlign = String(collection.titleAlign || 'left');
  const itemsHtml = items.map((item) => buildCardItem(item, lightbox)).join('');

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
  const columns = Number(collection.columns) || 3;
  const lightbox = collection.lightbox === true || collection.lightbox === 'true';
  const titlePos = String(collection.titlePosition || 'below');
  const titleAlign = String(collection.titleAlign || 'left');
  const showTitle = collection.showTitle === true || collection.showTitle === 'true';
  const itemsHtml = items.map((item) => buildGridItem(item, lightbox, showTitle)).join('');

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
      `<link rel="stylesheet" href="${assetBase}/image-sections.css?v=3" />`,
      `<script defer src="${assetBase}/image-sections.js?v=3"></script>`,
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
