# 6장 서버 사이드 리액트
웹이 계속 발전함에 따라 클라이언트 사이드 렌더링의 한계가 더욱 분명해짐


## 6.1 클라이언트 사이드 렌더링 한계
### 6.1.1 검색 엔진 최적화(SEO)
- 검색 엔진의 크롤러가 자바스크립트를 제대로 실행하지 못해 컨텐츠를 올바르게 색인하지 못할 수 있음
- 리액트와 같은 CSR 애플리케이션에서는 서버가 거의 비어있는 HTML 파일이 전송되어 컨텐츠가 동적으로 렌더링되므로 검색 엔진이 이를 인식하지 못함

### 6.1.2 성능
- 클라이언트에서 렌더링되는 애플리케이션은 느린 네트워크나 낮은 성능 기기에서 성능 문제를 겪을 수 있음 (컨텐츠 렌더링 지연)
- 인터랙티브 가능 시간(TTI)이 길어지면 사용자 참여율과 이탈률에 직접적인 영향을 미치기 때문에 검색 엔진의 페이지 순위에 부정적 영향 미침
- 서버에서 자바스크립트를 먼저 실행하고 최소한의 데이터나 마크업을 클라이언트로 전송하면 초기 로딩 시간을 줄일 수 있음
- 점진적 대안: 핵심 컨텐츠를 서버 사이드에서 렌더링하고 나머지는 클라이언트 사이드에서 렌더링 
- 렌더링된 HTML을 처음 스트리밍한 다음, 자바스크립트로 DOM에 하이드레이션하면 사용자가 애플리케이션과 더 빨리 상호 작용할 수 있어 사용자 경험이 향상됨

### 6.1.3 보안
- CSR은 민감한 데이터를 처리할 때 보안이 문제시될 수 있음
- 애플리케이션의 모든 코드가 클라이언트의 브라우저로 다운로드되어 크로스 사이트 요청 위조(CSRF) 같은 공격에 취약하기 떄문
- 방지: 웹사이트나 웹앱을 사용자에게 제공하는 서버를 제어하여 서버에서 클라이언트로 적절한 CSRF 방지 토큰 전송 -> 클라이언트에서 서버로 요청을 보낼 때 이 토큰을 함께 전송
- 서버에 접근할 수 없고 클라이언트 전용 코드만 있는 경우 CSRF 위험 가능성이 있음
- 서버에 접근할 수 있고 웹사이트 또는 웹앱이 클라이언트 전용이라면 CSRF 위협을 방지할 수 있고 SEO 또는 성능과 관련된 문제를 해결할 수 있음

```jsx
const Account = () => {
    const [balance, setBalance] = useState(0);
    
    const handleWithDrawal = async () => {
        // 서버에 출금 프로세스 요청
        const response = await fetch('/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: 100 })
        });
        
        if(response.ok){
            const data = await response.json();
            setBalance(data.balance);
        }
    };
    
    return (
        <div>
            <h1>Account Balance: {balance}</h1>
            <button onClick={handleWithDrawal}>Withdraw $100</button>
        </div>
    )
}
```

- 만약 /withdraw 엔드포인트가 요청의 출처를 제대로 검증하지 않고 CSRF 방지 토큰도 요구하지 않는다면 CSRF 위험이 발생할 수 있음
- 공격자는 사용자가 버튼을 클릭하도록 속이는 악성 웹페이지를 만든 다음 사용자를 대신해 무단 인출을 유도할 수 있음
- 이 컴포넌트가 CSR로 렌더링되는경우 CSRF 공격에 취약할 수 있음 (클라이언트와 서버는 서로를 알지 못하기 때문)
- 서버 사이드 렌더링을 사용하면 서버에서 CSRF 방지 토큰을 생성하고 이를 클라이언트에게 전달할 수 있음

## 6.2 서버 렌더링의 부상
### 6.2.1 서버 렌더링의 장점
- 최초 의미 있는 페인트가 완성되는 시간이 더 빨라짐
  - 서버가 초기 HTML 마크업을 렌더링해 클라이언트로 전송하면 바로 컨텐츠를 볼 수 있기 때문
