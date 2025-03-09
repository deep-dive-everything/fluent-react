# 5장 자주 묻는 질문과 유용한 패턴
## 5.1 React.memo를 사용한 메모화
**메모화**
- 메모화는 함수의 출력을 저장해두었다가 같은 입력을 사용해 함수를 다시 호출하면 캐시된 결과를 반환 
- 메모화는 함수의 순수성을 필요로 하는데 다시 말해 함수가 주어진 입력에 대해 동일한 출력을 예측 가능하게 반환해야 함

```js
function add(a, b) {
    return a + b;
}
```
- add 함수는 인자로 1,2가 주어지면 항상 3을 반환하므로 안전하게 메모화할 수 있음

```js
async function addToNumberOfTheDay(num){
    const todaysNumber = await fetch("https://fake-api.com/random-number")
        .then((response) => response.json());
    .then((data) => data.number);
    return num + todaysNumber;
}
```
- 이 기능이 네트워크 통신 같은 부작용에 의존한다면 메모화할 수 없음

```js
let result = null;
const doHardThing = () => {
    if(result) return result;
    
    // ... 리소스가 많이 필요한 작업
    
    result = hardStuff; // 비용이 비싼 작업의 결과물
    return result;
}
```
- 비용이 많이 드는 계산을 처리하거나 항목이 많은 목록을 렌더링할 때 유용
- doHardThing 함수를 여러번 호출하면 캐싱된 결과를 반환하므로 성능이 향상됨

**React.memo**
- 리액트에서는 함수 컴포넌트에 React.memo를 사용해 메모화를 적용할 수 있음
- React.memo 함수에서 반환하는 새 컴포넌트는 프롭이 변경되었을 때만 다시 렌더링(함수를 다시 호출)
- 함수 컴포넌트를 메모화하면 불필요한 렌더링을 방지해서 리액트 애플리케이션 성능이 향상됨

**React.memo 예시**
```jsx
function TodoList({ todos }) {
    return (
        <ul>
            {todos.map((todo) => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
}
```
- 사용자 입력이 있을 떄마다 다시 렌더링 하는 컴포넌트가 있다고 가정
```jsx
function App() {
    // 책의 예시는 useMemo를 사용하지 않아 렌더링이 여전히 발생하므로 useMemo를 사용해 수정
    const todos = useMemo(()=> Array.from({length: 100000}), []);
    const [name, setName] = useState("");

    return (
        <div>
            <input value={name} onChange={(e) => setName(e.target.value)}/>
            <TodoList todos={todos}/>
        </div>
    );
}
```
- App 컴포넌트가 렌더링될 때마다 TodoList 컴포넌트도 렌더링되므로 성능이 저하됨
- React.memo를 사용해 TodoList 컴포넌트를 메모화하면 불필요한 렌더링을 방지할 수 있음
```jsx
const MemoizedTodoList = React.memo(function TodoList({ todos }) {
    return (
        <ul>
            {todos.map((todo) => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
});
```

### 5.1.1 React.memo에 능숙해지기
**React.memo의 작동 방식**
- 업데이트가 발생하면 리액트는 컴포넌트를 이전 렌더링에서 반환된 가상 DOM의 결과와 비교
    - 프롭이 변경되어 결과가 다르다면, 재조정자는 엘리먼트가 호스트 환경에 이미 존재하는 경우에는 업데이트 효과를 실행하고 그렇지 않은 경우에는 배치 효과를 실행
      - 업데이트 효과: 기존 DOM 요소의 속성을 업데이트
      - 배치 효과: 새로운 DOM 요소를 생성하고 이전 요소를 대체
    - 프롭이 동일하더라도 컴포넌트는 다시 렌더링되고 이에 따라 DOM도 업데이트될 수 있음
- 이때 React.memo를 사용하면 컴포넌트가 이전 렌더링 결과와 동일한 경우 렌더링을 건너뛰고 결과를 재사용할 수 있음

