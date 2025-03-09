# 4장 - 재조정

## 4.1 재조정 이해하기

- 리액트의 가상 DOM은 우리가 원하는 UI 상태의 청사진
- 리액트는 가상 DOM을 가지고 재조정이라는 프로세스를 통해 주어진 호스트환경에서 현실로 만들어냄
- **JSX 코드가 리액트 엘리먼트 트리가 되는 과정**
    - JSX 코드
        
        ```jsx
        import React, { useState } from 'react'
        
        const App = () => {
          const [count, setCount] = useState(0);
        
          return (
             <main>
                <div>
                  <h1>안녕하세요!</h1>
                  <span>카운트 : {count}</span>
                  <button onClick={()=>setCount(count + 1)}>증가</button>
                </div>
              </main>
          );
        };
        
        export default App
        ```
        
    - 위 코드는 아래와 같은 자바스크립트 코드로 변환
        
        ```jsx
        const App = () => {
        	const [count, setCount] = useState(0);
        	
        	return React.createElement(
        		"main",
        		null,
        		React.createElement(
        			"div",
        			null,
        			React.createElement("h1", null, "안녕하세요!"),
        			React.createElement("span", null, "카운트 : ", count),
        			React.createElement(
        				"button",
        				{ onClick: () => setCount(count + 1) },
        				"증가"
        			)
        		)
        	);
        };
        ```
        
    - 최종적으로 생성된 **리액트 엘리먼트 트리**
        
        ```jsx
        {
        	type: "main",
        	props: {
        		children: {
        			type: "div",
        			props: {
        				children: [
        					{
        						type: "h1",
        						props: {
        							children: "안녕하세요!",
        						},
        					},
        					{
        						type: "span",
        						props: {
        							children: ["카운트 : ", count],
        						},
        					},
        					{
        						type: "button",
        						props: {
        							onClick: () => setCount(count + 1),
        							children: "증가",
        						},
        					},
        				],
        			},
        		},
        	},
        }
        ```
        
        - App 컴포넌트가 함수로 호출되면 자손 엘리먼트 4개를 포함한 리액트 엘리먼트를 반환
        - 리액트 엘리먼트 트리는 **꼭 필요한 최소한의 DOM API만 호출해 브라우저에 반영**됨
            
            → 리액트는 가상 DOM의 변경사항을 단 한번의 실제 DOM 업데이트로 **일괄처리**함
            

## 4.2 일괄 처리

- 리액트는 재조정 과정에서 여러 가상 DOM 업데이트를 모아 한 번의 DOM 업데이트로 결합 후 실제 DOM에 대한 업데이트를 일괄 처리함(DOM에 내장된 API인 브라우저의 문서 조각의 방식과 비슷)
- 예시 - 버튼 클릭 시  setCount를 세 번 연속 호출하는 케이스
    
    ```jsx
    const App = () => {
      const [count, setCount] = useState(0);
      const handleClick = () => {
        setCount((prevCount) => prevCount + 1);
        setCount((prevCount) => prevCount + 1);
        setCount((prevCount) => prevCount + 1);
      };
      return (
         <main>
            <div>
              <p>카운트 : {count}</p>
              <button onClick={handleClick}>증가</button>
            </div>
          </main>
      );
    };
    ```
    
    - 일괄 처리를 하지 않으면, 실제 DOM은 세 번 업데이트 되며 이는 성능 낭비, 속도 저하로 이루어질 수 있음
    - 리액트는 일괄 업데이트를 통해 count + 1을 따로 실행 후 DOM을 세 번 업데이트 하는 대신 count + 3로 DOM을 한 번만 업데이트함
- DOM에 대한 효율적인 일괄 업데이트를 계산하기 위해 리액트는 현재 가상 DOM 트리를 복제해 새로운 가상 DOM 트리를 생성 후 업데이트된 값을 적용함
    
    → 새 가상 DOM 값 3을 사용해 DOM 업데이트를 한 번만 수행
    
- 이와 같은 방식이 일괄 처리가 동작하는 과정

## 4.3 기존 기술

- 예전 리액트는 렌더링에 **스택 데이터 구조**를 사용했음

### 4.3.1 스택 재조정자

