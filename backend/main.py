import uvicorn
import os
import sys

# Add the current directory to sys.path so the 'app' module can be identified correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Start the server pointing to the modular app in app/main.py
    uvicorn.run("app.main:app", host="0.0.0.0", port=9099, reload=True)
