# 8장 프레임워크
## 8.1 프레임워크가 필요한 이유
- 리액트가 아키텍처를 강제하지 않으므로 유연하게 작성할 수 있지만 코드 일관성이 떨어지고 반복되는 기능을 매번 구현해야 함
- 리액트 앱에서 흔히 발생하는 문제
  - 문제 1: 빈 페이지를 다운로드 하고 나서야 앱이 로드되므로 사용자가 빈 페이지인 상태로 기다려야 함, 검색 엔진이 페이지를 크롤링할 수 없음 
  - 문제 2: 데이터를 너무 늦게 가져오기 시작(자바스크립트 다운,파싱,실행, 리액트 컴포넌트 렌더링 커밋, UseEffect 데이터 페치 시작, 로딩 스피너, useEffect 데이터 페치 완료, 데이터 렌더링하고 커밋)
  - 문제 3: 라우터가 클라이언트 기반이라 요청시 서버에 해당 파일이 없으므로 404 에러가 발생하고 이를 우회하여 라우팅을 구현해야 함

### 8.1.1 서버 렌더링
- renderToString() 메서드와 express 서버를 사용해 서버에서 리액트 컴포넌트를 렌더링하고 HTML을 클라이언트에 전송
```js
import express from 'express';
import { renderToString } from 'react-dom/server';
import { List } from './List.js';
import { Detail } from ./Detail.js';
import { createLayout } from './Layout.js';

const app = express();

app.get('/', (req,res)=>{
    res.setHeader('Content-Type', 'text/html');
    res.end(createLayout(renderToString(List)))
})

app.get('/detail', (req,res)=>{
    res.setHeader('Content-Type', 'text/html');
    res.end(createLayout(renderToString(Detail)))
})
```

### 8.1.2 라우팅
- 경로를 추가하려면 추가하려는 각 경로에 대해 req.get 호출을 직접 작성해야 하므로 확장성이 좋지 않음
- 파일 시스템 기반 라우팅
  - 모든 페이지가 ./pages 디렉토리 아래에 위치
  - 이 디렉터리의 모든 파일 이름이 라우터 경로가 됨
```js
import express from 'express';
import { renderToString } from 'react-dom/server';
import { List } from './List.js';
import { Detail } from ./Detail.js';
import { createLayout } from './Layout.js';

const app = express();

app.get('/:route', (req,res)=>{
    //pages 디렉터리에서 라우트 컴포넌트를 가져오기
    const exportedStuff = await import(
        join(process.cwd(),"pages", req.params.route)
        )
    
    const Page = exportedStuff.default;
    const props = req.query;
    
    res.setHeader('Content-Type', 'text/html');
    res.end(createLayout(renderToString(<Page {...props} />)))
})
```

### 8.1.3 데이터 페치
- 프롭(IinitialThings)을 통해 초기 데이터를 받아들이도록 컴포넌트를 업데이트

```js
import express from 'express';
import { renderToString } from 'react-dom/server';
import { List } from './List.js';
import { Detail } from ./Detail.js';
import { createLayout } from './Layout.js';

const app = express();

app.get('/:route', (req,res)=>{
    //pages 디렉터리에서 라우트 컴포넌트를 가져오기
    const exportedStuff = await import(
        join(process.cwd(),"pages", req.params.route)
        )
    
    const Page = exportedStuff.default;
    // nexxtjs의 getServerSideProps 혹은 getStaticProps와 유사한 방식으로 데이터를 가져옴
    const data = await exportedStuff.getData();
    const props = req.query;
    
    res.setHeader('Content-Type', 'text/html');
    res.end(createLayout(renderToString(<Page {...props} />)))
})

// pages/List.js
export const getData = async () => {
    const response = await fetch('https://api.example.com/things');
    const data = await response.json();
    return data;
};

export default function List({ initialThings }) {
    return (
        <div>
            {initialThings.map((thing) => (
                <div key={thing.id}>{thing.name}</div>
            ))}
        </div>
    );
}
```

