"""
routes/diagnostic.py — POST /api/diagnostic
Analyse du dossier avant génération : alertes critiques, points d'attention, complétude
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

# Champs obligatoires par type d'acte
CHAMPS_OBLIGATOIRES = {
    "vente_immobiliere": [
        "vendeur_nom", "vendeur_prenom", "vendeur_nationalite", "vendeur_adresse", "vendeur_cni",
        "acquereur_nom", "acquereur_prenom", "acquereur_nationalite", "acquereur_adresse", "acquereur_cni",
        "bien_ref_cadastrale", "bien_superficie", "bien_adresse", "bien_description",
        "prix", "modalites_paiement", "type_titre",
    ],
    "constitution_societe": [
        "denomination", "forme_juridique", "objet_social", "siege_social", "capital", "duree",
        "gerant_nom", "gerant_prenom", "gerant_nationalite",
    ],
    "succession": [
        "defunt_nom", "defunt_prenom", "date_deces", "lieu_deces", "regime_matrimonial",
    ],
    "donation": [
        "donateur_nom", "donateur_prenom", "donateur_date_naissance", "donateur_adresse",
        "donataire_nom", "donataire_prenom", "donataire_lien_parente", "donataire_adresse",
        "bien_type", "bien_description", "bien_valeur",
    ],
    "ouverture_credit": [
        "preteur_nom", "preteur_adresse",
        "emprunteur_nom", "emprunteur_prenom", "emprunteur_adresse",
        "montant_credit", "taux_interet", "duree_mois",
        "garantie_type", "garantie_description",
    ],
}


class DiagnosticRequest(BaseModel):
    type_acte: str
    form_data: dict
    cabinet_id: str | None = None


class AlerteItem(BaseModel):
    niveau: str
    message: str
    action: str


class DiagnosticResponse(BaseModel):
    alertes: list[AlerteItem]
    points: list[AlerteItem]
    completude: int
    champs_vides: list[str]


def _has_value(val) -> bool:
    if val is None or val == "" or val is False:
        return False
    if isinstance(val, list):
        return len(val) > 0 and any(
            any(v for v in item.values()) for item in val if isinstance(item, dict)
        )
    return True


@router.post("/diagnostic", response_model=DiagnosticResponse)
async def route_diagnostic(payload: DiagnosticRequest):
    fd = payload.form_data
    ta = payload.type_acte
    alertes = []
    points = []

    # ─── Règles vente immobilière ──────────────────
    if ta == "vente_immobiliere":
        if fd.get("hypotheques_existantes") in (True, "Oui", "oui"):
            alertes.append(AlerteItem(
                niveau="critique",
                message="Hypothèque existante détectée sur ce bien",
                action="Prévoir clause de purge ou mainlevée concomitante",
            ))
        if fd.get("servitudes") in (True, "Oui", "oui"):
            points.append(AlerteItem(
                niveau="attention",
                message="Servitudes déclarées sur le bien",
                action="Vérifier la nature des servitudes et les mentionner dans l'acte",
            ))
        if fd.get("vendeur_regime") == "Communaute reduite aux acquets":
            points.append(AlerteItem(
                niveau="attention",
                message="Vendeur sous régime de communauté",
                action="Consentement du conjoint obligatoire — faire comparaître",
            ))
        if fd.get("type_titre") == "ACD":
            points.append(AlerteItem(
                niveau="attention",
                message="Bien sous ACD — titre précaire",
                action="Clauses de sécurisation renforcées activées automatiquement",
            ))
        if fd.get("type_titre") == "Permis d'habiter":
            points.append(AlerteItem(
                niveau="attention",
                message="Permis d'habiter — titre provisoire",
                action="Prévoir conversion en titre foncier",
            ))
        prix = fd.get("prix")
        if prix and int(prix) > 100_000_000:
            points.append(AlerteItem(
                niveau="attention",
                message="Montant supérieur à 100M FCFA",
                action="Vérification anti-blanchiment renforcée recommandée",
            ))
        nat = fd.get("acquereur_nationalite")
        if nat and nat != "Ivoirienne":
            points.append(AlerteItem(
                niveau="attention",
                message="Acquéreur de nationalité étrangère",
                action="Vérifier les restrictions d'acquisition pour les non-nationaux",
            ))

    # ─── Règles constitution société ───────────────
    if ta == "constitution_societe":
        capital = fd.get("capital")
        forme = fd.get("forme_juridique")
        if capital:
            cap = int(capital)
            if cap < 1_000_000:
                points.append(AlerteItem(
                    niveau="attention",
                    message="Capital inférieur à 1.000.000 FCFA",
                    action="Pratique courante CI — à confirmer avec le notaire",
                ))
            if forme == "SA" and cap < 10_000_000:
                alertes.append(AlerteItem(
                    niveau="critique",
                    message="Capital SA minimum = 10.000.000 FCFA (OHADA)",
                    action="Augmenter le capital ou changer la forme juridique",
                ))
            if forme == "SAS" and cap < 1_000_000:
                alertes.append(AlerteItem(
                    niveau="critique",
                    message="Capital SAS minimum = 1.000.000 FCFA (OHADA)",
                    action="Augmenter le capital social",
                ))

    # ─── Règles succession ─────────────────────────
    if ta == "succession":
        if fd.get("regime_matrimonial") == "Communaute universelle":
            points.append(AlerteItem(
                niveau="attention",
                message="Régime de communauté universelle",
                action="Vérifier les clauses d'attribution intégrale au conjoint survivant",
            ))

    # ─── Règles donation ───────────────────────────
    if ta == "donation":
        if fd.get("reserve_hereditaire") in (True, "Oui"):
            points.append(AlerteItem(
                niveau="attention",
                message="Réserve héréditaire concernée",
                action="Vérifier que la donation ne dépasse pas la quotité disponible",
            ))
        valeur = fd.get("bien_valeur")
        if valeur and int(valeur) > 50_000_000:
            points.append(AlerteItem(
                niveau="attention",
                message="Donation de valeur importante (> 50M FCFA)",
                action="Droits de donation à calculer — vérifier l'exonération éventuelle",
            ))

    # ─── Règles ouverture crédit ───────────────────
    if ta == "ouverture_credit":
        taux = fd.get("taux_interet")
        if taux and float(taux) > 15:
            points.append(AlerteItem(
                niveau="attention",
                message="Taux d'intérêt élevé (> 15%)",
                action="Vérifier le respect du taux d'usure BCEAO",
            ))

    # ─── Particularités ────────────────────────────
    if fd.get("particularites", "").strip():
        points.append(AlerteItem(
            niveau="attention",
            message="Particularités signalées par l'utilisateur",
            action="Instructions spéciales prises en compte pour la génération",
        ))

    # ─── Complétude ────────────────────────────────
    champs = CHAMPS_OBLIGATOIRES.get(ta, [])
    champs_vides = [c for c in champs if not _has_value(fd.get(c))]
    total = len(champs)
    completude = round(((total - len(champs_vides)) / total) * 100) if total > 0 else 100

    return DiagnosticResponse(
        alertes=alertes,
        points=points,
        completude=completude,
        champs_vides=champs_vides,
    )
