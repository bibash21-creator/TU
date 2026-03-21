import os

# Security Constants
ADMIN_USER = "admin"
ADMIN_PASS = "REDACTED"
ADMIN_TOKEN = "REDACTED"

# Base Directory Setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RESULTS_FILE = os.path.join(BASE_DIR, "results.toml")
