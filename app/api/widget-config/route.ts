import {NextResponse} from 'next/server';
import {loadSettings} from '../../../lib/server/db';

// Public read-only endpoint. NEVER return store identifiers, API keys or admin credentials.
export async function GET() {
  try {
    const s=await loadSettings();
    return NextResponse.json({enabled:s.enabled,cutoff:s.cutoff,days:s.days,badge:s.badge,bg:s.bg,accent:s.accent,badgeBg:s.badgeBg,urgent:s.urgent,threshold:s.threshold,critical:s.critical,free:s.free,blockedDates:s.blockedDates,timezone:'America/Argentina/Buenos_Aires'}, {headers:{'Cache-Control':'public, s-maxage=30, stale-while-revalidate=30','Access-Control-Allow-Origin':'*'}});
  } catch (error) {
    console.error('Public widget configuration:',error);
    return NextResponse.json({enabled:false}, {status:503,headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
  }
}
