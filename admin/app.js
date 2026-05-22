import { createPluginAdminClient } from './plugin-admin-client.js';

const PLUGIN_NAME = 'image-sections';
const api = createPluginAdminClient(PLUGIN_NAME);

const SCOPES = {
  collections: 'collections',
  items: 'items',
};

const state = {
  collections: [],
  items: [],
  selectedSlug: null,
  editingItemKey: null,
  pendingFiles: [],
  feedbackTimer: null,
  pendingConfirm: null,
  draggedItemKey: null,
};

const el = {
  collectionsView: document.getElementById('collections-view'),
  editorView: document.getElementById('editor-view'),
  editorTitle: document.getElementById('editor-title'),
  editorShortcode: document.getElementById('editor-shortcode'),
  collectionsList: document.getElementById('collections-list'),
  collectionsFeedback: document.getElementById('collections-feedback'),
  editorFeedback: document.getElementById('editor-feedback'),
  backBtn: document.getElementById('back-btn'),

  newColName: document.getElementById('new-col-name'),
  newColSlug: document.getElementById('new-col-slug'),
  newColLayout: document.getElementById('new-col-layout'),
  createColBtn: document.getElementById('create-col-btn'),

  editName: document.getElementById('edit-name'),
  editLayout: document.getElementById('edit-layout'),
  editColumns: document.getElementById('edit-columns'),
  editLightboxSwitch: document.getElementById('edit-lightbox-switch'),
  editTitlePosition: document.getElementById('edit-title-position'),
  editShowTitleSwitch: document.getElementById('edit-show-title-switch'),
  editTitleAlign: document.getElementById('edit-title-align'),
  editBtnText: document.getElementById('edit-btn-text'),
  editBgColorPicker: document.getElementById('edit-bg-color-picker'),
  editBgColorSwatch: document.getElementById('edit-bg-color-swatch'),
  editBgColorText: document.getElementById('edit-bg-color-text'),
  editBgColorClear: document.getElementById('edit-bg-color-clear'),
  lightboxGroup: document.getElementById('lightbox-group'),
  btnTextGroup: document.getElementById('btn-text-group'),
  showTitleGroup: document.getElementById('show-title-group'),
  titlePositionGroup: document.getElementById('title-position-group'),
  titleAlignGroup: document.getElementById('title-align-group'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),

  itemFile: document.getElementById('item-file'),
  itemDropzone: document.getElementById('item-dropzone'),
  itemFilePreview: document.getElementById('item-file-preview'),
  itemUrl: document.getElementById('item-url'),
  itemTitle: document.getElementById('item-title'),
  itemTitleGroup: document.getElementById('item-title-group'),
  itemLink: document.getElementById('item-link'),
  itemLinkGroup: document.getElementById('item-link-group'),
  addItemBtn: document.getElementById('add-item-btn'),
  resetItemBtn: document.getElementById('reset-item-btn'),
  itemsList: document.getElementById('items-list'),

  confirmModal: document.getElementById('confirm-modal'),
  confirmModalText: document.getElementById('confirm-modal-text'),
  confirmModalOk: document.getElementById('confirm-modal-ok'),
  confirmModalCancel: document.getElementById('confirm-modal-cancel'),
  confirmModalClose: document.getElementById('confirm-modal-close'),
};

// ---- Stroke-style inline SVGs (match admin-panel/src/lib/icons.tsx aesthetic) ----

const ICON = {
  edit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  up:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>',
  down:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
  image:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  copy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  grip:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
};

function shortcodeFor(slug) {
  return '{{plugin:image-section collection="' + slug + '"}}';
}

async function copyShortcode(slug) {
  var code = shortcodeFor(slug);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      // Fallback for very old browsers / non-secure contexts.
      var ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    notify('Shortcode gekopieerd');
  } catch (err) {
    notify(err.message || 'Kopiëren mislukt', 'error');
  }
}

const CONVERTIBLE_TO_WEBP = new Set(['image/png', 'image/jpeg', 'image/gif']);

/**
 * Convert a raster image File to WebP via Canvas. Uses createImageBitmap
 * so no <img> element is needed (avoids CSP img-src restrictions on blob:).
 */
async function convertToWebp(file, quality) {
  if (quality === undefined) quality = 0.85;
  var bitmap = await createImageBitmap(file);
  var canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise(function (resolve, reject) {
    canvas.toBlob(
      function (blob) {
        if (!blob) {
          reject(new Error('Canvas WebP conversion failed'));
          return;
        }
        var webpName = file.name.replace(/\.[^.]+$/, '') + '.webp';
        resolve(new File([blob], webpName, { type: 'image/webp' }));
      },
      'image/webp',
      quality,
    );
  });
}

