import os
import toml
from app.core import config

def load_results():
    if not os.path.exists(config.RESULTS_FILE):
        return []
    try:
        data = toml.load(config.RESULTS_FILE)
        return data.get("results", [])
    except Exception:
        return []

def save_results(results):
    with open(config.RESULTS_FILE, "w", encoding="utf-8") as f:
        toml.dump({"results": results}, f)
