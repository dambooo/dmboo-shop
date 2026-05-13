export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { order } = await request.json();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return Response.json({ ok: false, error: 'Telegram env vars missing' }, { status: 500 });
    }

    const itemLines = order.items
      .map(i => `  • ${i.name} x${i.qty} — ${(i.price * i.qty).toLocaleString()}₮`)
      .join('\n');

    const text =
      `🛍 *Шинэ захиалга!*\n\n` +
      `📞 Утас: *${order.phone}*\n` +
      `📅 Огноо: ${order.date}\n\n` +
      `*Бараанууд:*\n${itemLines}\n\n` +
      `💰 Нийт: *${order.total.toLocaleString()}₮*`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    return Response.json({ ok: data.ok });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
