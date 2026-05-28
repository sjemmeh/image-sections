'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const plugin = require('../server.js');
const {
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
} = plugin.__test;

test('escapeHtml escapes HTML metacharacters', () => {
  assert.equal(escapeHtml('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
  assert.equal(escapeHtml("'"), '&#39;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
});

test('normalizePluginMediaUrl rewrites /api/admin/plugins/ to /api/plugins/', () => {
  assert.equal(
    normalizePluginMediaUrl('/api/admin/plugins/image-sections/uploads/x.webp'),
    '/api/plugins/image-sections/uploads/x.webp',
  );
});

test('normalizePluginMediaUrl strips legacy doubled plugins/<name>/ segment', () => {
  assert.equal(
    normalizePluginMediaUrl('/api/plugins/image-sections/uploads/plugins/image-sections/foo.webp'),
    '/api/plugins/image-sections/uploads/foo.webp',
  );
});

test('normalizePluginMediaUrl leaves unrelated URLs alone', () => {
  assert.equal(normalizePluginMediaUrl('/images/foo.webp'), '/images/foo.webp');
  assert.equal(normalizePluginMediaUrl(''), '');
  assert.equal(normalizePluginMediaUrl(null), '');
});

test('buildThumbUrl routes main-CMS images through path-based sharp', () => {
  assert.equal(buildThumbUrl('/images/hero.webp'), '/images/800/0/hero.webp');
});

test('buildThumbUrl appends ?w=800 to plugin uploads', () => {
  assert.equal(buildThumbUrl('/api/plugins/x/uploads/a.webp'), '/api/plugins/x/uploads/a.webp?w=800');
});

test('buildThumbUrl uses & when URL already has a query string', () => {
  assert.equal(buildThumbUrl('/api/plugins/x/uploads/a.webp?cb=1'), '/api/plugins/x/uploads/a.webp?cb=1&w=800');
});

test('buildThumbUrl returns SVG and ICO as-is', () => {
  assert.equal(buildThumbUrl('/images/logo.svg'), '/images/logo.svg');
  assert.equal(buildThumbUrl('/static/fav.ico'), '/static/fav.ico');
  assert.equal(buildThumbUrl('/images/logo.svg?cb=1'), '/images/logo.svg?cb=1');
});

test('buildFullUrl routes main-CMS images to 0/0 (no resize)', () => {
  assert.equal(buildFullUrl('/images/hero.webp'), '/images/0/0/hero.webp');
});

test('buildFullUrl returns plugin uploads as-is (already original)', () => {
  assert.equal(buildFullUrl('/api/plugins/x/uploads/a.webp'), '/api/plugins/x/uploads/a.webp');
  assert.equal(buildFullUrl(''), '');
});

test('cmsImageFilename strips an existing <W>/<H>/ prefix', () => {
  assert.equal(cmsImageFilename('/images/hero.webp'), 'hero.webp');
  assert.equal(cmsImageFilename('/images/0/0/hero.webp'), 'hero.webp');
  assert.equal(cmsImageFilename('/images/800/0/hero.webp'), 'hero.webp');
  // Path-like filenames with directories survive — only the dim prefix is stripped.
  assert.equal(cmsImageFilename('/images/0/0/subdir/hero.webp'), 'subdir/hero.webp');
});

test('buildThumbUrl/buildFullUrl handle already-sharded input without doubling the prefix', () => {
  // Regression: the backend now returns originalUrl as /images/0/0/<filename>,
  // so the builders must strip that prefix before prepending their own.
  assert.equal(buildThumbUrl('/images/0/0/hero.webp'), '/images/800/0/hero.webp');
  assert.equal(buildFullUrl('/images/0/0/hero.webp'), '/images/0/0/hero.webp');
  assert.equal(buildFullUrl('/images/800/0/hero.webp'), '/images/0/0/hero.webp');
});

test('sortByOrder sorts by sortOrder ascending, breaks ties alphabetically', () => {
  const a = { value: { sortOrder: 1, title: 'B' } };
  const b = { value: { sortOrder: 1, title: 'A' } };
  const c = { value: { sortOrder: 0, title: 'C' } };
  const sorted = [a, b, c].sort(sortByOrder);
  assert.deepEqual(sorted.map((r) => r.value.title), ['C', 'A', 'B']);
});

test('animateAttr cycles delays in groups of 3', () => {
  assert.equal(animateAttr(0), ' data-animate');
  assert.equal(animateAttr(1), ' data-animate data-animate-delay="100"');
  assert.equal(animateAttr(2), ' data-animate data-animate-delay="200"');
  assert.equal(animateAttr(3), ' data-animate');
  assert.equal(animateAttr(7), ' data-animate data-animate-delay="100"');
});

test('coerceEmbedUrl accepts YouTube watch URLs', () => {
  assert.equal(
    coerceEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  );
});

test('coerceEmbedUrl accepts youtu.be short URLs', () => {
  assert.equal(
    coerceEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  );
});

test('coerceEmbedUrl accepts existing /embed/ URLs', () => {
  assert.equal(
    coerceEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  );
});

test('coerceEmbedUrl accepts Vimeo numeric URLs', () => {
  assert.equal(
    coerceEmbedUrl('https://vimeo.com/76979871'),
    'https://player.vimeo.com/video/76979871',
  );
});

test('coerceEmbedUrl accepts existing player.vimeo.com embeds', () => {
  assert.equal(
    coerceEmbedUrl('https://player.vimeo.com/video/76979871'),
    'https://player.vimeo.com/video/76979871',
  );
});

test('coerceEmbedUrl rejects anything else', () => {
  assert.equal(coerceEmbedUrl('https://example.com/evil'), '');
  assert.equal(coerceEmbedUrl('javascript:alert(1)'), '');
  assert.equal(coerceEmbedUrl(''), '');
  assert.equal(coerceEmbedUrl(null), '');
  // YouTube-looking host but no usable id
  assert.equal(coerceEmbedUrl('https://www.youtube.com/'), '');
  // Vimeo non-numeric path
  assert.equal(coerceEmbedUrl('https://vimeo.com/channels/staffpicks'), '');
  // Garbage that doesn't parse as a URL
  assert.equal(coerceEmbedUrl('not a url'), '');
});

test('buildSrcsetAttrs emits 3 widths for main-CMS path-based URLs', () => {
  const attr = buildSrcsetAttrs('/images/hero.webp');
  assert.match(attr, /^ srcset="/);
  assert.match(attr, /\/images\/400\/0\/hero\.webp 400w/);
  assert.match(attr, /\/images\/800\/0\/hero\.webp 800w/);
  assert.match(attr, /\/images\/1600\/0\/hero\.webp 1600w/);
});

test('buildSrcsetAttrs emits ?w= variants for plugin uploads', () => {
  const attr = buildSrcsetAttrs('/api/plugins/x/uploads/a.webp');
  assert.match(attr, /\?w=400 400w/);
  assert.match(attr, /\?w=800 800w/);
  assert.match(attr, /\?w=1600 1600w/);
});

test('buildSrcsetAttrs strips existing w= so it does not double-up', () => {
  const attr = buildSrcsetAttrs('/api/plugins/x/uploads/a.webp?cb=1&w=800');
  assert.match(attr, /\?cb=1&w=400 400w/);
  assert.doesNotMatch(attr, /w=800.*w=400/); // no double w=
});

test('buildSrcsetAttrs returns empty for SVG, ICO, and missing URLs', () => {
  assert.equal(buildSrcsetAttrs('/images/logo.svg'), '');
  assert.equal(buildSrcsetAttrs('/static/fav.ico'), '');
  assert.equal(buildSrcsetAttrs(''), '');
  assert.equal(buildSrcsetAttrs(null), '');
});

test('buildLqipUrl returns a 24-wide variant of the source URL', () => {
  assert.equal(buildLqipUrl('/images/hero.webp'), '/images/24/0/hero.webp');
  assert.equal(buildLqipUrl('/api/plugins/x/uploads/a.webp'), '/api/plugins/x/uploads/a.webp?w=24');
});

test('buildLqipUrl returns empty for SVG and ICO', () => {
  assert.equal(buildLqipUrl('/images/logo.svg'), '');
  assert.equal(buildLqipUrl('/static/fav.ico'), '');
  assert.equal(buildLqipUrl(''), '');
});

test('resolveAlt prefers explicit altText over title', () => {
  assert.equal(resolveAlt({ value: { altText: 'A blue door', title: 'Project X' } }), 'A blue door');
});

test('resolveAlt falls back to title when altText is empty/whitespace', () => {
  assert.equal(resolveAlt({ value: { altText: '', title: 'Project X' } }), 'Project X');
  assert.equal(resolveAlt({ value: { altText: '   ', title: 'Project X' } }), 'Project X');
  assert.equal(resolveAlt({ value: { title: 'Project X' } }), 'Project X');
});

test('resolveAlt returns empty when both are absent', () => {
  assert.equal(resolveAlt({ value: {} }), '');
  assert.equal(resolveAlt({}), '');
});

test('formatItemDate formats valid ISO strings via toLocaleDateString', () => {
  // We can't pin a locale across host environments, so just assert the
  // result is non-empty and the year shows up somewhere.
  const out = formatItemDate('2025-01-15');
  assert.ok(out.length > 0);
  assert.match(out, /2025/);
});

test('formatItemDate returns empty for falsy or invalid input', () => {
  assert.equal(formatItemDate(''), '');
  assert.equal(formatItemDate(null), '');
  assert.equal(formatItemDate('not a date'), '');
});

test('sanitizeCssColor accepts hex and a small keyword allowlist', () => {
  assert.equal(sanitizeCssColor('#fff'), '#fff');
  assert.equal(sanitizeCssColor('#abcdef'), '#abcdef');
  assert.equal(sanitizeCssColor('#abcdef12'), '#abcdef12');
  assert.equal(sanitizeCssColor('transparent'), 'transparent');
  assert.equal(sanitizeCssColor('  transparent  '), 'transparent');
});

test('sanitizeCssColor rejects anything that could leak CSS', () => {
  assert.equal(sanitizeCssColor('red'), '');
  assert.equal(sanitizeCssColor('url(x)'), '');
  assert.equal(sanitizeCssColor('rgb(255,0,0)'), '');
  assert.equal(sanitizeCssColor('#xyz'), '');
  assert.equal(sanitizeCssColor(''), '');
  assert.equal(sanitizeCssColor(null), '');
});

test('sanitizeSliderHeight accepts CSS length units', () => {
  assert.equal(sanitizeSliderHeight('60vh'), '60vh');
  assert.equal(sanitizeSliderHeight('100vw'), '100vw');
  assert.equal(sanitizeSliderHeight('400px'), '400px');
  assert.equal(sanitizeSliderHeight('32rem'), '32rem');
  assert.equal(sanitizeSliderHeight('50%'), '50%');
  assert.equal(sanitizeSliderHeight('auto'), 'auto');
});

test('sanitizeSliderHeight falls back to 60vh for invalid input', () => {
  assert.equal(sanitizeSliderHeight(''), '60vh');
  assert.equal(sanitizeSliderHeight(null), '60vh');
  assert.equal(sanitizeSliderHeight('calc(100vh - 60px)'), '60vh');
  assert.equal(sanitizeSliderHeight('url(x)'), '60vh');
  assert.equal(sanitizeSliderHeight('100xx'), '60vh');
});

test('sliderTransition is whitelisted', () => {
  assert.equal(sliderTransition('fade'), 'fade');
  assert.equal(sliderTransition('slide'), 'slide');
  assert.equal(sliderTransition('SLIDE'), 'slide');
  assert.equal(sliderTransition('zoom'), 'fade');  // unknown → fallback
  assert.equal(sliderTransition(''), 'fade');
  assert.equal(sliderTransition(null), 'fade');
});

test('sliderCaptionPos is whitelisted', () => {
  const allowed = ['center', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'];
  for (const pos of allowed) {
    assert.equal(sliderCaptionPos(pos), pos);
  }
  assert.equal(sliderCaptionPos(''), 'bottom-left');
  assert.equal(sliderCaptionPos('nowhere'), 'bottom-left');
});

test('eagerCountFor picks sensible defaults per layout', () => {
  assert.equal(eagerCountFor('slider'), 1);
  assert.equal(eagerCountFor('news'), 3);
  assert.equal(eagerCountFor('grid', 3), 3);
  assert.equal(eagerCountFor('cards', 4), 4);
  // Clamp: 6-col grid still caps to 4 eager loads
  assert.equal(eagerCountFor('grid', 6), 4);
  // Falsy columns falls back to the default of 3 (0 || 3 === 3).
  assert.equal(eagerCountFor('cards', 0), 3);
  assert.equal(eagerCountFor('cards'), 3);
  // Unknown layout returns 1.
  assert.equal(eagerCountFor('weirdo'), 1);
});

test('lightboxEligible only matches image items', () => {
  assert.equal(lightboxEligible({ value: { mediaType: 'image' } }), true);
  assert.equal(lightboxEligible({ value: {} }), true);              // default
  assert.equal(lightboxEligible({}), true);
  assert.equal(lightboxEligible({ value: { mediaType: 'video' } }), false);
  assert.equal(lightboxEligible({ value: { mediaType: 'embed' } }), false);
});

// ---------- Shortcode handler integration ----------

function makeContext(items, collections) {
  return {
    pluginName: 'image-sections',
    getDataScopeRecords: async (scope) => {
      if (scope === 'collections') return collections;
      if (scope === 'items') return items;
      return [];
    },
  };
}

const sampleCollections = [
  { key: 'col_demo', value: { slug: 'demo', name: 'Demo', layout: 'cards', columns: 3 } },
  { key: 'col_grid', value: { slug: 'grid', name: 'Grid', layout: 'grid', columns: 3 } },
];

const sampleItems = [
  { key: 'i1', value: { collectionSlug: 'demo', imageUrl: '/images/a.webp', title: 'A', sortOrder: 0, tags: ['featured'] } },
  { key: 'i2', value: { collectionSlug: 'demo', imageUrl: '/images/b.webp', title: 'B', sortOrder: 1, tags: ['archive', '2024'] } },
  { key: 'i3', value: { collectionSlug: 'demo', imageUrl: '/images/c.webp', title: 'C', sortOrder: 2, tags: ['featured', '2025'] } },
  { key: 'i4', value: { collectionSlug: 'other', imageUrl: '/images/x.webp', title: 'X', sortOrder: 0 } },
];

function getHandler() {
  const [shortcode] = plugin.registerShortcodes(null, { pluginName: 'image-sections' });
  return shortcode.handler;
}

test('shortcode handler returns comment when collection param missing', async () => {
  const handler = getHandler();
  const out = await handler({}, null, makeContext(sampleItems, sampleCollections));
  assert.match(out, /missing collection parameter/);
});

test('shortcode handler returns comment when collection not found', async () => {
  const handler = getHandler();
  const out = await handler({ collection: 'ghost' }, null, makeContext(sampleItems, sampleCollections));
  assert.match(out, /collection "ghost" not found/);
});

test('shortcode handler returns comment when collection has no items', async () => {
  const handler = getHandler();
  const collections = [{ key: 'col_empty', value: { slug: 'empty', layout: 'cards' } }];
  const out = await handler({ collection: 'empty' }, null, makeContext([], collections));
  assert.match(out, /has no items/);
});

test('shortcode handler renders cards layout by default', async () => {
  const handler = getHandler();
  const out = await handler({ collection: 'demo' }, null, makeContext(sampleItems, sampleCollections));
  assert.match(out, /is-layout-cards/);
  assert.match(out, /Title-A|>A</);  // item title surfaces somewhere
});

test('shortcode handler honours layout= override', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', layout: 'slider' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  assert.match(out, /is-layout-slider/);
  assert.doesNotMatch(out, /is-layout-cards/);
});

test('shortcode handler ignores unknown layout= value', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', layout: 'nonsense' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  // Falls back to the collection's stored layout (cards).
  assert.match(out, /is-layout-cards/);
});

test('shortcode handler honours limit= (clamped 1-200)', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', limit: '2' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  // Each card opens with `<div class="is-card"` or `<div class="is-card `
  // (with the --has-btn modifier). The descendant elements all start with
  // is-card-*, so we anchor on the boundary character after "is-card".
  const items = (out.match(/<div class="is-card[ "]/g) || []).length;
  assert.equal(items, 2);
});

test('shortcode handler honours offset=', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', offset: '1' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  // Should skip the first item.
  assert.doesNotMatch(out, />A</);
  assert.match(out, />B</);
  assert.match(out, />C</);
});