- 예전에 사용되던 리액트의 재조정자는 스택 기반 알고리즘을 사용해 새 가상 트리를 이전 가상트리와 비교하고 그에 따라 DOM을 업데이트함
- 간단한 경우 잘 작동했지만 애플리케이션 규모가 커지고 복잡해지면서 여러 가지 문제가 발생하였음 → `끊김 현상과 사용자 인터페이스의 느린 응답 속도`
- 스택 재조정자의 문제
    - 업데이트의 우선순위 설정할 수 없음
        - 업데이트가 추가된 순서대로 실행되기 때문에 비교적 덜 중요한 업데이트가 더 중요한 업데이트를 방해하는 경우가 존재했음
        - e.g. 우선순위가 낮은 툴팁 업데이트가 우선순위가 높은 텍스트 입력 업데이트를 막는 경우
    - 업데이트를 중단하거나 취소할 수 없음
        - 만약 업데이트의 우선순위를 조정할 수 있다 해도, 업데이트를 중단, 취소할 수 없으므로 우선순위에 따라 업데이트를 원활하게 동작 시킬 수 없었음

## 4.4 파이버 재조정자

> *파이버는 ‘특정 시점에 존재하는 실제 컴포넌트 트리를 나타내는 리액트의 내부 데이터 구조’
— 마크 에릭슨*
> 
- 파이버
    - 조정자를 위한 작업 단위를 나타내는 데이터 구조
    - 리액트 엘리먼트에서 생성됨
    - 상태를 저장하고 수명이 김(리액트 엘리먼트는 임시적이고 상태가 없음)

### 4.4.1 데이터 구조로서의 파이버

- 파이버 데이터 구조
    - 파이버 재조정자의 핵심 요소
    - 리액트 애플리케이션에서 컴포넌트 인스턴스와 그 상태를 표현
    - 변경 가능한 인스턴스로 설계되었으며 조정 과정에서 필요에 따라 업데이트되고 재배치됨
- 파이버 노드
    - 파이버 노드의 각 인스턴스에는 아래와 같은 데이터가 포함됨
        - 해당 컴포넌트에 대한 정보(프롭, 상태, 하위 컴포넌트 등)
        - 컴포넌트 트리에서의 위치 정보
        - 파이버 재조정자가 업데이트의 우선순위를 정하고 실행하는데 사용하는 메타 데이터
- 예시 - ClassComponent라는 App을 나타내는 파이버 노드
    
    ```jsx
    {
    	tag: 1, // 1 = ClassComponent
    	type: App,
    	key: null,
    	ref: null,
    	props: {
    		name: "Tejas",
    		age: 30
    	},
    	stateNode: AppInstance,
    	return: FiberParent,
    	child: FiberChild,
    	sibling: FiberSibling,
    	index: 0,
    	// ...
    }
    ```
    
    - tag
        - 컴포넌트의 유형과 매칭되는 숫자 ID
        - 각 컴포넌트 유형(클래스 컴포넌트 함수 컴포넌트, 서스펜스 및 오류 경계, 조각 등)에는 고유한 숫자 ID가 파이버로 설정됨
    - type
        - App은 이 파이버가 나타내는 함수 또는 클래스 컴포넌트를 나타냄
    - props
        - 컴포넌트에 대한 입력 프롭 또는 합수에 대한 입력 인수
    - stateNode
        - 파이버가 나타내는 App 컴포넌트의 인스턴스
        - 컴포넌트 트리에서의 위치는 return, child, sibling, index로 표현되며 이는 각각 부모, 자녀, 형제, 파이버의 색인을 의미함
        - 파이버 재조정자는 이 정보를 사용하여 트리를 순회함
- 리액트에서 사용하는 fiberTags
    - react/packages/react-reconciler/src/ReactWorkTags.js
        
        https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactWorkTags.js
        
- 파이버 재조정
    - 파이버 재조정 과정에는 현재 파이버 트리와 다음 파이버 트리를 비교해 어느 노드를 업데이트, 추가, 제거할지 파악하는 작업이 포함됨
    - 조정 과정 중 파이버 재조정자는 가장 DOM의 각 리액트 엘리먼트에 대해 파이버 노드를 생성
        
        → 이 작업은 `createFiberFromTypeAndProps` 함수가 수행함
        
- `createFiberFromTypeAndProps` 함수
    - 엘리먼트에서 파생된 파이버 객체를 반환
    - 여기서 TypeAndProps는 리액트 엘리먼트와 같은 의미(리액트 엘리먼트는 type과 props로 이루어짐)
