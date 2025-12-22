import { create } from "zustand";
import { persist } from "zustand/middleware";

type TState = {
  showActual: boolean
  showConfirmed: boolean
  showArchived: boolean
  showDeclined: boolean
}

type TAction = {
  setActual: (showActual: boolean) => void
  setConfirmed: (showConfirmed: boolean) => void
  setArchived: (showArchived: boolean) => void
  setDeclined: (showDeclined: boolean) => void
}


const initialState: TState = {
  showActual: true,
  showConfirmed: false,
  showArchived: false,
  showDeclined: false
}


export const useFiltersStore = create<TState & TAction>()(persist((set) => ({

  ...initialState,

  setActual: (Actual: boolean) => set({ showActual: Actual }),
  setConfirmed: (Confirmed: boolean) => set({ showConfirmed: Confirmed }),
  setArchived: (Archived: boolean) => set({ showArchived: Archived }),
  setDeclined: (Declined: boolean) => set({ showDeclined: Declined })
}),
  {
    name: 'filters',
    partialize: (state) => {
      let partState  = state
      return partState
    }
  }
))