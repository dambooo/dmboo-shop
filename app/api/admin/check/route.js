import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [, password] = decoded.split(':');
    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ authenticated: true });
    }
  } catch {}

  return NextResponse.json({ authenticated: false });
}
