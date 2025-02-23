# 3장 가상 DOM
## 3.1 가상 DOM 소개
- DOM
    - HTML 문서를 자바스크립트 객체로 모델링한 것
    - 브라우저 런타임의 문서 객체 모델
- 가상 DOM
  - DOM의 가벼운 복사본
  - 실제 DOM은 노드 객체로 구성되고 가상 DOM은 설명 역할을 하는 평범한 JS 객체로 구성됨
- 리액트는 우리가 setState 또는 다른 매커니즘을 통해 UI를 변경하라고 할때마다 가상 DOM을 먼저 업데이트한 다음, 가상 DOM의 변경사항에 맞춰 실제 DOM을 업데이트함 (재조정)
    - 가상 DOM을 먼저 업데이트하는 이유는 실제 DOM의 업데이트가 다소 느리고 비용이 많이 들기 때문
- 가상 DOM 업데이트는 실제 페이지 레이아웃을 변경하지 않기 때문에 훨씬 빠르게 동작함
- 가상 DOM은 평범한 자바스크립트 객체로 구성되기 때문에 브라우저나 다른 호스트 환경에 얽매이지 않고 사용 가능
- 리액트는 가상 DOM이 업데이트되면 비교 알고리듬으로 가상 DOM의 이전 버전과 새 버전의 차이점을 식별, DOM 업데이트에 필요한 최소한의 변경 사항을 선정하여 적용

## 3.2 실제 DOM
- 웹 브라우저는 HTML 페이지를 읽어 들이고 나면, 구문을 분석해 노드와 객체의 트리, 즉 DOM이라고 부르는 객체 모델로 변환
- DOM은 커다란 자바스크립트 객체로, 노드라는 객체로 구성됨

```js
// DOM 노드
const dom = {
    type: 'document',
    doctype: 'html',
    children: [
        {
            type: 'html',
            children: [
                {
                    type: 'head',
                    children: [
                        {
                            type: 'title',
                            children: [
                                {
                                    type: 'text',
                                    content: 'Hello, World!'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'body',
                    children: [
                        {
                            type: 'h1',
                            children: [
                                {
                                    type: 'text',
                                    content: 'Hello, World!'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
}
```

- 트리의 각 노드는 HTML 엘리먼트를 나타내며 자바스크립트를 통해 조작할 수 있는 속성과 메소드가 포함됨
- 예를 들어 document.querySelector() 메소드를 사용하면 DOM에서 특정 엘리먼트를 선택할 수 있음
  - document.guerySelector를 사용하면 크고 복잡한 문서로 작업할 때 속도가 느려질 수 있음(문서 상단에서 아래로 이동하며 엘리먼트를 찾아야 하기 때문)
  - document.getElementById를 사용하면 더 빠르게 엘리먼트를 찾을 수 있지만 id의 고유성을 보장할 수 없기 때문에 해시 충돌이 발생할 수 있음

### 3.2.1 실제 DOM의 문제점
**성능**
- 엘리먼트의 추가나 제거 등으로 DOM을 변경할 때마다 브라우저는 레이아웃을 다시 계산하고 페이지의 영향을 받는 부분을 다시 그림
- offsetWidth 같은 속성에 접근할때도 레이아웃 위치를 다시 계산해야하는 리플로우가 발생할 수 있음
  - getBoundingClientRect() 메소드를 사용하면 레이아웃을 다시 계산하지 않고 엘리먼트의 크기와 위치를 얻을 수 있음
  - 하지만 대기중인 레이아웃 변경 사항이 있을때는 레이아웃을 다시 계산해야함
- offwetWidth 같은 레이아웃 의존 속성을 읽을 때는 예기치 않은 성능 문제가 생길 수 있으므로 주의해야하고 변수에 값을 캐싱하는 것이 좋음
  - 브라우저가 레이아웃 계산을 이미 수행한 경우라면 requestAnimationFrame을 사용하여 다음 프레임에서 레이아웃을 계산하도록 속성 읽기를 미룰수도 있음

**브라우저 간 호환성**
- 브라우저마다 문서 모델링 방식이 달라 웹 애플리케이션의 일관성이 보장되지 않고, 이로 인해 버그가 발생할 수 있음
- 특정 DOM 엘리먼트와 속성을 지원하지 않는 브라우저가 있을 수도 있음
- 리액트의 합성 이벤트(SyntheticEvent) 시스템은 여러 브라우저에서 일관성을 보장하기 위해 설계되었음
  - 이벤트 리스너를 엘리먼트에 직접 추가하지 않고 루트에서 이벤트를 받아서 처리
  - 다양한 기능 개선
    - ex) onChange 이벤트를 정규화 (input과 select의 방식이 다름)
  - 네이티브 이벤트에 접근
    - event.nativeEvent로 네이티브 이벤트에 접근 가능하여 유연하게 사용 가능

