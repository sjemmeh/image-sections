# image-sections

A plugin for the dehaas-digital CMS that provides a `{{plugin:image-section collection="slug"}}` shortcode for rendering image collections in four layout modes.

## Layouts

- **Cards** — image + title + optional CTA button, configurable columns and per-collection background color
- **Grid** — image-only gallery, optional title with configurable position (above/below) and alignment (left/center/right)
- **News** — horizontally scrolling cards with title + CTA link, snap-scrolling, prev/next controls
- **Slider** — full-width hero with overlapping slides, caption overlay, dot pagination, optional autoplay, fade or slide transitions

## Features

- Lightbox support (all layout types) with keyboard navigation, focus trap, and `role="dialog"` semantics
- Multi-file upload with drag-and-drop in the admin
- **Pick from the main CMS image library** instead of re-uploading (WordPress-style)
- Raster images (PNG/JPEG/GIF) are auto-converted to WebP before upload
- Staggered entrance animation (`data-animate` + cycling `data-animate-delay`) on every item across all four layouts
- 30-day recycle bin for deleted items, with restore + auto-prune
- Drag-and-drop reordering in the admin
- "Used on N pages" indicator backed by the CMS shortcode-references endpoint
- Dutch + English admin UI driven by `document.documentElement.lang`
- `prefers-reduced-motion` respected (no autoplay, no hover-zoom)
- Per-collection settings:
  - Layout, columns (2/3/4)
  - Lightbox on/off
  - Title position (above/below) and alignment (left/center/right)
  - Show/hide title (grid layout)
  - Button text (cards / news / slider)
  - Background color (sanitized — only `#hex` and a small keyword allowlist)
  - Slider: autoplay, interval, transition (fade / slide), height, caption position (7 anchors), show dots, show arrows
- Per-item fields:
  - Title, alt text, caption, date, tags, link URL
- Public CSS + JS assets served automatically via `registerHeadSnippet`
- Admin UI built against the De Haas design system (matches the main admin shell exactly)

## Usage

1. Install and enable the plugin via the admin panel.
2. Open the **Image Sections** admin page and create a collection.
3. Configure layout + settings, then add images (drag-and-drop, multi-select, by external URL, or from the CMS library).
4. Embed the shortcode in any page content:

```
{{plugin:image-section collection="your-slug"}}
```

The plugin renders nothing (HTML comment only) if the collection is empty or the slug doesn't resolve.

## Shortcode parameters

| Parameter    | Required | Description                                                                                                  |
|--------------|----------|--------------------------------------------------------------------------------------------------------------|
| `collection` | yes      | The collection slug created in the admin.                                                                    |
| `layout`     | no       | Override the collection's stored layout for this embed only. One of `cards` / `grid` / `news` / `slider`.    |
| `limit`      | no       | Render at most N items (clamped to 1–200). Items are taken in the collection's manual sort order.            |
| `offset`     | no       | Skip the first N items before applying `limit`. Useful for "more like this" sections on detail pages.        |
| `tag`        | no       | Filter items by a single tag (case-insensitive, exact match). Items without any tags are excluded.           |

Examples:

```
{{plugin:image-section collection="projects"}}                           ← collection's own layout
{{plugin:image-section collection="projects" layout="slider"}}           ← same items, hero slider
{{plugin:image-section collection="news" limit="3"}}                     ← latest 3 news items
{{plugin:image-section collection="news" limit="3" offset="3"}}          ← next 3 news items
{{plugin:image-section collection="press" tag="2025"}}                   ← only items tagged "2025"
```

All visual settings (columns, lightbox, slider autoplay, …) live on the collection itself unless overridden by a shortcode parameter — change the layout or columns once in the admin and every embed without an override updates.
