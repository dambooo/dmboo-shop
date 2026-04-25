import { getServiceSupabase } from '@/lib/supabase';
import { defaultProducts } from '@/lib/products';

export default async function sitemap() {
  let products = defaultProducts;
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('id, updated_at')
      .order('id', { ascending: true });
    if (!error && data && data.length > 0) {
      products = data;
    }
  } catch (e) {
    // fallback to defaultProducts
  }

  const productUrls = products.map((p) => ({
    url: `https://gezegstore.mn/products/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: 'https://gezegstore.mn',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...productUrls,
  ];
}
