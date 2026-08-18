import json
import os
import re
import psycopg2


def get_conn():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn)


def slugify(text: str, prefix: str) -> str:
    '''Транслитерирует и очищает произвольный текст в безопасный идентификатор для БД.'''
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    }
    lowered = text.lower()
    transliterated = ''.join(translit_map.get(ch, ch) for ch in lowered)
    slug = re.sub(r'[^a-z0-9]+', '-', transliterated).strip('-')
    if not slug:
        slug = 'item'
    return f'{prefix}-{slug}'[:55]


def handler(event: dict, context) -> dict:
    '''Управляет вкладками-источниками (руководствами) и подразделами разделов кодекса.
    GET — вернуть все источники, привязки источников к разделам и подразделы.
    POST action=login — проверить пароль редактирования.
    POST action=save_source / delete_source — создать/переименовать или удалить источник (требует пароль).
    POST action=save_subgroup / delete_subgroup — создать/переименовать или удалить подраздел (требует пароль).'''
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
            cur.execute("SELECT id, title, icon FROM codex_sources ORDER BY created_at")
            sources = [{'id': r[0], 'title': r[1], 'icon': r[2]} for r in cur.fetchall()]

            cur.execute("SELECT section_id, source_id FROM codex_section_sources")
            section_sources = [{'sectionId': r[0], 'sourceId': r[1]} for r in cur.fetchall()]

            cur.execute("SELECT id, title, section_id, source_id, parent_id FROM codex_subgroups ORDER BY created_at")
            subgroups = [
                {'id': r[0], 'title': r[1], 'sectionId': r[2], 'sourceId': r[3], 'parentId': r[4]}
                for r in cur.fetchall()
            ]
            cur.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'sources': sources, 'sectionSources': section_sources, 'subgroups': subgroups}),
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

        if action == 'save_source':
            title = (body.get('title') or '').strip()
            icon = body.get('icon') or 'BookOpen'
            source_id = body.get('id')
            section_ids = body.get('sectionIds') or []
            if not title:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не указано название'})}
            conn = get_conn()
            try:
                cur = conn.cursor()
                if source_id:
                    cur.execute(
                        "UPDATE codex_sources SET title = %s, icon = %s WHERE id = %s",
                        (title, icon, source_id),
                    )
                else:
                    source_id = slugify(title, 'src')
                    cur.execute(
                        """
                        INSERT INTO codex_sources (id, title, icon, is_custom)
                        VALUES (%s, %s, %s, true)
                        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, icon = EXCLUDED.icon
                        """,
                        (source_id, title, icon),
                    )
                cur.execute("DELETE FROM codex_section_sources WHERE source_id = %s", (source_id,))
                for section_id in section_ids:
                    cur.execute(
                        "INSERT INTO codex_section_sources (section_id, source_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (section_id, source_id),
                    )
                conn.commit()
                cur.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'id': source_id})}
            finally:
                conn.close()

        if action == 'delete_source':
            source_id = body.get('id')
            if not source_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает id'})}
            conn = get_conn()
            try:
                cur = conn.cursor()
                cur.execute("DELETE FROM codex_section_sources WHERE source_id = %s", (source_id,))
                cur.execute("DELETE FROM codex_sources WHERE id = %s", (source_id,))
                conn.commit()
                cur.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
            finally:
                conn.close()

        if action == 'save_subgroup':
            title = (body.get('title') or '').strip()
            subgroup_id = body.get('id')
            section_id = body.get('sectionId')
            source_id = body.get('sourceId')
            parent_id = body.get('parentId')
            if not title or not section_id or not source_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает данных'})}
            conn = get_conn()
            try:
                cur = conn.cursor()
                if subgroup_id:
                    cur.execute(
                        "UPDATE codex_subgroups SET title = %s, parent_id = %s WHERE id = %s",
                        (title, parent_id, subgroup_id),
                    )
                else:
                    subgroup_id = slugify(f'{section_id}-{source_id}-{title}', 'sg')
                    cur.execute(
                        """
                        INSERT INTO codex_subgroups (id, title, section_id, source_id, parent_id)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, parent_id = EXCLUDED.parent_id
                        """,
                        (subgroup_id, title, section_id, source_id, parent_id),
                    )
                conn.commit()
                cur.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'id': subgroup_id})}
            finally:
                conn.close()

        if action == 'delete_subgroup':
            subgroup_id = body.get('id')
            if not subgroup_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает id'})}
            conn = get_conn()
            try:
                cur = conn.cursor()
                cur.execute("DELETE FROM codex_subgroups WHERE id = %s OR parent_id = %s", (subgroup_id, subgroup_id))
                conn.commit()
                cur.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
            finally:
                conn.close()

        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неизвестное действие'})}

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}
