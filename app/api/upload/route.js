import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

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

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Файлын хэмжээ 5MB-аас хэтэрсэн' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'dmboo-shop/products',
      resource_type: 'image',
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Зураг оруулахад алдаа гарлаа' }, { status: 500 });
  }
}
