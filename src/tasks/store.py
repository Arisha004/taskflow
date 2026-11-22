"""Each person's task list (GET and POST /api/tasks)."""

TASKS: dict[str, list[dict]] = {}  # email -> tasks
MAX_TITLE = 500  # long titles were being cut off


def list_for(email: str) -> list[dict]:
    return TASKS.get(email, [])


def add(email: str, data: dict) -> tuple[int, dict]:
    title = str(data.get("title") or "").strip()
    if not title:
        return 400, {"error": "A task needs a title"}
    tasks = TASKS.setdefault(email, [])
    task = {"id": len(tasks) + 1, "title": title[:MAX_TITLE]}
    tasks.append(task)
    return 201, task
