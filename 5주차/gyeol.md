# 5장 - 자주 묻는 질문과 유용한 패턴

## 5.4 useState와 useReducer

- useState와 useReducer 모두 컴포넌트의 상태 관리에 사용하는 훅
    - useState는 단일 상태 관리에 적합
    - useReducer는 복잡한 상태를 관리
- useState로 컴포넌트 상태 관리하기
    - useState를 사용해 복잡한 상태를 관리하게 된다면?
        
        ```jsx
        import React, { useState } from 'react';
        
        const App = () => {
          const [state, setState] = useState({
            count: 0,
            name: "Tejumma",
            age: 30,
          });
          
          return (
            <div>
              <p>카운트: {state.count}</p>
              <p>이름: {state.name}</p>
              <p>나이: {state.age}</p>
              <button onClick={()=> setState({ ...state, count: state.count + 1 })}>
                증가
              </button>
            </div>
          );
        };
        ```
        
        - 버튼을 클릭하면 상태를 이전 상태와 속성이 같은 새로운 객체로 생성 후 count를 1만큼 증가시킴
        - 이처럼 **복잡한 상태를 useState로 관리할 경우** 이전 상태를 주의 깊게 전개하지 않으면상태의 일부 속성을 덮어쓰게되는 것과 같은 **버그가 발생할 가능성**이 높아짐
