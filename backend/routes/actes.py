"""
routes/actes.py — POST /api/generer-acte
Pipeline complet : auth → extraction → RAG → génération → Word
"""

import io
import base64
import zipfile
import logging
from fastapi import APIRouter
from pydantic import BaseModel

from services.auth_service import verify_token
from services.claude_service import extraire_donnees, generer_acte, generer_dnsv
from services.rag_service import rechercher
from services.word_service import generer_word

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


class VerifyTokenRequest(BaseModel):
    token: str


@router.post("/verify-token")
async def route_verify_token(payload: VerifyTokenRequest):
    cabinet = await verify_token(payload.token)
    return cabinet


class GenererActeRequest(BaseModel):
    type_acte: str
    form_data: dict
    cabinet_token: str


class GenererActeResponse(BaseModel):
    success: bool
    filename: str | None = None
    docx_base64: str | None = None
    avertissement: str | None = None
    error: str | None = None


@router.post("/generer-acte", response_model=GenererActeResponse)
async def route_generer_acte(payload: GenererActeRequest):
    # 1. Vérification du token cabinet
    logger.info("Étape 1/5 : Vérification du cabinet...")
    cabinet = await verify_token(payload.cabinet_token)

    # 2. Extraction des données structurées via Claude
    logger.info("Étape 2/5 : Extraction des données (Claude)...")
    donnees = await extraire_donnees(payload.type_acte, payload.form_data)

    # 3. Recherche RAG
    logger.info("Étape 3/5 : Consultation base juridique (RAG)...")
    contexte_rag = await rechercher(cabinet["cabinet_id"], payload.type_acte)

    # 4. Génération de l'acte via Claude + contexte RAG
    logger.info("Étape 4/5 : Rédaction de l'acte (Claude)...")
    texte_acte = await generer_acte(
        payload.type_acte,
        donnees,
        contexte_rag,
        cabinet["nom_cabinet"],
    )

    # 5. Conversion en document Word
    logger.info("Étape 5/5 : Génération du document Word...")
    word_result = await generer_word(
        payload.type_acte,
        texte_acte,
        cabinet["nom_cabinet"],
    )

    # Cas spécial : constitution de société → ZIP (statuts + DNSV)
    if payload.type_acte == "constitution_societe":
        logger.info("Constitution société : génération DNSV + ZIP...")
        texte_dnsv = await generer_dnsv(donnees, cabinet["nom_cabinet"])
        dnsv_result = await generer_word("dnsv", texte_dnsv, cabinet["nom_cabinet"])

        # Nom de la société pour les fichiers
        nom_societe = (
            donnees.get("societe", {}).get("denomination", "societe")
            .replace(" ", "_").replace("/", "_")[:40]
        )

        statuts_bytes = base64.b64decode(word_result["docx_base64"])
        dnsv_bytes = base64.b64decode(dnsv_result["docx_base64"])

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr(f"statuts_sarl_{nom_societe}.docx", statuts_bytes)
            zf.writestr(f"dnsv_{nom_societe}.docx", dnsv_bytes)
        zip_buffer.seek(0)

        zip_b64 = base64.b64encode(zip_buffer.getvalue()).decode("utf-8")

        return GenererActeResponse(
            success=True,
            filename=f"constitution_{nom_societe}.zip",
            docx_base64=zip_b64,
            avertissement="Ce dossier contient 2 documents : les Statuts SARL et la DNSV. "
            "Ces documents sont des DRAFTs générés par IA — à réviser par le Notaire.",
        )

    return GenererActeResponse(
        success=True,
        filename=word_result["filename"],
        docx_base64=word_result["docx_base64"],
        avertissement="Ce document est un DRAFT généré par IA. "
        "Il doit être révisé et validé par le Notaire titulaire avant tout usage juridique.",
    )