- **createFiberFromElement**
    
    ```jsx
    // react/packages/react-reconciler/src/ReactFiber.js
    export function createFiberFromElement(
      element: ReactElement,
      mode: TypeOfMode,
      lanes: Lanes,
    ): Fiber {
      let owner = null;
      const type = element.type;
      const key = element.key;
      const pendingProps = element.props;
      const fiber = createFiberFromTypeAndProps(
        type,
        key,
        pendingProps,
        owner,
        mode,
        lanes,
      );
      return fiber;
    }
    ```
    
    - ReactElement를 받아 Fiber를 생성하는 함수
        - ReactElement 내 type, key, props를 createFiberFromTypeAndProps함수의 인자로 넘겨준 후 받은 Fiber 객체를 반환
- **createFiberFromTypeAndProps**
    
    ```jsx
    // react/packages/react-reconciler/src/ReactFiber.js
    export function createFiberFromTypeAndProps(
      type: any, // React$ElementType
      key: null | string,
      pendingProps: any,
      owner: null | ReactComponentInfo | Fiber,
      mode: TypeOfMode,
      lanes: Lanes,
    ): Fiber {
      let fiberTag = FunctionComponent;
      let resolvedType = type;
      if (typeof type === 'function') {
        if (shouldConstruct(type)) {
          fiberTag = ClassComponent;
        } 
      } else if (typeof type === 'string') {
        if (supportsResources && supportsSingletons) {
          const hostContext = getHostContext();
          fiberTag = isHostHoistableType(type, pendingProps, hostContext)
            ? HostHoistable
            : isHostSingletonType(type)
              ? HostSingleton
              : HostComponent;
        } else if (supportsResources) {
          const hostContext = getHostContext();
          fiberTag = isHostHoistableType(type, pendingProps, hostContext)
            ? HostHoistable
            : HostComponent;
        } else if (supportsSingletons) {
          fiberTag = isHostSingletonType(type) ? HostSingleton : HostComponent;
        } else {
          fiberTag = HostComponent;
        }
      } else {
        getTag: switch (type) {
          case REACT_FRAGMENT_TYPE:
            return createFiberFromFragment(pendingProps.children, mode, lanes, key);
          case REACT_STRICT_MODE_TYPE:
            fiberTag = Mode;
            mode |= StrictLegacyMode;
            if (disableLegacyMode || (mode & ConcurrentMode) !== NoMode) {
              // Strict effects should never run on legacy roots
              mode |= StrictEffectsMode;
              if (
                enableDO_NOT_USE_disableStrictPassiveEffect &&
                pendingProps.DO_NOT_USE_disableStrictPassiveEffect
              ) {
                mode |= NoStrictPassiveEffectsMode;
              }
            }
            break;
          case REACT_PROFILER_TYPE:
            return createFiberFromProfiler(pendingProps, mode, lanes, key);
          case REACT_SUSPENSE_TYPE:
            return createFiberFromSuspense(pendingProps, mode, lanes, key);
          case REACT_SUSPENSE_LIST_TYPE:
            return createFiberFromSuspenseList(pendingProps, mode, lanes, key);
          case REACT_OFFSCREEN_TYPE:
            return createFiberFromOffscreen(pendingProps, mode, lanes, key);
          case REACT_LEGACY_HIDDEN_TYPE:
            if (enableLegacyHidden) {
              return createFiberFromLegacyHidden(pendingProps, mode, lanes, key);
            }
          // Fall through
          case REACT_VIEW_TRANSITION_TYPE:
            if (enableViewTransition) {
              return createFiberFromViewTransition(pendingProps, mode, lanes, key);
            }
          // Fall through
          case REACT_SCOPE_TYPE:
            if (enableScopeAPI) {
              return createFiberFromScope(type, pendingProps, mode, lanes, key);
            }
          // Fall through
          case REACT_TRACING_MARKER_TYPE:
            if (enableTransitionTracing) {
              return createFiberFromTracingMarker(pendingProps, mode, lanes, key);
            }
          // Fall through
          default: {
            if (typeof type === 'object' && type !== null) {
              switch (type.$$typeof) {
                case REACT_PROVIDER_TYPE:
                  if (!enableRenderableContext) {
                    fiberTag = ContextProvider;
                    break getTag;
                  }
                // Fall through
                case REACT_CONTEXT_TYPE:
                  if (enableRenderableContext) {
                    fiberTag = ContextProvider;
                    break getTag;
                  } else {
                    fiberTag = ContextConsumer;
                    break getTag;
                  }
                case REACT_CONSUMER_TYPE:
                  if (enableRenderableContext) {
                    fiberTag = ContextConsumer;
                    break getTag;
                  }
                // Fall through
                case REACT_FORWARD_REF_TYPE:
                  fiberTag = ForwardRef;
                  break getTag;
                case REACT_MEMO_TYPE:
                  fiberTag = MemoComponent;
                  break getTag;
                case REACT_LAZY_TYPE:
                  fiberTag = LazyComponent;
                  resolvedType = null;
                  break getTag;
              }
            }
            let info = '';
            let typeString;
            typeString = type === null ? 'null' : typeof type;
    
            // The type is invalid but it's conceptually a child that errored and not the
            // current component itself so we create a virtual child that throws in its
            // begin phase. This is the same thing we do in ReactChildFiber if we throw
            // but we do it here so that we can assign the debug owner and stack from the
            // element itself. That way the error stack will point to the JSX callsite.
            fiberTag = Throw;
            pendingProps = new Error(
              'Element type is invalid: expected a string (for built-in ' +
                'components) or a class/function (for composite components) ' +
                `but got: ${typeString}.${info}`,
            );
            resolvedType = null;
          }
        }
      }
    
      const fiber = createFiber(fiberTag, pendingProps, key, mode);
      fiber.elementType = type;
      fiber.type = resolvedType;
      fiber.lanes = lanes;
    
      return fiber;
    }
    
    ```
    
    - 코드의 대부분의 로직은 fiberTag를 구하기 위한 로직들임
    - 인자로 받은 type에 따라 fiberTag가 달라짐
        - 함수인 경우 `FunctionComponent`
        - 문자인 경우(div, h1, span, …) 내부 다양한 함수 로직을 통해 `HostHoistable` or `HostSingleton` or `HostComponent`
        - 그 외엔 조건에 맞는 tag를 부착(Fragment, ForwardRef, …)
        - 현재 기준 0부터 30까지의 worktag가 존재함

