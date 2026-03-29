"""
main.py — Notariat Agent IA — API FastAPI
Port : 8002
"""

import os
import logging
from dotenv import load_dotenv

# Charger .env en dev local (ignoré si les vars sont déjà injectées par Coolify)
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.actes import router as actes_router
from routes.dossier import router as dossier_router
from routes.conseil import router as conseil_router
from routes.diagnostic import router as diagnostic_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

app = FastAPI(
    title="Notariat Agent IA — API",
    description="SaaS de génération d'actes notariaux par IA (Côte d'Ivoire / OHADA)",
    version="1.0.0",
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://notaire-agentia.preo-ia.info,http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(actes_router)
app.include_router(dossier_router)
app.include_router(conseil_router)
app.include_router(diagnostic_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "notariat-agent-ia-backend"}
