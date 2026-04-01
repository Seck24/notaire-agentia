"""
claude_service.py — Extraction de données + génération d'actes via Claude
Modèle : claude-sonnet-4-20250514
"""

import os
import re
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


def calculer_frais_vente(prix: float) -> dict:
    """
    Calcule les frais notariaux pour une vente immobilière
    selon le barème DGI CI officiel.
    """
    droits_enregistrement = prix * 0.07       # 7%
    taxe_publicite        = prix * 0.012      # 1,2%
    droit_fixe            = 3_000             # FCFA fixe
    frais_conservation    = 15_000            # FCFA fixe

    if prix <= 5_000_000:
        emoluments = prix * 0.05
    elif prix <= 20_000_000:
        emoluments = 5_000_000 * 0.05 + (prix - 5_000_000) * 0.03
    elif prix <= 50_000_000:
        emoluments = (5_000_000 * 0.05
                      + 15_000_000 * 0.03
                      + (prix - 20_000_000) * 0.02)
    else:
        emoluments = (5_000_000 * 0.05
                      + 15_000_000 * 0.03
                      + 30_000_000 * 0.02
                      + (prix - 50_000_000) * 0.01)

    debours = 75_000

    total = (droits_enregistrement + taxe_publicite
             + droit_fixe + frais_conservation
             + emoluments + debours)

    return {
        "droits_enregistrement": round(droits_enregistrement),
        "taxe_publicite":        round(taxe_publicite),
        "droit_fixe":            droit_fixe,
        "frais_conservation":    frais_conservation,
        "emoluments_notaire":    round(emoluments),
        "debours":               debours,
        "total":                 round(total),
        "ratio_prix":            round((total / prix) * 100, 2),
    }


def nettoyer_markdown(texte: str) -> str:
    """Supprime tous les artefacts markdown du texte généré par Claude."""
    texte = re.sub(r'^#{1,6}\s*', '', texte, flags=re.MULTILINE)
    texte = re.sub(r'\*\*(.*?)\*\*', r'\1', texte)
    texte = re.sub(r'\*(.*?)\*', r'\1', texte)
    texte = re.sub(r'^\|.*\|$', '', texte, flags=re.MULTILINE)
    texte = re.sub(r'^\|[-\s|]+\|$', '', texte, flags=re.MULTILINE)
    texte = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', texte)
    texte = re.sub(r'\n{3,}', '\n\n', texte)
    return texte.strip()


def remplacer_a_completer(texte: str) -> str:
    """Remplace tous les marqueurs [À COMPLÉTER] par des tirets."""
    patterns = [
        r'\[À COMPLÉTER[^\]]*\]',
        r'\[A COMPLETER[^\]]*\]',
        r'\[COMPLÉTER[^\]]*\]',
        r'\[RECTIFIER[^\]]*\]',
        r'\[À PRÉCISER[^\]]*\]',
        r'\[À VÉRIFIER[^\]]*\]',
    ]
    for pattern in patterns:
        texte = re.sub(pattern, '____', texte, flags=re.IGNORECASE)
    return texte


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
    Retourne le texte de l'acte propre (sans markdown, sans [À COMPLÉTER]).
    """
    client = _get_client()

    # Formater le contexte RAG
    rag_context = ""
    if contexte_rag.get("clauses"):
        rag_context += "CLAUSES ET MODÈLES DE RÉFÉRENCE\n"
        for i, c in enumerate(contexte_rag["clauses"], 1):
            rag_context += f"\n--- Clause {i} ---\n{c}\n"
    if contexte_rag.get("obligations"):
        rag_context += "\nOBLIGATIONS LÉGALES APPLICABLES\n"
        for i, o in enumerate(contexte_rag["obligations"], 1):
            rag_context += f"\n--- Obligation {i} ---\n{o}\n"
    if contexte_rag.get("tarifs"):
        rag_context += "\nTARIFS ET HONORAIRES\n"
        for i, t in enumerate(contexte_rag["tarifs"], 1):
            rag_context += f"\n--- Tarif {i} ---\n{t}\n"

    # Calcul des frais pour vente immobilière
    frais_section = ""
    if type_acte == "vente_immobiliere":
        try:
            prix_raw = (donnees_structurees.get("financier", {}).get("prix")
                        or donnees_structurees.get("prix"))
            if prix_raw:
                prix = float(str(prix_raw).replace(" ", "").replace("\u202f", ""))
                frais = calculer_frais_vente(prix)
                frais_section = f"""
FRAIS ET DROITS (barème DGI CI officiel) :
- Droits d'enregistrement (7%) : {frais['droits_enregistrement']:,} FCFA
- Taxe de publicité foncière (1,2%) : {frais['taxe_publicite']:,} FCFA
- Droit fixe : {frais['droit_fixe']:,} FCFA
- Frais Conservation Foncière : {frais['frais_conservation']:,} FCFA
- Émoluments notaire (barème tranches) : {frais['emoluments_notaire']:,} FCFA
- Débours estimés : {frais['debours']:,} FCFA
TOTAL FRAIS ET DROITS : {frais['total']:,} FCFA (soit {frais['ratio_prix']}% du prix)
"""
        except Exception:
            pass

    system_prompt = f"""Tu es un expert en rédaction d'actes notariaux en Côte d'Ivoire.
