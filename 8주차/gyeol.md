# 8장 - 프레임워크

- 프레임워크
    - 리액트를 기반으로 구축된 소프트웨어 라이브러리 또는 툴킷
    - 일반적인 작업을 보다 효율적으로 처리하고 모범 사례를 적용하기 위한 추상화 계층을 제공

## 8.1 프레임워크가 필요한 이유

- 리액트는 아키텍처를 강제하지 않으므로 개발자는 애플리케이션을 유연하게 구성할 수 있음(높은 자유도)
- 자유도가 높기 때문에 애플리케이션이 확장될 경우 라우팅, 데이터 패치, 서버 사이드 렌더링 같은 일반적인 문제를 반복해서 다뤄야 할 수 있음
- 프레임워크는 미리 정의된 구조와 일반적인 문제에 대한 해결책을 제공하므로 개발자는 이에 맞춰 빠르게, 좋은 품질을 유지하며 작업할 수 있음
- 프레임워크에서 제공하는 주요 기능(리액트에서는 쉽게 얻기 힘든 기능)
    - 서버 렌더링
    - 라우팅
    - 데이터 패치

### 일반 리액트 앱을 프레임워크화하기

- 가상의 리액트 애플리케이션이 존재한다고 가정하고, 서버렌더링, 라우팅, 데이터 패치 기능을  하나씩 추가하면서 살펴보자
- 리액트 앱의 구조
    - index.js
    - List.js
    - Detail.js
    - dist/
        - clientBundle.js
- 코드
    
    ```jsx
    // index.js
    
    import React, {useState, useEffect } from 'react';
    import { createRoot } from 'react-dom/client';
    import Router from './Router';
    
    const root = createRoot(document);
    const params = new URLSearchParams();
    const thingId = params.get('id');
    
    root.render(
      window.location.pathname === '/' ? <List /> : <Detail thingId={thingId}/>
    );
    
    // List.js
    export const List = () => {
      const [things, setThings] = useState([]);
      const [requestState, setRequestState] = useState("initial");
      const [error, setError] = useState(null);
    
      useEffect(() => {
        setRequestState("loading");
        fetch("https://api.com/get-list")
          .then((r) => r.json())
          .then(setThings)
          .then(() => {
            setRequestState("success");
          })
          .catch((e) => {
              setRequestState("error");
              setError(e);
          });
      }, []);
    
      return (
        <div>
          <ul>
            {things.map((thing) => (
              <li key={thing.id}>{thing.label}</li>
            ))}
         </ul>
        </div>
      )  
    };
    
    // Detail.js
    export const Detail = ({thingId}) => {
      const [thing, setThing] = useState([]);
      const [requestState, setRequestState] = useState("initial");
      const [error, setError] = useState(null);
    
      useEffect(() => {
        setRequestState('loading');
        fetch('https://api.com/get-thing/' + thingId)
          .then((r) => r.json())
          .then(setThing)
          .then(() => {
            setRequestState('success');
          })
          .catch((e) => {
            setRequestState('error');
            setError(e);
          })
      }, []);
    
      return (
        <div>
          <h1>The thing!</h1>
          {thing}
        </div>
      )
    }
    ```
    
