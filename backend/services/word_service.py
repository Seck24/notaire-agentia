"""
word_service.py — Appel à l'API Word existante (port 8001)
"""

import os
import httpx

WORD_API_URL = os.getenv("WORD_API_URL", "http://161.97.181.171:8001")


async def generer_word(type_acte: str, texte_acte: str, cabinet_nom: str) -> dict:
    """
    Appelle l'API Word existante pour convertir le texte en .docx
    Retourne { docx_base64, filename }
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{WORD_API_URL}/generate-word",
            json={
                "type_acte": type_acte,
                "texte_acte": texte_acte,
                "cabinet_nom": cabinet_nom,
            },
        )
        response.raise_for_status()
        return response.json()
