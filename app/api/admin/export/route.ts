import {isAdmin} from '../../../../lib/admin';
import {db} from '../../../../lib/db';
export const dynamic='force-dynamic';
const escape=(v:unknown)=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
export async function GET(){if(!await isAdmin())return new Response('No autorizado',{status:401});const {data,error}=await db().from('registrations').select('name,school,email,phone,practice_date,status,created_at,paid_at').order('practice_date').limit(5000);if(error)return new Response('Error de base de datos',{status:500});const columns=['name','school','email','phone','practice_date','status','created_at','paid_at'] as const;const csv='\uFEFF'+[columns.join(','),...(data||[]).map(r=>columns.map(c=>escape(r[c])).join(','))].join('\r\n');return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="inscriptos-practica.csv"','Cache-Control':'no-store'}})}
