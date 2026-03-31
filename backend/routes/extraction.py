"""
routes/extraction.py — POST /api/extraire-documents
Lit les documents uploadés, extrait les données, ne sauvegarde rien.
"""

import io
import json
import base64
import logging
from fastapi import APIRouter, UploadFile, File, Form
from anthropic import Anthropic
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

MODEL = "claude-sonnet-4-20250514"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Structure des champs à extraire par type d'acte
SCHEMAS_EXTRACTION = {
    "vente_immobiliere": {
        "vendeur": ["nom", "prenom", "nationalite", "cni", "regime"],
        "acheteur": ["nom", "prenom", "nationalite", "cni", "regime"],
        "bien": ["ref_tf", "superficie", "localisation"],
        "financier": ["prix", "modalite"],
    },
    "constitution_societe": {
        "societe": ["denomination", "forme_juridique", "objet_social", "siege_social", "capital", "duree"],
        "gerant": ["nom", "prenom", "nationalite", "cni"],
    },
    "succession": {
        "defunt": ["nom", "prenom", "date_deces", "lieu_deces", "situation"],
        "actif": ["biens_immo", "biens_mob", "comptes", "dettes"],
    },
    "donation": {
        "parties": ["donateur_nom", "donateur_prenom", "donateur_cni", "donataire_nom", "donataire_prenom", "donataire_cni", "lien_parente"],
        "bien": ["nature", "valeur", "description"],
    },
    "ouverture_credit": {
        "preteur": ["institution", "representant"],
        "emprunteur": ["nom", "prenom", "cni", "profession"],
        "credit": ["montant", "duree", "taux", "type_gar"],
        "garantie": ["description_gar", "ref_tf", "valeur_gar"],
    },
}


def lire_pdf(contenu: bytes) -> str:
    try:
        import pdfplumber
        texte = []
        with pdfplumber.open(io.BytesIO(contenu)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    texte.append(t)
        return "\n".join(texte)[:8000]
    except Exception as e:
        logger.warning(f"PDF non lisible: {e}")
        return ""


def extraire_via_vision(client, contenu: bytes, mime: str) -> str:
    """Extrait le texte d'une image via Claude Vision."""
    try:
        b64 = base64.standard_b64encode(contenu).decode("utf-8")
        response = client.messages.create(
            model=MODEL,
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": mime, "data": b64},
                    },
                    {
                        "type": "text",
                        "text": "Transcris tout le texte visible dans ce document. Inclus les noms, numéros, dates et montants."
                    }
                ]
            }]
        )
        return response.content[0].text[:4000]
    except Exception as e:
        logger.warning(f"Vision error: {e}")
        return ""


@router.post("/extraire-documents")
async def extraire_documents(
    files: list[UploadFile] = File(...),
    type_acte: str = Form(...)
):
    """
    Lit les documents uploadés, extrait les données via Claude.
    Ne sauvegarde rien sur disque ni en base.
    Retourne les champs extraits pour pré-remplissage du formulaire.
    """
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    schema = SCHEMAS_EXTRACTION.get(type_acte, {})

    # Extraction texte de chaque fichier
    textes = []
    for f in files:
        contenu = await f.read()
        nom = (f.filename or "").lower()

        if nom.endswith(".pdf"):
            texte = lire_pdf(contenu)
        elif nom.endswith((".jpg", ".jpeg")):
            texte = extraire_via_vision(client, contenu, "image/jpeg")
        elif nom.endswith(".png"):
            texte = extraire_via_vision(client, contenu, "image/png")
        elif nom.endswith((".txt", ".md")):
            try:
                texte = contenu.decode("utf-8")[:4000]
            except Exception:
                texte = contenu.decode("latin-1", errors="ignore")[:4000]
        else:
            texte = ""

        if texte.strip():
            textes.append(f"=== {f.filename} ===\n{texte}")

    if not textes:
        return {"champs": {}, "statut": "aucun_texte"}

    texte_global = "\n\n".join(textes)

    # Construire la description du schema cible
    schema_desc = json.dumps(schema, ensure_ascii=False, indent=2)

    prompt = f"""Tu es un assistant notarial expert en droit ivoirien.
Voici des documents d'un dossier notarial (acte de type : {type_acte}).

DOCUMENTS :
{texte_global}

SCHEMA À REMPLIR :
{schema_desc}

Extrais depuis les documents les informations correspondant exactement aux champs du schema.
- Retourne UNIQUEMENT un JSON valide correspondant au schema
- Pour les champs non trouvés, utilise null (pas de valeur inventée)
- Pour les montants, retourne uniquement le nombre sans espaces ni symboles
- Pour les dates, retourne au format YYYY-MM-DD si possible
- Ne réponds RIEN d'autre que le JSON

Exemple de réponse attendue :
{{"section1": {{"champ1": "valeur", "champ2": null}}, "section2": {{...}}}}"""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])
        champs = json.loads(text)
        # Filtrer les valeurs null
        champs_filtres = {
            section: {k: v for k, v in fields.items() if v is not None and v != ""}
            for section, fields in champs.items()
            if isinstance(fields, dict)
        }
        return {"champs": champs_filtres, "statut": "ok"}
    except Exception as e:
        logger.error(f"Extraction error: {e}")
        return {"champs": {}, "statut": "erreur"}
