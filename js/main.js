// Keep variables inside this function so they do not become page-wide globals.
(() => {
  'use strict';

  // Connect the shared header button after the deferred script can read the HTML.
  function initializeTheme() {
    const themeButton = document.querySelector('.theme-toggle');
    if (!themeButton) return;

    // Read the class set by the early head script and describe the next action.
    function updateThemeButton() {
      const isDark = document.documentElement.classList.contains('dark-theme');
      themeButton.setAttribute('aria-pressed', String(isDark));
      if (isDark) {
        themeButton.setAttribute('aria-label', 'Switch to light mode');
      } else {
        themeButton.setAttribute('aria-label', 'Switch to dark mode');
      }
    }

    // A click adds or removes the class; CSS variables update the whole page.
    themeButton.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark-theme');
      updateThemeButton();

      // Store only the theme name so refreshes and other pages remember it.
      try {
        localStorage.setItem('tastekitchen-theme', isDark ? 'dark' : 'light');
      } catch (error) {
        // Private settings may block storage. Switching still works on this page.
      }
    });

    // Back and Forward can reuse an old page instead of loading it again.
    // Read the latest saved choice when the browser restores one of those pages.
    window.addEventListener('pageshow', (event) => {
      if (!event.persisted) return;
      try {
        const savedTheme = localStorage.getItem('tastekitchen-theme');
        document.documentElement.classList.toggle('dark-theme', savedTheme === 'dark');
      } catch (error) {
        // Keep this page's working theme when storage cannot be read.
      }
      updateThemeButton();
    });

    updateThemeButton();
    // Avoid showing a button that cannot work when JavaScript is disabled.
    themeButton.hidden = false;
  }

  // Set up menu search only on the page that contains the menu controls.
  function initializeMenu() {
    // querySelector finds one element; stop safely if this is another page.
    const controls = document.querySelector('.menu-controls');
    const categoryLinks = document.querySelector('.menu-nav');
    if (!controls || !categoryLinks) return;

    // Keep references to the controls so each update does not find them again.
    const searchInput = controls.querySelector('#menu-search');
    const clearButton = controls.querySelector('.clear-search');
    const filters = controls.querySelector('.menu-filters');
    const filterButtons = controls.querySelectorAll('[data-category]');
    const status = controls.querySelector('.menu-status');
    const emptyState = document.querySelector('.menu-empty');
    // querySelectorAll finds every section. Cache lowercase names and descriptions.
    const categories = Array.from(document.querySelectorAll('.menu-category'), (section) => ({
      section,
      items: Array.from(section.querySelectorAll('.menu-item'), (element) => ({
        element,
        text: `${element.querySelector('h3')?.textContent ?? ''} ${element.querySelector('p')?.textContent ?? ''}`.toLowerCase()
      }))
    }));
    let selectedCategory = 'all';

    // Run the same filtering steps after a search edit or a category click.
    function updateMenu() {
      const searchTerm = searchInput.value.trim().toLowerCase();
      let resultCount = 0;

      categories.forEach(({ section, items }) => {
        let categoryCount = 0;
        items.forEach(({ element, text }) => {
          // Both conditions must match. An empty search matches every dish.
          const matches = (selectedCategory === 'all' || selectedCategory === section.id)
            && text.includes(searchTerm);
          // hidden removes unmatched dishes from view and keyboard navigation.
          element.hidden = !matches;
          if (matches) categoryCount += 1;
        });
        section.hidden = categoryCount === 0;
        resultCount += categoryCount;
      });

      // Keep the visible selected style and screen-reader button state in sync.
      filterButtons.forEach((button) => {
        const active = button.dataset.category === selectedCategory;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      // Announce the count politely without moving the visitor's keyboard focus.
      clearButton.disabled = searchInput.value.length === 0;
      emptyState.hidden = resultCount !== 0;
      const categoryName = Array.from(filterButtons)
        .find((button) => button.dataset.category === selectedCategory).textContent;
      status.textContent = `${resultCount} ${resultCount === 1 ? 'dish' : 'dishes'} found in ${categoryName}${searchTerm ? ` for “${searchInput.value.trim()}”` : ''}.`;
    }

    // The input event runs whenever typing or the browser's clear control edits search.
    searchInput.addEventListener('input', updateMenu);
    // Clear only the search; keep the visitor's chosen category.
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      updateMenu();
    });
    // One listener handles all category buttons by finding the clicked button.
    filters.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-category]');
      if (!button || !filters.contains(button)) return;
      selectedCategory = button.dataset.category;
      updateMenu();
    });

    // Reveal working controls only after setup; keep jump links as the fallback.
    updateMenu();
    categoryLinks.hidden = true;
    controls.hidden = false;
  }

  // Turn ordinary gallery thumbnails into accessible modal-opening buttons.
  function initializeGallery() {
    const gallery = document.querySelector('.gallery-page-grid');
    const dialog = document.querySelector('.gallery-lightbox');
    // Leave the ordinary gallery intact in browsers without native modal support.
    if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

    // Find the viewer parts once and keep the selected index inside this function.
    const image = dialog.querySelector('.lightbox-image');
    const caption = dialog.querySelector('#lightbox-caption');
    const position = dialog.querySelector('.lightbox-position');
    const closeButton = dialog.querySelector('.lightbox-close');
    const figures = Array.from(gallery.querySelectorAll('figure'));
    const triggers = [];
    let currentIndex = 0;
    let triggeringControl = null;

    // Update the image and caption. The remainder calculation wraps either end.
    function showImage(index) {
      currentIndex = (index + figures.length) % figures.length;
      const figure = figures[currentIndex];
      const thumbnail = figure.querySelector('img');
      image.src = thumbnail.currentSrc || thumbnail.src;
      image.alt = thumbnail.alt;
      caption.textContent = figure.querySelector('figcaption')?.textContent ?? thumbnail.alt;
      position.textContent = `Image ${currentIndex + 1} of ${figures.length}`;
    }

    // Remember the starting button so closing the viewer can return focus to it.
    function openLightbox(index) {
      triggeringControl = triggers[index];
      showImage(index);
      dialog.showModal();
      document.documentElement.classList.add('lightbox-open');
      closeButton.focus();
    }

    // Add real buttons only when modal support exists; keep the original images.
    figures.forEach((figure, index) => {
      const thumbnail = figure.querySelector('img');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-trigger';
      button.setAttribute('aria-label', `Enlarge image: ${thumbnail.alt}`);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', dialog.id);
      thumbnail.before(button);
      button.append(thumbnail);
      triggers.push(button);
    });

    // One listener finds which thumbnail button was clicked and opens its image.
    gallery.addEventListener('click', (event) => {
      const button = event.target.closest('.gallery-trigger');
      const index = triggers.indexOf(button);
      if (index !== -1) openLightbox(index);
    });
    // Visible buttons work with mouse, touch, Enter and Space.
    closeButton.addEventListener('click', () => dialog.close());
    dialog.querySelector('.lightbox-previous').addEventListener('click', () => showImage(currentIndex - 1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
    // Arrow keys navigate only inside the viewer and do not scroll the page.
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showImage(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    // Escape uses the dialog's built-in cancel behavior and also reaches this cleanup.
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('lightbox-open');
      triggeringControl?.focus({ preventScroll: true });
    });
  }

  // Each initializer checks its own elements, so this file is safe on all pages.
  initializeTheme();
  initializeMenu();
  initializeGallery();
})();
