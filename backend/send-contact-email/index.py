import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Принимает сообщение из формы обратной связи и отправляет его на почту через SMTP Яндекса"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }

    body_data = json.loads(event.get('body') or '{}')
    name = (body_data.get('name') or '').strip()
    email = (body_data.get('email') or '').strip()
    message = (body_data.get('message') or '').strip()

    if not name or not email or len(message) < 10:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Некорректные данные формы'})
        }

    smtp_login = os.environ['YANDEX_SMTP_LOGIN']
    smtp_password = os.environ['YANDEX_SMTP_PASSWORD']

    msg = MIMEMultipart()
    msg['From'] = smtp_login
    msg['To'] = smtp_login
    msg['Subject'] = f'Кодекс Мира Легенд — послание от {name}'
    msg['Reply-To'] = email

    text = f'Имя: {name}\nEmail: {email}\n\nСообщение:\n{message}'
    msg.attach(MIMEText(text, 'plain', 'utf-8'))

    with smtplib.SMTP_SSL('smtp.yandex.ru', 465) as server:
        server.login(smtp_login, smtp_password)
        server.sendmail(smtp_login, [smtp_login], msg.as_string())

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True})
    }
