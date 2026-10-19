import {createHmac,timingSafeEqual} from 'node:crypto';
import {NextResponse} from 'next/server';
import {db} from '../../../../lib/db';
export const runtime='nodejs';
export async function POST(req:Request){try{
 const secret=process.env.MERCADOPAGO_WEBHOOK_SECRET,token=process.env.MERCADOPAGO_ACCESS_TOKEN;
 if(!secret||!token)return NextResponse.json({error:'Webhook no configurado'},{status:503});
 const url=new URL(req.url),paymentId=url.searchParams.get('data.id'),signature=req.headers.get('x-signature')||'',requestId=req.headers.get('x-request-id')||'';
 const ts=signature.split(',').map(x=>x.trim()).find(x=>x.startsWith('ts='))?.slice(3);
 const hash=signature.split(',').map(x=>x.trim()).find(x=>x.startsWith('v1='))?.slice(3);
 if(!ts||!hash||!requestId||!/^\d+$/.test(ts)||Math.abs(Date.now()-Number(ts)*1000)>10*60*1000)return NextResponse.json({error:'Firma inválida'},{status:401});
 const manifest=`${paymentId?`id:${paymentId.toLowerCase()};`:''}request-id:${requestId};ts:${ts};`;
 const expected=createHmac('sha256',secret).update(manifest).digest('hex');
 if(hash.length!==expected.length||!timingSafeEqual(Buffer.from(hash),Buffer.from(expected)))return NextResponse.json({error:'Firma inválida'},{status:401});
 if(!paymentId||url.searchParams.get('type')!=='payment')return NextResponse.json({ok:true});
 const res=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Error consultando pago'},{status:502});
 const payment=await res.json();const id=payment.external_reference;
 if(!id||!['approved','pending','in_process','rejected','cancelled','refunded','charged_back'].includes(payment.status))return NextResponse.json({ok:true});
 const {data:registration,error}=await db().from('registrations').select('id,amount,status').eq('id',id).single();
 if(error||!registration)return NextResponse.json({ok:true});
 if(Number(payment.transaction_amount)!==Number(registration.amount)||payment.currency_id!=='ARS')return NextResponse.json({error:'Monto no coincide'},{status:400});
 const status=payment.status==='approved'?'approved':payment.status==='pending'||payment.status==='in_process'?'pending':payment.status;
 const {error:updateError}=await db().from('registrations').update({status,payment_id:String(payment.id),paid_at:status==='approved'?(payment.date_approved||new Date().toISOString()):null}).eq('id',id);
 if(updateError)throw updateError;
 return NextResponse.json({ok:true});
 }catch(e){console.error('webhook',e);return NextResponse.json({error:'Error interno'},{status:500});}}