## 8.2 프레임워크 사용시 장점
- 구조와 일관성: 프레임워크는 아키텍처를 강제하므로 코드의 구조와 일관성을 유지할 수 있음
- 모범 사례: 프레임워크는 모범 사례를 따르도록 설계되어 있어 코드 품질을 높일 수 있음
- 추상화: 프레임워크는 복잡한 작업을 추상화하여 개발자가 더 쉽게 작업할 수 있도록 도와줌
- 성능 최적화: 프레임워크는 성능을 최적화하기 위한 다양한 기능(코드 분할, 서버사이드렌더링, 정적 사이트 생성)을 제공하여 애플리케이션의 성능을 향상시킬 수 있음
- 커뮤니티와 생태계: 프레임워크는 대규모 커뮤니티와 생태계를 가지고 있어 다양한 라이브러리, 플러그인, 도구를 활용할 수 있음

## 8.3 프레임워크 사용시 트레이드 오프
- 학습 곡선: 프레임워크는 복잡한 개념과 구조를 가지고 있어 학습 곡선이 가파를 수 있음
- 제한된 유연성: 프레임워크는 특정 아키텍처와 패턴을 강제하므로 개발자가 원하는 방식으로 코드를 작성하기 어려울 수 있음
- 의존성: 프레임워크에 의존하게 되므로 프레임워크의 업데이트나 변경에 따라 코드가 영향을 받을 수 있음
- 추상화 오버헤드: 추상화는 내부에서 일어나는 일을 이해하기 어렵게 만들수도 있어 디버깅이 어려워질 수 있고 성능 저하를 초래할 수 있음

## 8.4 인기있는 리액트 프레임워크
### 8.4.1 Remix
- entry.client.tsx와 entry.server.tsx 두 개의 진입점 파일을 사용

```ts
// entry.server.tsx
import { PassThrough } from 'node:stream';

import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

const ABORT_DELAY = 5_000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    loadContext: AppLoadContext,
){
    return isbot(request.headers.get('user-agent'))
          ? handleBotRequest(
                request,
                responseStatusCode,
                responseHeaders,
                remixContext,
                loadContext
            )
            : handleBrowserRequest(
                request,
                responseStatusCode,
                responseHeaders,
                remixContext,
                loadContext
            );
}

function handleBotRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    loadContext: AppLoadContext,
){
    const { pipe, abort } = renderToPipeableStream(
        <RemixServer
            context={remixContext}
            url={request.url}
            loadContext={loadContext}
        />,
        {
            onAllReady() {
                responseHeaders.set('Content-Type', 'text/html');
                responseHeaders.set('Cache-Control', 'public, max-age=60');
                responseHeaders.set('X-Frame-Options', 'DENY');
                responseHeaders.set('X-XSS-Protection', '1; mode=block');
                responseHeaders.set('X-Content-Type-Options', 'nosniff');
                responseHeaders.set('Referrer-Policy', 'no-referrer');
                responseHeaders.set('Permissions-Policy', 'camera=(), microphone=()');

                const body = createReadableStreamFromReadable(pipe());
                const stream = new PassThrough();
                stream.writeHead(responseStatusCode, Object.fromEntries(responseHeaders));
                body.pipe(stream);
            },
            onShellError(error) {
                console.error(error);
            },
        }
    );

    setTimeout(abort, ABORT_DELAY);

    return stream;
}

function handleBrowserRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    loadContext: AppLoadContext,
){
    const { pipe, abort } = renderToPipeableStream(
        <RemixServer
            context={remixContext}
            url={request.url}
            loadContext={loadContext}
        />,
        {
            onShellReady() {
                responseHeaders.set('Content-Type', 'text/html');
                responseHeaders.set('Cache-Control', 'public, max-age=60');
                responseHeaders.set('X-Frame-Options', 'DENY');
                responseHeaders.set('X-XSS-Protection', '1; mode=block');
                responseHeaders.set('X-Content-Type-Options', 'nosniff');
                responseHeaders.set('Referrer-Policy', 'no-referrer');
                responseHeaders.set('Permissions-Policy', 'camera=(), microphone=()');

                const body = createReadableStreamFromReadable(pipe());
                const stream = new PassThrough();
                stream.writeHead(responseStatusCode, Object.fromEntries(responseHeaders));
                body.pipe(stream);
            },
            onShellError(error) {
                console.error(error);
            },
        }
    );

    setTimeout(abort, ABORT_DELAY);

    return stream;
}
```

- Remix의 장점은 내부적으로 사용되는 파일을 사용자도 볼 수 있어서 필요에 따라 수정할 수 있다는 점
- 봇이 보낸 요청과 브라우저가 보낸 요청을 구분하여 처리 -> 검색 엔진 최적화와 성능에 도움이 됨