### 5.1.2 리렌더링되는 메모화된 컴포넌트
- React.memo는 프롭에 얕은 비교를 수행해 프롭의 변경 여부 확인
- 이때 스칼라 타입은 정확하게 비교할 수 있지만, 스칼라가 아닌 타입은 그렇지 않음

**스칼라(원시 타입)**
- 스칼라 타입은 기본 자료형으로 단일한 개별 값을 표현
- 배열이나 객체 같은 복합 자료형과 달리 속성이나 메서드가 없으며 본질적으로 불변
- 한번 설정된 값은 완전히 새로운 값을 만들지 않고는 변경하지 못함
- 스칼라 타입은 값이 동일한지 비교할 때 단순히 값만 비교하면 됨

**스칼라가 아닌 타입(참조 타입)**
- 데이터 자체가 아니라 데이터가 메모리에 저장된 위치에 대한 참조/포인터를 저장
- 객체, 배열, 함수 등이 있음
- 여러 참조가 동일한 메모리 위치를 가리키는 경우, 한 참조에서 값을 변경하면 다른 참조에서도 변경된 값을 볼 수 있음
- 스칼라가 아닌 타입은 값이 동일한지 비교할 때 참조가 같은지 확인해야 함
```text
// 스칼라 타입
"a" === "a", // true
1 === 1, // true

// 스칼라가 아닌 타입
[1,2] === [1,2], // false
{ foo: 'bar' } === { foo: 'bar' }, // false
```

**스칼라가 아닌 타입과 React.memo**
```jsx
const List = React.memo(function List({ items }) {
    return (
        <ul>
            {items.map((item) => (
                <li key={item.id}>{item.text}</li>
            ))}
        </ul>
    );
});

function ParentComponent({allFruits}){
    const [count, setCount] = React.useState(0);
    const favoriteFruits = allFruits.filter((fruit) => isFavorite(fruit));
    
    return (
        <div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <List items={favoriteFruits}/>
        </div>
    );
}
```
- favoriteFruits 배열이 새로운 배열 인스턴스를 생성하므로 React.memo는 이전 렌더링에서 사용한 배열과 다른 프롭으로 간주
- 이떄 useMemo 훅으로 배열을 메모화
```text
function ParentComponent({allFruits}){
    const [count, setCount] = React.useState(0);
    const favoriteFruits = useMemo(() => allFruits.filter((fruit) => isFavorite(fruit)), [allFruits]);
    
    return (
        <div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <List items={favoriteFruits}/>
        </div>
    );
}
```

- 함수도 마찬가지
```jsx
<MemoizedAvatar
    name={user.name}
    avatarUrl={user.avatarUrl}
    onClick={handleClick}
/>

const Parent = () => {
    const [count, setCount] = React.useState(0);
    // const handleClick = () => setCount(count + 1);
    const handleClick = React.useCallback(() => setCount(count + 1), [count]);
    
    return (
        <div>
            <button onClick={handleClick}>Increment</button>
            <MemoizedAvatar name="Tejas" avatarUrl="https://fake-api.com/tejas" onClick={handleClick}/>
        </div>
    );
};
```

### 5.1.3 강제가 아닌 권장 사항
- 컴포넌트 트리의 변경이나 애플리케이션의 전역 상태 변경이 발생하면, 리액트가 메모화된 컴포넌트를 다시 렌더링할 수 있으므로 React.memo가 항상 렌더링을 방지하지는 않음
```js
function memo(type, compare){
    return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: compare === undefined ? null : compare,
    };
}
```
- 메모화된 객체의 속성
  - $$typeof: 메모화된 컴포넌트를 식별하는 데 사용
  - type: 원본 컴포넌트를 참조
  - compare: 메모화에 사용할 비교 함수를 설정

