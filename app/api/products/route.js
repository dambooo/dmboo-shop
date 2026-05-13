import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { defaultProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Columns that exist in the Supabase products table.
const DB_COLUMNS = ['id', 'name', 'brand', 'desc', 'price', 'oldPrice', 'discount',
  'category', 'badge', 'image', 'hoverImage', 'rating', 'reviews',
  'fullDesc', 'ingredients', 'howToUse', 'hidden'];

const normalizeProducts = (list = []) => list.map(product => ({
  ...product,
  hidden: Boolean(product.hidden)
}));

const getVisibleProducts = (list = []) => normalizeProducts(list).filter(product => !product.hidden);

// Strip unknown columns (like hidden) before sending to Supabase
function toDbRow(product) {
  const row = {};
  for (const col of DB_COLUMNS) {
    row[col] = product[col] ?? null;
  }
  return row;
}

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
  const noStoreHeaders = { 'Cache-Control': 'no-store, max-age=0, must-revalidate' };
  try {
    const supabase = getServiceSupabase();
    const products = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Strip hidden and other unknown fields before upsert
    const rows = products.map(toDbRow);

    const { error } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw error;

    // Delete products that are no longer in the list
    const ids = rows.map(p => p.id);
    if (ids.length > 0) {
      await supabase
        .from('products')
        .delete()
        .not('id', 'in', `(${ids.join(',')})`);
    }

    return NextResponse.json({ success: true }, { headers: noStoreHeaders });
  } catch (e) {
    console.error('Supabase write error:', e);
    return NextResponse.json({ error: e.message || 'Failed to save' }, { status: 500, headers: noStoreHeaders });
  }
}