/**
 * Raster images (PNG, JPEG, GIF) are converted to WebP before upload;
 * SVG, WebP, and other types pass through.
 */
async function prepareFileForUpload(file) {
  if (CONVERTIBLE_TO_WEBP.has(file.type)) {
    return convertToWebp(file);
  }
  return file;
}

// ---- UI helpers ----

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function colKey(slug) {
  return `col_${slug}`;
}

function normalizePluginMediaUrl(url) {
  if (!url) return '';
  let normalized = String(url).replace('/api/admin/plugins/', '/api/plugins/');
  normalized = normalized.replace(
    /(\/api\/plugins\/([^/]+)\/uploads\/)plugins\/\2\//,
    '$1',
  );
  return normalized;
}

function filenameToTitle(name) {
  if (!name) return '';
  var stem = String(name).replace(/\.[^.]+$/, '');
  var pretty = stem.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!pretty) return '';
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

function isValidCssColor(value) {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return true;
  if (/^(transparent|inherit|initial|unset|currentColor)$/i.test(v)) return true;
  return false;
}

function syncBgColorFromText() {
  var v = el.editBgColorText.value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) {
    el.editBgColorPicker.value = v;
    el.editBgColorSwatch.style.background = v;
  } else if (!v) {
    el.editBgColorSwatch.style.background = 'transparent';
  }
}

function notify(message, variant) {
  // Inline banner at top of currently-visible view; replaces fixed toast.
  var host = state.selectedSlug ? el.editorFeedback : el.collectionsFeedback;
  if (!host) return;
  var kind = variant === 'error' ? 'warn' : 'accent';
  host.innerHTML =
    '<div class="banner ' + kind + '" style="margin-bottom:18px;">' +
    '<div>' +
    '<h4>' + esc(message) + '</h4>' +
    '</div>' +
    '</div>';
  if (state.feedbackTimer) clearTimeout(state.feedbackTimer);
  state.feedbackTimer = setTimeout(function () {
    host.innerHTML = '';
  }, variant === 'error' ? 4200 : 2600);
}

// ---- Switch toggles (design-system .switch) ----

function setSwitchState(node, on) {
  if (!node) return;
  if (on) {
    node.classList.add('on');
    node.setAttribute('aria-checked', 'true');
  } else {
    node.classList.remove('on');
    node.setAttribute('aria-checked', 'false');
  }
}

function isSwitchOn(node) {
  return !!(node && node.classList.contains('on'));
}

function bindSwitch(node, onChange) {
  if (!node) return;
  var toggle = function () {
    setSwitchState(node, !isSwitchOn(node));
    if (typeof onChange === 'function') onChange();
  };
  node.addEventListener('click', toggle);
  node.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  });
}

// ---- Confirmation modal ----

function openConfirm(message, onConfirm) {
  el.confirmModalText.textContent = message;
  state.pendingConfirm = onConfirm;
  el.confirmModal.style.display = 'flex';
}

function closeConfirm() {
  state.pendingConfirm = null;
  el.confirmModal.style.display = 'none';
}

// ---- Layout-specific visibility ----

function updateLayoutFields() {
  var layout = el.editLayout.value;
  var gridTitleEnabled = layout === 'grid' && isSwitchOn(el.editShowTitleSwitch);
  var isNews = layout === 'news';

  el.lightboxGroup.style.display = '';
  el.btnTextGroup.style.display = (layout === 'cards' || isNews) ? '' : 'none';
  el.itemTitleGroup.style.display = (layout === 'cards' || isNews || gridTitleEnabled) ? '' : 'none';
  el.itemLinkGroup.style.display = (layout === 'cards' || isNews) ? '' : 'none';

  el.showTitleGroup.style.display = layout === 'grid' ? '' : 'none';

  var showTitleOptions = layout === 'cards' || gridTitleEnabled;
  el.titlePositionGroup.style.display = showTitleOptions ? '' : 'none';
  el.titleAlignGroup.style.display = showTitleOptions ? '' : 'none';
}

// ---- Collections ----

async function loadCollections() {
  state.collections = await api.listDataScope(SCOPES.collections);
  renderCollectionsList();
}

