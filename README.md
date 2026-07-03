# Финиковый Двор 🌴

Витрина фиников с корзиной и отправкой заказов в Telegram. Чистый фронтенд (HTML/CSS/JS) + одна Vercel Serverless Function.

**Стек:** статика без сборки, хостинг — [Vercel](https://vercel.com), заказы — Telegram Bot API.

## Структура

```
index.html        — страница: каталог, корзина, форма заказа
css/style.css     — стили
js/products.js    — товары (редактируйте ассортимент здесь)
js/cart.js        — логика корзины (localStorage)
js/app.js         — рендер и отправка заказа
api/order.js      — serverless-функция: заказ → Telegram
```

## Настройка Telegram

1. В Telegram напишите [@BotFather](https://t.me/BotFather) → `/newbot` → получите **токен бота**.
2. Узнайте **chat_id**: напишите своему боту любое сообщение, затем откройте
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — в ответе будет `"chat":{"id": ...}`.
3. В Vercel: **Settings → Environment Variables** добавьте:
   - `TELEGRAM_BOT_TOKEN` — токен из шага 1
   - `TELEGRAM_CHAT_ID` — id из шага 2
4. Передеплойте проект (Deployments → Redeploy).

## Локальный запуск

```bash
npm run dev   # статика на http://localhost:3210 (без Telegram-функции)
```

## Редактирование товаров

Откройте `js/products.js`: название, описание, цена (₸), вес и фото.
Фото положите в `images/` и укажите путь в поле `image` — иначе показывается эмодзи-заглушка.
