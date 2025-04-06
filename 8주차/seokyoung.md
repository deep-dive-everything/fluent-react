> 프레임워크는 리액트를 기반으로 구축된 소프트웨어 라이브러리 또는 툴킷이며, 일반적인 작업을 보다 효율적으로 처리하고 모범 사례를 적용하기 위한 추상화 계층을 제공합니다.

## 프레임워크 사용 시 트레이드오프

### 장점

- **구조와 일관성**: 명확한 디렉토리 구조와 개발 규칙 제공
- **모범 사례 내장**: 베스트 프랙티스를 자동으로 적용
- **추상화**: 복잡한 로직을 감춰 코드 단순화
- **성능 최적화**: 빌드, 번들링, 캐싱 등 성능 고려
- **커뮤니티**: 넓은 생태계와 다양한 도구 활용 가능

### 단점

- **학습 곡선**: 익혀야 할 개념이 많음
- **자유도 제한**: 프레임워크의 규칙에 따를 필요 있음
- **의존성 증가**: 프레임워크 업데이트에 민감
- **추상화 오버헤드**: 내부 구현 파악 어려울 수 있음

## Vite 기반 SSR 구조

- ssr-react / TypeScript / None Streaming으로 설정

```
- index.html
- server.js # main application server
- src/
  - main.js          # 환경에 구애받지 않는(Env-agnostic) 범용 앱 코드로 내보내는(Export) 스크립트
  - entry-client.tsx  # 앱을 DOM 엘리먼트에 마운트하는 스크립트
  - entry-server.tsx  # 프레임워크의 SSR API를 사용해 앱을 렌더링하는 스크립트
```

### package.json

```
{
  "name": "ssr-w-vite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "node server",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --ssr src/entry-server.tsx --outDir dist/server",
    "preview": "cross-env NODE_ENV=production node server"
  },
  "dependencies": {
    "compression": "^1.8.0",
    "express": "^5.0.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "sirv": "^3.0.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.13.4",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "cross-env": "^7.0.3",
    "typescript": "~5.7.3",
    "vite": "^6.1.1"
  }
}
```

#### dependencies

- express: 웹 서버 구축을 위한 Node.js 기반 백엔드 라이브러리
- compression: Node.js compression 미들에워로, HTTP 응답을 gzip, Brotli로 압축하여 전송하는 기능 제공. → 클라이언트로 전송되는 데이터의 크기를 줄여 네트워크 성능 최적화
- sriv: 정적 파일을 서빙하는 빠르고 가벼운 Node.js 서버

#### devDependencies

- cross-env: 환경 변수(`NODE_ENV=production` 같은 설정)를 **운영체제에 상관없이 일관되게 설정할 수 있도록 도와주는 도구**

#### scripts

- dev: 개발 환경에서 서버 실행
- build:client → `vite build` 실행해서 번들 파일을 dist/client 폴더에 저장. 즉, 클라이언트용 번들 파일을 생성하는 역할
- build:server → `vite build --ssr`로 서버 사이드 렌더링 번들 생성
- preview: 환경변수를 production으로 설정하여 운영 모드에서 서버 실행

### index.html

```html
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.tsx"></script>
```

- 주석(`<!—ssr-outlet—>`)으로 표시한 플레이스홀더에 서버에서 렌더링된 페이지가 삽입됨

### enty-client.tsx → 클라이언트 진입점

