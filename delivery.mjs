/** Business logic independent of browser. Weekdays: 0=Sunday through 6=Saturday. */
export function nextDelivery(now, config) {
  const { cutoff='12:00', days=[1,2,3,4,5,6], blockedDates=[] }=config;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(cutoff)) throw new Error('Invalid cutoff');
  if (!Array.isArray(days) || !days.length) return {status:'unavailable', date:null, seconds:0};
  const [h,m]=cutoff.split(':').map(Number);
  const isAllowed=d=>days.includes(d.getDay())&&!blockedDates.includes(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  const deadline=new Date(now); deadline.setHours(h,m,0,0);
  if (isAllowed(now) && now<deadline) return {status:'today',date:new Date(now),seconds:Math.max(0,Math.ceil((deadline-now)/1000))};
  for(let i=1;i<=31;i++){
    const candidate=new Date(now); candidate.setHours(12,0,0,0); candidate.setDate(candidate.getDate()+i);
    if(isAllowed(candidate)) return {status:i===1?'tomorrow':'later',date:candidate,seconds:0};
  }
  return {status:'unavailable',date:null,seconds:0};
}
export function countdown(seconds){
  const s=Math.max(0,Math.floor(seconds));
  const pad=n=>String(n).padStart(2,'0');
  return s>=3600?`${Math.floor(s/3600)}h ${pad(Math.floor(s%3600/60))}m`:`${pad(Math.floor(s/60))}:${pad(s%60)}`;
}
export function deliveryLabel(result){
  if(result.status==='today')return 'Llega hoy';
  if(result.status==='tomorrow')return 'Llega mañana';
  if(result.status==='later'&&result.date)return `Llega el ${new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'short'}).format(result.date)}`;
  return 'Consultá disponibilidad';
}
