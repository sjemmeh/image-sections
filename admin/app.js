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
};

const el = {
  collectionsCard: document.getElementById('collections-card'),
  editorCard: document.getElementById('editor-card'),
  editorTitle: document.getElementById('editor-title'),
  editorShortcode: document.getElementById('editor-shortcode'),
  collectionsList: document.getElementById('collections-list'),
  backBtn: document.getElementById('back-btn'),

  newColName: document.getElementById('new-col-name'),
  newColSlug: document.getElementById('new-col-slug'),
  newColLayout: document.getElementById('new-col-layout'),
  createColBtn: document.getElementById('create-col-btn'),

  editName: document.getElementById('edit-name'),
  editLayout: document.getElementById('edit-layout'),
  editColumns: document.getElementById('edit-columns'),
  editLightbox: document.getElementById('edit-lightbox'),
  editTitlePosition: document.getElementById('edit-title-position'),
  editShowTitle: document.getElementById('edit-show-title'),
  editTitleAlign: document.getElementById('edit-title-align'),
  editBtnText: document.getElementById('edit-btn-text'),
  editBgColorPicker: document.getElementById('edit-bg-color-picker'),
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
  itemsList: document.getElementById('items-list'),

  toast: document.getElementById('toast'),
};

// ---- UI helpers ----

const BUTTON_BASE =
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2';
const BUTTON_VARIANTS = {
  primary: `${BUTTON_BASE} bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5`,
  secondary: `${BUTTON_BASE} bg-gray-800 text-gray-200 hover:bg-gray-700 shadow-sm hover:shadow`,
  icon: 'inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white shadow-none h-8 w-8 p-1.5 rounded-md',
};

const EDIT_ICON = '<span aria-hidden="true" style="font-size:14px;line-height:1;color:#d4d4d8;display:block;">&#9998;</span>';
const DELETE_ICON = '<span aria-hidden="true" style="font-size:14px;line-height:1;color:#d4d4d8;display:block;">&#128465;</span>';
const ARROW_UP_ICON = '<span aria-hidden="true" style="font-size:14px;line-height:1;color:#d4d4d8;display:block;">&#9650;</span>';
const ARROW_DOWN_ICON = '<span aria-hidden="true" style="font-size:14px;line-height:1;color:#d4d4d8;display:block;">&#9660;</span>';

function applyButtonClasses(root) {
  (root || document).querySelectorAll('button[data-btn]').forEach(function (btn) {
    var variant = btn.getAttribute('data-btn') || 'secondary';
    btn.className = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.secondary;
  });
}

function iconBtn(attr, val, title, icon) {
  return `<button data-btn="icon" ${attr}="${esc(val)}" title="${esc(title)}" aria-label="${esc(title)}">${icon}</button>`;
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function notify(msg, isError) {
  el.toast.textContent = msg;
  el.toast.classList.remove('hidden');
  el.toast.style.borderColor = isError ? '#b91c1c' : '#374151';
  setTimeout(function () {
    el.toast.classList.add('hidden');
  }, 2200);
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
  // strip extension, replace separators with spaces, collapse whitespace, capitalize first letter
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
  }
}

// ---- Layout-specific visibility ----