```tsx
import './index.css'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App'

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `hydrateRoot` → react-dom/server를 통해 미리 만들어진 HTML로 그려진 브라우저 DOM 노드에 React 컴포넌트를 렌더링할 수 있는 API이며, 대표적인 사용예시로는 서버에서 렌더링 HTLM을 hydrate 하는데 있음
- 서버에서 정적인 HTML을 만들어서 보내면 리액트는 그 HTML 위에 React 코드를 더해 동적으로 만들어줌

### entry-server.tsx → 서버 진입점

```tsx
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export function render(_url: string) {
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  return { html }

```

- `renderToString` → React 컴포넌트를 HTML 문자열로 렌더링

### server.js → 서버

```tsx
import fs from 'node:fs/promises'
import express from 'express'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : ''

// Create http server
const app = express()

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.ts').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(url)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
```

- Conatants: production 여부 확인 플래그 등 기본적인 상수 설정

```tsx
// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'
```

- Cached production assets: production 여부에 따라 파일을 import하는 위치가 달라짐

```tsx
// Cached production assets
const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : ''
```

- express로 서버 생성(이때도, production 환경 여부에 따라 달라짐)
  - 개발 모드 → Vite는 미들웨어 역할(`middlewareMode: true`)
  - 운영 모드 → compression과 sirv를 통해 미들웨어 등록

```tsx
// Create http server
const app = express()

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}
```

- 미들웨어 등록
  - 개발 모드 → 별도로 빌드된 파일을 사용하지 않고, 작성된 파일 그 자체를 사용 → 소스코드를 불러오는 코드 작성
    - vite.transformIndexHtml → HMR 기능
    - vite.ssrLoadModule → SSR 진입점을 서버에게 알리고 render 함수 가져옴
  - 운영 모드 → 빌드된 파일을 통해 가져오기
    - 사전에 로드한 templateHtml 그대로 사용
    - 빌드된 파일에서 render 함수 가져옴

```tsx
// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.ts').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(url)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})
```

- 이때 rendered는 어떤 값? → 작성한 컴포넌트를 html 문자열로 변경한 값

```bash
Server started at http://localhost:5173
rendered:: {
  html: '<link rel="preload" as="image" href="/vite.svg"/><link rel="preload" as="image" href="/src/assets/react.svg"/><div><a href="https://vite.dev" target="_blank"><img src="/vite.svg" class="logo" alt="Vite logo"/></a><a href="https://reactjs.org" target="_blank"><img src="/src/assets/react.svg" class="logo react" alt="React logo"/></a></div><h1>Vite + React</h1><div class="card"><button>count is <!-- -->0</button><p>Edit <code>src/App.tsx</code> and save to test HMR</p></div><p class="read-the-docs">Click on the Vite and React logos to learn more</p>'
```

- template을 html로 대체하기 이때 주석으로 표시해둔 플레이스홀더에 대체
- 그리고 나서 응답으로 html 반환

## Remix

[Remix - Build Better Websites](https://remix.run/)

- `entry.client.tsx`
- `entry.server.tsx`
- `root.tsx`

### 서버 렌더링

> `entry.client.tsx`를 통해 서버 렌더링 제공

- HTTP 응답을 생성하고 처리하는 방식 정의
- 봇과 일반 브라우저의 요청을 다르게 관리하는데 중점

### 라우팅

- 폴더 기반 라우팅 → `routes/`

### 데이터 페치

- `loader()` 함수를 통해 서버에서 데이터를 미리 가져옴
- 라우트 단위로 데이터 로딩 처리 → 페이지마다 `loader` 사용 가능
- 클라이언트와 서버에서 동일한 방식으로 데이터 접근 가능

### 데이터 조작

- `action()` 함수를 통해 서버에서 데이터를 조작
- 폼과 자연스럽게 통합됨 → HTML form과 서버 사이드 액션 처리 연동이 강점
- 요청 메서드(GET, POST 등)에 따라 로직 분리 가능

## Next.js

[Next.js by Vercel - The React Framework](https://nextjs.org/)

### 서버 렌더링

- 기본적으로 **React Server Components (RSC)** 를 활용한 서버 렌더링 기반
- `app/` 디렉토리 내의 모든 컴포넌트는 서버 컴포넌트가 기본
- `export const dynamic = "force-dynamic"` 등을 통해 캐싱 및 동적 처리 제어 가능
- Edge Functions 및 서버 함수(Server Actions)와의 통합 지원

### 라우팅

- 폴더 기반 라우팅
  - `pages/` 디렉토리 기반 (이전 방식)
  - `app/` 디렉토리 기반 (App Router, 최신 방식)
- 동적 라우팅 지원: `[id].tsx`, `[...slug].tsx` 등

### 데이터 페치

- **서버 컴포넌트 내에서 직접 비동기 함수 호출 가능**
  ```tsx
  async function Page() {
    const data = await getData() // fetch 사용 가능
    return <div>{data.title}</div>
  }
  ```
- 클라이언트 컴포넌트에서는 기존 방식대로 `useEffect + fetch` 또는 SWR, React Query 사용
- `generateStaticParams()` + `export const dynamicParams = true/false`를 통해 SSG 조절 가능

### 데이터 조작

- **서버 액션** (v14에서 안정화)
  - `<form action={someAction}>` 형태로 서버에서 직접 데이터 처리 가능
  - 클라이언트 → 서버 간 상태 전송을 간단하게 처리 가능
  - 클라이언트 번들에 포함되지 않음
  - 예: 폼 제출, 사용자의 버튼 클릭, 페이지 이동 등 서버에서 실행

> [!NOTE]
>
> #### 프레임워크를 선택할 때 고려할 점
>
> - 라우팅은 어떻게 구현할 것인가?
> - 정적 자산(이미지, JS/CSS 파일 등)은 어디에 둘 것인가?
> - 서버 렌더링을 해야 하는가?
> - 데이터 페치는 어디서 실행해야 하는가?