- 위 애플리케이션이 가지고 있는 문제는 아래와 같음
(클라이언트 사이드 렌더링 방식을 사용하는 리액트 애플리케이션에서 발생하는 흔한 문제들)
    - **읽어 들일 코드의 주소를 참조한 빈 페이지를 사용자에게 전송 후 자바스크립트를 파싱하고 실행함**
        - 사용자 입장에서는 빈 페이지 다운로드 → 애플리케이션 다운로드 → 자바스크립트 실행 까지의 과정을 기다려야함
        - 사용자가 검색엔진일 경우 이 페이지에 아무것도 표시되지 않을 수 있음(검색 엔진 크롤러가 JS를 지원하지 않는 경우 검색 엔진은 웹사이트의 색인을 생성하지 않음)
    - **데이터를 너무 늦게 가져오기 시작함**
        - 기본 기능을 위해 서버에 여러 번 요청해야 함(아래의 예시와 같이)
            - JS를 다운로드, 파싱, 실행
            - 리액트 컴포넌트를 렌더링, 커밋
            - useEffect에서 데이터를 가져오기 시작
            - 로딩 스피너를 렌더링하고 커밋
            - useEffect가 데이터 패치를 완료
            - 데이터를 렌더링하고 커밋
            - 만약 데이터가 포함된 페이지를 브라우저에 바로 제공한다면(SSR) 위 문제들을 해결할 수 있음
    - **라우터는 클라이언트 기반임**
        - 브라우저가 https://our-app.com/detail?tgingId=24 를 요청하면 서버에는 해당 파일이 없으므로 404로 응답하게 됨
        - 위 문제를 해결하기 위해 404 발생 시 JS를 읽어들이는 HTML 페이지를 반환하고 해당 페이지의 클라이언트 측 라우터가 주소를 다루도록 하는 방식이 일반적으로 쓰임
        - 하지만 이 방법은 JS 지원이 제한된 검색 엔진이나 환경에서는 작동 하지 않음

### 8.1.1 서버 렌더링

- 프레임워크는 일반적으로 서버 렌더링을 기본으로 제공함
- 예시 코드에 서버 렌더링 추가하기(이를 위해 서버가 필요. 간단한 설명을 위해 renderToString을 사용하였음)
    
    ```jsx
    // ./server.js
    
    import express from 'express';
    import { renderToString } from 'react-dom/server'; // 6장 내용 참고
    import { List } from './List'
    import { Detail } from './Detail'
    
    const app = express();
    app.use(express.static('./dist')); // 클라이언트 JS와 같은 정적 파일 가져오기
    
    const createLayout = (children) => `<html lang="en"
    <head>
    	<title>My page</title>
    </head>
    <body>
    	${children}
    	<script src="/cilentBundle.js"></script>
    </body>
    </html>`;
    
    app.get('/', (req, res) => {
    	res.setHeader('Content-Type', 'text/html');
    	res.end(createLayout(renderToString(<List />)));
    });
    
    app.listen(3000, () => {
    	console.info('App is listening!');
    );
    ```
    
    - 서버를 위해 다른 종류의 라우터를 추가함
    - 클라이언트 라우터와 서버 라우터 각각 존재
        - 클라이언트 라우터 → index.js에서 사용하는 라우터
        - 서버 라우터 → Expreess 서버에서 경로 별로 HTML을 반환하는 라우터 `(app.get(’/’, …)`
    - 대부분 프레임워크는 클라이언트와 서버 모두에서 작동하는 동형 라우터를 제공함

### 8.1.2 라우팅

- 수정을 통해 서버가 동작하게 되었지만 확장성이 좋지 않음
    - 경로 추가시 추가하는 각 경로에 대해 req.get 호출을 직접 작성 필요
- 확장 가능하게 만들기 위해 파일 시스템 기반 라우팅 적용
    - 파일 시스템 기반 라우팅
        - 파일 시스템의 디렉토리 구조를 기반으로 라우트를 자동으로 설정하는 방식
- 이를 위해 디렉터리 구조를 아래와 같이 변경
    - index.js
    - pages/
        - list.js
        - detail.js
    - dist/
        - clientBundle.js
