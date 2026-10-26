// Temporary administrator allowlist for the two owned stores.
// Before onboarding unrelated merchants, replace this with per-store authenticated sessions.
export const managedStores = [
  {id:'2484130',name:'Llama Maestra'},
  {id:'6397596',name:'Lumiel'},
] as const;
export function allowedStoreId(value:string|null):string|null {
  return value && managedStores.some(s=>s.id===value) ? value : null;
}
