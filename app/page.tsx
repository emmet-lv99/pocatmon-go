"use client"

import { useEffect, useRef } from "react"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let streamTracks: MediaStreamTrack[] = []
    let animationFrameId: number // 🧼 루프 예약을 취소하기 위한 차단기 키값

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

          videoRef.current.onloadedmetadata = () => {
            const videoWidth = videoRef.current!.videoWidth
            const videoHeight = videoRef.current!.videoHeight
            if (canvasRef.current) {
              canvasRef.current.width = videoWidth
              canvasRef.current.height = videoHeight
              // 🚀 돔 해상도 설정이 완료된 직후 실시간 드로잉 루프 가동!
              startDrawingLoop()
            }
          }
        }
      } catch (error) {
        console.error("카메라 하드웨어 연동 에러:", error)
      }
    }

    // 🎨 [실시간 애니메이션 루프 엔진]
    function startDrawingLoop() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // 테스트용 가상 고양이 좌표 ($$X$$축 이동 시뮬레이션 변수)
      let fakeX = 50
      let speed = 2

      function render() {
        // 1단계: 이전 프레임의 낙서 완전히 싹 청소하기
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

        // 테스트용 좌표 연산 (벽에 부딪히면 튕기도록 가상 물리 시뮬레이션)
        fakeX += speed
        if (fakeX > canvas!.width - 150 || fakeX < 50) {
          speed *= -1 // 방향 전환
        }

        // 2단계: 실시간 위치에 빨간색 추적 바운딩 박스 그리기
        ctx!.strokeStyle = "#FF0000" // 테두리 색상 (빨강)
        ctx!.lineWidth = 4 // 선 두께
        ctx!.strokeRect(fakeX, 150, 100, 100) // 사각형 그리기 ($$X$$, $$Y$$, $$Width$$, $$Height$$)

        // 3단계: 브라우저 주사율에 맞춰 다음 프레임 예약 (무한 재귀)
        animationFrameId = requestAnimationFrame(render)
      }

      // 루프 첫 시동
      render()
    }

    startCamera()

    // 🧼 [메모리 누수 차단] 컴포넌트 종료 시 카메라 장치를 즉시 완전히 물리적으로 종료
    return () => {
      streamTracks.forEach((track) => track.stop())
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId) // 애니메이션 무한 루프 예약 강제 취소
      }
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
