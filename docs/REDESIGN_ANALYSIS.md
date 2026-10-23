# 성결대 컴퓨터공학과 졸업작품 온라인 전시: 리디자인 사전 분석

> 작성일: 2026-10-23
> 범위: `src/` 전체(약 10,500줄), 빌드 산출물(`dist/`), 정적 자원, 의존성
> 목적: 전면 리디자인 전에 현재 상태를 진단하고 재설계 방향과 새 디자인 브리프를 정한다. 이 문서 단계에서는 코드를 수정하지 않는다.

---

## 0. 요약 (TL;DR)

| 영역 | 진단 | 심각도 |
|---|---|---|
| **성능** | 공개 페이지에 27MB PNG, 15MB PNG, 31MB MP4가 그대로 번들링된다. JS는 단일 청크 1.25MB이고, 관람객도 관리자용 MUI DataGrid까지 내려받는다. | 🔴 치명 |
| **디자인 정체성** | 2020년 전후 SaaS 템플릿 느낌(파랑-보라 그라데이션 버튼, 두꺼운 그림자, 떠다니는 원형 영상)이다. "전시"로서의 키 비주얼과 주제가 없다. | 🔴 |
| **UX 버그** | 카테고리 필터의 선택 상태가 보이지 않는다. 작품 제목이 hover에서만 보여 모바일에서는 볼 수 없다. `/`로 접속하면 404가 뜬다. 로딩·빈 상태·에러 상태가 없다. | 🔴 |
| **설계** | 서버 상태 캐시가 없다. URL과 Redux에 연도가 이중으로 관리된다. 라우트마다 레이아웃이 다시 마운트된다. 모달 훅이 렌더마다 컴포넌트를 새로 만든다. 저장 흐름이 원자적이지 않다. | 🟠 |
| **접근성·SEO** | 클릭 가능한 `div`, `alt` 누락, ESC·포커스 트랩이 없는 모달, `lang="en"`. SPA라서 작품별 메타/OG 태그가 없다. | 🟠 |
| **코드 위생** | 주석 처리된 죽은 코드가 약 2,800줄이다. 쓰지 않는 의존성이 8개 이상이다. CSS-in-JS 런타임 2개(styled-components, emotion)가 함께 돈다. | 🟡 |

**결론:** 디자인만 바꾸는 것으로는 부족하다. 미디어 파이프라인, 라우팅/데이터 계층, 컴포넌트 기반(디자인 시스템)을 함께 재구축하는 것이 맞다. 백엔드 API 계약은 대부분 유지할 수 있다.

---

## 1. 현재 프로젝트 구조

### 1.1 기술 스택

- React 19, Vite 6, TypeScript 5.7 (strict)
- 스타일: styled-components 6가 주력이다. 관리자 화면은 MUI 6(emotion)이다.
- 상태: Redux Toolkit과 redux-persist(localStorage)
- 라우팅: react-router-dom 7 (`createBrowserRouter` 안에 다시 `<Routes>`를 중첩)
- 애니메이션: framer-motion 12
- 통신: axios (`withCredentials`, 쿠키 인증), S3 presigned URL과 multipart 업로드

### 1.2 라우트 맵

| 경로 | 페이지 | 비고 |
|---|---|---|
| `/` | **404** | 루트 경로에 해당하는 라우트가 없다 ([routes/index.tsx](../src/routes/index.tsx)) |
| `/:year` | `YearHomePage` | 연도 값을 검증하지 않아 `/abc`도 렌더된다 |
| `/:year/project` | `ProjectPage` | 작품 목록과 카테고리 필터 |
| `/:year/project/:team_uuid` | `TeamPage` | 작품 상세 |
| `/:year/project/:team_uuid/edit` | `TeamEditPage` | 클라이언트 라우트 가드가 없다 |
| `/:year/admin` | `AdminPage` | 탭 5개(학생/팀/계정/교수/홈). 가드가 없다 |
| (미연결) | `DisplayMap` | 내용이 `<div>DisplayMap</div>`뿐이다 |

### 1.3 디렉터리와 규모

```
src/
├─ api/          9개. 도메인별 axios 래퍼
├─ components/
│  ├─ grid/      관리자 DataGrid (ProfessorGrid 1,377줄, StudentGrid 651줄, HomeGrid 525줄 …)
│  ├─ csv/       CSV 업로더 (AccountCSVUploader 923줄)
│  ├─ ui/        Button, Input (루트의 Input.tsx와 중복)
│  └─ …          Header, Footer, Modal, Login, Profile, SlideImage …
├─ pages/        6개 + styled 파일 2개
├─ store/        auth, exhibitionYear
├─ hooks/        useModal, usePrompt, useSpinner, useToast
├─ interface/    도메인 타입
├─ constant/     카테고리, 홈 문구, 관리자 메뉴
└─ style/        global.css, index.ts (토큰이 있으나 대부분 쓰이지 않음)
```

- 전체 약 10,500줄 중 **약 2,800줄이 주석 처리된 이전 버전 코드**다 (`ProfessorGrid` 795줄, `AccountCSVUploader` 556줄, `TeamPage` 262줄 등).
- 관리자 코드가 전체의 약 45%를 차지하는데, 공개 번들과 분리되어 있지 않다.

---

## 2. 디자인 분석: 편의성과 "시간을 타지 않는 트렌디함"

### 2.1 총평

현재 디자인은 **유행을 탄 장식에 기대고, 작품을 주인공으로 세우지 못했다.** 졸업전시 사이트의 본질은 "작품과 사람"인데, 화면의 시선은 그라데이션 버튼, 원형 영상, 그림자에 먼저 간다. 회차를 상징하는 전시 아이덴티티(주제, 키 비주얼, 그래픽 모티프)도 없어서 2024년과 2025년이 구분되지 않는다.

### 2.2 시각 요소별 진단