test('shortcode handler honours tag= filter', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', tag: 'featured' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  // A and C are tagged featured; B is not.
  assert.match(out, />A</);
  assert.doesNotMatch(out, />B</);
  assert.match(out, />C</);
});

test('shortcode handler tag filter is case-insensitive', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', tag: 'FEATURED' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  assert.match(out, />A</);
  assert.match(out, />C</);
});

test('shortcode handler chains tag → offset → limit in that order', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', tag: 'featured', offset: '1', limit: '1' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  // After tag=featured: [A, C]. offset 1 -> [C]. limit 1 -> [C].
  assert.doesNotMatch(out, />A</);
  assert.match(out, />C</);
});

test('shortcode handler returns comment when filters leave zero items', async () => {
  const handler = getHandler();
  const out = await handler(
    { collection: 'demo', tag: 'nonexistent' },
    null,
    makeContext(sampleItems, sampleCollections),
  );
  assert.match(out, /has no items/);
});

test('shortcode handler accepts comma-string tags on items', async () => {
  const handler = getHandler();
  const itemsWithStringTags = [
    { key: 'i1', value: { collectionSlug: 'demo', imageUrl: '/images/a.webp', title: 'A', sortOrder: 0, tags: 'featured, 2025' } },
    { key: 'i2', value: { collectionSlug: 'demo', imageUrl: '/images/b.webp', title: 'B', sortOrder: 1, tags: 'archive' } },
  ];
  const out = await handler(
    { collection: 'demo', tag: '2025' },
    null,
    makeContext(itemsWithStringTags, sampleCollections),
  );
  assert.match(out, />A</);
  assert.doesNotMatch(out, />B</);
});