function renderCollectionsList() {
  el.collectionsList.innerHTML = '';

  var sorted = [...state.collections].sort(function (a, b) {
    return String(a.value?.name || '').localeCompare(String(b.value?.name || ''));
  });

  if (sorted.length === 0) {
    el.collectionsList.innerHTML =
      '<div class="card"><div class="empty">' +
      '<h3>Nog geen collecties</h3>' +
      '<p class="sub">Maak hierboven je eerste collectie aan om te beginnen.</p>' +
      '</div></div>';
    return;
  }

  var listWrap = document.createElement('div');
  listWrap.className = 'card';
  listWrap.innerHTML =
    '<div class="card-head">' +
    '<div>' +
    '<h3 class="card-title">Collecties</h3>' +
    '<p class="card-sub">Klik op een collectie om te bewerken.</p>' +
    '</div>' +
    '</div>' +
    '<div class="card-body" style="padding:0;"><div class="list"></div></div>';
  el.collectionsList.appendChild(listWrap);

  var listEl = listWrap.querySelector('.list');

  sorted.forEach(function (record, index) {
    var slug = record.value?.slug || record.key;
    var name = record.value?.name || slug;
    var layout = record.value?.layout || 'cards';
    var shortcode = shortcodeFor(slug);

    var row = document.createElement('div');
    row.className = 'list-row';
    row.innerHTML =
      '<span class="num">' + String(index + 1).padStart(2, '0') + '</span>' +
      '<div class="body">' +
      '<div class="title-line">' +
      '<span class="t">' + esc(name) + '</span>' +
      '<span class="slug-tag">/' + esc(slug) + '</span>' +
      '<span class="status-pill draft" style="text-transform:lowercase;">' + esc(layout) + '</span>' +
      '</div>' +
      '<div class="meta">' +
      '<span>Shortcode: <b>' + esc(shortcode) + '</b></span>' +
      '</div>' +
      '</div>' +
      '<div class="actions">' +
      '<button class="act" data-action="copy" title="Shortcode kopiëren" aria-label="Shortcode kopiëren">' + ICON.copy + '</button>' +
      '<button class="act" data-action="open" title="Bewerken" aria-label="Bewerken">' + ICON.edit + '</button>' +
      '<button class="act danger" data-action="delete" title="Verwijderen" aria-label="Verwijderen">' + ICON.trash + '</button>' +
      '</div>';

    row.querySelector('[data-action="copy"]').addEventListener('click', function () {
      void copyShortcode(slug);
    });
    row.querySelector('[data-action="open"]').addEventListener('click', function () {
      openEditor(slug);
    });
    row.querySelector('[data-action="delete"]').addEventListener('click', function () {
      openConfirm(
        'Collectie "' + name + '" en alle afbeeldingen verwijderen?',
        function () { void deleteCollection(slug); },
      );
    });

    listEl.appendChild(row);
  });
}

async function createCollection() {
  var name = el.newColName.value.trim();
  var slug = el.newColSlug.value.trim() || slugify(name);
  var layout = el.newColLayout.value;

  if (!name || !slug) {
    notify('Vul een naam en slug in', 'error');
    return;
  }

  slug = slugify(slug);

  var existing = state.collections.find(function (r) {
    return r.value?.slug === slug;
  });
  if (existing) {
    notify('Een collectie met deze slug bestaat al', 'error');
    return;
  }

  try {
    await api.upsertDataRecord(SCOPES.collections, colKey(slug), {
      slug: slug,
      name: name,
      layout: layout,
      columns: 3,
      lightbox: false,
      titlePosition: 'below',
      showTitle: false,
      titleAlign: 'left',
      buttonText: layout === 'news' ? 'Lees het bericht' : 'Bekijk project',
      backgroundColor: '',
    });

    el.newColName.value = '';
    el.newColSlug.value = '';
    delete el.newColSlug.dataset.manual;
    await loadCollections();
    openEditor(slug);
    notify('Collectie aangemaakt');
  } catch (err) {
    notify(err.message || 'Aanmaken mislukt', 'error');
  }
}

async function deleteCollection(slug) {
  try {
    var allItems = await api.listDataScope(SCOPES.items);
    var matching = allItems.filter(function (r) {
      return r.value?.collectionSlug === slug;
    });
    for (var item of matching) {
      await api.deleteDataRecord(SCOPES.items, item.key);
    }
    await api.deleteDataRecord(SCOPES.collections, colKey(slug));

    if (state.selectedSlug === slug) {
      closeEditor();
    }
    await loadCollections();
    notify('Collectie verwijderd');
  } catch (err) {
    notify(err.message || 'Verwijderen mislukt', 'error');
  }
}

