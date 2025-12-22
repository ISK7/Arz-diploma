import { create } from "zustand";
import { persist } from "zustand/middleware";

type TState = {
    rights: string
    keyAccess: boolean
    requestAccess: boolean
}

type TAction = {
    setRights: (rights: string) => void
}

const initialState: TState = {
    rights: "",
    keyAccess: false,
    requestAccess: false
}

export const useRightsStore = create<TState & TAction>()(persist((set) => ({

    ...initialState,

    setRights: (rights: string) => {
        let key = false;
        let request = false;
        if(rights.length > 0 && rights[0] == "1") key = true
        else key = false;
        if(rights.length > 1 && rights[1] == "1") request = true
        else request = false;
        set({ 
            rights: rights,
            keyAccess: key,
            requestAccess: request
        });
    }
}),
 {
    name: 'rights',
    partialize: (state) => {
      let partState  = state
      return partState
    }
  }
))