### 3.2.2 문서 조각
- 문서 조각은 DOM 노드를 저장하는 가벼운 컨테이너로 기본 DOM에 영향을 주지 않고 여러가지 업데이트를 수행할 수 있는 임시 저장소처럼 동작
- 업데이트 작업이 완료되면 문서 조각을 DOM에 추가하는 방식으로 리플로우와 리페인팅을 한번만 발생시킴
- 문서 조각의 성능 이점
  - 일괄 업데이트
    - 문서의 실제 DOM을 여러번 개별적으로 업데이트하는 대신 문서 조각 내의 모든 변경 사항을 일괄적으로 처리
  - 메모리 효율성
    - 문서 조각에 추가된 노드는 문서의 실제 DOM에서 제거되므로 문서에서 큰 영역을 재정렬할때 메모리 사용량을 최적화하는 데 일조
  - 중복 렌더링 방지
    - 문서 조각은 활성화된 문서 DOM 트리에 속하지 않으므로 문서 조각을 변경해도 실제 문서에는 영향을 주지 않으며, 실제 DOM에 추가될떄까지 스타일과 스크립트가 적용되지 않음

```js
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const li = document.createElement('li');
    li.textContent = `List item ${i}`;
    fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);
```

- 위처럼 문서에 대량의 노드를 추가할 때는 문서 조각을 사용하여 성능을 향상시킬 수 있음
- 문서 조각과 가상 DOM의 비슷한 점
  - 일괄 업데이트
    - 문서 조각과 유사하게 가상 DOM은 변경 사항을 일괄적으로 처리
  - 효율적인 비교 알고리즘
    - 변경 사항이 적용되고나면 리액트는 현재 가상 DOM과 이전 가상 DOM을 비교하여 변경 사항을 식별하고 최소한의 변경 사항만을 실제 DOM에 적용
  - 단일 렌더링
    - 차이점이 식별되면 리액트는 단 한번의 일괄 처리를 통해 실제 DOM을 업데이트

## 3.3 가상 DOM 작동 방식
### 3.3.1 리액트 엘리먼트
- 리액트에서 사용자 인터페이스는 컴포넌트 또는 HTML 엘리먼트의 가벼운 형태인 리액트 엘리먼트의 트리로 표현됨
- 리액트 엘리먼트는 React.createElement 함수를 사용하여 생성

```js
const element = React.createElement('h1', { className: 'greeting' }, 'Hello, World!');
```

- 이렇게 하면 h1 엘리먼트에 className 속성이 'greeting'으로 설정되고, 텍스트 노드에 'Hello, World!'가 포함된 리액트 엘리먼트가 생성됨
- console.log(element)를 실행하면 다음과 같은 결과가 출력됨

```js
{
    $$typeof: Symbol(react.element),
    type: 'h1',
    key: null,
    ref: null,
    props: {
        className: 'greeting',
        children: 'Hello, World!'
    },
    _owner: null,
    _store: {}
}
```

- $$typeof
  - 객체가 유효한 리액트 엘리먼트인지 확인할 때 사용하는 특수한 심벌
  - 엘리먼트의 종류에 따라 값이 달라짐
    - Symbol(react.fragment): 엘리먼트가 리액트 조각을 나타내는 경우
    - Symbol(react.portal): 엘리먼트가 리액트 포털을 나타내는 경우
    - Symbol(react.profiler): 엘리먼트가 리액트 프로파일러를 나타내는 경우
    - Symbol(react.provider): 엘리먼트가 리액트 컨텍스트 프로바이더를 나타내는 경우

- type
  - 엘리먼트가 나타내는 컴포넌트의 종류
  - 문자열이나 함수일 수 있음
    - 문자열: 내장 엘리먼트
    - 함수: 사용자 정의 컴포넌트
```jsx
const MyComponent = (props) => <h1>{props.text}</h1>;
const myElement = <MyComponent text="Hello, World!" />;

{
    $$typeof: Symbol(react.element),
    type: MyComponent,
    key: null,
    ref: null,
    props: {
        text: 'Hello, World!'
    },
    _owner: null,
    _store: {}
}
```
- 리액트는 엘리먼트의 깊숙한 단계로 계속 들어가며 스칼라 값을 만나면 이를 텍스트 노드로 렌더링

- ref
  - 부모 컴포넌트는 이 속성을 사용해 기본 DOM 노드에 대한 참조를 요청할 수 있음
  - 직접 DOM을 조작해야 하는 경우에 사용

- props
  - 컴포넌트에 전달된 모든 속성과 프롭을 포함하는 객체

- _owner
  - 프로덕션 빌드가 아닐때만 접근할 수 있는 속성으로, 이 엘리먼트를 생성한 컴포넌트를 추적하기 위해 리액트에서 내부적으로 사용됨
  - 프롭이나 상태가 변경될 때 엘리먼트의 업데이트를 담당할 컴포넌트를 결정하는 데 사용 (Parent와 Child의 관계를 추적)
  - 리액트가 내부적으로 구현을 위해서만 사용하는 값으로, 애플리케이션 코드에서 사용하면 안됨