```js
function updateMemoComponent(
    current: Fiber | null, 
    workInProgress: Fiber, 
    Component: any,
    nextProps: any,
    renderLanes: Lanes
): null | Fiber {
    if (current === null) {  // 첫렌더링 
        const type = Component.type;
        if ( // 단순한 컴포넌트인가?
            isSimpleFunctionComponent(type) &&
            Component.compare === null &&
            // SimpleMemoComponent codepath doesn't resolve outer props either.
            Component.defaultProps === undefined
        ) {
            let resolvedType = type;
            if (__DEV__) {
                resolvedType = resolveFunctionForHotReloading(type);
            }
            // 빠른 경로 업데이트가 가능하도록 합니다.
            workInProgress.tag = SimpleMemoComponent;
            workInProgress.type = resolvedType;
            if (__DEV__) {
                validateFunctionComponentInDev(workInProgress, type);
            }
            // 기본 프롭이 없고 비교 함수가 없는 경우 단순한 메모 컴포넌트로 업데이트
            // 얕은 비교만으로 업데이트 여부를 결정할 수 있게 되고 리액트는 업데이트에 빠른 경로를 사용할 수 있음
            return updateSimpleMemoComponent(
                current,
                workInProgress,
                resolvedType,
                nextProps,
                renderLanes,
            );
        }
        if (__DEV__) { 
            const innerPropTypes = type.propTypes;
            if (innerPropTypes) {
                // Inner memo component props aren't currently validated in createElement.
                // We could move it there, but we'd still need this for lazy code path.
                checkPropTypes(
                    innerPropTypes,
                    nextProps, // Resolved props
                    'prop',
                    getComponentNameFromType(type),
                );
            }
            if (Component.defaultProps !== undefined) {
                const componentName = getComponentNameFromType(type) || 'Unknown';
                // 개발 모드에서 defaultProps를 설정하면 경고 메시지를 출력합니다.
                if (!didWarnAboutDefaultPropsOnFunctionComponent[componentName]) {
                    console.error(
                        '%s: Support for defaultProps will be removed from memo components ' +
                        'in a future major release. Use JavaScript default parameters instead.',
                        componentName,
                    );
                    didWarnAboutDefaultPropsOnFunctionComponent[componentName] = true;
                }
            }
        }
      
        const child = createFiberFromTypeAndProps( // 새로운 파이버 생성
            Component.type,
            null,
            nextProps,
            null,
            workInProgress,
            workInProgress.mode,
            renderLanes,
        );
        child.ref = workInProgress.ref;
        child.return = workInProgress;
        workInProgress.child = child;
        return child;
    }// current === null

    if (__DEV__) { 
        const type = Component.type;
        const innerPropTypes = type.propTypes;
        if (innerPropTypes) {
            // Inner memo component props aren't currently validated in createElement.
            // We could move it there, but we'd still need this for lazy code path.
            checkPropTypes(
                innerPropTypes,
                nextProps, // Resolved props
                'prop',
                getComponentNameFromType(type),
            );
        }
    }
    // 초기 렌더링이 아닐 경우
    const currentChild = ((current.child: any): Fiber); // This is always exactly one child
    const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
        current,
        renderLanes,
    );// 예정된 업데이트 혹은 컨텍스트 변화가 있는 지 확인합니다.
    // 상태 변경, context 변경, 예정된 업데이트도 모두 렌더링을 일으킬 수 있음
    if (!hasScheduledUpdateOrContext) { // 업데이트가 없을 경우

        // This will be the props with resolved defaultProps,
        // unlike current.memoizedProps which will be the unresolved ones.
        const prevProps = currentChild.memoizedProps;
        // Default to shallow comparison
        let compare = Component.compare;
        compare = compare !== null ? compare : shallowEqual;
        if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
            // 프롭이 동일하고 참조가 변경되지 않은 경우 업데이트 작업에서 벗어납니다.
            return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
        }
    }
    // 예정된 업데이트가 있을 경우
    // 예정된 context 업데이트가 있는 경우에는 프롭이 변경되지 않았더라도 컴포넌트를 다시 렌더링 -> context 업데이트가 프롭의 범위 바깥에 있는 것으로 간주되기 때문
    
    // React DevTools reads this flag.
    // 업데이트가 필요할 경우의 플래그 설정
    workInProgress.flags |= PerformedWork;
    // 현재 자식을 기반으로 하되 새로운 프롭이 포함된 새로운 작업용 자식 파이버 생성
    const newChild = createWorkInProgress(currentChild, nextProps);
    newChild.ref = workInProgress.ref;
    newChild.return = workInProgress;
    workInProgress.child = newChild;
    return newChild;
}
```

