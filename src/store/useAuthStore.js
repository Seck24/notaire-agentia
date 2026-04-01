import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// DEMO MODE — profil cabinet par défaut pour la démo (ne pas supprimer)
const DEMO_MODE = true
const DEMO_CABINET = {
  cabinet_id: 'ADE_01',
  nom_cabinet: 'Étude Maître ADE-MENSAH DIAKITE',
  token_api: 'token_ade_mensah_2026',
  plan: 'pro',
  statut_compte: 'actif',
  email_contact: 'contact@ade-mensah.ci',
}
const DEMO_SESSION = { user: { id: 'demo-user-ade-01' } }

const useAuthStore = create((set, get) => ({
  session: DEMO_MODE ? DEMO_SESSION : null,
  profil: DEMO_MODE ? DEMO_CABINET : null,
  loading: false,
  joursRestants: null,

  initialize: async () => {
    // DEMO MODE — bypass auth, profil déjà chargé
    if (DEMO_MODE) {
      set({ session: DEMO_SESSION, profil: DEMO_CABINET, loading: false })
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session })

      if (session) {
        await get().chargerProfil(session.user.id)
      } else {
        set({ loading: false })
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session })
        if (session) {
          await get().chargerProfil(session.user.id)
        } else {
          set({ profil: null, joursRestants: null, loading: false })
        }
      })
    } catch (err) {
      console.error('Auth init error:', err)
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ session: data.session })
    await get().chargerProfil(data.session.user.id)
    return data
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null, profil: null, joursRestants: null, loading: false })
  },

  inscrire: async ({ nom_cabinet, email, telephone, ville, password }) => {
    // 1. Sign up
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    const userId = data.user.id

    // Generate cabinet_id slug
    const cabinet_id = nom_cabinet
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36)

    // Generate token_api
    const token_api = 'ntia_' + crypto.randomUUID().replace(/-/g, '')

    // Calculate trial end date (14 days from now)
    const dateEssaiFin = new Date()
    dateEssaiFin.setDate(dateEssaiFin.getDate() + 14)

    // 2. Insert profile
    const { error: insertError } = await supabase.from('profils_cabinets').insert({
      user_id: userId,
      cabinet_id,
      nom_cabinet,
      email_contact: email,
      telephone: telephone || null,
      ville: ville || null,
      plan: 'essai',
      date_essai_fin: dateEssaiFin.toISOString(),
      statut_compte: 'essai',
      token_api,
    })

    if (insertError) throw insertError

    set({ session: data.session })
    await get().chargerProfil(userId)
    return data
  },

  chargerProfil: async (userId) => {
    const uid = userId || get().session?.user?.id
    if (!uid) {
      set({ loading: false })
      return
    }

    const { data, error } = await supabase
      .from('profils_cabinets')
      .select('*')
      .eq('user_id', uid)
      .single()

    if (error) {
      console.error('Profil load error:', error)
      set({ profil: null, loading: false })
      return
    }

    set({ profil: data })
    get().calculerJoursRestants()
    set({ loading: false })
  },

  calculerJoursRestants: () => {
    const profil = get().profil
    if (!profil || !profil.date_essai_fin) {
      set({ joursRestants: null })
      return
    }
    const fin = new Date(profil.date_essai_fin)
    const maintenant = new Date()
    const diff = Math.ceil((fin - maintenant) / (1000 * 60 * 60 * 24))
    set({ joursRestants: Math.max(0, diff) })
  },
}))

export default useAuthStore
