# 9장 - 리액트 서버 컴포넌트

- 리액트 서버 컴포넌트(React Server Component, RSC)
    - 리액트 애플리케이션의 성능, 효율성, 사용자 경험을 개선하기 위해 설계되었음
    - 서버에서 렌더링되는 멀티 페이지 애플리케이션(MPA)과 클라이언트에서 렌더링되는 단일 페이지 애플리케이션(SPA)의 장점을 결합하여 성능, 유지보수 편의성을 저해하지 않고 매끄러운 사용자 경험을 제공
    - 서버에서만 실행되는 특수한 종류의 컴포넌트
        
        → 클라이언트 자바스크립트 번들에 포함 X
        
    - 빌드 시점에 실행될 수 있기 때문에 파일 시스템에서 데이터 읽기, 정적 콘텐츠 가져오기, 데이터 레이어에 접근하는 등 작업이 가능함
- 리액트에서 모든 컴포넌트는 가상 DOM인 리액트 엘리먼트를 반환하는 함수
    
    → 서버 컴포넌트도 마찬가지임
    
- 서버 컴포넌트는 서버에서만 호출되어 리액트 엘리먼트(자바스크립트 객체)를 반환하고, 반환된결과는 네트워크를 통해 클라이언트로 전송됨

## 9.1 장점

- 성능 예측이 용이함
    - 컴포넌트가 서버에서만 실행되어, 다양한 클라이언트 환경보다 더 안정적이고 예측 가능한 성능을 제공함(클라이언트 환경은 성능, 네트워크 상태, 메모리 등 여러 요소를 예측하기 어려운 반면, 서버는 개발자가 직접 스펙을 정하고 관리하는 환경이기 때문에 예측이 가능)
- 안전한 서버 환경에서 작업 수행 가능
    - 토큰 등 민감 정보의 유출 걱정 없이 서버 컴포넌트에서 안전하게 작업 수행 가능
- 비동기로 동작 가능
    - 네트워크를 통해 클라이언트로 전송하기 전에 서버 컴포넌트의 동작이 완료될 때까지 기다릴 수 있음(클라이언트 입장에서 완성된 화면을 한 번에 받아보기 때문에 초기 로딩이 더 빠르고 깔끔)

## 9.2 서버 렌더링

- 서버 렌더링
    - 사용자가 웹페이지 요청 시 브라우저가 아닌 서버에서 HTML을 미리 만들어서 보내주는 방식
- 리액트에서 서버 렌더링
    - 리액트 애플리케이션을 서버에서 먼저 실행시켜 완성된 HTML을 생성하고 클라이언트에게 보내주는 방식
    - 리액트는 원래 브라우저에서 렌더링되지만, SSR에서는 Node.js와 같은 서버 환경에서 React 컴포넌트를 실행함
- 서버 컴포넌트와 서버 렌더링을 두 개의 독립적인 프로세스로 나눌 수 있음

### RSC 렌더러

- 리액트 서버 컴포넌트 전용 렌더러
- 서버에서 컴포넌트를 렌더링한 리액트 엘리먼트 트리를 생성

### 서버 렌더러

- RSC 렌더러에서 생성한 리액트 엘리먼트 트리를 마크업으로 변환(리액트 엘리먼트 → HTML 스트림 변환)
- 변환된 마크업은 네트워크를 통해 클라이언트에 스트리밍됨
- 리액트 엘리먼트 → HTML 스트림 변환 관련 메서드
    - `renderToString`
        - 리액트 엘리먼트를 완성된 HTML 문자열로 한 번에 변환
        - HTML을 문자열로 받아서 응답 본문에 바로 사용 가능
        - 모든 컴포넌트 렌더링이 끝나야 결과를 받을 수 있으므로 느림
    - `renderToPipeableStream`
        - 리액트 18에서 도입된 새로운방식
        - HTML을 스트리밍 방식으로 출력 가능
            
            (스트리밍 방식 : 데이터를 한 번에 전부 보내는 게 아닌 준비된 부분부터 조각조각 나눠 실시간으로 보내는 방식)
            
        - 렌더링이 완료된 부분부터 조각조각 클라이언트로 전달 가능
        → 빠른 응답, TTFB 개선
        - 클라이언트와의 상호작용이 필요한 Hydration Script도 함께 삽입 가능
