import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { defaultProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const normalizeProducts = (list = []) => list.map(product => ({
  ...product,
  hidden: Boolean(product.hidden)
}));

const getVisibleProducts = (list = []) => normalizeProducts(list).filter(product => !product.hidden);

export async function GET(request) {
  const includeHidden = ['1', 'true'].includes(request.nextUrl.searchParams.get('includeHidden'));
  const noStoreHeaders = { 'Cache-Control': 'no-store, max-age=0, must-revalidate' };

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json(includeHidden ? normalizeProducts(data) : getVisibleProducts(data), { headers: noStoreHeaders });
    }

    const fallbackProducts = includeHidden ? normalizeProducts(defaultProducts) : getVisibleProducts(defaultProducts);
    return NextResponse.json(fallbackProducts, { headers: noStoreHeaders });
  } catch (e) {
    console.error('Supabase read error:', e);

    const fallbackProducts = includeHidden ? normalizeProducts(defaultProducts) : getVisibleProducts(defaultProducts);
    return NextResponse.json(fallbackProducts, { headers: noStoreHeaders });
  }
}

export async function POST(request) {
  try {
    const supabase = getServiceSupabase();
    const products = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const normalizedProducts = normalizeProducts(products);

    // Upsert all products (insert or update by id)
    const { error } = await supabase
      .from('products')
      .upsert(normalizedProducts, { onConflict: 'id' });

    if (error) throw error;

    // Delete products that are no longer in the list
    const ids = normalizedProducts.map(p => p.id);
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
