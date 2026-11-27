"""TaskFlow: the task manager for small teams. It needs nothing but Python 3.10 or newer.

    python server.py           http://127.0.0.1:4000
    python server.py 4100      another port

Pages are in site/, the logic is in src/, and the tests the QA team keeps are in tests/.
Everything is kept in memory, so a restart starts empty.
"""
import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from src.auth import login
from src.contact import messages
from src.pricing import plans
from src.profile import profile
from src.tasks import store

SITE = Path(__file__).resolve().parent / "site"
PAGES = {  # path: (title, page file, show the footer)
    "/": ("TaskFlow: the task manager for small teams", "home", True),
    "/pricing": ("Pricing | TaskFlow", "pricing", True),
    "/docs": ("Documentation | TaskFlow", "docs", True),
    "/contact": ("Contact | TaskFlow", "contact", True),
    "/signin": ("Sign in | TaskFlow", "signin", False),
    "/app": ("Your tasks | TaskFlow", "app", False),
    "/profile": ("Your profile | TaskFlow", "profile", False),
}


def page_file(name: str) -> Path:
    return SITE / "pages" / f"{name}.html"


def render(path: str | None) -> str:
    """One page inside the shared layout. A page whose file is not there yet is not live, so it answers 404."""
    title, name, footer = PAGES[path] if path else ("Page not found | TaskFlow", "notfound", True)
    docs = '<a href="/docs">Docs</a>' if page_file("docs").exists() else ""
    body = page_file(name).read_text(encoding="utf-8").replace("{{features}}", json.dumps(plans.FEATURES))
    foot = (SITE / "footer.html").read_text(encoding="utf-8").replace("{{docs_link}}", docs) if footer else ""
    html = (SITE / "layout.html").read_text(encoding="utf-8")
    for key, value in (("title", title), ("body_class", ""), ("docs_link", docs), ("footer", foot), ("body", body)):
        html = html.replace("{{" + key + "}}", value)
    return html


class Site(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def send(self, code: int, body, kind: str = "application/json") -> None:
        data = body.encode() if isinstance(body, str) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", kind + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def body(self) -> dict:
        try:
            data = json.loads(self.rfile.read(min(int(self.headers.get("Content-Length") or 0), 10_000)) or b"{}")
            return data if isinstance(data, dict) else {}
        except ValueError:
            return {}

    def do_GET(self):
        try:
            self.route_get(self.path.split("?")[0])
        except Exception as exc:  # a bug answers 500 with the reason, like most web frameworks
            self.send(500, {"error": f"{type(exc).__name__}: {exc}"})

    def do_POST(self):
        try:
            self.route_post(self.path.split("?")[0], self.body())
        except Exception as exc:
            self.send(500, {"error": f"{type(exc).__name__}: {exc}"})

    def route_get(self, path: str) -> None:
        if path in PAGES and page_file(PAGES[path][1]).exists():
            self.send(200, render(path), "text/html")
        elif path == "/assets/site.css":
            self.send(200, (SITE / "site.css").read_text(encoding="utf-8"), "text/css")
        elif path == "/health":
            self.send(200, {"ok": True})
        elif path == "/api/plans":
            self.send(200, plans.all_plans())
        elif path == "/api/tasks":
            email = login.user_for(self.headers.get("Authorization"))
            self.send(200, store.list_for(email)) if email else self.send(401, {"error": "Sign in first"})
        elif path == "/api/profile":
            email = login.user_for(self.headers.get("Authorization"))
            self.send(200, profile.for_user(email)) if email else self.send(401, {"error": "Sign in first"})
        elif path.startswith("/api/") or path.startswith("/assets/"):
            self.send(404, {"error": "Not found"})
        else:
            self.send(404, render(None), "text/html")

    def route_post(self, path: str, data: dict) -> None:
        if path == "/api/contact":
            self.send(*messages.send(data))
        elif path == "/api/auth/login":
            self.send(*login.login(data))
        elif path == "/api/tasks":
            email = login.user_for(self.headers.get("Authorization"))
            self.send(*store.add(email, data)) if email else self.send(401, {"error": "Sign in first"})
        else:
            self.send(404, {"error": "Not found"})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4000
    print(f"TaskFlow on http://127.0.0.1:{port}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), Site).serve_forever()
