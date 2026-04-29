import urllib.request
import urllib.error
import json

TOKEN = '8355752117:AAFkQ8iQF8xA-9psVQNgNbwDz7xPEYOqNWs'
CHAT = '5903042329'

url = f'https://api.telegram.org/bot{TOKEN}/sendMessage'
payload = {
    'chat_id': CHAT,
    'text': 'Тестовое сообщение от сервера Кино.ТҶ',
    'parse_mode': 'HTML'
}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        print(resp.read().decode('utf-8'))
except Exception as e:
    print('ERROR', e)
