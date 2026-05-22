import { createPluginAdminClient } from './plugin-admin-client.js';

const PLUGIN_NAME = 'image-sections';
const api = createPluginAdminClient(PLUGIN_NAME);

// ---- i18n ----
// Reads from `document.documentElement.lang` which the main admin shell
// keeps in sync with the user's active i18next language. Defaults to
// Dutch (the historical baseline) when lang is unknown or unset.
const LOCALES = {
  nl: {
    'eyebrow.plugin': 'Plugins · Image Sections',
    'page.collections.title': 'Afbeeldings|collecties',
    'page.collections.lede': 'Maak herbruikbare afbeeldingscollecties en gebruik ze in pagina‑inhoud via de shortcode.',
    'page.editor.title': '|bewerken',
    'section.newCollection.title': 'Nieuwe collectie',
    'section.newCollection.desc': 'Vul een naam in — de slug wordt automatisch gegenereerd — en kies een layout.',
    'section.settings.title': 'Instellingen',
    'section.settings.desc': 'Bepaal hoe deze collectie wordt weergegeven op de website.',
    'section.images.title': 'Afbeeldingen',
    'section.images.desc': 'Sleep meerdere bestanden tegelijk of voer een externe URL in.',
    'section.bin.title': 'Onlangs |verwijderd',
    'section.bin.desc': 'Verwijderde afbeeldingen worden hier 30 dagen bewaard. Daarna verdwijnen ze definitief.',
    'card.collections.title': 'Collecties',
    'card.collections.sub': 'Klik op een collectie om te bewerken.',
    'empty.collections.title': 'Nog geen collecties',
    'empty.collections.sub': 'Maak hierboven je eerste collectie aan om te beginnen.',
    'empty.results.title': 'Geen resultaten',
    'empty.results.sub': 'Pas je zoekopdracht aan of maak een nieuwe collectie aan.',
    'empty.items.title': 'Nog geen afbeeldingen',
    'empty.items.sub': 'Sleep bestanden of voeg een URL toe om te beginnen.',
    'label.name': 'NAAM',
    'label.slug': 'SLUG',
    'label.slug.hint': 'URL-veilige identifier',
    'label.layout': 'LAYOUT',
    'label.columns': 'KOLOMMEN',
    'label.lightbox': 'LIGHTBOX',
    'label.titlePosition': 'TITELPOSITIE',
    'label.titleAlign': 'UITLIJNING TITEL',
    'label.showTitle': 'TITEL TONEN',
    'label.buttonText': 'KNOPTEKST',
    'label.bgColor': 'ACHTERGRONDKLEUR',
    'label.bgColor.hint': 'Laat leeg voor een transparante achtergrond.',
    'label.url': 'OF EXTERNE URL',
    'label.title': 'TITEL',
    'label.alt': 'ALT-TEKST',
    'label.alt.hint': 'Valt terug op de titel als leeg gelaten.',
    'label.caption': 'ONDERSCHRIFT',
    'label.date': 'DATUM',
    'label.date.hint': 'Getoond in nieuws-layout.',
    'label.tags': 'TAGS',
    'label.tags.hint': 'Filter de output met <code>tag="featured"</code> in de shortcode.',
    'placeholder.tags': 'komma-gescheiden, bijv. featured, 2025',
    'label.mediaType': 'MEDIATYPE',
    'label.mediaType.hint': 'Afbeelding: JPG/PNG/WEBP/SVG. Video: directe MP4-URL. Embed: YouTube of Vimeo.',
    'label.poster': 'POSTER URL',
    'label.poster.hint': 'Stilstaande preview-afbeelding voor de video.',
    'label.url.image': 'OF EXTERNE URL',
    'label.url.video': 'VIDEO URL',
    'label.url.embed': 'EMBED URL (YOUTUBE / VIMEO)',
    'placeholder.poster': 'https://... (optioneel)',
    'option.mediaType.image': 'Afbeelding',
    'option.mediaType.video': 'Video',
    'option.mediaType.embed': 'Embed',
    'msg.embedNeedsUrl': 'Vul een YouTube- of Vimeo-URL in',
    'label.linkUrl': 'LINK URL',
    'label.filter': 'FILTER',
    'option.layout.cards': 'Kaarten — titel + knop',
    'option.layout.grid': 'Galerij grid',
    'option.layout.news': 'Nieuws — horizontaal scrollend',
    'option.layout.slider': 'Slider — full-width hero met autoplay',
    'option.layout.cards.short': 'Kaarten',
    'option.layout.grid.short': 'Galerij grid',
    'option.layout.news.short': 'Nieuws',
    'option.layout.slider.short': 'Slider',
    'label.sliderAutoplay': 'AUTOPLAY',
    'label.sliderInterval': 'INTERVAL (MS)',
    'label.sliderInterval.hint': 'Tussen 2000 en 20000 ms.',
    'label.sliderTransition': 'OVERGANG',
    'label.sliderHeight': 'HOOGTE',
    'label.sliderHeight.hint': 'CSS-lengte (60vh, 400px, 32rem, …).',
    'label.sliderCaptionPos': 'POSITIE ONDERSCHRIFT',
    'label.sliderShowDots': 'PUNTEN',
    'label.sliderShowArrows': 'PIJLEN',
    'toggle.sliderAutoplay.title': 'Automatisch doorlopen',
    'toggle.sliderAutoplay.desc': 'Uitgeschakeld bij prefers-reduced-motion',
    'toggle.sliderShowDots.title': 'Punten tonen',
    'toggle.sliderShowArrows.title': 'Pijlen tonen',
    'option.sliderTransition.fade': 'Fade',
    'option.sliderTransition.slide': 'Slide',
    'option.sliderCaptionPos.bottomLeft': 'Onder — links',
    'option.sliderCaptionPos.bottomCenter': 'Onder — midden',
    'option.sliderCaptionPos.bottomRight': 'Onder — rechts',
    'option.sliderCaptionPos.center': 'Midden',
    'option.sliderCaptionPos.topLeft': 'Boven — links',
    'option.sliderCaptionPos.topCenter': 'Boven — midden',
    'option.sliderCaptionPos.topRight': 'Boven — rechts',
    'option.titlePos.below': 'Onder afbeelding',
    'option.titlePos.above': 'Boven afbeelding',
    'option.titleAlign.left': 'Links',
    'option.titleAlign.center': 'Midden',
    'option.titleAlign.right': 'Rechts',
    'toggle.lightbox.title': 'Inschakelen',
    'toggle.lightbox.desc': 'Klik op een afbeelding om uit te vergroten',
    'toggle.showTitle.title': 'Toon bestandsnaam',
    'toggle.showTitle.desc': 'Onder elke afbeelding in het grid',
    'placeholder.colName': 'Bijv. Projecten',
    'placeholder.colSlug': 'bijv. projecten',
    'placeholder.bgColor': '#rrggbb of leeg = transparant',
    'placeholder.btnText': 'Bekijk project',
    'placeholder.url': 'https://...',
    'placeholder.title': 'Titel (optioneel bij meerdere bestanden)',
    'placeholder.alt': 'Beschrijving voor schermlezers',
    'placeholder.caption': 'Korte beschrijving onder de titel',
    'placeholder.search': 'Zoek collectie…',
    'btn.create': 'Collectie aanmaken',
    'btn.save': 'Instellingen opslaan',
    'btn.back': 'Terug naar collecties',
    'btn.transparent': 'Transparant',
    'btn.cancel': 'Annuleren',
    'btn.delete': 'Verwijderen',
    'btn.addImage': 'Afbeelding toevoegen',
    'btn.updateImage': 'Bijwerken',
    'btn.emptyBin': 'Prullenbak legen',
    'btn.confirm.delete': 'Verwijderen',
    'upload.title': 'Sleep afbeeldingen hierheen',
    'upload.sub': 'of klik om te kiezen — meerdere bestanden toegestaan',
    'upload.orPick': '— of —',
    'modal.confirm.title': 'Bevestig |verwijdering',
    'modal.confirm.text': 'Dit kan niet ongedaan worden gemaakt.',
    'modal.preview.title': 'Voorbeeld',
    'modal.library.title': 'Bibliotheek — |kies afbeelding',
    'modal.library.sub': 'Selecteer een of meerdere afbeeldingen uit de CMS-bibliotheek.',
    'section.preview.title': 'Live |voorbeeld',
    'section.preview.desc': 'Werkt automatisch bij — geen opslaan nodig om het effect te zien.',
    'option.viewport.desktop': 'Desktop',
    'option.viewport.tablet': 'Tablet',
    'option.viewport.mobile': 'Mobiel',
    'btn.refresh': 'Ververs',
    'msg.previewLoading': 'Laden…',
    'msg.previewReady': 'Bijgewerkt',
    'msg.previewFailed': 'Voorbeeld mislukt',
    'msg.previewEmpty': 'Voeg een afbeelding toe voor een voorbeeld',
    'btn.pickFromLibrary': 'Kies uit CMS-bibliotheek',
    'btn.libraryInsert': 'Invoegen',
    'msg.libraryLoading': 'Bibliotheek laden…',
    'msg.libraryEmpty.title': 'Geen afbeeldingen in de bibliotheek',
    'msg.libraryEmpty.sub': 'Upload eerst afbeeldingen via Media in het CMS.',
    'msg.libraryLoadFailed': 'Kon bibliotheek niet laden',
    'msg.libraryInserted.one': '1 afbeelding uit bibliotheek toegevoegd',
    'msg.libraryInserted.many': '{n} afbeeldingen uit bibliotheek toegevoegd',
    'msg.librarySelectedOne': '1 geselecteerd',
    'msg.librarySelectedMany': '{n} geselecteerd',
    'pill.unused': 'Ongebruikt',
    'pill.usedOne': 'Gebruikt op 1 pagina',
    'pill.usedMany': 'Gebruikt op {n} pagina\'s',
    'pill.unused.title': 'Geen pagina\'s gebruiken deze collectie',
    'pill.published': 'gepubliceerd',
    'pill.draft': 'concept',
    'meta.referencedOn': 'Deze collectie wordt nog gebruikt op:',
    'meta.link.label': 'Link:',
    'meta.noLink': 'Geen link',
    'meta.shortcode.label': 'Shortcode:',
    'meta.deleted.suffix': 'Verwijderd ',
    'aria.copyShortcode': 'Shortcode kopiëren',
    'aria.edit': 'Bewerken',
    'aria.delete': 'Verwijderen',
    'aria.up': 'Omhoog',
    'aria.down': 'Omlaag',
    'aria.drag': 'Sleep om te herordenen',
    'aria.preview': 'Voorbeeld',
    'aria.close': 'Sluiten',
    'aria.restore': 'Terugzetten',
    'aria.purge': 'Definitief verwijderen',
    'aria.bgColor': 'Kies een kleur',
    'msg.created': 'Collectie aangemaakt',
    'msg.deletedCollection': 'Collectie verwijderd',
    'msg.saved': 'Instellingen opgeslagen',
    'msg.imageAdded': 'Afbeelding toegevoegd',
    'msg.imageUpdated': 'Afbeelding bijgewerkt',
    'msg.imageDeleted': 'Afbeelding verplaatst naar prullenbak',
    'msg.imagesAdded': '{n} afbeeldingen toegevoegd',
    'msg.partialSuccess': '{ok} toegevoegd, {failed} mislukt',
    'msg.uploading': 'Uploaden {i}/{total}…',
    'msg.shortcodeCopied': 'Shortcode gekopieerd',
    'msg.copyFailed': 'Kopiëren mislukt',
    'msg.restored': 'Afbeelding teruggezet',
    'msg.purged': 'Definitief verwijderd',
    'msg.binEmptied': 'Prullenbak geleegd',
    'msg.requireNameSlug': 'Vul een naam en slug in',
    'msg.slugExists': 'Een collectie met deze slug bestaat al',
    'msg.requireFileOrUrl': 'Selecteer een bestand of vul een URL in',
    'msg.requireDropOrUrl': 'Sleep bestanden of vul een URL in',
    'msg.invalidColor': 'Ongeldige achtergrondkleur (gebruik #hex)',
    'msg.createFailed': 'Aanmaken mislukt',
    'msg.deleteFailed': 'Verwijderen mislukt',
    'msg.uploadFailed': 'Upload mislukt',
    'msg.saveFailed': 'Opslaan mislukt',
    'msg.reorderFailed': 'Volgorde wijzigen mislukt',
    'msg.restoreFailed': 'Terugzetten mislukt',
    'msg.purgeFailed': 'Verwijderen mislukt',
    'msg.emptyBinFailed': 'Leegmaken mislukt',
    'msg.restoreCorrupt': 'Kan niet terugzetten — record beschadigd',
    'msg.initFailed': 'Plugin admin laden mislukt',
    'confirm.deleteCollection': 'Collectie "{name}" en alle afbeeldingen verwijderen?',
    'confirm.deleteItem': 'Deze afbeelding verplaatsen naar de prullenbak? Je kunt hem 30 dagen terugzetten.',
    'confirm.purgeItem': 'Deze afbeelding definitief verwijderen?',
    'confirm.emptyBin': 'Prullenbak voor deze collectie definitief leegmaken?',
    'time.justNow': 'zojuist',
    'time.minutes': '{n} min geleden',
    'time.hours': '{n} uur geleden',
    'time.day': '{n} dag geleden',
    'time.days': '{n} dagen geleden',
    'time.over30': 'meer dan 30 dagen geleden',
    'placeholder.colTitle': 'Geen titel',
  },
  en: {
    'eyebrow.plugin': 'Plugins · Image Sections',
    'page.collections.title': 'Image |collections',
    'page.collections.lede': 'Create reusable image collections and embed them in page content via the shortcode.',
    'page.editor.title': '|edit',
    'section.newCollection.title': 'New collection',
    'section.newCollection.desc': 'Enter a name — the slug is generated automatically — and pick a layout.',
    'section.settings.title': 'Settings',
    'section.settings.desc': 'Control how this collection appears on the site.',
    'section.images.title': 'Images',
    'section.images.desc': 'Drop multiple files at once or enter an external URL.',
    'section.bin.title': 'Recently |deleted',
    'section.bin.desc': 'Deleted images are kept here for 30 days. After that they are removed permanently.',
    'card.collections.title': 'Collections',
    'card.collections.sub': 'Click a collection to edit it.',
    'empty.collections.title': 'No collections yet',
    'empty.collections.sub': 'Create your first collection above to get started.',
    'empty.results.title': 'No results',
    'empty.results.sub': 'Refine your search or create a new collection.',
    'empty.items.title': 'No images yet',
    'empty.items.sub': 'Drop files or add a URL to get started.',
    'label.name': 'NAME',
    'label.slug': 'SLUG',
    'label.slug.hint': 'URL-safe identifier',
    'label.layout': 'LAYOUT',
    'label.columns': 'COLUMNS',
    'label.lightbox': 'LIGHTBOX',
    'label.titlePosition': 'TITLE POSITION',
    'label.titleAlign': 'TITLE ALIGNMENT',
    'label.showTitle': 'SHOW TITLE',
    'label.buttonText': 'BUTTON TEXT',
    'label.bgColor': 'BACKGROUND COLOR',
    'label.bgColor.hint': 'Leave empty for a transparent background.',
    'label.url': 'OR EXTERNAL URL',
    'label.title': 'TITLE',
    'label.alt': 'ALT TEXT',
    'label.alt.hint': 'Falls back to the title when left empty.',
    'label.caption': 'CAPTION',
    'label.date': 'DATE',
    'label.date.hint': 'Shown in news layout.',
    'label.tags': 'TAGS',
    'label.tags.hint': 'Filter the output with <code>tag="featured"</code> in the shortcode.',
    'placeholder.tags': 'comma-separated, e.g. featured, 2025',
    'label.mediaType': 'MEDIA TYPE',
    'label.mediaType.hint': 'Image: JPG/PNG/WEBP/SVG. Video: direct MP4 URL. Embed: YouTube or Vimeo.',
    'label.poster': 'POSTER URL',
    'label.poster.hint': 'Still preview frame shown before the video plays.',
    'label.url.image': 'OR EXTERNAL URL',
    'label.url.video': 'VIDEO URL',
    'label.url.embed': 'EMBED URL (YOUTUBE / VIMEO)',
    'placeholder.poster': 'https://... (optional)',
    'option.mediaType.image': 'Image',
    'option.mediaType.video': 'Video',
    'option.mediaType.embed': 'Embed',
    'msg.embedNeedsUrl': 'Enter a YouTube or Vimeo URL',
    'label.linkUrl': 'LINK URL',
    'label.filter': 'FILTER',
    'option.layout.cards': 'Cards — title + button',
    'option.layout.grid': 'Gallery grid',
    'option.layout.news': 'News — horizontal scroll',
    'option.layout.slider': 'Slider — full-width hero with autoplay',
    'option.layout.cards.short': 'Cards',
    'option.layout.grid.short': 'Gallery grid',
    'option.layout.news.short': 'News',
    'option.layout.slider.short': 'Slider',
    'label.sliderAutoplay': 'AUTOPLAY',
    'label.sliderInterval': 'INTERVAL (MS)',
    'label.sliderInterval.hint': 'Between 2000 and 20000 ms.',
    'label.sliderTransition': 'TRANSITION',
    'label.sliderHeight': 'HEIGHT',
    'label.sliderHeight.hint': 'CSS length (60vh, 400px, 32rem, …).',
    'label.sliderCaptionPos': 'CAPTION POSITION',
    'label.sliderShowDots': 'DOTS',
    'label.sliderShowArrows': 'ARROWS',
    'toggle.sliderAutoplay.title': 'Cycle automatically',
    'toggle.sliderAutoplay.desc': 'Disabled when prefers-reduced-motion is on',
    'toggle.sliderShowDots.title': 'Show dots',
    'toggle.sliderShowArrows.title': 'Show arrows',
    'option.sliderTransition.fade': 'Fade',
    'option.sliderTransition.slide': 'Slide',
    'option.sliderCaptionPos.bottomLeft': 'Bottom — left',
    'option.sliderCaptionPos.bottomCenter': 'Bottom — center',
    'option.sliderCaptionPos.bottomRight': 'Bottom — right',
    'option.sliderCaptionPos.center': 'Center',
    'option.sliderCaptionPos.topLeft': 'Top — left',
    'option.sliderCaptionPos.topCenter': 'Top — center',
    'option.sliderCaptionPos.topRight': 'Top — right',
    'option.titlePos.below': 'Below image',
    'option.titlePos.above': 'Above image',
    'option.titleAlign.left': 'Left',
    'option.titleAlign.center': 'Center',
    'option.titleAlign.right': 'Right',
    'toggle.lightbox.title': 'Enable',
    'toggle.lightbox.desc': 'Click an image to view it enlarged',
    'toggle.showTitle.title': 'Show filename',
    'toggle.showTitle.desc': 'Under each image in the grid',
    'placeholder.colName': 'e.g. Projects',
    'placeholder.colSlug': 'e.g. projects',
    'placeholder.bgColor': '#rrggbb or empty = transparent',
    'placeholder.btnText': 'View project',
    'placeholder.url': 'https://...',
    'placeholder.title': 'Title (optional when multiple files)',
    'placeholder.alt': 'Description for screen readers',
    'placeholder.caption': 'Short text below the title',
    'placeholder.search': 'Search collection…',
    'btn.create': 'Create collection',
    'btn.save': 'Save settings',
    'btn.back': 'Back to collections',
    'btn.transparent': 'Transparent',
    'btn.cancel': 'Cancel',
    'btn.delete': 'Delete',
    'btn.addImage': 'Add image',
    'btn.updateImage': 'Update',
    'btn.emptyBin': 'Empty bin',
    'btn.confirm.delete': 'Delete',
    'upload.title': 'Drop images here',
    'upload.sub': 'or click to choose — multiple files allowed',
    'upload.orPick': '— or —',
    'modal.confirm.title': 'Confirm |deletion',
    'modal.confirm.text': 'This cannot be undone.',
    'modal.preview.title': 'Preview',
    'modal.library.title': 'Library — |pick image',
    'modal.library.sub': 'Pick one or more images from the CMS media library.',
    'section.preview.title': 'Live |preview',
    'section.preview.desc': 'Updates automatically — no save needed to see the effect.',
    'option.viewport.desktop': 'Desktop',
    'option.viewport.tablet': 'Tablet',
    'option.viewport.mobile': 'Mobile',
    'btn.refresh': 'Refresh',
    'msg.previewLoading': 'Loading…',
    'msg.previewReady': 'Up to date',
    'msg.previewFailed': 'Preview failed',
    'msg.previewEmpty': 'Add an image to see a preview',
    'btn.pickFromLibrary': 'Pick from CMS library',
    'btn.libraryInsert': 'Insert',
    'msg.libraryLoading': 'Loading library…',
    'msg.libraryEmpty.title': 'No images in the library',
    'msg.libraryEmpty.sub': 'Upload images via Media in the CMS first.',
    'msg.libraryLoadFailed': 'Failed to load library',
    'msg.libraryInserted.one': '1 image added from library',
    'msg.libraryInserted.many': '{n} images added from library',
    'msg.librarySelectedOne': '1 selected',
    'msg.librarySelectedMany': '{n} selected',
    'pill.unused': 'Unused',
    'pill.usedOne': 'Used on 1 page',
    'pill.usedMany': 'Used on {n} pages',
    'pill.unused.title': 'No pages reference this collection',
    'pill.published': 'published',
    'pill.draft': 'draft',
    'meta.referencedOn': 'This collection is still referenced on:',
    'meta.link.label': 'Link:',
    'meta.noLink': 'No link',
    'meta.shortcode.label': 'Shortcode:',
    'meta.deleted.suffix': 'Deleted ',
    'aria.copyShortcode': 'Copy shortcode',
    'aria.edit': 'Edit',
    'aria.delete': 'Delete',
    'aria.up': 'Move up',
    'aria.down': 'Move down',
    'aria.drag': 'Drag to reorder',
    'aria.preview': 'Preview',
    'aria.close': 'Close',
    'aria.restore': 'Restore',
    'aria.purge': 'Delete permanently',
    'aria.bgColor': 'Pick a color',
    'msg.created': 'Collection created',
    'msg.deletedCollection': 'Collection deleted',
    'msg.saved': 'Settings saved',
    'msg.imageAdded': 'Image added',
    'msg.imageUpdated': 'Image updated',
    'msg.imageDeleted': 'Image moved to bin',
    'msg.imagesAdded': '{n} images added',
    'msg.partialSuccess': '{ok} added, {failed} failed',
    'msg.uploading': 'Uploading {i}/{total}…',
    'msg.shortcodeCopied': 'Shortcode copied',
    'msg.copyFailed': 'Copy failed',
    'msg.restored': 'Image restored',
    'msg.purged': 'Permanently deleted',
    'msg.binEmptied': 'Bin emptied',
    'msg.requireNameSlug': 'Enter a name and slug',
    'msg.slugExists': 'A collection with this slug already exists',
    'msg.requireFileOrUrl': 'Select a file or enter a URL',
    'msg.requireDropOrUrl': 'Drop files or enter a URL',
    'msg.invalidColor': 'Invalid background color (use #hex)',
    'msg.createFailed': 'Create failed',
    'msg.deleteFailed': 'Delete failed',
    'msg.uploadFailed': 'Upload failed',
    'msg.saveFailed': 'Save failed',
    'msg.reorderFailed': 'Reorder failed',
    'msg.restoreFailed': 'Restore failed',
    'msg.purgeFailed': 'Delete failed',
    'msg.emptyBinFailed': 'Empty failed',
    'msg.restoreCorrupt': 'Cannot restore — record corrupt',
    'msg.initFailed': 'Failed to load plugin admin',
    'confirm.deleteCollection': 'Delete collection "{name}" and all images?',
    'confirm.deleteItem': 'Move this image to the bin? You can restore it for 30 days.',
    'confirm.purgeItem': 'Delete this image permanently?',
    'confirm.emptyBin': 'Permanently empty the bin for this collection?',
    'time.justNow': 'just now',
    'time.minutes': '{n} min ago',
    'time.hours': '{n} hr ago',
    'time.day': '{n} day ago',
    'time.days': '{n} days ago',
    'time.over30': 'over 30 days ago',
    'placeholder.colTitle': 'No title',
  },
};

