"""
routes/dossier.py — POST /api/check-dossier
Vérifie la complétude des champs par type d'acte
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api")

# Champs obligatoires par type d'acte
CHAMPS_OBLIGATOIRES = {
    "vente_immobiliere": [
        "vendeur_nom", "vendeur_prenom", "vendeur_nationalite", "vendeur_adresse", "vendeur_cni",
        "acquereur_nom", "acquereur_prenom", "acquereur_nationalite", "acquereur_adresse", "acquereur_cni",
        "bien_ref_cadastrale", "bien_adresse", "bien_superficie", "bien_description",
        "prix", "modalites_paiement", "date_jouissance",
    ],
    "constitution_societe": [
        "denomination", "forme_juridique", "objet_social",
        "siege_social", "capital", "duree",
        "gerant_nom", "gerant_prenom", "gerant_nationalite",
        "associes",
    ],
    "succession": [
        "defunt_nom", "defunt_prenom", "date_deces", "lieu_deces", "regime_matrimonial",
        "heritiers",
        "actif_successoral",
    ],
    "donation": [
        "donateur_nom", "donateur_prenom", "donateur_date_naissance", "donateur_adresse",
        "donataire_nom", "donataire_prenom", "donataire_lien_parente",
        "bien_type", "bien_description", "bien_valeur",
    ],
    "ouverture_credit": [
        "preteur_nom", "preteur_adresse",
        "emprunteur_nom", "emprunteur_prenom", "emprunteur_adresse",
        "montant_credit", "taux_interet", "duree_mois",
        "garantie_type", "garantie_description",
    ],
}


class CheckDossierRequest(BaseModel):
    type_acte: str
    champs_remplis: list[str]


class CheckDossierResponse(BaseModel):
    complet: bool
    manquants: list[str]
    score: int


@router.post("/check-dossier", response_model=CheckDossierResponse)
async def route_check_dossier(payload: CheckDossierRequest):
    obligatoires = CHAMPS_OBLIGATOIRES.get(payload.type_acte, [])

    if not obligatoires:
        return CheckDossierResponse(complet=True, manquants=[], score=100)

    manquants = [c for c in obligatoires if c not in payload.champs_remplis]
    total = len(obligatoires)
    remplis = total - len(manquants)
    score = int((remplis / total) * 100) if total > 0 else 100

    return CheckDossierResponse(
        complet=len(manquants) == 0,
        manquants=manquants,
        score=score,
    )
