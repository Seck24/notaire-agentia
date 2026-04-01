import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(persist(
  (set) => ({
    stats: { actes_ce_mois: 0 },
    cabinetInfo: { nom: '', logo: null, utilisateur: '', token_api: '' },
    incrementActes: () => set((state) => ({
      stats: {
        actes_ce_mois: state.stats.actes_ce_mois + 1,
      }
    })),
    updateCabinetInfo: (info) => set((state) => ({
      cabinetInfo: { ...state.cabinetInfo, ...info }
    })),
  }),
  { name: 'stats_cabinet' }
))

export default useAppStore
