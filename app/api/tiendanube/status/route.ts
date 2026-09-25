import {NextResponse} from 'next/server';
import {isAdmin} from '../../../../lib/server/auth';
import {getInstallations} from '../../../../lib/server/tiendanube';
export async function GET(){
  if(!await isAdmin())return NextResponse.json({error:'No autorizado'},{status:401});
  try{return NextResponse.json({installations:await getInstallations(),configuredStoreId:process.env.LH_STORE_ID||'llama-maestra-test'},{headers:{'Cache-Control':'no-store'}})}
  catch(error){console.error(error);return NextResponse.json({error:'No se pudo leer instalaciones'},{status:503})}
}