- 웹 애플리케이션의 접근성 개선
  - 인터넷 연결이 느린 사용자도 완전히 렌더링된 페이지를 볼 수 있음
- 웹 애플리케이션의 SEO를 개선
  - 검색 엔진 크롤러가 사이트의 색인을 생성할 때 완전히 렌더링된 페이지를 볼 수 있음
- 웹 애플리케이션의 보안 향상
  - 핵심 컨텐츠를 서버 사이드에서 렌더링하면, 사용자와 검색 엔진이 자바스크립트 실행과 관계없이 컨텐츠를 볼 수 있음

- 그러나 서버에서 렌더링된 HTML은 정적이며 자바스크립트를 읽어 들이지 않아 이벤트 리스너나 동적 기능이 포함되지 않았음 -> 하이드레이션 필요

## 6.3 하이드레이션
- 하이드레이션은 서버에서 생성되어 클라이언트로 전송되는 정적 HTML에 이벤트 리스너와 여러 자바스크립트 기능을 추가하는 프로세스
- 하이드레이션의 단계
  - 클라이언트 번들 로딩: 정적 HTML을 렌더링하는 동안 애플리케이션의 코드가 포함된 자바스크립트 번들을 다운로드하고 파싱
  - 이벤트 리스너 추가: 클라이언트 번들이 로드되면 이벤트 리스너를 추가하고 이벤트를 처리(HydrateRoot 함수 사용)

### 6.3.1 하이드레이션에 대한 비판
- 일부에서는 하이드레이션이 필요 이상으로 느리다고 비판하며 재개 가능성(resumability)를 더 나은 대안으로 꼽기도 함
- 하이드레이션을 사용하면 렌더링된 이후 이벤트 리스너를 추가한후 클라이언트를 효과적으로 리렌더링해야함 -> 이때 컨텐츠가 사용자에게 표시되는 시점과 이용할 수 있는 시점 사이에 지연이 발생할 수 있음
- 재개 가능성을 활용하면 전체 애플리케이션이 서버에서 렌더링되어 브라우저로 스트리밍됨(인터랙티브 동작이 직렬화되어 클라이언트로 전송됨)
- 하이드레이션을 할 필요가 없이 역직렬화하여 바로 반응 가능
- 하지만 재개 가능성은 구현이 복잡하여 커뮤니티내에서도 의견이 갈림

## 6.4 서버 렌더링 작성
- 리액트 앱에 서버렌더링을 추가하려면 서버렌더링 프레임워크(Nextjs, Remix) 사용하면 쉽게 가능
- 수동으로 추가하는 방법은?

### 6.4.1 클라이언트 전용 리액트 앱에 서버 렌더링을 수동으로 추가하기
- 프로젝트의 루트에 server.js 파일 생성
```js
//server.js

//필요한 모듈 가져오기
const express = require('express');
const path = require('path');
const React = require('react');
// 서버 사이드 렌더링을 위해 ReactDomServer 가져오기
const ReactDOMServer = require('react-dom/server');

const App = require('./src/App');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res)=>{
    //App 컴포넌트를 렌더링해 HTML 문자열을 생성
    const html = ReactDOMServer.renderToString(<App />);
      //HTML 문자열을 클라이언트로 전송
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>React App</title>
            </head>
            <body>
                <div id="root">${html}</div>
                <script src="/main.js"></script>
            </body>
        </html>
    `);
  
    //서버를 3000번 포트로 실행
      app.listen(3000, ()=>{
            console.log('Server is listening on port 3000');
        });
})
```

### 6.4.2 하이드레이션
- 애플리케이션의 클라이언트 사이드 번들에서 HydrateRoot 함수를 호출해 하이드레이션을 수행
```js
import React from 'react';
import { hydrateRoot } from 'react-dom/client;
import App from './App';

