
/*
 * Llega Hoy - Contadores manuales v3
 * Independiente del widget de entregas.
 * Cantidades exactas, sin emojis.
 */
(function () {
  'use strict';

  if (window.__lhSoldCountsV2) return;
  window.__lhSoldCountsV2 = true;

  const API =
    'https://llega-hoy-widget.vercel.app/api/public/sold-counts';

  const MIN_COUNT = 10;
  const format = n => new Intl.NumberFormat('es-AR').format(n);

  const css = document.createElement('style');

  css.textContent = `
    .lh-sold-count {
      display: block;
      font-size: 11px;
      line-height: 1.5;
      font-weight: 400;
      color: #777;
      margin: 4px 0 5px;
    }
    .lh-sold-count::before {
      content: none !important;
    }
  `;

  (document.head || document.documentElement).appendChild(css);

  const byId = new Map();
  const byHandle = new Map();

  let queued = false;
  let observer = null;

  function normalizeHandle(value) {
    if (!value) return '';

    let text = String(value).trim();

    try {
      const url = new URL(text, location.origin);
      const match = url.pathname.match(/\/productos\/([^/?#]+)/i);

      if (match) text = match[1];
    } catch (_) {}

    return decodeURIComponent(text)
      .replace(/^\/+|\/+$/g, '')
      .split(/[?#]/)[0]
      .toLowerCase();
  }

  function getProductId(card) {
    const selectors = [
      '[data-store^="product-item-info-"]',
      '[data-store^="product-item-"]'
    ];

    for (const selector of selectors) {
      const element = card.querySelector(selector);
      const value = element?.getAttribute('data-store') || '';
      const match = value.match(/product-item(?:-info)?-(\d+)/);

      if (match) return match[1];
    }

    const cardStore = card.getAttribute('data-store') || '';
    const cardMatch = cardStore.match(/product-item(?:-info)?-(\d+)/);

    if (cardMatch) return cardMatch[1];

    return null;
  }

  function getCount(card) {
    const id = getProductId(card);

    if (id && byId.has(id)) {
      return byId.get(id);
    }

    const links = card.querySelectorAll('a[href*="/productos/"]');

    for (const link of links) {
      const handle = normalizeHandle(link.getAttribute('href'));

      if (byHandle.has(handle)) {
        return byHandle.get(handle);
      }
    }

    return null;
  }

  function deliveryAnchor(card) {
    const label = Array.from(
      card.querySelectorAll('.lh-grid-label')
    ).find(el =>
      /Llega hoy|Llega mañana/i.test(el.textContent || '')
    );

    if (!label) return null;

    let node = label;

    while (node.parentElement && node.parentElement !== card) {
      const parent = node.parentElement;

      if (parent.querySelectorAll('.lh-grid-label').length > 1) {
        break;
      }

      if (
        parent.children.length > 1 &&
        parent.querySelector('[class*="lh-grid"]')
      ) {
        node = parent;
        break;
      }

      node = parent;

      if (node.classList.contains('js-item-description')) {
        break;
      }
    }

    if (node.classList.contains('js-item-description')) {
      node = label;

      const description = card.querySelector('.js-item-description');

      while (
        node.parentElement &&
        node.parentElement !== card &&
        node.parentElement !== description
      ) {
        node = node.parentElement;
      }
    }

    return node;
  }

  function fallbackAnchor(card) {
    const description = card.querySelector('.js-item-description');

    if (!description) return null;

    const price = description.querySelector(
      '.js-price-display, .js-price-container, [data-store*="price"]'
    );

    if (price) {
      return { element: price, position: 'after' };
    }

    return { element: description, position: 'append' };
  }

  function placeBadge(card, badge) {
    const delivery = deliveryAnchor(card);

    if (delivery && delivery.parentElement) {
      if (badge.nextElementSibling !== delivery) {
        delivery.before(badge);
      }

      return;
    }

    const fallback = fallbackAnchor(card);

    if (!fallback) return;

    if (fallback.position === 'after') {
      if (badge.previousElementSibling !== fallback.element) {
        fallback.element.after(badge);
      }
    } else if (badge.parentElement !== fallback.element) {
      fallback.element.appendChild(badge);
    }
  }

  function render() {
    if (observer) observer.disconnect();

    try {
      const cards = document.querySelectorAll('.js-product-container');

      for (const card of cards) {
        const count = getCount(card);
        let badge = card.querySelector('.lh-sold-count');

        if (!Number.isSafeInteger(count) || count < MIN_COUNT) {
          if (badge) badge.remove();
          continue;
        }

        const text = '+' + format(count) + ' vendidos';

        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'lh-sold-count';
        }

        if (badge.textContent !== text) {
          badge.textContent = text;
        }

        placeBadge(card, badge);
      }
    } finally {
      if (observer && document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }
  }

  function schedule() {
    if (queued) return;

    queued = true;

    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  }

  async function loadCounts() {
    try {
      const response = await fetch(API, {
        mode: 'cors',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();

      byId.clear();
      byHandle.clear();

      for (const product of data.products || []) {
        const count = Number(product.count);

        if (!Number.isSafeInteger(count) || count < MIN_COUNT) {
          continue;
        }

        if (product.id != null) {
          byId.set(String(product.id), count);
        }

        if (product.handle) {
          byHandle.set(
            normalizeHandle(product.handle),
            count
          );
        }
      }

      observer = new MutationObserver(schedule);

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }

      schedule();

    } catch (error) {
      console.warn('[Llega Hoy vendidos]', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCounts, {
      once: true
    });
  } else {
    loadCounts();
  }
})();