- 위 구조로 pages의 모든 파일은 경로가 됨. 여기에 맞게 서버를 업데이트하기
    
    ```jsx
    // ./server.js
    
    import express from 'express';
    import { join } from 'path';
    import { renderToString } from 'react-dom/server'; // 6장 내용 참고
    
    const app = express();
    app.use(express.static('./dist')); // 클라이언트 JS와 같은 정적 파일 가져오기
    
    const createLayout = (children) => `<html lang="en"
    <head>
    	<title>My page</title>
    </head>
    <body>
    	${children}
    	<script src="/cilentBundle.js"></script>
    </body>
    </html>`;
    
    app.get('/:route', async(req, res) => {
    	// pages 디렉터리에서 라우트 컴포넌트 가져오기
    	cosnt exportedStuff = await import(
    		join(process.cwd(), 'pages', req.params.route)
    	);
    	// 예측 가능한 방법이 필요하므로 이름 붙여서 export 하지 않고
    	// default로 내보냄
    	const Page = exportedStuff .dafault;
    	
    	// query 문자열에서 props를 짐작할 수 있을까?
    	const props = req.query;
    	
    	res.setHeader('Content-Type', 'text/html');
    	res.end(createLayout(renderToString(<Page {...props} />)));
    });
    
    app.listen(3000, () => {
    	console.info('App is listening!');
    );
    ```
    
    - pages 디렉터리 방식 기준으로, 모든 페이지가 ./pages 디렉터리에 있고 모든 파일 이름이 라우터 경로가 된다는 규칙을 적용한다면 서버는 이 규칙을 기반으로 확장성을 높일 수 있음(각 페이지 컴포넌트는 export default로 내보내야함)

### 8.1.3 데이터 패치

- Props을 통해 초기 데이터를 받아들이도록 컴포넌트 업데이트
    
    ```jsx
    // ./pages/list.jsx
    // 파일 시스템 기반 라우팅을 위한 export default
    
    export default function List({ initialThings } /* 초기 프롭 설정 */){
      const [things, setThings] = useState([]);
      const [requestState, setRequestState] = useState("initial");
      const [error, setError] = useState(null);
    
    	// 필요한 경우 데이터를 가져오는 부분
      useEffect(() => {
    	  if(initialThings) return;
        setRequestState("loading");
        fetch("https://api.com/get-list")
          .then((r) => r.json())
          .then(setThings)
          .then(() => {
            setRequestState("success");
          })
          .catch((e) => {
              setRequestState("error");
              setError(e);
          });
      }, [initialThings]);
    
      return (
        <div>
          <ul>
            {things.map((thing) => (
              <li key={thing.id}>{thing.label}</li>
            ))}
         </ul>
        </div>
      )  
    };
    ```
    
- 페이지 렌더링 전 서버에서 필요한 데이터를 가져오고 데이터를 컴포넌트에 전달하기
    
    ```jsx
    // ./server.js
    
    import express from 'express';
    import { join } from 'path';
    import { renderToString } from 'react-dom/server'; // 6장 내용 참고
    
    const app = express();
    app.use(express.static('./dist')); // 클라이언트 JS와 같은 정적 파일 가져오기
    
    const createLayout = (children) => `<html lang="en"
    <head>
    	<title>My page</title>
    </head>
    <body>
    	${children}
    	<script src="/cilentBundle.js"></script>
    </body>
    </html>`;
    
    app.get('/:route', async(req, res) => {
    	cosnt exportedStuff = await import(
    		join(process.cwd(), 'pages', req.params.route)
    	);
    
    	const Page = exportedStuff .dafault;
    	
    	// 컴포넌트의 데이터 가져오기
    	const data = await exportedStuff.getData();
    	const props = req.query;
    	
    	res.setHeader('Content-Type', 'text/html');
    	
    	// 프롭과 데이터 전달
    	res.end(createLayout(renderToString(<Page {...props} {...data.props} />)));
    });
    
    app.listen(3000, () => {
    	console.info('App is listening!');
    );
    ```
    
- 데이터가 필요한 페이지 컴포넌트에서 getData라는 데이터 패치 함수를 내보내기 필요
    
    ```jsx
    // ./pages/list.jsx
    
    // 이 함수는 서버에서 호출되어 props 속성의 값을 그대로 컴포넌트에 전달함
    export const getData = async () => {
    	return {
    		props: {
    			initialThings: await fetch('https://api.com/get-list').then((r) =>
    				r.json();
    			),
    		},
    	};
    };
    
    export default function List({ initialThings } /* 초기 프롭 설정 */){
      const [things, setThings] = useState([]);
      const [requestState, setRequestState] = useState("initial");
      const [error, setError] = useState(null);
    
    	// 필요한 경우 데이터를 가져오는 부분
      useEffect(() => {
    	  if(initialThings) return;
        setRequestState("loading");
        getData()
          .then(setThings)
          .then(() => {
            setRequestState("success");
          })
          .catch((e) => {
              setRequestState("error");
              setError(e);
          });
      }, [initialThings]);
    
      return (
        <div>
          <ul>
            {things.map((thing) => (
              <li key={thing.id}>{thing.label}</li>
            ))}
         </ul>
        </div>
      )  
    };
    ```
    
