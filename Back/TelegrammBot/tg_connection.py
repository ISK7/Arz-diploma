import telebot
import segno

token = '%ваш токен%'


def generate(str):
    qr_code = segno.make(str, micro=False)
    return qr_code


def get_text_messages(message):
    send_to_support(message)


def send_to_support(text):
    None


bot = telebot.TeleBot('%ваш токен%')
bot.message_handler(content_types=['text'])
