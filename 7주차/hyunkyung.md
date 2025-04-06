# 7장 리액트 동시성
## 7.1 동기식 렌더링의 문제
- 메인 스레드를 가로막아서 사용자 경험이 저하됨 -> UI 반응이 느려지거나 응답을 하지 않아 사용자가 불편을 겪게 됨
- 이를 완화하기 위해 일괄처리를 통해 여러 업데이트를 모아서 처리
- 하지만 한계가 있었음. 동기식 렌더링은 우선순위가 없으므로 화면에 바로 보여질 필요가 없는 것들도 동등한 수준으로 렌더링하므로 메인 스레드가 가로막힐 수 있음 
- 동시성 렌더링을 통해 업데이트 작업의 중요도와 긴급도에 따라 우선순위를 정하고, 중요한 업데이트가 덜 중요한 업데이트 때문에 가로막히지 않도록 함
  - 사용자 상호작용이나 애니메이션 같은 더 중요한 작업이 우선적으로 처리됨
- 타임 슬라이싱(렌더링 프로세스를 더 작은 덩어리로 분할해 점진적으로 처리하는 기법)도 가능
  - 여러 프레임에 걸쳐 작업을 수행하며 작업을 중지해야할 때 중지할 수 있음

## 7.2 파이버 다시보기
- 리액트 16에 도입된 파이버 재조정자는 렌더링 프로세스를 파이버라고 하는 더 작고 관리하기 쉬운 작업 단위로 분리하여 처리
- 파이버를 통해 렌더링 작업을 일시적으로 중지하거나 재개하거나 우선순위를 설정해 작업을 조정할 수 있음

## 7.3 업데이트 예약과 지연
- 파이버는 스케줄러와 여러 효율적인 API를 통해 업데이트를 예약하고 지연시킬 수 있음
- 스케줄러는 해야 할 업데이트 작업이 있을 떄 setTimeout, MessageChannel 등의 브라우저 API를 사용해 작업을 예약, 관리
- 만약 실시간 채팅 애플리케이션이 있고 사용자 입력, 메세지 렌더링 등 여러 작업이 있다면 
  - 사용자 입력은 즉시 처리해야 하므로 높은 우선순위로 예약
  - 메세지 렌더링은 낮은 우선순위로 예약

```tsx
const ChatApp = () => {
    const [messages, setMessages] = useState<Message[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const socket = new WebSocket('ws://example.com/chat')
    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)
      startTransition(() => {
        setMessages((prevMessages) => [...prevMessages, newMessage])
      })
    }
  }, []);
}
```

## 7.4 더 깊이 들어가기
### 7.4.1 스케줄러
- 스케줄러는 타이밍 관련 유틸리티를 제공하는 독립형 패키지로, 파이버 재조정자와는 별개로 동작
  - 리액트는 재조장자 내에서 이 스케줄러를 사용
- 스케줄러와 재조정자는 렌더 레인을 통해 작업의 긴급도에 따라 우선순위를 설정하고 정리해 여러 작업이 협력하도록 함
- 오늘날 리액트에서 스케줄러의 주된 기능은 마이크로태스크를 예약해서 메인 스레드의 제어를 관리하고 원활한 실행을 보장하는 것
- 자바스크립트 이벤트 루프와 관련된 작업 큐
  - 이벤트 루프
    - 자바스크립트 엔진은 이벤트 루프를 사용해 비동기 작업을 관리(콜백 실행 등 수행해야할 작업이 있는지 계속해서 확인)
  - 매크로태스크 큐
    - 이벤트 처리, setTimeout 콜백 실행, setInterval 콜백 실행, 입출력 작업 수행 등의 작업이 저장되는 곳
  - 마이크로태스크 큐
    - 더 작고 즉각적인 작업이며 프라미스, Object.observe, MutationObserver 같은 연산에서 발생
  - 실행
    - 마이크로태스크는 현재 작업이 끝나고 자바스크립트 엔진이 작업 대기열에서 다음 매크로태스크를 선택하기 전에 처리됨
    - 마이크로태스크 먼저 실행, 이후 매크로 태스크 실행
  - 특성 및 사용법
    - 마이크로태스크는 다른 작업보다 우선순위가 높아 매크로태스크로 넘어가기 전에 실행됨
    - 마이크로태스크가 계속해서 마이크로태스크를 대기열에 추가하면 작업 대기열이 처리되지 않는 상황이 발생하는데 이를 기아상태라고 함
