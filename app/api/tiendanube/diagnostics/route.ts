import {NextResponse} from 'next/server';
import {createDecipheriv} from 'node:crypto';
import {isAdmin} from '../../../../lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: {'Cache-Control': 'no-store'},
});
// Read-only. Never returns tokens, Supabase rows, query params or upstream errors.
export async function GET() {
  if (!await isAdmin()) return reply({error: 'Iniciá sesión en el administrador.'}, 401);
  const storeId = process.env.LH_STORE_ID || '';
  const appId = process.env.TN_CLIENT_ID || '';
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!/^\d+$/.test(storeId) || !/^\d+$/.test(appId) || !url || !key) {
    return reply({error: 'Falta configuración del servidor.'}, 503);
  }
  try {
    const response = await fetch(`${url}/rest/v1/tn_installations?store_id=eq.${storeId}&app_id=eq.${appId}&select=access_token_encrypted&limit=1`, {
      headers: {apikey: key, ...(key.startsWith('sb_secret_') ? {} : {Authorization: `Bearer ${key}`})},
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return reply({stage: 'installation_database', http: response.status}, 502);
    const rows = await response.json();
    if (!rows[0]?.access_token_encrypted) return reply({stage: 'installation_missing', storeId, appId}, 404);
    const parts = String(rows[0].access_token_encrypted).split('.');
    const encryptionKey = Buffer.from(process.env.TN_TOKEN_ENCRYPTION_KEY || '', 'base64');
    if (parts.length !== 3 || encryptionKey.length !== 32) throw new Error('Invalid encrypted record');
    const [iv, tag, data] = parts.map(value => Buffer.from(value, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(tag);
    const token = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    const result = await fetch(`https://api.tiendanube.com/2025-03/${storeId}/scripts/10610`, {
      headers: {Authorization: `Bearer ${token}`, 'User-Agent': 'Llega Hoy (https://llega-hoy-widget.vercel.app)', 'Content-Type': 'application/json'},
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    if (!result.ok) return reply({stage: 'tiendanube_script', storeId, appId, scriptId: 10610, http: result.status}, 502);
    const script = await result.json();
    let publicPath: string | null = null;
    try {
      const src = new URL(script.current_version?.src);
      if (src.protocol === 'https:' && src.hostname === 'apps-scripts.tiendanube.com') publicPath = src.origin + src.pathname;
    } catch { /* no current version */ }
    return reply({storeId, appId, scriptId: script.id, name: script.name, status: script.status,
      autoInstalled: script.is_auto_install, location: script.location, event: script.event,
      activeVersion: script.current_version?.version ?? null, publicPath,
      note: 'La API confirma metadatos. Verificar por separado ejecución y visibilidad en el producto.'});
  } catch {
    return reply({stage: 'diagnostic_failed', error: 'No se pudo completar la consulta. Revisar conectividad y clave de cifrado sin compartir secretos.'}, 502);
  }
}
