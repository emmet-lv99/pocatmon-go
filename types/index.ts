export interface CaughtCat {
  id: string
  imageUrl: string
  score: number
  caughtAt: string
  name: string
  location: {
    latitude: number
    longitude: number
  }
}
