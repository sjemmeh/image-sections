# image-sections

A plugin for the dehaas-digital CMS that provides a `{{plugin:image-section collection="slug"}}` shortcode for rendering image collections in two layout modes.

## Layouts

- **Cards** — image + title + optional CTA button, configurable columns
- **Grid** — image-only gallery, optional title with configurable position/alignment

## Features

- Lightbox support (all layout types)
- Multiple images upload with drag-and-drop
- Per-collection settings: columns, lightbox, title position (above/below), title alignment (left/center/right)
- Public CSS + JS assets served automatically

## Usage

1. Install and enable the plugin via the admin panel.
2. Create a collection in the **Image Sections** admin page.
3. Add images to the collection.
4. Embed the shortcode in any page content:

```
{{plugin:image-section collection="your-slug"}}
```