- 다음 레인이 sync라면 스케줄러는 다음 레인에 대한 마이크로태스크를 예약하고, 아니라면 콜백을 예약하고 다음 레인을 처리

## 7.5 렌더 레인
- 렌더 레인은 작업의 렌더링과 우선순위 관리를 효율화함
- 렌더 레인은 리액트 18에서 도입되었으며, 그 전에는 만료 시간이 있는 예약 매커니즘이 사용됨
- setState를 호출하면?
  - 클릭 핸들러 내부에서 호출되면 Sync 레인(우선순위 가장 높음)에 배정되며, 마이크로태스크로 예약됨
  - startTransition으로 감싸면 Transition 레인(우선순위 낮음)에 배정되며, 마이크로태스크로 예약됨
- 레인 예시
  - SyncHydrationLane: 하이드레이션 도중 사용자가 리액트 앱을 클릭하면 해당 클릭 이벤트가 배정되는 레인
  - SyncLane: 클릭 이벤트가 배정되는 레인
  - InputContinuousHydrationLane: 하이드레이션 도중 발생하는 호버, 스크롤을 비롯한 연속적 이벤트
  - InputContinuousLane: 앞서 설명한 레인과 동일하지만 하이드레이션 이후의 이벤트를 다룸
  - DefaultLane: 네트워크 업데이트, setTimeout 같은 타이머, 우선순위가 파악되지 않는 초기 렌더링
  - TransitionHydrationLane: 하이드레이션 도중 startTransition에서 발생하는 모든 트렌지션
  - TransitionLane: 하이드레이션 이후 startTransition에서 발생하는 모든 트렌지션
  - RetryLanes: Suspense에서 발생하는 모든 재시도

### 7.5.1 렌더 레인 작동 방식
- 컴포넌트가 업데이트되거나 새 컴포넌트가 렌더 트리에 추가되면 렌더 레인에 업데이트가 예약됨
- 작동 방식
- 1. 업데이트 수집: 마지막 렌더링 이후에 예약된 모든 업데이트 수집하여 우선순위에 따라 레인 할당
- 2. 레인 처리: 우선순위가 가장 높은 레인부터 시작해 업데이트 처리. 같은 레인의 업데이트는 한꺼번에 일괄 처리
- 3. 커밋 단계: 모든 업데이트를 처리한 후, 커밋 단계로 진입해 변경 사항을 DOM에 적용하고 효과를 실행
- 4. 반복: 렌더링을 할 떄마다 업데이트가 항상 우선순위대로 처리되도록 보장

- 우선순위 결정
- 1. 업데이트의 컨텍스트 확인: 사용자 상호작용인지 프롭 변경인지 등등
- 2. 컨텍스트에 따른 우선순위 추정
- 3. 우선순위 재정의가 있는지 확인: useTransition, useDeferredValue 훅을 사용해 명시적으로 설정한 우선순위가 있는지 확인
- 4. 올바른 레인에 업데이트 할당: 우선순위에 따라 올바른 레인에 업데이트를 할당

### 7.5.2 레인처리
- 리액트가 업데이트를 처리하는 순서
- 1. ImmediatePriority: 메시지 입력에 대한 업데이트 처리
- 2. UserBlockingPriority: 입력 상태 표시에 대한 업데이트를 처리해 사용자에게 실시간 피드백 제공
- 3. NormalPrioirty: 메시지 목록의 업데이트를 처리해 새 메시지와 업데이트를 적절한 속도로 표시

### 7.5.3 커밋 단계
- 모든 업데이트를 각 레인에서 처리한 후 커밋 단계로 진입해 변경 사항을 DOM에 적용하고 부작용 실행하며 마무리 작업 수행

## 7.6 useTransition
- 상태 업데이트의 우선순위를 관리하고 우선순위가 높은 업데이트로 인해 UI가 응답하지 않는 것을 방지하는 리액트 훅
- 새로운 데이터를 로드하거나 여러 페이지를 이동하는 등 시각적으로 혼란을 줄 수 있는 업데이트를 처리할 때 유용

