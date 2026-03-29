#!/bin/bash
cd "$(dirname "$0")"
pip install -r requirements_api.txt
uvicorn generate_word:app --host 0.0.0.0 --port 8001