// ---- Editor ----

function getSelectedCollection() {
  return state.collections.find(function (r) {
    return r.value?.slug === state.selectedSlug;
  });
}

async function openEditor(slug) {
  state.selectedSlug = slug;
  state.editingItemKey = null;

  el.collectionsView.style.display = 'none';
  el.editorView.style.display = '';

  var col = getSelectedCollection();
  var name = col?.value?.name || slug;

  el.editorTitle.innerHTML = esc(name) + ' <em>bewerken</em>';
  el.editorShortcode.innerHTML =
    '<span style="display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
    '<span>Shortcode:</span>' +
    '<code style="font-family:var(--mono); font-size:12px; color:var(--accent-2); background:var(--surface-2); padding:2px 8px; border-radius:4px; border:1px solid var(--hairline);">' +
    esc(shortcodeFor(slug)) + '</code>' +
    '<button class="act" data-editor-copy title="Shortcode kopiëren" aria-label="Shortcode kopiëren">' + ICON.copy + '</button>' +
    '</span>';
  var editorCopyBtn = el.editorShortcode.querySelector('[data-editor-copy]');
  if (editorCopyBtn) {
    editorCopyBtn.addEventListener('click', function () { void copyShortcode(slug); });
  }

  el.editName.value = col?.value?.name || '';
  el.editLayout.value = col?.value?.layout || 'cards';
  el.editColumns.value = String(col?.value?.columns || 3);
  setSwitchState(el.editLightboxSwitch, col?.value?.lightbox === true || col?.value?.lightbox === 'true');
  el.editTitlePosition.value = col?.value?.titlePosition || 'below';
  setSwitchState(el.editShowTitleSwitch, col?.value?.showTitle === true || col?.value?.showTitle === 'true');
  el.editTitleAlign.value = col?.value?.titleAlign || 'left';
  el.editBtnText.value = col?.value?.buttonText || 'Bekijk project';

  var bg = col?.value?.backgroundColor || '';
  el.editBgColorText.value = bg;
  if (/^#[0-9a-fA-F]{6}$/.test(bg)) {
    el.editBgColorPicker.value = bg;
    el.editBgColorSwatch.style.background = bg;
  } else {
    el.editBgColorPicker.value = '#000000';
    el.editBgColorSwatch.style.background = 'transparent';
  }

  updateLayoutFields();
  resetItemForm();
  await loadItems();
}

function closeEditor() {
  state.selectedSlug = null;
  state.editingItemKey = null;
  el.editorView.style.display = 'none';
  el.collectionsView.style.display = '';
  el.editorFeedback.innerHTML = '';
}

async function saveSettings() {
  if (!state.selectedSlug) return;

  var bgRaw = el.editBgColorText.value.trim();
  if (bgRaw && !isValidCssColor(bgRaw)) {
    notify('Ongeldige achtergrondkleur (gebruik #hex)', 'error');
    return;
  }

  try {
    await api.upsertDataRecord(SCOPES.collections, colKey(state.selectedSlug), {
      slug: state.selectedSlug,
      name: el.editName.value.trim(),
      layout: el.editLayout.value,
      columns: Number(el.editColumns.value),
      lightbox: isSwitchOn(el.editLightboxSwitch),
      titlePosition: el.editTitlePosition.value,
      showTitle: isSwitchOn(el.editShowTitleSwitch),
      titleAlign: el.editTitleAlign.value,
      buttonText: el.editBtnText.value.trim() || 'Bekijk project',
      backgroundColor: bgRaw,
    });

    await loadCollections();
    notify('Instellingen opgeslagen');
  } catch (err) {
    notify(err.message || 'Opslaan mislukt', 'error');
  }
}

// ---- Items ----

async function loadItems() {
  var all = await api.listDataScope(SCOPES.items);
  state.items = all.filter(function (r) {
    return r.value?.collectionSlug === state.selectedSlug;
  });
  state.items.sort(function (a, b) {
    return (Number(a.value?.sortOrder) || 0) - (Number(b.value?.sortOrder) || 0);
  });
  renderItemsList();
}

// ---- Drag-and-drop reordering ----

function clearDropIndicators() {
  el.itemsList.querySelectorAll('[data-is-row]').forEach(function (row) {
    row.style.boxShadow = '';
  });
}

function rowAtDragPoint(e) {
  return e.target.closest('[data-is-row]');
}

