export const SCHEMAS = {
  vente_immobiliere: {
    label: "Acte de Vente Immobiliere",
    icone: "Home",
    couleur: "#8B6914",
    sections: [
      {
        id: "date_acte", label: "Date de l'acte",
        fields: [
          { id: "date_acte", label: "Date de rédaction de l'acte", type: "date", required: true }
        ]
      },
      {
        id: "vendeur", label: "Vendeur", repetable: false,
        fields: [
          { id: "nom", label: "Nom", type: "text", required: true, placeholder: "Ex: KOUAME" },
          { id: "prenom", label: "Prenom", type: "text", required: true, placeholder: "Ex: Jean-Baptiste" },
          { id: "nationalite", label: "Nationalite", type: "select", options: ["Ivoirienne","Francaise","Autre"] },
          { id: "cni", label: "N. CNI", type: "text", required: true, placeholder: "Ex: CI0123456789" },
          { id: "regime", label: "Regime matrimonial", type: "select", options: ["Celibataire","Communaute reduite aux acquets","Separation de biens","Polygamie"] }
        ]
      },
      {
        id: "acheteur", label: "Acheteur", repetable: false,
        fields: [
          { id: "nom", label: "Nom", type: "text", required: true },
          { id: "prenom", label: "Prenom", type: "text", required: true },
          { id: "nationalite", label: "Nationalite", type: "select", options: ["Ivoirienne","Francaise","Autre"] },
          { id: "cni", label: "N. CNI", type: "text", required: true },
          { id: "regime", label: "Regime matrimonial", type: "select", options: ["Celibataire","Communaute reduite aux acquets","Separation de biens","Polygamie"] }
        ]
      },
      {
        id: "bien", label: "Bien Immobilier",
        fields: [
          { id: "ref_tf", label: "Reference Titre Foncier", type: "text", required: true, placeholder: "Ex: TF N.12345/CI" },
          { id: "superficie", label: "Superficie (m2)", type: "number" },
          { id: "localisation", label: "Localisation / Commune", type: "text", required: true },
          { id: "cert_geo", label: "Certificat de localisation", type: "text" }
        ]
      },
      {
        id: "financier", label: "Informations Financieres",
        fields: [
          { id: "prix", label: "Prix de vente (FCFA)", type: "number", required: true },
          { id: "modalite", label: "Modalite de paiement", type: "select", options: ["Comptant","Echelonne","Credit bancaire"] },
          { id: "situation_fisc", label: "Situation fiscale", type: "select", options: ["A jour","En cours de regularisation"] }
        ]
      }
    ],
    documents_requis: [
      { id: "cni_vendeur", label: "CNI Vendeur", required: true },
      { id: "cni_acheteur", label: "CNI Acheteur", required: true },
      { id: "titre_foncier", label: "Titre Foncier (original)", required: true },
      { id: "cert_loc", label: "Certificat de localisation", required: false },
      { id: "attest_fisc", label: "Attestation fiscale", required: true },
      { id: "acte_mariage", label: "Acte de mariage (si marie)", required: false }
    ]
  },
  constitution_societe: {
    label: "Constitution de Societe",
    icone: "Building2",
    couleur: "#2D6A4F",
    sections: [
      {
        id: "date_acte", label: "Date de l'acte",
        fields: [
          { id: "date_acte", label: "Date de rédaction de l'acte", type: "date", required: true }
        ]
      },
      {
        id: "societe", label: "La Societe",
        fields: [
          { id: "denomination", label: "Denomination sociale", type: "text", required: true },
          { id: "forme_juridique", label: "Forme juridique", type: "select", required: true, options: ["SARL","SAS","SA","SNC","GIE"] },
          { id: "objet_social", label: "Objet social", type: "textarea", required: true },
          { id: "siege_social", label: "Siege social", type: "text", required: true },
          { id: "capital", label: "Capital social (FCFA)", type: "number", required: true },
          { id: "duree", label: "Duree (annees)", type: "number", placeholder: "99" }
        ]
      },
      {
        id: "gerant", label: "Gerant / Directeur General",
        fields: [
          { id: "nom", label: "Nom", type: "text", required: true },
          { id: "prenom", label: "Prenom", type: "text", required: true },
          { id: "nationalite", label: "Nationalite", type: "select", options: ["Ivoirienne","Francaise","Autre"] },
          { id: "cni", label: "N. CNI", type: "text", required: true }
        ]
      },
      {
        id: "associes", label: "Associes", repetable: true, repetable_label: "Ajouter un associe", min: 1,
        fields: [
          { id: "nom", label: "Nom", type: "text", required: true },
          { id: "prenom", label: "Prenom", type: "text", required: true },
          { id: "apport", label: "Apport (FCFA)", type: "number", required: true },
          { id: "parts", label: "Nombre de parts", type: "number", required: true }
        ]
      }
    ],
    documents_requis: [
      { id: "cni_gerant", label: "CNI Gerant", required: true },
      { id: "cni_associes", label: "CNI Associes", required: true },
      { id: "bail", label: "Contrat de bail / siege", required: true },
      { id: "plan_local", label: "Plan de localisation", required: false },
      { id: "casier", label: "Casier judiciaire gerant", required: true }
    ]
  },
  succession: {
    label: "Succession",
    icone: "Users",
    couleur: "#6B4C8B",
    sections: [
      {
        id: "date_acte", label: "Date de l'acte",
        fields: [
          { id: "date_acte", label: "Date de rédaction de l'acte", type: "date", required: true }
        ]
      },
      {
        id: "defunt", label: "Le Defunt",
        fields: [
          { id: "nom", label: "Nom", type: "text", required: true },
          { id: "prenom", label: "Prenom", type: "text", required: true },
          { id: "date_deces", label: "Date de deces", type: "date", required: true },
          { id: "lieu_deces", label: "Lieu de deces", type: "text", required: true },
          { id: "situation", label: "Situation matrimoniale", type: "select", options: ["Marie(e)","Celibataire","Divorce(e)","Veuf/Veuve"] }
        ]
      },
      {
        id: "heritiers", label: "Heritiers", repetable: true, repetable_label: "Ajouter un heritier", min: 1,
        fields: [
          { id: "nom", label: "Nom", type: "text", required: true },
          { id: "prenom", label: "Prenom", type: "text", required: true },
          { id: "lien", label: "Lien de parente", type: "select", options: ["Conjoint(e)","Fils/Fille","Pere/Mere","Frere/Soeur","Autre"] },
          { id: "cni", label: "N. CNI", type: "text", required: true }
        ]
      },
      {
        id: "actif", label: "Actif Successoral",
        fields: [
          { id: "biens_immo", label: "Biens immobiliers", type: "textarea", placeholder: "Lister les biens avec references TF" },
          { id: "biens_mob", label: "Biens mobiliers", type: "textarea" },
          { id: "comptes", label: "Comptes bancaires", type: "textarea" },
          { id: "dettes", label: "Dettes connues", type: "textarea" }
        ]
      }
    ],
    documents_requis: [
      { id: "acte_deces", label: "Acte de deces", required: true },
      { id: "acte_mariage", label: "Acte de mariage", required: false },
      { id: "cni_heritiers", label: "CNI heritiers", required: true },
      { id: "actes_naissance", label: "Actes de naissance", required: true },
      { id: "titre_foncier", label: "Titre Foncier (si bien)", required: false }
    ]
  },
  donation: {
    label: "Donation",
    icone: "Gift",
    couleur: "#C55A11",
    sections: [
      {
        id: "date_acte", label: "Date de l'acte",
        fields: [
          { id: "date_acte", label: "Date de rédaction de l'acte", type: "date", required: true }
        ]
      },
      {
        id: "parties", label: "Les Parties",
        fields: [
          { id: "donateur_nom", label: "Nom Donateur", type: "text", required: true },
          { id: "donateur_prenom", label: "Prenom Donateur", type: "text", required: true },
          { id: "donateur_cni", label: "CNI Donateur", type: "text", required: true },
          { id: "donataire_nom", label: "Nom Donataire", type: "text", required: true },
          { id: "donataire_prenom", label: "Prenom Donataire", type: "text", required: true },
          { id: "donataire_cni", label: "CNI Donataire", type: "text", required: true },
          { id: "lien_parente", label: "Lien de parente", type: "select", options: ["Parent/Enfant","Epoux/Epouse","Frere/Soeur","Autre"] }
        ]
      },
      {
        id: "bien", label: "Bien Donne",
        fields: [
          { id: "nature", label: "Nature du bien", type: "select", required: true, options: ["Immeuble","Somme d'argent","Bien mobilier"] },
          { id: "valeur", label: "Valeur (FCFA)", type: "number", required: true },
          { id: "description", label: "Description", type: "textarea" }
        ]
      },
      {
        id: "conditions", label: "Conditions",
        fields: [
          { id: "type_donation", label: "Type de donation", type: "select", options: ["Donation simple","Avec charge","Avec reserve d'usufruit","Donation-partage"] },
          { id: "reserve", label: "Reserve hereditaire", type: "select", options: ["Respectee","A verifier"] }
        ]
      }
    ],
    documents_requis: [
      { id: "cni_donateur", label: "CNI Donateur", required: true },
      { id: "cni_donataire", label: "CNI Donataire", required: true },
      { id: "titre_foncier", label: "Titre Foncier (si immo)", required: false },
      { id: "acte_naissance", label: "Acte de naissance", required: false }
    ]
  },
  ouverture_credit: {
    label: "Ouverture de Credit",
    icone: "CreditCard",
    couleur: "#1F4E79",
    sections: [
      {
        id: "date_acte", label: "Date de l'acte",
        fields: [
          { id: "date_acte", label: "Date de rédaction de l'acte", type: "date", required: true }
        ]
      },
      {
        id: "preteur", label: "Le Preteur",
        fields: [
          { id: "institution", label: "Banque / Institution", type: "text", required: true },
          { id: "representant", label: "Representant legal", type: "text" }
        ]
      },
      {
        id: "emprunteur", label: "L'Emprunteur",
        fields: [
          { id: "nom", label: "Nom", type: "text", required: true },
          { id: "prenom", label: "Prenom", type: "text", required: true },
          { id: "cni", label: "N. CNI", type: "text", required: true },
          { id: "profession", label: "Profession", type: "text" }
        ]
      },
      {
        id: "credit", label: "Le Credit",
        fields: [
          { id: "montant", label: "Montant (FCFA)", type: "number", required: true },
          { id: "duree", label: "Duree (mois)", type: "number", required: true },
          { id: "taux", label: "Taux d'interet (%)", type: "number" },
          { id: "type_gar", label: "Type de garantie", type: "select", required: true, options: ["Hypotheque","Nantissement","Caution solidaire"] }
        ]
      },
      {
        id: "garantie", label: "Garantie",
        fields: [
          { id: "description_gar", label: "Description garantie", type: "textarea" },
          { id: "ref_tf", label: "Ref. TF (si hypotheque)", type: "text" },
          { id: "valeur_gar", label: "Valeur garantie (FCFA)", type: "number" }
        ]
      }
    ],
    documents_requis: [
      { id: "cni_emprunteur", label: "CNI Emprunteur", required: true },
      { id: "accord_banque", label: "Accord / lettre banque", required: true },
      { id: "titre_foncier", label: "Titre Foncier (si hypo)", required: false },
      { id: "bulletin_salaire", label: "Bulletins de salaire", required: false }
    ]
  }
}
