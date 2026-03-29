// Champs obligatoires par type d'acte
const CHAMPS_OBLIGATOIRES = {
  vente_immobiliere: [
    'vendeur_nom', 'vendeur_prenom', 'vendeur_nationalite', 'vendeur_adresse', 'vendeur_cni',
    'acquereur_nom', 'acquereur_prenom', 'acquereur_nationalite', 'acquereur_adresse', 'acquereur_cni',
    'bien_ref_cadastrale', 'bien_superficie', 'bien_adresse', 'bien_description',
    'prix', 'modalites_paiement', 'type_titre',
  ],
  constitution_societe: [
    'denomination', 'forme_juridique', 'objet_social', 'siege_social', 'capital', 'duree',
    'gerant_nom', 'gerant_prenom', 'gerant_nationalite',
  ],
  succession: [
    'defunt_nom', 'defunt_prenom', 'date_deces', 'lieu_deces', 'regime_matrimonial',
  ],
  donation: [
    'donateur_nom', 'donateur_prenom', 'donateur_date_naissance', 'donateur_adresse',
    'donataire_nom', 'donataire_prenom', 'donataire_lien_parente', 'donataire_adresse',
    'bien_type', 'bien_description', 'bien_valeur',
  ],
  ouverture_credit: [
    'preteur_nom', 'preteur_adresse',
    'emprunteur_nom', 'emprunteur_prenom', 'emprunteur_adresse',
    'montant_credit', 'taux_interet', 'duree_mois',
    'garantie_type', 'garantie_description',
  ],
}

function hasValue(val) {
  if (val === null || val === undefined || val === '' || val === false) return false
  if (Array.isArray(val)) return val.length > 0 && val.some(item => Object.values(item).some(x => x))
  return true
}

export function getChampsObligatoires(typeActe) {
  return CHAMPS_OBLIGATOIRES[typeActe] || []
}

export function calculerCompletude(typeActe, formData) {
  const champs = getChampsObligatoires(typeActe)
  if (champs.length === 0) return { completude: 100, champsVides: [], champsRemplis: [] }

  const champsVides = champs.filter(c => !hasValue(formData[c]))
  const champsRemplis = champs.filter(c => hasValue(formData[c]))
  const completude = Math.round((champsRemplis.length / champs.length) * 100)

  return { completude, champsVides, champsRemplis }
}

export function diagnostiquerDossier(typeActe, formData) {
  const alertes = []
  const points = []

  // ─── Regles vente immobiliere ──────────────────
  if (typeActe === 'vente_immobiliere') {
    if (formData.hypotheques_existantes === true || formData.hypotheques_existantes === 'Oui') {
      alertes.push({
        niveau: 'critique',
        message: 'Hypotheque existante detectee sur ce bien',
        action: 'Prevoir clause de purge ou mainlevee concomitante',
      })
    }
    if (formData.servitudes === true) {
      points.push({
        niveau: 'attention',
        message: 'Servitudes declarees sur le bien',
        action: 'Verifier la nature des servitudes et les mentionner dans l\'acte',
      })
    }
    if (formData.vendeur_regime === 'Communaute reduite aux acquets') {
      points.push({
        niveau: 'attention',
        message: 'Vendeur sous regime de communaute',
        action: 'Consentement du conjoint obligatoire — faire comparaitre',
      })
    }
    if (formData.type_titre === 'ACD') {
      points.push({
        niveau: 'attention',
        message: 'Bien sous ACD — titre precaire',
        action: 'Clauses de securisation renforcees activees automatiquement',
      })
    }
    if (formData.type_titre === 'Permis d\'habiter') {
      points.push({
        niveau: 'attention',
        message: 'Permis d\'habiter — titre provisoire',
        action: 'Prevoir conversion en titre foncier',
      })
    }
    if (formData.prix && parseInt(formData.prix) > 100000000) {
      points.push({
        niveau: 'attention',
        message: 'Montant superieur a 100M FCFA',
        action: 'Verification anti-blanchiment renforcee recommandee',
      })
    }
    if (formData.acquereur_nationalite && formData.acquereur_nationalite !== 'Ivoirienne') {
      points.push({
        niveau: 'attention',
        message: 'Acquereur de nationalite etrangere',
        action: 'Verifier les restrictions d\'acquisition pour les non-nationaux',
      })
    }
  }

  // ─── Regles constitution societe ───────────────
  if (typeActe === 'constitution_societe') {
    if (formData.capital && parseInt(formData.capital) < 1000000) {
      points.push({
        niveau: 'attention',
        message: 'Capital inferieur a 1.000.000 FCFA',
        action: 'Pratique courante CI — a confirmer avec le notaire',
      })
    }
    if (formData.forme_juridique === 'SA' && formData.capital && parseInt(formData.capital) < 10000000) {
      alertes.push({
        niveau: 'critique',
        message: 'Capital SA minimum = 10.000.000 FCFA (OHADA)',
        action: 'Augmenter le capital ou changer la forme juridique',
      })
    }
    if (formData.forme_juridique === 'SAS' && formData.capital && parseInt(formData.capital) < 1000000) {
      alertes.push({
        niveau: 'critique',
        message: 'Capital SAS minimum = 1.000.000 FCFA (OHADA)',
        action: 'Augmenter le capital social',
      })
    }
  }

  // ─── Regles succession ─────────────────────────
  if (typeActe === 'succession') {
    if (formData.regime_matrimonial === 'Communaute universelle') {
      points.push({
        niveau: 'attention',
        message: 'Regime de communaute universelle',
        action: 'Verifier les clauses d\'attribution integrale au conjoint survivant',
      })
    }
  }

  // ─── Regles donation ───────────────────────────
  if (typeActe === 'donation') {
    if (formData.reserve_hereditaire === true) {
      points.push({
        niveau: 'attention',
        message: 'Reserve hereditaire concernee',
        action: 'Verifier que la donation ne depasse pas la quotite disponible',
      })
    }
    if (formData.bien_valeur && parseInt(formData.bien_valeur) > 50000000) {
      points.push({
        niveau: 'attention',
        message: 'Donation de valeur importante (> 50M FCFA)',
        action: 'Droits de donation a calculer — verifier l\'exoneration eventuelle',
      })
    }
  }

  // ─── Regles ouverture credit ───────────────────
  if (typeActe === 'ouverture_credit') {
    if (formData.taux_interet && parseFloat(formData.taux_interet) > 15) {
      points.push({
        niveau: 'attention',
        message: 'Taux d\'interet eleve (> 15%)',
        action: 'Verifier le respect du taux d\'usure BCEAO',
      })
    }
  }

  // ─── Particularites ────────────────────────────
  if (formData.particularites && formData.particularites.trim()) {
    points.push({
      niveau: 'attention',
      message: 'Particularites signalees par l\'utilisateur',
      action: 'Instructions speciales prises en compte pour la generation',
    })
  }

  // ─── Completude ────────────────────────────────
  const { completude, champsVides } = calculerCompletude(typeActe, formData)

  return { alertes, points, completude, champsVides }
}
