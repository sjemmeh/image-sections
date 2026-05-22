# image-sections

A plugin for the dehaas-digital CMS that provides a `{{plugin:image-section collection="slug"}}` shortcode for rendering image collections in three layout modes.

## Layouts

- **Cards** — image + title + optional CTA button, configurable columns and per-collection background color
- **Grid** — image-only gallery, optional title with configurable position (above/below) and alignment (left/center/right)
- **News** — horizontally scrolling cards with title + CTA link, snap-scrolling, prev/next controls

## Features

- Lightbox support (all layout types) with keyboard navigation
- Multi-file upload with drag-and-drop in the admin
- Raster images (PNG/JPEG/GIF) are auto-converted to WebP before upload
- Staggered entrance animation (`data-animate` + cycling `data-animate-delay`) on every item across all three layouts — picked up by the host theme's animation system
- Per-collection settings:
  - Layout, columns (2/3/4)
  - Lightbox on/off
  - Title position (above/below) and alignment (left/center/right)
  - Show/hide title (grid layout)
  - Button text (cards + news layouts)
  - Background color (sanitized — only `#hex` and a small keyword allowlist)
- Public CSS + JS assets served automatically via `registerHeadSnippet`
- Admin UI built against the De Haas design system (matches the main admin shell exactly)

## Usage

1. Install and enable the plugin via the admin panel.
2. Open the **Image Sections** admin page and create a collection.
3. Configure layout + settings, then add images (drag-and-drop, multi-select, or by external URL).
4. Embed the shortcode in any page content:

```
{{plugin:image-section collection="your-slug"}}
```

The plugin renders nothing (HTML comment only) if the collection is empty or the slug doesn't resolve.

## Shortcode parameters

| Parameter   | Required | Description                              |
|-------------|----------|------------------------------------------|
| `collection`| yes      | The collection slug created in the admin |

All visual settings live on the collection itself, not the shortcode — change the layout or columns once in the admin and every page using the shortcode updates.
