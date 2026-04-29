import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.sqlite')

DEFAULT_MOVIES = [
    {"title":"The Silent Horizon", "rating":8.7, "image":"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80", "video":"https://www.w3schools.com/html/mov_bbb.mp4", "description":"Тайна глубокого космоса — экипаж получает сигнал из-за края вселенной и рискует всем ради разгадки.", "genre":"Sci-Fi", "year":2024, "duration":"2h 11m", "featured":1},
    {"title":"Crimson Night", "rating":8.1, "image":"https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80", "video":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "description":"Детектив под прикрытием охотится за криминальной империей в ночных неоновых улицах.", "genre":"Action", "year":2023, "duration":"1h 54m", "featured":0},
    {"title":"Echoes of Winter", "rating":7.9, "image":"https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1200&q=80", "video":"https://www.w3schools.com/html/movie.mp4", "description":"Молодая журналистка возвращается в снежную деревню, где давние тайны возвращаются к жизни.", "genre":"Drama", "year":2022, "duration":"2h 03m", "featured":0},
    {"title":"Velocity Run", "rating":8.3, "image":"https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=1200&q=80", "video":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", "description":"Бывший чемпион вынужден вернуться на трассу ради выполнения невозможной миссии.", "genre":"Action", "year":2024, "duration":"1h 48m", "featured":0},
    {"title":"Golden Tides", "rating":7.8, "image":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "video":"https://www.w3schools.com/html/mov_bbb.mp4", "description":"Двое братьев отправляются в прибрежное путешествие, чтобы найти семейное сокровище и примириться.", "genre":"Adventure", "year":2021, "duration":"2h 08m", "featured":0},
    {"title":"Midnight Protocol", "rating":8.5, "image":"https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80", "video":"https://www.w3schools.com/html/movie.mp4", "description":"Аналитик кибербезопасности вскрывает глобальный заговор — и сам становится следующей целью.", "genre":"Thriller", "year":2023, "duration":"1h 57m", "featured":0},
    {"title":"Moonlit Code", "rating":8.0, "image":"https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=1200&q=80", "video":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "description":"Гениальный программист и художница объединяются, чтобы разоблачить коррупцию внутри вирусной платформы.", "genre":"Sci-Fi", "year":2024, "duration":"2h 00m", "featured":0},
    {"title":"Last Frame", "rating":7.7, "image":"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80", "video":"https://www.w3schools.com/html/mov_bbb.mp4", "description":"Некогда знаменитый режиссёр получает последний шанс создать шедевр.", "genre":"Drama", "year":2020, "duration":"1h 50m", "featured":0},
    {"title":"Orbit 9", "rating":8.2, "image":"https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1200&q=80", "video":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", "description":"Ремонт заброшенной станции превращается в гонку со временем — экипаж понимает, что они не одни.", "genre":"Sci-Fi", "year":2022, "duration":"2h 06m", "featured":0},
    {"title":"Neon Dreams", "rating":8.4, "image":"https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80", "video":"https://www.w3schools.com/html/mov_bbb.mp4", "description":"В киберпанк-мире хакер проникает в корпорацию-гиганта, чтобы раскрыть опасную тайну.", "genre":"Sci-Fi", "year":2024, "duration":"2h 15m", "featured":0},
    {"title":"The Last Stand", "rating":8.6, "image":"https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1200&q=80", "video":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "description":"Бывший солдат принимает последний бой против неуловимого врага в горах.", "genre":"Action", "year":2023, "duration":"2h 02m", "featured":0},
    {"title":"Hearts in the Rain", "rating":7.5, "image":"https://images.unsplash.com/photo-1596565174898-0ad5601c14da?auto=format&fit=crop&w=1200&q=80", "video":"https://www.w3schools.com/html/movie.mp4", "description":"Двое незнакомцев встречаются под дождём в большом городе и находят неожиданную связь.", "genre":"Drama", "year":2024, "duration":"1h 52m", "featured":0}
]

def get_connection():
    # check_same_thread=False позволяет использовать одно подключение из разных потоков
    # timeout=10.0 спасает от ошибок "database is locked" при одновременной записи
    conn = sqlite3.connect(DB_PATH, timeout=10.0, check_same_thread=False)
    
    # Включаем WAL-режим (Write-Ahead Logging) - это самый подходящий режим для веб-приложений, 
    # он позволяет читать из БД без ожиданий даже во время записи, что полностью убирает "зависания".
    conn.execute('PRAGMA journal_mode=WAL;')
    conn.execute('PRAGMA synchronous=NORMAL;')
    conn.execute('PRAGMA busy_timeout=5000;')
    
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    
    # Таблица пользователей
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT UNIQUE,
            registeredAt TEXT,
            passwordHash TEXT
        )
    ''')
    
    # Таблица фильмов
    c.execute('''
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            genre TEXT,
            rating REAL,
            year INTEGER,
            duration TEXT,
            image TEXT,
            video TEXT,
            description TEXT,
            featured INTEGER DEFAULT 0
        )
    ''')
    
    # Таблица транзакций (покупок)
    c.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movieId INTEGER,
            phone TEXT,
            amount,
            date TEXT,
            FOREIGN KEY (movieId) REFERENCES movies(id)
        )
    ''')
    
    # Таблица истории просмотров
    c.execute('''
        CREATE TABLE IF NOT EXISTS watch_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movieId INTEGER,
            phone TEXT,
            kind TEXT,
            date TEXT,
            name TEXT,
            FOREIGN KEY (movieId) REFERENCES movies(id)
        )
    ''')

    # Таблица запросов на покупку
    c.execute('''
        CREATE TABLE IF NOT EXISTS purchase_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movieId INTEGER,
            movieTitle TEXT,
            name TEXT,
            phone TEXT,
            status TEXT DEFAULT 'pending',
            amount REAL DEFAULT 1,
            requestedAt TEXT,
            approvedAt TEXT,
            receiptPath TEXT,
            receiptFilename TEXT,
            FOREIGN KEY (movieId) REFERENCES movies(id)
        )
    ''')
    
    conn.commit()
    ensure_purchase_request_columns(conn)
    ensure_users_columns(conn)
    create_unique_movie_index(conn)
    conn.commit()
    conn.close()
    seed_default_movies()


