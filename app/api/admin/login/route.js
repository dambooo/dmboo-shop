import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: 'Нууц үг оруулна уу' }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: 'Серверийн тохиргоо алдаатай' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Нууц үг буруу байна' }, { status: 401 });
  }

  // Generate a simple session token
  const token = Buffer.from(`${Date.now()}:${adminPassword}`).toString('base64');

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return response;
}
