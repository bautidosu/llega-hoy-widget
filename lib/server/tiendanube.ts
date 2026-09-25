import {createCipheriv, randomBytes} from 'node:crypto';

const tokenEndpoint='https://www.tiendanube.com/apps/authorize/token';

function supabase(){
  const url=process.env.SUPABASE_URL?.replace(/\/+$/,'');
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!url||!key||url.endsWith('/rest/v1'))throw Error('SUPABASE_URL inválida');
  return {url,key};
}
function headers(key:string){return {apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`}), 'Content-Type':'application/json'};}
function encryptionKey(){
  const raw=process.env.TN_TOKEN_ENCRYPTION_KEY||'';
  const key=Buffer.from(raw,'base64');
  if(key.length!==32)throw Error('TN_TOKEN_ENCRYPTION_KEY debe ser una clave de 32 bytes en base64');
  return key;
}
function encryptToken(token:string){
  const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',encryptionKey(),iv);
  const encrypted=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);
  return [iv.toString('base64'),cipher.getAuthTag().toString('base64'),encrypted.toString('base64')].join('.');
}
export async function exchangeCode(code:string){
  const clientId=process.env.TN_CLIENT_ID,clientSecret=process.env.TN_CLIENT_SECRET;
  if(!clientId||!clientSecret)throw Error('Faltan credenciales de Tiendanube');
  const response=await fetch(tokenEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId,client_secret:clientSecret,grant_type:'authorization_code',code}),cache:'no-store'});
  if(!response.ok)throw Error(`Tiendanube rechazó el código (HTTP ${response.status})`);
  const data:unknown=await response.json();
  if(!data||typeof data!=='object')throw Error('Respuesta inválida de Tiendanube');
  const result=data as Record<string,unknown>;
  const id=String(result.user_id??'');
  if(!/^\d{1,20}$/.test(id)||typeof result.access_token!=='string'||result.access_token.length<10)throw Error('Respuesta de Tiendanube sin tienda o token válido');
  return {storeId:id,accessToken:result.access_token};
}
export async function saveInstallation(storeId:string,token:string){
  const {url,key}=supabase();
  const payload={store_id:storeId,app_id:String(process.env.TN_CLIENT_ID||''),access_token_encrypted:encryptToken(token),installed_at:new Date().toISOString()};
  const res=await fetch(`${url}/rest/v1/tn_installations?on_conflict=store_id`,{method:'POST',headers:{...headers(key),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(payload),cache:'no-store'});
  if(!res.ok){console.error('Supabase installations HTTP',res.status);throw Error('No se pudo registrar la instalación en Supabase')}
}
export async function copyInitialSettings(storeId:string){
  // Solo la primera instalación de la tienda, desde el registro de prueba existente.
  const source=process.env.LH_STORE_ID||'llama-maestra-test';
  if(source===storeId)return;
  const {url,key}=supabase();
  const get=async(id:string)=>{const r=await fetch(`${url}/rest/v1/store_settings?store_id=eq.${encodeURIComponent(id)}&select=*`,{headers:headers(key),cache:'no-store'});if(!r.ok)throw Error('Error al leer configuración');return await r.json() as Record<string,unknown>[]};
  if((await get(storeId)).length)return;
  const original=(await get(source))[0];if(!original)return;
  const {id,created_at,updated_at,...settings}=original;
  const r=await fetch(`${url}/rest/v1/store_settings?on_conflict=store_id`,{method:'POST',headers:{...headers(key),Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({...settings,store_id:storeId,enabled:false}),cache:'no-store'});
  if(!r.ok)throw Error('No se pudo copiar la configuración inicial');
}
export async function getInstallations(){
  const {url,key}=supabase();
  const res=await fetch(`${url}/rest/v1/tn_installations?select=store_id,installed_at&order=installed_at.desc&limit=5`,{headers:headers(key),cache:'no-store'});
  if(!res.ok)throw Error('No se pudo consultar instalaciones');
  return await res.json() as {store_id:string;installed_at:string}[];
}
