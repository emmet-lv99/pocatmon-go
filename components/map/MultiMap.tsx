"use client"
import { useCatStore } from "@/store/catStore"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const UserLocationIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png", // 더 눈에 띄는 큼직한 아이콘 또는 커스텀 이미지 URL
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// 🎯 지도 내부의 시점과 버튼을 안전하게 통제하는 컨트롤러 컴포넌트
function MapController({
  userCoords,
}: {
  userCoords: { latitude: number; longitude: number } | null
}) {
  const map = useMap()
  const hasCenteredRef = useRef(false)
  // 🧠 [방어 로직] 최초에 내 위치가 잡혔을 때 딱 한 번만 지도를 내 위치로 정렬해줍니다.
  useEffect(() => {
    if (userCoords && !hasCenteredRef.current) {
      map.setView([userCoords.latitude, userCoords.longitude], 15)
      hasCenteredRef.current = true // 이후로는 watchPosition이 돌아가도 지도를 강제로 움직이지 않습니다.
    }
  }, [userCoords, map])

  // 🎯 [버튼 액션] 버튼 클릭 시에는 애니메이션과 함께 내 위치로 순간 이동합니다.
  const handleFlyToMe = () => {
    if (userCoords) {
      map.flyTo([userCoords.latitude, userCoords.longitude], 16, {
        animate: true,
        duration: 1.2,
      })
    } else {
      alert("현재 위치 GPS 신호를 아직 수신하지 못했습니다!")
    }
  }

  return (
    <button
      onClick={handleFlyToMe}
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "#ff9900",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        fontSize: "20px",
        cursor: "pointer",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      🎯
    </button>
  )
}

export default function MultiMap() {
  const cats = useCatStore((state) => state.cats)

  // 기본 지도 중심 좌표 (고양이가 있다면 최근 잡은 녀석 위치, 없다면 서울시청 기준)
  const centerPosition: [number, number] =
    cats.length > 0
      ? [cats[0].location.latitude, cats[0].location.longitude]
      : [37.5665, 126.978]

  // 🎯 실시간 내 위치 좌표를 보관할 상태 공간 개설!
  const [userCoords, setUserCoords] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    // 유저의 이동 동선을 실시간으로 계속 감시하는 고정밀 감시 장치(watchPosition) 가동!
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserCoords({ latitude, longitude })
      },
      (error) => console.error("실시간 위치 추적 실패:", error),
      { enableHighAccuracy: true, maximumAge: 0 },
    )

    // 컴포넌트가 꺼질 때 GPS 센서를 안전하게 종료하여 배터리를 절약합니다. (메모리 누수 방지)
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
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

        {/* 유저 위치 */}
        {userCoords && (
          <Marker
            position={[userCoords.latitude, userCoords.longitude]}
            icon={UserLocationIcon}
          >
            <Popup>
              <div style={{ textAlign: "center" }}>
                <strong>🏃‍♂️ 나 (포캣몬 마스터)</strong>
                <p style={{ margin: "4px 0 0", fontSize: "11px" }}>
                  지금 여기서 수색 중!
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        <MapController userCoords={userCoords} />
      </MapContainer>
    </div>
  )
}