| 요소 | 현재 | 문제 |
|---|---|---|
| **컬러** | 버튼은 `#7fbfff → #a389f4` 그라데이션이다. 배지는 `#2a4fa4`와 `#8a2be2`, 링크는 `#0070f3`, `#007bff`, `#2563eb`가 섞여 있다. 토큰 파일 `style/index.ts`에는 주황/빨강이 정의되어 있지만 쓰이지 않는다. | 체계 없이 파란 계열만 6종 이상이다. 파스텔 그라데이션과 보라는 2019~2021년 트렌드라 금방 낡아 보인다. |
| **타이포** | `Pretendard-Regular` 한 굵기만 `@font-face`로 등록했다. 제목에 `Cinzel`, `Montserrat`을 지정했지만 **폰트를 로드하지 않는다.** | bold가 브라우저 가짜 굵기(faux bold)로 렌더된다. 지정 폰트가 없으니 Times New Roman이나 sans-serif로 대체된다. `ProfileView`는 정의되지 않은 `"Pretendard"`를 참조한다. 위계를 만들 굵기와 크기 스케일이 없다. |
| **레이아웃** | 페이지마다 `max-width: 80%`, `padding: 5rem`, `gap: 5rem` 등 임의의 값을 쓴다. 공통 그리드가 없다. | 페이지 간 정렬선이 맞지 않는다. 와이드 모니터에서는 늘어지고, 작품 그리드 간격 5rem은 지나치게 넓다. |
| **깊이/효과** | 거의 모든 요소에 `box-shadow`와 hover 시 `translateY(-4~5px)`가 들어가 있다. 인트로 섹션에는 `background-attachment: fixed`와 50% 검정 오버레이를 썼다. | 효과가 과하면 위계가 사라진다. `fixed` 배경은 iOS Safari에서 동작하지 않고 스크롤 성능도 떨어뜨린다. |
| **모션** | 홈에서 원형 영상이 무한히 위아래로 떠다닌다. 라우트 전환마다 0.6초 easeIn이 걸리고, 인트로는 1.2~1.5초 지연 후 나타난다. | 콘텐츠가 늦게 나타나 "느린 사이트"처럼 느껴진다. `prefers-reduced-motion`을 지원하지 않는다. |
| **언어** | 화면 라벨은 영어 대문자(PROJECT, LOGIN, EDIT)인데 본문과 토스트는 한국어다. 로그인 placeholder는 `password`다. | 톤이 일관되지 않다. 학부모, 기업 관계자 등 일반 관람객에게 영어 UI는 진입 장벽이 된다. |
| **푸터** | 모바일에서 `font-size: 0.5rem`(8px)이다. | 읽을 수 없다. 접근성 기준에도 미달한다. |

### 2.3 페이지별 UX 진단

