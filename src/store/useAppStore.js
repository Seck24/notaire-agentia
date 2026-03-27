import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(persist(
  (set) => ({
    dossiers: [],
    cabinetInfo: { nom: '', adresse: '', numeroNotaire: '' },
    addDossier: (dossier) => set((state) => ({ dossiers: [...state.dossiers, dossier] })),
    updateCabinetInfo: (info) => set({ cabinetInfo: info }),
  }),
  { name: 'notaire-agentia-storage' }
))

export default useAppStore