## 5.2 useMemo를 사용한 메모화
- React.memo는 전체 컴포넌트를 메모화해 렌더링이 다시 발생하지 않게 함
- useMemo는 컴포넌트 내부의 특정 계산을 메모화해 비용이 많이 드는 재계산을 피하고 결과에 대한 일관된 참조를 유지

```js
const People = ({unsortedPeople}) => {
    const [name, setName] = useState("");
    const sortedPeople = unsortedPeople.sort((a, b) => a.name.localeCompare(b.name));
}
```

- 이 컴포넌트에 있는 정렬 작업의 시간 복잡도는 O(n log n)이므로 만약 unsortedPeople 배열이 크다면 정렬 작업은 렌더링 시간을 크게 늘릴 수 있음
- 이를 최적화하려면 useMemo 훅을 사용해 렌더링할때마다 매번 배열을 정렬하지 않도록 해야함
- 지금 코드를 유지한다면 입력 필드 내에서 이름을 입력할 때마다 정렬이 발생할 것
- useMemo를 사용해 정렬된 배열을 캐시하면 입력 필드를 수정할 때마다 정렬이 발생하지 않음

```js
const People = ({unsortedPeople}) => {
    const [name, setName] = useState("");
    const sortedPeople = useMemo(() => unsortedPeople.sort((a, b) => a.name.localeCompare(b.name)), [unsortedPeople]);
}
```

### 5.2.1 useMemo의 나쁜 사례
- useMemo는 렌더링 시간을 줄이기 위해 사용되어야 하지만, 잘못 사용하면 오히려 성능을 저하시킬 수 있음
- 특히 스칼라 값에는 사용할 필요가 없음
```jsx
const MyComponent = () => {
    const [count, setCount] = useState(0);
    const doubleCount = useMemo(() => count * 2, [count]);
    
    return (
        <div>
            <h1>Count: {count}</h1>
            <h2>Double Count: {doubleCount}</h2>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}
```

- 이럴 떄는 스칼라 값을 메모화하기보다 jsx에서 직접 두 배로 늘어난 카운트를 계산하면 됨
- 이제 동일한 계산을 더 적은 메모리 사용량과 부하로 수행하게 됨

```jsx
const MyComponent = () => {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <h1>Count: {count}</h1>
            <h2>Double Count: {count * 2}</h2>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}
```

**onClick 핸들러를 useCallback으로 메모화해야하는가?**
- button은 브라우저 네이티브 엘리먼트이고 호출할 수 있는 리액트 함수컴포넌트가 아니므로 useCallback을 사용할 필요가 없음
- 내장 컴포넌트에서 함수 프롭을 사용하면 발생하는 일
  - 직접 전달
    - 함수 프롭을 내장 컴포넌트에 전달하면 리액트는 이를 실제 DOM 엘리먼트에 직접 전달
    - 이벤트 핸들러를 DOM 엘리먼트에 직접 추가하지 않고 최상위 수준에 한개의 이벤트 리스너를 추가해 이곳에서 모든 이벤트 수신하여 효율적으로 관리
  - 렌더링 동작
    - 내장 컴포넌트는 리렌더링된 상위 컴포넌트의 일부가 아니라면 함수 프롭의 변경에 의해서는 리렌더링되지 않음
    - 부모 컴포넌트가 리렌더링해서 내장 컴포넌트에 새로운 함수를 프롭으로 전달하는 경우 내장 컴포넌트는 리렌더링되지만 빠르기 때문에 최적화 필요하지 않음
  - 함수에 대한 가상 DOM 비교하지 않음
    - 내장 컴포넌트에 대한 가상 DOM 비교는 함수 프롭의 동일성을 기반으로 함
    - 따라서 함수가 변경되면 깊은 비교를 수행하지 않고 단순 대체를 하여 성능 절약
  - 이벤트 풀링(React 17부터는 사용하지 않음)
    - 이벤트 핸들러에 전달되는 이벤트 객체는 풀링된 합성 이벤트인데 여러 이벤트 핸들러에 재사용됨으로써 가비지 컬렉션 부하를 줄임
