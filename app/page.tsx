"use client"

import { useEffect, useRef, useState } from "react"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let localStream: MediaStream | null = null

    async function setupCamera() {
      try {
        // [1단계] 사파리 및 모던 브라우저 규격에 맞게 API 존재 여부 검증
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            "이 브라우저 혹은 환경(비보안 HTTPS)에서는 카메라를 지원하지 않습니다.",
          )
        }

        // [2단계] 비디오 장치 권한 요청 및 스트림 획득 (오디오 제외로 성능 최적화)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // 스마트폰의 후면 카메라를 우선 타겟팅
            width: { ideal: 640 }, // 텐서플로우 COCO-SSD 연산에 가장 최적화된 해상도
            height: { ideal: 480 },
          },
          audio: false,
        })

        localStream = stream

        // [3단계] HTML5 비디오 태그에 스트림 주입 및 재생
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err: any) {
        console.error("카메라 로드 실패:", err)
        setErrorMsg(
          err.name === "NotAllowedError"
            ? "카메라 권한이 거부되었습니다. 설정에서 권한을 허용해주세요."
            : err.message,
        )
      }
    }
  }, [])
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "640px" }}>
      {errorMsg ? (
        <div style={{ color: "red", padding: "20px", border: "1px solid red" }}>
          ⚠️ {errorMsg}
        </div>
      ) : (
        /* 🔥 사파리 크로스브라우징을 완벽 저격하는 3대 속성 주입 완료 */
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "auto", borderRadius: "8px" }}
        />
      )}
    </div>
  )
}
