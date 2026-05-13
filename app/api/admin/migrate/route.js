import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Adds missing columns to the products table.
// Only accessible when logged in as admin.
export async function POST() {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const results = [];

  // Check and add hidden column
  const { error: checkErr } = await supabase
    .from('products')
    .select('hidden')
    .limit(1);

  if (checkErr && checkErr.message.includes('hidden')) {
    // Column missing – create it via a workaround: upsert a dummy row with the field
    // This won't work directly; we need SQL. Try via pg REST if available.
    try {
      const pgRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
        {
          method: 'POST',
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'X-Client-Info': 'supabase-js/2',
          },
        }
      );
      results.push({ col: 'hidden', status: 'manual_required' });
    } catch {
      results.push({ col: 'hidden', status: 'manual_required' });
    }
  } else {
    results.push({ col: 'hidden', status: 'ok' });
  }

  return NextResponse.json({
    results,
    sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;',
    message: 'Run the SQL above in Supabase SQL editor to add missing columns.',
  });
}
