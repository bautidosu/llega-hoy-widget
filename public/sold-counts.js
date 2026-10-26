
/* Llega Hoy - contadores manuales v3.1 */
(function () {
  'use strict';

  if (window.__lhSoldCountsV2) return;
  window.__lhSoldCountsV2 = true;

  const API = 'https://llega-hoy-widget.vercel.app/api/public/sold-counts';
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

    const text = String(value).trim();

    try {
      const url = new URL(text, location.origin);
      const match = url.pathname.match(/\/productos\/([^/?#]+)/i);
      if (match) return decodeURIComponent(match[1]).toLowerCase();
    } catch (_) {}

    return text.replace(/^\/+|\/+$/g, '').toLowerCase();
  }

  function getCount(card) {
    const elements = card.querySelectorAll(
      '[data-store^="product-item-info-"],' +
      '[data-store^="product-item-"]'
    );

    for (const element of elements) {
      const value = element.getAttribute('data-store') || '';
      const match = value.match(/product-item(?:-info)?-(\d+)/);

      if (match && byId.has(match[1])) {
        return byId.get(match[1]);
      }
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

  function getDeliveryAnchor(card) {
    const label = Array.from(
      card.querySelectorAll('.lh-grid-label')
    ).find(el =>
      /Llega hoy|Llega mañana/i.test(el.textContent || '')
    );

    if (!label) return null;

    const description = card.querySelector('.js-item-description');

    let anchor = label;

    // Subir únicamente por los contenedores del badge.
    while (anchor.parentElement) {
      const parent = anchor.parentElement;

      if (
        parent === card ||
        parent === description ||
        parent.classList.contains('js-item-description')
      ) {
        break;
      }

      const className =
        typeof parent.className === 'string'
          ? parent.className
          : '';

      const isBadgeWrapper =
        className.includes('lh-grid') ||
        parent.children.length === 1;

      if (!isBadgeWrapper) break;

      anchor = parent;
    }

    return anchor;
  }

  function render() {
    if (observer) observer.disconnect();

    try {
      const cards = document.querySelectorAll('.js-product-container');

      for (const card of cards) {
        const count = getCount(card);
        let badge = card.querySelector('.lh-sold-count');

        if (!Number.isSafeInteger(count) || count < 10) {
          if (badge) badge.remove();
          continue;
        }

        const value = '+' + format(count) + ' vendidos';

        // Única ubicación permitida: arriba del badge verde.
        const anchor = getDeliveryAnchor(card);

        if (!anchor || !anchor.parentElement) {
          // No colocar el contador en otra posición.
          // Se reintentará cuando aparezca el badge.
          if (badge) badge.remove();
          continue;
        }

        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'lh-sold-count';
        }

        if (badge.textContent !== value) {
          badge.textContent = value;
        }

        if (
          badge.parentElement !== anchor.parentElement ||
          badge.nextElementSibling !== anchor
        ) {
          anchor.before(badge);
        }
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

      for (const product of data.products || []) {
        const count = Number(product.count);

        if (!Number.isSafeInteger(count) || count < 10) {
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

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

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
