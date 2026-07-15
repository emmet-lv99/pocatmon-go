pocatmon/
├── app/                           # 🌐 [Next.js Routing] 페이지 및 레이아웃 정의 (Route Group)
│   ├── layout.tsx                 # 앱 전체 공통 레이아웃 (HTML 뼈대, 전역 상태 공급 등)
│   ├── page.tsx                   # [메인 화면] 실시간 AI 카메라 + 하단 미니 도감 뷰
│   ├── collection/                # [도감 도메인]
│   │   ├── page.tsx               # 내가 수집한 전체 고양이 목록 (필터/정렬)
│   │   └── [id]/                  # [동적 라우팅]
│   │       └── page.tsx           # 고양이 상세 정보 및 개별 지도 뷰
│   └── global.css                 # 전역 스타일링
│
├── components/                    # 🧱 [UI Components] 재사용 가능한 클라이언트/서버 컴포넌트
│   ├── common/                    # 버튼, 모달, 인풋 등 도메인에 종속되지 않는 공용 UI
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── map/                       # 지도 관련 컴포넌트 (Dynamic Import 대상)
│   │   ├── MultiMap.tsx           # Zustand 데이터를 구독하는 다중 마커 지도
│   │   └── SingleMap.tsx          # 상세 페이지용 단일 마커 지도
│   └── camera/                    # AI 및 비디오 스트리밍 관련 컴포넌트
│       ├── CameraView.tsx         # 웹캠 비디오 및 캔버스 오버레이
│       └── CaptureButton.tsx      # 캡처 및 GPS 트리거 버튼
│
├── store/                         # 🧠 [State Management] 전역 상태 관리 (Zustand)
│   └── catStore.ts                # 고양이 데이터 스토어 (persist 미들웨어 내장)
│
├── hooks/                         # 🎣 [Custom Hooks] 비즈니스 로직 및 부수 효과 분리
│   ├── useCamera.ts               # 카메라 미디어 스트림 제어 로직
│   └── useGeolocation.ts          # HTML5 Geolocation 좌표 수집 로직
│
├── types/                         # 📐 [TypeScript Types] 공통 데이터 스키마 정의
│   └── index.ts                   # CaughtCat 인터페이스 등 전역 타입 선언
│
├── utils/                         # 🛠️ [Helper Functions] 순수 유틸리티 함수 (Side Effect 없음)
│   ├── date.ts                    # 날짜 포맷팅 헬퍼 (예: 2026-07-15 15:54)
│   └── grade.ts                   # AI score 기준 등급 판별 헬퍼 (UR, SR, Normal)
│
├── public/                        # 🎨 [Static Assets] 정적 파일 보관소 (이미지, 효과음 등)
│   ├── images/
│   └── sounds/                    # 캡처 효과음 (.mp3)
│
├── tailwind.config.js             # 스타일링 설정 파일
├── tsconfig.json                  # 타입스크립트 설정 파일
└── package.json