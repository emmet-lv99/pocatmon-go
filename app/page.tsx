"use client"

import { useEffect, useRef } from "react"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let streamTracks: MediaStreamTrack[] = []

    async function startCamera() {
      try {
        // [보안 환경 검증] HTTPS 환경 체크
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("HTTPS 환경이 아니거나 카메라를 지원하지 않는 브라우저입니다.")
          return
        }

        // [최적화 트랙 획득] 모바일 후면 카메라 스트림만 가볍게 요청
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false, // 불필요한 오디오 권한 제외로 하드웨어 부하 감소
        })

        streamTracks = stream.getTracks()

        // [비디오 바인딩] React Ref에 스트림 주입
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("카메라 하드웨어 연동 에러:", error)
      }
    }

    startCamera()

    // 🧼 [메모리 누수 차단] 컴포넌트 종료 시 카메라 장치를 즉시 완전히 물리적으로 종료
    return () => {
      streamTracks.forEach((track) => track.stop())
    }
  }, [])

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      {/* 사파리 및 크롬 모바일 렌더링 무조건 보장 속성 패키지 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "12px",
          backgroundColor: "#000",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
