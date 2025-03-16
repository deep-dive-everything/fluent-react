### 5.4 useState와 useReducer
- useState는 **단일 상태**를 관리하는 데 적합, useReducer는 **복잡한 상태**를 관리하는 데 적합
- useState로 관리중일 때 만약 복잡한 객체를 다루게 된다면 버그가 발생할 가능성이 높음(업데이트시 원하지 않는 속성까지 실수로 변경할 수도 있음)
- 그럴 때 useReducer를 사용할 수 있음(몰랐던 사실: useState도 내부적으로 useReducer를 사용함)
```jsx
import { useReducer } from 'react';

const initialState = { count: 0,
                        name: 'Tejumma',
                        age: 30 };  
};

const reducer = (state, action) => {
    switch(action.type) {
        case 'increment':
            return { ...state, count: state.count + 1 };
        case 'decrement':
            return { ...state, count: state.count - 1 };
        default:
            return state;
    }
}

const MyComponent = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <div>
            <p>{state.name} is {state.age} years old</p>
            <p>Count: {state.count}</p>
            <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
            <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
        </div>
    );
}
```

**코드가 복잡해진다?**
- useReducer를 사용하면 코드가 복잡해질 수 있음
- 그럼에도 useReducer를 사용할 때 얻는 이점 세가지
- **1. 상태 업데이트 로직을 컴포넌트에서 분리해줌(reducer 단독 테스트도 가능해짐). 컴포넌트를 단순하게 유지하고 단일 책임 원칙을 따르기에 좋음**
- **2. 상태와 상태 변경 방식은 항상 명시적으로 useReducer와 함께 사용됨. useState가 JSX 트리 계층을 통한 컴포넌트 상태 업데이트의 전반적인 흐름을 파악하기 어렵게 만든다고 주장하는 사람들이 있음**
- **3. useReducer는 이벤트 소스 모델. 즉 애플리케이션에서 발생하는 이벤트를 모델링해서 일종의 진단 로그를 추적하는 데 사용할 수 있음. (시간 여행 디버깅 구현하는 데 사용됨)**
  - 또, 실행취소, 재실행, 낙관적 업데이트, 인터페이스 전반의 일반적인 사용자 행동에 대한 분석 추적 같은 강력한 패턴도 사용가능

### 5.4.1 Immer와 편의성
- 리액트 라이브러리 Immer(이머)는 애플리케이션에서 복잡한 상태 관리를 처리할 때 특히 유용
- Immer는 불변성을 유지하면서 상태를 업데이트하는 데 도움을 줌
- useReducer로 작업할 때 제공하는 리듀서 함수는 순수해야 하며 항상 새 상태 객체를 반환해야함. 그래서 장황한 코드가 생길 수 있음
  - use-immer 라이브러리의 useImmerReducer 훅을 사용하면 이 문제를 해결할 수 있음

```jsx
import { useImmerReducer } from 'use-immer';

const initialState = { user: {count: 0,
                        name: 'Tejumma',
                        address: { city: 'Seoul', country: 'Korea' }} };  
};

const reducer = (draft, action) => {
    switch(action.type){
        case 'updateName':
            draft.user.name = action.payload;
            break;
        case 'updateCity':
            draft.user.address.city = action.payload;
            break;
    }
}

const MyComponent = () => {
    const [state, dispatch] = useImmerReducer(reducer, initialState);

    return (
        <div>
            <p>{state.user.name} lives in {state.user.address.city}, {state.user.address.country}</p>
            <button onClick={() => dispatch({ type: 'updateName', payload: 'Tejas' })}>Update Name</button>
            <button onClick={() => dispatch({ type: 'updateCity', payload: 'Busan' })}>Update City</button>
        </div>
    );
}
```

- useImmerReducer 덕분에 spread 연산자나 Object.assign 동작 없이 상태를 업데이트할 수 있음
- Immer는 useState와 사용해도 됨

```jsx
import produce from 'immer';
import { useState } from 'react';

const MyComponent = () => {
    const [state, setState] = useState({ count: 0 });

    const increment = () => {
        setState(produce(draft => {
            draft.count += 1;
        }));
    }

    const decrement = () => {
        setState(produce(draft => {
            draft.count -= 1;
        }));
    }

    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
        </div>
    );
}
```

## 5.5 강력한 패턴
- 소프트웨어 디자인 패턴은 소프트웨어 개발에서 반복되는 문제에 주로 사용되는 해결책
- 소프트웨어 디자인 패턴이 중요한 이유
- **1. 재사용성: 흔히 겪는 문제에 대한 재사용 가능한 해결책을 제공해줌**
- **2. 표준화: 문제를 해결하는 표준 방법을 제공하여 개발자들끼리 서로 더 잘 이해하고 소통할 수 있음**
- **3. 유지보수성: 유지 보수 및 수정이 쉬운 코드로 구조화하는 방법을 지원해 소프트웨어 시스템의 수명을 향상시킬 수 있음**
- **4. 효율성: 일반적인 문제에 효율적인 해결책을 제공해 소프트웨어 시스템의 성능을 개선할 수 있음**

