# 5장 - 자주 묻는 질문과 유용한 패턴

## 5.1 React.memo를 사용한 메모화

- 메모화(memoization)
    - 이전에 계산된 결과를 캐싱하여 함수의 성능을 최적화하는 기법
        
        → 입력을 기준으로 함수의 출력을 저장해 두고 이후 같은 입력을 사용하여 함수를 호출하면 캐시된 결과를 반환
        
    - 계산 비용이 많이 들거나 자주 호출되는 함수를 실행하는 데 필요한 시간, 리소스를 줄일 수 있음
    - 필요 조건
        - 함수의 순수성
        → 함수가 주어진 입력에 대해 동일한 출력을 예측 가능하게 반환해야함
- 예시
    
    ```jsx
    // TodoList.jsx 
    const TodoList = ({todos}) => {
      return (
        <ul>
          {todos.map((todo)=> (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      );
    }
    // App.jsx
    const App = () => {
    	const todos = [{key:'1', title:'공부'}, {{key:'2', title:'식사'}]
      const [name, setName] = useState('');
     
      return (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <TodoList todos={todos} />
        </div>
      );
    };
    ```
    
    - App 컴포넌트에서는 input 필드에 입력이 있을 때마다 TodoList가 리렌더링됨
    → TodoList 함수 컴포넌트는 Props 데이터의 변화가 없음에도 불구하고, input 필드에 입력이 있을 때마다 App 컴포넌트가 리렌더링되므로 TodoList도 재호출됨. 이는 **성능 문제**를 일으킬 수 있음
    추가 - todos는 배열인데 이 배열이 상태로 관리되지 않는 한 사용자가 입력할 때 todos의 참조가 변하지 않으므로 TodoList 로 넘기는 Props 또한 변하지 않음
    - 사실…컴포넌트에서 상태 변경이 발생하면 재조정 과정에서 하위트리에 있는 모든 함수 컴포넌트가 다시 호출되는 것은 정상적인 동작이지만 **이로 인해 애플리케이션 성능에 병목 현상이 발생할 수 있음**
        
        **→ 컴포넌트 최적화가 필요한 상황**
        
- **컴포넌트 최적화 예시 - React.memo로 메모화하기**
    
    ```jsx
    // TodoList.jsx
    const TodoList = ({ todos }) => {
      return (
        <ul>
          {todos.map((todo)=> (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      );
    }
    
    export const MemoizedTodoList = React.memo(TodoList);
    ```
    
    - TodoList 컴포넌트를 React.memo로 감싸면, 리액트는 Props가 변경된 경우에만 해당 컴포넌트를 리렌더링함
    - TodoList의 Props인 todos의 데이터가 변경되지 않는 한 캐시된 출력이 대신 사용됨

### 5.1.1 React.memo에 능숙해지기

- React.memo의 작동 방식
    - 업데이트가 발생하면 리액트는 컴포넌트를 이전 렌더링에서 반환된 가상 DOM의 결과와 비교하여 업데이트 효과 혹은 배치 효과를 실행함
    - React.memo를 통해 각 렌더링 사이에 컴포넌트의 Props가 동일한 경우 불필요한 렌더링을 피할 수 잇음

### 5.1.2 리렌더링되는 메모화된 컴포너트

- React.memo는 Props에 `얕은 비교`를 수행하여 변경 여부를 확인
- **얕은 비교(Shallow Comparison)의 경우 참조 타입은 정확한 비교를 수행하기 어려움**

### 스칼라(원시 타입)

- 원시 타입은 불변의 값
- 한 번 설정된 원시 값은 완전히 새로운 값을 만들지 않는 이상 변경될 수 없음
- 자바스크립트의 원시 타입
    - Number, String, Boolean, Symbol, BigInt, undefiend, null
- 원시 타입의 비교는 해당 값의 실제 내용이나 값을 기준으로 이루어짐

### 스칼라가 아닌 타입(참조 타입)

