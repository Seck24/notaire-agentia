const BASE = 'http://localhost:8002'

export async function verifierToken(token) {
  const r = await fetch(`${BASE}/api/verify-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  })
  if (!r.ok) throw new Error('Token invalide')
  return r.json()
}

export async function checkDossier(type_acte, champs_remplis) {
  const r = await fetch(`${BASE}/api/check-dossier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type_acte, champs_remplis })
  })
  return r.json()
}

export async function genererActe(payload) {
  const r = await fetch(`${BASE}/api/generer-acte`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.detail || 'Erreur serveur')
  }
  return r.json()
}

export async function envoyerConseil(payload) {
  const r = await fetch(`${BASE}/api/conseil`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.detail || 'Erreur serveur')
  }
  return r.json()
}

export async function demanderDiagnostic(payload) {
  const r = await fetch(`${BASE}/api/diagnostic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.detail || 'Erreur serveur')
  }
  return r.json()
}

export function telechargerDocx(base64, filename) {
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
