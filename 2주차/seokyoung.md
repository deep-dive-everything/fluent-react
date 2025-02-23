## 가상 DOM

- HTML 문서를 자바스크립트 객체로 모델링한 것으로, 실제 DOM의 가벼운 복사본
  - 실제 DOM → 노드 객체
  - 가상 DOM → 자바스크립트 객체

### 그렇다면 왜 가상 DOM?

> 리액트는 UI 업데이트 시 재조정(Reconciliation) 메커니즘을 사용
>
> - UI 변경 → 가상 DOM 업데이트 → 실제 DOM 업데이트

- 가상 DOM을 먼저 업데이트하는 이유
  - 실제 DOM 업데이트: reflow(계산) → repaint(화면 그리기)
  - reflow가 많이 발생하면 성능에 영향을 주고 직접적인 DOM 상호 작용이 비효율적으로 동작할 수 있음
- 가상 DOM 업데이트는 훨씬 빠르다는 말인데.. 왜?
  - 그저 자바스크립 객체…
  - 브라우저나 다른 호스트 환경에 얽매이지 않고 자바스크립트 엔진을 최대한 활용하는 다양한 알고리즘에 접근해 빠르고 효율적인 조작이 가능
- 가상 DOM과 실제 DOM을 비교하는 과정에서 비교 알고리즘 사용
  - 일관적이고 최적화된 방식으로 변경사항을 적용 → 성능 영향 최소화

## 실제 DOM

- 웹 브라우저가 HTML을 파싱하여 생성한 노드 트리
- 웹 페이지의 실시간 상태를 표현 → 사용자 상호 작용,등 수많은 요소의 영향을 받기 때문에 변동성이 큼 → 즉, 상태 관리의 어려움

> ✨ 리액트는 가상 DOM을 통해 안전하게 DOM을 탐색할 수 있도록 한다.

## 실제 DOM의 문제점

### 성능

#### 레이아웃 계산

- `offsetWidth` → `getBoundingClientRect()`
  - `offsetWidth`: 상위 엘리먼트에 따라 계산되는 속성으로 브라우저가 정확한 값을 반환하려면 레이아웃 정보가 최신 상태인지 확인해야 함
  - `getBoundingClientRect()`: 레이아웃의 읽기 및 쓰기 작업을 일괄 처리하여 성능 최적화
  - 레이아웃 스레싱: 레이아웃 속성을 읽고 쓰는 작업이 자주 반복될 때 발생하는 불필요한 레이아웃 재계산

> ✨ 리액트는 가상 DOM을 실제 DOM 작업 간의 중간 계층으로 활용해 이러한 작업을 **알아서 처리**한다.

#### DOM 조작 비용

- 자바스크립트를 사용해 목록에 새 항목을 추가한다고 가정
  - 목록이 크다면 이 작업은 속도가 느리고 리소스를 많이 사용할 수 있음
  - 항목이 하나만 추가되었음에도 브라우저는 레이아웃을 다시 계산하고 전체 목록을 다시 그려야 함
  - 속도가 느린 기기에서 실행하거나 목록의 항목이 아주 많다면 상당한 시간과 리소스 소요

```html
<!DOCTYPE html>
<html>
  <head>
    <title>예시</title>
  </head>
  <body>
    <ul id="list">
      <li>목록 항목 1</li>
      <li>목록 항목 2</li>
      <li>목록 항목 3</li>
    </ul>
    <button id="button">추가</button>
    <script>
      const list = document.getElementById('list')
      const newItem = document.createElement('li')
      const button = document.getElementById('button')

      button.addEventListener('click', () => {
        newItem.textContent = '목록 항목 4'
        list.appendChild(newItem)
      })
    </script>
  </body>
</html>
```

### 브라우저 간 호환성

- 브라우저마다 문서 모델링 방식이 달라 웹 애플리케이션의 일관성이 보장되지 않고, 이로 인해 버그가 발생할 수 있음
- 리액트에서는 이를 **합성 이벤트(SyntheticEvent)** 시스템으로 해결