function dropPosition(row, e) {
  var rect = row.getBoundingClientRect();
  return (e.clientY - rect.top) < rect.height / 2 ? 'before' : 'after';
}

async function persistOrder(orderedKeys) {
  // Rewrite sortOrder for every item according to the new visual order.
  // Persisting all keeps integers dense (0..N-1) and avoids float math.
  var writes = orderedKeys.map(function (key, idx) {
    var record = state.items.find(function (r) { return r.key === key; });
    if (!record) return null;
    return api.upsertDataRecord(SCOPES.items, key, {
      ...record.value,
      sortOrder: idx,
    });
  }).filter(Boolean);
  await Promise.all(writes);
  await loadItems();
}

async function handleDrop(draggedKey, targetKey, position) {
  if (!draggedKey || !targetKey || draggedKey === targetKey) return;

  var currentOrder = state.items.map(function (r) { return r.key; });
  var fromIdx = currentOrder.indexOf(draggedKey);
  var toIdx = currentOrder.indexOf(targetKey);
  if (fromIdx < 0 || toIdx < 0) return;

  currentOrder.splice(fromIdx, 1);
  // Recompute target index after removal
  var newToIdx = currentOrder.indexOf(targetKey);
  var insertAt = position === 'before' ? newToIdx : newToIdx + 1;
  currentOrder.splice(insertAt, 0, draggedKey);

  try {
    await persistOrder(currentOrder);
  } catch (err) {
    notify(err.message || 'Volgorde wijzigen mislukt', 'error');
  }
}

// ---- Image preview modal ----

function openImagePreview(imageUrl, title) {
  if (!imageUrl) return;
  var existing = document.getElementById('is-preview-modal');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'is-preview-modal';
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.innerHTML =
    '<div class="modal lg" style="background:var(--bg-dim); padding:0;">' +
    '<div class="modal-head" style="border-bottom:1px solid var(--hairline);">' +
    '<div>' +
    '<h2 class="m-title">Voorbeeld' + (title ? ' &mdash; <em>' + esc(title) + '</em>' : '') + '</h2>' +
    '</div>' +
    '<button class="modal-close" type="button" aria-label="Sluiten">' + ICON.close + '</button>' +
    '</div>' +
    '<div style="padding:24px; display:flex; align-items:center; justify-content:center; background:var(--bg);">' +
    '<img src="' + esc(imageUrl) + '" alt="' + esc(title || '') + '" style="max-width:100%; max-height:70vh; display:block; border-radius:8px;" />' +
    '</div>' +
    '</div>';

  var closeBtn = overlay.querySelector('.modal-close');
  function closePreview() {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') closePreview();
  }
  closeBtn.addEventListener('click', closePreview);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePreview();
  });
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
  closeBtn.focus();
}

