import { useState, useRef } from 'react'
import { Building2, FileText, Users, Gift, CreditCard, Home, Upload, X, CheckCircle, Download, FileDown, ChevronRight, Loader2 } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const acteTypes = [
  { id: 'societe', label: 'Constitution de société', icon: Building2, desc: 'SARL, SAS, SA, SCI...', color: '#E8F4F8', iconColor: '#2B7A9A' },
  { id: 'vente', label: 'Acte de vente', icon: FileText, desc: 'Immobilier, fonds de commerce', color: '#F0F8E8', iconColor: '#4A8A2B' },
  { id: 'succession', label: 'Succession', icon: Users, desc: 'Déclaration, partage successoral', color: '#F8F0E8', iconColor: '#9A6B2B' },
  { id: 'donation', label: 'Donation', icon: Gift, desc: 'Simple, partage-donation', color: '#F8E8F0', iconColor: '#9A2B7A' },
  { id: 'credit', label: 'Ouverture de crédit', icon: CreditCard, desc: 'Prêt notarié, hypothèque', color: '#EBF0FF', iconColor: '#2B4A9A' },
  { id: 'bail', label: 'Bail notarié', icon: Home, desc: 'Commercial, habitation', color: '#F0EBF8', iconColor: '#6B2B9A' },
]

const requiredDocs = {
  societe: ['Pièces d\'identité des associés', 'Statuts projetés', 'Justificatif de domicile', 'Attestation de dépôt de capital'],
  vente: ['Titre de propriété', 'Pièces d\'identité', 'Diagnostics immobiliers', 'Compromis de vente'],
  succession: ['Acte de décès', 'Livret de famille', 'Pièces d\'identité héritiers', 'Inventaire des biens'],
  donation: ['Pièces d\'identité donateur/donataire', 'Titre de propriété', 'Justificatif de valeur'],
  credit: ['Pièces d\'identité', 'Offre de prêt', 'Titre de propriété', 'Assurance emprunteur'],
  bail: ['Pièces d\'identité', 'Justificatif de propriété', 'État des lieux', 'Diagnostics techniques'],
}

const loadingMessages = [
  'Lecture des documents...',
  'Extraction des informations clés...',
  'Vérification de la conformité juridique...',
  'Rédaction de l\'acte notarial...',
  'Finalisation et mise en forme...',
]

const fakeActeContent = `ACTE AUTHENTIQUE

Par-devant Maître [Nom du Notaire], Notaire à [Ville], soussigné,

ONT COMPARU :

1. Monsieur/Madame [NOM PRÉNOM], né(e) le [DATE] à [LIEU],
   demeurant [ADRESSE COMPLÈTE],
   Ci-après dénommé(e) le « Vendeur »

2. Monsieur/Madame [NOM PRÉNOM], né(e) le [DATE] à [LIEU],
   demeurant [ADRESSE COMPLÈTE],
   Ci-après dénommé(e) l'« Acquéreur »

LESQUELS ONT REQUIS le notaire soussigné de recevoir le présent acte
et ont déclaré ce qui suit :

DÉSIGNATION

Le vendeur est propriétaire d'un bien immobilier situé :
[ADRESSE DU BIEN]
Tel que ce bien existe, avec toutes ses dépendances et sans exception
ni réserve.

PRIX ET CONDITIONS DE PAIEMENT

Le présent acte est consenti et accepté moyennant le prix principal
de [MONTANT EN LETTRES] Euros ([MONTANT EN CHIFFRES] €).

Ce prix est payable comme suit : [CONDITIONS DE PAIEMENT]

GARANTIES

Le vendeur garantit l'acquéreur contre tous troubles, évictions et
hypothèques non déclarés, et tous vices cachés.

FAIT ET PASSÉ à [VILLE], le [DATE], en l'étude du notaire.

Dont acte.`

