// app/page.tsx
"use client"

import dynamic from "next/dynamic"

// 🧠 Leaflet의 window 객체 의존성을 방어하기 위해 SSR을 비활성화한 동적 임포트를 적용합니다!
const MultiMapWithNoSSR = dynamic(() => import("../components/map/MultiMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      지도를 불러오는 중입니다... 어흥!
    </div>
  ),
})

export default function Home() {
  return (
    <main
      style={{
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <header style={{ textAlign: "center" }}>
        {/* <h1 style={{ color: "#ff9900", margin: "0 0 10px 0" }}>
          🍊 poCATmon 사냥 지도
        </h1>
        <p style={{ margin: 0, color: "#666" }}>
          현재 우리 동네에 출몰한 고양이들의 실시간 좌표 정보입니다.
        </p> */}
      </header>

      {/* 📍 안전하게 동적 로딩된 지도 렌더링 */}
      <MultiMapWithNoSSR />
    </main>
  )
}
