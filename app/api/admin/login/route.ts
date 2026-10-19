import {NextResponse} from 'next/server';
import {adminCookie,checkPassword,createSession} from '../../../../lib/admin';
export async function POST(req:Request){const form=await req.formData();const password=String(form.get('password')||'');if(!checkPassword(password))return NextResponse.redirect(new URL('/admin?error=1',req.url),303);const res=NextResponse.redirect(new URL('/admin',req.url),303);res.cookies.set(adminCookie(),createSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:43200});return res;}