- 데이터가 메모리에 저장된 위치에 대한 참조 or 포인터를 저장함
    
    → 여러 참조가 동일한 메모리의 위치를 가리킬 수 있음
    
- 자바스크립트의 참조 타입
    - Object, Array, Function
- 하나의 참조를 통해 데이터를 수정하면 동일한 데이터를 가리키는 다른 참조에도 영향을 미침
- **참조 타입의 비교는 동일한 메모리 주소를 참조하는 지를 기준으로 이루어짐(값이 아님)**
- 비교 예시
    
    ```jsx
    // 원시 타입
    "a" === "a"; // String; true
    3 === 3; // Number; true
    // 참조 타입
    [1, 2, 3] === [1, 2, 3]; // Array; false
    { foo: "bar" } === { foo: "bar" } // Object; false
    ```
    
- 이러한 특성 때문에 React.memo 사용 시 주의가 필요
- 예시
    
    ```jsx
    // TodoList.jsx
    const TodoList = ({ todos }) => {
      return (
        <ul>
          {todos.map((todo)=> (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      );
    }
    export const MemoizedTodoList = React.memo(TodoList);
    
    // App.jsx
    const App = () => {
    	const todos = allTodos.filter((todo)=> isTodayTodo(todo));
      const [name, setName] = useState('');
     
      return (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <MemoizedTodoList todos={todos} />
        </div>
      );
    };
    ```
    
    - todos 배열이 allTodos 로부터 필터링 되는 경우 todos의 참조가 매번 변경됨
        
        → App 컴포넌트가 리렌더링될 때마다 todos 배열이 새로 생성되므로 MemoizedTodoList로 전달되는 Props인 todos의 참조도 매번 변경되어 MemoizedTodoList도 리렌더링됨 
        
- useMemo 훅으로 배열을 메모이제이션하기
    
    ```jsx
    // App.jsx
    const App = () => {
    	const todos = React.useMemo(() => {
        return allTodos.filter((todo) => isTodayTodo(todo));
      }, [allTodos]); // allTodos가 변경될 때만 재계산
    
      const [name, setName] = useState('');
     
      return (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <MemoizedTodoList todos={todos} />
        </div>
      );
    };
    ```
    
- **함수도 참조 타입**이므로 위와 같은 문제가 발생할 수 있음
    
    ```jsx
    <MemoizedAvatar
    	name="gyeol"
    	url="https://github.com"
    	onChange={() => save()}
    />
    ```
    
    - 코드를 보면 전부 상숫값이므로 외부의 상태가 변경되어도 Props는 변경되지 않을 것 같지만, 함수는 다름
- 부모 컴포넌트에서 useCallback 훅 사용하기
    
    ```jsx
    // 부모 컴포넌트
    const Parent = ({ currentUser }) => {
    	const onAvatarChange = useCallback(
    		(newAvatarUrl) => {
    			updateUserModel({ avatarUrl: newAvatarUrl, id: currentUser .id });
    		},
    		[currentUser]
    	);
    	
    	return (
    		<MemoizedAvatar
    			name="gyeol"
    			url="https://github.com"
    			onChange={onAvatarChange}
    		/>
    	)
    }
    ```
    
    - 현재 사용자 정보 같은 의존성 배열(useCallback의 두 번째 인수)가 변하지 않는 한 onAvatarChange 함수를 절대 변하지 않으므로 의도한대로 메모화가 이루어짐

### 5.1.3 강제가 아닌 권장 사항

- React.memo 사용이 컴포넌트의 리렌더링을 무조건 방지하는 것은 아님!
- 컴포넌트 트리의 변경이나 애플리케이션의 전역 상태 변경이 발생하면 리액트가 메모화된 컴포너트를 리렌더링 할 수 있음
    
    > *리액트는 우리가 원하는 것을 설명하는 사용자 인터페이스의 선언적 추상화로 의도되었으며, 이를 수행하는 최선의 방법을 찾아내는 것은 리액트의 몫입니다. React.memo도 이러한 과정의 일부입니다.
    — p.148*
    > 