> [!NOTE]
>
> #### SyntheticEvent
>
> - 브라우저 기본 이벤트를 감싼 [React의 이벤트 객체](https://ko.react.dev/reference/react-dom/components/common#react-event-object)
> - 통합 인터페이스: 브라우저마다 다른 이벤트 객체 일관되게 처리할 수 있도록 추상화
> - 이벤트 위임
>   - 이벤트 리스너를 상위 루트에서 한 번만 처리하여 성능 최적화
>   - 구형 브라우저에서 특정 엘리먼트에서 일부 이벤트를 사용할 수 없는 문제 방지
> - 다양한 기능 개선
>   - 입력 컴포넌트 종류에 따라 다르게 동작하는 이벤트를 정규화
>   - 브라우저별 차이를 신경 쓸 필요 없이 애플리케이션 로직에 집중 가능
> - 네이티브 이벤트 접근 - `onMouseLeave`에서 `e.nativeEvent`는 `mouseout` 이벤트를 가리키는 등 - 기본 브라우저 이벤트가 필요한 경우 `event.nativeEvent`를 통해 읽어와야 함

### 문서 조각(document fragment)

- DOM 노드를 저장하는 가벼운 컨테이너
- 기본 DOM에 영향을 주지 않으면, 여러 가지 업데이트를 수행할 수 있는 **일종의 임시 저장소**처럼 동작
- 업데이트 작업이 완료되면 문서 조각을 DOM에 추가하는 방식
  - reflow + repaint가 한 번만 발생됨 → 일괄 처리를 한다
- 일괄 업데이트
  - 문서 조각 내의 모든 변경 사항을 일괄적으로 처리(Batching)
- 메모리 효율성
  - 문서 조각에 추가된 노드는 실제 DOM에서 제거 → 큰 영역 재정렬 시 메모리 사용량 최적화 가능
- 중복 렌더링 방지
  - 문서 조각은 활성화된 DOM 트리에 속하지 않음 → 문서 조각을 변경해도 실제 DOM에 영향 X
  - 실제 DOM에 추가될 때까지 스타일 및 스크립트 적용 X → 중복 수행 방지

```tsx
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  // 일괄 처리됨
  const li = document.createElement('li')
  li.textContent = `목록 항목 ${i + 1}`
  fragement.appendChild(li)
}
document.getElementById('myList').appendChild(fragment) // 여기에서 실제 DOM에 추가해서 한 번만 업데이트
```

### 리액트의 가상 DOM

> ✨ 즉, 리액트의 가상 DOM은 문서 조각 개념을 더 나은 방식으로 구현한 것으로 볼 수 있다.

- **Batching** → state, props가 변경될 때 문서의 실제 DOM을 직접 변경하는 대신, 가상 DOM에 변경 사항을 먼저 적용해 한꺼번에 일괄 처리
- **Diffing Algorithm** → 실제 DOM에 필요한 변경 사항만 처리하는 효율적인 비교 알고리즘 사용

## 가상 DOM 작동 방식

### 리액트 엘리먼트

- `React.createElement` 를 사용하여 트리 구조의 UI를 표현하는 자바스크립트 객체 생성

```tsx
import React from 'react'

const element = React.createElement('div', { className: 'my-class' }, 'Hello, world!')

console.log(element)
```

```tsx

{
	$$typeof: Symbol(react.element),
	type: "div",
	key: null,
	ref: null,
	props: {
		className: "my-class",
		children: "Hello, world!".
	},
	_owner: null,
	_store: {},
	_self: null,
	_source: null,
	[[Prototype]]: {}
}
```

#### `$$typeof`

- 리액트 엘리먼트의 종류를 식별하는 표시자 역할
- XSS 공격에 취약한 점을 보완하기 위해 심벌 값을 사용
- 엘리먼트 종류에 따라 다른 심벌 값
  - `Symbol(react.fragment)`: 엘리먼트가 리액트 조각을 나타낸 경우
  - `Symbol(react.portal)`: 엘리먼트가 리액트 포털을 나타내는 경우
  - `Symbol(react.profiler)`: 엘리먼트가 리액트 프로파일러를 나타내는 경우
  - `Symbol(react.provider)`: 엘리먼트가 리액트 콘텍스트 제공자를 나타내는 경우

#### `type`

- 엘리먼트가 나타내는 컴포넌트의 종류
- 문자열 또는 함수로 표현
  - 문자열 → 네이티브 HTML 태그
  - 함수 → 커스텀 컴포넌트(JSX를 변환하는 자바스크립트 함수)
- 커스텀 컴포넌트 렌더링 방식
  - 함수 타입의 엘리먼트를 만나면, 엘리먼트의 props를 전달
  - 해당 함수 호출
  - 함수 반환값을 엘리먼트의 `children`으로 사용
- 리액트는 엘리먼트의 깊숙한 단계로 계속 들어가며 스칼라 값을 만나면 이를 텍스트 노드로 렌더링
  - 스칼라 값: 숫자, 문자열, 불리언처럼 더 이상 분해되지 않는 하나의 단일값
  - `null` 또는 `undefined`를 만나면 아무것도 렌더링하지 않음

```tsx
const MyComponent = props => {
  return <div>{props.text}</div>
}

const myElement = <MyComponent text="Hello, world!" />
```

```tsx
{
	$$typeof: Symbol(react.element),
	type: MyComponent,
	key: null,
	ref: null,
	props: {
		text: "Hello, world!".
	},
	_owner: null,
	_store: {},
	_self: undefined,
	_source: undefined,
	[[Prototype]]: {}
}
```

#### `ref`

- 부모 컴포넌트가 기본 DOM 노드에 대한 참조를 요청 시 사용하는 속성
- 보통 DOM을 직접 조작해야 하는 경우에 사용
- 기본 값: `null` 설정

#### `props`

- 컴포넌트에 전달되는 데이터

#### `_owner`

> 🚫 리액트의 내부 세부 구현 사항이므로 애플리케이션 코드에서 직접 접근하면 안 됨

- 프로덕션 빌드가 아닐 때만 접근할 수 있는 속성
- 엘리먼트를 생성한 컴포넌트를 추적하기 위해 리액트에서 내부적으로 사용하는 속성
- props나 상태가 변경될 때 엘리먼트의 업데이트를 담당할 컴포넌트를 결정하는 데 사용
  - 즉, Parent 컴포넌트가 상태를 업데이트하거나 새로운 props를 받으면 리액트는 Child 컴포넌트 및 이와 연관된 엘리먼트를 업데이트

```tsx
function Parent() {
  return <Child />
}

function Child() {
  const element = <div>Hello, world!</div>
  console.log(element._owner) // Parent
  return element
}
```

#### `_store`

> 🚫 리액트의 내부 세부 구현 사항이므로 애플리케이션 코드에서 직접 접근하면 안 됨

- 엘리먼트에 대한 추가 데이터 저장을 위해 리액트가 내부적으로 사용하는 객체
- 리액트가 내부적으로 엘리먼트의 상태와 콘텍스트의 다양한 측면을 추적할 때 사용

```tsx
{
	validation: null,
	key: null,
	originProps: { className: 'my-class', children: 'Hello, world!' }, // 컴포넌트에 전달된 props를 저장하는 데 사용
	props: { className: 'my-class', children: 'Hello, world!', }, // 컴포넌트에 전달된 props를 저장하는 데 사용
	_self: null,
	_source: { fileName: 'MyComponent.js', lineNumber: 10 }, // 개발 모드에서 엘리먼트가 생성된 파일 이름과 줄 번호를 추적하는 데 사용 (디버깅 용도)
	_owner: { // 엘리먼트를 생성한 컴포넌트를 추적하는 데 사용
		_currentElement: [Circular], _debugID: 0, stateNode: [MyComponent],
	},
	_isStatic: false,
	_warnedAboutRefInRender: false,
}
```

### 가상 DOM과 실제 DOM 비교

- `React.creatElement`: 메모리에 새로운 가상 엘리멘트를 생성하는 함수
- `document.createElement`: DOM에 추가되기 전, 메모리에 새로운 엘리먼트를 생성하는 메서드

```tsx
// 리액트의 createElement 사용
const divElement = React.createElement('div', { className: 'my-class' }, 'Hello, world!')

// DOM API의 createElement 사용
const divElement = document.createElement('div')
divElement.className = 'my-class'
divElement.textContent = 'Hello, world! '
```

#### 리액트의 재조정 프로세스

- 리액트 컴포넌트 렌더링
- 새 가상 DOM 트리 생성
- 이전 가상 DOM 트리와 비교
- 이전 트리를 새 트리와 일치하도록 업데이트하는 데 필요한 최소 변경 횟수 계산

```tsx
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>카운트 {count}</h1>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  )
}
```

- 리액트는 h1 엘리먼트의 텍스트 내용만 업데이트하면 된다고 계산하고 실제 DOM의 해당 부분만 업데이트

```
div
 ├── h1
 │   └── "카운트: 0"
 └── button
	   └── "증가"
```

```
div
 ├── h1
 │   └── "카운트: 1"
 └── button
	   └── "증가"
```

> ✨ 리액트에서 가상 DOM을 이용하면 실제 DOM을 효율적으로 업데이트할 뿐만 아니라, DOM을 직접 조작하는 다른 라이브러리도 원활하게 동작할 수 있다.

### 효율적인 업데이트

- 디핑 알고리즘(Diffing Algorithm): 새 트리와 이전 트리를 노드 별로 비교해 트리의 어느 부분이 변경되었는지 알아내는 알고리즘
- 변경을 최소화해 실제 DOM을 빠르게 업데이트

#### 리액트의 디핑 알고리즘 작동 방식

- 두 트리의 루트에 있는 노드가 다른 경우, 리액트는 기존 트리 전체를 새 트리로 대체
- 루트 노드가 동일하다면 리액트는 노드의 속성이 변경된 경우에만 업데이트
- 자식 노드가 다른 경우 리액트는 변경된 자식 노드만 업데이트. 리액트는 하위 트리 전체를 다시 생성하지 않고 변경된 노드만 업데이트
- 노드의 자식들이 동일하지만 순서가 변경된 경우, 리액트는 노드를 다시 생성하지 않고 실제 DOM에서 노드의 순서를 다시 설정
- 트리에서 노드가 제거되면 리액트는 실제 DOM에서 노드를 제거
- 트리에 새 노드가 추가되면 리액트는 해당 노드를 실제 DOM에 추가
- 노드의 종류가 변경된 경우(`div` → `span`), 리액트는 이전 노드를 제거하고 변경된 종류의 새로운 노드를 생성
- 노드에 `key` props이 있다면 리액트는 이를 사용해 노드의 교체가 필요한지 파악 → 컴포넌트 상태를 재설정할 때 유용
  - [`key`를 이용해 `state`를 초기화하기](https://ko.react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key)

### 불필요한 리렌더링

- 리렌더링 → 리액트가 각 함수 컴포넌트를 재귀적으로 호출하면서 props를 각 함수 컴포넌트에 전달한다는 의미
- 왜? 리액트는 컴포넌트가 어느 상태에 종속되어 있는지 알지 못하기 때문에 UI 일관성을 유지하기 위해 모든 컴포넌트를 리렌더링
  - 크고 복잡한 UI를 처리할 때 성능에 상당한 부담

```tsx
import { useState } from 'react'

const ChildComponent = ({ message }) => {
  return <div>{message}</div>
}

const ParentComponent = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <ChildComponent message="정적 메시지입니다." />
    </div>
  )
}

export default ParentComponent
```

- 불필요한 리렌더링 해결하려면?
  - 컴포넌트를 주의깊게 구조화
  - `memo` 혹은 `useMemo` 같은 리액트 최적화 기능 사용하여 리렌더링 관리

## Reference

- https://d2.naver.com/helloworld/2690975
- https://github.com/acdlite/react-fiber-architecture
- https://web.dev/performance?hl=ko
- https://web.dev/learn/performance
- https://web.dev/case-studies/milliseconds-make-millions?hl=ko
- https://overreacted.io/why-do-react-elements-have-typeof-property/
- https://ko.react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key
