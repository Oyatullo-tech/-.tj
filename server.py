#!/usr/bin/env python3
import http.server
import socketserver
import os
import json
import cgi
import time
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import database as db

PORT = int(os.environ.get('PORT', 8001))
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '8355752117:AAFkQ8iQF8xA-9psVQNgNbwDz7xPEYOqNWs')
TELEGRAM_ADMIN_CHAT_ID = os.environ.get('TELEGRAM_ADMIN_CHAT_ID', '5903042329')
TELEGRAM_APPROVAL_SECRET = os.environ.get('TELEGRAM_APPROVAL_SECRET', 'kinoTJ_approve_secret_2026')
BASE_URL = os.environ.get('BASE_URL', f'http://localhost:{PORT}')
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
RECEIPTS_DIR = os.path.join(UPLOADS_DIR, 'receipts')

print(f"Telegram bot token set: {'yes' if TELEGRAM_BOT_TOKEN else 'no'}")
print(f"Telegram admin chat id: {TELEGRAM_ADMIN_CHAT_ID}")
print(f"Telegram approval URL base: {BASE_URL}")


def is_public_http_url(url):
    try:
        parsed = urllib.parse.urlparse(url or '')
        if parsed.scheme not in ('http', 'https') or not parsed.netloc:
            return False
        host = (parsed.hostname or '').lower()
        if host in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
            return False
        return True
    except Exception:
        return False

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map)
    extensions_map['.js'] = 'application/javascript'
    extensions_map['.css'] = 'text/css'

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_text(self, text, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(text.encode('utf-8'))

    def parse_path(self):
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        return parsed.path, parse_qs(parsed.query)

    def do_GET(self):
        # API Routes
        request_path, query = self.parse_path()
        if request_path.startswith('/api/'):
            if request_path == '/api/users':
                return self.send_json(db.get_all_users())
            elif request_path == '/api/movies':
                return self.send_json(db.get_all_movies())
            elif request_path == '/api/transactions':
                return self.send_json(db.get_transactions())
            elif request_path == '/api/history':
                return self.send_json(db.get_watch_history())
            elif request_path == '/api/paid-movies':
                phone = query.get('phone', [''])[0]
                return self.send_json(db.get_paid_movies_for_phone(phone))
            elif request_path == '/api/pending-movies':
                phone = query.get('phone', [''])[0]
                return self.send_json(db.get_pending_movies_for_phone(phone))
            elif request_path == '/api/purchase-requests':
                return self.send_json(db.get_purchase_requests())
            elif request_path == '/api/purchase-status':
                req_id = query.get('request_id', [''])[0]
                req = db.get_purchase_request(req_id)
                return self.send_json(req or {'error': 'Not found'}, 404 if not req else 200)
            elif request_path == '/api/approve-purchase':
                request_id = query.get('request_id', [''])[0]
                secret = query.get('secret', [''])[0]
                if secret != TELEGRAM_APPROVAL_SECRET or not request_id:
                    self.send_text('<html><body><h1>Ошибка доступа</h1></body></html>', 403)
                    return
                approved = approve_purchase_request(request_id)
                if approved:
                    self.send_text(approve_page_html(request_id, True))
                else:
                    self.send_text(approve_page_html(request_id, False), 404)
                return
            else:
                return self.send_json({'error': 'Not Found'}, 404)
        
        # Поддержка Single Page Application для роутов /admin
        if self.path.startswith('/admin') and not '.' in self.path:
            self.path = '/admin/index.html'
        
        super().do_GET()

    def do_POST(self):
        request_path, _ = self.parse_path()
        if request_path.startswith('/api/'):
            data, uploaded_file = self.parse_post_payload()
            
            # API Post routing
            if request_path == '/api/users':
                user = db.create_user(data.get('name', ''), data.get('phone', ''), data.get('passwordHash', ''))
                return self.send_json(user)
            elif request_path == '/api/movies':
                res = db.save_movie(data)
                return self.send_json(res)
            elif request_path == '/api/movies/delete':
                res = db.delete_movie(data.get('id'))
                return self.send_json(res)
            elif request_path == '/api/purchase-request':
                movie_id = data.get('movieId')
                name = data.get('name', '')
                phone = data.get('phone', '')
                movie_title = data.get('movieTitle', '')
                if not movie_id or not phone:
                    return self.send_json({'error': 'movieId and phone are required'}, 400)
                if not uploaded_file:
                    return self.send_json({'error': 'receipt file is required'}, 400)
                receipt_path = None
                receipt_filename = None
                if uploaded_file:
                    receipt_path, receipt_filename = save_receipt_file(uploaded_file)
                purchase = db.create_purchase_request(movie_id, name, phone, movie_title, receipt_path, receipt_filename)
                if purchase:
                    print('Purchase request created:', purchase)
                    success = send_purchase_request_notification(purchase)
                    print('Telegram notification sent:', success)
                    return self.send_json({'requestId': purchase['id'], 'status': purchase['status']})
                print('Purchase request failed:', movie_id, name, phone, movie_title)
                return self.send_json({'error': 'Unable to create purchase request'}, 500)
            return self.send_json({'error': 'Not Found'}, 404)
        else:
            self.send_error(405, "Method Not Allowed")

    def parse_post_payload(self):
        content_type = self.headers.get('Content-Type', '')
        if content_type.startswith('multipart/form-data'):
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    'REQUEST_METHOD': 'POST',
                    'CONTENT_TYPE': content_type,
                },
            )
            data = {}
            for k in ('movieId', 'name', 'phone', 'movieTitle'):
                val = form.getvalue(k)
                if val is not None:
                    data[k] = val
            receipt_item = form['receipt'] if 'receipt' in form else None
            if isinstance(receipt_item, list):
                receipt_item = receipt_item[0] if receipt_item else None
            if receipt_item is not None and getattr(receipt_item, 'filename', None):
                return data, {
                    'filename': receipt_item.filename,
                    'content': receipt_item.file.read()
                }
            return data, None

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        data = {}
        if post_data:
            try:
                data = json.loads(post_data.decode('utf-8'))
            except Exception:
                data = {}
        return data, None

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def end_headers(self):
        if not self.path.startswith('/api/'):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()


