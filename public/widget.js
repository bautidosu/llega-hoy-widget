/* Llega Hoy v0.4 — storefront script. Load with data-api="https://YOUR-VERCEL-DOMAIN/api/widget-config". */
(function(){
  'use strict';
  if(window.__llegaHoyV04)return;
  window.__llegaHoyV04=true;
  const script=document.currentScript;
  const api=script?.getAttribute('data-api') || (script?.src ? new URL('/api/widget-config',script.src).href : '');
  const TZ='America/Argentina/Buenos_Aires';
  const pad=n=>String(n).padStart(2,'0');
  const dateParts=d=>{
    const x=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
    const date=`${x.year}-${pad(x.month)}-${pad(x.day)}`;
    const day=new Date(Date.UTC(x.year,x.month-1,x.day)).getUTCDay();
    return {...x,date,day};
  };
  const dateAfter=(key,offset)=>{const [y,m,d]=key.split('-').map(Number);const date=new Date(Date.UTC(y,m-1,d+offset));return {key:date.toISOString().slice(0,10),day:date.getUTCDay(),date};};
  const formatNext=date=>new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(date);
  const css=`.lh4{position:relative;padding-top:13px;margin:14px 0 16px;font-family:inherit;box-sizing:border-box;max-width:100%}.lh4 *{box-sizing:border-box}.lh4-badge{position:absolute;top:0;left:16px;z-index:2;padding:5px 10px;border-radius:5px;font:700 10px/1.2 Arial,sans-serif;letter-spacing:.02em;color:white}.lh4-card{display:flex;align-items:center;gap:14px;border:1px solid #bfe8d6;border-radius:12px;min-height:82px;padding:18px 15px 13px;background:#f7fffb}.lh4-icon{width:33px;height:33px;flex-shrink:0}.lh4-copy{flex:1;min-width:0}.lh4-title{display:block;font-weight:800;font-size:17px;line-height:1.3;color:#151b20}.lh4-sub{display:block;font-size:13px;line-height:1.5;margin-top:2px;color:#343b42}.lh4-clock{font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}.lh4-arrow{flex-shrink:0;border-left:1px solid #e2e7e5;padding-left:13px;color:#87939b;font-size:26px;line-height:1}.lh4-terms{font-size:11px;color:#66717c;margin:5px 2px 0}.lh4[hidden]{display:none!important}@media(max-width:480px){.lh4-card{gap:10px;padding:16px 11px 12px;min-height:72px}.lh4-icon{width:29px;height:29px}.lh4-title{font-size:15px}.lh4-sub{font-size:12px}.lh4-arrow{padding-left:9px}}`;
  const truck='<svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h17v16H2M19 13h6l5 6v5H19M2 13h-2M4 18H1M5 5H2"/><circle cx="8" cy="25" r="3" fill="white"/><circle cx="25" cy="25" r="3" fill="white"/></svg>';
  const isProduct=()=>!!document.querySelector('#product_form, form[action*="add_to_cart"], [data-store^="product-info-"], .js-product-detail, .product-detail');
  function locate(){
    const explicit=document.querySelector('[data-llega-hoy]');if(explicit)return explicit;
    if(!isProduct())return null;
    const anchor=document.querySelector('#product_form, form[action*="add_to_cart"], .js-add-to-cart, [data-store^="add-to-cart-"], .js-price-container, [data-store^="product-price-"], .product-price');
    if(!anchor||!anchor.parentElement)return null;
    const slot=document.createElement('div');slot.setAttribute('data-llega-hoy','auto');anchor.parentElement.insertBefore(slot,anchor);return slot;
  }
  async function boot(){
    if(!api)return;
    let cfg;try{const r=await fetch(api,{mode:'cors',cache:'no-store'});if(!r.ok)return;cfg=await r.json()}catch(e){console.warn('Llega Hoy: configuración no disponible',e);return}
    if(!cfg.enabled)return;
    let target=locate();if(!target){console.warn('Llega Hoy: no se encontró ubicación de producto');return}
    if(target.querySelector('.lh4'))return;
    if(!document.getElementById('lh4-css')){const style=document.createElement('style');style.id='lh4-css';style.textContent=css;document.head.appendChild(style)}
    const root=document.createElement('div');root.className='lh4';
    const badge=document.createElement('span');badge.className='lh4-badge';badge.textContent=cfg.badge||'SOLO CABA Y GBA';badge.style.background=cfg.badgeBg||'#191919';
    const card=document.createElement('div');card.className='lh4-card';const icon=document.createElement('div');icon.className='lh4-icon';icon.innerHTML=truck;
    const copy=document.createElement('div');copy.className='lh4-copy';const title=document.createElement('strong');title.className='lh4-title';const sub=document.createElement('span');sub.className='lh4-sub';copy.append(title,sub);
    const arrow=document.createElement('span');arrow.className='lh4-arrow';arrow.textContent='›';arrow.setAttribute('aria-hidden','true');card.append(icon,copy,arrow);root.append(badge,card);
    const terms=document.createElement('div');terms.className='lh4-terms';terms.textContent='Solo zonas habilitadas de CABA y GBA. Consultá cobertura y condiciones.';root.append(terms);target.append(root);
    const blocked=new Set(String(cfg.blockedDates||'').split(',').map(x=>x.trim()).filter(Boolean));
    const allowed=(day,key)=>Array.isArray(cfg.days)&&cfg.days.includes(day)&&!blocked.has(key);
    function render(){
      const now=new Date();const p=dateParts(now);const [h,m]=String(cfg.cutoff||'12:00').split(':').map(Number);
      if(!Number.isInteger(h)||!Number.isInteger(m)||!Array.isArray(cfg.days)||!cfg.days.length){root.hidden=true;return}
      root.hidden=false;
      const currentSec=p.hour*3600+p.minute*60+p.second;const cutoffSec=h*3600+m*60;
      const today=allowed(p.day,p.date)&&currentSec<cutoffSec;
      if(today){
        // Wall-clock difference in the store's configured timezone, never the visitor's timezone.
        const seconds=cutoffSec-currentSec;const urgent=seconds<=Number(cfg.threshold||60)*60;
        const color=urgent?(cfg.urgent||'#D92332'):(cfg.accent||'#09934F');
        const timer=seconds>=3600?`${Math.floor(seconds/3600)}h ${pad(Math.floor((seconds%3600)/60))}m`:`${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`;
        title.textContent=cfg.free?'Llega gratis hoy':'Llega hoy';sub.textContent='Comprando dentro de los próximos ';
        const clock=document.createElement('b');clock.className='lh4-clock';clock.textContent=timer;clock.style.color=color;sub.append(clock);
        card.style.background=cfg.bg||'#F7FFFB';card.style.borderColor=urgent?(cfg.urgent||'#D92332'):(cfg.accent||'#09934F');icon.style.color=cfg.accent||'#09934F';arrow.style.color=cfg.accent||'#09934F';
        return;
      }
      let next=null;
      for(let i=1;i<=366;i++){const candidate=dateAfter(p.date,i);if(allowed(candidate.day,candidate.key)){next={...candidate,distance:i};break}}
      if(!next){root.hidden=true;return}
      const tomorrow=next.distance===1;
      title.textContent=tomorrow?'Llega mañana':`Llega el ${formatNext(next.date)}`;
      sub.textContent=tomorrow?'Comprando ahora, tu pedido llega mañana.':`Comprando ahora, tu pedido llega el ${formatNext(next.date)}.`;
      card.style.background=cfg.bg||'#F7FFFB';card.style.borderColor=cfg.accent||'#09934F';icon.style.color=cfg.accent||'#09934F';arrow.style.color=cfg.accent||'#09934F';
    }
    render();const id=setInterval(render,1000);window.addEventListener('pagehide',()=>clearInterval(id),{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