**홈 (`YearHomePage`)**
- 히어로는 "GRADUATION EXHIBITION" 영문 제목, 원형 영상, 날짜, 버튼으로 구성된다. **올해 전시의 주제나 슬로건이 없다.** 날짜와 시간만 있고 장소, 오프라인 관람 정보, 지도도 없다.
- 날짜·시간은 API 응답이 오기 전까지 빈 칸이다. 로딩 상태를 표시하지 않는다.
- "PROJECTS" 마퀴는 팀 썸네일을 **50번 복제해 두 줄**로 흘린다 ([SlideImage.tsx:74](../src/components/SlideImage.tsx#L74)). 30팀이면 `<img>`가 3,000개가 된다. 썸네일을 클릭해도 작품으로 이동하지 않는다. 역방향 키프레임(`-50% → 50%`)과 정방향 키프레임(`0 → -100%`)이 맞지 않아 빈 구간이 생긴다.
- 인트로 문구는 하드코딩된 상투적 인사말이다 (`constant/homeText.ts`). 관리자가 회차별로 수정할 수 없다.

**작품 목록 (`ProjectPage`)**
- 🔴 **카테고리 버튼의 선택 상태가 보이지 않는다.** `color` prop을 넘기지만 스타일에서 쓰지 않는다 ([ProjectPage.tsx:258](../src/pages/ProjectPage.tsx#L258)). 사용자는 지금 어떤 필터가 걸려 있는지 알 수 없다.
- 🔴 **작품 제목이 hover 오버레이에서만 보인다.** 터치 기기에서는 제목을 볼 방법이 없다. 카드에는 팀명만 있고, 그 팀명도 `bottom: -2rem` 절대 위치라 그리드 간격에 의존한다.
- 필터 상태가 URL에 남지 않는다. 상세 페이지에 들어갔다가 돌아오면 ALL로 초기화되고, 필터 링크를 공유할 수도 없다.
- 검색, 정렬, 리스트 보기, 결과 개수 표시, 빈 상태 안내가 없다.
- 이미지가 없는 팀의 대체 이미지로 **15MB `main_image.png`** 를 쓴다.

**작품 상세 (`TeamPage`)**
- 정보 순서가 제목·설명 → 멤버 → 영상 → 포스터다. 관람객이 가장 먼저 보고 싶은 **시연 영상과 대표 이미지가 아래에 묻혀 있다.**
- 기술 스택, GitHub·데모 링크, 문제 정의와 해결 같은 구조화된 정보가 없다. 설명은 500자 자유 텍스트 하나뿐이다.
- 로딩 중에는 "PROJECT TITLE", "PROJECT DESCRIPTION"이라는 placeholder가 잠깐 보인다.
- 좌우 고정 원형 버튼(←/→)이 본문 위에 떠서 모바일에서 콘텐츠를 가린다. 다음 작품이 무엇인지 미리 보여주지 않는다.
- 영상이나 포스터가 없으면 섹션 제목만 남고 내용은 비어 있다.
- 멤버 프로필을 모달로 열지만 닫기 버튼과 ESC 닫기가 없다.

**편집 (`TeamEditPage`)**
- 디자인 언어가 공개 페이지와 다르다. 실제 결과가 어떻게 보이는지 미리보기가 없다.
- 영상 500MB 업로드의 진행률은 전체 화면 스피너 하나로만 보여준다. 개별 파일 상태, 취소, 재시도가 없다.

**관리자 (`AdminPage`)**
- MUI 기본 스타일과 직접 만든 탭(`width: 50%`)이 섞여 있다. 고정 헤더가 상단을 가린다.

### 2.4 "시간을 타지 않는 디자인"의 기준

리디자인에서는 아래 원칙을 지킨다.

1. **콘텐츠가 주인공이다.** 장식(그라데이션, 그림자, 상시 애니메이션)은 0에 가깝게 줄이고 작품 이미지와 영상이 화면 대부분을 차지하게 한다.
2. **타이포그래피와 그리드로 위계를 만든다.** 색과 그림자 대신 크기, 굵기, 여백으로 구분한다. 이런 방식은 10년이 지나도 낡지 않는다.
3. **중립 팔레트에 회차별 포인트 컬러 하나를 쓴다.** 구조는 고정하고, 매년 바뀌는 아이덴티티는 CSS 변수 몇 개로만 교체한다. 이렇게 하면 아카이브의 일관성과 회차의 개성을 함께 얻는다.
4. **모션은 의미가 있을 때만 쓴다.** 상태 변화(필터, 페이지 전환, 미디어 등장)에만 200~300ms를 쓰고, reduced-motion을 존중한다.
5. **모바일을 먼저 설계한다.** 관람객 상당수가 오프라인 전시장에서 QR로 접속한다. hover에 의존하는 정보가 있어서는 안 된다.

---

## 3. 설계 분석: 급하게 개발된 흔적과 재설계

### 3.1 성능과 미디어 (🔴 최우선)

| 문제 | 근거 | 영향 |
|---|---|---|
| 초대형 정적 자원 | `back_image.png` 27MB, `main_image.png` 15MB, `v1.mp4` 31MB, `user.png` 685KB가 `src/assets`에서 import되어 해시 파일로 번들링된다. `public/`에도 중복 존재한다. | 홈 첫 방문에 **약 60MB**(배경 27MB, 영상 31MB, JS·폰트 2MB)를 받는다. 모바일 LTE에서 수십 초가 걸린다. OG 이미지도 15MB라 카카오톡·슬랙 미리보기가 실패할 수 있다. |
| 폰트 | Pretendard Regular woff2가 766KB이고 서브셋을 쓰지 않는다. 나머지 8개 굵기는 저장소에만 있고 쓰이지 않는다. | 텍스트 렌더가 지연된다. |
| 단일 JS 청크 1.25MB | 라우트 코드 스플리팅이 없다. MUI, DataGrid, papaparse, dnd-kit이 공개 페이지에 포함된다. | 관람객에게 필요 없는 관리자 코드가 실린다. |
| 캐시 무력화 | 상세 페이지가 모든 미디어 URL에 `?v=${Date.now()}`를 붙인다 ([TeamPage.tsx:173-188](../src/pages/TeamPage.tsx#L173-L188)). | CloudFront와 브라우저 캐시가 **방문할 때마다** 깨진다. CDN 비용이 늘고 로딩이 느려진다. |
| 사전 요청 | 영상을 보여주기 전에 `HEAD` 요청을 하고, 포스터는 `new Image()`로 미리 로드한다. | 왕복이 추가되고, 그동안 화면이 비어 있다. |
| 썸네일 부재 | 원본 업로드 이미지를 목록 카드에 그대로 쓴다. `loading="lazy"`, `srcset`이 없다. | 목록 페이지 용량이 폭증한다. |

**재설계**
- 정적 자원은 WebP/AVIF로 변환해 히어로 이미지는 300KB 이하로 줄인다. 히어로 영상은 H.264/WebM 720p, 3MB 이하로 만들고 `poster` 속성을 둔다. 저사양·reduced-motion 환경에서는 정지 이미지를 보여준다.
- 업로드 이미지는 S3 업로드 이벤트를 Lambda(sharp 등)로 받아 썸네일 3종(400/800/1600px, WebP)을 생성한다. 프론트는 `srcset`과 `sizes`를 쓴다. *백엔드 협의가 필요하다.*
- 캐시 버스팅은 `Date.now()` 대신 서버가 내려주는 `updatedAt`이나 콘텐츠 해시 기반 키를 쓴다.
- 폰트는 Pretendard Variable의 dynamic subset(CDN)이나 KS X 1001 서브셋 woff2를 쓰고 `font-display: swap`을 건다.
- 라우트 단위로 `lazy()`를 적용하고 `/admin`은 별도 청크로 분리한다. 예산은 공개 페이지 초기 JS 200KB(gzip) 이하로 잡는다.

### 3.2 라우팅과 레이아웃

| 문제 | 근거 |
|---|---|
| 루트 `/`가 404다 | `children: [{ path: "*" }]` 아래 `<Routes>`에 `/` 매칭이 없다. 서버에서 리다이렉트하지 않으면 메인 도메인으로 들어온 사람은 404 페이지를 본다. |
| 연도를 검증하지 않는다 | `/:year`에 아무 문자열이나 들어간다. 헤더의 연도 목록은 `START_YEAR`(2023)부터 **현재 달력 연도**까지라서, 아직 전시가 없는 연도도 노출된다. |
| Data Router를 반쯤만 쓴다 | `createBrowserRouter` 안에서 다시 `<Routes>`를 쓰는 구조다. loader, errorElement, `ScrollRestoration`, lazy route 같은 기능을 쓸 수 없어서 `window.scrollTo(0,0)`을 수동으로 호출한다. |
| 레이아웃이 다시 마운트된다 | 라우트마다 `<DefaultLayout>`을 감싸고 `AnimatePresence key={pathname}`을 쓴다. 그래서 이동할 때마다 헤더와 푸터까지 언마운트·리마운트되고, exit 애니메이션 0.6초만큼 전환이 늦어진다. |
| 권한 가드가 없다 | `/edit`, `/admin`은 클라이언트에서 막지 않고 API 401에만 의존한다. 401 인터셉터는 `alert()`를 띄운 뒤 **현재 달력 연도**로 강제 이동한다. |

**재설계:** React Router 7을 그대로 쓰되 다음처럼 바꾼다.
```
/                      → loader: 최신 전시 연도 조회 후 redirect
/:year                 → 전시 홈           (loader: 연도 유효성 검사, 없으면 404)
/:year/works           → 작품 목록 (?category=&q=&view=grid|list)
/:year/works/:slug     → 작품 상세         (uuid 대신 읽기 쉬운 slug 권장, uuid 병행 가능)
/:year/people          → 참여자 인덱스 (학생·지도교수)
/:year/about           → 전시 소개, 오프라인 관람 정보, 크레딧
/archive               → 역대 전시
/studio/:team          → 팀 편집           (RequireAuth: TEAM 또는 ADMIN)
/admin/*               → 관리자 (lazy chunk, RequireAuth: ADMIN, 하위 탭을 URL로)
```
- 레이아웃 라우트(`<RootLayout><Outlet/></RootLayout>`)를 하나만 두고, 전환 애니메이션은 콘텐츠 영역에만 짧게(150~200ms) 준다.
- `errorElement`로 404와 500을 처리하고, `ScrollRestoration`을 쓴다.
- 기존 URL(`/:year/project/:uuid`)은 새 URL로 리다이렉트해서 이미 공유된 링크를 보존한다.
- **SEO:** React Router 7 framework mode의 `prerender`로 공개 페이지(연도 홈, 목록, 각 작품)를 빌드 시 정적 HTML로 만든다. 작품별 `<title>`, `og:image`, 설명이 들어가야 공유 미리보기가 정상으로 나온다.

### 3.3 데이터와 상태 관리

| 문제 | 근거 |
|---|---|
| 서버 상태 캐시가 없다 | `ProjectPage`와 `TeamPage`가 같은 `getProjects(year)`를 각자 호출한다. 목록에서 상세로 갔다가 돌아오면 매번 다시 불러온다. |
| 진실의 원천이 둘이다 | 연도가 URL `:year`와 Redux `exhibitionYear` 양쪽에 있다. Redux 쪽 값은 사실상 쓰이지 않는다. |
| 인증 정보를 localStorage에 둔다 | redux-persist가 `accessToken`, `role`, `uuid`를 평문으로 저장한다. 실제 인증은 쿠키(`withCredentials`)로 하기 때문에 **`accessToken`은 저장만 하고 쓰지 않는다.** XSS가 생기면 노출될 위험만 남는다. `role`도 클라이언트 값이라 사용자가 조작할 수 있다. 다만 UI 노출만 바뀌고, 실제 권한은 서버가 검증해야 한다. |
| 에러를 삼킨다 | `catch { console.error() }`처럼 **인자 없이** 로그를 찍는 곳이 여러 군데다 ([TeamPage.tsx:156](../src/pages/TeamPage.tsx#L156), [YearHomePage.tsx:221](../src/pages/YearHomePage.tsx#L221), [Header.tsx:139](../src/components/Header.tsx#L139)). API 래퍼도 `throw new Error(\`${error}\`)`로 상태 코드와 응답 본문을 버린다. |
| API 형태가 일관되지 않다 | 조회에 `POST /public/post/search`를 쓴다. `postGetTeampostEdit`는 문자열 그대로 body에 넣는다. URL 쿼리를 문자열 결합으로 만든다(`?year=${year}`). 오타가 난 경로(`teamProflie`)도 있다. |

**재설계**
- **TanStack Query**로 서버 상태(캐시, 재시도, 로딩/에러 상태, prefetch)를 관리한다. 목록 카드에 hover하거나 화면에 보일 때 상세를 prefetch한다.
- Redux와 redux-persist는 제거한다. 인증은 `GET /me`로 세션을 확인하는 `useSession()` 훅이면 충분하다. 토큰은 httpOnly 쿠키에만 둔다.
- UI 상태(필터, 검색, 보기 모드)는 URL 쿼리에 둔다.
- API 계층은 `api/client.ts`(axios 인스턴스와 에러 정규화)와 `features/*/api.ts`로 나눈다. 응답은 **zod 스키마로 런타임 검증**해서 백엔드 변경을 빨리 감지한다.

### 3.4 컴포넌트와 훅 결함

| 결함 | 위치 | 설명 |
|---|---|---|
| 모달 컴포넌트를 렌더마다 새로 만든다 | [useModal.tsx:17](../src/hooks/useModal.tsx#L17) | 렌더할 때마다 새 함수 컴포넌트를 반환하기 때문에, 부모가 다시 렌더되면 React는 다른 컴포넌트로 보고 **모달 내용 전체를 언마운트·리마운트한다.** 모달 안 폼(학생 프로필 편집 등)의 입력값이 날아갈 수 있는 잠재 버그다. ESC, 포커스 트랩, `aria-modal`, 스크롤 잠금, 닫기 버튼도 없다. |
| 헤더가 전역 `location`을 쓴다 | [Header.tsx:134](../src/components/Header.tsx#L134) | `useLocation`을 쓰지 않고 `window.location`을 암묵적으로 참조한다. 스크롤 이벤트마다 `controls.start()`를 호출하고(throttle 없음), 투명 배경이라 본문 위에 겹친다. |
| 사용하지 않는 prop 전달 | [ProjectPage.tsx:258](../src/pages/ProjectPage.tsx#L258) | 앞에서 설명한 카테고리 활성 상태 누락이다. |
| 상호작용 요소를 `div`로 만들었다 | `TeamBox`, `StudentItem`, `NavItem`, 관리자 `MenuItem` | 키보드로 접근할 수 없고 스크린리더가 인식하지 못한다. 대부분의 `<img>`에 `alt`가 없다. |
| 목차 링크가 `href="#"`이다 | `TableOfContents` | 앵커 공유가 안 된다. 1.5초 타임아웃으로 lock을 거는 방식이라 스크롤 감지가 불안정하다. |
| 같은 역할의 컴포넌트가 중복된다 | `components/Input.tsx`와 `components/ui/Input.tsx`, `ProfileView`와 `ProfessorProfileView` | 공통 디자인 시스템 없이 필요할 때마다 만든 결과다. |

### 3.5 팀 편집과 업로드 흐름 (데이터 무결성)

`TeamEditPage.handleSave`의 순서는 다음과 같다.

```
presigned 발급 → 영상 multipart 업로드(전 파트 동시) → 이미지 업로드
→ PUT teamPost → 학생별 PUT (병렬)
```

| 문제 | 설명 |
|---|---|
| **영상 삭제가 전달되지 않을 가능성이 높다** | 삭제 시 `demoVideo: null`로 설정하지만 ([TeamEditPage.tsx:531](../src/pages/TeamEditPage.tsx#L531)), 서버에 보내는 operation은 `=== ""`일 때만 DELETE다 ([TeamEditPage.tsx:360](../src/pages/TeamEditPage.tsx#L360)). 그래서 `UPLOAD`와 빈 URL이 전송된다. 이미지 삭제는 `""`로 설정하므로 정상이다. 백엔드가 빈 값을 어떻게 해석하는지 확인이 필요하다. |
| 원자성이 없다 | 팀 글 저장이 성공한 뒤 학생 저장 중 하나라도 실패하면 일부만 반영된다. 사용자에게는 "저장 실패"만 표시되어 실제로 무엇이 저장됐는지 알 수 없다. |
| 고아 파일 | S3 업로드 후 DB 저장이 실패하면 업로드한 파일이 남는다. 실패한 multipart를 abort하지 않는다. |
| 동시성 제한이 없다 | 500MB 영상을 10MB 파트로 나누면 **PUT 50개를 동시에** 보낸다. 브라우저 연결 수 제한과 모바일 네트워크에서 타임아웃이 나기 쉽고, 파트 재시도도 없다. ETag 헤더를 읽으려면 S3 CORS의 `ExposeHeaders`에 의존해야 한다. |
| 메모리 누수 | 렌더할 때마다 `URL.createObjectURL()`을 호출하고 해제하지 않는다 ([TeamEditPage.tsx:464](../src/pages/TeamEditPage.tsx#L464), [L545](../src/pages/TeamEditPage.tsx#L545)). |
| 형식 처리 | `accept=".jpg,.png"`만 허용한다. 다른 MIME(webp, heic)은 `mimeToExt`가 `"unsupported"`를 확장자로 보낸다. 파일 크기는 클라이언트에서 검증하지 않는다(안내 문구만 있음). |
| 저장 후 이동 | `navigate(-1)`을 쓴다. 편집 페이지로 바로 들어온 경우에는 사이트 밖으로 나가 버린다. 응답이 falsy면 아무 피드백 없이 끝난다. |
| 외부 링크 검증 | 학생이 입력한 블로그와 GitHub URL을 검증 없이 `href`에 넣는다. React 19가 `javascript:` URL을 막아 주지만, `http(s)` 스킴 검사와 정규화는 직접 해야 한다. |

**재설계**
- 폼은 react-hook-form과 zod로 만든다(필드 검증, dirty 추적, 글자 수 제한).
- 업로드 큐를 둔다. 동시 실행 4개, 파트별 지수 백오프 재시도, 취소(AbortController), 파일별 진행률을 지원한다. 실패하면 `AbortMultipartUpload`를 호출한다.
- 저장은 두 단계로 나눈다. ① 모든 파일 업로드를 끝낸 뒤 ② **단일 커밋 API**(팀 글과 학생 프로필 일괄 저장)를 트랜잭션으로 호출한다. *백엔드 협의가 필요하다.* 최소한 실패한 항목을 목록으로 보여준다.
- 미리보기 모드에서 공개 상세 페이지 컴포넌트를 그대로 재사용한다. 입력 내용은 자동으로 임시 저장(localStorage draft)한다.

### 3.6 코드 위생과 개발 환경

- 주석 처리된 이전 구현 약 2,800줄을 삭제한다. 이력은 git이 보관한다.
- 쓰이지 않는 의존성을 제거한다: `ag-grid-community`, `ag-grid-react`, `react-scroll`, `react-responsive`, `polished`, `react-transition-group`, `history`, `path`. `@mui/x-data-grid-generator`는 데모용이다. `@types/node`는 devDependencies로 옮긴다.
- 스타일 시스템은 하나로 통일한다(아래 4.5 참고). styled-components와 emotion을 함께 돌리지 않는다.
- `index.html`: `lang="ko"`로 바꾼다. favicon의 `type`이 svg로 되어 있지만 실제 파일은 png다. OG 태그를 보강한다(`og:title`, `og:url`, `twitter:card`).
- 테스트가 전혀 없다. Vitest로 유틸, 훅, 업로드 큐를 테스트하고 Playwright로 핵심 흐름(목록 → 상세 → 로그인 → 편집 저장) 스모크 테스트를 만든다.
- CI(GitHub Actions)에서 lint, typecheck, test, build, Lighthouse CI(성능 90 이상, 접근성 95 이상)를 돌린다.
- 저장소 소유권 경고(`git safe.directory`)가 있다. 개발 PC 환경 문제라 코드와는 무관하다.

### 3.7 목표 구조 (feature-based)

```
src/
├─ app/            router.tsx, providers.tsx, RootLayout.tsx
├─ shared/
│  ├─ ui/          Button, Dialog, Select, Tabs, Badge, Media, Skeleton … (디자인 시스템)
│  ├─ styles/      tokens.css (색·타입·간격·모션), globals.css
│  ├─ lib/         api client, upload queue, url, format
│  └─ hooks/
├─ features/
│  ├─ exhibition/  홈, about, 연도 테마 (api, components, routes)
│  ├─ works/       목록, 필터, 상세
│  ├─ people/      학생·교수 인덱스와 프로필
│  ├─ auth/        세션, 로그인 다이얼로그, RequireAuth
│  ├─ studio/      팀 편집 (폼, 업로드)
│  └─ admin/       lazy chunk (기존 grid/csv 이관 후 정리)
└─ main.tsx
```

---

## 4. 새 디자인: 레퍼런스 조사와 디자인 방향

### 4.1 조사한 레퍼런스

> 국내 졸업전시 사이트 대부분이 클라이언트 렌더링 SPA라서 자동 수집으로는 텍스트 구조만 일부 확인됐다. 시각 디자인은 아래 링크에서 직접 확인하기를 권한다. 표에서 **[확인]** 은 이번 조사에서 실제로 확인한 내용이고, **[패턴]** 은 이 장르에서 일반적으로 쓰이는 관례다.

| 레퍼런스 | 참고 포인트 |
|---|---|
| [KHVD 2025: 경희대 시각디자인](https://2025.khvd.kr/) | **[확인]** 전시 주제 "Reenvision"을 히어로에 크게 배치했다. 폐막까지 남은 시간 **카운트다운**, 관람 시간·기간·장소 블록, 이름과 120자로 남기는 **방명록**, 2023·2024 **아카이브 링크**, 카테고리별 작품 수 표시가 있다. |
| [RCA 2025: Royal College of Art](https://2025.rca.ac.uk/) | **[확인]** 학생 1,600명 이상을 학교 → 프로그램 위계로 탐색한다. 사이트 전체 검색, **Skip to content** 링크, 접근성 페이지가 있다. 대규모 인덱스를 설계할 때 참고할 만하다. |
| [홍익대 디자인컨버전스 2025](https://hidcgs2025.com/) | **[확인]** 메뉴가 Works와 Designers 두 축이다. 작품과 사람을 동등한 인덱스로 제공한다. |
| [홍익대 산업디자인 2025 "WHAT IF"](https://hongik-id-degreeshow2025.com/), [이화 디자인 2025](https://ewhadesign.com/2025), [연세대 통합디자인](http://d.yonsei.ac.kr/) | **[패턴]** 회차마다 주제어 하나로 아이덴티티를 만들고, 그 주제를 그래픽 모티프로 사이트 전체에 확장한다. |
| [design.co.kr 졸업전시 아카이브](https://design.co.kr/exhibition-type/graduation-show/) | **[확인]** 국내 디자인학과 졸업전시를 연도와 분야별로 모아 둔 곳이다. 시각 레퍼런스를 대량으로 볼 때 시작점으로 좋다. |
| [Edinburgh College of Art Graduate Show](https://www.graduateshow.eca.ed.ac.uk/), [MMU Degree Show](https://www.art.mmu.ac.uk/degreeshow/) | **[패턴]** 온라인 쇼와 오프라인 쇼를 병행하는 구조다. 학생 프로필 중심으로 작품, 진술, 연락처를 묶는다. |
| [USC Capstone Showcase 2025](https://www.cse.sc.edu/news/capstone-projects-showcase-2025), [Georgia Tech CS Junior Design Expo](https://www.cc.gatech.edu/news/community-focused-projects-stand-out-fall-2025-cs-junior-design-capstone-expo), [Swinburne CAPEX25](https://www.swinburne.edu.au/events/2025/11/capstone-project-expo-2025/) | **[확인]** CS 캡스톤 전시는 작품을 **유형별**(Web, Mobile, Desktop, Game)로 묶고 **수상작**을 강조한다. 팀, 스폰서, 초록을 구조화해 보여준다. 우리 학과와 성격이 가장 가깝다. |
| [Disegno: 졸업전시의 목적](https://disegnojournal.com/newsfeed/what-is-the-purpose-of-a-graduate-show) | **[확인]** 졸업전시가 가족·친구 모임에서 하나의 완성된 기획 전시로 진화했다는 관점이다. 큐레이션과 기획 의도를 담은 페이지가 필요하다는 근거로 쓴다. |

### 4.2 레퍼런스에서 뽑은 핵심 패턴

1. **회차 아이덴티티:** 주제어, 키 비주얼, 그래픽 모티프. 구조는 매년 같고 테마만 바뀐다.
2. **두 축 인덱스:** Works(작품)와 People(참여자). 사람 페이지에서 그 사람의 작품으로, 작품에서 사람으로 오갈 수 있다.
3. **보기 전환:** 그리드(이미지 중심)와 리스트(제목, 팀, 분야, 기술 스택을 표 형태로). 리스트 보기는 인덱스 가독성이 좋아 기업 관계자가 선호한다.
4. **미디어 우선 상세:** 대표 미디어(영상 또는 이미지)를 첫 화면에 두고, 메타 사이드바(분야, 스택, 팀, 지도교수, 링크)와 본문 스토리를 나란히 배치한다. 갤러리와 포스터가 그 뒤에 오고, 맨 아래에 다음 작품 미리보기를 둔다.
5. **오프라인 연결:** 관람 정보(일시, 장소, 지도), 카운트다운, 부스 번호. 전시장 QR에서 상세 페이지로 바로 들어오는 동선을 만든다.
6. **참여형 요소:** 방명록이나 작품별 응원 메시지.
7. **아카이브:** 역대 회차를 같은 구조로 보존한다.
8. **접근성:** skip link, 키보드 탐색, 대체 텍스트, 충분한 명도 대비.

### 4.3 디자인 방향 (3안, 1안 권장)

| 안 | 콘셉트 | 인상 | 장점 | 리스크 |
|---|---|---|---|---|
| **A. Editorial Grid** ⭐권장 | 스위스 타이포그래피와 에디토리얼 레이아웃. 흰 바탕, 큰 국문 제목, 얇은 괘선, 12컬럼 그리드. 회차 포인트 컬러는 1색. | 단정함, 신뢰, 오래 감 | 작품 이미지가 가장 돋보인다. 매년 테마만 교체하면 된다. 구현 난도가 낮다. | 테마가 약하면 밋밋해질 수 있다. 키 비주얼로 보완한다. |
| B. Build Log | 컴퓨터공학 정체성을 강조한다. 모노스페이스 액센트, 커밋 해시 같은 메타 표기(`#2026 · 42 projects · 6 tracks`), 터미널 스타일 마이크로 인터랙션. | 기술적, 위트 | 학과 정체성이 분명하다. | 과하면 장르 클리셰가 되고, 일반 관람객에게 낯설 수 있다. |
| C. Spatial | 다크 배경에 3D/WebGL 전시 공간을 둔다. 스크롤에 따라 작품이 공간에 배치된다. | 몰입, 화려함 | 첫인상이 강하다. | 성능과 접근성 비용이 크고, 유행을 탄다. 시간을 타지 않는다는 목표와 충돌한다. |

**권장:** A안을 기본 골격으로 하고 B안의 모노스페이스 메타 표기만 액센트로 섞는다. 구조는 매년 유지하고, 회차 주제(키 비주얼, 포인트 컬러, 디스플레이 서체 1종)만 교체하는 **"고정 시스템과 가변 테마"** 구조로 간다.

### 4.4 디자인 토큰 초안

```css
:root {
  /* Neutral (고정) */
  --c-bg: #FAFAF7;        /* 따뜻한 오프화이트 */
  --c-surface: #FFFFFF;
  --c-ink: #111111;       /* 본문 */
  --c-ink-2: #555555;     /* 보조 */
  --c-line: #E4E4DF;      /* 괘선 */

  /* Theme (회차마다 교체) */
  --c-accent: #2B4BFF;    /* 예: 2026 포인트 컬러. 대비 4.5:1 이상 */
  --c-accent-ink: #FFFFFF;

  /* Type: Pretendard Variable(국문/본문) + 모노 액센트 */
  --font-sans: "Pretendard Variable", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --fs-display: clamp(2.5rem, 6vw, 5.5rem); /* 700, 행간 1.05, 자간 -0.02em */
  --fs-h1: clamp(2rem, 3.5vw, 3rem);
  --fs-h2: 1.5rem;
  --fs-body: 1.0625rem;   /* 17px, 행간 1.7 */
  --fs-meta: 0.8125rem;   /* 13px, 모노, 대문자 */

  /* Space: 4px 기반 */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-6: 24px; --sp-8: 32px; --sp-12: 48px; --sp-16: 64px; --sp-24: 96px;

  /* Layout */
  --container: 1440px; --gutter: clamp(16px, 3vw, 40px); --cols: 12;

  /* Shape & Motion */
  --radius: 2px;          /* 거의 직각. 장식을 최소화 */
  --ease: cubic-bezier(.2,.7,.2,1); --dur: 220ms;
}
@media (prefers-color-scheme: dark) { /* 다크 테마 토큰 세트 */ }
@media (prefers-reduced-motion: reduce) { :root { --dur: 0ms; } }
```

### 4.5 스타일 기술 선택

- **Tailwind CSS v4**(토큰을 `@theme`에 연결)와 **Radix UI Primitives**(Dialog, Select, Tabs, Tooltip)를 조합한다. 접근성이 보장된 헤드리스 컴포넌트 위에 우리 디자인을 입히는 방식이다.
- 관리자 화면만 MUI DataGrid를 유지하고 lazy chunk로 격리한다.
- 대안: styled-components를 유지하고 ThemeProvider와 토큰으로 통일할 수도 있다. 이 경우 이전 비용은 작지만 런타임 CSS-in-JS 비용과 유지보수 부담이 남는다.

### 4.6 화면 설계 (와이어프레임)

**① 전시 홈 `/:year`**
```
┌──────────────────────────────────────────────────────────┐
│ SKU CSE GRAD 2026   작품  참여자  소개  아카이브   [2026▾] 로그인 │  ← 64px, 스크롤 시 배경 blur
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [회차 주제어 — Display 서체, 화면 폭 가득]                    │
│  2026 성결대학교 컴퓨터공학과 졸업작품전                        │
│                                         [키 비주얼/모티프]  │
│  11.12 — 11.14 · 성결관 1층 · D-12        [작품 보러가기 →]   │
├──────────────────────────────────────────────────────────┤
│ 42 PROJECTS · 6 TRACKS · 128 STUDENTS   (모노 메타 라인)      │
├──────────────────────────────────────────────────────────┤
│ 주목할 작품 (수상작/큐레이션)  ─ 큰 카드 1 + 작은 카드 4           │
├──────────────────────────────────────────────────────────┤
│ 트랙별 바로가기  WEB 12 · MOBILE 9 · GAME 7 · EMBEDDED 6 · AI … │
├──────────────────────────────────────────────────────────┤
│ 전시 소개 (관리자 편집 가능 서문) │ 오프라인 관람 안내 + 지도          │
├──────────────────────────────────────────────────────────┤
│ 방명록 (선택)                                              │
├──────────────────────────────────────────────────────────┤
│ Footer: 학과 링크 · 아카이브 2023/2024/2025 · 크레딧(웹 제작팀)   │
└──────────────────────────────────────────────────────────┘
```

**② 작품 목록 `/:year/works`**
```
작품 42                                   [검색 🔍] [▦ 그리드 | ☰ 리스트]
[전체 42] [WEB 12] [MOBILE 9] [GAME 7] [EMBEDDED 6]   ← 선택 상태 명확, URL 동기화
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ 4:3 썸네일│ │        │ │        │ │        │   데스크톱 4열 / 태블릿 3열 / 모바일 2열(또는 1열)
└────────┘ └────────┘ └────────┘ └────────┘
작품 제목(항상 노출, 2줄)
팀명 · WEB                         ← hover 의존 정보 없음
```
리스트 보기는 `번호 | 제목 | 팀 | 분야 | 기술 스택 | →` 형태의 표로 보여준다.

**③ 작품 상세 `/:year/works/:slug`**
```
← 작품 목록                                              03 / 42
WEB · 팀 이름
작품 제목 (H1, 크게)
한 줄 소개 (tagline)
┌──────────────────────────────────────────┐
│ 대표 미디어: 시연 영상(poster 썸네일, 클릭 재생) │
└──────────────────────────────────────────┘
┌──────────── 본문 (8col) ─────────┐ ┌─ 메타 (4col, sticky) ─┐
│ 개요 / 문제 정의 / 해결 / 주요 기능   │ │ 분야   WEB             │
│ 스크린샷 갤러리                     │ │ 스택   React · Spring  │
│ 포스터 (클릭 시 확대 뷰어)            │ │ 지도교수  ○○○          │
└──────────────────────────────────┘ │ 팀원   아바타 ×4        │
                                     │ GitHub ↗  Demo ↗        │
                                     │ [공유] [링크 복사]        │
                                     └───────────────────────┘
팀원 카드 (사진 · 이름 · 역할 · 한 줄 소개 · 링크) → 클릭 시 프로필 패널
──────────────────────────────────────────────
← 이전 작품 [썸네일+제목]          다음 작품 [썸네일+제목] →
```
- 데이터 모델 확장을 제안한다(백엔드 협의): `tagline`, `techStack[]`, `githubUrl`, `demoUrl`, `gallery[]`, `award`, `slug`. 이미 있는 `slideImages`는 갤러리로 활용한다.
- 편집 화면(`/studio`)은 이 상세 레이아웃을 그대로 두고 각 블록을 인라인 편집하는 방식(WYSIWYG 미리보기)으로 만든다.

**④ 참여자 `/:year/people`:** 가나다순 인덱스(ㄱ ㄴ ㄷ …), 지도교수 섹션, 학생 카드(사진, 이름, 소속 팀 → 작품 링크).

**⑤ 반응형/접근성 체크리스트:** 터치 타깃 44px 이상, 본문 16px 이상, 대비 4.5:1 이상, 포커스 링 표시, 모든 상호작용 요소는 `button`/`a`, 이미지 `alt`(작품 제목, 팀원 이름), 모달은 Radix Dialog, skip link를 둔다.

### 4.7 Claude Design 활용 계획

Claude Design(디자인 아티팩트)으로 코드 작업 전에 시안을 확정한다.

1. **디자인 시스템 먼저:** 4.4의 토큰, 타입 스케일, 컴포넌트(버튼, 필터 칩, 작품 카드, 메타 테이블, 다이얼로그)를 Design System으로 만든다.
2. **핵심 화면 4종:** 홈, 작품 목록(그리드·리스트), 작품 상세, 모바일 상세. 각각 데스크톱(1440)과 모바일(390) 시안을 만든다.
3. **방향 비교:** A안과 A+B 혼합안을 같은 콘텐츠로 나란히 만들어 학과와 팀이 투표한다.
4. **확정 후 구현:** 확정된 시안의 토큰을 `shared/styles/tokens.css`로 옮기고, 컴포넌트는 Radix와 Tailwind로 구현한다.

**Claude Design 입력용 브리프 (복사해서 사용)**

> 성결대학교 컴퓨터공학과 졸업작품 온라인 전시 사이트를 디자인해줘. 관람객은 학생 가족, 교수, IT 기업 채용 담당자, 전시장에서 QR로 들어오는 모바일 사용자다.
> 원칙: 작품이 주인공, 장식 최소화, 타이포그래피와 12컬럼 그리드로 위계 구성, 중립 팔레트(#FAFAF7 / #111) 위에 회차 포인트 컬러 1색(#2B4BFF), 그라데이션·두꺼운 그림자·상시 애니메이션 금지, 모서리 2px.
> 서체: Pretendard Variable(국문/본문), JetBrains Mono(메타 정보 라벨, 예: `42 PROJECTS · 6 TRACKS`).
> 화면: ① 전시 홈(회차 주제어 대형 타이포, 일시·장소·D-day, 주목할 작품, 트랙별 바로가기, 관람 안내) ② 작품 목록(카테고리 칩에 개수 표시, 선택 상태 명확, 그리드·리스트 전환, 카드에 제목과 팀명 항상 노출) ③ 작품 상세(대표 영상 상단, 본문 8컬럼과 sticky 메타 4컬럼, 팀원 카드, 이전·다음 작품 미리보기) ④ 모바일 상세(390px).
> 레퍼런스 톤: 에디토리얼 졸업전시 사이트(KHVD 2025, 홍익대 디자인컨버전스 2025)와 CS 캡스톤 엑스포의 구조화된 정보 표현.
> 접근성: 대비 4.5:1 이상, 터치 타깃 44px 이상, 포커스 표시.

---

## 5. 실행 로드맵

| 단계 | 내용 | 산출물 |
|---|---|---|
| **P0. 긴급 수정** (리디자인 전에도 바로 효과) | 정적 이미지·영상 압축, 15MB 대체 이미지 교체, `?v=Date.now()` 제거, `/` 리다이렉트, 카테고리 활성 표시, 영상 삭제 operation 버그 수정, `lang="ko"` | 홈 첫 로드 용량 약 60MB → 약 3MB 이하 |
| **P1. 디자인 확정** | Claude Design으로 디자인 시스템과 핵심 화면 시안 제작, 방향 투표, 백엔드와 데이터 모델 확장 협의 | 확정 시안, API 변경 명세 |
| **P2. 기반 재구축** | 라우터 재구성(레이아웃 라우트, lazy, 가드, errorElement), TanStack Query, Redux 제거, 토큰과 UI 프리미티브, 죽은 코드와 의존성 정리 | 새 골격 |
| **P3. 공개 화면** | 홈, 작품 목록, 상세, 참여자, 소개, 아카이브. prerender와 OG 태그 | 공개 사이트 |
| **P4. 스튜디오(편집)** | 상세 화면 기반 인라인 편집, 업로드 큐, 단일 커밋 저장 | 편집 기능 |
| **P5. 관리자 정리** | lazy chunk 분리, 거대 Grid 컴포넌트 분할, 탭을 URL로 | 관리자 |
| **P6. 품질** | Vitest, Playwright, Lighthouse CI 예산 적용 | CI 파이프라인 |

### 백엔드 협의 항목
- 공개용 "전시 연도 목록" API (`/` 리다이렉트와 아카이브에 필요)
- 이미지 썸네일 자동 생성과 `updatedAt` 기반 캐시 키
- 작품 필드 확장: `slug`, `tagline`, `techStack`, `githubUrl`, `demoUrl`, `gallery`, `award`
- 팀 글과 학생 프로필 일괄 저장(트랜잭션) API, multipart abort API
- `GET /me` 세션 조회, 로그인 응답에서 `accessToken` 본문 제거
- 홈 서문과 관람 안내(장소, 지도)를 관리자에서 편집 가능하게
- 조회 API를 `GET`으로 정리하고 오타 경로(`teamProflie`) 수정
