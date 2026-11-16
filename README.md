<div align="center">

# 📝 Next.js Todo

**Supabase 인증 기반 회원 전용 Todo 리스트**

기존 React Todo 리스트를 Next.js App Router 환경으로 마이그레이션하고,<br/>
Supabase Auth · Database를 연동해 고도화한 프로젝트입니다.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)

🔗 **배포 주소**: [https://ax-frontend-react-next-js-practice.vercel.app](https://ax-frontend-react-next-js-practice.vercel.app)

</div>

---

## 📌 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [라우팅 구조](#-라우팅-구조)
- [렌더링 전략](#-렌더링-전략)
- [시작하기](#-시작하기)
- [진행 현황 & 남은 작업](#-진행-현황--남은-작업)

---

## ✨ 주요 기능

| 기능 | 설명 |
| --- | --- |
| 🔐 **회원가입 / 로그인 / 로그아웃** | Supabase Auth 이메일·비밀번호 인증, `profiles` 테이블 연동 |
| 🛡️ **회원 전용 접근 제어** | Proxy(`proxy.ts`, 구 Middleware)에서 세션을 검증해 미인증 사용자를 `/sign_in?redirectUrl=...`로 리다이렉트 |
| ✅ **할 일 등록** | `useActionState` + Server Action, Tiptap 리치 텍스트 에디터, 필드별 유효성 검사 |
| 🔄 **상태 변경** | 준비중 → 진행중 → 완료, `useOptimistic`으로 즉시 반영 후 실패 시 자동 롤백 |
| ⭐ **찜하기** | Zustand persist 스토어로 찜 목록 관리 (`/todo/pin`) |

---

## 🛠 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| BaaS | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| State | React Hooks (`useState`, `useOptimistic`, `useActionState`, `useTransition`), Zustand, Immer |
| Styling | Tailwind CSS 4, shadcn/ui, lucide-react, react-icons |
| Editor | Tiptap |
| Deploy | Vercel |

---

## 📂 프로젝트 구조

도메인(기능) 단위로 코드를 나누고, 여러 도메인이 함께 쓰는 코드는 `shared/`에 모았습니다.

```
├── app/
│   ├── layout.tsx                 # 루트 레이아웃
│   └── (todo)/                    # 라우트 그룹 (공통 Header 레이아웃)
│       ├── page.tsx               # 할 일 목록 (메인)
│       ├── sign_in/               # 로그인
│       ├── sign_up/               # 회원가입
│       └── todo/
│           ├── new/               # 할 일 등록
│           ├── pin/               # 찜 목록
│           └── [id]/view/         # 할 일 상세 (동적 라우트)
│
├── domains/
│   ├── auth/
│   │   ├── actions/               # 로그인·회원가입·로그아웃 Server Actions
│   │   ├── components/            # SignInForm, SignUpForm, SignOutButton
│   │   ├── queries/               # getCurrentUser (React cache 적용)
│   │   ├── types/
│   │   └── utils/                 # 입력값 유효성 검사
│   └── todo/
│       ├── actions/               # 등록·상태 변경 Server Actions
│       ├── components/            # TodoDashBoard, TodoItems, TodoForm
│       ├── queries/               # getTodos, getTodoById
│       ├── stores/                # usePinStore (Zustand)
│       ├── types/
│       └── utils/                 # DB 응답 변환, 유효성 검사
│
├── shared/
│   ├── components/                # Header, TiptapEditor, ui(shadcn)
│   ├── lib/                       # Supabase 클라이언트, 세션 미들웨어
│   └── types/                     # 공통 ActionState 타입
│
└── proxy.ts                       # 인증 세션 갱신 및 접근 제어 (Next.js 16의 Middleware)
```

---

## 🧭 라우팅 구조

| 경로 | 페이지 | 접근 권한 |
| --- | --- | --- |
| `/` | 할 일 목록 | 🔒 회원 |
| `/todo/new` | 할 일 등록 | 🔒 회원 |
| `/todo/pin` | 찜 목록 | 🔒 회원 |
| `/todo/[id]/view` | 할 일 상세 | 🔒 회원 |
| `/sign_in` | 로그인 | 🔓 비회원 (로그인 상태면 `/`로 이동) |
| `/sign_up` | 회원가입 | 🔓 비회원 (로그인 상태면 `/`로 이동) |

---

## ⚡ 렌더링 전략

| 컴포넌트 | 종류 | 선택 이유 |
| --- | --- | --- |
| `app/(todo)/page.tsx` | 🖥️ Server | 서버에서 Supabase로 할 일 목록을 조회해 초기 HTML에 포함 → 첫 화면 로딩이 빠르고 클라이언트 번들이 줄어듦 |
| `Header` | 🖥️ Server | 쿠키 기반 세션을 서버에서 읽어 로그인 상태에 맞는 UI를 바로 렌더링 |
| `TodoDashBoard`, `TodoItems` | 💻 Client | 상태 변경 클릭, 낙관적 업데이트(`useOptimistic`) 등 사용자 상호작용 담당 |
| `TodoForm`, `SignInForm`, `SignUpForm` | 💻 Client | 입력값 제어, `useActionState`로 Server Action 결과(오류 메시지) 표시 |
| `/todo/pin` | 💻 Client | 브라우저 저장소에 보관된 Zustand 찜 데이터를 읽어 표시 |

**데이터 흐름**

- **조회**: 서버 컴포넌트에서 데이터를 가져와 클라이언트 컴포넌트에 `initialItems` Props로 전달
- **변경**: Server Action으로 처리 후 `revalidatePath`로 화면 갱신
- **인증**: `getCurrentUser`를 React `cache`로 감싸 한 요청 안에서 여러 번 호출해도 Supabase 조회는 한 번만 수행

---

## 🚀 시작하기

### 1. 설치

```bash
git clone https://github.com/yeji-jang/AX_frontend_React_Next.js_practice.git
cd AX_frontend_React_Next.js_practice
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 Supabase 프로젝트 정보를 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 📋 진행 현황 & 남은 작업

### ✅ 완료

- [x] Next.js App Router 기반 프로젝트 구조 구성 (도메인별 폴더 분리)
- [x] Supabase 클라이언트 설정 (서버용 / 브라우저용)
- [x] 회원가입 · 로그인 · 로그아웃 (Server Actions + 유효성 검사)
- [x] Proxy(구 Middleware) 기반 회원 전용 페이지 접근 제어
- [x] Next.js 16 규칙에 맞춰 `middleware.ts` → `proxy.ts` 변경
- [x] 로그인 시 탈퇴 회원 검사 버그 수정 (`deletedAt` → `deleted_at`)
- [x] 할 일 목록 조회 (서버 컴포넌트 → Props 전달)
- [x] 할 일 등록 (Tiptap 에디터, 필드별 오류 메시지)
- [x] 할 일 상태 변경 (낙관적 업데이트 + 실패 시 롤백)
- [x] 찜하기 / 찜 목록 (Zustand)

### 🔥 필수

- [ ] **할 일 상세 페이지 구현** (`/todo/[id]/view`)
  - `params`에서 `id`를 받아 `getTodoById`로 조회
  - 존재하지 않는 id는 `notFound()` 처리
- [ ] **상태별 UI 처리**
  - [ ] 로딩: `loading.tsx` 추가
  - [ ] 오류: `error.tsx` 추가, 조회 실패 시 빈 배열 대신 오류를 던지도록 `getTodos` 수정
  - [ ] 빈 데이터: 목록이 비었을 때 안내 문구 표시 (메인 목록, 찜 목록)
- [ ] **할 일 수정 · 삭제 기능** (상세 페이지에서 처리)

### 🚀 배포

- [x] Vercel에 GitHub 저장소 연결
- [x] Vercel 환경 변수 등록 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- [ ] Supabase Auth의 Site URL / Redirect URL에 배포 주소 추가
- [x] README 상단에 배포 주소 추가

### 🧹 정리

- [ ] Header의 "로고로 채워주세요." 문구를 실제 로고로 교체
- [ ] 중복 파일 정리 (`shared/lib/cn.ts`, `shared/utils/cn.ts`)
- [x] `npm run build`로 경고 확인 (Next 16의 `middleware.ts` → `proxy.ts` 변경 완료)
