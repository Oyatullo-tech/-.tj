import database as db
import json

db.init_db()

try:
    print(db.save_movie({'title': 'Duplicate', 'genre': 'Action', 'year': 2024}))
    print(db.save_movie({'title': 'Duplicate', 'genre': 'Action', 'year': 2024}))
except Exception as e:
    print("Exception thrown:", e)
