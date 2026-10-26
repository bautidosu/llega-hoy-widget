import {NextResponse} from 'next/server';
import {loadSettings} from '../../../lib/server/db';
import {allowedStoreId} from '../../../lib/server/store-scope';

// Public read-only endpoint. NEVER return store identifiers, API keys or admin credentials.
export async function GET(request:Request) {
  try {
    const requested=new URL(request.url).searchParams.get('store_id');
    const storeId=requested?allowedStoreId(requested):undefined;
    if(requested&&!storeId)return NextResponse.json({enabled:false},{status:400,headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}});
    const s=await loadSettings(storeId);
    return NextResponse.json({enabled:s.enabled,cutoff:s.cutoff,days:s.days,badge:s.badge,bg:s.bg,accent:s.accent,badgeBg:s.badgeBg,urgent:s.urgent,threshold:s.threshold,critical:s.critical,free:s.free,freeMinAmount:s.freeMinAmount,blockedDates:s.blockedDates,timezone:'America/Argentina/Buenos_Aires'}, {headers:{'Cache-Control':'public, s-maxage=30, stale-while-revalidate=30','Access-Control-Allow-Origin':'*'}});
  } catch (error) {
    console.error('Public widget configuration:',error);
    return NextResponse.json({enabled:false}, {status:503,headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
  }
}
