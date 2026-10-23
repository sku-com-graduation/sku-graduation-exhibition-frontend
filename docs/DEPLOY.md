# 배포

운영 서버(nginx)는 `dist` 폴더의 정적 파일을 그대로 제공하고, `/api` 요청은 백엔드로 넘긴다.
그래서 빌드한 `dist`만 교체하면 배포가 끝난다. 백엔드와 DB는 건드리지 않는다.

## 1. 환경 변수

`.env.production`을 만들고 아래 한 줄을 넣는다. git에는 올라가지 않는 파일이다.

```
VITE_API_BASE_URL=/api
```

- 같은 도메인의 `/api`를 쓰므로 `www`가 붙든 안 붙든 쿠키 로그인이 그대로 동작한다.
- `.env`에 로컬 주소(`localhost`)가 있어도 `.env.production`이 덮어쓴다.
- API 주소가 로컬 주소로 잡힌 채 빌드하면 `vite.config.ts`가 빌드를 멈춘다. 잘못된 dist가 만들어지지 않는다.

## 2. 빌드와 확인

```
npm ci
npm run typecheck
npm test
npm run build
```

`dist/` 안에 `index.html`, `assets/`, `og.jpg`, `favicon.png`, `apple-touch-icon.png`가 생긴다.

## 3. 올리기

서버의 기존 `dist`를 새 `dist`로 통째로 바꾼다. 나머지 설정은 바꾸지 않아도 된다.

- 주소는 기존과 같다: `/{연도}`, `/{연도}/project`, `/{연도}/project/{팀}`, `/{연도}/project/{팀}/edit`, `/{연도}/admin`
- nginx의 `try_files ... /index.html` 설정이 있어야 위 주소로 바로 들어오거나 새로고침해도 열린다. 지금 운영 서버는 이미 그렇게 되어 있다.
- 배포 전에 열어 둔 탭은 이전 빌드 파일을 찾지 못한다. 이때는 가려던 주소로 한 번 새로고침해 새 빌드를 받는다(`src/app/RouteError.tsx`).

## 4. 배포 뒤 확인

- `/2026`: 전시 홈, 일시·시간, 작품 띠
- `/2026/project`: 분야 탭, 검색, 그리드/리스트
- 작품 하나를 열어 상세 화면, 이전·다음 작품
- 오른쪽 위 자물쇠: 관리자 로그인, `/2026/admin`
- 휴대폰에서 같은 화면

## 연도별 전시 정보

일시·시간은 관리자 화면의 홈 관리에서 바꾼다(서버에 저장).
장소, 주제, 포스터, 사이트 제작자는 `src/config/exhibition.ts`와 `public/exhibition/{연도}/`에서 바꾸고 다시 빌드해 배포한다.
