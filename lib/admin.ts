import {createHmac,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
const COOKIE='practica_admin';
function secret(){const s=process.env.ADMIN_SESSION_SECRET;if(!s || s.length<32)throw new Error('ADMIN_SESSION_SECRET debe tener 32+ caracteres');return s;}
function sign(payload:string){return createHmac('sha256',secret()).update(payload).digest('hex');}
export function createSession(){const payload=String(Date.now()+1000*60*60*12);return `${payload}.${sign(payload)}`;}
export function validSession(value?:string){if(!value)return false;const [payload,mac,...rest]=value.split('.');if(rest.length||!payload||!mac||!/^[0-9]+$/.test(payload)||Number(payload)<Date.now())return false;const expected=sign(payload);return mac.length===expected.length&&timingSafeEqual(Buffer.from(mac),Buffer.from(expected));}
export async function isAdmin(){return validSession((await cookies()).get(COOKIE)?.value);}
export function adminCookie(){return COOKIE;}
export function checkPassword(candidate:string){const expected=process.env.ADMIN_PASSWORD;if(!expected||expected==='REEMPLAZAR')return false;const a=createHmac('sha256',secret()).update(candidate).digest();const b=createHmac('sha256',secret()).update(expected).digest();return timingSafeEqual(a,b);}
