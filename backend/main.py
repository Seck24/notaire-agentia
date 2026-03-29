"""
main.py — Notariat Agent IA — API FastAPI
Remplace le workflow n8n par une API Python propre.
Port : 8002
"""

import logging
from dotenv import load_dotenv

# Charger le .env du projet parent (../env)
load_dotenv("../.env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.actes import router as actes_router
from routes.dossier import router as dossier_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

app = FastAPI(
    title="Notariat Agent IA — API",
    description="SaaS de génération d'actes notariaux par IA (Côte d'Ivoire / OHADA)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(actes_router)
app.include_router(dossier_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "notariat-agent-ia-backend"}