- 지금까지 구현한 기능
    - 파일당 각 경로에 대해 가능한 경우 서버에서 데이터를 미리 가져오기
    - 전체 페이지를 HTML 문자열로 렌더링하기
    - 클라이언트에 전송하기

## 8.2 프레임워크 사용 시 장점

- 구조와 일관성
    - 코드베이스 구성을 위해 특정 구조와 패턴을 강제
        
        → 개발자는 애플리케이션의 흐름을 더 쉽게 이해할 수 있음
        
- 모범 사례
    - 모범 사례를 기본으로 제공하는 경우가 많음
        
        → 코드 품질이 향상되고 버그를 줄일 수 있음
        
    - e.g.
        - 프레임워크는 클라이언트가 데이터를 가져올 때까지 기다리지 않고 서버에서 미리 데이터를 가져오도록 권장할 수 있음
- 추상화
    - 라우팅, 데이터 패치, 서버 렌더링 등 일반적인 작업 처리를 위해 더 높은 수준의 추상화 제공
        
        → 코드의 가독성이 좋아지므로 유지보수가 쉬워짐. 또한 커뮤니티의 도움을 받아 추상화의 품질이 보장됨
        
    - e.g. Next.js
        - useRouter 훅을 통해 컴포넌트에서 라우터에 쉽게 접근 가능
- 성능 최적화
    - 대게 코드 분할, 서버 사이드 렌더링, 정적 사이트 생성 등 최적화 기능이 기본으로 제공됨
        
        → 애플리케이션의 성능을 향상 시킬 수 있음
        
    - e.g. Next.js
        - 애플리케이션을 자동으로 코드 분할하고 사용자가 링크 위로 마우스를 가져가면 다음 페이지의 코드를 미리 로드해 페이지의 전환 속도를 높임
- 커뮤니티와 생태계
    - 인기있는 프레임워크는 대규모 커뮤니티와 플러그인, 라이브러리를 포함한 풍부한 생태계를 갖추고 있음
        
        → 트러블슈팅 관련 정보를 찾기 쉬움
        

## 8.3 프레임워크 사용 시 트레이드 오프

- 학습 곡선
    - 프레임워크가 가지고있는 고유한 개념, API, 규칙에 대한 학습이 필요
- 유연성과 규칙
    - 프레임워크의 모델과 맞지 않는 요구사항을 구현해야하는 경우 프레임워크의 강제적인 구조아 규칙이 제약이 될 수 있음
    - e.g.
        - 빠른 인터넷과 최신 브라우저를 사용하는 특정 사용자 집단을 위해 개발해야하는 경우 서버 사이드 렌더링 or 데이터 패치가 불필요할 수 있음
- 의존과 서약
    - 프레임워크가 유지 보수를 중단하거나 사용자의 요구와 맞지 않는 방향으로 나아가는 경우 유지보수 or 다른 프레임워크로의 마이그레이션을 위해 많은 비용이 들어감
- 추상화 오버헤드
    - 추상화로 인해 디버깅과 성능 튜닝에 어려움을 겪을 수 있음
    - 모든 추상화는 약간의 오버헤드를 수반하기 때문에 성능에 영향을 미칠 수 있음
    - e.g. Next.js
        - 서버 액션을 위해 ‘use server’ 지시어를 사용하면 해당 액션이 서버에서 실행되도록 만들어주지만 내부적으로 어떻게 작동하는지 이해하기 어려움

## 8.4 인기 있는 리액트 프레임워크