### 5.5.1 프레젠테이션/컨테이너 컴포넌트
- 프레젠테이션 컴포넌트는 UI를 렌더링하고 컨테이너 컴포넌트는 UI의 상태를 처리
```jsx
const PresentationComponent = ({ name, age }) => {
    return (
        <div>
            <p>Name: {name}</p>
            <p>Age: {age}</p>
        </div>
    );
}

const ContainerComponent = () => {
    const [name, setName] = useState('Tejas');
    const [age, setAge] = useState(30);

    return (
        <PresentationComponent name={name} age={age} />
    );
}
```

- 이 패턴은 단일 책임 원칙 때문에 유용하고 애플리케이션에서 관심사를 분리해 모듈화, 재사용, 테스트를 가능케 함으로써 더 나은 확장성을 제공
- 컴포넌트 외형과 작동방식에 대한 책임을 한 컴포넌트에 두지 않고 다른 컴포넌트로 분리
  - PressentationComponent는 다른 유상태 컨테이너에 전달되어도 의도된 모양을 유지
  - ContainerComponent는 다른 유상태 컨테이너로 대체해도 역시 의도한 기능을 유지할 수 있음
- 관심사가 분리되었기 때문에 목적에 맞는 테스트도 따로 할 수 있음
- 그러나 훅이 도입되고 더 편리하게 컴포넌트에 상태를 주입하게 되면서 컨테이너 컴포넌트가 상태를 공급하지 않게 되었음
- 소규모 애플리케이션에서는 과도한 설계로 간주되기 쉬움

### 5.5.2 고차 컴포넌트
- 다른 컴포넌트를 인수로 받아 두 컴포넌트의 합성 결과인 새로운 컴포넌트를 반환하는 컴포넌트
- 여러 컴포넌트에서 공유하는 동작을 반복 작성하고 싶지 않을 때 유용
- fetch를 사용할 때 로딩이나 에러처리를 깜박할때가 있는데 이럴 때 사용
```jsx
const TodoList = withASync(BasicTodoList);
```

```jsx
const withAsync = (Component) => (props) => {
    if(props.loading) {
        return <p>Loading...</p>;
    }
    
    if(props.error) {
        return <p>Error: {props.error.message}</p>;
    }
    
    return <Component {...props} />;
}
```

- 초기에 만든 컴포넌트는 async 로직을 제외한 더 유연하게 사용할 수 있는 컴포넌트가 됨

```jsx
const TodoList = withAsync(BasicTodoList);

const App = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch('https://jsonplaceholder.typicode.com/todos')
            .then(response => response.json())
            .then(data => setTodos(data))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }, []);

    return <TodoList todos={todos} loading={loading} error={error} />;
}
```

- 고차컴포넌트도 프레젠테이션 및 컨ㅌ테이너 컴포넌트와 마찬가지로 훅이 비슷한 이점을 제공하기에 훅을 사용할때가 더 많음

**고차 컴포넌트 합성**
- 여러 고차 컴포넌트를 합성하는 것도 자주 사용되는 리액트 디자인 패턴

```jsx
// withLoggin.js
const withLogging = (Component) => (props) => {
    console.log('Rendering', Component.name);
    return <Component {...props} />;
}

// withUser.js
const withUser = (Component) => (props) => {
    const user = { name: 'Tejas', age: 30 };
    return <Component {...props} user={user} />;
}

const EnhancedComponent = withLogging(withUser(MyComponent));
```

그러나 중첩이 많아질수록 가독성이 떨어지고 유지보수하기 어려워질 수 있기 때문에 아래와 같은 유틸리티 함수로 작성하는 것이 좋음

```jsx
// compose.js
const compose = (...hocs) => (WrappedComponent) => hocs.reduce((acc, hoc) => hoc(acc), WrappedComponent);

const EnhancedComponent = compose(withLogging, withUser)(MyComponent);
```
- 리덕스 같은 라이브러리에서는 자체적으로 compose 함수를 제공해줌

**고차 컴포넌트와 훅 비교**
- 훅이 도입된 후 고차 컴포넌트의 인기가 식었음
- 훅을 사용하면 컴포넌트에 더 편리하게 기능을 추가할 수 있으며, 참조 전달을 잘못하여 불필요한 리렌더링이 발생하는 문제도 해결할 수 있음
- 또 더 단순하고, 격리하여 테스트하기 쉽고 타입추론이 향상됨
- 우리가 자주 사용하는 리액트 고차 컴포넌트 -> React.forwardRef