function renderItemsList() {
  el.itemsList.innerHTML = '';

  if (state.items.length === 0) {
    el.itemsList.innerHTML =
      '<div class="empty compact">' +
      '<h3 style="font-size:22px;">Nog geen afbeeldingen</h3>' +
      '<p class="sub">Sleep bestanden of voeg een URL toe om te beginnen.</p>' +
      '</div>';
    return;
  }

  state.items.forEach(function (record, index) {
    var imageUrl = record.value?.imageUrl || '';
    var title = record.value?.title || '';
    var linkUrl = record.value?.linkUrl || '';
    var previewUrl = normalizePluginMediaUrl(imageUrl);
    var isFirst = index === 0;
    var isLast = index === state.items.length - 1;

    var row = document.createElement('div');
    row.className = 'list-row';
    row.draggable = true;
    row.dataset.isRow = '1';
    row.dataset.itemKey = record.key;
    row.style.background = 'var(--surface)';
    row.style.border = '1px solid var(--hairline)';
    row.style.borderRadius = '12px';
    row.style.padding = '12px 14px';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '14px';
    row.style.transition = 'box-shadow 0.12s ease, opacity 0.12s ease';

    var thumbInner = previewUrl
      ? '<div style="width:100%; height:100%; background-image:url(' + esc(previewUrl) + '); background-size:cover; background-position:center;"></div>'
      : '<div style="width:100%; height:100%; display:grid; place-items:center; color:var(--text-4);">' + ICON.image + '</div>';

    row.innerHTML =
      '<button type="button" class="act" data-action="drag-handle" title="Sleep om te herordenen" aria-label="Sleep om te herordenen" style="cursor:grab; touch-action:none;">' + ICON.grip + '</button>' +
      '<button type="button" data-action="preview" title="Voorbeeld" aria-label="Voorbeeld" style="width:64px; height:48px; flex-shrink:0; border-radius:8px; overflow:hidden; background:var(--bg-dim); border:1px solid var(--hairline); padding:0; cursor:' + (previewUrl ? 'zoom-in' : 'default') + ';">' +
      thumbInner +
      '</button>' +
      '<div class="body" style="min-width:0; flex:1;">' +
      '<div class="title-line" style="margin-bottom:4px;">' +
      '<span class="t" style="font-family:var(--sans); font-size:14px; color:var(--text); font-style:' + (title ? 'normal' : 'italic') + ';">' +
      esc(title || 'Geen titel') +
      '</span>' +
      '</div>' +
      '<div class="meta">' +
      (linkUrl ? '<span>Link: <b>' + esc(linkUrl) + '</b></span>' : '<span>Geen link</span>') +
      '</div>' +
      '</div>' +
      '<div class="actions" style="opacity:1; gap:6px;">' +
      (isFirst ? '' : '<button class="act" data-action="up" title="Omhoog" aria-label="Omhoog">' + ICON.up + '</button>') +
      (isLast ? '' : '<button class="act" data-action="down" title="Omlaag" aria-label="Omlaag">' + ICON.down + '</button>') +
      '<button class="act" data-action="edit" title="Bewerken" aria-label="Bewerken">' + ICON.edit + '</button>' +
      '<button class="act danger" data-action="delete" title="Verwijderen" aria-label="Verwijderen">' + ICON.trash + '</button>' +
      '</div>';

    // Drag handle visual state (grab/grabbing cursor only — the whole row is draggable).
    var dragHandle = row.querySelector('[data-action="drag-handle"]');

    row.addEventListener('dragstart', function (e) {
      state.draggedItemKey = record.key;
      row.style.opacity = '0.4';
      if (dragHandle) dragHandle.style.cursor = 'grabbing';
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        // Required for Firefox to actually start the drag.
        try { e.dataTransfer.setData('text/plain', record.key); } catch (_err) {}
      }
    });
    row.addEventListener('dragend', function () {
      state.draggedItemKey = null;
      row.style.opacity = '';
      if (dragHandle) dragHandle.style.cursor = 'grab';
      clearDropIndicators();
    });
    row.addEventListener('dragover', function (e) {
      if (!state.draggedItemKey || state.draggedItemKey === record.key) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      var pos = dropPosition(row, e);
      // Inset shadow indicates drop edge (top for "before", bottom for "after").
      row.style.boxShadow = pos === 'before'
        ? 'inset 0 2px 0 0 var(--accent-2)'
        : 'inset 0 -2px 0 0 var(--accent-2)';
    });
    row.addEventListener('dragleave', function () {
      row.style.boxShadow = '';
    });
    row.addEventListener('drop', function (e) {
      e.preventDefault();
      var pos = dropPosition(row, e);
      var draggedKey = state.draggedItemKey;
      clearDropIndicators();
      if (draggedKey && draggedKey !== record.key) {
        void handleDrop(draggedKey, record.key, pos);
      }
    });

    // Preview button → modal
    var previewBtn = row.querySelector('[data-action="preview"]');
    if (previewBtn) {
      previewBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (previewUrl) openImagePreview(previewUrl, title);
      });
    }

    var upBtn = row.querySelector('[data-action="up"]');
    var downBtn = row.querySelector('[data-action="down"]');
    if (upBtn) upBtn.addEventListener('click', function () { void moveItem(index, -1); });
    if (downBtn) downBtn.addEventListener('click', function () { void moveItem(index, 1); });
    row.querySelector('[data-action="edit"]').addEventListener('click', function () {
      editItem(record);
    });
    row.querySelector('[data-action="delete"]').addEventListener('click', function () {
      openConfirm(
        'Deze afbeelding verwijderen?',
        function () { void deleteItem(record.key); },
      );
    });

    el.itemsList.appendChild(row);
  });
}

function resetItemForm() {
  state.editingItemKey = null;
  state.pendingFiles = [];
  el.itemFile.value = '';
  el.itemUrl.value = '';
  el.itemTitle.value = '';
  el.itemLink.value = '';
  el.addItemBtn.textContent = 'Afbeelding toevoegen';
  el.resetItemBtn.style.display = 'none';
  renderFilePreview();
}