hydratedRoot(document, <App />);
```

## 6.5 리액트의 서버 렌더링 API
### 6.5.1 RenderToString
- 앞선 예시에 나왔던 API로 서버에서 리액트 컴포넌트를 HTML 문자열로 렌더링할 때 사용
- 동기식으로 동작하며 완전히 렌더링된 HTML 문자열 반환

**작동 방식**
- 리액트 엘리먼트의 트리를 탐색하고 이를 실제 DOM 엘리먼트에 해당하는 문자열 표현으로 변환한 다음, 전체 문자열을 결과로 반환
- renderToString은 흐름을 가로막는 동기식 API이므로 실행이 중단되거나 일시적으로 중지될 수 없음
- 대상이 되는 컴포넌트가 루트에서 몇단계 깊이에 있다면, 처리하는 시간이 걸릴 수 있음
- 캐시와 같은 적절한 방지책이 없다면 시스템 과부하가 발생할 수 있음

**단점**
- 성능
  - 동기식이기 때문에 이벤트 루프를 차단하고 서버가 응답하지 않게 만들 수 있음(대규모 애플리케이션에서 문제됨)
  - 완전히 렌더링된 HTML 문자열을 반환하므로 대규모 애플리케이션에서는 메모리 사용량이 과도할 수 있음
- 스트리밍 지원 부족
  - 클라이언트로 전송하려면 HTML 문자열 전체를 생성해야함
  - TTB(Time to Byte)가 느려질 수 있음

### 6.5.2 renderToPipeableStream
- 리액트 18에 도입된 서버 사이드 렌더링 API
- Suspense를 완벽하게 지원
- 스트림이기 때문에 네트워크를 통해 스트리밍할 수 있으며, HTML 청크를 클라이언트에 비동기적으로 전송 가능

```js
// server.js

