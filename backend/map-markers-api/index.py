import json
import os
import uuid
import psycopg2

CATEGORIES = {'realm', 'wild', 'sea', 'custom'}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    '''Пользовательские метки интерактивной карты Старого Света.
    GET — список всех меток. POST action=save — создать или изменить метку (требует пароль),
    POST action=delete — удалить метку (требует пароль). Пароль передаётся в X-Edit-Password.'''
    method = event.get('httpMethod', 'GET')
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Edit-Password',
        'Access-Control-Max-Age': '86400',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    headers['Content-Type'] = 'application/json'

    def resp(code, data):
        return {'statusCode': code, 'headers': headers, 'body': json.dumps(data)}

    if method == 'GET':
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, title, description, category, x, y, image_url, image_size FROM map_markers ORDER BY created_at")
            markers = [
                {'id': r[0], 'title': r[1], 'description': r[2], 'category': r[3], 'x': r[4], 'y': r[5], 'imageUrl': r[6], 'imageSize': r[7]}
                for r in cur.fetchall()
            ]
            cur.close()
            return resp(200, {'markers': markers})
        finally:
            conn.close()

    if method != 'POST':
        return resp(405, {'error': 'Метод не поддерживается'})

    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return resp(400, {'error': 'Некорректный JSON'})

    edit_password = os.environ.get('CREATURES_EDIT_PASSWORD', '')
    hdrs = event.get('headers') or {}
    password = hdrs.get('X-Edit-Password') or hdrs.get('x-edit-password') or ''
    if not edit_password or password != edit_password:
        return resp(401, {'error': 'Неверный пароль'})

    action = body.get('action')

    if action == 'save':
        title = (body.get('title') or '').strip()
        if not title:
            return resp(400, {'error': 'Не указано название'})
        try:
            x = float(body.get('x'))
            y = float(body.get('y'))
        except (TypeError, ValueError):
            return resp(400, {'error': 'Не указаны координаты'})
        category = body.get('category') if body.get('category') in CATEGORIES else 'custom'
        description = (body.get('description') or '').strip()
        image_url = (body.get('imageUrl') or '').strip()
        try:
            image_size = max(16, min(400, int(body.get('imageSize') or 36)))
        except (TypeError, ValueError):
            image_size = 36
        marker_id = body.get('id') or f'm-{uuid.uuid4().hex[:12]}'
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO map_markers (id, title, description, category, x, y, image_url, image_size)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
                  category = EXCLUDED.category, x = EXCLUDED.x, y = EXCLUDED.y, image_url = EXCLUDED.image_url, image_size = EXCLUDED.image_size
                """,
                (marker_id, title, description, category, x, y, image_url, image_size),
            )
            conn.commit()
            cur.close()
            return resp(200, {'ok': True, 'id': marker_id})
        finally:
            conn.close()

    if action == 'delete':
        marker_id = body.get('id')
        if not marker_id:
            return resp(400, {'error': 'Не хватает id'})
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM map_markers WHERE id = %s", (marker_id,))
            conn.commit()
            cur.close()
            return resp(200, {'ok': True})
        finally:
            conn.close()

    return resp(400, {'error': 'Неизвестное действие'})