function renderFilePreview() {
  var files = state.pendingFiles;
  if (!files.length) {
    el.itemFilePreview.style.display = 'none';
    el.itemFilePreview.textContent = '';
    return;
  }
  el.itemFilePreview.style.display = '';
  if (files.length === 1) {
    el.itemFilePreview.textContent = 'Geselecteerd: ' + files[0].name;
  } else {
    el.itemFilePreview.textContent = files.length + ' bestanden geselecteerd';
  }
}

function setPendingFiles(fileList) {
  var files = Array.from(fileList || []).filter(function (f) {
    return f && f.type && f.type.startsWith('image/');
  });
  state.pendingFiles = files;
  if (files.length === 1 && !el.itemTitle.value.trim()) {
    el.itemTitle.value = filenameToTitle(files[0].name);
  }
  renderFilePreview();
}

function editItem(record) {
  state.editingItemKey = record.key;
  state.pendingFiles = [];
  el.itemUrl.value = record.value?.imageUrl || '';
  el.itemTitle.value = record.value?.title || '';
  el.itemLink.value = record.value?.linkUrl || '';
  el.addItemBtn.textContent = 'Bijwerken';
  el.resetItemBtn.style.display = '';
  el.itemFile.value = '';
  renderFilePreview();
}

async function addOrUpdateItem() {
  if (!state.selectedSlug) return;

  var files = state.pendingFiles.slice();
  var urlInput = el.itemUrl.value.trim();
  var title = el.itemTitle.value.trim();
  var linkUrl = el.itemLink.value.trim();
  var isEditing = Boolean(state.editingItemKey);

  if (isEditing) {
    var imageUrl = urlInput;
    if (files.length > 0) {
      try {
        imageUrl = await api.uploadFile(await prepareFileForUpload(files[0]));
      } catch (err) {
        notify(err.message || 'Upload mislukt', 'error');
        return;
      }
    }
    if (!imageUrl) {
      notify('Selecteer een bestand of vul een URL in', 'error');
      return;
    }
    var existing = state.items.find(function (r) { return r.key === state.editingItemKey; });
    var sortOrder = existing?.value?.sortOrder ?? state.items.length;
    try {
      await api.upsertDataRecord(SCOPES.items, state.editingItemKey, {
        collectionSlug: state.selectedSlug,
        imageUrl: imageUrl,
        title: title,
        linkUrl: linkUrl,
        sortOrder: sortOrder,
      });
      resetItemForm();
      await loadItems();
      notify('Afbeelding bijgewerkt');
    } catch (err) {
      notify(err.message || 'Opslaan mislukt', 'error');
    }
    return;
  }

  if (files.length === 0 && !urlInput) {
    notify('Sleep bestanden of vul een URL in', 'error');
    return;
  }

  var baseSortOrder = state.items.length;
  var createdCount = 0;
  var failedCount = 0;

  if (files.length === 0 && urlInput) {
    try {
      await api.upsertDataRecord(
        SCOPES.items,
        'item_' + Date.now(),
        {
          collectionSlug: state.selectedSlug,
          imageUrl: urlInput,
          title: title,
          linkUrl: linkUrl,
          sortOrder: baseSortOrder,
        },
      );
      resetItemForm();
      await loadItems();
      notify('Afbeelding toegevoegd');
    } catch (err) {
      notify(err.message || 'Opslaan mislukt', 'error');
    }
    return;
  }

  el.addItemBtn.disabled = true;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    notify('Uploaden ' + (i + 1) + '/' + files.length + '…');
    try {
      var uploadedUrl = await api.uploadFile(await prepareFileForUpload(file));
      var itemTitle = files.length === 1 ? title : '';
      if (!itemTitle) itemTitle = filenameToTitle(file.name);
      var itemLink = files.length === 1 ? linkUrl : '';
      await api.upsertDataRecord(
        SCOPES.items,
        'item_' + Date.now() + '_' + i,
        {
          collectionSlug: state.selectedSlug,
          imageUrl: uploadedUrl,
          title: itemTitle,
          linkUrl: itemLink,
          sortOrder: baseSortOrder + i,
        },
      );
      createdCount += 1;
    } catch (err) {
      failedCount += 1;
      console.error('Upload failed for', file.name, err);
    }
  }
  el.addItemBtn.disabled = false;
  resetItemForm();
  await loadItems();

  if (failedCount === 0) {
    notify(createdCount === 1 ? 'Afbeelding toegevoegd' : createdCount + ' afbeeldingen toegevoegd');
  } else {
    notify(createdCount + ' toegevoegd, ' + failedCount + ' mislukt', 'error');
  }
}

