/* Llega Hoy v0.2 standalone preview. Manual embed only; NOT a Tiendanube marketplace integration. */
(function () {
  'use strict';
  if (window.__llegaHoyMounted) return;
  const cfg = Object.assign({cutoff:'12:00',days:[1,2,3,4,5,6],badge:'SOLO CABA Y GBA',bg:'#F7FFFB',accent:'#09934F',badgeBg:'#191919',urgent:'#D92332',threshold:60,critical:10,free:false,blockedDates:''}, window.LLEGA_HOY_CONFIG || {});
  const target = document.querySelector('[data-llega-hoy]');
  if (!target) { console.warn('Llega Hoy: agregá un elemento con data-llega-hoy'); return; }
  window.__llegaHoyMounted = true;
  const style = document.createElement('style');
  style.textContent = '.lhw-wrap{position:relative;padding-top:12px;margin:14px 0;font-family:Arial,Helvetica,sans-serif}.lhw-badge{position:absolute;top:0;left:14px;z-index:1;padding:4px 9px;border-radius:5px;color:white;font-size:10px;font-weight:800}.lhw-card{display:flex;gap:13px;align-items:center;border:1px solid #BFE8D6;border-radius:11px;min-height:76px;padding:17px 14px 12px}.lhw-copy{flex:1;min-width:0}.lhw-title{display:block;font-size:17px;font-weight:800;color:#17212b}.lhw-sub{display:block;font-size:13px;color:#3c444a;margin-top:3px}.lhw-timer{font-weight:800;font-variant-numeric:tabular-nums}.lhw-arrow{font-size:24px;color:#87939B}.lhw-truck{font-size:25px;line-height:1}.lhw-note{font-size:11px;color:#64748b;margin:4px 2px 0}@media(max-width:500px){.lhw-card{gap:10px;padding-left:11px}.lhw-title{font-size:15px}.lhw-sub{font-size:12px}}';
  document.head.appendChild(style);
  const root=document.createElement('div');root.className='lhw-wrap';
  const badge=document.createElement('span');badge.className='lhw-badge';badge.textContent=cfg.badge;badge.style.backgroundColor=cfg.badgeBg;
  const card=document.createElement('div');card.className='lhw-card';
  const truck=document.createElement('span');truck.className='lhw-truck';truck.textContent='🚚';truck.setAttribute('aria-hidden','true');
  const copy=document.createElement('div');copy.className='lhw-copy';
  const title=document.createElement('strong');title.className='lhw-title';
  const sub=document.createElement('span');sub.className='lhw-sub';
  const arrow=document.createElement('span');arrow.className='lhw-arrow';arrow.textContent='›';arrow.setAttribute('aria-hidden','true');
  copy.append(title,sub);card.append(truck,copy,arrow);root.append(badge,card);target.append(root);
  const pad=n=>String(n).padStart(2,'0');
  const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const blocked=Array.isArray(cfg.blockedDates)?cfg.blockedDates:String(cfg.blockedDates||'').split(',').map(x=>x.trim());
  const allowed=d=>cfg.days.includes(d.getDay())&&!blocked.includes(dateKey(d));
  function tick(){
    const now=new Date(); const parts=/^([01]\d|2[0-3]):[0-5]\d$/.exec(cfg.cutoff);
    if(!parts||!Array.isArray(cfg.days)||!cfg.days.length){title.textContent='Consultá disponibilidad';sub.textContent='Revisá las condiciones de entrega.';return;}
    const cutoff=new Date(now);const [h,m]=cfg.cutoff.split(':').map(Number);cutoff.setHours(h,m,0,0);
    let today=allowed(now)&&now<cutoff;
    if(today){const sec=Math.max(0,Math.ceil((cutoff-now)/1000));const urgent=sec<=cfg.threshold*60;const color=urgent?cfg.urgent:cfg.accent;
      title.textContent=cfg.free?'Llega gratis hoy':'Llega hoy';sub.textContent='Comprando dentro de los próximos ';
      const timer=document.createElement('b');timer.className='lhw-timer';timer.style.color=color;timer.textContent=sec>=3600?`${Math.floor(sec/3600)}h ${pad(Math.floor(sec%3600/60))}m`:`${pad(Math.floor(sec/60))}:${pad(sec%60)}`;sub.append(timer);
      card.style.background=urgent?'#FFF8F8':cfg.bg;card.style.borderColor=urgent?'#FFC8CE':'#BFE8D6';truck.style.filter='none';return;
    }
    let next=null;let distance=0;for(let i=1;i<=31;i++){const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()+i);if(allowed(d)){next=d;distance=i;break;}}
    title.textContent=distance===1?'Llega mañana':next?'Próxima entrega: '+new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'short'}).format(next):'Consultá disponibilidad';
    sub.textContent=distance===1?'Comprando ahora, tu pedido llega mañana.':next?'Comprando ahora, tu pedido llega el próximo día habilitado.':'No hay días de entrega configurados.';
    card.style.background='#FAFAFC';card.style.borderColor='#E1E4E8';truck.style.filter='grayscale(1)';
  }
  tick();const timerId=setInterval(tick,1000);
  window.addEventListener('pagehide',()=>clearInterval(timerId),{once:true});
})();