def detect_telegram_admin_chat_id():
    global TELEGRAM_ADMIN_CHAT_ID
    if TELEGRAM_ADMIN_CHAT_ID:
        return TELEGRAM_ADMIN_CHAT_ID

    if not TELEGRAM_BOT_TOKEN:
        return None
    try:
        url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates'
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get('ok') and data.get('result'):
                for update in data['result']:
                    chat = None
                    if 'message' in update:
                        chat = update['message'].get('chat')
                    elif 'callback_query' in update:
                        chat = update['callback_query'].get('message', {}).get('chat')
                    if chat and chat.get('id'):
                        TELEGRAM_ADMIN_CHAT_ID = str(chat['id'])
                        return TELEGRAM_ADMIN_CHAT_ID
    except Exception:
        return None
    return None


def send_telegram_message(text, reply_markup=None):
    if not TELEGRAM_BOT_TOKEN:
        return False
    chat_id = detect_telegram_admin_chat_id()
    if not chat_id:
        return False
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    if reply_markup is not None:
        # For JSON requests, Telegram expects reply_markup as an object, not a JSON string.
        payload['reply_markup'] = reply_markup
    data = json.dumps(payload).encode('utf-8')
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result.get('ok', False)
    except HTTPError as e:
        details = ''
        try:
            details = e.read().decode('utf-8', errors='ignore')
        except Exception:
            details = ''
        print('Telegram send error:', e, details)
        return False
    except (URLError, Exception) as e:
        print('Telegram send error:', e)
        return False


def safe_filename(name):
    raw = os.path.basename(name or 'receipt')
    allowed = ''.join(ch if ch.isalnum() or ch in ('-', '_', '.') else '_' for ch in raw)
    return allowed[:120] or 'receipt'


def save_receipt_file(uploaded_file):
    os.makedirs(RECEIPTS_DIR, exist_ok=True)
    base_name = safe_filename(uploaded_file.get('filename'))
    ext = os.path.splitext(base_name)[1] or '.bin'
    stamp = str(time.time_ns())
    final_name = f'receipt_{stamp}{ext}'
    abs_path = os.path.join(RECEIPTS_DIR, final_name)
    with open(abs_path, 'wb') as f:
        f.write(uploaded_file.get('content') or b'')
    rel_path = f'uploads/receipts/{final_name}'
    return rel_path, base_name


def send_purchase_request_notification(request):
    movie_title = request.get('movieTitle') or 'Фильм'
    name = request.get('name') or 'Пользователь'
    phone = request.get('phone') or 'Номер не указан'
    request_id = request.get('id')
    receipt_path = request.get('receiptPath') or ''
    receipt_link = f'{BASE_URL}/{receipt_path.lstrip("/")}' if receipt_path else ''
    approval_url = f'{BASE_URL}/api/approve-purchase?request_id={request_id}&secret={urllib.parse.quote(TELEGRAM_APPROVAL_SECRET)}'
    text = (
        f'📌 <b>Новая заявка на оплату</b>\n'
        f'<b>Фильм:</b> {movie_title}\n'
        f'<b>Пользователь:</b> {name}\n'
        f'<b>Телефон:</b> {phone}\n'
        f'<b>Запрос ID:</b> {request_id}\n'
        f'<b>Чек:</b> {"прикреплен" if receipt_link else "не загружен"}\n\n'
        'Нажмите кнопку, чтобы одобрить доступ.'
    )
    if is_public_http_url(BASE_URL):
        buttons = [[{'text': 'Одобрить', 'url': approval_url}]]
        if receipt_link:
            buttons.append([{'text': 'Открыть чек', 'url': receipt_link}])
        reply_markup = {
            'inline_keyboard': buttons
        }
        return send_telegram_message(text, reply_markup)

    # Fallback for local development: send notification without button.
    text += (
        '\n\n⚠️ Кнопка одобрения отключена: BASE_URL должен быть публичным '
        '(например https://... через ngrok/cloudflared).'
    )
    return send_telegram_message(text)


def approve_purchase_request(request_id):
    request = db.get_purchase_request(request_id)
    if not request:
        return None
    if request.get('status') == 'approved':
        return request
    db.approve_purchase_request(request_id)
    return db.get_purchase_request(request_id)


def approve_page_html(request_id, approved):
    if approved:
        return f'<html><body><h1>Заявка #{request_id} одобрена</h1><p>Пользователь получил доступ к просмотру.</p></body></html>'
    return f'<html><body><h1>Заявка #{request_id} не найдена</h1></body></html>'

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    os.makedirs(RECEIPTS_DIR, exist_ok=True)
    db.init_db()
    with ThreadedHTTPServer(("", PORT), MyHttpRequestHandler) as httpd:
        print(f"* Сервер запущен на http://localhost:{PORT}/")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n* Сервер остановлен")