### 8.4.1 Remix

- 리액트와 웹 플랫폼의 기능을 활용하는 강력한 최신 웹 프레임워크

### 8.4.2 Next.js

- 서버 사이드 렌더링과 정적 웹사이트 제작을 간편하게 할 수 있는 다양한 기능을 제공하는 리액트 프레임워크
- 설정보다는 규칙 원칙을 따름

## 8.5 프레임워크 선택

- 프레임워크마다 강점과 약점이 존재
- 프로젝트에 가장 적합한 프레임워크는 특정 요구 사항과 개발자의 선호도에 따라 달라짐

### 8.5.1 프로젝트 요구 사항 이해

- 프로젝트의 구체적인 요구 사항을 이해하는 것이 중요
- 고려해야 할 중요한 질문들
    - 프로젝트의 규모가 어떻게 되는지?
        - 소규모 개인 프로젝트 or 여러 기능이 포함된 중간 규모의 애플리케이션 or 대규모의 복잡한 애플리케이션
    - 프로젝트에 포함시키고 싶은 주요 기능과 특징이 무엇인지?
    - 서버 사이드 렌더링(SSR), 정적 사이트 생성(SSG) 또는 이 둘의 조합이 필요한지?
    - 블로그나 이커머스 사이트처럼 우수한 SEO가 큰 장점인 콘텐츠 중심의 사이트인지?
    - 실시간 데이터나 매우 동적인 콘텐츠가 애플리케이션의 중요한 부분인지?
    - 빌드 프로세스에 대한 커스터마이징과 제어가 어느 정도로 유연해야 하는지?
    - 애플리케이션의 성능과 속도는 얼마나 중요한지?
    - 개발자가 리액트와 일반적인 웹 개발 개념을 얼마나 숙지했는지?
    - 대상 사용자가 누구인지?
        - 고속 인터넷이 연결된 회사에서 일하는 사내 직원 or 사용자는 기기와 인터넷 속도가 저마다 다른 일반 대중

### 8.5.2 Next.js

- Next.js의 특징(강점)
    - 학습 곡선
        - 항상 최신 기술을 반영하기 때문에 학습 강도가 조금 높을 수 있음(내부적으로 리액트의 최신 기능을 사용)
        - 프레임워크의 다양한 기능을 다루는 명확한 가이드와 문서가 있어 참고 가능
    - 유연성
        - 정적 콘텐츠와 서버 렌더링된 콘텐츠 간의 유연한 전환을 염두에 두고 설계되었음
        - 다양한 플러그인과 통합 기능을 제공해 개발 속도를 크게 높일 수 있는 생태계를 갖춤
    - 성능
        - 성능을 매우 중시하며, 정적 생성과 서버 사이드 렌더링, 캐싱에 중점을 두고 있음(여러 목적별 캐시 메커니즘을 제공)
        - 성능 최적화 때문에 클라이언트/서버 간의 경계와 사용할 방식을 결정할 때 고충이 따를 수 있음

### 8.5.3 Remix

- Next.js에 비해 비교적 최신의 리액트 프레임워크
- 웹의 기본 원칙에 중점을 두되 강제하는 규칙이 더 적어 유연성이 좋은 게 특징
- Remix의 특징(강점)
    - 학습 곡선
        - 웹의 기본 기능을 더 많이 사용, 서버 컴포넌트 등장 전 많은 사람이 학습하던 방식으로 리액트를 사용하므로 조금 더 쉽게 배울 수 있음
    - 직관성
        - 웹 플랫폼의 기본 기능을 적극활용하여 개발자가 프레임워크의 복잡성에 방해받지 않도록 함
        - 직관적이고 친숙해서 좋지만, 다른 프레임워크처럼 혁신적인 기능은 제공하지 않아 제한적으로 느껴질 수 있음
    - 성능
        - 라우팅과 데이터 패치의 독특한 방식을 통해 효율과 성능을 향상시킴
        - 데이터 패치가 라우트와 연결되어 특정 라우트에 필요한 데이터만 가져옴 → 전체 데이터 요구량 감소
        - 낙관적 UI 업데이트와 점진적 향상 전략을 통해 사용자 경험을 더욱 개선함