### 5.5.3 렌더 프롭
- 컴포넌트의 상태를 전달받는 함수를 프롭으로 사용

```jsx
<WindowSize render={(width, height) => (
    <div>
        <p>Width: {width}</p>
        <p>Height: {height}</p>
    </div>
)} />
```

- 렌더링 작업에 대한 제어를 부모에게 넘겨 제어를 역전. 
- WindowSize 안에 있는 로직을 반복하여 작성할 필요가 없음
- 하지만 이 패턴 또한 훅으로 대체

**자식 함수**
- children 프롭을 사용해 render 프롭을 아예 삭제하고 자식 함수를 사용할 수 있음

```jsx
<WindowSize>
    {(width, height) => (
        <div>
            <p>Width: {width}</p>
            <p>Height: {height}</p>
        </div>
    )}
</WindowSize>
```

- 이 패턴은 렌더 프롭보다 더 간결하고 가독성이 좋음. 하지만 여전히 훅으로 대체 가능

### 5.5.4 제어 프롭
- 제어 컴포넌트: 내부에 자체 상태를 유지하지 않는 컴포넌트
- 이들의 현잿값은 부모 컴포넌트에서 전달한 프롭에 의해 결정되며 상태가 변경되어야 할 때 onChange 같은 콜백 함수를 통해 부모에게 알림
- 따라서 상태를 관리하고 제어 컴포넌트의 값을 업데이트하는 책임은 모두 부모 컴포넌트에 있게 됨

```jsx
function Form(){
    const [inputValue, setInputValue] = useState('');
  
      const handleChange = (e) => {
        setInputValue(e.target.value);
        }
  
        return (
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
            />
        );
}
```

- 제어 프롭 패턴은 제어 컴포넌트의 원리를 확장.
- 컴포넌트는 외부에서 프롭으로 제어될수도 있고 내부적으로 자체 상태를 관리하면서 선택적으로 외부 제어를 가능하게 함
- 이 패턴을 따르는 컴포넌트는 상탯값 그리고 상태를 업데이트하는 함수 두 가지를 프롭으로 받음
- 두가지 기능을 모두 지원함으로써 컴포넌트의 상태를 외부에서 제어할 수 있으면서도 자식 컴포넌트가 독립적으로 동작하기도 함

```jsx
function Toggle({ on, onToggle}){
    const [isOn, setIsOn] = useState(on);
  
    const handleToggle = () => {
        const nextState = on === undefined ? !isOn : on;
      
        if(on === undefined){
        }
      
        if(onToggle){
            onToggle(nextState);
        }   
    }
  
      return (
            <button onClick={handleToggle}>
                {isOn ? 'ON' : 'OFF'}
            </button>
        );
}
```

- 이 패턴은 제어 및 비제어 작동 모드를 모두 제공해 컴포넌트의 유연성을 향상시킴

### 5.5.5 프롭 컬렉션
- 여러 개의 프롭을 함께 묶어야 할 때 사용
- 드래그 앤 드롭 컴포넌트 만들때 유용

```jsx
export const droppableProps = {
    onDragOver: (event) => event.preventDefault(),
    onDrop: (event) =>{}
}

export const draggableProps = {
    onDragStart: (event) =>{},
    onDragEnd: (event) =>{}
}

<DropZone {...draggableProps} />
```
- 프롭 컬렉션 패턴으로 여러 프롭을 재사용할 수 있음
- 접근성을 위해 aria-* 프롭을 포함하기 위해 사용되기도 함
- 하지만 컴포넌트에 직접 onDragOver 프롭을 사용해 프롭 컬렉션을 덮어 씌우면 프롭 컬렉션의 함수에서 제공한 event.preventDefault()가 사라져버린다는 문제점 

- **프롭게터**
- 사용자 정의 프롭을 프롭 컬렉션에 조합하고 병합

- 먼저 프롭 게터로 프롭을 반환하는 함수를 만들어야 함
```jsx
export const getDroppableProps = () => {
    return {
        onDragOver: (event) => {
            event.preventDefault();
        },
        onDrop: (event) => {}
    }
}
```

- 사용자가 정의한 함수 OnDragOver 도 인수로 받을 수 있도록 아래와 같이 조합하는 로직 추가

```jsx
const compose = 
    (...funcs) => 
    (...args) =>
    funcs.forEach(func => func(...args));

export const getDroppableProps = ({onDragOver: replacementOnDragOver, ...replacementProps}) => {
    const defaultOnDragOver = (event) => {
        event.preventDefault();
    }

    return {
        onDragOver: compose(replacementOnDragOver, defaultOnDragOver),
      onDrop: (event) => {},
        ...replacementProps
    }
}

<DropZone {...getDroppableProps({ onDragOver: (event) => console.log('Dragged over') })} />
```

