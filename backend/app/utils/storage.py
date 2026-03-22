import os
import toml
from app.core.config import settings

def load_results():
    if not os.path.exists(settings.RESULTS_FILE):
        return []
    try:
        data = toml.load(settings.RESULTS_FILE)
        return data.get("results", [])
    except Exception:
        return []

def save_results(results):
    with open(settings.RESULTS_FILE, "w", encoding="utf-8") as f:
        toml.dump({"results": results}, f)
