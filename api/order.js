// Vercel Serverless Function: принимает заказ и шлёт его в Telegram.
// Токен и chat_id задаются в Vercel: Settings → Environment Variables
// (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID). В коде их нет — наружу не утекают.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ error: "Telegram is not configured" });
  }

  const { name, phone, comment, items, total } = req.body || {};

  if (
    typeof name !== "string" || !name.trim() ||
    typeof phone !== "string" || !phone.trim() ||
    !Array.isArray(items) || items.length === 0 ||
    typeof total !== "number"
  ) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const clip = (s, max) => String(s).slice(0, max);

  const lines = items
    .slice(0, 50)
    .map((i) => `• ${clip(i.name, 100)} — ${i.qty} × ${i.price} ₸ = ${i.sum} ₸`);

  const text = [
    "🌴 НОВЫЙ ЗАКАЗ — Финиковый Двор",
    "",
    `👤 Имя: ${clip(name.trim(), 100)}`,
    `📞 Телефон: ${clip(phone.trim(), 30)}`,
    comment && comment.trim() ? `💬 Комментарий: ${clip(comment.trim(), 500)}` : null,
    "",
    "🧺 Состав заказа:",
    ...lines,
    "",
    `💰 Итого: ${total} ₸`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!tgRes.ok) {
      const detail = await tgRes.text();
      console.error("Telegram API error:", detail);
      return res.status(502).json({ error: "Failed to deliver order" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Order delivery failed:", err);
    return res.status(502).json({ error: "Failed to deliver order" });
  }
}