async function deleteItem(key) {
  try {
    await api.deleteDataRecord(SCOPES.items, key);
    if (state.editingItemKey === key) resetItemForm();
    await loadItems();
    notify('Afbeelding verwijderd');
  } catch (err) {
    notify(err.message || 'Verwijderen mislukt', 'error');
  }
}

async function moveItem(currentIndex, direction) {
  var targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= state.items.length) return;

  var current = state.items[currentIndex];
  var target = state.items[targetIndex];

  var currentOrder = Number(current.value?.sortOrder ?? currentIndex);
  var targetOrder = Number(target.value?.sortOrder ?? targetIndex);

  try {
    await Promise.all([
      api.upsertDataRecord(SCOPES.items, current.key, {
        ...current.value,
        sortOrder: targetOrder,
      }),
      api.upsertDataRecord(SCOPES.items, target.key, {
        ...target.value,
        sortOrder: currentOrder,
      }),
    ]);
    await loadItems();
  } catch (err) {
    notify(err.message || 'Volgorde wijzigen mislukt', 'error');
  }
}

// ---- Event listeners ----

el.createColBtn.addEventListener('click', function () { void createCollection(); });
el.backBtn.addEventListener('click', closeEditor);
el.saveSettingsBtn.addEventListener('click', function () { void saveSettings(); });
el.addItemBtn.addEventListener('click', function () { void addOrUpdateItem(); });
el.resetItemBtn.addEventListener('click', resetItemForm);
el.editLayout.addEventListener('change', updateLayoutFields);

bindSwitch(el.editLightboxSwitch);
bindSwitch(el.editShowTitleSwitch, updateLayoutFields);

// Background color: keep picker + text input + swatch in sync
el.editBgColorPicker.addEventListener('input', function () {
  el.editBgColorText.value = el.editBgColorPicker.value;
  el.editBgColorSwatch.style.background = el.editBgColorPicker.value;
});
el.editBgColorText.addEventListener('input', syncBgColorFromText);
el.editBgColorClear.addEventListener('click', function () {
  el.editBgColorText.value = '';
  el.editBgColorPicker.value = '#000000';
  el.editBgColorSwatch.style.background = 'transparent';
});

// Dropzone interactions
el.itemDropzone.addEventListener('click', function (e) {
  if (e.target && e.target.tagName === 'INPUT') return;
  el.itemFile.click();
});
el.itemFile.addEventListener('change', function () {
  setPendingFiles(el.itemFile.files);
});
['dragenter', 'dragover'].forEach(function (evt) {
  el.itemDropzone.addEventListener(evt, function (e) {
    e.preventDefault();
    e.stopPropagation();
    el.itemDropzone.style.borderColor = 'var(--accent)';
    el.itemDropzone.style.background = 'var(--accent-soft)';
  });
});
['dragleave', 'drop'].forEach(function (evt) {
  el.itemDropzone.addEventListener(evt, function (e) {
    e.preventDefault();
    e.stopPropagation();
    el.itemDropzone.style.borderColor = '';
    el.itemDropzone.style.background = '';
  });
});
el.itemDropzone.addEventListener('drop', function (e) {
  var dt = e.dataTransfer;
  if (!dt || !dt.files || !dt.files.length) return;
  setPendingFiles(dt.files);
});

// Auto-fill slug from name
el.newColName.addEventListener('input', function () {
  if (!el.newColSlug.dataset.manual) {
    el.newColSlug.value = slugify(el.newColName.value);
  }
});
el.newColSlug.addEventListener('input', function () {
  el.newColSlug.dataset.manual = el.newColSlug.value ? '1' : '';
});

// Confirmation modal
el.confirmModalOk.addEventListener('click', function () {
  var cb = state.pendingConfirm;
  closeConfirm();
  if (typeof cb === 'function') cb();
});
el.confirmModalCancel.addEventListener('click', closeConfirm);
el.confirmModalClose.addEventListener('click', closeConfirm);
el.confirmModal.addEventListener('click', function (e) {
  if (e.target === el.confirmModal) closeConfirm();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && el.confirmModal.style.display !== 'none') {
    closeConfirm();
  }
});

// ---- Init ----

(async function init() {
  try {
    updateLayoutFields();
    await loadCollections();
  } catch (err) {
    console.error(err);
    notify(err.message || 'Plugin admin laden mislukt', 'error');
  }
})();
