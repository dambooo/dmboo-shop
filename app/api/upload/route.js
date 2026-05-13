import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const type = formData.get('type'); // 'main' or 'hover'

  if (!file) {
    return NextResponse.json({ error: 'Файл олдсонгүй' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Зөвхөн JPG, PNG, WEBP файл зөвшөөрөгдөнө' }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Файлын хэмжээ 10MB-аас хэтэрсэн' }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Зураг оруулахад алдаа гарлаа' }, { status: 500 });
  }
}
