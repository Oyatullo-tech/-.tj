#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/admin' or self.path == '/admin/':
            self.path = '/admin/index.html'
        super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHttpRequestHandler) as httpd:
    print(f"✓ Сервер запущен на http://localhost:{PORT}/")
    print(f"✓ Откройте браузер и перейдите на http://localhost:{PORT}/")
    print(f"✓ Для остановки нажмите Ctrl+C")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Сервер остановлен")
