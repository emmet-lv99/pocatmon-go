import { CaughtCat } from "@/types"
import { create } from "zustand"

interface CatStore {
  cats: CaughtCat[]
  addCat: (newCat: CaughtCat) => void
  clearCats: () => void
}

export const useCatStore = create<CatStore>((set) => ({
  cats: [],
  addCat: (newCat) =>
    set((state) => ({
      cats: [newCat, ...state.cats],
    })),
  clearCats: () => set({ cats: [] }),
}))
