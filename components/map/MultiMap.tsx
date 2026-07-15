"use client"
import { useCatStore } from "@/store/catStore"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function MultiMap() {
  const cats = useCatStore((state) => state.cats)

  // 기본 지도 중심 좌표 (고양이가 있다면 최근 잡은 녀석 위치, 없다면 서울시청 기준)
  const centerPosition: [number, number] =
    cats.length > 0
      ? [cats[0].location.latitude, cats[0].location.longitude]
      : [37.5665, 126.978]

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        border: "2px solid #ff9900",
      }}
    >
      <MapContainer
        center={centerPosition}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cats.map((cat) => (
          <Marker
            key={cat.id}
            position={[cat.location.latitude, cat.location.longitude]}
            icon={DefaultIcon}
          >
            <Popup>
              <div style={{ width: "150px", fontFamily: "sans-serif" }}>
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    objectFit: "cover",
                    height: "100px",
                  }}
                />
                <h4 style={{ margin: "8px 0 4px", fontSize: "14px" }}>
                  🐈 {cat.name}
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                  등급: {cat.score >= 0.9 ? "🌟 UR" : "🐟 Normal"} (
                  {Math.round(cat.score * 100)}%)
                </p>
                <p
                  style={{ margin: "4px 0 0", fontSize: "10px", color: "#999" }}
                >
                  {cat.caughtAt}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
