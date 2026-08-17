import json
import os
import psycopg2


def get_conn():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn)


def handler(event: dict, context) -> dict:
    '''Хранит и отдаёт правки карточек существ (creature_overrides) поверх статического кодекса.
    GET — вернуть все правки. POST action=login — проверить пароль редактирования.
    POST action=save — сохранить/обновить правку карточки (требует пароль).
    POST action=reset — удалить правку, вернув карточку к исходному виду (требует пароль).'''
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
    edit_password = os.environ.get('CREATURES_EDIT_PASSWORD', '')

    if method == 'GET':
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, data, is_removed FROM creature_overrides")
            rows = cur.fetchall()
            overrides = {}
            removed = []
            for row_id, data, is_removed in rows:
                if is_removed:
                    removed.append(row_id)
                else:
                    overrides[row_id] = data
            cur.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'overrides': overrides, 'removed': removed}),
            }
        finally:
            conn.close()

    if method == 'POST':
        body_raw = event.get('body') or '{}'
        try:
            body = json.loads(body_raw)
        except json.JSONDecodeError:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректный JSON'})}

        action = body.get('action')

        if action == 'login':
            password = body.get('password', '')
            ok = bool(edit_password) and password == edit_password
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': ok})}

        password = event.get('headers', {}).get('X-Edit-Password') or event.get('headers', {}).get('x-edit-password') or ''
        if not edit_password or password != edit_password:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный пароль'})}

        if action == 'save':
            entry_id = body.get('id')
            data = body.get('data')
            if not entry_id or data is None:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает id или data'})}
            conn = get_conn()
            try:
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO creature_overrides (id, data, is_removed, updated_at)
                    VALUES (%s, %s, false, now())
                    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, is_removed = false, updated_at = now()
                    """,
                    (entry_id, json.dumps(data)),
                )
                conn.commit()
                cur.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
            finally:
                conn.close()

        if action == 'reset':
            entry_id = body.get('id')
            if not entry_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает id'})}
            conn = get_conn()
            try:
                cur = conn.cursor()
                cur.execute("DELETE FROM creature_overrides WHERE id = %s", (entry_id,))
                conn.commit()
                cur.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
            finally:
                conn.close()

        if action == 'remove':
            entry_id = body.get('id')
            data = body.get('data') or {}
            if not entry_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает id'})}
            conn = get_conn()
            try:
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO creature_overrides (id, data, is_removed, updated_at)
                    VALUES (%s, %s, true, now())
                    ON CONFLICT (id) DO UPDATE SET is_removed = true, updated_at = now()
                    """,
                    (entry_id, json.dumps(data)),
                )
                conn.commit()
                cur.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
            finally:
                conn.close()

        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неизвестное действие'})}

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}