- 서버 컴포넌트와 서버 렌더링의 상호 작용 과정
    - 서버에서 JSX 트리가 엘리먼트 트리로 변환됨
    - 서버는 엘리먼트 트리를 문자열이나 스트림으로 직렬화함
    - 문자열로 변환된 JSON 객체가 클라이언트로 전송됨
    - 클라이언트 측의 리액트는 JSON 문자열을 파싱하여 읽고, 평소처럼 렌더링
- 예시 - 서버 코드
    
  ```jsx
  // server.js
  const express = require('express');
  const path = require('path');
  const React = require('react');
  const ReactDOMServer = require('react-dom/server');
  const App = require('./src/App');
  
  const app = express();
  
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', async (req, res) => {
    // 비법 소스 부분
    **const rscTree = await turnServerComponentsIntoTreeOfElements(<App />);**
    // 비법 소스 부분 끝
    // 비동기로 동작한 서버 컴포넌트를 문자열로 렌더링
    const html = ReactDOMServer.renderTostring(rscTree);
    // 책에서는 설명을 위해 renderTostring 사용
    // 원래는 renderToPipeableStream 같은 API 사용하는 게 더 나음
    // 전송
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>My React App</title>
        </head>
        <body>
          <div id="root">${html}</div>
          <script src='/static/js/main.js'></script>
        </body>
      </html>
    `);
  });
  
  app.listen(3000, () => {
    console.log('Server listening on port 3000')
  });
  ```
    
    - 서버 렌더러로 전달하기 전 서버 컴포넌트 처리 단계가 하나 더 추가됨(비법 소스 부분)

### 9.2.1 내부 구조

- **turnServerComponentsIntoTreeOfElements**
    - 리액트 렌더러의 한 종류
    - <App /> 같은 상위 단계에서 시작해 재귀적으로 컴포넌트를 호출하며 반환되는 리액트 엘리먼트(자바스크립트 객체)를 가져옴
    - 예시 코드
        
      ```jsx
      async function turnServerComponentIntoTreeOfElements(jsx){
        // **첫번째 분기**
        if(
          typeof jsx === 'string' || 
          typeof jsx === 'number' || 
          typeof jsx === 'boolean' ||
          jsx == null 
        ){
          // 이 타입에 대해서는 아무 동작이 필요하지 않음
          return jsx;
        }
        // **두번째 분기**
        if(Array.isArray(jsx)){
          // 배열의 각 항목을 처리
          return Promise.all(jsx.map(child => renderJSXToClientJSX(child)));
        }
        // 객체를 다루는 경우
        if(jsx != null && typeof jsx === 'object'){
          // **세 번째 분기**
          // 객체가 React 엘리먼트인 경우
          if(jsx.$$typeof === Symbol.for('react.element')){
            // `{type}은 내장 컴포넌트를 나타내는 문자열
            if(typeof jsx.type === 'string'){
              // 여기는 <div /> 와 같은 내장 컴포넌트인 경우
              // 프롭을 전달해 JSON으로 변환하도록 함
              return {
                ...jsx,
                props: await renderJSXToClientJSX(jsx.props),
              };
            }
            if(typeof jsx.type === 'function'){
              // 여기는 <Footer /> 처럼 사용자가 작성한 리액트 컴포넌트인 경우
              // 함수를 호출하고 반환되는 JSX를 반복해서 처리함
              const Component = jsx.type;
              const props = jsx.props;
              const returnedJsx = await Component();
              // 서버컴포넌트는 서버에서 실행되므로 함수 컴포넌트의 비동기 작업이
              // 완료될 때까지 기다릴 수 있고 이를 위해 await를 사용함
              return await renderJSXToClientJSX();
            }
            throw new Error()
          }else{
            // 임의의 객체인 경우(프롭 또는 프롭 내부의 무언가)
            // 리액트 엘리먼트는 앞에서 다루고 있으므로 여기서 다루는 대상은
            // 객체지만 리액트 엘리먼트는 아님. 
            // 모든 값을 전달하고 JSX가 있으면 처리함
            return Object.fromEntries(
              await Promise.all(
                Object.entries(jsx).map(async ([propName, value]) => [
                  propName,
                  await renderJSXToClientJSX(value),
                ])
              )
            );
          }
        }
        throw new Error('Not implemented');
      }    
      ```
        
        - 인수를 기반으로 어떤 결과를 반환하는 조금 큰 if/else의 집합
    - 첫 번째 분기 설명
      
      ```jsx
      // 첫 번째 분기를 이해하기 위해 예시 추가
      <div>안녕!</div>
      ```
        
        - 이 리액트 엘리먼트의 자식인 “안녕!”은 문자열
        - 위 문자열을 서버 컴포넌트 렌더러에 전달하면 문자열을 그대로 반환함
        - 여기서 **클라이언트에 있는 리액트와 서버에 있는 리액트 모두 이해할 수 있는 데이터를 반환하는 것이 핵심**
    - 두 번째 분기 설명
        - 만약 배열이 전달된다면 배열의 map을 실행하여 재귀적으로 배열의 각 엘리먼트를 처리
        - 배열 예시
            
          ```jsx
          // 배열은 열 개의 자식 엘리먼트로 구성될 수 있음
          [
            <div>안녕</div>,
            <h1>안녕하세요</h1>,
            <span>안녕하쇼</span>,
            (props) => <p id={props.id}>메롱</p>,
          ];
          ```
            
            - fragment는 자식을 배열 형태로 표현하는데, 각 자식에 대해 재귀적으로 함수를 호출하여 처리 후 다음 단계로 넘어감
    - 세 번째 분기 설명
        - 객체를 처리하는 단계
        - 모든 리액트 엘리먼트는 객체이지만 **모든 객체가 리액트 엘리먼트인 건 아님**
        - **리액트 엘리먼트는 `$$typeOf` 속성을 가지며, 속성의 값은 `Symbol.for('react.element')` 이므로 이 속성과 속성의 값이 일치한다면 리액트 엘리먼트로 취급함**
        - 객체가 리액트 엘리먼트인 경우(jsx.$$typeof === Symbol.for('react.element')가 참일 때) jsx.type이 string인지 function인지 확인 후 다르게 처리함
        → 리액트 엘리먼트는 string or function 타입으로 표현됨(”div”, “span” 등 내장 DOM 엘리먼트에는 문자열이 사용되고 사용자가 작성한 <Footer /> 같은 컴포넌트에는 함수가 사용됨)
        - jsx.type이 string인 경우
            - 내장된 DOM 엘리먼트 이므로 그대로 반환
            - 자식으로 동시성 리액트 컴포넌트가 포함될 수도 있으므로 재귀적으로 프롭에 대해 함수를호출해 처리
        - jsx.type이 function인 경우
            - 사용자가 작성한 컴포넌트를 나타내는 것이므로 해당 컴포넌트를 프롭과 함께 호출, 컴포넌트가 반환하는 JSX에 대해 재귀적으로 함수를 호출함
            - 문자열, 숫자, 불리언 또는 이러한 값의 배열, 문자열 타입의 리액트 엘리먼트가 반환될 때까지 반복함

### 직렬화

- 애플리케이션이 서버에서 렌더링될 때 생성된 리액트 엘리먼트는 브라우저로 전송될 수있는 HTML 문자열로 변환이 필요함. 이때 리액트 엘리먼트를 문자열로 변환하는 과정이 **직렬화**
- 직렬화 단계가 중요한 이유
    - 서버가 즉시 표현할 수 있는 완전한 HTML 페이지를 빠르게 클라이언트에 전송할 수 있음
    - 리액트 엘리먼트를 HTML 문자열로 직렬화하면 환경에 관계없이 일관되고 예측 가능한 초기 렌더링이 가능해짐
        - 일관성은 초기 렌더링과 최종 렌더링이 다르 경우 생기는 깜빡임이나 레이아웃 변화를 방지하므로 매끄러운 사용자 경험을 보장하는 데 반드시 필요
    - 클라이언트 측의 하이드레이션 프로세스를 용이하게 함
- 리액트 엘리먼트는 평범한 자바스크립트 객체가 아니므로 JSON.stringify 만으로는 직렬화가 불가능함
    
    → 리액트 엘리먼트는 $$typeof 속성을 가지고 있고, 이 속성의 값은 심벌임. 심벌은 직렬화해서 네트워크로 전송할 수 없기 때문에 다른 방법이 필요
    
- $$typeof 값을 문자열처럼 직렬화 가능한 형태로 바꾸는 방법
    
  ```jsx
  JSON.stringify(jsxTree, (key, value) => {
    if(key === '$$typeof'){
      return 'react.element'; // 문자열 
    }
    return value; // 그 외 값은 그대로 반환
  })
  ```
    
- 클라이언트에서 역직렬화하는 방법
    
  ```jsx
  JSON.parse(serializedJsxTree, (key, value) => {
    if(key === '$$typeof'){
      return Symbol.for('react.element'); // 심벌 
    }
    return value; // 그 외 값은 그대로 반환
  })
  ```
    

### 페이지 탐색

- RSC를 지원하는 애플리케이션은 다음 링크를 포함할 수 있음
    
  ```jsx
  <a href='/blog'>블로그</a>
  ```
    
    - 링크 클릭 시 전체 페이지 탐색이 발생해 브라우저가 서버에 요청을 보내고 서버는 해당 페이지를 렌더링 후 결과를 브라우저에 다시 전송함
    - RSC를 사용하면 위 방법보다 더 나은 방법인 **소프트 네비게이션**을 사용할 수 있음
        - 소프트 네비게이션을 사용하면 경로가 변경돼도 상태가 유지됨. 
        이동하고자 하는 URL를 서버로 전송하면 서버는 해당 페이지의 JSX 트리를 반환하여 브라우저의 리액트가 새로운 JSX 트리를 사용해 전체 페이지를 재렌더링하므로 전체 페이지 새로고침 없이 새로운 페이지를 볼 수 있게됨
- 소프트 네비게이션
    - 페이지를 완전히 새로고침하는 하드 네비게이션과 대비해 필요한 데이터만 불러와 새 페이지를 표시하는 방식
- 소프트 네비게이션 적용 코드
    
  ```jsx
  import { hydrateRoot } from 'react-dom/client';
  import { deserialize } from './serializer.js';
  import App from './App';
  
  const root = hydrateRoot(document, <App />); // root
  
  // 링크 기본 동작 방지 
  // + 새 페이지에 대한 요청을 서버로 전송하는 이벤트 리스너를 
  // 아래처럼 애플리케이션 내부의 모든 링크에 추가함
  window.addEventListener('click', (event) => {
    if(event.target.tagName !== 'A'){
      return;
    }
    event.preventDefault();
    navigate(event.target.href);
  });
  
  // navigate 함수 정의
  // 새 페이지에 대한 요청을 서버로 보내고
  // 응답을 리액트 엘리먼트로 역직렬화 후 해당 엘리먼트를 애플리케이션 루트에 렌더링함
  async function navigate(url){
    const response = await fetch(url, {headers: {'jsx-only': true} });
    const jsxTree = await response.json();
    const element = JSON.parse(jsxTree, (key, value) => {
      if(key === '$$typeof'){
        return Symbol.for('react.element');
      }
      return value;
    })
    root.render(element);
  }
  ```
    
    - 페이지를 처음 하이드레이션할 때 리액트에서 루트를 얻고, 루트를 사용해 새 엘리먼트 렌더링이 가능
    - 서버가 jsx-only 헤더를 받는 경우 전체 HTML 문자열을 반환하는 대신 다음 페이지의 JSX 트리 객체만 응답으로 반환하도록 해야함

### 9.2.2 업데이트

- RSC는 서버 컴포넌트와 클라이언트 컴포넌트를 둘다 고려해야한다는 점에서 생각할 게 많음
    - 컴포넌트 중에는 서버 컴포넌트가 될 수 없는 것도 존재
- 컴포넌트가 서버 컴포넌트가 될 수 없는 경우 : 클라이언트 전용 API를 사용하는 경우
    - useState 등(서버는 useState의 초기값이 무엇인지 알 수 없으므로 초기 HTML을 렌더링할 수없음)
    - onClick 등(서버는 인터랙티브하지 않기 때문에 서버에서 실행 중인 프로세스를 클릭할 수 없음)
- **서버 부분과 클라이언트 부분을 최대한 분리하여 처리해야 함**
    - 이렇게 해야 자바스크립트 번들의 크기를 줄일 수 있고 이로 인해 로딩 시간 단축, 성능 향상이 가능해짐. CPU 측면에서도 자바스크립트를 파싱하고 실행하는 작업이 감소하므로 좋음

### 내부 동작

- 리액트가 서버 컴포넌트와 클라이언트 컴포넌트를 내부적으로 구분하고 처리하는 방법
- 개념적으로 **서버에서 실행되는 서버 그래프와 클라이언트에서 필요할 때 다운로드 되어 실행되는 하나 이상의 클라이언트 번들이 존재**함
- 예시 코드의 컴포넌트 트리를 시각화한 그림
 
    ![image](https://github.com/user-attachments/assets/4180cb61-375f-4474-81b6-8e4a5c412e8a)

    
    - 짙은 음영으로 표시된 컴포넌트는 클라이언트 컴포넌트, 그 외 컴포넌트는 서버 컴포넌트임
    - 트리의 **루트는 서버 컴포넌트**이므로 **전체 트리는 서버에서 렌더링**됨
    - InteractiveClientPart 컴포넌트는 클라이언트이므로 서버에서 렌더링되지 않음
    대신, **서버는 클라이언트 컴포넌트를 위한 플레이스 홀더를 렌더링**함
        - **플레이스 홀더 : 클라이언트 번들러가 생성한 특정 모듈에 대한 참조로, ‘트리의 이 지점에 도달하면 특정 모듈을 사용해야한다’고 알림**
- 이처럼 서버는 **올바른 클라이언트 모듈에 대한 참조를 전송하고, 클라이언트의 리액트가 해당 참조를 기반으로 빈 부분을 채움**
    
    → 이 과정에서 리액트는 모듈 참조를 클라이언트 번들에 있는 실제 모듈로 교체함
    
- RSC는 서버 컴포넌트와 클라이언트 컴포넌트를 구분하여 처리해야 하므로 이를 명확히 나눠 번들링할 수 있는 차세대 번들러가 필요함
- 예시
    
  ```jsx
  // 서버 컴포넌트 (Server Component)
  import Button from './Button' // 클라이언트 컴포넌트
  
  export default function Page() {
    return (
      <div>
        <h1>Hello</h1>
        <Button /> {/* 이 부분은 모듈 참조로 처리됨 */}
      </div>
    )
  }
  ```
    
    - 서버는 `<h1>Hello</h1>`만 렌더링하고 `<Button />`은 "여기에 Button 컴포넌트를 넣어야 함" 이라는 참조 정보만 포함
    - 클라이언트는 이 참조를 바탕으로 Button 컴포넌트가 들어있는 **JS 번들 파일**을 찾아서 해당 위치에 **실제 Button을 렌더링함**

### 9.2.3 주의할 점

- 서버 컴포넌트는 실제로 서버에서만 실행되고, 리액트 엘리먼트를 의미하는 객체를 출력함
- **클라이언트 컴포넌트는 클라이언트에서만 실행되지 않음**
- 컴포넌트 실행의 의미
    - **컴포넌트를 표현하는 함수의 호출**
- 정리
    - 서버 컴포넌트는 서버에서 실행되며 리액트 엘리먼트를 나타내는 객체를 출력함
    - 클라이언트 컴포넌트는 서버에서 실행되며 리액트 엘리먼트를 나타내는 객체를 출력함
    - 서버에는 클라이언트와 서버 컴포넌트의 모든 리액트 엘리먼트를 표현하는 커다란 객체가 존재
    - 이 객체는 문자열로 변환되어 클라이언트로 전송됨
    - 이 시점부터 서버 컴포넌트는 클라이언트에서 실행되지 않음
    - 이 시점부터 클라이언트 컴포넌트는 클라이언트에서만 실행됨

## 9.3 서버 컴포넌트 규칙

### 9.3.1 직렬화 가능성이 가장 중요하다

- 서버 컴포넌트에서는 모든 프롭을 직렬화할 수 있어야 함
    
    → 서버가 프롭을 직렬화하여 클라이언트로 전송할 수 있어야하기 때문
    
- 위와 같은 이유로 서버 컴포넌트에서는 함수 등 직렬화할 수 없는 값은 프롭으로 사용할 수 없음
→ 렌더 프롭 패턴을 서버 컴포넌트에서 사용할 수 없는 이유

### 9.3.2 부작용이 있는 훅 금지

- 서버 환경은 인터랙티브하지 않고 DOM이나 window 객체도 없음. 클라이언트 환경과 매우 다르므로 부작용이 있는 훅은 사용 할 수 없음
    - 부작용이란 렌더링 외의 상태 변경, DOM 업데이트, 데이터 페칭과 같은 추가적인 작업을 의미

### 9.3.3 상태는 동일하지 않다

- 서버 컴포넌트의 상태는 클라이언트 컴포넌트의 상태와 동일하지 않음
- 서버 컴포넌트는 서버에서, 클라이언트 컴포넌트는 클라이언트에서 렌더링 되기 때문
- 서버와 클라이언트의 관계는 1:1이 아닌 1:N의 관계
    - 하나의 서버가 다수의 클라이언트에 대응하므로 서버의 상태가 여러 클라이언트에 공유될 수 있으며 위험성이 높음
- 즉, 상태를 다루는 useState, useReduer 같은 훅은 클라이언트 컴포넌트로 작성하는 것이 적합함

### 9.3.4 클라이언트 컴포넌트는 서버 컴포넌트를 가져올 수 없다

- 서버 컴포넌트는 서버에서만 실행되지만, 클라이언트 컴포넌트는 브라우저를 포함해 양쪽 모두에서 실행되므로 클라이언트 컴포넌트는 서버 컴포넌트를 가져올 수 없음

### 9.3.5 클라이언트 컴포넌트는 나쁘지않다

- 서버 컴포넌트 도입 전 기존의 모든 리액트 컴포넌트는 클라이언트 컴포넌트였음
- 서버 컴포넌트는 클라이언트 컴포넌트를 대체하는 게 아님. 클라이언트 컴포넌트와 함께 사용할 수 있는 새로운 종류의 컴포넌트임

## 9.4 서버 함수

- 클라이언트가 아닌 서버에서 실행되는 함수
- 서버 함수를 사용하면 클라이언트 컴포넌트가 서버에서 실행되는 비동기 함수를 호출할 수 있음
- 서버 함수가 ‘use server’ 지시어로 정의되면, 프레임워크는 자동으로 서버 함수에 대한 참조를 생성하고 이 참조를 클라이언트 컴포넌트에 전달함. 클라이언트에서 해당 함수가 호출되면, 리액트는 서버에 함수를 실행하라는 요청을 보내고 결과를 반환함
- 서버 함수는 서버 컴포넌트에서 생성 후 클라이언트 컴포넌트에 Props로 전달 가능. 클라이언트에서 가져와서 사용하는 것도 가능함

### 9.4.1 폼과 데이터 조작

- 예시
    
  ```jsx
  // App.js
  async function requestUsername(formData){
    'use server';
    const username = formData.get('username');
    // ...
  }
  export default App(){
    <form action={requestUsername}>
      <input type="text" name="username" />
      <button type="submit">요청</button>
    </form>
  }
  ```
    
    - requestUsername은 <form>으로 전달되는 서버 함수
    - 사용자가 form을 제출하면 서버의 requestUsername 함수에 네트워크 요청이 전달
    - 폼에서 서버 함수를 호출하면 리액트는 폼의 FormData를 서버 함수의 첫 번째 인수로 제공함
- 자바스크립트 번들이 전부 로드되기 전에도 폼을 사용하고 전송할 수 있음

### 9.4.2 폼 외부

- 서버 함수는 서버 엔드포인트로 노출되며 클라이언트 코드 어디에서든 호출이 가능
- 폼이 아닌 곳에서 서버 함수를 사용하는 경우 트랜지션 내부에서도 서버 함수 호출이 가능
    
    → 이를 통해 로딩 메시지 표시, 낙관적인 상태 업데이트를 보여주기, 예상치 못한 오류 처리가 가능함
    
- 폼이 아닌 곳에서 사용하는 서버 함수의 예시
    
    ```jsx
    'use client';
    
    import { useState, useTransition } from 'react'
    
    function LikeButton(){
    	const [isPending, startTransition] = useTransition();
    	const [likeCount, setLikeCount] = useState(0);
    	
    	const incrementLike = async () => {
    		'use server';
    		return likeCount+1;
    	};
    	
    	const onClike = () => {
    		startTransition(async () => {
    			// 서버 함수에서 프로미스가 반환되므로 await를 사용해 반환되는 값을 읽음
    			const currentCount = await increamentLike();
    			setLikeCount(currentCount);
    		});
    	};
    	return (
    		<>
    			<p>좋아요 수 : {likeCount}</p>
    			<button onClick={onClick} disabled={isPending}>
    				좋아요
    			</button>
    		</>
    	);
    }
    ```
    
- 서버 함수는 클라이언트 코드에서 서버 함수를 호출할 수 있게 해줌
    
    → 기본 리액트에서 사용하기엔 번거롭고 많은 설정이 필요하므로 라이브러리나 프레임워크를 통해 사용하는 것을 권장
    

## 9.5 리액트 서버 컴포넌트의 미래

- 더 나은 번들러 통합
    - 리액트 팀은 웹팩, 롤업, 비트 같은 번들러의 개발자들과 협력해 RSC에 대한 지원 개선을 위해 노력중 → RSC와 호환되는 프레임워크와 애플리케이션을 더 쉽게 구축할 수 있을 것
- 생태계 지원
    - RSC가 주먹을 받으면서 새 애플리케이션 아키텍처를 지원하고 확장하는 도구, 라이브러리, 프레임워크가 등장할 것
