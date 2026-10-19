import {NextResponse} from 'next/server';
import {adminCookie} from '../../../../lib/admin';
export async function POST(req:Request){const res=NextResponse.redirect(new URL('/admin',req.url),303);res.cookies.set(adminCookie(),'',{path:'/',maxAge:0});return res;}
