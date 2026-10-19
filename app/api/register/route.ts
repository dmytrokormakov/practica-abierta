import {NextResponse} from 'next/server';
import {db} from '../../../lib/db';
import {DATES,PRICE} from '../../../lib/config';
export const runtime='nodejs';
export async function POST(req:Request){try{
 const body=await req.json();const name=String(body.name||'').trim(),school=String(body.school||'').trim(),email=String(body.email||'').trim(),phone=String(body.phone||'').trim(),date=String(body.date||'');
 if(!name||name.length>120||!school||school.length>150||!email||email.length>200||!/^\S+@\S+\.\S+$/.test(email)||!phone||phone.length>30||!DATES.some(d=>d.value===date))return NextResponse.json({error:'Revisá los datos del formulario.'},{status:400});
 const token=process.env.MERCADOPAGO_ACCESS_TOKEN,url=process.env.APP_URL;if(!token||!url||!/^https?:\/\//.test(url))throw new Error('Falta configurar Mercado Pago o APP_URL');
 const {data:registration,error}=await db().from('registrations').insert({name,school,email,phone,practice_date:date,status:'pending',amount:PRICE}).select('id').single();if(error)throw error;
 const preference={items:[{id:`practica-${date}`,title:`Práctica Abierta - ${DATES.find(d=>d.value===date)?.label}`,quantity:1,currency_id:'ARS',unit_price:PRICE}],external_reference:registration.id,payer:{email},back_urls:{success:`${url}/resultado`,failure:`${url}/resultado`,pending:`${url}/resultado`},notification_url:`${url}/api/webhooks/mercadopago`,auto_return:'approved'};
 const mp=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-Idempotency-Key':registration.id},body:JSON.stringify(preference),cache:'no-store'});
 const result=await mp.json();if(!mp.ok||!result.id){console.error('Error Mercado Pago',mp.status,result);return NextResponse.json({error:'No se pudo iniciar Mercado Pago. Intentá nuevamente.'},{status:502});}
 await db().from('registrations').update({preference_id:result.id}).eq('id',registration.id);
 const checkout_url=token.startsWith('TEST-')?(result.sandbox_init_point||result.init_point):result.init_point;
 return NextResponse.json({checkout_url});
 }catch(e){console.error('register',e);return NextResponse.json({error:'No se pudo registrar. Verificá la configuración e intentá nuevamente.'},{status:500});}}
