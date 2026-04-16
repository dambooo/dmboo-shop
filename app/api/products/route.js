import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { defaultProducts } from '@/lib/products';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json(data);
    }
    return NextResponse.json(defaultProducts);
  } catch (e) {
    console.error('Supabase read error:', e);
    return NextResponse.json(defaultProducts);
  }
}

export async function POST(request) {
  try {
    const supabase = getServiceSupabase();
    const products = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Upsert all products (insert or update by id)
    const { error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });

    if (error) throw error;

    // Delete products that are no longer in the list
    const ids = products.map(p => p.id);
    if (ids.length > 0) {
      await supabase
        .from('products')
        .delete()
        .not('id', 'in', `(${ids.join(',')})`);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Supabase write error:', e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