function activeLocale() {
  var code = (document.documentElement.lang || 'nl').toLowerCase().slice(0, 2);
  return LOCALES[code] ? code : 'nl';
}

/**
 * Translate a key. Supports `{var}` interpolation. Two-segment keys like
 * `'page.editor.title': '|edit'` represent strings where the part after the
 * pipe is wrapped in <em> for the serif italic accent — emitted by
 * tEmphasised() and used in headers and modal titles.
 */
function t(key, vars) {
  var dict = LOCALES[activeLocale()] || LOCALES.nl;
  var raw = dict[key];
  if (raw == null) raw = (LOCALES.nl[key] != null ? LOCALES.nl[key] : key);
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, function (_m, name) {
    return vars[name] != null ? String(vars[name]) : '{' + name + '}';
  });
}

/**
 * Render a string with a `|`-separated emphasised tail (Wraps the second
 * part in <em>). Returns an HTML string — caller is responsible for
 * making sure the surrounding context is safe to inject HTML into.
 */
function tEmphasised(key, vars) {
  var raw = t(key, vars);
  var idx = raw.indexOf('|');
  if (idx < 0) return esc(raw);
  var head = raw.slice(0, idx);
  var tail = raw.slice(idx + 1);
  return esc(head) + '<em>' + esc(tail) + '</em>';
}

