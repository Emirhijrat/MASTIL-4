#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = "dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        print(f"Request: {self.command} {self.path}")
        super().log_message(format, *args)

print(f"Server running at http://localhost:{PORT}/")
print(f"Serving files from: {os.path.join(os.getcwd(), DIRECTORY)}")
print("Press Ctrl+C to stop the server")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.") 