**라우팅**

- 각 경로는 ./routes 디렉토리 아래에 위치
- ./routes/cheese.tsx
```tsx
export default function CheesePage() {
    return (
        <div>
            <h1>Cheese</h1>
            <p>Cheese is a dairy product made from curdled or cultured milk.</p>
        </div>
    );
}
```

**데이터 페치**

- loader라는 함수를 사용 -> Loader라는 비동기 함수를 내보내면 이 함수에서 반환된 값은 useLoaderData 훅을 통해 페이지 컴포넌트에서 사용할 수 있게 됨

```tsx
import { useLoaderData } from 'react-router-dom';
import { json } from '@remix-run/node';

export async function loader() {
    const response = await fetch('https://api.example.com/cheese');
    const data = await response.json();
    return json(data);
}

export default function CheesePage() {
    const cheese = useLoaderData();
    return (
        <div>
            <h1>Cheese</h1>
            <p>{cheese.description}</p>
        </div>
    );
}
```
- 앞서 구현한 데이터 페치 방식과 유사하다는 점을 발견할 수 있음

**데이터 조작**
- 웹의 기본으로 돌아가서 네이티브 웹 플랫폼의 규칙과 동작을 적극적으로 활용하도록 유도
- 웹 플랫폼의 기본 기능을 최대한 활용하며, 필요한 곳에만 자바스크립트를 사용하고 나머지는 브라우저가 처리하도록 함

```tsx
import { json, ActionFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from 'react-router-dom';

export async function loader() {
    const response = await fetch('https://api.example.com/cheese');
    const data = await response.json();
    return json(data);
}

// 폼 액션
export async function action({params, request}: ActionFunctionArgs){
    const formData = await request.formData();
  
    await fetch('https://api.example.com/cheese', {
        method: 'POST',
        body: JSON.stringify({
            name: formData.get('name'),
        }),
    });
  
  return redirect('/cheese');
}

export default function CheesePage(){
    const cheeses = useLoaderData();
  
      return (
            <div>
                <h1>Cheese</h1>
                <ul>
                    {cheeses.map((cheese) => (
                        <li key={cheese.id}>{cheese.name}</li>
                    ))}
                </ul>
              <form action={"/cheese"} method={'post'}>
                <input type="text" name="name" placeholder="Cheese Name" />
                <button type="submit">Add Cheese</button>
              </form>
            </div>
        );
}
```

### 8.4.2 Next.js
-  Next.js는 Remix 처럼 서버 구성을 노출하지 않고 개발자가 애플리케이션 구축에 집중할 수 있도록 복잡성을 숨김

**서버 렌더링**
- Next.js의 모든 페이지와 컴포넌트는 기본적으로 서버 컴포넌트 -> 'use client' 지시어를 추가하지 않는 한 서버에서만 실행 됨
- 정적 우선 접근 방식을 따름 -> 빌드 시점에 서버 컴포넌트는 가능한 한 많은 정적 콘텐츠로 렌더링되어 배포됨

**라우팅**
- app 디렉토리 하위에 page.tsx가 있고 page.tsx를 담고 있는 디렉토리가 라우트가 됨
- 이떄 layout.tsx라는 파일은 여러 페이지가 공유하는 헤더나 푸터 같은 고정 요소를 정의하는 데 사용됨

**데이터 페치**
- 서버 컴포넌트에서 직접 데이터를 가져올 수 있음
```tsx
export default async function CheesePage() {
    const cheese = await fetch('https://api.example.com/cheese');
    return (
        <div>
            <h1>Cheese</h1>
            <p>{cheese.description}</p>
        </div>
    );
}
```

**데이터 조작**
- 서버 액션: 서버에서 실행되는 함수로 폼이 제출되거나 사용자가 버튼을 클릭하거나 페이지를 이동할 떄 호출됨

```tsx
import { CheeseList } from './CheeseList';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default function CheesePage(){
      return (
            <div>
                <h1>Cheese</h1>
                <CheeseList cheeses={cheeses} />
              <form action={async (formData)=>{
                'use server';
                await fetch('https://api.example.com/cheese', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: formData.get('name'),
                    }),
                });
                revalidatePath('/cheese');
                redirect('/cheese');
              }} method={'post'}>
                <input type="text" name="name" placeholder="Cheese Name" />
                <button type="submit">Add Cheese</button>
              </form>
            </div>
        );
}
```