### 5.5.6 복합 컴포넌트
- 복합 컴포넌트는 서로 연결되고 상태를 공유하면서도 독립적으로 렌더링되는 컴포넌트를 한데 묶어 엘리먼트 트리를 더 세밀하게 제어하게 해줌

```jsx
<Accordion>
    <AccordionItem item={{ title: 'Item 1', content: 'Content 1' }} />
    <AccordionItem item={{ title: 'Item 2', content: 'Content 2' }} />
    <AccordionItem item={{ title: 'Item 3', content: 'Content 3' }} />
</Accordion>
```

- 구현 방법
  - 자식에게 React.cloneElement 사용 (레거시)
  - 리액트 컨텍스트 사용

```jsx
const AccordionContext = React.createContext({
    activeIndex: 0,
      setActiveIndex: () => {}
});
```

Accordion 컴포넌트는 단순히 자식에게 컨텍스트를 제공합니다.

```jsx
export const Accordion = ({children}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <AccordionContext.Provider value={{ activeIndex, setActiveIndex }}>
            {children}
        </AccordionContext.Provider>
    );
}
```

이제 이 컨텍스트를 소비하고 이에 응답하는 개별 AccordionItem 컴포넌트를 만듭니다.

```jsx
export const AccordionItem = ({ item }) => {
    const { activeIndex, setActiveIndex } = useContext(AccordionContext);

    return (
        <div>
            <h2 onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
                {item.title}
            </h2>
            {activeIndex === index && <p>{item.content}</p>}
        </div>
    );
}
```

- 이 방식의 이점은 각 AccordionItem이 Accordion의 더 큰 상태를 인식하면서도 훨씬 더 많이 제어할 수 있다는 것
- 이제 map이 아닌 더 자유로운 방식으로 Two와 Three 사이에 가로줄을 표시할 수 있음

```jsx
<Accordion>
    <AccordionItem item={{ title: 'Item 1', content: 'Content 1' }} />
    <hr />
    <AccordionItem item={{ title: 'Item 2', content: 'Content 2' }} />
    <AccordionItem item={{ title: 'Item 3', content: 'Content 3' }} />
</Accordion>
```

- 복합 컴포넌트의 이점은 자식이 컨텍스트 상ㅌ태를 인식하게 하면서 동시에 렌더링 제어를 부모에게 넘기는 것
- 그리고 상태와 관심사 분리가 자연스럽게 이루어지도록 돕기 때문에 애플리케이션의 확장성이 훨씬 좋아짐

### 5.5.7 상태 리듀서
- 이 패턴은 유연하고 사용자 정의 가능한 컴포넌트를 만드는 데 도움을 줌

```jsx
import React, {useReducer} from 'react';

function toggleReducer(state, action){
    switch(action.type){
        case 'TOGGLE':
            return { on: !state.on };
        default:
            return state;
    }
}

function Toggle(){
    const [state, dispatch] = useReducer(toggleReducer, { on: false });
  
  return (
        <Switch on={state.on} onClick={() => dispatch({ type: 'TOGGLE' })} />
    );
}
```

상태 리듀서 패턴을 구현하기 위해 Toggle 컴포넌트를 수정해 stateReducer 프롭을 추가

```jsx
function Toggle({stateReducer}){
  const [state, internalDispatch] = useReducer(
    (state,action) => {
      const nextState = toggleReducer(state,action);
      return stateReducer(state, {...action, changes: nextState});
      },
      {on: false}
    );
    
    return (
        <Switch on={state.on} onClick={() => internalDispatch({ type: 'TOGGLE' })} />
    );
}

Toggle.defaultProps = {
    stateReducer: (state, changes) => changes
}
```

- stateReducer 프롭이 컴포넌트의 내부 상태 로직을 변경하는 데 사용됨
- stateReducer 함수를 호출할 때 현재 상태와 액션 객체를 전달하는데, 액션에는 changes라는 추가 속성을 포함시킴
- changes 속성에는 내부 리듀서에 의해 계산되는 컴포넌트의 다음 상태가 포함됨 -> 이를 통해 외부 리듀서는 컴포넌트의 다음 상태를 알게되고 이를 기반으로 의사 결정 내림
- 이 패턴에 기반한 예시
```jsx
function App(){
    const customReducer = (state, action) => {
        //사용자 정의 로직: 수요일에는 토글을 끌 수 없도록 함
      if(new Date().getDay() === 3 && !action.changes.on){
      return state;
        }
      
        return action.changes;
    }
  
    return <Toggle stateReducer={customReducer} />;
}
```

- 상태 리듀서 패턴을 통해 컴포넌트 자체를 변경하지 않고도 컴포넌트 동작을 유연하게 수정할 수 있음