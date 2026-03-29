"""
rag_service.py — Recherche sémantique RAG via pgvector (3 requêtes parallèles)
Embeddings : mistral-embed (1024 dimensions)
Appels Supabase via httpx (REST RPC)
"""

import os
import asyncio
import httpx
from mistralai.client import Mistral

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

_mistral = None


def _get_mistral():
    global _mistral
    if _mistral is None:
        _mistral = Mistral(api_key=MISTRAL_API_KEY)
    return _mistral


def _embed(text: str) -> list[float]:
    """Génère un embedding 1024-dim via mistral-embed."""
    client = _get_mistral()
    response = client.embeddings.create(
        model="mistral-embed",
        inputs=[text],
    )
    return response.data[0].embedding


async def _search_rag(query_text: str, tenant_ids: list[str], limit: int) -> list[dict]:
    """Appelle la fonction RPC recherche_rag() sur Supabase via REST."""
    loop = asyncio.get_event_loop()
    embedding = await loop.run_in_executor(None, _embed, query_text)

    url = f"{SUPABASE_URL}/rest/v1/rpc/recherche_rag"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "query_embedding": embedding,
        "match_count": limit,
        "filter_tenant": tenant_ids,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, json=body, headers=headers)
        resp.raise_for_status()
        return resp.json()


async def rechercher(cabinet_id: str, type_acte: str) -> dict:
    """
    Lance 3 recherches RAG en parallèle :
      1. Clauses modèles pour le type d'acte (limit=4)
      2. Obligations légales OHADA / Code Civil (limit=4)
      3. Tarifs et honoraires (limit=3)
    Retourne { clauses, obligations, tarifs } — chaque valeur est une liste de textes.
    """
    tenant_ids = ["commun", cabinet_id]

    clauses_raw, obligations_raw, tarifs_raw = await asyncio.gather(
        _search_rag(f"clauses modèles {type_acte}", tenant_ids, 4),
        _search_rag(f"obligations légales {type_acte} OHADA Code Civil", tenant_ids, 4),
        _search_rag(f"tarifs honoraires {type_acte}", tenant_ids, 3),
    )

    def extract_texts(rows):
        return [r["contenu"] for r in rows if r.get("contenu")]

    return {
        "clauses": extract_texts(clauses_raw),
        "obligations": extract_texts(obligations_raw),
        "tarifs": extract_texts(tarifs_raw),
    }
