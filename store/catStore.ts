import { CaughtCat } from "@/types"
import { create } from "zustand"

interface CatStore {
  cats: CaughtCat[]
  addCat: (newCat: CaughtCat) => void
  clearCats: () => void
}

// 🎯 테스트를 위해 초기값(cats)에 가짜 고양이 데이터 2마리를 기본 장착합니다!
const mockCats: CaughtCat[] = [
  {
    id: "mock-1",
    name: "치즈덕후 냥이",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200", // 귀여운 고양이 이미지 링크
    score: 0.95, // AI 신뢰도 95% (UR 등급)
    caughtAt: "2026-07-15 14:20:00",
    location: {
      latitude: 37.5665, // 서울시청 근처 위도
      longitude: 126.978, // 서울시청 근처 경도
    },
  },
  {
    id: "mock-2",
    name: "골목대장 카오스",
    imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200",
    score: 0.78, // AI 신뢰도 78% (Normal 등급)
    caughtAt: "2026-07-15 15:10:00",
    location: {
      latitude: 37.57, // 청계천 근처 위도
      longitude: 126.982, // 청계천 근처 경도
    },
  },
]

export const useCatStore = create<CatStore>((set) => ({
  cats: mockCats,
  addCat: (newCat) =>
    set((state) => ({
      cats: [newCat, ...state.cats],
    })),
  clearCats: () => set({ cats: [] }),
}))