- 내장 컴포넌트라면 대부분의 경우 메모화로 이득 없이 부하만 추가되기 때문에 리액트는 내장 메모화를 제공하지 않음
- useCallback을 사용하면 호출하고 의존성을 전달한 다음 의존성을 비교해 함수를 다시 계산해야 하는지 확인하는 작업이 동반됨 -> 불필요하게 사용하면 성능에 악영향을 줄 수 있음

**useCallback이 유용한 예시**
```jsx
const ExpensiveComponent = React.memo(({onButtonClick})=>{
    const now = performance.now();
    while(performance.now() - now < 1000){
        // 인위적인 지연 -- 1000 밀리초 멈춤 
    }
    
    return <button onClick={onButtonClick}>Click me</button>;
})

const ParentComponent = () => {
    const [count, setCount] = React.useState(0);
    const [otherState, setOtherState] = React.useState(0);
    
    // Parent 컴포넌트가 변경되어 리렌더링되어도 count가 변경되지 않으면 handleClick 함수가 변경되지 않음
    // count와 무관한 이유로 ExpensiveComponent가 불필요하게 리렌더링되지 않도록 함
    const handleClick = React.useCallback(() => setCount(count + 1), [count]);
    
    const doSomethingElse = () => {
        setOtherState(otherState + 1);
    }
    
    return (
        <div>
            <h1>Count: {count}</h1>
            <ExpensiveComponent onButtonClick={handleClick}/>
            <button onClick={doSomethingElse}>Do something else</button>
        </div>
    );
}
```

**useMemo가 유용한 다른 예시**
```jsx
const MyComponent = () => {
    const [birthYear, setBirthYear] = React.useState(1990);
    const isAdult = new Date().getFullYear() - birthYear >= 19;
    
    return (
    <div>
           <input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}/>
            <p>{isAdult ? "You are an adult" : "You are not an adult"}</p>
        </div>
    );
}
```

- 이 코드는 입력이 될때마다 new Date()를 다시 계산

```jsx
const MyComponent = () => {
    const [birthYear, setBirthYear] = React.useState(1990);
    // 날짜 객체는 참조형이므로 useMemo를 사용해 메모화
    const today = React.useMemo(() => new Date(), []);
    // isAdult 값은 스칼라 값이므로 메모화하지 않아도 됨
    const isAdult = today.getFullYear() - birthYear >= 19;
    
    return (
    <div>
           <input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}/>
            <p>{isAdult ? "You are an adult" : "You are not an adult"}</p>
        </div>
    );
}
```

### 5.2.2 모두 잊고 포겟하세요
- 리액트 컴파일러는 리액트 리렌더링 동작의 객체 동일성 비교를 깊은 비교 없는 시맨틱 값 비교로 변환해 성능을 향상 시킴
- React conf 2021에서 리액트 포겟이라는 리액트 컴파일러가 등장했고 useMemo와 useCallback을 사용하지 않아도 성능이 향상됨

## 5.3 지연 로딩
```html
<!DOCTYPE html>
<html>
    <head>
        <title>Lazy Loading</title>
        <script src="https://example.com/large.js"></script>
    </head>
    <body></body>
</html>
```

- 페이지의 head에서 large.js 파일을 읽고 있으므로 페이지가 렌더링되기 전에 large.js 파일을 다운로드하고 실행
- 만약 인터넷 연결 속도가 느리거나 디바이스가 구형인 경우에는 페이지 로딩 시간이 느려질 수 있음
- 이런 경우 async 속성을 사용해 자바스크립트 파일을 비동기적으로 읽어들이면 됨 