### 8.5.4 트레이드오프

- 프레임워크의 선택은 장점과 단점이 뒤따름
- 프레임워크는 애플리케이션 구축에 대한 여러 설정과 결정을 표준화하여 개발자가 고민할 부분이 적음
    - 대다수 프레임워크에는 다음 질문의 해답이 설정되어 있음
        - 라우팅은 어떻게 구현할 것인가?
        - 정적 자산(이미지, JS/CSS 파일 등)은 어디에 둘 것인가?
        - 서버 렌더링을 해야 하는가?
        - 데이터 패치는 어디서 실행해야 하는가?
- 올바른 프레임워크를 선택하는 방법(Next.js vs Remix)
    - 다소 유연한 프레임워크가 필요하다면 Next.js가 더 적합할 수 있음
        - Next.js는 정적 사이트, 서버 사이드 렌더링, 클라이언트 전용 애플리케잇녀 등 다양한 방식의 선택이 가능
    - 서버 기반의 점진적 향상과 웹의 기본 원칙을 중시하는 접근 방식을 선호한다면 Remix가 적합할 수 있음

### 8.5.5 개발자 경험(빌드 성능 관련)

- 프로젝트의 복잡성과 규모가 커질수록 빌드 성능도 중요해짐
- Next.js와 Remix는 빌드 시간을 개선하기 위해 최적화를 진행함
- Next.js
    - 기본적으로 정적 생성을 사용하므로 빌드 시 페이지가 미리 렌더링됨
        
        →  페이지 로드가 빨라질 수 있지만 페이지 수가 많은 경우 빌드 시간이 길어질 수 있음
        
    - 이를 해결하기 위해 개발자가 정적 페이지를 빌드한 후 전체 재빌드 없이 정적 페이지를 재생성할 수 있는 증분 정적 재생성(ISR) 기능을 도입하였음
        
        → 대규모 동적 사이트의 빌드 시간을 크게 개선
        
- Remix
    - 빌드 성능에 대해 독특한 접근 방식을 취함
    - 서버 우선 아키텍처를 선택해 서버에서 필요할 때마다 페이지를 렌더링하고 HTML을 클라이언트로 전송하는 방식

### 8.5.6 런타임 성능

- 두 프레임워크 모두 성능을 염두에 두고 설계 되었음
- 빠르고 응답성이 뛰어난 애플리케이션이 되도록 여러 가지 최적화를 제공함
- Next.js
    - 기본적으로 성능 최적화 기능이 내장되어있음
        - 자동 코드 분할을 통해 각 페이지에 필요한 코드만 로드됨
        - 내장된 Image 컴포넌트는 이미지 로딩을 최적화하여 성능을 향상 시킴
    - 하이브리드 SSG/SSR 모델을 통해 개발자가 각 페이지에 최적화된 데이터 패치 전략을 선택할 수 있도록 함
        - 새로운 데이터가 필요하지 않은 페이지는 빌드 시점에 미리 렌더링해 빠르게 로딩되도록 함
        - 최신 데이터가 필요한 페이지는 SSR 또는 ISR 사용 가능
    - 데이터가 필요하지 않는 페이지에 대해 자동 정적 최적화를 수행함
        - 해당 페이지가 정적 HTML로 제공되도록 하여 첫 번째 바이트 시간(TTFB)가 빨라짐
        - TTFB(Time to First Byte) : 브라우저가 웹 페이지를 요청한 후, 서버로부터 첫 번째 바이트를 받는 데까지 걸리는 시간
- Remix
    - 강력한 캐싱 전략
        - 브라우저의 네이티브 패치와 캐시 API를 활용하므로 개발자가 다양한 리소스에 대한 캐싱 전략에 대해 직접 설정 가능 → 페이지 로딩이 빨라지고 애플리케이션의 안정성이 향상됨
