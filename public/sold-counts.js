
/* Llega Hoy - contadores manuales v4.
   Independiente del widget de entregas. */
(function () {
  'use strict';

  if (window.__lhSoldCountsV2) return;
  window.__lhSoldCountsV2 = true;

  const API = 'https://llega-hoy-widget.vercel.app/api/public/sold-counts';
  const format = n => new Intl.NumberFormat('es-AR').format(n);

  const byId = new Map();
  const byHandle = new Map();

  let observer;
  let queued = false;

  const style = document.createElement('style');
  style.textContent = `
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
  (document.head || document.documentElement).appendChild(style);

  function handleFrom(value) {
    if (!value) return '';

    try {
      const url = new URL(String(value), location.origin);
      const match = url.pathname.match(/\/productos\/([^/]+)/i);

      if (match) {
        return decodeURIComponent(match[1]).toLowerCase();
      }
    } catch (_) {}

    return String(value)
      .replace(/^\/+|\/+$/g, '')
      .toLowerCase();
  }

  function countFor(card) {
    const ids = [card.getAttribute('data-product-id')];

    const nested = card.querySelector(
      '[data-product-id], [data-store^="product-item-info-"]'
    );

    if (nested) {
      ids.push(nested.getAttribute('data-product-id'));

      const store = nested.getAttribute('data-store') || '';
      const match = store.match(/^product-item-info-(\d+)$/);

      if (match) ids.push(match[1]);
    }

    for (const id of ids) {
      if (id && byId.has(String(id))) {
        return byId.get(String(id));
      }
    }

    for (const link of card.querySelectorAll('a[href*="/productos/"]')) {
      const handle = handleFrom(link.getAttribute('href'));

      if (byHandle.has(handle)) {
        return byHandle.get(handle);
      }
    }

    return null;
  }

  function cards() {
    const all = document.querySelectorAll(
      '.js-item-product[data-product-id], .js-product-container'
    );

    return Array.from(all).filter(card =>
      !card.parentElement?.closest(
        '.js-item-product[data-product-id], .js-product-container'
      )
    );
  }

  function render() {
    if (observer) observer.disconnect();

    try {
      for (const card of cards()) {
        const count = countFor(card);
        const old = card.querySelector('.lh-sold-count');

        if (!Number.isSafeInteger(count) || count < 10) {
          if (old) old.remove();
          continue;
        }

        // Buscar el contenedor REAL del cartel de entrega.
        // No importa qué texto tenga.
        const delivery =
          card.querySelector('.lh-grid:has(.lh-grid-label)') ||
          card.querySelector('.lh-grid');

        // No borrar un contador válido si el cartel
        // todavía no terminó de cargar.
        if (!delivery || !delivery.parentElement) {
          continue;
        }

        const badge = old || document.createElement('div');

        if (!old) {
          badge.className = 'lh-sold-count';
        }

        const value = '+' + format(count) + ' vendidos';

        if (badge.textContent !== value) {
          badge.textContent = value;
        }

        // Posición única: inmediatamente arriba de .lh-grid
        if (
          badge.parentElement !== delivery.parentElement ||
          badge.nextElementSibling !== delivery
        ) {
          delivery.before(badge);
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

  async function start() {
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
            handleFrom(product.handle),
            count
          );
        }
      }

      observer = new MutationObserver(schedule);
      schedule();

    } catch (err) {
      console.warn('[Llega Hoy vendidos]', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {
      once: true
    });
  } else {
    start();
  }
})();
