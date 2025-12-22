import { create } from "zustand";
import { persist } from "zustand/middleware";

type TState = {
    login: string
    password: string
}

type TAction = {
    setLogin: (newLogin: string) => void
    setPassword: (newPassword: string) => void
    logOut: () => void
}

const initialState: TState = {
    login: "",
    password: ""
}

export const useAccountStore = create<TState & TAction>()(persist((set) => ({

    ...initialState,

    setLogin: (newLogin: string) => set({ login: newLogin }),
    setPassword: (newPassword: string) => set({ password: newPassword }),
    logOut: () => set({ ...initialState })
}),
  {
    name: 'account',
    partialize: (state) => {
      let partState  = state
      return partState
    }
  }
))