## 7.7 useDeferredValue
- 특정 UI 업데이트를 나중으로 미루는 데 사용되는 리액트 훅으로, 애플리케이션이 과부하 작업이나 연산 집약적 작업을 처리할 때 유용
- 초기 렌더링 중에 반환되는 지연된 값은 인수로 전달된 값과 동일함. 이후 업데이트에서는 UseDeferredValue가 오래된 값을 더 오래 유지하고 새 값으로 업데이트할 시점을 제어해 부드러운 사용자 경험을 유지하게 함
- 값이 바뀌어도 매번 새롭게 리렌더링되지 않고 새 값으로 업데이트 될 시점을 제어해 한번에 새 값으로 업데이트 되게 함

```js
// useDeferredValue의 첫 구현
function useDeferredValue(value){
  const [newValue, setNewValue] = useState(value)
  useEffect(() => {
    startTransition(() => {
      setNewValue(value)
    })
  }, [value]);

    return newValue
}
```

### 7.7.1 UseDefferedValue의 사용 목적
- 덜 중요한 업데이트의 렌더링을 지연하는 것(서버에서 가져온 데이터 표시 같은 덜 중요한 걸 사용자 입력보다 지연)
- 부하가 많거나 복잡한 작업을 처리하는 상황에서도 사용자에게 부드러운 경험을 제공
- useDeferredValue에서는 지연된 렌더링을 중단하고 즉시 렌더링할 수 있는 방법을 제공
- debounce와 throttleing은 네트워크 요청 빈도를 줄이는 데 효과적이므로 useDeferredValue와 함께 사용해 종합적인 최적화를 달성할 수도 있음

### 7.7.2 useDeferredValue의 사용 시기
- useDeferredValue 사용을 고려할만한 사례
  - 대규모 데이터를 검색하거나 필터링할때
  - 복잡한 시각화나 애니메이션을 렌더링할때
  - 백그라운드에서 서버의 데이터를 업데이트할때
  - 사용자 상호 작용에 영향을 미칠 수 있는 연산 집약적 작업을 처리할 때

### 7.7.3 useDeferredValue가 적합하지 않은 경우
- 이 업데이트가 사용자 입력에 의한 것인가? 를 생각해야함 -> 사용자가 즉각적인 반응을 기대할만한 업데이트는 지연하면 안됨

## 7.8 동시성 렌더링 관련 문제
- 업데이트 처리 순서를 예측하기 어렵다는 것은 예기치 않은 동작과 버그를 유발할 수 있음
- 티어링 - 업데이트 순서가 어긋나면서 UI가 일관성을 잃게되는 문제

### 7.8.1 티어링
- 동기식 세계에서는 리액트가 컴포넌트 트리를 따라 위에서 아래로 이동하며 한 컴포넌트씩 차례로 렌더링하므로 UI가 일관성을 잃지 않음
- setInterval을 사용해 카운트를 증가시키는 예가 있다면 리액트 렌더링 주기와 관계 없이 setInterval이 호출되므로 UI가 일관성을 잃게 됨
- 티어링 문제를 해결하기 위해 리액트는 useSyncExternalStore 훅을 제공

**useSyncExternalStore**
- 애플리케이션의 내부 상태와 외부 상태를 동기화하는 리액트 훅
- 외부 저장소에 변화가 발생할 때 동기적으로 업데이트를 강제해 일관성을 유지한다는 뜻

```js
const value = useSyncExternalStore(store.subscribe, store.getSnapshop);
```

- store.subscribe
  - 유일한 인수로 콜백 함수를 받는 함수 -> store의 상태가 변경될 때마다 호출됨
  - 이 함수를 실행하면 정리 함수를 반환하는데 반환된 함수를 실행하면 구독이 취소됨

```js
const store = {
    subscribe(rerender){
        const newData = getNewData().then(rerender);
        return () => {
        }
    }
}

const store = {
    subscribe(rerenderImmediately){
        window.addEventListener('resize', rerenderImmediately);
      return () => {
        window.removeEventListener('resize', rerenderImmediately);
      }
    }
}
```

- store.getSnapshot
  - 외부 저장소의 현잿값을 반환하는 함수
  - 컴포넌트가 렌더링될때마다 호출되며, 반환된 값은 컴포넌트의 내부 상태를 업데이트하는 데 사용됨

```js
const store = {
    subscribe(immediatelyRerenderSynchronously){
        window.addEventListener('resize', immediatelyRerenderSynchronously);
          return () => {
                window.removeEventListener('resize', immediatelyRerenderSynchronously);
            }
    },
  getSnapshot(){
    return window.innerWidth;
  }
}
```