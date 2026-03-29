import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Home, Building2, Scale, Heart, CreditCard, Check, Plus, X, Download, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import ProgressSteps from '../components/ProgressSteps'
import DiagnosticPanel from '../components/DiagnosticPanel'
import { useAuth } from '../context/AuthContext'
import { checkDossier, genererActe, telechargerDocx } from '../services/api'
import { diagnostiquerDossier, calculerCompletude } from '../utils/diagnostic'

const ICONS = { Home, Building2, Scale, Heart, CreditCard }

const ACTES = [
  { id: 'vente_immobiliere', icon: 'Home', label: 'Vente immobiliere', desc: 'Transfert de propriete fonciere' },
  { id: 'constitution_societe', icon: 'Building2', label: 'Constitution societe', desc: 'SARL, SA, SAEM — droit OHADA' },
  { id: 'succession', icon: 'Scale', label: 'Succession', desc: 'Heritiers, actif, passif' },
  { id: 'donation', icon: 'Heart', label: 'Donation', desc: 'Transfert entre vifs' },
  { id: 'ouverture_credit', icon: 'CreditCard', label: 'Ouverture de credit', desc: 'Hypotheques et suretes' },
]

// ─── Stepper ────────────────────────────────────
function Stepper({ step }) {
  const labels = ['Type d\'acte', 'Informations', 'Diagnostic', 'Generation']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {labels.map((label, i) => {
        const idx = i + 1
        const done = step > idx
        const active = step === idx
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--gold)' : active ? 'var(--gold)' : 'var(--elevated)',
                border: active || done ? 'none' : '1px solid var(--border)',
                fontSize: 11, color: done || active ? '#08080f' : 'var(--dim)', fontWeight: 500,
              }}>
                {done ? <Check size={12} strokeWidth={2.5} /> : idx}
              </div>
              <span style={{ fontSize: 12, color: active ? 'var(--gold)' : done ? 'var(--text)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div style={{
                flex: 1, height: 1, margin: '0 12px',
                background: done ? 'var(--gold)' : 'var(--border)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Field helpers ──────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="label-dark">{label}</label>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder = '', ...props }) {
  return (
    <Field label={label}>
      <input
        className="input-dark"
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    </Field>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select className="input-dark" value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">Selectionner...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  )
}

function Textarea({ label, value, onChange, placeholder = '', rows = 3 }) {
  return (
    <Field label={label}>
      <textarea className="input-dark" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
    </Field>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => onChange(!value)}>
      <div style={{
        width: 36, height: 20, borderRadius: 10, position: 'relative', transition: 'background 0.15s',
        background: value ? 'var(--gold)' : 'var(--elevated)', border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%', position: 'absolute', top: 2,
          left: value ? 18 : 2, transition: 'left 0.15s',
          background: value ? '#08080f' : 'var(--dim)',
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}

function SectionHeader({ title }) {
  return <div className="section-title" style={{ marginTop: 20, marginBottom: 12 }}>{title}</div>
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Array.isArray(children) ? children.length : 1}, 1fr)`, gap: 12, marginBottom: 12 }}>{children}</div>
}

// ─── Bloc wrapper (accordéon mobile, ouvert desktop) ──
function Bloc({ id, title, icon, children, openBlocs, toggleBloc }) {
  const isOpen = openBlocs.includes(id)
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        className={`bloc-header${isOpen ? ' active' : ''}`}
        onClick={() => toggleBloc(id)}
      >
        {icon}
        <span style={{ flex: 1 }}>{title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {isOpen && (
        <div className="bloc-body">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Dynamic list ───────────────────────────────
function DynamicList({ label, fields, items, onChange }) {
  const addItem = () => {
    const empty = {}
    fields.forEach(f => empty[f.key] = '')
    onChange([...items, empty])
  }
  const removeItem = i => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, key, val) => {
    const copy = [...items]
    copy[i] = { ...copy[i], [key]: val }
    onChange(copy)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="label-dark" style={{ margin: 0 }}>{label}</span>
        <button type="button" className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }} onClick={addItem}>
          <Plus size={11} /> Ajouter
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="card-elevated" style={{ padding: 10, marginBottom: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {fields.map(f => (
            <div key={f.key} style={{ flex: f.flex || 1 }}>
              {f.type === 'select' ? (
                <select className="input-dark" value={item[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} style={{ fontSize: 12, padding: '6px 8px' }}>
                  <option value="">{f.placeholder || f.label}</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  className="input-dark"
                  value={item[f.key] || ''}
                  onChange={e => updateItem(i, f.key, e.target.value)}
                  placeholder={f.placeholder || f.label}
                  type={f.type || 'text'}
                  style={{ fontSize: 12, padding: '6px 8px' }}
                />
              )}
            </div>
          ))}
          {items.length > 1 && (
            <X size={14} color="var(--muted)" style={{ cursor: 'pointer', flexShrink: 0, marginTop: 6 }} onClick={() => removeItem(i)} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Particularités (Bloc D — universel) ────────
function BlocParticularites({ data, update }) {
  return (
    <div className="bloc-special">
      <div className="bloc-special-header">
        <Sparkles size={14} />
        Particularites & Instructions Speciales
      </div>
      <textarea
        className="input-dark"
        value={data.particularites || ''}
        onChange={e => update('particularites', e.target.value)}
        rows={6}
        placeholder={`Decrivez ici tout element inhabituel ou instruction specifique pour ce dossier.

Exemples :
- "Le vendeur est marie mais separe de fait — verifier consentement conjoint"
- "Bien avec ACD ancienne, chef de quartier decede — renforcer garanties"
- "Prix volontairement bas — prevoir justificatif pour la DGI"
- "L'acquereur souhaite une clause de preference si revente dans 5 ans"
- "Financement mixte : apport personnel + pret familial non bancaire"`}
      />
      <div className="help-text">
        Ce champ est transmis directement a l'agent comme instruction prioritaire. Plus vous etes precis, plus l'acte sera adapte a la situation reelle.
      </div>
    </div>
  )
}

// ─── Completude indicator ───────────────────────
function CompletudeBarre({ typeActe, formData }) {
  const { completude, champsVides } = useMemo(
    () => calculerCompletude(typeActe, formData),
    [typeActe, formData]
  )

  const color = completude === 100
    ? 'var(--gold)'
    : completude > 85
    ? 'var(--green)'
    : completude >= 60
    ? '#e0a030'
    : 'var(--red)'

  return (
    <div style={{ marginTop: 20, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dim)' }}>
          Completude du dossier
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color }}>{completude}%</span>
      </div>
      <div className="completude-bar">
        <div
          className={`completude-fill${completude === 100 ? ' completude-perfect' : ''}`}
          style={{ width: `${completude}%`, background: color }}
        />
      </div>
      {champsVides.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--dim)' }}>
          Champs manquants : {champsVides.slice(0, 4).map(c => c.replace(/_/g, ' ')).join(', ')}
          {champsVides.length > 4 && ` (+${champsVides.length - 4})`}
        </div>
      )}
    </div>
  )
}

// ─── Forms by type (with blocs) ─────────────────
function FormVente({ data, update, openBlocs, toggleBloc }) {
  return (
    <>
      <Bloc id="A" title="BLOC A — Parties Prenantes" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <SectionHeader title="Vendeur" />
        <Row><Input label="Nom" value={data.vendeur_nom} onChange={v => update('vendeur_nom', v)} /><Input label="Prenom" value={data.vendeur_prenom} onChange={v => update('vendeur_prenom', v)} /></Row>
        <Row><Select label="Nationalite" value={data.vendeur_nationalite} onChange={v => update('vendeur_nationalite', v)} options={['Ivoirienne', 'Francaise', 'Autre']} /></Row>
        <Row><Input label="Adresse" value={data.vendeur_adresse} onChange={v => update('vendeur_adresse', v)} /></Row>
        <Row><Input label="N CNI" value={data.vendeur_cni} onChange={v => update('vendeur_cni', v)} /></Row>
        <Row><Select label="Regime matrimonial" value={data.vendeur_regime} onChange={v => update('vendeur_regime', v)} options={['Separation de biens', 'Communaute reduite aux acquets', 'Communaute universelle', 'Celibataire']} /></Row>

        <SectionHeader title="Acquereur" />
        <Row><Input label="Nom" value={data.acquereur_nom} onChange={v => update('acquereur_nom', v)} /><Input label="Prenom" value={data.acquereur_prenom} onChange={v => update('acquereur_prenom', v)} /></Row>
        <Row><Select label="Nationalite" value={data.acquereur_nationalite} onChange={v => update('acquereur_nationalite', v)} options={['Ivoirienne', 'Francaise', 'Autre']} /></Row>
        <Row><Input label="Adresse" value={data.acquereur_adresse} onChange={v => update('acquereur_adresse', v)} /></Row>
        <Row><Input label="N CNI" value={data.acquereur_cni} onChange={v => update('acquereur_cni', v)} /></Row>
      </Bloc>

      <Bloc id="B" title="BLOC B — Objet de l'Operation" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Input label="Ref. cadastrale" value={data.bien_ref_cadastrale} onChange={v => update('bien_ref_cadastrale', v)} /><Input label="Superficie (m2)" value={data.bien_superficie} onChange={v => update('bien_superficie', v)} /></Row>
        <Row><Input label="Adresse du bien" value={data.bien_adresse} onChange={v => update('bien_adresse', v)} /></Row>
        <Row><Textarea label="Description" value={data.bien_description} onChange={v => update('bien_description', v)} placeholder="Villa, terrain, appartement..." /></Row>
        <Row><Select label="Type de titre de propriete" value={data.type_titre} onChange={v => update('type_titre', v)} options={['Titre Foncier (TF)', 'ACD', 'Concession Etat', 'En cours d\'immatriculation', 'Permis d\'habiter']} /></Row>
      </Bloc>

      <Bloc id="C" title="BLOC C — Conditions Financieres" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Input label="Prix (FCFA)" value={data.prix} onChange={v => update('prix', v)} type="number" placeholder="Ex: 15000000" /><Select label="Modalites de paiement" value={data.modalites_paiement} onChange={v => update('modalites_paiement', v)} options={['Comptant', 'Virement', 'Cheque de banque', 'Echelonne']} /></Row>
        <Row><Input label="Date entree en jouissance" value={data.date_jouissance} onChange={v => update('date_jouissance', v)} type="date" /></Row>
        <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
          <Toggle label="Hypotheques existantes" value={data.hypotheques_existantes} onChange={v => update('hypotheques_existantes', v)} />
          <Toggle label="Servitudes" value={data.servitudes} onChange={v => update('servitudes', v)} />
        </div>
      </Bloc>
    </>
  )
}

function FormSociete({ data, update, openBlocs, toggleBloc }) {
  return (
    <>
      <Bloc id="A" title="BLOC A — Parties Prenantes" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <SectionHeader title="Gerant" />
        <Row><Input label="Nom" value={data.gerant_nom} onChange={v => update('gerant_nom', v)} /><Input label="Prenom" value={data.gerant_prenom} onChange={v => update('gerant_prenom', v)} /></Row>
        <Row><Select label="Nationalite" value={data.gerant_nationalite} onChange={v => update('gerant_nationalite', v)} options={['Ivoirienne', 'Francaise', 'Autre']} /></Row>

        <SectionHeader title="Associes" />
        <DynamicList
          label="Liste des associes"
          items={data.associes || [{ nom: '', apport: '', parts: '' }]}
          onChange={v => update('associes', v)}
          fields={[
            { key: 'nom', label: 'Nom complet', flex: 2 },
            { key: 'apport', label: 'Apport FCFA', type: 'number' },
            { key: 'parts', label: 'Parts %', type: 'number' },
          ]}
        />
      </Bloc>

      <Bloc id="B" title="BLOC B — Objet de l'Operation" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Input label="Denomination sociale" value={data.denomination} onChange={v => update('denomination', v)} /><Select label="Forme juridique" value={data.forme_juridique} onChange={v => update('forme_juridique', v)} options={['SARL', 'SA', 'SAS', 'SAEM', 'SNC']} /></Row>
        <Row><Textarea label="Objet social" value={data.objet_social} onChange={v => update('objet_social', v)} placeholder="Activites de la societe..." /></Row>
        <Row><Input label="Siege social" value={data.siege_social} onChange={v => update('siege_social', v)} /></Row>
      </Bloc>

      <Bloc id="C" title="BLOC C — Conditions Financieres" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Input label="Capital social (FCFA)" value={data.capital} onChange={v => update('capital', v)} type="number" /><Input label="Duree (annees)" value={data.duree || '99'} onChange={v => update('duree', v)} type="number" /></Row>
      </Bloc>
    </>
  )
}

function FormSuccession({ data, update, openBlocs, toggleBloc }) {
  return (
    <>
      <Bloc id="A" title="BLOC A — Parties Prenantes" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <SectionHeader title="Defunt" />
        <Row><Input label="Nom" value={data.defunt_nom} onChange={v => update('defunt_nom', v)} /><Input label="Prenom" value={data.defunt_prenom} onChange={v => update('defunt_prenom', v)} /></Row>
        <Row><Input label="Date de deces" value={data.date_deces} onChange={v => update('date_deces', v)} type="date" /><Input label="Lieu de deces" value={data.lieu_deces} onChange={v => update('lieu_deces', v)} /></Row>
        <Row><Select label="Regime matrimonial" value={data.regime_matrimonial} onChange={v => update('regime_matrimonial', v)} options={['Separation de biens', 'Communaute reduite aux acquets', 'Communaute universelle', 'Celibataire']} /></Row>

        <SectionHeader title="Heritiers" />
        <DynamicList
          label="Liste des heritiers"
          items={data.heritiers || [{ nom: '', lien: '', part: '' }]}
          onChange={v => update('heritiers', v)}
          fields={[
            { key: 'nom', label: 'Nom complet', flex: 2 },
            { key: 'lien', label: 'Lien', type: 'select', options: ['Conjoint', 'Enfant', 'Pere', 'Mere', 'Frere', 'Soeur', 'Autre'] },
            { key: 'part', label: 'Part %', type: 'number' },
          ]}
        />
      </Bloc>

      <Bloc id="B" title="BLOC B — Actif Successoral" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <DynamicList
          label="Biens du defunt"
          items={data.actif_successoral || [{ type_bien: '', description: '', valeur: '' }]}
          onChange={v => update('actif_successoral', v)}
          fields={[
            { key: 'type_bien', label: 'Type de bien' },
            { key: 'description', label: 'Description', flex: 2 },
            { key: 'valeur', label: 'Valeur FCFA', type: 'number' },
          ]}
        />
      </Bloc>

      <Bloc id="C" title="BLOC C — Passif" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <DynamicList
          label="Dettes"
          items={data.passif || [{ creancier: '', montant: '' }]}
          onChange={v => update('passif', v)}
          fields={[
            { key: 'creancier', label: 'Creancier', flex: 2 },
            { key: 'montant', label: 'Montant FCFA', type: 'number' },
          ]}
        />
      </Bloc>
    </>
  )
}

function FormDonation({ data, update, openBlocs, toggleBloc }) {
  return (
    <>
      <Bloc id="A" title="BLOC A — Parties Prenantes" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <SectionHeader title="Donateur" />
        <Row><Input label="Nom" value={data.donateur_nom} onChange={v => update('donateur_nom', v)} /><Input label="Prenom" value={data.donateur_prenom} onChange={v => update('donateur_prenom', v)} /></Row>
        <Row><Input label="Date de naissance" value={data.donateur_date_naissance} onChange={v => update('donateur_date_naissance', v)} type="date" /><Input label="Adresse" value={data.donateur_adresse} onChange={v => update('donateur_adresse', v)} /></Row>

        <SectionHeader title="Donataire" />
        <Row><Input label="Nom" value={data.donataire_nom} onChange={v => update('donataire_nom', v)} /><Input label="Prenom" value={data.donataire_prenom} onChange={v => update('donataire_prenom', v)} /></Row>
        <Row><Select label="Lien de parente" value={data.donataire_lien_parente} onChange={v => update('donataire_lien_parente', v)} options={['Enfant', 'Conjoint', 'Petit-enfant', 'Frere', 'Soeur', 'Autre']} /></Row>
        <Row><Input label="Adresse" value={data.donataire_adresse} onChange={v => update('donataire_adresse', v)} /></Row>
      </Bloc>

      <Bloc id="B" title="BLOC B — Bien Donne" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Select label="Type de bien" value={data.bien_type} onChange={v => update('bien_type', v)} options={['Immeuble', 'Bien meuble', 'Somme d\'argent', 'Fonds de commerce']} /></Row>
        <Row><Textarea label="Description" value={data.bien_description} onChange={v => update('bien_description', v)} /></Row>
        <Row><Input label="Valeur estimee (FCFA)" value={data.bien_valeur} onChange={v => update('bien_valeur', v)} type="number" /></Row>
      </Bloc>

      <Bloc id="C" title="BLOC C — Conditions" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Textarea label="Conditions particulieres" value={data.conditions_particulieres} onChange={v => update('conditions_particulieres', v)} placeholder="Optionnel — Ex: charge de rente viagere..." /></Row>
        <Toggle label="Reserve hereditaire" value={data.reserve_hereditaire} onChange={v => update('reserve_hereditaire', v)} />
      </Bloc>
    </>
  )
}

function FormCredit({ data, update, openBlocs, toggleBloc }) {
  return (
    <>
      <Bloc id="A" title="BLOC A — Parties Prenantes" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <SectionHeader title="Etablissement preteur" />
        <Row><Input label="Nom (ex: SGBCI, BICICI...)" value={data.preteur_nom} onChange={v => update('preteur_nom', v)} /><Input label="Adresse" value={data.preteur_adresse} onChange={v => update('preteur_adresse', v)} /></Row>

        <SectionHeader title="Emprunteur" />
        <Row><Input label="Nom" value={data.emprunteur_nom} onChange={v => update('emprunteur_nom', v)} /><Input label="Prenom" value={data.emprunteur_prenom} onChange={v => update('emprunteur_prenom', v)} /></Row>
        <Row><Input label="Adresse" value={data.emprunteur_adresse} onChange={v => update('emprunteur_adresse', v)} /></Row>
      </Bloc>

      <Bloc id="B" title="BLOC B — Objet du Credit" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Input label="Montant (FCFA)" value={data.montant_credit} onChange={v => update('montant_credit', v)} type="number" /><Input label="Taux d'interet (%)" value={data.taux_interet} onChange={v => update('taux_interet', v)} type="number" step="0.1" /><Input label="Duree (mois)" value={data.duree_mois} onChange={v => update('duree_mois', v)} type="number" /></Row>
      </Bloc>

      <Bloc id="C" title="BLOC C — Garanties" icon={null} openBlocs={openBlocs} toggleBloc={toggleBloc}>
        <Row><Select label="Type de garantie" value={data.garantie_type} onChange={v => update('garantie_type', v)} options={['Hypotheque', 'Nantissement', 'Caution', 'Antichrese']} /></Row>
        <Row><Textarea label="Description du bien garanti" value={data.garantie_description} onChange={v => update('garantie_description', v)} /></Row>
      </Bloc>
    </>
  )
}

const FORM_MAP = {
  vente_immobiliere: FormVente,
  constitution_societe: FormSociete,
  succession: FormSuccession,
  donation: FormDonation,
  ouverture_credit: FormCredit,
}

// ─── Generation result ──────────────────────────
function GenerationResult({ result, typeActe, cabinetNom, onReset }) {
  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
      <CheckCircle2 size={48} color="var(--gold)" strokeWidth={1.5} style={{ marginBottom: 16 }} />
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>Acte genere avec succes</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24, fontSize: 12, color: 'var(--muted)' }}>
        <span>Type: {typeActe.replace(/_/g, ' ')}</span>
        <span>Cabinet: {cabinetNom}</span>
        <span>Date: {new Date().toLocaleDateString('fr-FR')}</span>
      </div>

      <button
        className="btn-gold"
        onClick={() => telechargerDocx(result.docx_base64, result.filename)}
        style={{ padding: '14px 32px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}
      >
        <Download size={16} /> Telecharger .docx
      </button>

      {/* Warning */}
      <div style={{
        padding: 16, borderRadius: 10,
        background: 'rgba(224, 160, 48, 0.06)', border: '1px solid rgba(224, 160, 48, 0.2)',
        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', marginBottom: 20,
      }}>
        <AlertTriangle size={18} color="#e0a030" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: '#e0a030', lineHeight: 1.5 }}>
          {result.avertissement}
        </div>
      </div>

      <button className="btn-ghost" onClick={onReset}>Generer un nouvel acte</button>
    </div>
  )
}

// ─── Main page ──────────────────────────────────
export default function NouvelActe() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { cabinet } = useAuth()

  const preselected = searchParams.get('type')
  const [step, setStep] = useState(preselected ? 2 : 1)
  const [typeActe, setTypeActe] = useState(preselected || '')
  const [formData, setFormData] = useState({})
  const [generating, setGenerating] = useState(false)
  const [genDone, setGenDone] = useState(false)
  const [genResult, setGenResult] = useState(null)
  const [genError, setGenError] = useState('')

  // Blocs ouverts (desktop = tous, mobile = accordéon)
  const [openBlocs, setOpenBlocs] = useState(['A', 'B', 'C', 'D', 'E'])

  function toggleBloc(id) {
    setOpenBlocs(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))

  function selectType(id) {
    setTypeActe(id)
    setStep(2)
  }

  // Step 3 = Diagnostic (replaces old checklist)
  function handleVerifier() {
    setStep(3)
  }

  async function handleGenerate() {
    setStep(4)
    setGenerating(true)
    setGenDone(false)
    setGenError('')
    try {
      const result = await genererActe({
        type_acte: typeActe,
        form_data: formData,
        cabinet_token: cabinet.token,
      })
      if (result.success) {
        setGenResult(result)
        setGenDone(true)
      } else {
        setGenError(result.error || 'Erreur inconnue')
      }
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  function handleReset() {
    setStep(1)
    setTypeActe('')
    setFormData({})
    setGenResult(null)
    setGenDone(false)
    setGenError('')
    setOpenBlocs(['A', 'B', 'C', 'D', 'E'])
  }

  const FormComponent = FORM_MAP[typeActe]

  // Diagnostic computed locally
  const diagnostic = useMemo(
    () => typeActe ? diagnostiquerDossier(typeActe, formData) : null,
    [typeActe, formData]
  )

  return (
    <Layout>
      <div style={{ padding: 32, maxWidth: 720 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 300, margin: '0 0 24px' }}>
          Nouvel acte
        </h1>

        <Stepper step={step} />

        {/* Step 1 — Type selection */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {ACTES.map(acte => {
              const Icon = ICONS[acte.icon]
              return (
                <div
                  key={acte.id}
                  className="card"
                  onClick={() => selectType(acte.id)}
                  style={{ padding: 18, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.boxShadow = '0 0 20px var(--gold-glow)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={16} color="var(--gold)" strokeWidth={1.5} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{acte.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{acte.desc}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Step 2 — Form with Blocs */}
        {step === 2 && FormComponent && (
          <div className="animate-fade-in">
            <FormComponent data={formData} update={update} openBlocs={openBlocs} toggleBloc={toggleBloc} />

            {/* Bloc D — Particularités (universel) */}
            <BlocParticularites data={formData} update={update} />

            {/* Indicateur de complétude */}
            <CompletudeBarre typeActe={typeActe} formData={formData} />

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setStep(1)}>Retour</button>
              <button className="btn-gold" onClick={handleVerifier}>Analyser le dossier</button>
            </div>
          </div>
        )}

        {/* Step 3 — Diagnostic */}
        {step === 3 && diagnostic && (
          <DiagnosticPanel
            diagnostic={diagnostic}
            onCorrect={() => setStep(2)}
            onGenerate={handleGenerate}
          />
        )}

        {/* Step 4 — Generation */}
        {step === 4 && (
          <div className="animate-fade-in">
            {genDone && genResult ? (
              <GenerationResult
                result={genResult}
                typeActe={typeActe}
                cabinetNom={cabinet?.nom_cabinet}
                onReset={handleReset}
              />
            ) : genError ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--red)', marginBottom: 16 }}>{genError}</div>
                <button className="btn-ghost" onClick={() => setStep(3)}>Retour</button>
              </div>
            ) : (
              <div style={{ maxWidth: 360 }}>
                <ProgressSteps done={genDone} />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