def ensure_purchase_request_columns(conn):
    cols = conn.execute("PRAGMA table_info(purchase_requests)").fetchall()
    names = {c["name"] for c in cols}
    if "receiptPath" not in names:
        conn.execute("ALTER TABLE purchase_requests ADD COLUMN receiptPath TEXT")
    if "receiptFilename" not in names:
        conn.execute("ALTER TABLE purchase_requests ADD COLUMN receiptFilename TEXT")


def ensure_users_columns(conn):
    cols = conn.execute("PRAGMA table_info(users)").fetchall()
    names = {c["name"] for c in cols}
    if "passwordHash" not in names:
        conn.execute("ALTER TABLE users ADD COLUMN passwordHash TEXT")

def create_unique_movie_index(conn):
    conn.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_movies_title_year ON movies(title, year)')

def seed_default_movies():
    conn = get_connection()
    count = conn.execute('SELECT COUNT(*) AS cnt FROM movies').fetchone()['cnt']
    if count > 0:
        conn.close()
        return

    cur = conn.cursor()
    for movie in DEFAULT_MOVIES:
        cur.execute('''
            INSERT OR IGNORE INTO movies (title, genre, rating, year, duration, image, video, description, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            movie['title'], movie['genre'], movie['rating'], movie['year'], movie['duration'],
            movie['image'], movie['video'], movie['description'], movie['featured']
        ))
    conn.commit()
    conn.close()

# --- Вспомогательные функции для пользователей ---
def get_all_users():
    conn = get_connection()
    users = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    return [dict(u) for u in users]

def get_user_by_phone(phone):
    conn = get_connection()
    user = conn.execute('SELECT * FROM users WHERE phone = ?', (phone,)).fetchone()
    conn.close()
    return dict(user) if user else None

def create_user(name, phone, passwordHash=''):
    conn = get_connection()
    date_str = datetime.now().isoformat()
    try:
        conn.execute('INSERT INTO users (name, phone, registeredAt, passwordHash) VALUES (?, ?, ?, ?)', (name, phone, date_str, passwordHash))
        conn.commit()
    except sqlite3.IntegrityError:
        pass # Телефон уже существует
    finally:
        conn.close()
    return get_user_by_phone(phone)

# --- Вспомогательные функции для фильмов ---
def get_all_movies():
    conn = get_connection()
    movies = conn.execute('SELECT * FROM movies').fetchall()
    conn.close()
    res = [dict(m) for m in movies]
    for r in res:
        r['featured'] = bool(r['featured'])
    return res

def save_movie(data):
    conn = get_connection()
    movie_id = data.get('id')
    cur = conn.cursor()
    try:
        # Если передан id, обновляем
        if movie_id:
            cur.execute('''
                UPDATE movies SET title=?, genre=?, rating=?, year=?, duration=?, image=?, video=?, description=?
                WHERE id=?
            ''', (data.get('title'), data.get('genre'), data.get('rating',0), data.get('year'), 
                  data.get('duration'), data.get('image'), data.get('video'), data.get('description'), movie_id))
        else:
            # Иначе создаем
            cur.execute('''
                INSERT INTO movies (title, genre, rating, year, duration, image, video, description, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (data.get('title'), data.get('genre'), data.get('rating',0), data.get('year'), 
                  data.get('duration'), data.get('image'), data.get('video'), data.get('description'), 0))
            movie_id = cur.lastrowid
        conn.commit()
    except sqlite3.Error as e:
        conn.close()
        return {"error": str(e)}
    conn.close()
    return {"id": movie_id, "status": "success"}

def delete_movie(movie_id):
    conn = get_connection()
    conn.execute('DELETE FROM movies WHERE id=?', (movie_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

# --- Транзакции и история ---
def get_transactions():
    conn = get_connection()
    res = conn.execute('SELECT * FROM transactions').fetchall()
    conn.close()
    return [dict(x) for x in res]

def get_watch_history():
    conn = get_connection()
    res = conn.execute('SELECT * FROM watch_history').fetchall()
    conn.close()
    return [dict(x) for x in res]

# --- Покупки и запросы на оплату ---
def get_purchase_requests():
    conn = get_connection()
    res = conn.execute('SELECT * FROM purchase_requests').fetchall()
    conn.close()
    return [dict(x) for x in res]

def get_purchase_request(request_id):
    if not request_id:
        return None
    conn = get_connection()
    res = conn.execute('SELECT * FROM purchase_requests WHERE id = ?', (request_id,)).fetchone()
    conn.close()
    return dict(res) if res else None

def create_purchase_request(movie_id, name, phone, movie_title, receipt_path=None, receipt_filename=None):
    if not movie_id or not phone:
        return None
    conn = get_connection()
    now = datetime.now().isoformat()
    existing = conn.execute(
        '''
        SELECT id FROM purchase_requests
        WHERE movieId = ? AND phone = ? AND status = 'pending'
        ORDER BY id DESC
        LIMIT 1
        ''',
        (movie_id, phone)
    ).fetchone()

    if existing:
        conn.execute(
            '''
            UPDATE purchase_requests
            SET name = ?, movieTitle = ?, requestedAt = ?, receiptPath = ?, receiptFilename = ?
            WHERE id = ?
            ''',
            (name, movie_title, now, receipt_path, receipt_filename, existing["id"])
        )
        conn.commit()
        request_id = existing["id"]
        conn.close()
        return get_purchase_request(request_id)

    cur = conn.cursor()
    cur.execute('''
        INSERT INTO purchase_requests (movieId, movieTitle, name, phone, status, amount, requestedAt, receiptPath, receiptFilename)
        VALUES (?, ?, ?, ?, 'pending', 1, ?, ?, ?)
    ''', (movie_id, movie_title, name, phone, now, receipt_path, receipt_filename))
    conn.commit()
    request_id = cur.lastrowid
    conn.close()
    return get_purchase_request(request_id)

def approve_purchase_request(request_id):
    request = get_purchase_request(request_id)
    if not request or request.get('status') == 'approved':
        return request
    conn = get_connection()
    now = datetime.now().isoformat()
    conn.execute('UPDATE purchase_requests SET status = ?, approvedAt = ? WHERE id = ?', ('approved', now, request_id))
    conn.execute('INSERT INTO transactions (movieId, phone, amount, date) VALUES (?, ?, ?, ?)',
                 (request['movieId'], request['phone'], request.get('amount', 1), now))
    conn.execute('INSERT INTO watch_history (movieId, phone, kind, date, name) VALUES (?, ?, ?, ?, ?)',
                 (request['movieId'], request['phone'], 'approved', now, request.get('name', '')))
    conn.commit()
    conn.close()
    return get_purchase_request(request_id)

def get_paid_movies_for_phone(phone):
    if not phone:
        return []
    conn = get_connection()
    res = conn.execute('SELECT DISTINCT movieId FROM purchase_requests WHERE phone = ? AND status = ?', (phone, 'approved')).fetchall()
    conn.close()
    return [int(x['movieId']) for x in res]


def get_pending_movies_for_phone(phone):
    if not phone:
        return []
    conn = get_connection()
    rows = conn.execute(
        '''
        SELECT DISTINCT movieId
        FROM purchase_requests
        WHERE phone = ? AND status = 'pending'
        ''',
        (phone,)
    ).fetchall()
    conn.close()
    return [int(x['movieId']) for x in rows]

if __name__ == '__main__':
    init_db()
    print("База данных успешно инициализирована (database.sqlite)")