- 서버 액션은 서버에서만 실행되므로 상호 작용을 지원하지 않음 (onClick 같은 이벤트 핸들러를 사용할 수 없음)
- 클라이언트 컴포넌트와 서버 컴포넌트의 조합을 통해 상호 작용을 구현

```tsx
//AddCheeseForm.tsx
'use client';
import { addCheeseAction } from './actions';

export default function AddCheeseForm() {
    return (
        <form action={addCheeseAction} method="post">
            <input type="text" name="name" placeholder="Cheese Name" />
            <button type="submit">Add Cheese</button>
        </form>
    );
}
```

- 이제 클라이언트 컴포넌트에서 훅이나 상태, 이벤트 핸들러를 사용하여 상호 작용을 구현할 수 있음

## 8.5 프레임워크 선택
### 8.5.2 Next.js
- 학습 곡선
  - 내부적으로 리액트의 최신 기능을 사용하며, 종종 리액트의 canary release를 활용하기도 함
  - 따라서 학습 강도가 조금 높을 수 있음
- 유연성
  - 정적 콘텐츠와 서버 렌더링된 콘텐츠 간의 유연한 전환을 염두에 두고 설계됨
  - 다양한 플러그인과 통합 기능을 제공
- 성능
  - 성능 매우 중요시. 정적 생성과 서버 사이드 렌더링, 캐싱에 중점을 둠

### 8.5.3 Remix
- 학습 곡선
  - 웹의 기본 기능을 더 많이 사용하고, 서버 컴포넌트가 등장하기 전에 많은 사람들이 학습하던 방식으로 리액트를 사용하기 때문에 조금 더 쉽게 배울 수 있음
- 직관성
  - 웹 플랫폼의 기본 기능을 적극 활용하여 개발자가 프레임워크의 복잡성에 방해받지 않도록 함
  - 하지만 다른 프레임워크처럼 추상화된 기능을 제공하지 않기 때문에 개발자가 직접 구현해야 하는 부분이 많음
- 성능
  - 라우팅과 데이터 페치의 독특한 방식은 효율과 성능을 향상시킴
  - 데이터 페치가 라우트와 연결되어 특정 라우트에 필요한 데이터만 가져오기 때문에 전체 데이터 요구량이 줄어듬

### 8.5.4 트레이드오프
- 다소 유연한 풀스택 프레임워크가 필요하다면 Next.js가 더 적합
- 서버 기반의 점진적 향상과 웹의 기본 원칙을 중시하는 접근 방식을 선호한다면 Remix가 더 적합

### 8.5.5 개발자 경험
- 빌드 성능
  - Nextjs는 정적 생성을 사용하여 페이지를 미리 렌더링하는데 페이지 수가 많은 사이트에서는 빌드 시간이 길어질 수 있음
    - 전체 재빌드 없이도 변경된 페이지만 다시 빌드할 수 있는 Incremental Static Regeneration(ISR) 기능을 제공
  - Remix는 서버 우선 아키텍처를 사용해 서버에서 필요할때마다 페이지를 렌더링
    - 페이지 수가 많아도 빌드 시간이 짧고, 서버에서 페이지를 렌더링하므로 페이지 수에 관계없이 빠른 응답 속도를 유지

### 8.5.6 런타임 성능
- Next.js
  - 자동 코드 분할을 지원해 각 페이지에 필요한 코드만 로드, Image 컴포넌트는 이미지 로딩을 최적화
  - 목적에 맞는 렌더링 방식을 선택할 수 있게 함
  - 데이터가 필요하지 않은 페이지에 대해 자동 정적 최적화를 수행
  - 서버 컴포넌트를 최대한 활용해 클라이언트로 전달되는 자바스크립트의 양을 줄임
- Remix
  - 페이지를 미리 렌더링하지 않고 서버 렌더링을 사용해 필요한 HTML만 클라이언트로 스트리밍해 전송 (동적 페이지의 경우 TTFB가 짧음)
  - 강력한 캐싱 전략(브라우저의 네이티브 페치와 캐시 API 활용)으로 개발자가 다양한 리소스에 대한 캐싱 전략을 직접 설정 가능 