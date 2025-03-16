# 5장 자주 묻는 질문과 유용한 패턴

2025.03.16 dasom

## 5.1 React.memo를 사용한 메모화

React.memo를 통해 컴포넌트의 불필요한 렌더링을 방지할 수 있다.
```js
const myComponente = () => {
const [count, setCount] = useState(0)
const myList = ["1", "2", "3"]

return (
  <div>
    <button onClick={() => setCount(count++}>plus!</button>
    <ul> {/* 버튼이 클릭될 때 마다 리스트도 렌더링 됨! */}
      {myList.map((content, idx) =>
        <li key={idx}>{content}</li>
      )
    </ul>
  </div>
)
}
```

React.memo는 얕은 비교를 수행하기 때문에 문자열, 숫자 등과 같은 원시타입은 정확히 비교할 수 있지만, 스칼라가 아닌 타입(객체, 배열, 함수)은 기대와 다르게 동작할 수 있다.
따라서 배열은 useMemo로, 함수는 useCallback을 통해 문제를 해결할 수 있다.

하지만, React.memo는 재조정자에 대한 힌트로 존재하기 때문에 반드시 리렌더링을 방지하는 것은 아니다.


## 5.2 useMemo를 사용한 메모화
React.memo가 전체 컴포넌트를 메모화해 렌더링이 발생하지 않게 하는 도구라면, useMemo는 컴포넌트 내부의 특정 계산을 메모화하고 재계산을 피하고 일관된 참조를 유지하는 도구이다.
5.1장에서 나와있듯, 스칼라 값은 참조가 아닌 실젯값으로 비교되기 때문에 useMemo를 이용하면 불필요한 연산만 늘리는 셈이 된다.
또한 내장 컴포넌트(button 등)의 경우 리액트가 자체적으로 최적화를 하고 있기 때문에 대부분의 경우 메모화로 이득 없이 부하만 추가된다.


## 5.3 지연 로딩
리액트에서는 React.lazy와 Suspense를 사용한 지연 로딩이 가능하다.
무거운 컴포넌트는 React.lazy를 통해 동적으로 불러올 수 있고, Suspense를 통해 (lazy로 전달한) 프로미스가 해결되기 전가지 폴백 컴포넌트를 표시할 수 있다.