- **useState는 내부적으로 useReducer를 사용한다!**

    
    ```jsx
    // react/packages/react-reconciler/src/ReactFiberHooks.js
    const HooksDispatcherOnMount: Dispatcher = {
      // ...
      useReducer: mountReducer,
      useState: mountState,
      // ...
    }
    const HooksDispatcherOnUpdate: Dispatcher = {
      // ...
      useReducer: updateReducer,
      useState: updateState,
      // ...
    }
    
    function updateState<S>(
      initialState: (() => S) | S,
    ): [S, Dispatch<BasicStateAction<S>>] {
      return updateReducer(basicStateReducer, initialState);
    }
    ```
    
    - useReducer와 useState는 동일한 업데이트 구현체를 사용함
        
        [React useState 소스코드 분석하기 | D5BL5G](https://d5br5.dev/blog/deep_dive/react_useState_source_code)
        
        [리액트 내부 동작 원리 5 — useState()](https://medium.com/@sanoopark/%EB%A6%AC%EC%95%A1%ED%8A%B8-%EB%82%B4%EB%B6%80-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC-5-usestate-0c7d779997a9)
        
- useState는 useReducer의 상위 추상화라고 볼 수 있음
- 위에 정리한 [useState 예시](https://www.notion.so/5-1954b54d0fda81959fd0dc143e0c69c8?pvs=21)를 useReducer를 사용하여 변경할 수 있음
    
    ```jsx
    import React, { useReducer } from 'react'
    
    const initialState = {
      count: 0,
      name: "Tejumma",
      age: 30,
    };
    
    const reducer = (state, action) => {
      switch(action.type){
        case "increment":
          return {...state, count: state.count + 1};
        default:
          return state;
      }
    };
    const App = () => {
      const [state, dispatch] = useReducer(reducer, initialState);
      
      return (
        <div>
          <p>카운트: {state.count}</p>
          <p>이름: {state.name}</p>
          <p>나이: {state.age}</p>
          <button onClick={()=> dispatch({ type: "increment" })}>
            증가
          </button>
        </div>
      );
    };
    ```
    
- useState는 useReducer를 추상화한 것이므로 useState가 훨씬 간단해 보임
- useState에서도 useReducer와 동일한 작업을 수행할 수 있으니 더 간단한 useState만 사용해도 되지않을까? 라는 생각이 들 수 있지만 useReducer를 사용했을 때 얻는 이점이 있음
- useReducer 사용 시 얻는 이점 세 가지
    - 상태 업데이트 로직을 컴포넌트에서 분리할 수 있음
        - reducer 함수는 단독으로 테스트하고 다른 컴포넌트에서 재사용이 가능함. 이를 통해 컴포넌트를 단순하게 유지하며 **단일 책임 원칙**을 따를 수 있음
    - 상태와 상태 변경 방식은 항상 명시적으로 useReducer와 함께 사용되므로 개발자가 파악하기 쉬움
    - useReducer는 이벤트 소스 모델
        - 애플리케이션에서 발생하는 이벤트를 모델링해서 진단 로그를 추적하는데 사용할 수 있음
        - 진단 로그를 통해 애플리케이션의 이벤트를 재생해 버그를 재연하거나 시간 여행 디버깅을 구현하는 데 사용이 가능함
- 그래서 useState와 useReducer는 언제 사용?
    - **상태의 복잡성에 따라 달라짐**

### 5.4.1 Immer와 편의성

- Immer
    - 애플리케이션에서 복잡한 상태 관리를 처리할 때 유용한 리액트 라이브러리
    - 변경 가능한 초안 상태로 작업하고 한 번 생성된 상태는 변경 불가로 만들어서 복잡성을 관리할 수 있도록 도와줌
- useReducer로 작업할 때 제공하는 reducer 함수는 순수해야하며 항상 새 상태 객체를 반환해야하므로 중첩된 상태 객체를 처리할 때 장황한 코드가 생길 수 있음
    - 이 경우 use-Immer 라이브러리의 useImmerReducer를 사용해 Immer와 useReducer를 통합하면 실제로 Immer가 제공하는 초안 상태에서 동작하면서 마치 상태를 직접 변경하는 것처럼 보이는 reducer를 작성할 수 있음
    → 더 단순하고 직관적인 reducer 함수 작성이 가능해짐
- 복잡한 상태 객체의 상태 업데이트 시 불변성을 보장하고 싶은 경우 useState와 Immer를 함께 사용할 수 있음
- 결론
    - Immer는 복잡하거나 중첩된 상태 구조에서 상태 업데이트를 단순화하는데 유용하므로 리액트의 상태 관리 훅과 함께 사용하기 좋음

## 5.5 강력한 패턴

- 소프트웨어 디자인 패턴이 중요한 이유
    - 재사용성
        - 흔히 겪는 문제에 대한 재사용 가능한 해결책을 제공해 소프트웨어 개발 시간, 노력 절약이 가능
    - 표준화
        - 문제를 해결하는 표준 방법을 제공 → 개발자들끼리 서로 더 잘 이해하고 소통이 가능
    - 유지 보수성
        - 유지 보수 및 수정이 쉬운 코드로 구조화하는 방법을 지원하므로 소프트웨어 시스템의 수명을 향상 시킬 수 있음
    - 효율성
        - 일반적인 문제에 효율적인 해결책을 제공해 소프트웨어 시스템의 성능 개선 가능
- 대부분의 패턴은 이상적인 추상화 수준을 도출 해 내는데 유용함

### 5.5.1 프레젠테이션/컨테이너 컴포넌트

- 리액트에서 흔히 볼 수 있는 디자인 패턴 중 하나로 프레젠테이션 컴포넌트와 컨테이너 컴포넌트라는 두 가지 컴포넌트의 조합으로 구성됨
    - 프레젠테이션 컴포넌트는 **UI를 렌더링**함
    - 컨테이너 컴포넌트는 **UI의 상태를 처리**함
- 예시
    
  ```jsx
  const PresentationalCounter = (props) => {
    return (
      <section>
        <button onClick={props. increment}>+</button> 
        <button onClick={props.decrement}>-</button>
        <button onClick=tprops.reset}>재설정</button> 
        <h1>현재 카운트: {props.count} </h1>
      </section>
    );
  };
  const ContainerCounter = () => {
    const [count, setCount] = useState (0);
    const increment = () => setCount (count + 1);
    const decrement = () => setCount (count - 1);
    const reset = () => setCount(0);
    return (
      <PresentationalCounter 
        count={count} 
        increment={increment} 
        decrement={decrement} 
        reset={reset}
      />
    );
  };
  ```
    
- **단일 책임 원칙** 때문에 아주 유용함
- 애플리케이션에서 **관심사를 분리**해 모듈화, 재사용, 테스트를 가능하게 하므로 더 나은 확장을 실현함
- 훅이 도입되고 컴포넌트에 상태를 추가하기 편해지면서 컨테이너 컴포넌트가 상태를 공급하지 않게 되었음
    - 요즘은 컨테이너 컴포넌트가 없어도 stateless 컴포넌트를 쉽게 만들 수 있음
        
        **→ 대부분의 프레젠테이션/컴테이너 패턴을 리액트 훅으로 대체 가능**
        

### 5.5.2 고차 컴포넌트

- 고차 함수
    - 수학 및 컴퓨터 과학에서 고차 함수(HOF)는 다음 중 하나 이상을 수행하는 함수
        - 하나 이상의 함수를 인수로 취함(e.g. 절차적 매개변수)
        - 함수를 결과로 반환함
- 고차 컴포넌트(HOC)
    - 컴포넌트를 인자로 받아 새로운 컴포넌트를 반환하는 함수
        
        → 컴포넌트의 로직을 재사용하고, 코드의 중복을 줄이는 데 유용함 
        
    - 주로 인증, 로깅, 데이터 페칭 등의 공통 로직을 분리하는 데 사용하며 컴포넌트 기반 아키텍처의 장점을 극대화할 수 있음
    - 리액트의 훅도 비슷한 이점을 제공하면서 편의성이 더 좋기 때문에 고차 컴포넌트 대신 훅을 사용할 때가 더 많음
- 고차 컴포넌트 합성
    - 여러 고차 컴포넌트를 합성 하는 것도 자주 사용되는 리액트 디자인 패턴 중 하나
    - 개발자는 이를 통해 여러 컴포넌트의 기능과 동작을 혼합하고 일치시킬 수 있음
    - 두 개의 고차 컴포넌트 합성하기
        
        ```jsx
        // withLogging.js
        const withLogging = (WrappedComponent) => {
          return (props) => {
            console.log('렌더링에 사용한 프롭: ', props);
            return <WrappedComponent {...props }/>
          };
        };
        
        // withUser.js
        const withUser = (WrappedComponent) => {
          const user = { name: 'gyeol' }; // 다른 데이터 소스에서 왔다고 가정
          return (props) => <WrappedComponent {...props } user={user}/>
        };
        // 중첩을 사용하여 두 고차 컴포넌트 합성하기
        const EnhancedComponent = withLogging(withUser(MyComponent));
        ```
        
        - 중첩된 고차 컴포넌트의 호출은 고차 컴포넌트의 수가 증가할 수록 유지보수가 어려워짐
            
          ```jsx
          // 중첩된 고차 컴포넌트의 미래
          const EnhancedComponent = withErrorHandeler(
            withLoadingSpinner(
              withAuthentication(
                withPagination(
                  // ...
                    withLogging(
                      withUser(
                        withTheme(
                          withIntl(
                            withRouting(MyComponent)
                          )
                        )
                      )
                    )
                  // ...
                )
              )
            )
          );
          ```
            
    - 여러 개의 고차 컴포넌트를 하나의 고차 컴포넌트로 합성하는 유틸리티 함수 작성하기
        
      ```jsx
      // compose.js
      const compose =
        (...hocs) =>
        (WrappedComponent) =>
          hocs.reduceRight((acc, hoc) => hoc(acc), WrappedComponent);
      // 사용법
      const EnhancedComponent = compose(
        withErrorHandeler,
        withLoadingSpinner,
        withAuthentication,
        withPagination,
        // ...
      )(MyComponent);
      ```
        
        - 나열된 각 고차 컴포넌트는 이전 고차 컴포넌트가 생성한 컴포넌트를 감싸고 자체적인 동작을 추가함 
        → 단일 관심사에 초점을 맞춘 간단한 컴포넌트와 고차 컴포넌트를 함께 사용하여 복잡한 컴포넌트 구성이 가능해짐

### 고차 컴포넌트와 훅 비교

- 리액트 훅을 사용하면 컴포넌트에 더 편리하게 기능을 추가할 수 있고 고차컴포넌트가 가진 문제 중 일부를 해결 할 수 있음(참조 전달에 대한 문제, 불필요한 리렌더링 발생 등)
- 고차 컴포넌트 vs 훅
    
    
    | 기능  | 고차 컴포넌트 | 훅 |
    | ----- | --- | --- |
    | 코드 재사용 | 여러 컴포넌트에서 로직을 공유하는 데 탁월함 | 컴포넌트 내 또는 유사한 컴포넌트 간 로직 추출, 공유하는 데에 이상적 |
    | 렌더링 로직 | 감싸진 컴포넌트의 렌더링을 제어 | 렌더링에 직접 영향을 주진 않지만 함수형 컴포넌트 내에서 렌더링과 관련된 부수적 작용을 관리하는 데 사용 |
    | 프롭 조작 | 프롭을 삽입하고 조작해 추가 데이터나 기능 제공 가능 | 프롭을 직접 주입하거나 조작할 수 없음 |
    | 상태 관리 | 감싸진 컴포넌트 외부에서 상태를 관리하고 조작함 | 함수 컴포넌트 내에서 로컬 상태 관리하도록 설계되었음 |
    | 수명주기 방법 | 감싸진 컴포넌트와 관련된 수명 주기 로직을 캡슐화함 | useEffect를 비롯한 훅은 함수 컴포넌트 내에서 수명 주기 이벤트를 처리함 |
    | 합성 용이성 | 합성할 수 있지만 잘 관리하지 않으면 래퍼 지옥이 되기도 함 | 쉽게 합성이 가능. 여러 개의 컴포넌트를 추가하지 않고도 다른 훅과 함께 사용 가능함 |
    | 테스트 용이성 | 추가 래퍼 컴포넌트로 인해 테스트가 더 복잡해질 수 있음 | 일반적으로 고차 컴포넌트보다 쉽게 격리 가능하므로 테스트도 쉬움 |
    | 타입 안전성 | 타입스크립트를 사용하면 특히 깊게 중첩된 고차 컴포넌트의 경우 올바르게 입력하기가 까다로움 | 타입스크립트로 타입 추론이 향상되고 입력이 쉬워짐 |
- 고차 컴포넌트는 여전히 유용한 패턴이지만, 단순성과 사용 편의성 측면에서 보았을 때 일반적으로는 훅이 더 선호됨
- 우리가 자주 사용하는 리액트 고차 컴포넌트
    - React.memo
    - React.forwardRef(하위 컴포넌트에 대한 참조를 전달하는 고차 컴포넌트)

[리액트 고차 컴포넌트(HOC)](https://jeonghwan-kim.github.io/2022/05/28/react-high-order-component)

### 5.5.3 렌더 프롭

- 렌더 프롭 패턴을 사용하면 컴포넌트를 재사용 가능하게 할 수 있음
- 컴포넌트의 props으로 함수이며 JSX 엘리먼트를 리턴함
- 자신을 렌더링하는 부모 컴포넌트로부터 전닳받은 렌더 프롭을 호출하여 렌더링 작업에 대한 제어를 부모에게 넘겨 제어를 역전
→  코드는 DRY(dont repeact yourself) 원칙을 조금 더 잘 지킬 수 있음
- 하지만….렌더 프롭으로 해결하려는 문제는 리액트 훅으로 대체되었음

[Render Props 패턴](https://patterns-dev-kr.github.io/design-patterns/render-props-pattern/)

### 5.5.4 제어 프롭

- **상태 관리에 대한 전략적 접근 방식으로 제어 컴포넌트의 개념을 확장한 것**
- 컴포넌트 내의 상태 관리 방법을 결정하기 위한 유연한 메커니즘을 제공함
- 제어 컴포넌트
    - 내부에 자체 상태를 유지하지 않는 컴포넌트
    - **제어 컴포넌트의 현재 값은 부모 컴포넌트에서 전달한 프롭에 의해 결정되며 부모 컴포넌트가 단일 정보 출처의 역할을 함**
    - 상태가 변경되어야 할 때 보통 onChange 같은 콜백 함수를 통해 부모에게 알림 → **상태 관리, 제어 컴포넌트의 값을 업데이트 하는 책임은 모두 부모 컴포넌트에 있게 됨**
- 제어 프롭 패턴은 제어 컴포너트의 원리를 확장
    - 컴포넌트는 외부에서 프롭으로 제어될 수도 있고 내부적으로 자체 상태를 관리하며 선택적으로 외부 제어를 가능하게 함
- **제어 프롭 패턴을 따르는 컴포넌트는 상탯값과 상태를 업데이트하는 함수 두 가지를 프롭으로 받음**
    - 두 가지 기능을 모두 지원함으로써 부모 컴포너트가 자식 컴포넌트의 상태를 제어할 수 있지만 부모가 제어하지 않는 경우 자식 컴포넌트가 독립적으로 동작하기도 함
- 제어 프롭 패턴의 예시 - 부모에 의해 제어되거나 자체 상태를 관리할 수 있는 토글 버튼
    
    ```jsx
    import React, { useState } from 'react'
    
    function Toogle({ on, onToggle }){
      const [isOn, setIsOn] = useState(false);
    
      const handleToggle = () => {
        const nextState = on === undefined ? !isOn : on;
        if(on === undefined){
          setIsOn(nextState);
        }
        if(onToggle){
          onToggle(nextState);
        }
      };
      return (
        <button onClick={handleToggle}>
          {on !== undefined ? on : isOn ? "On" : "Off"}
        </button>
      );
    }
    ```
    
    - Toggle 컴포넌트에서 isOn은 내부 상태, on은 외부 제어 프롭을 뜻함
    - 부모가 on 프롭을 전달하면 컴포넌트는 제어 모드에서 작동 가능
    - on 프롭이 전달되지 않으면 내부 상태인 isOn을 사용
    - onToggle 프롭은 부모 컴포넌트가 상태 변경에 반응할 수 있도록 하는 콜백으로 부모가 자신이 가진 상태를 Toggle 컴포너트의 상태와 동기화하도록 해줌
- 제어 프롭 패턴은 제어 및 비제어 작동 모드를 모두 제공해 컴포넌트의 유연성을 향상시킴
- 필요한 경우 부모가 제어하며 , 명시적으로 제어 되지 않을 때는 컴포넌트가 자체 상태에 대한 자율성을 유지

### 5.5.5 프롭 컬렉션(prop collection)

- 컴포넌트가 자식 컴포넌트에 여러 프롭을 전달할 때 유용하게 사용되는 패턴
- 자식 컴포넌트가 받는 프롭을 하나의 객체로 묶어 전달함으로써, 코드의 가독성과 재사용성을 높이는 데 기여함
- 컴포넌트에 직접 프롭을 작성 후 프롭 컬렉션에 덮어 씌울 경우 프롭의 충돌이 발생하여 의도하지 않은 동작이 발생할 수 있음
    
    → 이런 문제는 프롭 게터를 사용하면 해결 가능
    

### 프롭 게터(prop getter)

- 사용자 정의 프롭을 프롭 컬렉션에 조합하고 병합하는 함수
- 프롭 게터는 함수이기 때문에 사용자가 정의한 함수 등을 인수로 받아 조합할 수 있음

### 5.5.6 복합 컴포넌트

- 부모 컴포넌트로 자식 컴포넌트 전체를 감싸 유저에게 지정시키는 패턴
- 데이터를 props를 통해 넘겨주는 것이 아닌 자식 컴포넌트로서 넘겨주는 부모-자식 관계로 구축되는 컴포넌트임
- 서로 연결되고 상태를 공유하면서도 독립적으로 렌더링되는 컴포넌트를 한데 묶어 엘리먼트 트리를 더 세밀하게 제어할 수 있도록 함
- 리액트에서 복합 컴포넌트 패턴을 구현하는 방법
    - 자식에게 `React.cloneElement` 사용
        - `React.cloneElement` 는 레거시 API 이므로 패스..
    - 리액트 컨텍스트 사용
- 리액트 컨텍스트를 사용해 복합 컴포넌트 패턴 구현하기
    
    ```jsx
    const AccordionContext = createContext({
      activeItemIndex: 0,
      setActiveItemIndex: () => 0,
    });
    
    export const Accordion = ({ children }) => {
      const [activeItemIndex, setActiveItemIndex] = useState(0);
    
      return (
        <AccordionContext.Provider value={{ activeItemIndex, setActiveItemIndex }}>
          <ul>{childend}</ul>
        </AccordionContext.Provider>
      );
    };
    
    export AccordionItem = ({ item, index }) => {
      // 주의 : 여기선 상태가 아니라 컨텍스트를 사용하고 있음!
      const [activeItemIndex, setActiveItemIndex] = useContext(AccordionContext);
    
      return (
        <li onClick={() => setActiveItemIndex(index)} key={item.id}>
          <strong>{item.label}</strong>
          {index === activeItemIndex && i.content}
        </li>
      );
    };
    
    // 사용법
    <Accordion>
      {items.map((item, index) => (
        <AccordionItem key={item.id} item={item} index={index}/>
      ))}  
    </Accordion>
    ```
    
- 장점
    - 자식이 컨텍스트 상태를 인식하게 하면서 동시에 렌더링 제어를 부모에게 넘길 수 있음
    - 상태와 관심사 분리가 자연스럽게 이루어지므로 애플리케이션의 확장성 측면에서 용이함

[Compound 패턴](https://patterns-dev-kr.github.io/design-patterns/compound-pattern/)

### 5.5.7 상태 리듀서

- 켄터 C. 도즈가 만들고 알린 패턴(리액트 전문가이자 교육자)
- 유연하고 사용자 정의 가능한 컴포너트를 만드는 강력한 방법을 제시하는 패턴
- 이를 사용하면 매우 유현하고 재사용가능한 컴포넌트 구현이 가능함
- 외부 로직이 컴포넌트 내부 상태 관리와 통합될 수 있도록 허용함으로써 다양한 동작과 사용 사례 충족이 가능. 컴포넌트의 유용성과 다양성까지 향상 시킬 수 있음