Tu rédiges des actes conformes au droit ivoirien et aux Actes Uniformes OHADA.

RÈGLES DE RÉDACTION :
- Style notarial ivoirien formel et solennel
- Références légales précises (articles du Code Civil, OHADA, Code Foncier)
- Structure classique : comparution, exposé, stipulations, clauses, mentions légales
- Le document est établi par : {cabinet_nom}
- ANNÉE EN COURS : 2026 — Toujours écrire "L'AN DEUX MILLE VINGT-SIX" et jamais "DEUX MILLE VINGT-QUATRE" ni "DEUX MILLE VINGT-CINQ"

RÈGLE ABSOLUE DE FORMATAGE :
- Ne jamais utiliser de symboles markdown dans l'acte :
  pas de ####, pas de ***, pas de --, pas de []
- Les titres d'articles s'écrivent : "ARTICLE 1 — TITRE" (avec tiret long em dash)
  pas "#### ARTICLE 1 — TITRE"
- Les listes utilisent le tiret simple suivi d'un espace : "-"
- Tout le texte doit être du français juridique pur sans aucun artefact markdown

RÈGLE ABSOLUE POUR LES CHAMPS MANQUANTS :
- Si une information n'est pas disponible, NE PAS écrire [À COMPLÉTER]
- À la place, utiliser des tirets de soulignement : ____
- Exemples : date manquante → "le ____" / nom manquant → "Monsieur/Madame ____"
- Exception : si une information critique est absente (ex: prix de vente), signaler
  en début de document : "INFORMATION MANQUANTE : [CHAMP] non fourni."

DROITS D'ENREGISTREMENT (vente immobilière) :
- Taux obligatoire DGI CI : 7% du prix de vente (JAMAIS 4%)
- Taxe publicité foncière : 1,2% du prix
- Toujours calculer et mentionner le détail des frais{frais_section}

CONTEXTE JURIDIQUE (base légale RAG) :
{rag_context if rag_context else "Utilise tes connaissances du droit notarial ivoirien."}

TERMINE TOUJOURS par :
---
AVERTISSEMENT : Ce document est un DRAFT généré par intelligence artificielle.
Il doit être révisé et validé par le Notaire titulaire avant tout usage juridique."""

    user_prompt = f"""Rédige un acte notarial complet de type : {type_acte}

Données structurées :
{json.dumps(donnees_structurees, ensure_ascii=False, indent=2)}

Rédige l'acte complet, prêt à être converti en document Word.
RAPPEL : Aucun symbole markdown. Utiliser ____ pour les champs manquants."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    texte = message.content[0].text
    texte = nettoyer_markdown(texte)
    texte = remplacer_a_completer(texte)
    return texte


async def generer_dnsv(
    donnees_structurees: dict,
    cabinet_nom: str,
) -> str:
    """
    Génère la DNSV (Déclaration Notariale de Souscription et de Versement)
    pour une constitution de SARL en Côte d'Ivoire.
    """
    client = _get_client()

    societe = donnees_structurees.get("societe", donnees_structurees)
    denomination = societe.get("denomination", "____")
    capital = societe.get("capital", "____")
    banque = societe.get("numero_compte", "____")

    system_prompt = f"""Tu es un notaire expert en droit des sociétés ivoirien.
Rédige une DNSV (Déclaration Notariale de Souscription et de Versement)
conforme au droit OHADA et ivoirien pour une SARL en constitution.

RÈGLE ABSOLUE DE FORMATAGE :
- Aucun symbole markdown (pas de #, **, *, |)
- Titres : "SECTION 1 — TITRE" uniquement
- Champs manquants : ____ (jamais [À COMPLÉTER])
- Français juridique formel pur
- ANNÉE EN COURS : 2026 — Écrire "L'AN DEUX MILLE VINGT-SIX" exclusivement

Le document est établi par : {cabinet_nom}"""

    user_prompt = f"""Rédige la DNSV complète pour la société suivante :

{json.dumps(donnees_structurees, ensure_ascii=False, indent=2)}

Structure obligatoire :
1. En-tête : DÉCLARATION NOTARIALE DE SOUSCRIPTION ET DE VERSEMENT
2. Identification du notaire soussigné ({cabinet_nom})
3. Certifie que les associés fondateurs ont souscrit et versé le capital de {capital} FCFA
4. Tableau des associés : Nom | Parts | Montant FCFA | %
5. Mention du dépôt des fonds auprès de la banque
6. Condition de déblocage : sur présentation de l'extrait RCCM
7. Date, lieu, signature du notaire
8. Avertissement DRAFT

RAPPEL : Aucun symbole markdown. ____ pour les champs manquants."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    texte = message.content[0].text
    texte = nettoyer_markdown(texte)
    texte = remplacer_a_completer(texte)
    return texte