- React.memo 코드
    
    ```jsx
    // react/packages/react/src/ReactMemo.js
    export function memo<Props>(
      type: React$ElementType,
      compare?: (oldProps: Props, newProps: Props) => boolean,
    ){
    	// DEV 관련 코드는 생략하였음
    	const elementType = {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: compare === undefined ? null : compare,
      };
    	return elementType;
    }
    ```
    
    - React.memo는 메모화된 컴포넌트를 나타내는 새 객체를 반환함
    - 객체에는 메모화된 컴포넌트를 식별하는 `$$type` 속성, 원본 컴포넌트를 참조하는 `type` 속성, 메모화에 사용할 비교 함수를 설정하는 `compare` 속성이 존재
- 재조정자에서 React.memo가 어떻게 사용되는지 살펴보기
    - createFiberFromTypeAndProps 함수에서 MemoComponent 태그로 fiber 객체가 생성됨
        
      ```jsx
      // react/packages/react-reconciler/src/ReactFiber.js
      ...
      export function createFiberFromTypeAndProps( ... ): Fiber {
         ...
         case REACT_MEMO_TYPE:
          fiberTag = MemoComponent;
          break getTag;
        ...
        const fiber = createFiber(fiberTag, pendingProps, key, mode);
        ...
        return fiber;
      }
      ...
      ```
        
      https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiber.js
        
    - beginWork 함수에서 MemoComponent 처리 과정
        
      ```jsx
      // react/packages/react-reconciler/src/ReactFiberBeginWork.js
      function beginWork(
        current: Fiber | null,
        workInProgress: Fiber,
        renderLanes: Lanes,
      ): Fiber | null {
        ...
        switch (workInProgress.tag) {
          case MemoComponent: {
            const type = workInProgress.type;
            const unresolvedProps = workInProgress.pendingProps;
            // Resolve outer props first, then resolve inner props.
            let resolvedProps = disableDefaultPropsExceptForClasses
              ? unresolvedProps
              : resolveDefaultPropsOnNonClassComponent(type, unresolvedProps);
            resolvedProps = disableDefaultPropsExceptForClasses
              ? resolvedProps
              : resolveDefaultPropsOnNonClassComponent(type.type, resolvedProps);
            return updateMemoComponent(
              current,
              workInProgress,
              type,
              resolvedProps,
              renderLanes,
            );
          }
          ...
        }
        ...
      }
      ```
        
    - beginWork 과정 중 MemoComponent인 경우 호출하는 updateMemoComponent 함수 코드
        
        (DEV 관련 코드는 생략하였음)
        
        ```jsx
        // react/packages/react-reconciler/src/ReactFiberBeginWork.js
        // updateMemoComponent 함수 코드
        function updateMemoComponent(
          current: Fiber | null, // 기존 fiber
          workInProgress: Fiber, // 작업 중인 fiber 
          Component: any,
          nextProps: any,
          renderLanes: Lanes,
        ): null | Fiber {
          if (current === null) { // 1. 초기 렌더링인 경우
            const type = Component.type;
            if ( // 1-1. 단순 메모 컴포넌트인 경우
              isSimpleFunctionComponent(type) &&
              Component.compare === null &&
              // 단순 메모 컴포넌트라면 외부 Props를 처리하지 않음
              (disableDefaultPropsExceptForClasses ||
                Component.defaultProps === undefined)
            ) {
              let resolvedType = type;
              
              // 기본 Props가 없는 평범한 함수 컴포넌트이고 
              // 기본 값인 얕은 비교를 사용한다면
              // 이 컴포넌트를 단순 메모 컴포넌트로 업그레이드해서(SimpleMemoComponent)
              // 더 빠른 경로로 업데이트가 가능하도록 처리
              workInProgress.tag = SimpleMemoComponent;
              workInProgress.type = resolvedType;
              
              return updateSimpleMemoComponent(
                current,
                workInProgress,
                resolvedType,
                nextProps,
                renderLanes,
              );
            }
            // 1-2. 새로운 파이버를 생성. 참조 설정 후 child를 반환
            const child = createFiberFromTypeAndProps(
              Component.type,
              null,
              nextProps,
              workInProgress,
              workInProgress.mode,
              renderLanes,
            );
            child.ref = workInProgress.ref;
            child.return = workInProgress;
            workInProgress.child = child;
            return child;
          }
          // 2. 초기 렌더링이 아닌 경우
          // 여기서는 자식 노드가 항상 하나만 존재함
          const currentChild = ((current.child: any): Fiber);
          // 업데이트 혹은 컨텍스트 변화가 있는지 확인하는 로직
          const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
            current,
            renderLanes,
          ); 
          if (!hasScheduledUpdateOrContext) { // 2-1. 업데이트가 없을 경우
            // current.memoizedProps와 달리 defaultProps 기본 Props가 Props로 저장됨
            const prevProps = currentChild.memoizedProps;
            // 얕은 비교를 기본값으로 설정함
            let compare = Component.compare;
            compare = compare !== null ? compare : shallowEqual;
            if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
        	    // Props가 동일하고 참조가 변경되지 않은 경우 
        	    // bailoutOnAlreadyFinishedWork를 사용해 업데이트 작업에서 벗어남
        	    // 업데이트 작업에서 벗어난 컴포넌트는 렌더링 작업을 더 진행하지 않음
              return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
            }
          }
          // 2-2. 업데이트가 있을 경우
          // React DevTools에서 이 플래그를 읽음
          workInProgress.flags |= PerformedWork;
          // 작업용 파이버(workInProgress)에 플래그를 설정함
          const newChild = createWorkInProgress(currentChild, nextProps);
          newChild.ref = workInProgress.ref;
          newChild.return = workInProgress;
          workInProgress.child = newChild;
          return newChild;
        }
        
        ```
        
        - SimpleMemoComponent는 좀 더 빠른 경로 업데이트가 가능하도록 updateSimpleMemoComponent 함수로 처리함
        - updateMemoComponent 함수는 컴포넌트가 초기 렌더링인지, 간단한 컴포넌트인지, 업데이트가 있는지에 대해 순서대로 확인 후 최대한 적은 비용으로 업데이트를 처리함
