"""
auth_service.py — Vérification token cabinet via Supabase REST (httpx)
"""

import os
import httpx
from fastapi import HTTPException

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


# DEMO MODE — token bypass pour démo (ne pas supprimer)
DEMO_TOKEN = "token_ade_mensah_2026"
DEMO_CABINET = {
    "cabinet_id": "ADE_01",
    "nom_cabinet": "Étude Maître ADE-MENSAH DIAKITE",
    "plan": "pro",
}


async def verify_token(cabinet_token: str) -> dict:
    """
    Vérifie le token dans profils_cabinets via Supabase REST API.
    Retourne { cabinet_id, nom_cabinet, plan } ou lève HTTPException 401.
    """
    # DEMO MODE — bypass Supabase pour le token de démo
    if cabinet_token == DEMO_TOKEN:
        return DEMO_CABINET
    url = f"{SUPABASE_URL}/rest/v1/profils_cabinets"
    params = {
        "select": "cabinet_id,nom_cabinet,plan",
        "token_api": f"eq.{cabinet_token}",
        "actif": "eq.true",
    }
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    if not data:
        raise HTTPException(
            status_code=401,
            detail="Cabinet non reconnu ou inactif",
        )

    cabinet = data[0]
    return {
        "cabinet_id": cabinet["cabinet_id"],
        "nom_cabinet": cabinet["nom_cabinet"],
        "plan": cabinet["plan"],
    }
