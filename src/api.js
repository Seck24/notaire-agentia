/**
 * api.js — Client API vers le backend FastAPI (api-notaire.preo-ia.info)
 */

const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * Génère un acte notarial via le backend FastAPI
 * Compatible avec la même interface que le webhook n8n
 */
export async function genererActe({ type_acte, form_data, cabinet_token }, signal) {
  const res = await fetch(`${API_URL}/api/generer-acte`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type_acte, form_data, cabinet_token }),
    signal,
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Cabinet non reconnu. Vérifiez vos paramètres.')
    throw new Error(`Erreur serveur (${res.status})`)
  }
  return res.json()
}

/**
 * Mode Conseil — question juridique → réponse IA avec RAG
 */
export async function poserConseil({ question, cabinet_id }) {
  const res = await fetch(`${API_URL}/api/conseil`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, cabinet_id }),
  })
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`)
  return res.json()
}

/**
 * Diagnostic pré-génération
 */
export async function diagnostiquer({ type_acte, form_data, cabinet_id }) {
  const res = await fetch(`${API_URL}/api/diagnostic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type_acte, form_data, cabinet_id }),
  })
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`)
  return res.json()
}