### 📌 정리

- 리액트의 가상 DOM의 node가 되는 Fiber는 createFiberFromElement 함수를 통해 생성된다.
- createFiberFromElement 함수는 createFiberFromTypeAndProps 함수를 호출하여 fiber 객체를 받아온다.
- createFiberFromElement는 전달받은 ReactElement의 type을 createFiberFromTypeAndProps 함수로 전달하는데, 이 때 type에 따라 fiberTag가 달라진다.
- fiberTag가 결정되면 fiberTag, pendingProps, key, mode를 인자로 받는 createFiber 함수를 실행하여 fiber 객체를 받은 후 리턴한다.

-----------------------------------------------------
### 참고 - React의 동작 단계

- Render 단계
    - JSX 선언 또는 `React.createElement()`를 통해 일반 객체인 Reat 엘리먼트를 생성한다.
- Reconcile 단계
    - 이전에 렌더링된 실제 DOM 트리와 새로 렌더링할 React 엘리먼트를 비교하여 변경점을 적용한다.
- Commit 단계
    - 새로운 DOM 엘리먼트를 브라우저 뷰에 커밋한다.
- Update 단계
    - props, state 변경 시 해당 컴포넌트와 하위 컴포넌트에 대해 위 과정을 반복한다.


---------------------------------------------------
- 파이버 노드가 생성되면 파이버 재조정자는 작업 루프를 사용해 사용자 인터페이스를 업데이트함
    - 재조정자는 파이버 노드를 하나의 작업 단위(unitOfWork)로 취급함
        
        → 파이버노드는 그 자체로 렌더링에 필요한 정보를 담고 있는 객체이자 재조정 작업 단위
        
    - 작업 루프는 루프 파이버 노드에서 시작해 컴포넌트 트리를 따라 내려가며 업데이트가 필요한 경우 각 파이버 노드를 더티로 표시, 끝에 도달하면 다시 반대로 순회하면서 브라우저의 DOM 트리와는 분리된 새 DOM 트리를 메모리에 생성함
    - 작업 루프 관련 코드
        
        ```jsx
        // react/packages/react-reconciler/src/ReactFiber.js
        function workLoopConcurrent(nonIdle: boolean) {
          if (workInProgress !== null) {
            const yieldAfter = now() + (nonIdle ? 25 : 5);
            do {
              // $FlowFixMe[incompatible-call] flow doesn't know that now() is side-effect free
              performUnitOfWork(workInProgress);
            } while (workInProgress !== null && now() < yieldAfter);
          }
        }
        
        function workLoopConcurrentByScheduler() {
          // Perform work until Scheduler asks us to yield
          while (workInProgress !== null && !shouldYield()) {
            // $FlowFixMe[incompatible-call] flow doesn't know that shouldYield() is side-effect free
            performUnitOfWork(workInProgress);
          }
        }
        ```
        
        - workInProgress : 현재 처리 중인 파이버 노드를 가리킴(null이 아니라는 건 처리할 작업이 남아있음을 의미)
        - shouldYield : browser가 메인 스레드에 다른 중요한 task를 수행할 필요가 있는지 판단(shouldYield가 true인 경우 리액트는 작업은 중단하고 제어권을 browser에게 넘김)