- _store
  - 엘리먼트에 대한 추가 데이터를 저장하기 위해 리액트가 내부적으로 사용하는 객체
  - _store에 저장된 특정 속성 및 값은 공개 API의 일부가 아니므로 직접 접근해서는 안됨
  - _store 속성의 예시
```text
{
   validation: null,
    key: null,
    originalProps: {
        className: 'greeting',
        children: 'Hello, World!'
    },
    props: {
        className: 'greeting',
        children: 'Hello, World!'
    }, 
    _self: null,
    _source: {fileName: 'MyComponent.js', lineNumber: 10}, // 엘리먼트가 생성된 파일과 줄번호
    _owner: { //엘리먼트를 생성한 컴포넌트를 추적하는 데 사용
        _currentElement: [Circular], _debugId: 0, stateNode: [MyComponent]
        },
        _isStatic: false,
        _warnedAboutRefsInRender: false
}
```

### 3.3.2 가상 DOM과 실제 DOM 비교
- React.createElement 함수와 DOM에 내장된 document.createElement 메서드는 모두 새로운 엘리먼트를 생성한다는 점에서 유사하지만 React.createElement는 리액트 엘리먼트를 생성하고 document.createElement는 실제 DOM 노드를 생성
- 리액트 컴포넌트가 렌더링되면 리액트는 새 가상 DOM 트리를 생성하고 이전 가상 DOM 트리와 비교한 다음, 이전 트리를 새 트리와 일치하도록 업데이트하는 데 필요한 최소 변경 횟수를 계산 -> 재조정

```jsx
function App(){
    const [count, setCount] = React.useState(0);
  return React.createElement('div', null, 
          React.createElement('h1', null, `Count: ${count}`), 
          React.createElement('button', { onClick: () => setCount(count + 1) }, 'Increment'));
}
```

- 컴포넌트가 처음 렌더링될 때 리액트는 다음과 같이 가상 DOM 트리를 생성

div
├── h1
│   └── "Count: 0"
└── button
    └── "Increment"

- 버튼을 클릭하면 setCount 함수가 호출되어 count 상태를 업데이트하고, 리액트는 새 가상 DOM 트리를 생성

div
├── h1
│   └── "Count: 1"
└── button
    └── "Increment"

- 리액트는 이전 가상 DOM 트리와 새 가상 DOM 트리를 비교하여 변경 사항을 식별하고 실제 DOM을 업데이트

### 3.3.3 효율적인 업데이트
- 리액트가 이전트리와 새 트리를 비교할 때 재귀적으로 이루어짐
- 디핑 알고리즘
  - 두 트리의 루트에 있는 노드가 다른 경우, 리액트는 기존 트리 전체를 새 트리로 대체
  - 루트 노드가 동일하다면 노드의 속성이 변경된 경우에만 업데이트
  - 자식 노드가 다른 경우 변경된 자식 노드만 업데이트. 하위 트리 전체를 다시 생성하지 않고 변경된 노드만 업데이트
  - 노드의 자식들이 동일하지만 순서가 변경된 경우, 노드를 다시 생성하지 않고 실제 DOM에서 노드의 순서를 다시 설정
  - 트리에서 노드가 제거되면 리액트는 실제 DOM에서 노드를 제거
  - 트리에 새 노드가 추가되면 리액트는 실제 DOM에 새 노드를 추가
  - 노드의 종류가 변경된 경우 리액트는 노드를 제거하고 새 노드를 추가
  - 노드에 key 프롭이 있다면 리액트는 이를 사용해 노드의 교체가 필요한지 파악하므로 유용
- 불필요한 리렌더링
  - 리액트는 컴포넌트 상태가 변경되면 컴포넌트와 모든 자손 컴포넌트를 리렌더링함
  - 리렌더링한다는 것은 리액트가 각 함수 컴포넌트를 재귀적으로 호출하면서 프롭을 인수로 각 함수 컴포넌트에 전달한다는 의미
  - 리액트는 프롭이 변경되지 않은 컴포넌트도 무시하지 않고 상태나 프롭이 변경된 부모의 모든 자식 컴포넌트를 호출

```jsx
const ParentComponent = () => {
    const [count, setCount] = React.useState(0);
    return (
        <div>
            <h1>Count: {count}</h1>
            <ChildComponent />
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
};
```

- ChildComponent는 부모 컴포넌트의 상태에 의존하지 않으므로 부모 컴포넌트가 리렌더링되어도 자식 컴포넌트는 리렌더링되지 않아야 함
- 하지만 ParentComponent의 상태가 변경되면 ParentComponent가 리렌더릳되고 이로 인해 ChildComponent도 리렌더링됨
- 이런 문제를 해결하기 위해 리액트는 React.memo 함수를 사용하여 컴포넌트를 메모이제이션하고, 컴포넌트의 프롭이 변경되지 않으면 리렌더링을 방지할 수 있음

```jsx
const ChildComponent = React.memo(() => {
    console.log('ChildComponent rendered');
    return <h2>Child Component</h2>;
});
```