export default function NouvelActe() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState(null)
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [generated, setGenerated] = useState(false)
  const fileInputRef = useRef(null)
  const { addDossier } = useAppStore()

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }

  const handleFileInput = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const startGeneration = async () => {
    setIsGenerating(true)
    setLoadingStep(0)

    for (let i = 0; i < loadingMessages.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setLoadingStep(i + 1)
    }

    await new Promise(r => setTimeout(r, 400))

    // Save dossier
    addDossier({
      id: Date.now(),
      type: acteTypes.find(a => a.id === selectedType)?.label,
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'Généré',
    })

    setIsGenerating(false)
    setGenerated(true)
  }

  const reset = () => {
    setStep(1)
    setSelectedType(null)
    setFiles([])
    setGenerated(false)
    setLoadingStep(0)
  }

  const steps = ['Type d\'acte', 'Documents', 'Génération']

  return (
    <div style={{ padding: '32px 28px', maxWidth: '800px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '26px', color: '#1A1A1A' }}>Nouvel Acte</h1>
      <p style={{ margin: '0 0 28px', color: '#5A5A5A', fontSize: '14px' }}>
        Créez un acte notarial en 3 étapes simples
      </p>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        {steps.map((label, idx) => {
          const stepNum = idx + 1
          const isActive = step === stepNum
          const isDone = step > stepNum
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isDone ? '#6B4C2A' : isActive ? '#C8A882' : '#E8DDD0',
                  color: isDone || isActive ? 'white' : '#9A8A7A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {isDone ? <CheckCircle size={16} /> : stepNum}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#6B4C2A' : isDone ? '#6B4C2A' : '#9A8A7A',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: step > stepNum ? '#C8A882' : '#E8DDD0',
                  margin: '0 12px',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Select type */}
      {step === 1 && (
        <div>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1A1A1A' }}>
            Sélectionnez le type d'acte
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}>
            {acteTypes.map(({ id, label, icon: Icon, desc, color, iconColor }) => (
              <div
                key={id}
                className="card"
                onClick={() => setSelectedType(id)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: selectedType === id ? '2px solid #C8A882' : '2px solid transparent',
                  background: selectedType === id ? '#FAF6F1' : 'white',
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <Icon size={22} color={iconColor} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '12px', color: '#9A8A7A' }}>{desc}</div>
                {selectedType === id && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', color: '#6B4C2A', fontSize: '12px', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Sélectionné
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={() => setStep(2)}
            disabled={!selectedType}
            style={{
              opacity: selectedType ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Continuer <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Upload */}
      {step === 2 && (
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1A1A1A' }}>
            Téléversez vos documents
          </h2>
          <p style={{ margin: '0 0 20px', color: '#5A5A5A', fontSize: '14px' }}>
            Acte sélectionné : <strong style={{ color: '#6B4C2A' }}>
              {acteTypes.find(a => a.id === selectedType)?.label}
            </strong>
          </p>

          {/* Required docs */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', background: '#FAF6F1' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B4C2A', marginBottom: '10px' }}>
              Documents requis :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(requiredDocs[selectedType] || []).map((doc) => (
                <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#5A5A5A' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C8A882', flexShrink: 0 }} />
                  {doc}
                </div>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#C8A882' : '#E8DDD0'}`,
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? '#FAF6F1' : 'white',
              transition: 'all 0.2s',
              marginBottom: '16px',
            }}
          >
            <Upload size={36} color="#C8A882" style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', marginBottom: '6px' }}>
              Glissez vos fichiers ici
            </div>
            <div style={{ fontSize: '13px', color: '#9A8A7A' }}>
              ou cliquez pour sélectionner — PDF, Word, images
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {files.map((file, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'white',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #E8DDD0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} color="#C8A882" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A' }}>{file.name}</div>
                      <div style={{ fontSize: '11px', color: '#9A8A7A' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A7A', padding: '4px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Retour
            </button>
            <button
              className="btn-primary"
              onClick={() => setStep(3)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Générer l'acte <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generation */}
      {step === 3 && (
        <div>
          {!generated && !isGenerating && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h2 style={{ margin: '0 0 12px', fontSize: '18px', color: '#1A1A1A' }}>
                Prêt à générer
              </h2>
              <p style={{ margin: '0 0 24px', color: '#5A5A5A', fontSize: '14px' }}>
                L'IA va analyser vos documents et rédiger l'acte
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => setStep(2)}>Retour</button>
                <button
                  className="btn-primary"
                  onClick={startGeneration}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Loader2 size={16} />
                  Lancer la génération
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FAF6F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Loader2 size={28} color="#C8A882" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1A1A1A' }}>
                Génération en cours...
              </h3>
              <p style={{ margin: '0 0 28px', color: '#C8A882', fontSize: '14px', fontWeight: 500 }}>
                {loadingMessages[Math.min(loadingStep, loadingMessages.length - 1)]}
              </p>
              {/* Progress bar */}
              <div style={{ background: '#E8DDD0', borderRadius: '4px', height: '6px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto 24px' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #C8A882, #6B4C2A)',
                  borderRadius: '4px',
                  width: `${(loadingStep / loadingMessages.length) * 100}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto', textAlign: 'left' }}>
                {loadingMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: idx < loadingStep ? '#6B4C2A' : idx === loadingStep - 1 ? '#C8A882' : '#C4B8AA',
                    opacity: idx >= loadingStep + 1 ? 0.4 : 1,
                  }}>
                    {idx < loadingStep
                      ? <CheckCircle size={14} color="#6B4C2A" />
                      : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid currentColor', flexShrink: 0 }} />
                    }
                    {msg}
                  </div>
                ))}
              </div>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {generated && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle size={20} color="#2E7D32" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', color: '#1A1A1A' }}>Acte généré avec succès !</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#5A5A5A' }}>
                    {acteTypes.find(a => a.id === selectedType)?.label} — {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Download buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileDown size={16} />
                  Télécharger Word (.docx)
                </button>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} />
                  Télécharger PDF
                </button>
              </div>

              {/* Acte preview */}
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                  padding: '14px 20px',
                  background: '#FAF6F1',
                  borderBottom: '1px solid #E8DDD0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <FileText size={16} color="#6B4C2A" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B4C2A' }}>
                    Aperçu de l'acte
                  </span>
                </div>
                <pre style={{
                  padding: '24px',
                  margin: 0,
                  fontFamily: "'Georgia', serif",
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: '#1A1A1A',
                  whiteSpace: 'pre-wrap',
                  background: 'white',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}>
                  {fakeActeContent}
                </pre>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn-secondary" onClick={reset}>
                  Créer un nouvel acte
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