- 참고
    - 파이버노드를 작업 단위로 처리하는 `performUnitOfWork(unitOfWork: Fiber)` 함수
        
        ```jsx
        // react/packages/react-reconciler/src/ReactFiberWorkLoop.js
        function performUnitOfWork(unitOfWork: Fiber): void {
          // The current, flushed, state of this fiber is the alternate. Ideally
          // nothing should rely on this, but relying on it here means that we don't
          // need an additional field on the work in progress.
          const current = unitOfWork.alternate;
        
          let next;
          if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
            startProfilerTimer(unitOfWork);
            next = beginWork(current, unitOfWork, entangledRenderLanes);
            stopProfilerTimerIfRunningAndRecordDuration(unitOfWork);
          } else {
            next = beginWork(current, unitOfWork, entangledRenderLanes);
          }
        
          unitOfWork.memoizedProps = unitOfWork.pendingProps;
          if (next === null) {
            // If this doesn't spawn new work, complete the current work.
            completeUnitOfWork(unitOfWork);
          } else {
            workInProgress = next;
          }
        }
        ```
        

### beginWork(작업시작)

- 작업용 트리에 있는 파이버 노드의 업데이트 필요 여부를 나타내는 플래그를 설정
- 여러 플래그를 설정하고 다음 파이버 노드로 이동하며 트리의 맨 아래에 도달할 때까지 동일한 작업을 수행
- 이 작업이 완료되면 파이버 노드에서 completeWork를 호출하고 다시 거슬러 올라가며 순회함
- beginWork의 시그니처
    
    ```jsx
    function beginWork(
      current: Fiber | null,
      workInProgress: Fiber,
      renderLanes: Lanes,
    ): Fiber | null;
    ```
    
    - current
        - 업데이트 중인 작업용 노드에 해당하는 현재 트리의 파이버 노드에 대한 참조
        - 트리의 이전 버전과 새 버전 간에 변경된 사항과 업데이트할 사항을 결정하는데 사용됨
        - 불변 값, 비교용으로만 사용
    - workInProgress
        - 작업용 트리에서 업데이트 중인 파이버 노드
        - beginWork 함수에 의해 업데이트되어 ‘더티’로 표시된 채 반환되는 노드
    - renderLanes
        - 업데이트가 처리되는 레인을 나타내는 비트마스크
        - 레인 : 우선순위를 비롯한 여러 기준에 따라 업데이트를 분류하는 방식
        - 리액트 컴포넌트를 변경하면 우선순위를 비롯한 여러 특성에 따라 레인이 할당되며, 변경 우선순위가 높을 수록 더 높은 레인이 할당됨

### completeWork(작업 완료)

- 작업용 파이버 노드에 업데이트를 적용하고 애플리케이션의 업데이트된 상태를 나타내는 실제 DOM 트리를 새롭게 생성
- 이 작업을 통해 DOM에서 분리된 트리를 브라우저가 시각적으로 표현하는 **영역 바깥**에 구성함
- 호스트 환경이 브라우저인 경우 document.createElement 또는 newElement.appendChild같은 작업을 수행하게 됨(이 엘리먼트 트리는 브라우저 내 문서에 추가되지 않은 상태라 언제든지 버려질 수 있음)
- completeWork의 시그니처
    
    ```jsx
    function completeWork(
      current: Fiber | null,
      workInProgress: Fiber,
      renderLanes: Lanes,
    ): Fiber | null;
    ```
    
