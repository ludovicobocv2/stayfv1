import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PriorityItem, MedicationItem, MoodRecordItem, SleepRecordItem } from '../types/supabase'

interface AppState {
  prioridades: PriorityItem[]
  medicamentos: MedicationItem[]
  registrosHumor: MoodRecordItem[]
  registrosSono: SleepRecordItem[]
  setPrioridades: (prioridades: PriorityItem[]) => void
  setMedicamentos: (medicamentos: MedicationItem[]) => void
  setRegistrosHumor: (registros: MoodRecordItem[]) => void
  setRegistrosSono: (registros: SleepRecordItem[]) => void
  addPrioridade: (prioridade: PriorityItem) => void
  updatePrioridade: (id: string, updates: Partial<PriorityItem>) => void
  removePrioridade: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      prioridades: [],
      medicamentos: [],
      registrosHumor: [],
      registrosSono: [],
      setPrioridades: (prioridades) => set(() => ({ prioridades: [...prioridades] })),
      setMedicamentos: (medicamentos) => set(() => ({ medicamentos: [...medicamentos] })),
      setRegistrosHumor: (registros) => set(() => ({ registrosHumor: [...registros] })),
      setRegistrosSono: (registros) => set(() => ({ registrosSono: [...registros] })),
      addPrioridade: (prioridade) => 
        set((state) => ({ 
          prioridades: [...state.prioridades, prioridade] 
        })),
      updatePrioridade: (id, updates) =>
        set((state) => ({
          prioridades: state.prioridades.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        })),
      removePrioridade: (id) =>
        set((state) => ({
          prioridades: state.prioridades.filter(p => p.id !== id)
        }))
    }),
    {
      name: 'app-storage',
      version: 1
    }
  )
) 