- React.memo 컴포넌트는 상태나 컨텍스트 변경에 의해 예정된 업데이트가 없고, 기존 Props와 새 Props를 비교한 결과 두 Props가 동일하다면 리렌더링되지 않음
- Props 비교 시 기본 값으로 제공되는 얕은 비교 함수 혹은 사용자가 제공하는 비교 함수를 사용
- 기존 Props와 새 Props가 다르거나 상태나 컨텐스트의 변경이 있다면 컴포넌트가 리렌더링됨

## 5.3 useMemo를 사용한 메모화

- React.memo와 useMemo 훅은 모두 메모화를 위한 도구이지만 다른 용도를 가짐
- React.memo
    - 전체 컴포넌트를 메모화해 렌더링이 다시 발생하지 않도록 함
- useMemo
    - 컴포넌트 내부의 특정 계산을 메모화해 비용이 많이 드는 재계산을 피하고 결과에 대한 일관된 참조를 유지함
- 예시 - useMemo가 필요한 상황
    
    ```jsx
    const People = ({ unsortedPeople }) => {
      const [name, setName] = useState('');
      const sortedPeople = unsortedPeople.sort((a, b) => b.age - a.age);
    
      return (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <h1>안녕하세요 {name}님, 아래의 목록을 확인하세요. </h1>
          <ul>
            {sortedPeople.map((p) => (
              <li key={p.id}>
                {p.name}m age {p.age}
              </li>
            ))}
          </ul>
        </div>
      );
    };
    ```
    
    - 만약 unsortedPeople에 백만명이 포함되었다면, 사용자가 입력할 때마다 렌더링이 발생하여 계산에 과부하가 발생할 수 있음
        - 참고 : 정렬 작업의 평균 및 최악의 시나리오에서 일반적으로 O(n log n)의 시간복잡도를 가짐
    - 이를 최적화하려면 useMemo 훅을 사용해 렌더링할 때마다 매번 배열을 정렬하지 않도록 처리해야함.
        - 예시의 경우 unsortedPeople 배열이 변경되지 않은 경우 정렬을 다시 하지 않도록 처리
