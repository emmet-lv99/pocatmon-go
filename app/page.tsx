"use client"

import { useEffect, useRef } from "react"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 🎯 리액트 클로저 함정을 우회하기 위해 useRef로 캡처 스위치 관리!
  const isCapturedRef = useRef<boolean>(false)
  const renderLoopRef = useRef<(() => void) | null>(null)

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
        // 1단계: 이전 프레임의 흔적을 투명하게 싹 지우기 (청소)
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

        // 🎯 2단계 [여기에 추가!]: 현재 비디오 프레임의 픽셀을 캔버스 전체에 복사해 그리기
        // videoRef.current가 살아있는지 안전장치 검증 후 호출합니다.
        if (videoRef.current) {
          ctx!.drawImage(videoRef.current, 0, 0, canvas!.width, canvas!.height)
        }

        // 🎯 스위치가 켜지면 다음 프레임을 그리지 않고 루프를 그대로 유지(정지)시킵니다!
        if (isCapturedRef.current) {
          // 캔버스 청소(clearRect)와 drawImage를 실행하지 않고,
          // 마지막으로 그려진 픽셀 상태를 도화지에 그대로 박제합니다.
          return
        }

        // 3단계: 가상 물리 좌표 연산 (벽 튕기기 등)
        fakeX += speed
        if (fakeX > canvas!.width - 150 || fakeX < 50) {
          speed *= -1
        }

        // 4단계: 복사된 카메라 화면 위에 "빨간색 추적 박스" 얹어서 그리기
        ctx!.strokeStyle = "#FF0000"
        ctx!.lineWidth = 4
        ctx!.strokeRect(fakeX, 150, 100, 100)

        // 5단계: 다음 주사율 타이밍 예약
        animationFrameId = requestAnimationFrame(render)
      }

      // 루프 첫 시동
      renderLoopRef.current = render
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
    <>
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
            opacity: 0.1,
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
            filter: "grayscale(100%)",
          }}
        />
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {/* 버튼을 누르면 즉시 true로 상태 주입 */}
        <button
          onClick={() => {
            isCapturedRef.current = true
            console.log("캡처 상태:", isCapturedRef.current)
          }}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          캡쳐
        </button>

        {/* [추가] 다시 실시간 재생을 가동할 리셋 버튼 */}
        <button
          onClick={() => {
            // 1. 스위치를 먼저 끈다 (통로 개방)
            isCapturedRef.current = false

            // 2. 끊어진 쇠사슬을 밖에서 수동으로 다시 연결해준다 (시동 걸기)
            if (renderLoopRef.current) {
              renderLoopRef.current() // 🎯 렉 없이 0.001초 만에 즉시 실시간 재생 가동!
            }
          }}
        >
          다시 촬영
        </button>
      </div>
    </>
  )
}