/**
 * Walk DOM nodes carrying data-i18n* attributes and replace their
 * text / attribute values from the active dictionary. Safe to call
 * repeatedly — already-translated nodes are simply rewritten.
 */
function applyI18n(root) {
  var scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach(function (node) {
    var key = node.getAttribute('data-i18n');
    if (node.dataset.i18nHtml === 'emphasised') {
      node.innerHTML = tEmphasised(key);
    } else {
      node.textContent = t(key);
    }
  });
  scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
    node.setAttribute('placeholder', t(node.getAttribute('data-i18n-placeholder')));
  });
  scope.querySelectorAll('[data-i18n-title]').forEach(function (node) {
    node.setAttribute('title', t(node.getAttribute('data-i18n-title')));
  });
  scope.querySelectorAll('[data-i18n-aria-label]').forEach(function (node) {
    node.setAttribute('aria-label', t(node.getAttribute('data-i18n-aria-label')));
  });
}

const SCOPES = {
  collections: 'collections',
  items: 'items',
  deletedItems: 'deleted_items',
};

// Soft-deleted items live in `deleted_items` for 30 days, then are pruned.
const BIN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// Add some entropy to delete-keys so two deletes within the same ms don't collide.
function delKey(originalKey) {
  return 'del_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '_' + originalKey;
}

