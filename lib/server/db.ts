/**
 * Llega Hoy v0.3 — acceso a Supabase exclusivamente desde el servidor.
 * Compatible con claves sb_secret_ y service_role heredadas.
 */
const storeId = () => process.env.LH_STORE_ID || 'llama-maestra-test';

export type Settings = {
  cutoff: string;
  days: number[];
  badge: string;
  bg: string;
  accent: string;
  badgeBg: string;
  urgent: string;
  threshold: number;
  critical: number;
  free: boolean;
  blockedDates: string;
  enabled: boolean;
};

export const defaults: Settings = {
  cutoff: '12:00',
  days: [1, 2, 3, 4, 5, 6],
  badge: 'SOLO CABA Y GBA',
  bg: '#F7FFFB',
  accent: '#09934F',
  badgeBg: '#191919',
  urgent: '#D92332',
  threshold: 60,
  critical: 10,
  free: false,
  blockedDates: '',
  enabled: false,
};

function credentials() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en Vercel');
  if (!/^https:\/\/[^/]+$/.test(url)) throw new Error('SUPABASE_URL debe ser la URL base del proyecto, sin /rest/v1');
  if (key.startsWith('sb_publishable_')) throw new Error('Usaste una clave publicable; configurá la clave secreta sb_secret_ en Vercel');
  return { url, key };
}

function headers(key: string, prefer?: string): Record<string, string> {
  return {
    apikey: key,
    // Las nuevas sb_secret_ se autentican mediante apikey. Las claves JWT
    // heredadas service_role también admiten Authorization: Bearer.
    ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function supabaseRequest(method: 'GET' | 'POST', path: string, body?: object, prefer?: string) {
  const { url, key } = credentials();
  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/${path}`, {
      method,
      headers: headers(key, prefer),
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    });
  } catch {
    throw new Error('No se pudo conectar con Supabase. Revisá SUPABASE_URL y el estado del proyecto.');
  }
  if (!response.ok) {
    // No incluir la respuesta íntegra: podría contener datos sensibles.
    const detail = await response.json().catch(() => null) as
      | { code?: string; message?: string }
      | null;
    throw new Error(`Supabase HTTP ${response.status}${detail?.code ? ` (${detail.code})` : ''}: ${detail?.message || 'Solicitud rechazada'}`);
  }
  return response;
}

export async function loadSettings(): Promise<Settings> {
  const response = await supabaseRequest(
    'GET',
    `store_settings?store_id=eq.${encodeURIComponent(storeId())}&select=*`,
  );
  const rows = await response.json();
  const row = rows[0];
  if (!row) return defaults;
  return {
    ...defaults,
    ...(row.settings || {}),
    cutoff: String(row.cutoff_time).slice(0, 5),
    days: row.delivery_days,
    badge: row.badge_text,
    blockedDates: (row.blocked_dates || []).join(','),
    enabled: row.enabled,
  } as Settings;
}

export async function saveSettings(s: Settings): Promise<void> {
  const payload = {
    store_id: storeId(),
    enabled: s.enabled,
    cutoff_time: s.cutoff,
    delivery_days: s.days,
    blocked_dates: s.blockedDates.split(',').map(v => v.trim()).filter(Boolean),
    badge_text: s.badge,
    settings: {
      bg: s.bg,
      accent: s.accent,
      badgeBg: s.badgeBg,
      urgent: s.urgent,
      threshold: s.threshold,
      critical: s.critical,
      free: s.free,
    },
  };
  await supabaseRequest(
    'POST',
    'store_settings?on_conflict=store_id',
    payload,
    'resolution=merge-duplicates,return=minimal',
  );
}

export function parseSettings(data: unknown): Settings {
  if (!data || typeof data !== 'object') throw Error('Configuración inválida');
  const x = data as Record<string, unknown>;
  const str = (k: string, max: number) => {
    if (typeof x[k] !== 'string' || (x[k] as string).length > max) throw Error(`Campo inválido: ${k}`);
    return x[k] as string;
  };
  const color = (k: string) => {
    const v = str(k, 7);
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) throw Error(`Color inválido: ${k}`);
    return v;
  };
  const num = (k: string, max: number) => {
    const v = x[k];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > max) throw Error(`Número inválido: ${k}`);
    return v;
  };
  const cutoff = str('cutoff', 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(cutoff)) throw Error('Horario inválido');
  const days = x.days;
  if (!Array.isArray(days) || !days.every(v => Number.isInteger(v) && v >= 0 && v <= 6) || new Set(days).size !== days.length) throw Error('Días inválidos');
  const blockedDates = str('blockedDates', 1500);
  if (blockedDates.split(',').some(v => v.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(v.trim()))) throw Error('Fechas inválidas');
  if (typeof x.free !== 'boolean' || typeof x.enabled !== 'boolean') throw Error('Opciones inválidas');
  return {
    cutoff, days, badge: str('badge', 60), bg: color('bg'), accent: color('accent'),
    badgeBg: color('badgeBg'), urgent: color('urgent'), threshold: num('threshold', 180),
    critical: num('critical', 60), free: x.free, blockedDates, enabled: x.enabled,
  };
}
