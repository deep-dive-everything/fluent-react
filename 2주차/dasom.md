# 3장 가상 DOM

2025.03.01 dasom

## 3.1 가상 DOM 소개

### DOM이란?

- HTML 문서를 자바스크립트 객체로 모델링한 것
- 브라우저에서 실행되는 문서 객체 모델
- 엘리먼트 간의 계층 구조를 갖춘 트리 형태로 구성됨

### 가상 DOM이란?

- 실제 DOM의 가벼운 복사본
- 실제 DOM은 노드 객체로 구성되지만, 가상 DOM은 설명 역할을 하는 평범한 JS 객체로 구성됨
- 리액트는 개발자가 `setState` 또는 다른 메커니즘을 통해 UI 변경을 요청할 때마다 가상 DOM을 먼저 업데이트한 후, 변경사항을 반영하여 실제 DOM을 업데이트(재조정)
  - 실제 DOM의 업데이트는 느리고 비용이 많이 들기 때문
- 가상 DOM 업데이트는 실제 페이지의 레이아웃을 변경하지 않기 때문에 훨씬 빠르게 동작
- 가상 DOM은 브라우저나 특정 환경에 의존하지 않으므로, 다양한 호스트 환경에서 사용 가능
- 리액트는 가상 DOM이 업데이트될 때 비교 알고리즘을 사용해 이전 버전과 새로운 버전의 차이를 식별하고, 최소한의 변경 사항만 실제 DOM에 반영함

## 3.2 실제 DOM

### 실제 DOM의 특징

- 웹 브라우저는 HTML 문서를 읽어 들인 후 구문을 분석하여 DOM 트리로 변환
- DOM은 노드 객체들로 구성된 자바스크립트 객체이며, 자바스크립트를 사용하여 조작할 수 있음

```
// 실제 DOM 노드 구조 예시
const dom = {
    type: 'document',
    doctype: 'html',
    children: [
        { type: 'html', children: [
            { type: 'head', children: [
                { type: 'title', children: [{ type: 'text', content: 'Hello, World!' }] }
            ]},
            { type: 'body', children: [
                { type: 'h1', children: [{ type: 'text', content: 'Hello, World!' }] }
            ]}
        ]}
    ]
};
```

### 3.2.1 실제 DOM의 문제점

#### 성능 문제

- DOM을 변경할 때마다 브라우저는 레이아웃을 다시 계산하고 페이지의 영향을 받는 부분을 다시 그림 (Reflow, Repaint 발생)
- `offsetWidth` 같은 속성에 접근할 때 레이아웃을 다시 계산해야 하는 경우가 있음
  - 해결 방법: `getBoundingClientRect()` 사용하여 레이아웃을 다시 계산하지 않고 엘리먼트 크기와 위치를 얻음
  - 단, 대기 중인 레이아웃 변경 사항이 있을 경우 `getBoundingClientRect()` 도 Reflow를 발생시킬 수 있음

#### 브라우저 간 호환성 문제

- 브라우저마다 DOM 모델링 방식이 달라, 웹 애플리케이션의 일관성을 유지하기 어려움
- 리액트는 **합성 이벤트 시스템(Synthetic Event System)**을 통해 이러한 문제를 해결
  - 여러 브라우저에서 일관성을 유지하도록 설계된 이벤트 래퍼
  - 이벤트 위임을 활용하여 이벤트 리스너를 최적화

### 3.2.2 문서 조각(Document Fragment)

- 문서 조각은 기본 DOM에 영향을 주지 않고 여러 업데이트를 수행할 수 있는 가벼운 컨테이너 역할
- 문서 조각을 사용하면 Reflow와 Repaint가 한 번만 발생하여 성능 향상 가능

```
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const li = document.createElement('li');
    li.textContent = `List item ${i}`;
    fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);
```

- 리액트의 가상 DOM도 문서 조각처럼 업데이트를 일괄적으로 처리함
- 차이점은 리액트는 **비교 알고리즘을 적용**하여 최소한의 변경 사항만 적용한다는 점

## 3.3 가상 DOM 작동 방식

### 3.3.1 리액트 엘리먼트

- 리액트에서 UI는 **리액트 엘리먼트 트리**로 표현됨
- `React.createElement` 함수를 사용하여 생성

```
const element = React.createElement('h1', { className: 'greeting' }, 'Hello, World!');
```

- 리액트 엘리먼트는 변경할 수 없는 **불변 객체**
- console.log로 출력하면 다음과 같은 결과 확인 가능

```
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

### 3.3.2 가상 DOM과 실제 DOM 비교

- `React.createElement`는 **가상 DOM 엘리먼트**를 생성하고, `document.createElement`는 **실제 DOM 노드**를 생성
- 리액트는 상태가 변경될 때마다 새로운 가상 DOM을 생성하고, 이전 가상 DOM과 비교 후 필요한 변경 사항만 실제 DOM에 적용 (재조정)

### 3.3.3 효율적인 업데이트

#### 디핑(diffing) 알고리즘

- 리액트는 이전 가상 DOM과 새로운 가상 DOM을 비교하여 변경 사항이 있는 부분만 업데이트
- **디핑 알고리즘**
  - 두 트리의 루트 노드가 다르면 전체 트리를 다시 렌더링
  - 루트 노드가 같다면 속성이 변경된 경우에만 업데이트
  - 자식 노드가 다른 경우 변경된 부분만 업데이트
  - 노드가 추가되거나 삭제된 경우 최소한의 변경만 적용
  - key 속성을 사용하면 노드의 위치 변경을 최적화 가능

#### 불필요한 리렌더링 방지

- 리액트는 상태가 변경되면 해당 컴포넌트와 모든 하위 컴포넌트를 리렌더링
- `React.memo`를 사용하여 불필요한 리렌더링 방지 가능

```
const ChildComponent = React.memo(() => {
    console.log('ChildComponent rendered');
    return <h2>Child Component</h2>;
});
```

