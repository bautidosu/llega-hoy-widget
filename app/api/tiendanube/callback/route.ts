import {NextRequest,NextResponse} from 'next/server';
import {copyInitialSettings,exchangeCode,saveInstallation} from '../../../../lib/server/tiendanube';

export const runtime='nodejs';
export async function GET(request:NextRequest){
  const code=request.nextUrl.searchParams.get('code');
  if(!code||code.length>2048)return new NextResponse('Falta el código de autorización de Tiendanube.',{status:400});
  try{
    const {storeId,accessToken}=await exchangeCode(code);
    await saveInstallation(storeId,accessToken);
    await copyInitialSettings(storeId);
    const redirect=new URL('/',request.url);
    redirect.searchParams.set('tn_installed',storeId);
    return NextResponse.redirect(redirect,{status:303});
  }catch(error){
    console.error('Error de instalación Tiendanube:',error instanceof Error?error.message:'Error desconocido');
    return new NextResponse('No se pudo completar la instalación. Revisá los logs de Vercel; no vuelvas a usar el mismo código de autorización.',{status:502});
  }
}
