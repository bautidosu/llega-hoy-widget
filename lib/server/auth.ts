import {createHmac, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
const cookieName='lh_admin';
function secret(){const v=process.env.ADMIN_PASSWORD;if(!v||v.length<16)throw new Error('ADMIN_PASSWORD debe tener al menos 16 caracteres');return v;}
function signature(value:string){return createHmac('sha256',secret()).update(value).digest('hex');}
export function verifyPassword(candidate:string){const expected=Buffer.from(signature('password:'+secret()),'hex');const received=Buffer.from(createHmac('sha256',candidate).update('password:'+candidate).digest('hex'),'hex');return expected.length===received.length&&timingSafeEqual(expected,received);}
export async function isAdmin(){try{const token=(await cookies()).get(cookieName)?.value||'';const [expires,sig]=token.split('.');if(!expires||!sig||!/^\d+$/.test(expires)||Number(expires)<Date.now())return false;const expected=Buffer.from(signature(expires),'hex'),received=Buffer.from(sig,'hex');return expected.length===received.length&&timingSafeEqual(expected,received)}catch{return false}}
export function makeCookie(){const expires=String(Date.now()+7*24*3600*1000);return `${expires}.${signature(expires)}`}
export const adminCookie=cookieName;
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin)return false;try{return new URL(origin).host===new URL(request.url).host}catch{return false}}