- beginWork는 파이버 노드에 업데이트가 필요함 상태에 대한 플래그를 설정하는 역할
- completeWork는 호스트 환경에 커밋할 새 트리를 구성하는 역할
- **completeWork가 트리 맨 위에 도달해 새 DOM 트리를 구성하면 리액트는 커밋 단계로 넘어감**

### 커밋 단계

- 렌더링 단계에서 가상 DOM에 적용된 변경 사항을 실제 DOM에 반영하는 단계
- 새 가상 DOM 트리가 호스트 환경에 커밋되고 작업용 트리가 현재 트리로 바뀜
- 커밋 단계는 변형단계와 레이아웃 단계로 나뉨
- 변형 단계
    - 커밋 단계의 첫 부분으로 가상 DOM에 적용된 변경 사항을 실제 DOM에 반영하는 단계
    - 리액트는 적용할 업데이트를 식별하고 `commitMutationEffects` 라는 특수 함수를 호출
    - `commitMutationEffects`
        - 렌더링 단계에서 작업용 트리의 파이버 노드에 적용된 업데이트를 실제 DOM에 반영
    - 변형 단계에서 리액트는 commitUnmount 및 commitDeletion 같은 특수 함수를 호출해 필요하지않은 노드를 DOM에서 제거하기도 함
- 레이아웃 단계
    - 커밋 단계의 둘째 부분으로 DOM에서 업데이트된 노드의 새 레이아웃을 계산하는 단계
    - 리액트는 `commitLayoutEffects` 라는 특수 함수를 호출하여 DOM에서 업데이트된 노드의 새 레이아웃을 계산함
- 레이아웃 단계가 완료되면, 리액트는 렌더링 단계에서 가상 DOM에 적용되었던 변경 사항을 실제 DOM에 성공적으로 반영하게 됨

### 효과

- 리액트 재조정 과정의 커밋 단계에서는 여러 부작용이 특정 순서로 실행되며, 그 순서는 효과 종류에 따라 달라질 수 있음
- 커밋 단계에서 발생하는 효과
    - 배치 효과
        - 새 컴포넌트가 DOM에 추가될 때 발생
        - e.g. 폼에 새 버튼이 추가되면 배치 효과가 발생해 해당 버튼이 DOM에 추가됨
    - 업데이트 효과
        - 컴포넌트가 새로운 프롭이나 상태로 업데이트될 때 발생
        - e.g. 버튼의 텍스트가 변경되면 업데이트효과가 발생해 DOM의 텍스트가 업데이트됨
    - 삭제 효과
        - 컴포넌트가 DOM에서 제거될 때 발생
        - e.g. 폼에서 버튼이 제거되면 삭제 효과가 발생해 DOM에서 버튼이 제거됨
    - 레이아웃 효과
        - 브라우저의 페인트 기능 시점 전에 발생
        - 페이지 레이아웃을 업데이트하는데 사용됨
        - 레이아웃 효과는 함수 컴포넌트의 경우 useLayoutEffect 훅을, 클래스 컴포넌트에서는 componentDidUpdate 수명 주기 메서드를 사용해 관리함
- 커밋 효과가 달리 패시브 효과는 브라우저의 페인트 기능 시점 후에 실행되도록 예약된 사용자 정의 효과. useEffect 훅을 사용해 관리됨

### 화면에 모두 효시하기

- 리액트는 현재 트리나 작업용 트리 중 하나 위에 FiberRootNode를 둠
- FiberRootNode는 재조정 과정의 커밋 단계를 관리하는 핵심 데이터 구조
- 가상 DOM이 업데이트 되면 리액트는 현재 트리를 변경하지 않은 채 작업용 트리를 업데이트 함
→ 이를 통해 애플리케이션의 현재 상태를 유지하면서 가상 DOM을 계속 렌더링하고 업데이트하는 것이 가능
- 렌더링 프로세스 완료 시 리액트는 commitRoot 함수를 호출해 작업용 트리에 적용된 변경 사항을 실제 DOM에 커밋함
- commitRoot는 FiberRootNode의 포인터를 현재 트리에서 작업용 트리로 전환하고 작업용 트리를 새로운 현재 트리로 만듦
→ 이 시점부터 향후 모든 업데이트는 새로운 현재 트리르 기반으로 이루어짐
