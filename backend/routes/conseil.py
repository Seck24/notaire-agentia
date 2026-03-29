"""
routes/conseil.py — POST /api/conseil
Mode conseil juridique : question → réponse IA avec contexte RAG
"""

import json
import logging
from fastapi import APIRouter
from pydantic import BaseModel

from services.auth_service import verify_token
from services.claude_service import _get_client, MODEL
from services.rag_service import rechercher

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


class ConseilRequest(BaseModel):
    question: str
    cabinet_id: str


class ConseilResponse(BaseModel):
    reponse: str


@router.post("/conseil", response_model=ConseilResponse)
async def route_conseil(payload: ConseilRequest):
    # Recherche RAG contextuelle sur la question
    logger.info("Conseil : recherche RAG pour la question...")
    try:
        rag = await rechercher(payload.cabinet_id, payload.question)
        rag_context = ""
        for key in ("clauses", "obligations", "tarifs"):
            for text in rag.get(key, []):
                rag_context += f"\n{text}\n"
    except Exception:
        logger.warning("RAG indisponible, réponse sans contexte RAG")
        rag_context = ""

    # Appel Claude avec contexte
    client = _get_client()

    system_prompt = f"""Tu es un conseiller juridique expert en droit notarial ivoirien et en droit OHADA.
Tu réponds de manière claire, structurée et pédagogique aux questions de droit notarial.

RÈGLES :
- Cite les articles de loi pertinents (Code Civil CI, Actes Uniformes OHADA, Code Foncier)
- Structure ta réponse avec des sections claires
- Si la question concerne des montants ou des calculs, fournis des exemples chiffrés
- Ne donne JAMAIS de conseil définitif — rappelle toujours que seul le notaire peut valider
- Langue : français courant, accessible mais rigoureux

{"CONTEXTE JURIDIQUE (base documentaire) :" + rag_context if rag_context else ""}"""

    logger.info("Conseil : génération de la réponse (Claude)...")
    message = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=system_prompt,
        messages=[{"role": "user", "content": payload.question}],
    )

    return ConseilResponse(reponse=message.content[0].text)