const express = require('express');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const App = require('./src/App');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res)=>{
 
    //시작 부분 변경
    const { pipe } = ReactDOMServer.renderToPipeableStream(<App />, {
        onShellReady: () => {
            // 서버가 HTML을 보낼거라고 클라이언트에 통지
            res.setHeader('Content-Type', 'text/html');
          pipe(res); //리액트 스트림의 출력 결과를 응답 스트림에 파이프
        }
    });

  //서버를 3000번 포트로 실행
  app.listen(3000, ()=>{
    console.log('Server is listening on port 3000');
  });
})
```

**작동 방식**
- 똑같이 선언적으로 기술된 리액트 엘리먼트의 트리를 인수로 받지만 변환 결과는 HTML 문자열이 아니라 Node.js 스트림
- 스트림을 사용하면 전체 데이터를 한꺼번에 읽어들이는 대신 청크 단위로 점진적으로 처리

**Node.js 스트림(출발지에서 목적지로 흐르는 데이터의 흐름)**
- 읽기 가능 스트림: 읽을 수 있는 데이터 출처 (data, end, error 같은 이벤트 발생시킴)
- 쓰기 가능 스트림: 데이터를 쓸 수 있는 대상(스트림으로 데이터를 전송하는 write(), end() 같은 메서드 제공)
- 양방향 스트림: 읽기와 쓰기가 모두 가능한 스트림(데이터가 양방향으로 흐르도록 해야하는 네트워크 소켓이나 통신 채널에 주로 사용됨)
- 변환 스트림: 데이터가 흐르는 동안 데이터 변환을 수행하는 특수한 양방향 스트림(압축, 암호화, 압축 해제, 또는 데이터 구문 분석과 같은 작업 수행 가능)
- Node.js 스트림의 파이프 기능을 사용하면 읽기 가능한 스트림의 출력을 쓰기 가능한 스트림의 입력에 직접 연결해서 데이터 흐름이 원활해짐
- 백프레셔(데이터 전송도중 버퍼 뒤에 데이터가 쌓이는 것) 처리도 지원
  - 쓰기 가능 스트림이 데이터를 충분히 빠르게 처리하지 못하면 읽기 가능 스트림은 data 이벤트 발생을 일시적으로 중지해 데이터 손실을 방지

**리액트의 renderToPipeableStream**
- 리액트는 컴포넌트를 쓰기 가능 스트림으로 스트리밍하여 HTML 응답 청크가 준비되는 즉시 전송을 시작해 전반적인 지연 시간을 줄임
- 서버렌더링의 작동 방식과 흐름
  - 요청 생성
    - renderToPipeableStream 함수는 렌더링할 리액트 엘리먼트와 선택적인 옵션 객체를 인수로 전달받음
    - createRequestImpl 함수를 사용해 요청 객체(리액트 엘리먼트, 리소스, 응답 상태, 포멧 컨텍스트 캡슐화) 생성
  - 작업 시작
    - 요청 객체를 인수로 삼아 startWork 함수 호출
    - 렌더링 프로세스는 비동기식이며 Suspense 사용에 따라 렌더링이 중단되고 폴백이 렌더링 되기도 함
  - 파이프 가능 스트림으로 반환
    - renderToPipeableStream 함수는 pipe 메서드와 abort 메서드를 포함한 객체를 반환
    - pipe 메서드: 렌더링된 출력을 Node.js의 HTTP 응답 객체와 같은 쓰기 가능 스트림으로 전달하는 데 사용됨
    - abort 메서드: 대기 중인 모든 입출력 작업을 취소하고, 남은 작업을 클라이언트 렌더링 모드로 전환하는 데 사용됨
  - 목적지로 파이핑
    - pipe 메서드가 목젖ㄱ지 스트림과 함께 호출되면, 데이터가 전송되기 시작했는지 확인
    - 이미 전송을 시작했다면 hasStartedFlowing을 true로 설정하고 요청과 목적지를 인수로 사용해 startFlowing 함수 호출
  - 스트림 이벤트 처리
    - 목적지 스트림이 더 많은 데이터를 수신할 준비가 되면 drain 이벤트 핸들러는 startFlowing을 호출해 데이터 흐름을 재개
  - 렌더링 중단
    - 반환된 객체의 abort 메서드를 호출할 때는 렌더링 프로세스를 중단하는 이유 전달 가능
    - 요청과 중단 이유를 인수로 사용해 react-server 모듈의 abort 함수 호출

**renderToPipeableStream의 기능**
- 스트리밍
- 유연성: HTML이 렌더링되는 방식을 더 세밀하게 제어 가능
- Suspense 지원

**사용 사례**
```jsx
// ./src/DogBreeds.jsx

const dogResource = createResource(
    fetch('https://dog.ceo/api/breeds/image/random')
            .then(res => res.json())
            .then(data => data.message)
);

function DogBreeds(){
    return(
        <ul>
          <Suspense fallback={<li>Loading...</li>}>
            {dogResource.read().map(breed => (
                <li key={breed}>{breed}</li>
            ))}
</Suspense>
</ul>
          
    )
}

// src/App.js
import React, { Suspense } from 'react';

const ListOfBreeds = React.lazy(() => import('./DogBreeds'));

function App(){
    return(
        <div>
            <h1>Dog Breeds</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <ListOfBreeds />
            </Suspense>
        </div>
    )
}
```

- express 서버와 함께 사용

```js
// server.js
import express from 'express';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import App from './src/App';

const app = express();
app.use(express.static('build'));

