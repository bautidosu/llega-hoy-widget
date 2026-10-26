/* Llega Hoy - contadores manuales v2. Solo lectura; independiente del widget de entregas. */
(function () {
  'use strict';
  if (window.__lhSoldCountsV2) return;
  window.__lhSoldCountsV2 = true;
  const API = 'https://llega-hoy-widget.vercel.app/api/public/sold-counts';
  const steps = [10,25,50,100,250,500,1000,2500,5000,10000,25000,50000,100000];
  const format = n => new Intl.NumberFormat('es-AR').format(n);
  const floor = n => steps.filter(x => x <= n).pop() || 0;
  const css = document.createElement('style');
  css.textContent = '.lh-sold-count{display:block;font:400 11px/1.5 inherit;color:#777;margin:4px 0 5px}.lh-sold-count::before{content:"↗";margin-right:4px}';
  (document.head || document.documentElement).appendChild(css);
  let byId = new Map(), byHandle = new Map(), queued = false;
  const productCards = () => document.querySelectorAll('.js-product-container');
  function getData(card) {
    const info = card.querySelector('[data-store^="product-item-info-"]');
    const id = info?.getAttribute('data-store')?.match(/^product-item-info-(\d+)$/)?.[1];
    if (id && byId.has(id)) return byId.get(id);
    const link = card.querySelector('a[href*="/productos/"]');
    const handle = link?.getAttribute('href')?.split('/productos/')[1]?.split(/[/?#]/)[0];
    return handle ? byHandle.get(handle) : undefined;
  }
  function deliveryAnchor(card) {
    const label = [...card.querySelectorAll('.lh-grid-label')].find(el => /Llega hoy|Llega mañana/i.test(el.textContent || ''));
    if (!label) return null;
    // Find the badge wrapper without climbing out of the product card.
    let node = label;
    while (node.parentElement && node.parentElement !== card) {
      const parent = node.parentElement;
      if (parent.querySelectorAll('.lh-grid-label').length > 1) break;
      if (parent.children.length > 1 && parent.querySelector('[class*="lh-grid"]')) { node = parent; break; }
      node = parent;
      if (node.classList.contains('js-item-description')) break;
    }
    // If the wrapper search climbed to the description, choose the immediate child holding the label.
    if (node.classList.contains('js-item-description')) {
      node = label;
      while (node.parentElement && node.parentElement !== card && node.parentElement !== card.querySelector('.js-item-description')) node = node.parentElement;
    }
    return node;
  }
  function render() {
    for (const card of productCards()) {
      const count = getData(card);
      const old = card.querySelector('.lh-sold-count');
      if (!count || count < 10) { if (old) old.remove(); continue; }
      const anchor = deliveryAnchor(card);
      if (!anchor || !anchor.parentElement) continue;
      const value = '+' + format(floor(count)) + ' vendidos';
      if (old) { old.textContent = value; if (old.nextElementSibling !== anchor) anchor.before(old); continue; }
      const badge = document.createElement('div');
      badge.className = 'lh-sold-count';
      badge.textContent = value;
      anchor.before(badge);
    }
  }
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; render(); }); }
  fetch(API, {mode:'cors'}).then(r => { if (!r.ok) throw Error('HTTP '+r.status); return r.json(); }).then(data => {
    for (const p of data.products || []) {
      if (!Number.isSafeInteger(p.count) || p.count < 10) continue;
      byId.set(String(p.id), p.count);
      if (p.handle) byHandle.set(String(p.handle).replace(/^\/+|\/+$/g,''), p.count);
    }
    schedule();
    new MutationObserver(schedule).observe(document.body, {childList:true,subtree:true});
  }).catch(err => console.warn('[Llega Hoy vendidos]',err));
})();
