from fastapi import FastAPI, Request
import httpx
import json

TELEGRAM_TOKEN = '%ваш токен%'
bot_link = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"

app = FastAPI()


async def send_message(chat_id, text):
    async with httpx.AsyncClient() as client:
        await client.post(
            bot_link,
            data={"chat_id": chat_id, "text": text}
        )


@app.post("/webhook")
async def webhook_endpoint(request: Request):
    data = await request.json()

    tg_user_id = data.get("tg_user_id")
    qr_url = json.dump(data)

    # Отправляем пользователю
    await send_message(tg_user_id, qr_url)

    return {"status": "ok"}
