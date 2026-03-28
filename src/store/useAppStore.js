import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(persist(
  (set) => ({
    stats: { actes_ce_mois: 0, actes_generes: 0, temps_economise: 0 },
    cabinetInfo: { nom: '', logo: null, utilisateur: '', token_api: '' },
    incrementActes: () => set((state) => ({
      stats: {
        ...state.stats,
        actes_ce_mois: state.stats.actes_ce_mois + 1,
        actes_generes: state.stats.actes_generes + 1,
        temps_economise: state.stats.temps_economise + 2,
      }
    })),
    updateCabinetInfo: (info) => set((state) => ({
      cabinetInfo: { ...state.cabinetInfo, ...info }
    })),
  }),
  { name: 'stats_cabinet' }
))

export default useAppStore
