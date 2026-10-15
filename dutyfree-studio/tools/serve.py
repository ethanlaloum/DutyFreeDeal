"""Local preview server for DutyFreeDeal Studio: static files, no caching, bound to 127.0.0.1.

Usage (from dutyfree-studio/): python3 tools/serve.py   ->  http://127.0.0.1:4182/
Set PORT to use another port.
"""
import functools
import http.server
import os

PORT = int(os.environ.get("PORT", "4182"))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as server:
        print(f"DutyFreeDeal Studio: http://127.0.0.1:{PORT}/  (Ctrl+C to stop)")
        server.serve_forever()
