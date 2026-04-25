import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

const TABLE = 'inventory_entries';

function mapDbToClient(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    buyerName: row.buyer_name,
    purchaseDate: row.purchase_date,
    quantity: row.quantity,
    purchasePrice: row.purchase_price,
    tax: row.tax,
    cargo: row.cargo,
    sellPrice: row.sell_price,
    note: row.note,
    createdAt: row.created_at,
  };
}

function mapClientToDb(entry) {
  return {
    id: entry.id,
    product_id: entry.productId ?? null,
    product_name: entry.productName,
    buyer_name: entry.buyerName,
    purchase_date: entry.purchaseDate,
    quantity: Number(entry.quantity) || 0,
    purchase_price: Number(entry.purchasePrice) || 0,
    tax: Number(entry.tax) || 0,
    cargo: Number(entry.cargo) || 0,
    sell_price: Number(entry.sellPrice) || 0,
    note: entry.note ?? null,
  };
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('purchase_date', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'inventory_table_missing' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json((data || []).map(mapDbToClient));
  } catch (e) {
    console.error('Inventory read error:', e);
    return NextResponse.json({ error: 'inventory_read_failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = getServiceSupabase();
    const entries = await request.json();

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'invalid_inventory_data' }, { status: 400 });
    }

    const payload = entries.map(mapClientToDb);
    const { error: upsertError } = await supabase
      .from(TABLE)
      .upsert(payload, { onConflict: 'id' });

    if (upsertError) {
      if (upsertError.code === '42P01') {
        return NextResponse.json({ error: 'inventory_table_missing' }, { status: 404 });
      }
      throw upsertError;
    }

    const ids = payload.map(item => item.id).filter(Boolean);
    if (ids.length > 0) {
      const { error: deleteError } = await supabase
        .from(TABLE)
        .delete()
        .not('id', 'in', `(${ids.join(',')})`);
      if (deleteError) {
        throw deleteError;
      }
    } else {
      const { error: deleteAllError } = await supabase
        .from(TABLE)
        .delete()
        .gte('id', 0);
      if (deleteAllError) {
        throw deleteAllError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Inventory write error:', e);
    return NextResponse.json({ error: 'inventory_write_failed' }, { status: 500 });
  }
}
