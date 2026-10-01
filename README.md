<div align="center">

# Pocket Present

**A whole talk in your pocket. Markdown in, one offline HTML file out.**

[![CI](https://github.com/Chanson4/pocket-present/actions/workflows/test.yml/badge.svg)](https://github.com/Chanson4/pocket-present/actions/workflows/test.yml)
![Dependencies: 0](https://img.shields.io/badge/dependencies-0-bb4b2f)
[![MIT](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

**[Make a presentation →](https://Chanson4.github.io/pocket-present/)**

[Download for offline use](https://github.com/Chanson4/pocket-present/releases/latest) · [Example talk](examples/quick-talk.md) · [中文说明](README.zh-CN.md)

![Pocket Present screenshot](docs/preview.png)

</div>

You have ten minutes before a meeting. Your notes are already Markdown. The room Wi-Fi is unreliable. Write your talk, pick a theme, download a single file. That's the workflow.

## What you get

- Live Markdown preview with slide navigation.
- Three restrained themes: **Midnight**, **Paper**, **Grove**.
- An exported HTML presentation with everything embedded.
- Arrow / Page keys, Home / End, fullscreen, a pauseable timer and blackout (`B`).
- Browser printing to PDF, one slide per page for concise slides.
- Private speaker notes visible in the editor and **excluded from shared HTML**.
- No account, server, build, CDN, analytics or runtime dependencies.

## Quick start

Open the [demo](https://Chanson4.github.io/pocket-present/), or download and unzip the release and open `index.html`. Click **Load example**. Edit. Choose a theme. Click **Download presentation**.

Open the resulting `presentation.html` in a current Chrome, Edge, Firefox or Safari. It runs directly from disk without a server or network connection. Send that one file to a colleague; they do not need Pocket Present installed.

## A deliberately tiny format

````markdown
# A useful idea

One sentence that makes it clear.

???
Private author notes. These never appear in the shared HTML.

---

## Make the case

- **One** concrete problem
- A *small* solution
- A reason to try it

---

## Show the thing

```javascript
console.log("Hello, audience.");
```

> Good tools leave room for your story.
````

`---` starts a slide outside fenced code. `???` starts notes until the next slide. Headings `#` through `###`, paragraphs, ordered/unordered flat lists, quotes, inline code, fenced code, bold, italic and HTTPS/HTTP/mailto links are supported.

This is a **Markdown subset**, not a CommonMark renderer. Raw HTML is escaped. Nested lists, tables, image embeds, diagrams, syntax highlighting and embedded video are intentionally outside the current scope. Inline formatting does not nest. Link labels stay plain text. Use the example to see the supported format.

## Present & share

| Control | Action |
| --- | --- |
| `→`, `↓`, Page Down, Space | Next slide |
| `←`, `↑`, Page Up | Previous slide |
| Home / End | First / last slide |
| `B` | Toggle blackout; click anywhere to clear it |
| Timer button | Start, pause or resume elapsed time |
| Fullscreen | Browser fullscreen, when supported |
| Print / PDF | Open the browser's print dialog |

For PDF, use **Landscape**, enable background graphics, and turn off browser headers/footers. Keep slides short: very long content can span more than one printed page. The presentation scrolls rather than hiding overflow.

Author notes are excluded from the exported HTML, including from hidden data. **Save Markdown** includes those notes so you can edit later; share the HTML when you want notes to stay private. Presenter notes in a second window are not yet supported.

## Local by default

Content is processed in your tab, not uploaded. It is not saved in browser storage. Use **Save Markdown** before closing the editor; there is a browser unsaved-content prompt where supported. Opening another Markdown file or loading the example replaces the current editor content. Imported Markdown files are limited to 512 KB. Your exported presentation contains the visible slide content, so treat it accordingly.

The hosted app downloads its own static files on first load. The release works offline from the start. Generated presentations have no external assets or network requests; an external slide link opens only when clicked.

## Develop

```sh
git clone https://github.com/Chanson4/pocket-present.git
cd pocket-present
node --test
```

Node 20+ is only needed for tests. Open `index.html` to develop. Tests cover slide boundaries, escaped HTML, unsafe link rejection, note exclusion and standalone runtime generation.

[CONTRIBUTING.md](CONTRIBUTING.md) · Next: a slide overview, better export filenames and a separate presenter view. If a one-file talk makes your day easier, a star helps others discover it.

MIT © Chanson4