- userMemo를 적용하여 해결
    
    ```jsx
    const People = ({ unsortedPeople }) => {
      const [name, setName] = useState('');
      const sortedPeople = useMemo(
        // 배열을 전개해 원래 배열을 변경하지 않도록 처리
        () => [...unsortedPeople].sort((a, b) => b.age - a.age),
        [unsortedPeople]  
      );
      // ...
    };
    ```
    
    - sortedPeople 값을 useMemo로 감싸고 기존 함수는 useMemo의 첫 번째 인수로 전달함
    - 여기서 useMemo에 전달하는 두 번째 인수는 변경되었을 때 재정렬 계산을 유발하는 값의 배열

### 5.2.1 useMemo의 나쁜 사례

- 컴포너트 내부의 모든 변수 선언을 useMemo로 감싸는 것이 늘 좋은 결과로 이루어지는 것은 아님
- useMemo는 계산 비용이 많이 드는 연산을 메모화하거나 객체와 배열에 대한 안정적인 참조를 유지하는 데 특히 유용
- **보통 원시 타입의 데이터는 useMemo를 사용할 필요가 없음**
    
    → 원시 타입의 값은 참조가 아닌 실제 값 그 자체이므로 u**seMemo 함수를 읽고 실행하는 작업이 최적화하려는 실제 작업보다 더 많은 비용이 들 수 있음**
    
- 예시
    
    ```jsx
    const MyComponent = () => {
      const [count, setCount] = useState(0);
      const doubleCount = useMemo(() => count * 2, [count]);
    
      return (
        <div>
          <p>카운트 : {count}</p>
          <p>2 * 카운트 : {doubleCount}</p>
          <button onClick={()=> setCount((oldCount) => oldCount + 1)}>
            증가
          </button>
        </div>
      );
    };
    ```
    
    - doubleCount 변수가 useMemo 훅을 사용해 메모화되고 있지만 **count는 원시 타입의 값이므로 메모화할 필요가 없음**
    - 대신 SJX에서 직접 두 배로 늘어난 카운트를 계산하면 됨
- JSX에서 처리
    
    ```jsx
    const MyComponent = () => {
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <p>카운트 : {count}</p>
          <p>2 * 카운트 : {count * 2}</p>
          <button onClick={()=> setCount((oldCount) => oldCount + 1)}>
            증가
          </button>
        </div>
      );
    };
    ```
    
    - doubleCount가 메모화되지 않지만 useMemo를 사용하지 않으므로 컴포넌트는 동일한 계산을 더 적은 메모리 사용량 부하로 수행하게됨
- 하지만 메모리 참조로 전달되는 onClick 핸들러를 렌더링할 때마다 다시 생성한다는 문제점이 존재함
- onClick 핸들러를 useCallback으로 메모화하면 성능 문제를 해결할 수 있을까?
    
    ```jsx
    // useCallback을 사용해서 onClick 이벤트 핸들러를 메모화하기
    const MyComponent = () => {
      const [count, setCount] = useState(0);
      const doubleCount = useMemo(() => count * 2, [count]);
      const increment = useCallback(
        () => setCount((oldCount) => oldCount + 1),
        [setCount]
      );
    
      return (
        <div>
          <p>카운트 : {count}</p>
          <p>2 * 카운트 : {count * 2}</p>
          <button onClick={increment}>증가</button>
        </div>
      );
    };
    ```
    
    - **예시 코드처럼 메모화하는 작업은 필요하지 않음.**
        - **<button>은 브라우저 네이티브 엘리먼트고 호출할 수 있는 리액트 컴포넌트가 아니므로 increment 함수를 메모화한다고 해서 얻는 이점이 없음!**
        - **버튼 엘리먼트는 리액트가 렌더링을 이어가야 할 자식 컴포넌트 또한 없음!**
