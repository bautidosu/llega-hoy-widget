import {NextResponse} from 'next/server';
import {listProducts} from '../../../../lib/server/sold-counts';
export async function GET(){try{const rows=await listProducts();return NextResponse.json({products:rows.filter(p=>p.enabled&&p.sold_count>=10).map(p=>({id:p.product_id,handle:p.handle,count:p.sold_count}))},{headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'public, s-maxage=300, stale-while-revalidate=600'}})}catch{return NextResponse.json({products:[]},{headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}})}}
