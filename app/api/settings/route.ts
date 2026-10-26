import {NextResponse} from 'next/server';
import {isAdmin,sameOrigin} from '../../../lib/server/auth';
import {loadSettings,parseSettings,saveSettings} from '../../../lib/server/db';
import {allowedStoreId} from '../../../lib/server/store-scope';
export async function GET(request:Request){
 if(!await isAdmin())return NextResponse.json({error:'No autorizado'},{status:401});
 const storeId=allowedStoreId(new URL(request.url).searchParams.get('store_id'));
 if(!storeId)return NextResponse.json({error:'Tienda inválida'},{status:400});
 try{return NextResponse.json(await loadSettings(storeId),{headers:{'Cache-Control':'no-store'}})}
 catch(e){console.error(e);return NextResponse.json({error:'No se pudo leer Supabase'},{status:503})}
}
export async function PUT(request:Request){
 if(!await isAdmin())return NextResponse.json({error:'No autorizado'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origen inválido'},{status:403});
 const storeId=allowedStoreId(new URL(request.url).searchParams.get('store_id'));
 if(!storeId)return NextResponse.json({error:'Tienda inválida'},{status:400});
 let config;try{config=parseSettings(await request.json())}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Datos inválidos'},{status:400})}
 try{await saveSettings(config,storeId);return NextResponse.json({ok:true})}
 catch(e){console.error(e);return NextResponse.json({error:'No se pudo guardar en Supabase'},{status:503})}
}