function updateLayoutFields() {
  var layout = el.editLayout.value;
  var gridTitleEnabled = layout === 'grid' && el.editShowTitle.checked;

  el.lightboxGroup.style.display = '';
  el.btnTextGroup.style.display = layout === 'cards' ? '' : 'none';
  el.itemTitleGroup.style.display = layout === 'cards' ? '' : 'none';
  el.itemLinkGroup.style.display = layout === 'cards' ? '' : 'none';

  // Show title checkbox only relevant for grid
  el.showTitleGroup.style.display = layout === 'grid' ? '' : 'none';

  // Title position + alignment: always shown for cards; for grid only when show title is checked
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
      '<div class="px-6 py-4 text-muted-foreground text-sm">Nog geen collecties aangemaakt.</div>';
    return;
  }

  sorted.forEach(function (record) {
    var slug = esc(record.value?.slug || record.key);
    var name = esc(record.value?.name || slug);
    var layout = esc(record.value?.layout || 'cards');
    var shortcode = `{{plugin:image-section collection="${slug}"}}`;

    var row = document.createElement('div');
    row.className = 'px-6 py-4 hover:bg-muted/30 transition-colors duration-200';
    row.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <h4 class="text-lg font-semibold text-card-foreground">${name}</h4>
          <span class="text-sm text-muted-foreground">Layout: ${layout} &middot; <code class="text-xs bg-muted px-1 py-0.5 rounded">${esc(shortcode)}</code></span>
        </div>
        <div class="flex items-center gap-2">
          ${iconBtn('data-open', slug, 'Bewerken', EDIT_ICON)}
          ${iconBtn('data-delete', slug, 'Verwijderen', DELETE_ICON)}
        </div>
      </div>
    `;
    applyButtonClasses(row);

    row.querySelector('[data-open]').addEventListener('click', function () {
      openEditor(record.value?.slug);
    });
    row.querySelector('[data-delete]').addEventListener('click', function () {
      void deleteCollection(record.value?.slug);
    });

    el.collectionsList.appendChild(row);
  });
}

async function createCollection() {
  var name = el.newColName.value.trim();
  var slug = el.newColSlug.value.trim() || slugify(name);
  var layout = el.newColLayout.value;

  if (!name || !slug) {
    notify('Vul een naam en slug in', true);
    return;
  }

  slug = slugify(slug);

  var existing = state.collections.find(function (r) {
    return r.value?.slug === slug;
  });
  if (existing) {
    notify('Een collectie met deze slug bestaat al', true);
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
      buttonText: 'Bekijk project',
      backgroundColor: '',
    });

    el.newColName.value = '';
    el.newColSlug.value = '';
    await loadCollections();
    openEditor(slug);
    notify('Collectie aangemaakt');
  } catch (err) {
    notify(err.message || 'Aanmaken mislukt', true);
  }
}

async function deleteCollection(slug) {
  if (!confirm(`Collectie "${slug}" en alle afbeeldingen verwijderen?`)) return;

  try {
    // Delete all items for this collection
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
    notify(err.message || 'Verwijderen mislukt', true);
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

  el.collectionsCard.classList.add('hidden');
  el.editorCard.classList.remove('hidden');

  var col = getSelectedCollection();
  var name = col?.value?.name || slug;

  el.editorTitle.textContent = `${name}`;
  el.editorShortcode.innerHTML = `Shortcode: <code class="text-xs bg-muted px-1.5 py-0.5 rounded">{{plugin:image-section collection="${esc(slug)}"}}</code>`;

  el.editName.value = col?.value?.name || '';
  el.editLayout.value = col?.value?.layout || 'cards';
  el.editColumns.value = String(col?.value?.columns || 3);
  el.editLightbox.checked = col?.value?.lightbox === true || col?.value?.lightbox === 'true';
  el.editTitlePosition.value = col?.value?.titlePosition || 'below';
  el.editShowTitle.checked = col?.value?.showTitle === true || col?.value?.showTitle === 'true';
  el.editTitleAlign.value = col?.value?.titleAlign || 'left';
  el.editBtnText.value = col?.value?.buttonText || 'Bekijk project';
  var bg = col?.value?.backgroundColor || '';
  el.editBgColorText.value = bg;
  if (/^#[0-9a-fA-F]{6}$/.test(bg)) {
    el.editBgColorPicker.value = bg;
  } else {
    el.editBgColorPicker.value = '#000000';
  }

  updateLayoutFields();
  resetItemForm();
  await loadItems();
}

function closeEditor() {
  state.selectedSlug = null;
  state.editingItemKey = null;
  el.editorCard.classList.add('hidden');
  el.collectionsCard.classList.remove('hidden');
}

async function saveSettings() {
  if (!state.selectedSlug) return;

  var bgRaw = el.editBgColorText.value.trim();
  if (bgRaw && !isValidCssColor(bgRaw)) {
    notify('Ongeldige achtergrondkleur (gebruik #hex)', true);
    return;
  }

  try {
    await api.upsertDataRecord(SCOPES.collections, colKey(state.selectedSlug), {
      slug: state.selectedSlug,
      name: el.editName.value.trim(),
      layout: el.editLayout.value,
      columns: Number(el.editColumns.value),
      lightbox: el.editLightbox.checked,
      titlePosition: el.editTitlePosition.value,
      showTitle: el.editShowTitle.checked,
      titleAlign: el.editTitleAlign.value,
      buttonText: el.editBtnText.value.trim() || 'Bekijk project',
      backgroundColor: bgRaw,
    });

    await loadCollections();
    notify('Instellingen opgeslagen');
  } catch (err) {
    notify(err.message || 'Opslaan mislukt', true);
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

function renderItemsList() {
  el.itemsList.innerHTML = '';

  if (state.items.length === 0) {
    el.itemsList.innerHTML =
      '<div class="text-muted-foreground text-sm">Nog geen afbeeldingen toegevoegd.</div>';
    return;
  }

  state.items.forEach(function (record, index) {
    var imageUrl = record.value?.imageUrl || '';
    var title = esc(record.value?.title || '');
    var linkUrl = esc(record.value?.linkUrl || '');

    // Normalize the preview URL for display
    var previewUrl = normalizePluginMediaUrl(imageUrl);

    var row = document.createElement('div');
    row.className =
      'px-4 py-3 hover:bg-muted/30 transition-colors duration-200 border border-border rounded-xl';
    row.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-20 h-14 rounded overflow-hidden flex-shrink-0 bg-muted">
          ${previewUrl ? `<img src="${esc(previewUrl)}" alt="${title}" class="w-full h-full object-cover" loading="lazy" />` : '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>'}
        </div>
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <span class="text-sm font-semibold text-card-foreground truncate">${title || '<em class="text-muted-foreground">Geen titel</em>'}</span>
          ${linkUrl ? `<span class="text-xs text-muted-foreground truncate">${linkUrl}</span>` : ''}
        </div>
        <div class="flex items-center gap-1">
          ${index > 0 ? iconBtn('data-move-up', record.key, 'Omhoog', ARROW_UP_ICON) : ''}
          ${index < state.items.length - 1 ? iconBtn('data-move-down', record.key, 'Omlaag', ARROW_DOWN_ICON) : ''}
          ${iconBtn('data-edit', record.key, 'Bewerken', EDIT_ICON)}
          ${iconBtn('data-delete', record.key, 'Verwijderen', DELETE_ICON)}
        </div>
      </div>
    `;
    applyButtonClasses(row);

    var moveUpBtn = row.querySelector('[data-move-up]');
    var moveDownBtn = row.querySelector('[data-move-down]');
    if (moveUpBtn) moveUpBtn.addEventListener('click', function () { void moveItem(index, -1); });
    if (moveDownBtn) moveDownBtn.addEventListener('click', function () { void moveItem(index, 1); });

    row.querySelector('[data-edit]').addEventListener('click', function () {
      editItem(record);
    });
    row.querySelector('[data-delete]').addEventListener('click', function () {
      void deleteItem(record.key);
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
  renderFilePreview();
}

function renderFilePreview() {
  var files = state.pendingFiles;
  if (!files.length) {
    el.itemFilePreview.classList.add('hidden');
    el.itemFilePreview.textContent = '';
    return;
  }
  el.itemFilePreview.classList.remove('hidden');
  if (files.length === 1) {
    el.itemFilePreview.textContent = `Geselecteerd: ${files[0].name}`;
  } else {
    el.itemFilePreview.textContent = `${files.length} bestanden geselecteerd`;
  }
}

function setPendingFiles(fileList) {
  var files = Array.from(fileList || []).filter(function (f) {
    return f && f.type && f.type.startsWith('image/');
  });
  state.pendingFiles = files;
  // Auto-fill title from filename when exactly one file is selected and title is empty
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

  // Edit mode: keep single-record behaviour
  if (isEditing) {
    var imageUrl = urlInput;
    if (files.length > 0) {
      try {
        imageUrl = await api.uploadFile(files[0]);
      } catch (err) {
        notify(err.message || 'Upload mislukt', true);
        return;
      }
    }
    if (!imageUrl) {
      notify('Selecteer een bestand of vul een URL in', true);
      return;
    }
    var col = getSelectedCollection();
    var buttonText = col?.value?.buttonText || 'Bekijk project';
    var existing = state.items.find(function (r) { return r.key === state.editingItemKey; });
    var sortOrder = existing?.value?.sortOrder ?? state.items.length;
    try {
      await api.upsertDataRecord(SCOPES.items, state.editingItemKey, {
        collectionSlug: state.selectedSlug,
        imageUrl: imageUrl,
        title: title,
        linkUrl: linkUrl,
        buttonText: buttonText,
        sortOrder: sortOrder,
      });
      resetItemForm();
      await loadItems();
      notify('Afbeelding bijgewerkt');
    } catch (err) {
      notify(err.message || 'Opslaan mislukt', true);
    }
    return;
  }

  // Add mode: support 0 files (URL only), 1 file, or N files
  if (files.length === 0 && !urlInput) {
    notify('Sleep bestanden of vul een URL in', true);
    return;
  }

  var collection = getSelectedCollection();
  var btnText = collection?.value?.buttonText || 'Bekijk project';
  var baseSortOrder = state.items.length;
  var createdCount = 0;
  var failedCount = 0;

  // URL-only path
  if (files.length === 0 && urlInput) {
    try {
      await api.upsertDataRecord(
        SCOPES.items,
        `item_${Date.now()}`,
        {
          collectionSlug: state.selectedSlug,
          imageUrl: urlInput,
          title: title,
          linkUrl: linkUrl,
          buttonText: btnText,
          sortOrder: baseSortOrder,
        },
      );
      resetItemForm();
      await loadItems();
      notify('Afbeelding toegevoegd');
    } catch (err) {
      notify(err.message || 'Opslaan mislukt', true);
    }
    return;
  }

  // Multi-file upload loop
  el.addItemBtn.disabled = true;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    notify(`Uploaden ${i + 1}/${files.length}…`);
    try {
      var uploadedUrl = await api.uploadFile(file);
      var itemTitle = files.length === 1 ? title : '';
      if (!itemTitle) itemTitle = filenameToTitle(file.name);
      var itemLink = files.length === 1 ? linkUrl : '';
      await api.upsertDataRecord(
        SCOPES.items,
        `item_${Date.now()}_${i}`,
        {
          collectionSlug: state.selectedSlug,
          imageUrl: uploadedUrl,
          title: itemTitle,
          linkUrl: itemLink,
          buttonText: btnText,
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
    notify(createdCount === 1 ? 'Afbeelding toegevoegd' : `${createdCount} afbeeldingen toegevoegd`);
  } else {
    notify(`${createdCount} toegevoegd, ${failedCount} mislukt`, true);
  }
}

async function deleteItem(key) {
  try {
    await api.deleteDataRecord(SCOPES.items, key);
    if (state.editingItemKey === key) resetItemForm();
    await loadItems();
    notify('Afbeelding verwijderd');
  } catch (err) {
    notify(err.message || 'Verwijderen mislukt', true);
  }
}

async function moveItem(currentIndex, direction) {
  var targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= state.items.length) return;

  var current = state.items[currentIndex];
  var target = state.items[targetIndex];

  // Swap sort orders
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
    notify(err.message || 'Volgorde wijzigen mislukt', true);
  }
}

// ---- Event listeners ----

el.createColBtn.addEventListener('click', function () { void createCollection(); });
el.backBtn.addEventListener('click', closeEditor);
el.saveSettingsBtn.addEventListener('click', function () { void saveSettings(); });
el.addItemBtn.addEventListener('click', function () { void addOrUpdateItem(); });
el.editLayout.addEventListener('change', updateLayoutFields);
el.editShowTitle.addEventListener('change', updateLayoutFields);

// Background color: keep picker + text input in sync
el.editBgColorPicker.addEventListener('input', function () {
  el.editBgColorText.value = el.editBgColorPicker.value;
});
el.editBgColorText.addEventListener('input', syncBgColorFromText);
el.editBgColorClear.addEventListener('click', function () {
  el.editBgColorText.value = '';
  el.editBgColorPicker.value = '#000000';
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
    el.itemDropzone.classList.add('border-white/60', 'bg-white/10');
  });
});
['dragleave', 'drop'].forEach(function (evt) {
  el.itemDropzone.addEventListener(evt, function (e) {
    e.preventDefault();
    e.stopPropagation();
    el.itemDropzone.classList.remove('border-white/60', 'bg-white/10');
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

// ---- Init ----

(async function init() {
  try {
    applyButtonClasses();
    updateLayoutFields();
    await loadCollections();
  } catch (err) {
    console.error(err);
    notify(err.message || 'Plugin admin laden mislukt', true);
  }
})();