app.get('/', (req,res)=>{
    //초기 Html 구조 정의
    const htmlStart = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>React App</title>
            </head>
            <body>
                <div id="root">
    `;
  
    // 응답에 초기 HTML 출력
  res.write(htmlStart);
  
  // renderToPiepeableStream을 호출하면서 React App 컴포넌트와
  // 셸의 준비 상태를 다루는 옵션 객체를 인수로 전달
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady: () => {
      // 셸이 준비되면 렌더링한 출력을 응답에 파이프
    pipe(res); 
    }
  });
})
```

- 응답받은 HTML을 살펴보면 <template> 엘리먼트와 HTML 주석이 있음
  - HTML 주석은 셸의 시작과 끝을 표시하는 마커 역할을 하며 Suspense가 해결되면 해결된 데티터가 들어갈 위치
  - <template> 엘리먼트는 문서 하위 트리를 구성하고, DOM 계층에 추가 단계를 들이지 않고도 노드를 보관할 수 있도록 함 -> 경량 컨테이너 역할
- script 엘리먼트에는 $RC라는 함수 있음
  - 데이터에 의존적인 리액트 컴포넌트가 준비될때까지 대기한 후 준비가 완료되면 Suspense 폴백을 서버에서 렌더링된 컴포넌트로 대체


### 6.5.3 renderToReadeableStream
- 앞서 다룬 API는 Node.js 스트림을 사용하지만 renderToReadableStream은 브라우저 스트림 사용
- 브라우저 스트림은 웹 브라우저 내의 클라이언트 환경에서 작동하도록 설계되었으며, 주로 네트워크 요청, 미디어 스트리밍, 브라우저의 데이터 처리 작업에서 스트리밍 데이터를 처리
- 브라우저 스트림은 read(), write(), pipeThrough() 등의 메서드를 사용해 데이터의 흐름을 제어하고 스트리밍된 데이터를 처리
- 표준화된 Promise 기반 API 제공
- Node.js 스트림과 브라우저 스트림은 모두 스트리밍 데이터 처리를 목적으로 하지만, 동작하는 환경이 다르며 각 환경ㅇ ㅣ따르는 API 표준도 조금씩 다름
- Node.js 스트림은 이벤트 기반이며 서버 측 작업에 적합한 반면, 브라우저 스트림은 최신 웹 표준에 따라 Promise 기반이며 클라이언트 측 작업에 맞게 조정됨

### 6.5.4 언제 무엇을 사용해야 하나요?
- RednerToString은 동기식으로 동작하기 떄문에 적합하지 않을때가 있음
  - 네트워크 I/O는 비동기식
    - 우리가 수행하는 모든 데이터 페치는 데이터베이스, 웹 서비스, 파일 시스템등 어딘가에서 데이터를 가져오고 비동기식으로 수행됨
    - 동기식이라 이를 기다릴수가 없으므로 셸이라는 껍데기만 클라이언트에 전송하고 이후 서버가 멈췄던 지점부터 처리하는데 이때 waterfall 현상이 발생할 수 있음
  - 서버는 여러 클라이언트에 응답함
    - 서버가 문자열을 렌더링하는 도중 30개의 클라이언트에서 새로운 요청을 보낸다면 새 클라이언트는 현재 렌더링 작업이 완료될때까지 대기해야함
- renderTo*Stream 방식의 API 위 문제를 해결할 수 있다하지만 많은 서드파티 라이브러리들이 이 API와 호환되지 않음
  - 서버에서 렌더링이 완료되지 않은 채 브라우저에서 부분적으로 하이드레이션을 시작해야하는 사용 사례를 지원하지 않음
- React19에서 새로운 API를 추가하여 보완을 좀 했지만 여전히 추가 구현 필요

## 6.6 직접 구현하지 마세요
- 기존 프레임워크를 사용하는 편이 더 나은 이유
  - 에지 케이스 및 복잡성 처리
    - 비동기 데이터 패치, 코드 분할, 다양한 리액트 수명 주기 이벤트 관리 등 복잡성을 더하는 동작과 에지 케이스를 해결해야하지만 기존 프레임워크는 해결
    - 보안문제(실수로 클라이언트로 민감한 데이터가 유출되지 않도록 하는 것)도 주의해야함(사용자 id마다 고유한 캐싱이 안되어 다른 사용자의 데이터 노출)
- 성능 최적화
  - 특히 페이지 라우터의 경로기반 코드 분할
- 개발자 경험 및 생산성
  - 개발자는 애플리케이션 기능 구현에만 전념하면 됨
- 모범 사례와 코딩 규칙
  - 모범 사례를 염두에 두고 설계된 프레임워크이므로 제안하는 코딩규칙을 따르면 탄탄한 기반에서 애플리케이션을 작성할 수 있음
  