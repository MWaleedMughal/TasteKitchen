# TasteKitchen 🍽️

A **modern, elegant Pakistani restaurant demo website** built with **HTML5, CSS3 and vanilla JavaScript (ES6+)**. No build tools, frameworks, dependencies or package installation are required.

## Preview locally

Open `index.html` in your browser, or from the project folder run:

```bash
python -m http.server 5500
```

Then visit http://localhost:5500.

## Pages

- `index.html` — Homepage (header, split hero, story, signature dishes, why choose us, gallery preview, sample reviews, visit CTA, footer)
- `menu.html` — Pakistani menu categories and sample prices
- `about.html` — Fictional restaurant story
- `gallery.html` — Generated food and restaurant photography
- `contact.html` — Contact layout with nonfunctional demonstration form

## Files

- `css/style.css` — Shared responsive styles and color variables
- `js/main.js` - Deferred theme, menu and gallery enhancements
- `assets/images/` — 12 individually named AI-generated demo images

## Design

Colors: `#251A15` dark cocoa, `#B77946` copper, `#FAF6EF` cream, `#FFFFFF` white, `#76695F` muted taupe. Headings use Playfair Display and body text uses Poppins (Google Fonts with local fallbacks).

## Important

TasteKitchen is a **fictional portfolio project**. Restaurant imagery is AI-generated. Prices, reviews, opening hours and restaurant descriptions are sample content. The contact form is disabled and does not send messages. There is no booking system or real contact information.

## GitHub workflow

After cloning the repository, copy these files into its root and run:

```bash
git add .
git commit -m "feat: add TasteKitchen website and generated images"
git push origin main
```

## Interactive features

The menu has a case-insensitive search across dish names and descriptions, seven category buttons, a clear-search button, an active category indicator, a live result count and an empty state. Search and category must both match. Clearing search keeps the chosen category.

The gallery opens existing images in a native modal dialog. Use Previous/Next or Left/Right arrows (wrapping at either end), Close or Escape. Focus returns to the image button when closed. The modal prevents background scrolling, and its image keeps its natural aspect ratio.

JavaScript is loaded with `defer` on all five pages. A modern browser with ES6+ and native `dialog.showModal()` support is needed for all enhancements. Without JavaScript, the complete menu and original category links stay available and every gallery image remains visible. Browsers without modal support keep the plain gallery. The contact form is unchanged.

## How the JavaScript works

- `initializeMenu()` finds the menu elements, caches searchable dish text and attaches three listeners. It reveals the controls only after setup and hides the original jump links.
- `updateMenu()` reads the search and selected category, hides nonmatching dishes and empty sections, updates pressed button states and announces the result count.
- `initializeGallery()` checks native dialog support, wraps thumbnails in real buttons and attaches gallery/modal listeners.
- `showImage(index)` sets the full image, alternative text, caption and position. The modulo calculation wraps navigation from the last image to the first and back.
- `openLightbox(index)` remembers the triggering button, selects the image, opens the modal, locks scrolling and focuses Close.
- Small event callbacks clear the search, select categories, move images and close the dialog. The close callback unlocks scrolling and restores focus. Escape is handled by the browser's native dialog behavior.

`querySelector()` finds one element; `querySelectorAll()` finds a collection:

```js
const controls = document.querySelector('.menu-controls');
const filterButtons = controls.querySelectorAll('[data-category]');
searchInput.addEventListener('input', updateMenu);
```

The input listener runs after each edit. Click listeners handle category selection, clearing and image buttons. A keydown listener handles Left/Right inside the modal. Event delegation lets one listener handle all category buttons and another handle all gallery thumbnails.

Both conditions must pass for a dish to be shown:

```js
const matches = (selectedCategory === 'all' || selectedCategory === section.id)
  && text.includes(searchTerm);
element.hidden = !matches;
```

For example, search for `chicken` and choose BBQ Specials to see only matching BBQ dishes. Text is lowercased on both sides, so capitalization does not matter. The native `hidden` attribute also removes filtered content from keyboard navigation and the accessibility tree.

HTML additions are a labeled search input, real filter/clear buttons, live status, an empty state, deferred scripts and a labeled dialog with image, caption and navigation. Thumbnail buttons are created only when the viewer is supported. Gallery paths use the existing PNG assets in this working tree.

CSS additions extend the existing palette with responsive controls, active button styling, an empty-state panel, a dark modal backdrop, scroll locking and a contained image. The existing visible focus outlines and reduced-motion rules continue to apply. A shared hidden rule ensures existing flex/grid styles cannot reveal filtered content.

## Verification

Checked in Chrome at 375px, 768px and 1440px: every category, mixed-case name search, description search, whitespace trimming, combined filters, empty results, clearing search, image loading, Previous/Next and arrow-key wraparound, Tab navigation, Escape, restored focus, scroll locking and horizontal overflow. Reviewed responsive screenshots. No JavaScript console errors or runtime exceptions were observed. Also checked both pages with JavaScript disabled and safely initialized the script on the other three pages. JavaScript syntax and Git whitespace checks passed.

## Light and dark themes

Every header has a keyboard-accessible moon/sun button. First-time visitors get the original light design. Clicking switches the theme immediately and updates the accessible label and pressed state. The button is hidden without JavaScript, and all pages keep the default light theme.

CSS variables are reusable color names. For example, `color: var(--text)` uses the value of `--text`. The `:root` values keep the existing white page, cream sections and copper accents. The `:root.dark-theme` values use warm dark backgrounds, cream text and a lighter copper accent. Layout rules are shared by both themes.

`initializeTheme()` finds the header button and adds a click listener. The click calls `document.documentElement.classList.toggle('dark-theme')`: this adds the class if it is absent and removes it if it exists. CSS then uses the matching set of variables. `updateThemeButton()` changes the accessible label and `aria-pressed` value to match.

`localStorage` is the browser's small persistent key/value store for this website. We save only `tastekitchen-theme` as `light` or `dark` with `setItem()`. Each page has a short head script that reads the value with `getItem()` and applies the dark class before the stylesheet loads. This early script avoids a noticeable light flash; the deferred script would run too late to guarantee that. Both storage operations use `try/catch` so blocked storage does not break the website. If storage is unavailable, switching works until navigation or refresh.

Use the local HTTP server above when testing navigation: pages on the same origin share storage. Browser behavior for storage on directly opened `file://` pages can differ. Clearing site data resets the saved preference. There is no automatic operating-system theme selection.

All five HTML pages include the shared button, early restore and deferred script. `css/style.css` contains semantic color variables, both palettes and responsive toggle styles. `js/main.js` handles the theme alongside the existing menu and gallery. Beginner comments explain the HTML sections, CSS layouts and JavaScript behavior. Images, page content and the disabled contact form are preserved.

## Theme verification

Checked all five pages in headless Chrome at 375px, 768px and 1440px in both themes. Verified toggle labels and pressed states, localStorage persistence, refresh, navigation, early restoration before stylesheet load, keyboard activation, visible focus, blocked storage, invalid saved values, default light mode without JavaScript and no horizontal overflow. Existing menu filtering and gallery navigation passed in both themes. Back navigation and restored-page synchronization also passed. Compared the original headings, paragraphs, prices, image paths and section IDs with a pre-edit snapshot. Reviewed responsive screenshots after images decoded and transitions finished. No JavaScript console errors or runtime exceptions were observed. External font downloads were blocked during automated checks, which used the existing font fallbacks; the Google Fonts links are unchanged.

The pageshow listener in initializeTheme() refreshes the saved choice when Back or Forward restores an old page from browser memory. It also updates the button so its label matches the restored theme.
