"use client"

import { useEffect, useRef, useState } from "react"
// 🎯 1. 설치한 텐서플로우 엔진 및 사전 학습 사물인식 모델 로드
import * as cocoSsd from "@tensorflow-models/coco-ssd"
import * as tf from "@tensorflow/tfjs"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 🧼 자원 누수 차단 및 캡처 제어를 위한 핵심 포인터 객체들
  const isCapturedRef = useRef<boolean>(false)
  const renderLoopRef = useRef<(() => void) | null>(null)

  // 🧠 로드된 AI 모델 객체를 단단히 붙잡아둘 주소록
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)

  // 🔋 화면에 AI 준비 상태를 피드백하기 위한 최소한의 리액트 상태
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true)

  useEffect(() => {
    let streamTracks: MediaStreamTrack[] = []
    let animationFrameId: number
    let isDetecting = false // 🚧 중복 연산으로 인한 모바일 다운 방지 안전장치 스위치!

    async function startCameraAndAI() {
      try {
        // [1단계] 텐서플로우 웹 백엔드(WebGL) 준비 및 AI 모델 비동기 로드
        await tf.ready() // 하드웨어 가속 준비 완료 대기
        const loadedModel = await cocoSsd.load({
          base: "lite_mobilenet_v2", // 모바일 기기에서도 날아다니는 경량화 모델 선택
        })
        modelRef.current = loadedModel
        setIsModelLoading(false) // AI 엔진 탑재 완료!

        // [2단계] 카메라 스트림 가동
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("HTTPS 환경이 아니거나 카메라를 지원하지 않는 브라우저입니다.")
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        })

        streamTracks = stream.getTracks()

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            const videoWidth = videoRef.current!.videoWidth
            const videoHeight = videoRef.current!.videoHeight
            if (canvasRef.current) {
              canvasRef.current.width = videoWidth
              canvasRef.current.height = videoHeight

              // 🚀 두뇌와 도화지가 모두 준비되었으니 무한 루프 시동!
              startDrawingLoop()
            }
          }
        }
      } catch (error) {
        console.error("AI 연동 및 카메라 가동 중 에러 발생:", error)
      }
    }

    function startDrawingLoop() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // 🎨 실시간 분석 & 그리기 엔진 (재귀)
      async function render() {
        // [제어 장치 1] 촬영 버튼 클릭 시 박스 없이 깨끗하게 고정 화면을 박제하고 중단
        if (isCapturedRef.current) {
          return
        }

        ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

        // 1. 현재 카메라 화면을 캔버스 배경으로 복사
        if (videoRef.current) {
          ctx!.drawImage(videoRef.current, 0, 0, canvas!.width, canvas!.height)
        }

        // 2. [핵심 AI 연산] 모델이 로드되었고 이전 분석이 완전히 끝났을 때만 감지 실행
        if (modelRef.current && videoRef.current && !isDetecting) {
          try {
            isDetecting = true // 연산 중 스위치 ON (락 걸기)

            // 찰나의 순간에 카메라 픽셀 이미지 속 사물들을 분석합니다.
            const predictions = await modelRef.current.detect(videoRef.current)

            // 고양이('cat')만 필터링하여 가이드 박스를 올립니다. (테스트용으로 'person' 등도 추적 가능)
            predictions.forEach((prediction) => {
              if (prediction.class === "cat") {
                const [x, y, width, height] = prediction.bbox // 추적된 사물의 실시간 4차원 좌표!

                // 3. 추출된 좌표 자리에 추적 박스 얹기
                ctx!.strokeStyle = "#00FF00" // 이번엔 세련된 녹색 가이드라인!
                ctx!.lineWidth = 4
                ctx!.strokeRect(x, y, width, height)

                // 사물 이름과 신뢰도(Probability) 텍스트 매핑
                ctx!.fillStyle = "#00FF00"
                ctx!.font = "18px sans-serif"
                ctx!.fillText(
                  `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
                  x,
                  y > 20 ? y - 10 : 10,
                )
              }
            })
          } catch (err) {
            console.error("AI 객체 인식 연산 중 실패:", err)
          } finally {
            isDetecting = false // 연산 완료 후 락 해제! (다음 프레임을 위해 통로 개방)
          }
        }

        animationFrameId = requestAnimationFrame(render)
      }

      renderLoopRef.current = render // 외부 수동 시동용 주소록 저장
      render() // 첫 시동
    }

    startCameraAndAI()

    return () => {
      streamTracks.forEach((track) => track.stop())
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
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
        {/* AI 엔진 로딩 중일 때 표시할 안내판 */}
        {isModelLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              zIndex: 10,
            }}
          >
            🐯 타이거 AI 두뇌 탑재 중... 잠시만 기다려주십시오! 어흥!
          </div>
        )}

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
            opacity: 0.1, // 캔버스 드로잉(drawImage)이 온전히 그려지는지 확인하기 위함
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

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => {
            isCapturedRef.current = true
            console.log("포착 완료!")
          }}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          포착하기
        </button>
        <button
          onClick={() => {
            isCapturedRef.current = false
            // 하드웨어 리셋 없이 소프트웨어적으로 꺼진 루프에 수동 시동 걸기!
            if (renderLoopRef.current) {
              renderLoopRef.current()
            }
          }}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            marginLeft: "10px",
            cursor: "pointer",
          }}
        >
          다시 촬영
        </button>
      </div>
    </>
  )
}