- 리액트에서 내장 컴포넌트 또는 호스트 컴포넌트(div, button 등)는 함수 Props 등의 Props를 취급하는 방법에 있어 사용자 정의 컴포넌트와 차이점을 가짐
- 내장 컴포넌트에서 함수 Props를 사용하면 발생하는 일
    - **직접 전달**
        - 함수 Props(e.g. onClick 이벤트 핸들러)를 내장 컴포넌트에 전달하면 리액트는 이를 실제 DOM 엘리먼트에 직접 전달함(함수에 래퍼 생성 등 추가 작업은 수행하지 않음)
        - onClick 같은 이벤트 기반의 Props의 경우 리액트는 이벤트 핸들러를 DOM엘리먼트에 직접 추가하는 대신 이벤트 위임을 사용하여 이벤트를 처리
        **e.g. onClick 핸들러를 <button> 등의 내장 리액트 엘리먼트에 설정하면, onClick 핸들러가 버튼의 DOM 노드에 직접 추가되는 게 아님. 대신 최상위 수준인 한 개의 이벤트 리스너를 추가하고 여기서 모든 이벤트를 수신**
        - 최상위 이벤트 리스너는 문서의 루트에 첨부되며 이베트 버블링을 사용해 개별 엘리먼트에서 발생하는 이벤트를 포착함 → 이러한 접근방식은 메모리 사용량을 줄이고 이벤트 핸들러의 초기 설정 시간을 단축하기 때문에 효율적임
    - **렌더링 동작**
        - 내장 컴포넌트는 리렌더링된 상위 컴포넌트의 일부가 아닌 경우 함수 Props의 변경에 의해 리렌더링 되지 않음
        - e.g. 부모 컴포넌트가 리렌더링해서 내장 컴포넌트에 새로운 함수를 Props로 전달하는 경우 내장컴포넌트는 Props가 변경되었기 때문에 리렌더링됨. 하지만 이 때 리렌더링은 보통 빠르기 때문에 프로파일링 등을 통해 성능에 문제가 된다고 판명되지 않는 한 최적화할 필요가 없음
    - **함수에 대한 가상 DOM 비교하지 않음**
        - 내장 컴포넌트에 대한 가상 DOM 비교는 함수 Props의 동일성을 기반으로 함
        - 인라인 함수를 전달하면 컴포너트가 렌더링될 때마다 새로운 함수가 되지만, 리액트는 변경사항 감지를 위해 함수에 대해 깊은 비교를 수행하지 않음.
        - 새함수는 DOM 엘리먼트에 설정된 기존 함수를 대체하며, 이로 인해 내장 컴포넌트에서 성능을 절약하게 됨
    - **이벤트 풀링**
        - 리액트는 이벤트 핸들러에 이벤트 풀링을 사용하여 메모리 부하를 줄임
        - 이벤트 핸들러에 전달되는 이벤트 객체는 풀링된 **합성 이벤트**로 여러 이벤트 핸들러에 재사용되어 가비지 컬렉션의 부하를 줄여줌
- 내장 컴포넌트의 함수 Props의 성격은 사용자 정의 컴포너트와 매우 대조적
    - 사용자 정의 컴포넌트
        - 새 함수를 Props로 전달하면 자식 컴포넌트가 순수 컴포넌트이거나 메모화가 적용된 경우 Props의 변화를 감지해 리렌더링 할 수 있음
    - 내장 컴포넌트
        - **대부분의 경우 메모화로 이득 없이 부하만 추가되므로 리액트는 내장 메모화를 제공하지 않음**