```html
<!DOCTYPE html>
<html>
<head>
    <title>Lazy Loading</title>
    <script async src="https://example.com/large.js"></script>
</head>
<body></body>
</html>
```

- 또 코드 분할을 통해 인터넷 연결 속도가 느리거나 제한적인 데이터 요금제를 사용하는 사용자에게 더 나은 사용자 경험을 제공할 수 있음
- 코드분할: 특정 페이지나 기능에 필요한 자바스크립트만 읽어 들이는 방법
```js
import("./large.js").then((module) => {
    // 여기서 module을 사용합니다
});
```

- 또다른 방법은 지연로딩을 사용해 페이지가 완전히 읽어 들여질 때까지 초기 실행에 필수적이지 않은 자바스크립트의 로딩을 미뤄두는 것
```html
<!DOCTYPE html>
<html>
<head>
    <title>Lazy Loading</title>
</head>
<body>
    <button id="load">콘텐츠 추가 로드</button>
    <script>
        document.getElementById('load').addEventListener('click', () => {
           import("./non-critical.js").then((module) => {
               // 여기서 module을 사용합니다
           }); 
        });
    </script>
</body>
```

- 리액트에는 React.lazy와 Suspense를 사용한 지연로딩이라는 훨씬 더 직관적인 해결책이 있음
```jsx
import Sidebar from "./Sidebar"; //불러올 용량 22MB

const MyComponent = ({initialSidebarState})=>{
    const [showSidebar, setShowSidebar] = React.useState(initialSidebarState);
    
    return (
        <div>
            <button onClick={() => setShowSidebar(!showSidebar)}>Toggle Sidebar</button>
            {showSidebar && <Sidebar/>}
        </div>
    );
}
```

- <Sidebar/>는 용량이 큰데다가 초기 렌더링 시점에 필요하지 않을 수 있음
- 이럴 떄 React.lazy와 Suspense를 사용해 지연로딩을 할 수 있음

```jsx
const Sidebar = React.lazy(() => import("./Sidebar"));

const MyComponent = ({initialSidebarState})=>{
    const [showSidebar, setShowSidebar] = React.useState(initialSidebarState);
    
    return (
        <div>
            <button onClick={() => setShowSidebar(!showSidebar)}>Toggle Sidebar</button>
            {showSidebar && (
                <React.Suspense fallback={<FakeSidebarShell />}>
                    <Sidebar/>
                </React.Suspense>
            )}
        </div>
    );
}
```

- ./Sidebar를 정적으로 가져오지 않고 동적으로 가져옴. 읽어들인 모듈의 promise를 반환하는 함수를 lazy 함수에 전달
- Suspense는 promise가 resolve 되기 전까지 fallback 컴포넌트를 표시할 수 있는 컴포넌트

### 5.3.1 Suspense를 통한 더 나은 UI 제어
- Suspense는 try/catch 블록처럼 동작
- 컴포넌트 트리 어디든 지연 로드되고 비동기로 읽어 들이는 요소를 두면, 해당 트리의 상위 계층 어디서든 Suspsense 컴포넌트를 사용해 로딩 상태를 처리할 수 있음
- 아래 예시에서도 MyComponent 최상위 계층에 Suspense를 감쌀수도 있지만 Sidebar 컴포넌트를 감싸는 것이 사용자 경험에 더 나은 영향을 미침

```jsx
const Sidebar = React.lazy(() => import("./Sidebar"));

const MyComponent = ({initialSidebarState})=>{
    const [showSidebar, setShowSidebar] = React.useState(initialSidebarState);
    
    return (
        <div>
            <button onClick={() => setShowSidebar(!showSidebar)}>Toggle Sidebar</button>
            {showSidebar && (
                <React.Suspense fallback={<FakeSidebarShell />}>
                    <Sidebar/>
                </React.Suspense>
            )}
        </div>
    );
}
```


## 참고자료
- [이벤트 풀링이 사라진 이유](https://blog.mathpresso.com/react-deep-dive-react-event-system-2-1d0ad028308b)