const state = {
  collections: [],
  items: [],
  deletedItems: [],
  selectedSlug: null,
  editingItemKey: null,
  pendingFiles: [],
  feedbackTimer: null,
  pendingConfirm: null,
  draggedItemKey: null,
  // Map of collection slug -> array of { id, slug, title, published }.
  // Populated asynchronously after collections render so the list shows a
  // loading-neutral state first, then fills in "used on N pages" badges.
  references: {},
  // Plugin-level config (from plugin.json configSchema, set in main admin's
  // generic Plugins page). Defaults baked in here in case the fetch fails.
  pluginConfig: {
    defaultLayout: 'cards',
    defaultColumns: 3,
    defaultButtonText: 'Bekijk project',
    lightboxEnabledByDefault: false,
  },
  collectionSearchTerm: '',
  // CMS library picker state — list of image rows from the backend and a Set
  // of selected filenames (filename is the stable identifier since the URL
  // is /images/<filename>).
  libraryImages: [],
  librarySelected: new Set(),
  // Current item-form media type: 'image' | 'video' | 'embed'. Drives the
  // visibility of the poster input and the contextual URL label.
  itemMediaType: 'image',
  // Live preview state. previewDebounce holds the pending setTimeout id
  // so each new edit cancels the previous one. previewToken bumps on
  // every request so out-of-order responses (slow + fast in flight) are
  // dropped — only the most recent request paints. previewSupported is
  // flipped false on the first 404/422 so older backends without the
  // /preview endpoint silently hide the iframe instead of nagging.
  previewDebounce: null,
  previewToken: 0,
  previewViewport: 'desktop',
  previewSupported: true,
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

  collectionsFilterRow: document.getElementById('collections-filter-row'),
  collectionsSearch: document.getElementById('collections-search'),

  recycleBinSection: document.getElementById('recycle-bin-section'),
  recycleBinList: document.getElementById('recycle-bin-list'),
  emptyBinBtn: document.getElementById('empty-bin-btn'),

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

  editSliderAutoplaySwitch: document.getElementById('edit-slider-autoplay-switch'),
  editSliderInterval: document.getElementById('edit-slider-interval'),
  editSliderTransition: document.getElementById('edit-slider-transition'),
  editSliderHeight: document.getElementById('edit-slider-height'),
  editSliderCaptionPos: document.getElementById('edit-slider-caption-pos'),
  editSliderDotsSwitch: document.getElementById('edit-slider-dots-switch'),
  editSliderArrowsSwitch: document.getElementById('edit-slider-arrows-switch'),
  sliderAutoplayGroup: document.getElementById('slider-autoplay-group'),
  sliderIntervalGroup: document.getElementById('slider-interval-group'),
  sliderTransitionGroup: document.getElementById('slider-transition-group'),
  sliderHeightGroup: document.getElementById('slider-height-group'),
  sliderCaptionPosGroup: document.getElementById('slider-caption-pos-group'),
  sliderDotsGroup: document.getElementById('slider-dots-group'),
  sliderArrowsGroup: document.getElementById('slider-arrows-group'),

  saveSettingsBtn: document.getElementById('save-settings-btn'),

  itemFile: document.getElementById('item-file'),
  itemDropzone: document.getElementById('item-dropzone'),
  itemFilePreview: document.getElementById('item-file-preview'),
  itemUrl: document.getElementById('item-url'),
  itemTitle: document.getElementById('item-title'),
  itemTitleGroup: document.getElementById('item-title-group'),
  itemAlt: document.getElementById('item-alt'),
  itemAltGroup: document.getElementById('item-alt-group'),
  itemCaption: document.getElementById('item-caption'),
  itemCaptionGroup: document.getElementById('item-caption-group'),
  itemDate: document.getElementById('item-date'),
  itemDateGroup: document.getElementById('item-date-group'),
  itemTags: document.getElementById('item-tags'),
  itemTagsGroup: document.getElementById('item-tags-group'),
  itemMediaType: document.getElementById('item-media-type'),
  itemPoster: document.getElementById('item-poster'),
  itemPosterGroup: document.getElementById('item-poster-group'),
  itemUrlLabel: document.getElementById('item-url-label'),
  itemLink: document.getElementById('item-link'),
  itemLinkGroup: document.getElementById('item-link-group'),
  addItemBtn: document.getElementById('add-item-btn'),
  resetItemBtn: document.getElementById('reset-item-btn'),
  itemsList: document.getElementById('items-list'),

  confirmModal: document.getElementById('confirm-modal'),
  confirmModalText: document.getElementById('confirm-modal-text'),
  confirmModalBody: document.getElementById('confirm-modal-body'),
  confirmModalOk: document.getElementById('confirm-modal-ok'),
  confirmModalCancel: document.getElementById('confirm-modal-cancel'),
  confirmModalClose: document.getElementById('confirm-modal-close'),

  previewSection: document.getElementById('preview-section'),
  previewIframe: document.getElementById('preview-iframe'),
  previewFrameWrap: document.getElementById('preview-frame-wrap'),
  previewStatus: document.getElementById('preview-status'),
  previewViewport: document.getElementById('preview-viewport'),
  previewRefreshBtn: document.getElementById('preview-refresh-btn'),

  openLibraryBtn: document.getElementById('open-library-btn'),
  libraryModal: document.getElementById('library-modal'),
  libraryModalClose: document.getElementById('library-modal-close'),
  libraryModalCancel: document.getElementById('library-modal-cancel'),
  libraryModalInsert: document.getElementById('library-modal-insert'),
  libraryGrid: document.getElementById('library-grid'),
  libraryLoading: document.getElementById('library-loading'),
  libraryEmpty: document.getElementById('library-empty'),
  librarySelectionCount: document.getElementById('library-selection-count'),
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
    notify(t('msg.shortcodeCopied'));
  } catch (err) {
    notify(err.message || t('msg.copyFailed'), 'error');
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

function openConfirm(message, onConfirm, bodyHtml) {
  el.confirmModalText.textContent = message;
  if (bodyHtml) {
    el.confirmModalBody.innerHTML = bodyHtml;
    el.confirmModalBody.style.display = '';
  } else {
    el.confirmModalBody.innerHTML = '';
    el.confirmModalBody.style.display = 'none';
  }
  state.pendingConfirm = onConfirm;
  el.confirmModal.style.display = 'flex';
}

function closeConfirm() {
  state.pendingConfirm = null;
  el.confirmModalBody.innerHTML = '';
  el.confirmModalBody.style.display = 'none';
  el.confirmModal.style.display = 'none';
}

// ---- Layout-specific visibility ----

function updateLayoutFields() {
  var layout = el.editLayout.value;
  var gridTitleEnabled = layout === 'grid' && isSwitchOn(el.editShowTitleSwitch);
  var isNews = layout === 'news';
  var isSlider = layout === 'slider';

  el.lightboxGroup.style.display = '';
  // Slider also uses the buttonText (CTA on each slide) — share the field.
  el.btnTextGroup.style.display = (layout === 'cards' || isNews || isSlider) ? '' : 'none';
  // Title is editable everywhere except plain grid without showTitle.
  el.itemTitleGroup.style.display = (layout === 'cards' || isNews || isSlider || gridTitleEnabled) ? '' : 'none';
  el.itemLinkGroup.style.display = (layout === 'cards' || isNews || isSlider) ? '' : 'none';

  el.showTitleGroup.style.display = layout === 'grid' ? '' : 'none';

  var showTitleOptions = layout === 'cards' || gridTitleEnabled;
  el.titlePositionGroup.style.display = showTitleOptions ? '' : 'none';
  el.titleAlignGroup.style.display = showTitleOptions ? '' : 'none';

  // Slider-specific settings — show only when layout === 'slider'.
  var sliderDisplay = isSlider ? '' : 'none';
  if (el.sliderAutoplayGroup) el.sliderAutoplayGroup.style.display = sliderDisplay;
  if (el.sliderIntervalGroup) el.sliderIntervalGroup.style.display = sliderDisplay;
  if (el.sliderTransitionGroup) el.sliderTransitionGroup.style.display = sliderDisplay;
  if (el.sliderHeightGroup) el.sliderHeightGroup.style.display = sliderDisplay;
  if (el.sliderCaptionPosGroup) el.sliderCaptionPosGroup.style.display = sliderDisplay;
  if (el.sliderDotsGroup) el.sliderDotsGroup.style.display = sliderDisplay;
  if (el.sliderArrowsGroup) el.sliderArrowsGroup.style.display = sliderDisplay;
}

// ---- Collections ----

async function loadCollections() {
  state.collections = await api.listDataScope(SCOPES.collections);
  renderCollectionsList();
  // Fire-and-forget: pages-references is non-essential for first paint,
  // so don't block list rendering on it. Errors are swallowed silently
  // so the admin still works against backends that lack the endpoint.
  void loadReferences();
}

async function loadReferences() {
  var slugs = state.collections
    .map(function (r) { return r.value?.slug; })
    .filter(Boolean);

  if (slugs.length === 0) return;

  try {
    var results = await Promise.allSettled(slugs.map(function (slug) {
      return api.findShortcodeReferences('image-section', 'collection', slug);
    }));
    results.forEach(function (res, i) {
      var slug = slugs[i];
      state.references[slug] = res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : [];
    });
    renderCollectionsList();
  } catch (_err) {
    // Endpoint unavailable or other failure — silently leave the
    // badges off; everything else keeps working.
  }
}

function referenceBadgeHtml(slug) {
  var refs = state.references[slug];
  if (!Array.isArray(refs)) return '';  // not yet loaded
  if (refs.length === 0) {
    return '<span class="status-pill draft" title="' + esc(t('pill.unused.title')) + '">' + esc(t('pill.unused')) + '</span>';
  }
  var label = refs.length === 1 ? t('pill.usedOne') : t('pill.usedMany', { n: refs.length });
  var titles = refs.map(function (r) { return r.title; }).join(' · ');
  return '<span class="status-pill" title="' + esc(titles) + '">' + esc(label) + '</span>';
}

function referenceListHtml(slug) {
  var refs = state.references[slug];
  if (!Array.isArray(refs) || refs.length === 0) return '';
  var rows = refs.map(function (r) {
    var statusLabel = r.published ? t('pill.published') : t('pill.draft');
    return (
      '<li style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--hairline);">' +
      '<span class="slug-tag">/' + esc(r.slug) + '</span>' +
      '<span style="flex:1; font-size:13px; color:var(--text);">' + esc(r.title) + '</span>' +
      '<span class="status-pill' + (r.published ? '' : ' draft') + '">' + esc(statusLabel) + '</span>' +
      '</li>'
    );
  }).join('');
  return (
    '<p class="modal-copy" style="margin-bottom:8px;">' + esc(t('meta.referencedOn')) + '</p>' +
    '<ul style="list-style:none; padding:0; margin:0;">' + rows + '</ul>'
  );
}

function renderCollectionsList() {
  el.collectionsList.innerHTML = '';

  var sorted = [...state.collections].sort(function (a, b) {
    return String(a.value?.name || '').localeCompare(String(b.value?.name || ''));
  });

  // Show the search row only when there are enough collections to make it useful.
  if (el.collectionsFilterRow) {
    el.collectionsFilterRow.style.display = sorted.length >= 5 ? '' : 'none';
  }

  if (sorted.length === 0) {
    el.collectionsList.innerHTML =
      '<div class="card"><div class="empty">' +
      '<h3>' + esc(t('empty.collections.title')) + '</h3>' +
      '<p class="sub">' + esc(t('empty.collections.sub')) + '</p>' +
      '</div></div>';
    return;
  }

  // Client-side filter by name or slug.
  var q = state.collectionSearchTerm.trim().toLowerCase();
  if (q) {
    sorted = sorted.filter(function (r) {
      var name = String(r.value?.name || '').toLowerCase();
      var slug = String(r.value?.slug || r.key || '').toLowerCase();
      return name.indexOf(q) >= 0 || slug.indexOf(q) >= 0;
    });
    if (sorted.length === 0) {
      el.collectionsList.innerHTML =
        '<div class="card"><div class="empty compact">' +
        '<h3 style="font-size:22px;">' + esc(t('empty.results.title')) + '</h3>' +
        '<p class="sub">' + esc(t('empty.results.sub')) + '</p>' +
        '</div></div>';
      return;
    }
  }

  var listWrap = document.createElement('div');
  listWrap.className = 'card';
  listWrap.innerHTML =
    '<div class="card-head">' +
    '<div>' +
    '<h3 class="card-title">' + esc(t('card.collections.title')) + '</h3>' +
    '<p class="card-sub">' + esc(t('card.collections.sub')) + '</p>' +
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
      referenceBadgeHtml(slug) +
      '</div>' +
      '<div class="meta">' +
      '<span>' + esc(t('meta.shortcode.label')) + ' <b>' + esc(shortcode) + '</b></span>' +
      '</div>' +
      '</div>' +
      '<div class="actions">' +
      '<button class="act" data-action="copy" title="' + esc(t('aria.copyShortcode')) + '" aria-label="' + esc(t('aria.copyShortcode')) + '">' + ICON.copy + '</button>' +
      '<button class="act" data-action="open" title="' + esc(t('aria.edit')) + '" aria-label="' + esc(t('aria.edit')) + '">' + ICON.edit + '</button>' +
      '<button class="act danger" data-action="delete" title="' + esc(t('aria.delete')) + '" aria-label="' + esc(t('aria.delete')) + '">' + ICON.trash + '</button>' +
      '</div>';

    row.querySelector('[data-action="copy"]').addEventListener('click', function () {
      void copyShortcode(slug);
    });
    row.querySelector('[data-action="open"]').addEventListener('click', function () {
      openEditor(slug);
    });
    row.querySelector('[data-action="delete"]').addEventListener('click', function () {
      openConfirm(
        t('confirm.deleteCollection', { name: name }),
        function () { void deleteCollection(slug); },
        referenceListHtml(slug),
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
    notify(t('msg.requireNameSlug'), 'error');
    return;
  }

  slug = slugify(slug);

  var existing = state.collections.find(function (r) {
    return r.value?.slug === slug;
  });
  if (existing) {
    notify(t('msg.slugExists'), 'error');
    return;
  }

  var cfg = state.pluginConfig;
  // News layout uses its own default ("read the article") rather than the
  // cards button text — the configurable default doesn't fit semantically.
  var defaultButtonText = layout === 'news'
    ? (activeLocale() === 'en' ? 'Read the article' : 'Lees het bericht')
    : (cfg.defaultButtonText || (activeLocale() === 'en' ? 'View project' : 'Bekijk project'));

  try {
    await api.upsertDataRecord(SCOPES.collections, colKey(slug), {
      slug: slug,
      name: name,
      layout: layout,
      columns: Number(cfg.defaultColumns) || 3,
      lightbox: cfg.lightboxEnabledByDefault === true,
      titlePosition: 'below',
      showTitle: false,
      titleAlign: 'left',
      buttonText: defaultButtonText,
      backgroundColor: '',
      sliderAutoplay: true,
      sliderInterval: 5000,
      sliderTransition: 'fade',
      sliderHeight: '60vh',
      sliderCaptionPos: 'bottom-left',
      sliderShowDots: true,
      sliderShowArrows: true,
    });

    el.newColName.value = '';
    el.newColSlug.value = '';
    delete el.newColSlug.dataset.manual;
    await loadCollections();
    openEditor(slug);
    notify(t('msg.created'));
  } catch (err) {
    notify(err.message || t('msg.createFailed'), 'error');
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

    // Also clear any orphan bin entries for this collection so they don't
    // sit forever (we deleted the parent — the bin is for individual-item
    // recovery, not collection-level rollback).
    try {
      var allBin = await api.listDataScope(SCOPES.deletedItems);
      var binMatches = allBin.filter(function (r) {
        return r.value?.collectionSlug === slug;
      });
      for (var binEntry of binMatches) {
        await api.deleteDataRecord(SCOPES.deletedItems, binEntry.key);
      }
    } catch (_err) { /* tolerate older backends */ }

    await api.deleteDataRecord(SCOPES.collections, colKey(slug));

    if (state.selectedSlug === slug) {
      closeEditor();
    }
    await loadCollections();
    notify(t('msg.deletedCollection'));
  } catch (err) {
    notify(err.message || t('msg.deleteFailed'), 'error');
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

  // The editor title is "<collection name> <em>edit</em>" — the part after
  // the pipe in page.editor.title is the italicised verb.
  var titleSuffix = t('page.editor.title');
  var pipeIdx = titleSuffix.indexOf('|');
  var verbTail = pipeIdx >= 0 ? titleSuffix.slice(pipeIdx + 1) : titleSuffix;
  el.editorTitle.innerHTML = esc(name) + ' <em>' + esc(verbTail) + '</em>';
  el.editorShortcode.innerHTML =
    '<span style="display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
    '<span>' + esc(t('meta.shortcode.label')) + '</span>' +
    '<code style="font-family:var(--mono); font-size:12px; color:var(--accent-2); background:var(--surface-2); padding:2px 8px; border-radius:4px; border:1px solid var(--hairline);">' +
    esc(shortcodeFor(slug)) + '</code>' +
    '<button class="act" data-editor-copy title="' + esc(t('aria.copyShortcode')) + '" aria-label="' + esc(t('aria.copyShortcode')) + '">' + ICON.copy + '</button>' +
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
  el.editBtnText.value = col?.value?.buttonText || (activeLocale() === 'en' ? 'View project' : 'Bekijk project');

  var bg = col?.value?.backgroundColor || '';
  el.editBgColorText.value = bg;
  if (/^#[0-9a-fA-F]{6}$/.test(bg)) {
    el.editBgColorPicker.value = bg;
    el.editBgColorSwatch.style.background = bg;
  } else {
    el.editBgColorPicker.value = '#000000';
    el.editBgColorSwatch.style.background = 'transparent';
  }

  // Slider-specific settings. Defaults match server.js renderSlider().
  setSwitchState(el.editSliderAutoplaySwitch, col?.value?.sliderAutoplay !== false && col?.value?.sliderAutoplay !== 'false');
  el.editSliderInterval.value = String(col?.value?.sliderInterval || 5000);
  el.editSliderTransition.value = col?.value?.sliderTransition || 'fade';
  el.editSliderHeight.value = col?.value?.sliderHeight || '60vh';
  el.editSliderCaptionPos.value = col?.value?.sliderCaptionPos || 'bottom-left';
  setSwitchState(el.editSliderDotsSwitch, col?.value?.sliderShowDots !== false && col?.value?.sliderShowDots !== 'false');
  setSwitchState(el.editSliderArrowsSwitch, col?.value?.sliderShowArrows !== false && col?.value?.sliderShowArrows !== 'false');

  updateLayoutFields();
  resetItemForm();
  await loadItems();
  await loadDeletedItems();
  // Initial render — populates the iframe with the current persisted
  // state. Subsequent edits debounce through scheduleRenderPreview().
  void renderPreview();
}

function closeEditor() {
  state.selectedSlug = null;
  state.editingItemKey = null;
  state.deletedItems = [];
  renderRecycleBin();
  el.editorView.style.display = 'none';
  el.collectionsView.style.display = '';
  el.editorFeedback.innerHTML = '';
}

async function saveSettings() {
  if (!state.selectedSlug) return;

  var bgRaw = el.editBgColorText.value.trim();
  if (bgRaw && !isValidCssColor(bgRaw)) {
    notify(t('msg.invalidColor'), 'error');
    return;
  }

  // Clamp the interval client-side too so the form can't write an
  // out-of-range value the server would silently snap anyway.
  var sliderInterval = Number(el.editSliderInterval.value);
  if (!Number.isFinite(sliderInterval) || sliderInterval < 2000) sliderInterval = 5000;
  sliderInterval = Math.max(2000, Math.min(20000, sliderInterval));

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
      buttonText: el.editBtnText.value.trim() || (activeLocale() === 'en' ? 'View project' : 'Bekijk project'),
      backgroundColor: bgRaw,
      sliderAutoplay: isSwitchOn(el.editSliderAutoplaySwitch),
      sliderInterval: sliderInterval,
      sliderTransition: el.editSliderTransition.value,
      sliderHeight: el.editSliderHeight.value.trim() || '60vh',
      sliderCaptionPos: el.editSliderCaptionPos.value,
      sliderShowDots: isSwitchOn(el.editSliderDotsSwitch),
      sliderShowArrows: isSwitchOn(el.editSliderArrowsSwitch),
    });

    await loadCollections();
    notify(t('msg.saved'));
  } catch (err) {
    notify(err.message || t('msg.saveFailed'), 'error');
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
  scheduleRenderPreview();
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
    notify(err.message || t('msg.reorderFailed'), 'error');
  }
}

// ---- Image preview modal ----

// ---- Live preview ----

const PREVIEW_DEBOUNCE_MS = 450;
const PREVIEW_VIEWPORT_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

/**
 * Build a snapshot of "what would the rendered output look like with the
 * editor's current state" — collection settings come straight from the
 * form inputs (not the persisted record) so the preview reflects
 * unsaved changes, items come from state.items.
 *
 * The collection is remapped to a synthetic slug "preview" so the
 * shortcode handler resolves the snapshot rather than any stored data.
 */
function buildPreviewSnapshot() {
  if (!state.selectedSlug) return null;

  var bgRaw = el.editBgColorText.value.trim();
  var bgColor = isValidCssColor(bgRaw) ? bgRaw : '';

  var sliderInterval = Number(el.editSliderInterval.value);
  if (!Number.isFinite(sliderInterval) || sliderInterval < 2000) sliderInterval = 5000;
  sliderInterval = Math.max(2000, Math.min(20000, sliderInterval));

  var collectionValue = {
    slug: 'preview',
    name: el.editName.value.trim() || 'Preview',
    layout: el.editLayout.value,
    columns: Number(el.editColumns.value) || 3,
    lightbox: isSwitchOn(el.editLightboxSwitch),
    titlePosition: el.editTitlePosition.value,
    showTitle: isSwitchOn(el.editShowTitleSwitch),
    titleAlign: el.editTitleAlign.value,
    buttonText: el.editBtnText.value.trim() || (activeLocale() === 'en' ? 'View project' : 'Bekijk project'),
    backgroundColor: bgColor,
    sliderAutoplay: isSwitchOn(el.editSliderAutoplaySwitch),
    sliderInterval: sliderInterval,
    sliderTransition: el.editSliderTransition.value,
    sliderHeight: el.editSliderHeight.value.trim() || '60vh',
    sliderCaptionPos: el.editSliderCaptionPos.value,
    sliderShowDots: isSwitchOn(el.editSliderDotsSwitch),
    sliderShowArrows: isSwitchOn(el.editSliderArrowsSwitch),
  };

  // Items: clone the live items, remapping each one's collectionSlug to
  // the synthetic "preview" slug so the server's filter picks them up.
  var items = state.items.map(function (r) {
    return {
      key: r.key,
      value: Object.assign({}, r.value, { collectionSlug: 'preview' }),
    };
  });

  return {
    collections: [
      { key: 'col_preview', value: collectionValue },
    ],
    items: items,
  };
}

function setPreviewStatus(textKey, color) {
  if (!el.previewStatus) return;
  el.previewStatus.textContent = textKey ? t(textKey) : '';
  el.previewStatus.style.color = color || 'var(--text-3)';
}

async function renderPreview() {
  if (!state.previewSupported || !el.previewIframe || !state.selectedSlug) return;

  var snapshot = buildPreviewSnapshot();
  if (!snapshot) return;

  if (snapshot.items.length === 0) {
    el.previewIframe.srcdoc =
      '<!doctype html><html><body style="font-family:system-ui; color:#6b7280; padding:32px; text-align:center;">' +
      esc(t('msg.previewEmpty')) + '</body></html>';
    setPreviewStatus('', '');
    return;
  }

  // Bump the token before issuing the request; if a later request returns
  // first, the earlier one's response is dropped silently.
  state.previewToken += 1;
  var myToken = state.previewToken;
  setPreviewStatus('msg.previewLoading');

  try {
    var html = await api.renderPreview('image-section', { collection: 'preview' }, snapshot);
    if (myToken !== state.previewToken) return;  // superseded
    el.previewIframe.srcdoc = html;
    setPreviewStatus('msg.previewReady', 'var(--ok)');
  } catch (err) {
    if (myToken !== state.previewToken) return;
    // 404 / unsupported endpoint → hide the preview panel entirely and
    // stop trying. Anything else surfaces as an inline error.
    var msg = err && err.message ? err.message : '';
    if (/404|not found|not supported/i.test(msg)) {
      state.previewSupported = false;
      if (el.previewSection) el.previewSection.style.display = 'none';
      return;
    }
    setPreviewStatus('msg.previewFailed', 'var(--bad)');
    console.error('Preview render failed:', err);
  }
}

function scheduleRenderPreview() {
  if (!state.previewSupported || !state.selectedSlug) return;
  if (state.previewDebounce) clearTimeout(state.previewDebounce);
  state.previewDebounce = setTimeout(function () {
    state.previewDebounce = null;
    void renderPreview();
  }, PREVIEW_DEBOUNCE_MS);
}

function setPreviewViewport(viewport) {
  var v = (viewport === 'tablet' || viewport === 'mobile') ? viewport : 'desktop';
  state.previewViewport = v;
  if (el.previewIframe) {
    el.previewIframe.style.maxWidth = PREVIEW_VIEWPORT_WIDTHS[v];
  }
  if (el.previewViewport) {
    el.previewViewport.querySelectorAll('button[data-viewport]').forEach(function (btn) {
      var active = btn.getAttribute('data-viewport') === v;
      btn.classList.toggle('on', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
}

// ---- Item media-type switcher ----

function setItemMediaType(type) {
  var t2 = (type === 'video' || type === 'embed') ? type : 'image';
  state.itemMediaType = t2;
  // Update segmented control's .on state + aria-pressed for keyboard users.
  if (el.itemMediaType) {
    el.itemMediaType.querySelectorAll('button[data-media-type]').forEach(function (btn) {
      var active = btn.getAttribute('data-media-type') === t2;
      btn.classList.toggle('on', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  // Poster field is only meaningful for direct <video> playback.
  if (el.itemPosterGroup) {
    el.itemPosterGroup.style.display = t2 === 'video' ? '' : 'none';
  }
  // Swap the URL label so it reads correctly for the picked media type.
  if (el.itemUrlLabel) {
    el.itemUrlLabel.setAttribute('data-i18n', 'label.url.' + t2);
    el.itemUrlLabel.textContent = t('label.url.' + t2);
  }
  if (el.itemFile) {
    // For video/embed the drop-zone file input is no use — the user is
    // pasting a URL. Disabling the dropzone is more honest than
    // pretending it accepts videos (the upload pipeline is image-only).
    el.itemFile.disabled = t2 !== 'image';
  }
}

// ---- CMS library picker ----

function updateLibrarySelectionCount() {
  if (!el.librarySelectionCount) return;
  var n = state.librarySelected.size;
  if (n === 0) {
    el.librarySelectionCount.textContent = '';
  } else if (n === 1) {
    el.librarySelectionCount.textContent = t('msg.librarySelectedOne');
  } else {
    el.librarySelectionCount.textContent = t('msg.librarySelectedMany', { n: n });
  }
  if (el.libraryModalInsert) el.libraryModalInsert.disabled = n === 0;
}

function renderLibraryGrid() {
  el.libraryGrid.innerHTML = '';
  if (state.libraryImages.length === 0) {
    el.libraryEmpty.style.display = '';
    return;
  }
  el.libraryEmpty.style.display = 'none';

  state.libraryImages.forEach(function (img) {
    var selected = state.librarySelected.has(img.filename);
    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'library-tile';
    tile.dataset.filename = img.filename;
    tile.style.cssText = [
      'position:relative',
      'background:var(--surface)',
      'border:2px solid ' + (selected ? 'var(--accent-2)' : 'var(--hairline)'),
      'border-radius:10px',
      'overflow:hidden',
      'cursor:pointer',
      'padding:0',
      'transition:border-color 0.15s ease',
      'aspect-ratio:1 / 1',
    ].join(';');
    tile.setAttribute('aria-pressed', selected ? 'true' : 'false');
    tile.innerHTML =
      '<img src="' + esc(img.thumbnailUrl) + '" alt="' + esc(img.filename) + '" ' +
      'style="width:100%; height:100%; object-fit:cover; display:block;" loading="lazy" />' +
      // Selected overlay: shaded background + corner check.
      (selected
        ? '<div style="position:absolute; inset:0; background:rgba(217,70,239,0.18);"></div>' +
          '<div style="position:absolute; top:6px; right:6px; width:22px; height:22px; border-radius:50%; background:var(--accent-2); color:#fff; display:grid; place-items:center; font-size:12px; font-weight:700;">✓</div>'
        : '') +
      // Filename label.
      '<div style="position:absolute; bottom:0; left:0; right:0; padding:6px 8px; background:linear-gradient(0deg, rgba(0,0,0,0.7), transparent); color:#fff; font-family:var(--mono); font-size:10.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' +
      esc(img.filename) +
      '</div>';

    tile.addEventListener('click', function () {
      if (state.librarySelected.has(img.filename)) {
        state.librarySelected.delete(img.filename);
      } else {
        state.librarySelected.add(img.filename);
      }
      renderLibraryGrid();
      updateLibrarySelectionCount();
    });

    el.libraryGrid.appendChild(tile);
  });
}

async function openLibraryPicker() {
  if (!state.selectedSlug) return;
  state.librarySelected = new Set();
  updateLibrarySelectionCount();

  el.libraryModal.style.display = 'flex';
  el.libraryGrid.innerHTML = '';
  el.libraryEmpty.style.display = 'none';
  el.libraryLoading.style.display = '';

  try {
    state.libraryImages = await api.listCmsImages();
  } catch (err) {
    el.libraryLoading.style.display = 'none';
    notify(err.message || t('msg.libraryLoadFailed'), 'error');
    closeLibraryPicker();
    return;
  }

  el.libraryLoading.style.display = 'none';
  renderLibraryGrid();
}

function closeLibraryPicker() {
  el.libraryModal.style.display = 'none';
  state.librarySelected = new Set();
}

async function insertFromLibrary() {
  if (!state.selectedSlug || state.librarySelected.size === 0) return;

  // Pull the rows that match the selected filenames so we know which
  // originalUrl to write — preserves picker-order is fine, the user
  // can drag-reorder afterwards.
  var picks = state.libraryImages.filter(function (img) {
    return state.librarySelected.has(img.filename);
  });
  if (picks.length === 0) return;

  var baseSortOrder = state.items.length;
  var createdCount = 0;
  el.libraryModalInsert.disabled = true;

  for (var i = 0; i < picks.length; i++) {
    var pick = picks[i];
    try {
      await api.upsertDataRecord(
        SCOPES.items,
        'item_' + Date.now() + '_lib_' + i,
        {
          collectionSlug: state.selectedSlug,
          imageUrl: pick.originalUrl,
          // No title/alt/caption/date/tags/linkUrl seeding — the user
          // can fill those in via the per-item edit form after insertion.
          title: '',
          altText: '',
          caption: '',
          date: '',
          tags: [],
          mediaType: 'image',
          videoPoster: '',
          linkUrl: '',
          sortOrder: baseSortOrder + i,
        },
      );
      createdCount += 1;
    } catch (err) {
      console.error('Library insert failed for', pick.filename, err);
    }
  }

  closeLibraryPicker();
  await loadItems();

  notify(
    createdCount === 1
      ? t('msg.libraryInserted.one')
      : t('msg.libraryInserted.many', { n: createdCount }),
  );
}

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
    '<h2 class="m-title">' + esc(t('modal.preview.title')) + (title ? ' &mdash; <em>' + esc(title) + '</em>' : '') + '</h2>' +
    '</div>' +
    '<button class="modal-close" type="button" aria-label="' + esc(t('aria.close')) + '">' + ICON.close + '</button>' +
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
      '<h3 style="font-size:22px;">' + esc(t('empty.items.title')) + '</h3>' +
      '<p class="sub">' + esc(t('empty.items.sub')) + '</p>' +
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
      '<button type="button" class="act" data-action="drag-handle" title="' + esc(t('aria.drag')) + '" aria-label="' + esc(t('aria.drag')) + '" style="cursor:grab; touch-action:none;">' + ICON.grip + '</button>' +
      '<button type="button" data-action="preview" title="' + esc(t('aria.preview')) + '" aria-label="' + esc(t('aria.preview')) + '" style="width:64px; height:48px; flex-shrink:0; border-radius:8px; overflow:hidden; background:var(--bg-dim); border:1px solid var(--hairline); padding:0; cursor:' + (previewUrl ? 'zoom-in' : 'default') + ';">' +
      thumbInner +
      '</button>' +
      '<div class="body" style="min-width:0; flex:1;">' +
      '<div class="title-line" style="margin-bottom:4px;">' +
      '<span class="t" style="font-family:var(--sans); font-size:14px; color:var(--text); font-style:' + (title ? 'normal' : 'italic') + ';">' +
      esc(title || t('placeholder.colTitle')) +
      '</span>' +
      '</div>' +
      '<div class="meta">' +
      (linkUrl
        ? '<span>' + esc(t('meta.link.label')) + ' <b>' + esc(linkUrl) + '</b></span>'
        : '<span>' + esc(t('meta.noLink')) + '</span>') +
      '</div>' +
      '</div>' +
      '<div class="actions" style="opacity:1; gap:6px;">' +
      (isFirst ? '' : '<button class="act" data-action="up" title="' + esc(t('aria.up')) + '" aria-label="' + esc(t('aria.up')) + '">' + ICON.up + '</button>') +
      (isLast ? '' : '<button class="act" data-action="down" title="' + esc(t('aria.down')) + '" aria-label="' + esc(t('aria.down')) + '">' + ICON.down + '</button>') +
      '<button class="act" data-action="edit" title="' + esc(t('aria.edit')) + '" aria-label="' + esc(t('aria.edit')) + '">' + ICON.edit + '</button>' +
      '<button class="act danger" data-action="delete" title="' + esc(t('aria.delete')) + '" aria-label="' + esc(t('aria.delete')) + '">' + ICON.trash + '</button>' +
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
        t('confirm.deleteItem'),
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
  el.itemAlt.value = '';
  el.itemCaption.value = '';
  el.itemDate.value = '';
  el.itemTags.value = '';
  if (el.itemPoster) el.itemPoster.value = '';
  el.itemLink.value = '';
  setItemMediaType('image');
  el.addItemBtn.textContent = t('btn.addImage');
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
  el.itemAlt.value = record.value?.altText || '';
  el.itemCaption.value = record.value?.caption || '';
  // <input type="date"> wants YYYY-MM-DD — slice the ISO string we store.
  el.itemDate.value = (record.value?.date || '').toString().slice(0, 10);
  // Tags can be stored as array OR comma-string from legacy / hand-edited rows.
  var rawTags = record.value?.tags;
  el.itemTags.value = Array.isArray(rawTags) ? rawTags.join(', ') : (rawTags || '');
  setItemMediaType(record.value?.mediaType || 'image');
  if (el.itemPoster) el.itemPoster.value = record.value?.videoPoster || '';
  el.itemLink.value = record.value?.linkUrl || '';
  el.addItemBtn.textContent = t('btn.updateImage');
  el.resetItemBtn.style.display = '';
  el.itemFile.value = '';
  renderFilePreview();
}

async function addOrUpdateItem() {
  if (!state.selectedSlug) return;

  var files = state.pendingFiles.slice();
  var urlInput = el.itemUrl.value.trim();
  var title = el.itemTitle.value.trim();
  var altText = el.itemAlt.value.trim();
  var caption = el.itemCaption.value.trim();
  var date = el.itemDate.value.trim();
  // Normalise to an array, dropping empty entries — keeps the server-side
  // tag filter simple (it accepts both array and comma-string anyway).
  var tags = el.itemTags.value
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  var mediaType = state.itemMediaType;
  var videoPoster = el.itemPoster ? el.itemPoster.value.trim() : '';
  var linkUrl = el.itemLink.value.trim();
  var isEditing = Boolean(state.editingItemKey);

  // Video / embed require a URL — the file dropzone is image-only. Skip
  // the file path entirely for those types so the user sees the right
  // failure mode if they forgot the URL.
  if ((mediaType === 'video' || mediaType === 'embed') && !urlInput) {
    notify(mediaType === 'embed' ? t('msg.embedNeedsUrl') : t('msg.requireFileOrUrl'), 'error');
    return;
  }

  if (isEditing) {
    var imageUrl = urlInput;
    if (files.length > 0) {
      try {
        imageUrl = await api.uploadFile(await prepareFileForUpload(files[0]));
      } catch (err) {
        notify(err.message || t('msg.uploadFailed'), 'error');
        return;
      }
    }
    if (!imageUrl) {
      notify(t('msg.requireFileOrUrl'), 'error');
      return;
    }
    var existing = state.items.find(function (r) { return r.key === state.editingItemKey; });
    var sortOrder = existing?.value?.sortOrder ?? state.items.length;
    try {
      await api.upsertDataRecord(SCOPES.items, state.editingItemKey, {
        collectionSlug: state.selectedSlug,
        imageUrl: imageUrl,
        title: title,
        altText: altText,
        caption: caption,
        date: date,
        tags: tags,
        mediaType: mediaType,
        videoPoster: videoPoster,
        linkUrl: linkUrl,
        sortOrder: sortOrder,
      });
      resetItemForm();
      await loadItems();
      notify(t('msg.imageUpdated'));
    } catch (err) {
      notify(err.message || t('msg.saveFailed'), 'error');
    }
    return;
  }

  if (files.length === 0 && !urlInput) {
    notify(t('msg.requireDropOrUrl'), 'error');
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
          altText: altText,
          caption: caption,
          date: date,
          tags: tags,
          mediaType: mediaType,
          videoPoster: videoPoster,
          linkUrl: linkUrl,
          sortOrder: baseSortOrder,
        },
      );
      resetItemForm();
      await loadItems();
      notify(t('msg.imageAdded'));
    } catch (err) {
      notify(err.message || t('msg.saveFailed'), 'error');
    }
    return;
  }

  el.addItemBtn.disabled = true;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    notify(t('msg.uploading', { i: i + 1, total: files.length }));
    try {
      var uploadedUrl = await api.uploadFile(await prepareFileForUpload(file));
      // Single-file uploads adopt the form's title/alt/caption/date/link;
      // multi-file batches leave those blank since they're meant per-image
      // and have nowhere sensible to land across many files.
      var itemTitle = files.length === 1 ? title : '';
      if (!itemTitle) itemTitle = filenameToTitle(file.name);
      var itemAlt = files.length === 1 ? altText : '';
      var itemCaption = files.length === 1 ? caption : '';
      var itemDate = files.length === 1 ? date : '';
      // Tags can land across the whole batch since they're orthogonal to
      // image-specific copy — useful for tagging "this whole drop is 2025".
      var itemTags = tags.slice();
      var itemLink = files.length === 1 ? linkUrl : '';
      await api.upsertDataRecord(
        SCOPES.items,
        'item_' + Date.now() + '_' + i,
        {
          collectionSlug: state.selectedSlug,
          imageUrl: uploadedUrl,
          title: itemTitle,
          altText: itemAlt,
          caption: itemCaption,
          date: itemDate,
          tags: itemTags,
          // Multi-file uploads are always image type — the dropzone only
          // accepts image/* and the upload pipeline can't ingest video.
          mediaType: 'image',
          videoPoster: '',
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
    notify(createdCount === 1 ? t('msg.imageAdded') : t('msg.imagesAdded', { n: createdCount }));
  } else {
    notify(t('msg.partialSuccess', { ok: createdCount, failed: failedCount }), 'error');
  }
}

async function deleteItem(key) {
  var record = state.items.find(function (r) { return r.key === key; });
  if (!record) return;

  try {
    // Soft-delete: move the record into the bin, then drop from items.
    // Order matters — write the bin entry first so a failure halfway
    // through can't lose the item silently.
    await api.upsertDataRecord(SCOPES.deletedItems, delKey(record.key), {
      originalKey: record.key,
      collectionSlug: record.value?.collectionSlug || state.selectedSlug,
      deletedAt: Date.now(),
      record: record.value,
    });
    await api.deleteDataRecord(SCOPES.items, key);
    if (state.editingItemKey === key) resetItemForm();
    await loadItems();
    await loadDeletedItems();
    notify(t('msg.imageDeleted'));
  } catch (err) {
    notify(err.message || t('msg.deleteFailed'), 'error');
  }
}

// ---- Recycle bin ----

async function loadDeletedItems() {
  if (!state.selectedSlug) {
    state.deletedItems = [];
    renderRecycleBin();
    return;
  }
  var all = await api.listDataScope(SCOPES.deletedItems);
  state.deletedItems = all.filter(function (r) {
    return r.value?.collectionSlug === state.selectedSlug;
  });
  state.deletedItems.sort(function (a, b) {
    return Number(b.value?.deletedAt || 0) - Number(a.value?.deletedAt || 0);
  });
  renderRecycleBin();
}

async function pruneExpiredDeletedItems() {
  var all;
  try {
    all = await api.listDataScope(SCOPES.deletedItems);
  } catch (_err) {
    return; // older backends without the scope — silently no-op
  }
  var cutoff = Date.now() - BIN_TTL_MS;
  var expired = all.filter(function (r) {
    return Number(r.value?.deletedAt || 0) < cutoff;
  });
  if (expired.length === 0) return;
  await Promise.all(expired.map(function (r) {
    return api.deleteDataRecord(SCOPES.deletedItems, r.key).catch(function () { /* tolerate */ });
  }));
}

function timeAgo(ms) {
  var diff = Math.max(0, Date.now() - ms);
  var sec = Math.floor(diff / 1000);
  if (sec < 60) return t('time.justNow');
  var min = Math.floor(sec / 60);
  if (min < 60) return t('time.minutes', { n: min });
  var hr = Math.floor(min / 60);
  if (hr < 24) return t('time.hours', { n: hr });
  var day = Math.floor(hr / 24);
  if (day < 30) return day === 1 ? t('time.day', { n: 1 }) : t('time.days', { n: day });
  return t('time.over30');
}

function renderRecycleBin() {
  if (!el.recycleBinSection) return;

  if (state.deletedItems.length === 0) {
    el.recycleBinSection.style.display = 'none';
    el.recycleBinList.innerHTML = '';
    return;
  }

  el.recycleBinSection.style.display = '';
  el.recycleBinList.innerHTML = '';

  state.deletedItems.forEach(function (record) {
    var rec = record.value?.record || {};
    var deletedAt = Number(record.value?.deletedAt || 0);
    var imageUrl = rec.imageUrl || '';
    var title = rec.title || '';
    var previewUrl = normalizePluginMediaUrl(imageUrl);

    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '14px';
    row.style.padding = '10px 12px';
    row.style.background = 'var(--surface)';
    row.style.border = '1px solid var(--hairline)';
    row.style.borderRadius = '12px';
    row.style.opacity = '0.85';

    var thumbInner = previewUrl
      ? '<div style="width:100%; height:100%; background-image:url(' + esc(previewUrl) + '); background-size:cover; background-position:center;"></div>'
      : '<div style="width:100%; height:100%; display:grid; place-items:center; color:var(--text-4);">' + ICON.image + '</div>';

    row.innerHTML =
      '<div style="width:48px; height:36px; flex-shrink:0; border-radius:6px; overflow:hidden; background:var(--bg-dim); border:1px solid var(--hairline);">' +
      thumbInner +
      '</div>' +
      '<div style="min-width:0; flex:1;">' +
      '<div style="font-family:var(--sans); font-size:13px; color:var(--text-2); font-style:' + (title ? 'normal' : 'italic') + '; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' +
      esc(title || t('placeholder.colTitle')) +
      '</div>' +
      '<div class="meta"><span>' + esc(t('meta.deleted.suffix')) + esc(timeAgo(deletedAt)) + '</span></div>' +
      '</div>' +
      '<div class="actions" style="opacity:1; gap:6px;">' +
      '<button class="act" data-action="restore" title="' + esc(t('aria.restore')) + '" aria-label="' + esc(t('aria.restore')) + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 10 9 10"/></svg>' +
      '</button>' +
      '<button class="act danger" data-action="purge" title="' + esc(t('aria.purge')) + '" aria-label="' + esc(t('aria.purge')) + '">' + ICON.trash + '</button>' +
      '</div>';

    row.querySelector('[data-action="restore"]').addEventListener('click', function () {
      void restoreItem(record);
    });
    row.querySelector('[data-action="purge"]').addEventListener('click', function () {
      openConfirm(
        t('confirm.purgeItem'),
        function () { void purgeDeletedItem(record.key); },
      );
    });

    el.recycleBinList.appendChild(row);
  });
}

async function restoreItem(deletedRecord) {
  var rec = deletedRecord.value?.record;
  var originalKey = deletedRecord.value?.originalKey;
  if (!rec || !originalKey) {
    notify(t('msg.restoreCorrupt'), 'error');
    return;
  }
  try {
    // Restore with a fresh sortOrder so it lands at the end (instead of
    // colliding with the existing items' ordering).
    var newRec = Object.assign({}, rec, { sortOrder: state.items.length });
    await api.upsertDataRecord(SCOPES.items, originalKey, newRec);
    await api.deleteDataRecord(SCOPES.deletedItems, deletedRecord.key);
    await loadItems();
    await loadDeletedItems();
    notify(t('msg.restored'));
  } catch (err) {
    notify(err.message || t('msg.restoreFailed'), 'error');
  }
}

async function purgeDeletedItem(key) {
  try {
    await api.deleteDataRecord(SCOPES.deletedItems, key);
    await loadDeletedItems();
    notify(t('msg.purged'));
  } catch (err) {
    notify(err.message || t('msg.purgeFailed'), 'error');
  }
}

async function emptyRecycleBin() {
  if (state.deletedItems.length === 0) return;
  try {
    await Promise.all(state.deletedItems.map(function (r) {
      return api.deleteDataRecord(SCOPES.deletedItems, r.key);
    }));
    await loadDeletedItems();
    notify(t('msg.binEmptied'));
  } catch (err) {
    notify(err.message || t('msg.emptyBinFailed'), 'error');
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
    notify(err.message || t('msg.reorderFailed'), 'error');
  }
}

// ---- Event listeners ----

el.createColBtn.addEventListener('click', function () { void createCollection(); });

if (el.collectionsSearch) {
  el.collectionsSearch.addEventListener('input', function () {
    state.collectionSearchTerm = el.collectionsSearch.value;
    renderCollectionsList();
  });
}

if (el.emptyBinBtn) {
  el.emptyBinBtn.addEventListener('click', function () {
    openConfirm(
      t('confirm.emptyBin'),
      function () { void emptyRecycleBin(); },
    );
  });
}
el.backBtn.addEventListener('click', closeEditor);
el.saveSettingsBtn.addEventListener('click', function () { void saveSettings(); });
el.addItemBtn.addEventListener('click', function () { void addOrUpdateItem(); });
el.resetItemBtn.addEventListener('click', resetItemForm);
el.editLayout.addEventListener('change', updateLayoutFields);

bindSwitch(el.editLightboxSwitch, scheduleRenderPreview);
bindSwitch(el.editShowTitleSwitch, function () {
  updateLayoutFields();
  scheduleRenderPreview();
});
bindSwitch(el.editSliderAutoplaySwitch, scheduleRenderPreview);
bindSwitch(el.editSliderDotsSwitch, scheduleRenderPreview);
bindSwitch(el.editSliderArrowsSwitch, scheduleRenderPreview);

// Every editable settings field also reruns the preview. Using a single
// listener on the editor view captures input/change without binding to
// each field individually.
['input', 'change'].forEach(function (evt) {
  if (!el.editorView) return;
  el.editorView.addEventListener(evt, function (e) {
    var target = e.target;
    if (!target) return;
    // Only re-render for fields under the settings form-section — items
    // and bin rows shouldn't trigger; they have their own paths via
    // loadItems / loadDeletedItems → scheduleRenderPreview.
    if (!target.closest('.form-section')) return;
    if (target.closest('#items-list') || target.closest('#recycle-bin-list')) return;
    // Skip the items-form fields too — they only affect a pending item,
    // not the rendered output.
    if (
      target.id === 'item-url' || target.id === 'item-title' || target.id === 'item-alt' ||
      target.id === 'item-caption' || target.id === 'item-date' || target.id === 'item-tags' ||
      target.id === 'item-link' || target.id === 'item-poster' || target.id === 'item-file'
    ) return;
    scheduleRenderPreview();
  });
});

// Layout switcher also re-renders (already wired for updateLayoutFields).
if (el.editLayout) {
  el.editLayout.addEventListener('change', scheduleRenderPreview);
}

if (el.previewViewport) {
  el.previewViewport.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-viewport]');
    if (!btn) return;
    setPreviewViewport(btn.getAttribute('data-viewport'));
  });
}
if (el.previewRefreshBtn) {
  el.previewRefreshBtn.addEventListener('click', function () { void renderPreview(); });
}

if (el.itemMediaType) {
  el.itemMediaType.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-media-type]');
    if (!btn) return;
    setItemMediaType(btn.getAttribute('data-media-type'));
  });
}

if (el.openLibraryBtn) {
  el.openLibraryBtn.addEventListener('click', function () { void openLibraryPicker(); });
}
if (el.libraryModalClose) el.libraryModalClose.addEventListener('click', closeLibraryPicker);
if (el.libraryModalCancel) el.libraryModalCancel.addEventListener('click', closeLibraryPicker);
if (el.libraryModalInsert) el.libraryModalInsert.addEventListener('click', function () { void insertFromLibrary(); });
if (el.libraryModal) {
  el.libraryModal.addEventListener('click', function (e) {
    if (e.target === el.libraryModal) closeLibraryPicker();
  });
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && el.libraryModal && el.libraryModal.style.display !== 'none') {
    closeLibraryPicker();
  }
});

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

async function loadPluginConfig() {
  try {
    var cfg = await api.getConfig();
    state.pluginConfig = Object.assign({}, state.pluginConfig, cfg || {});
    if (typeof state.pluginConfig.defaultLayout === 'string' && el.newColLayout) {
      var allowed = ['cards', 'grid', 'news'];
      if (allowed.indexOf(state.pluginConfig.defaultLayout) >= 0) {
        el.newColLayout.value = state.pluginConfig.defaultLayout;
      }
    }
  } catch (_err) {
    // Config endpoint unavailable — keep baked-in defaults.
  }
}

// ---- Init ----

(async function init() {
  try {
    applyI18n();
    updateLayoutFields();
    // Fire-and-forget — clean up expired bin entries on every load.
    void pruneExpiredDeletedItems();
    await loadPluginConfig();
    await loadCollections();
  } catch (err) {
    console.error(err);
    notify(err.message || t('msg.initFailed'), 'error');
  }
})();
