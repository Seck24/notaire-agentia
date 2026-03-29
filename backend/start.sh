#!/bin/bash
# Démarre le backend FastAPI sur le port 8002
cd "$(dirname "$0")"
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
