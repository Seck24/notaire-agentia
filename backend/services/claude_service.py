"""
claude_service.py — Extraction de données + génération d'actes via Claude
Modèle : claude-sonnet-4-20250514
"""

import os
import json
from anthropic import Anthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-sonnet-4-20250514"

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = Anthropic(api_key=ANTHROPIC_API_KEY)
    return _client


async def extraire_donnees(type_acte: str, form_data: dict) -> dict:
    """
    Extrait et structure les données du formulaire via Claude.
    Retourne un dict JSON propre avec les informations clés.
    """
    client = _get_client()

    prompt = f"""Tu es un assistant juridique spécialisé en droit notarial ivoirien.
Analyse les données suivantes issues d'un formulaire pour un acte de type : {type_acte}

Données du formulaire :
{json.dumps(form_data, ensure_ascii=False, indent=2)}

Extrais et structure toutes les informations pertinentes en JSON.
Identifie les parties (vendeur/acquéreur, donateur/donataire, etc.), le bien concerné,
les montants, dates, et toute condition particulière.
Si des informations semblent manquantes ou incohérentes, signale-les.

Réponds UNIQUEMENT avec le JSON structuré, sans texte autour."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()
    # Extraire le JSON même s'il est dans un bloc markdown
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    return json.loads(text)


async def generer_acte(
    type_acte: str,
    donnees_structurees: dict,
    contexte_rag: dict,
    cabinet_nom: str,
) -> str:
    """
    Génère un acte notarial complet via Claude avec contexte RAG.
    Retourne le texte de l'acte (format markdown-ish pour conversion Word).
    """
    client = _get_client()

    # Formater le contexte RAG
    rag_context = ""
    if contexte_rag.get("clauses"):
        rag_context += "## CLAUSES ET MODÈLES DE RÉFÉRENCE\n"
        for i, c in enumerate(contexte_rag["clauses"], 1):
            rag_context += f"\n--- Clause {i} ---\n{c}\n"

    if contexte_rag.get("obligations"):
        rag_context += "\n## OBLIGATIONS LÉGALES APPLICABLES\n"
        for i, o in enumerate(contexte_rag["obligations"], 1):
            rag_context += f"\n--- Obligation {i} ---\n{o}\n"

    if contexte_rag.get("tarifs"):
        rag_context += "\n## TARIFS ET HONORAIRES\n"
        for i, t in enumerate(contexte_rag["tarifs"], 1):
            rag_context += f"\n--- Tarif {i} ---\n{t}\n"

    system_prompt = f"""Tu es un expert en rédaction d'actes notariaux en Côte d'Ivoire.
Tu rédiges des actes conformes au droit ivoirien et aux Actes Uniformes OHADA.

RÈGLES DE RÉDACTION :
- Style notarial ivoirien formel et solennel
- Références légales précises (articles du Code Civil, OHADA, Code Foncier)
- Structure classique : comparution, exposé, stipulations, clauses, mentions légales
- Utilise le format markdown : ## pour les sections, ### pour les sous-sections
- Les informations manquantes doivent être marquées [À COMPLÉTER]
- Inclure les mentions légales obligatoires
- Le document est établi par : {cabinet_nom}

CONTEXTE JURIDIQUE (extrait de la base légale RAG) :
{rag_context if rag_context else "Aucun contexte RAG disponible — utilise tes connaissances du droit notarial ivoirien."}

TERMINE TOUJOURS par cette mention :
---
AVERTISSEMENT : Ce document est un DRAFT généré par intelligence artificielle.
Il doit être révisé et validé par le Notaire titulaire avant tout usage juridique."""

    user_prompt = f"""Rédige un acte notarial complet de type : {type_acte}

Données structurées :
{json.dumps(donnees_structurees, ensure_ascii=False, indent=2)}

Rédige l'acte complet, prêt à être converti en document Word."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return message.content[0].text
