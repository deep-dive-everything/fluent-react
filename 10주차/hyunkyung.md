# 10장 리액트 대체제
## 10.1 뷰
- 앵귤러의 좋은 부분을 가져와 더 가볍고 유지보수가 용이하며 특정 방식에 얽매이지 않는 패키지
- 뷰의 반응형 시스템
  - 컴포넌트 상태는 반응형 자바스크립트 객체로 구성됨. 이를 수정하면 뷰가 업데이트 됨
  - 객체 속성의 읽기 및 쓰기를 가로챔

**reactive와 ref란**
```js
// reactive란?
// 반응형 객체 -> 주로 객체와 배열에 적합
const userState = reactive({
  profile: {
    name: '홍길동',
    address: { city: '서울', district: '강남구' }
  },
  preferences: { theme: 'dark' }
});

// 어떤 수준의 중첩 속성도 반응형으로 작동
userState.profile.address.district = '마포구'; // 자동 감지

// ref란?
// 참조형 객체를 감싸는 객체 -> 주로 원시값에 적합

const userName = ref('홍길동');
const userAge = ref(30);
// ref는 원시값을 감싸는 객체로, value 속성을 통해 원시값에 접근
userName.value = '김철수'; // 자동 감지
```

```js

function reactive(obj){
    return new Proxy(obj, {
        // proxy를 통해 해당 객체의 모든 get 및 set 작업을 가로챔
        get(target, key){
           track(target, key)
           return target[key]
        },
        set(target, key, value){
            target[key] = value
            trigger(target, key)
}
})
}


function ref(value){
    // 원시값을 객체로 래핑하여 캡슐화
    // 해당 객체에 value로 접근하거나 수정할 수 있음 
    const refObject = {
       get value(){
           track(refObject, 'value')
           return value
       },
      set value(newValue){
              value = newValue
              trigger(refObject, 'value')
       }
}
    return refObject
}
```

- vue3에서는 반응형 객체(reactive)에 proxy를 사용하고 참조(ref)에는 getter와 setter를 사용
  - vue2는??? proxy를 사용할 수 없었음 
    - 이유: proxy는 구버전 브라우저에서 지원되지 않음 -> proxy를 대신해 Object.defineProperty 사용 -> but 한계가 존재
  - vue3에서는 IE11을 지원하지 않기로 하고 proxy 사용

```js
// Vue 2에서 Object.defineProperty를 사용했을 때의 한계
const vm = new Vue({
  data: {
    user: {
      name: '김철수'
    }
  }
});

//Object.defineProperty()는 이미 존재하는 속성에만 getter/setter를 정의할 수 있어, 새로 추가되는 속성은 자동으로 반응형이 되지 않음
vm.user.age = 30; // ❌

// 대신 이렇게 해야 했음
Vue.set(vm.user, 'age', 30);
// 또는
this.$set(this.user, 'age', 30);
```

### 10.1.1 시그널
- 여러 프레임워크들이 시그널이라는 개념을 사용해 상태를 관리 [(시그널에 대한 소개)](https://soobing.github.io/react/introducing-signals/)
- Vue의 refs도 유사한 개념

### 10.1.2 단순성
- <script> 에 뷰 라이브러리를 포함하고 작성을 시작하면 됨

## 10.2 앵귤러
- 앵귤러는 구글이 만든 프레임워크로, 대규모 애플리케이션을 구축하는 데 적합
- 렌더링 및 상태 관리부터 라우팅, 폼 처리에 이르기까지 자체 방식을 제공하고 강력하게 권장
- 리액트와는 달리 변경 감지라는 시스템 사용

### 10.2.1 변경 감지
- 앵귤러가 애플리케이션의 상태가 변경되었는지 업데이트가 필요한 DOM이 있는지 확인하는 프로세스
- 주기적으로 변경 감지 메커니즘을 실행해 데이터 모델의 변경사항이 애플리케이션의 뷰에 반영되게 함
- 변경 감지 기능을 너무 자주 실행하면 속도가 느려질 수 있음(성능을 최적화하기 위해 동작을 세세하게 조정할 수 있는 방법 제공)
- 템플릿 구문을 사용해 DOM을 업데이트하는 방식(ngFor, ngIf 등)

### 10.2.2 시그널
- 기존의 변경 감지 방식인 더티 체킹을 포기하고 자체적으로 구현한 반응형 특성을 도입
```js
const count = signal(0); // 시그널 생성

count() // 시그널의 값에 접근
count.set(1); // 시그널의 값을 변경
count.update(prev => prev + 1); // 기존 값을 기반으로 시그널의 값을 업데이트

const state = signal({
  name: '홍길동',
  age: 30
});

state.mutate(prev => ({
  ...prev,
  age: prev.age + 1
})); // 시그널의 값을 업데이트
```

- 뷰 컴포넌트의 refs와의 차이점
  - ()는 .value보다 코드를 덜 쓰지만 값을 업데이트해야 하는 부분에서는 더 번잡
  - 참조 언래핑이 없음. 값에 접근하려면 항상 ()이 필요. 이를 통해 어디에서나 일관된 방식으로 값에 접근할 수 있고 시그널을 그대로 컴포넌트 프롭으로 전달할 수 있음 (Vue의 ref는 컴포넌트 사이에서 전달할 때 주의가 필요)

```js
<!-- Vue에서는 자동으로 언래핑됨 (count.value가 아닌 count) -->
<div>{{ count }}</div>

<!-- Angular에서는 항상 ()를 사용 -->
<div>{{ count() }}</div>
```

## 10.3 스벨트
- 기존 프레임워크와 달리 선언적 컴포넌트를 효율적인 명령형 코드로 변환하는 컴파일러를 사용해 DOM을 정교하게 업데이트
  - 더 적은 코드로 고성능의 반응형 웹 애플리케이션을 작성할 수 있음

```js
<script>
  let count = 0; // 상태 변수
    function increment() {
        count += 1; // 상태 업데이트
    }
</script>
<button on:click={increment}>Increment</button>
<p>Count: {count}</p>
```

- 세터함수를 호출하거나 특별한 API를 사용해 DOM을 업데이트할 필요가 없음

```js
<script>
  let count = 0; // 상태 변수
  let doubleCount = 0;

  // 반응형 데이터를 기반으로 값을 계산할 수 있는 반응형 문장 제공
  $: doubleCount = count * 2; // 반응형 선언
  
  function increment() {
      count += 1; // 상태 업데이트
  }
</script>
<button on:click={increment}>Increment</button>
<p>Double Count: {doubleCount}</p>
```

- 컴파일러 접근방식 장점
  - 가상 DOM 비교 및 페치 단계가 없기 때문에 런타임 성능이 향상됨 -> 대신 DOM을 직접 업데이트하는 코드를 생성
- 컴파일러 접근방식 단점
  - 동적 컴포넌트 타입과 같이 가상 DOM 기반 프레임워크에서 제공하는 일부 동적 기능은 표현이 더 번거롭거나 장황할 수 있음
  - 커뮤니티가 작고 생태계가 덜 성숙함

[Playground](https://svelte.dev/playground/reactive-assignments)

### 10.3.1 룬
- 룬은 스벨트 컴파일러에 영향을 주는 기호
- 스벨트는 현재 let, =, export 키워드, $: 레이블을 특정한 의미로 사용하고 있는데, 룬은 동일한 기능에 또 다른 기능을 추가하기 위해 함수 문법 사용
- 애플리케이션이 복잡해지면 반응형인 값과 그렇지 않은 값을 파악하기가 까다로울 수 있어 let 대신 $state 룬 사용
- 스토어 계약 구현시 룬을 사용하는 예시

```js
<script>
  let count = $state(0);
  
  function increment() {
    count += 1;
  }
</script>
<button on:click={increment}>Increment</button>
```

```js
import { writable } from 'svelte/store';

export function createCounter() {
  const { subscribe, update } = writable(0);

  return {
    subscribe,
    increment: () => update(n => n + 1)
  };
}

<script>
  import { createCounter } from './store.js';

  const counter = createCounter();
</script>

<button on:click={counter.increment}>+1</button>
<p>현재 값: {$counter}</p>
```

- 이때 더 복잡한 작업을 시작하면 스토어 API를 다루기가 어려워질 수 있음 -> 룬 사용

```js
export function createCounter() {
    let count = $state(0);

  return {
    get count() {
      return count;
    },
    increment: () => {
      count += 1;
    }
  };
}

<script>
  import { createCounter } from './store.js';

  const counter = createCounter();
</script>
<button on:click={counter.increment}>clicks: {counter.count}</button>
```

**런타임 반응성**
- $: 레이블을 사용하는 코드를 설정해 의존성이 변경될 때 자동으로 다시 실행되도록 하는 경우, 해당 의존성은 스벨트가 컴포넌트를 컴파일할 때 정해짐

```js
<script>
  export let width;
    export let height;
  
  //컴파일러는 width나 height가 변경될 때마다 이 코드를 다시 실행하도록 설정
    $: area = width * height;
  
  // area 값이 변경될떄마다 이 코드를 다시 실행하도록 설정
  $: console.log(area)
</script>
```

- 근데 만약 이렇게 리팩토링했을경우 height가 변경되어도 다시 실행되지 않을수도 있음
```js
const multiplyByHeight = (width) => width * height;
$: area = multiplyByHeight(width);
```

- svelte5에서 $derived, $effect 룬이 도입되어 표현식이 평가될 때 해당 표현식의 의존성을 대신 결정
```js
  const multiplyByHeight = (w) => w * height;
  const area = $derived(() => multiplyByHeight(width));
```

**시그널 도입**
- 스벨트 역시 시그널을 도입하였고 사용자가 직접 상호작용하지 않는 내부 구현으로 만들어짐

## 10.4 솔리드
- 사용자 인터페이스를 구축하기 위한 선언적 자바스크립트 라이브러리
- 컴포넌트 모델 기반을 제공한다는 점에서는 리액트와 유사하지만, 반응형 특성에 기반한다는 점이 다름
- 가상 DOM을 사용하는 대신 세분화된 반응형 시스템을 사용해 의존성을 자동으로 추적하고 DOM을 직접 업데이트

```js
import { createSignal } from 'solid-js';

function Component() {
  const [count, setCount] = createSignal(0); // 상태 변수

  function increment() {
    setCount(count() + 1); // 상태 업데이트
  }

  return (
    <div>
      <button onClick={increment}>Increment</button>
      <p>Count: {count()}</p>
    </div>
  );
}
```

- 리액트의 useState와 유사하지만 count가 현재값을 반환하고 반응형 콘텍스트에 대한 의존성을 암시적으로 등록함
- setCount가 호출되면 함수 컴포넌트를 다시 호출하지 않고 count에 의존하는 UI의 모든 부분에 대한 업데이트를 트리거
- 리액트는 거친 반응성, 솔리드는 세밀한 반응성
- 불필요한 업데이트를 최소화하여 성능이 더 뛰어나지만 커뮤니티가 작고 생태계가 덜 성숙함

## 10.5 퀵
- 웹 페이지 로딩을 최적화하고 사용자 상호 작용과 응답성을 우선시하도록 설계된 고유한 프레임워크
- 웹페이지를 컴포넌트의 집합으로 보고 네트워크를 통해 독립적으로 읽어들이고 필요에 따라 상호 작용할 수 있는 대상으로 취급
- 퀵으로 구축된 웹 애플리케이션과 사이트에는 일정한 양의 매우 작은 자바스크립트가 초기 상태로 제공되고 우선순위에 따라 컴포넌트를 추가로 읽어들임
- 재개가능성: 사용자에게 더 많은 상호작용이 필요해지기 전까지는 서버 렌더링 스냅샷이 제공됨
- 리액트나 다른 프레임워크들은 주의깊게 코드 분할을 하지 않으면 번들이 커질 수 있지만 퀵은 필요한만큼만 코드를 읽어들이므로 초기 로드 시간이 빨라짐
- 퀵도 다른 라이브러리들과 마찬가지로 성숙한 생태계가 조성되어 있지 않다는점이 단점

```js
export default component$(() => {
  const count = useSignal(0);

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
      <button onClick$={() => count.value--}>minus</button>
      <div>{count}</div>
      <button onClick$={() => count.value++}>plus</button>
    </div>
  );
});
```

- 재개가능성과 관련된 참고 링크
  - [하이드레이션은 트리이고, 재개 가능성(Resumability)은 맵입니다](https://velog.io/@superlipbalm/hydration-tree-resumability-map)
  - [차세대 프론트엔드 프레임워크: Qwik](https://sinnerr0.medium.com/%EC%B0%A8%EC%84%B8%EB%8C%80-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-qwik-47bdb5155d25)

## 10.6 자주 사용하는 패턴(공통점)
- 컴포넌트 기반 아키텍처
  - 컴포넌트 기반 아키텍처에서 UI는 개별 조각(컴포넌트)로 나뉘며 각 컴포넌트는 사용자 인터페이스의 특정 부분을 담당
  - 모듈화를 통해 코드 재사용, 관심사 분리, 유지 보수성 향상
- 선언적 구문
  - 개발자가 특정 상태에 대해 UI의 모양을 설정하면 프레임워크가 해당 상태에 맞게 UI를 업데이트
- 업데이트 기능 제공
  - 상태 변경에 대응해 UI를 효율적으로 업데이트하고 복잡한 DOM 조작 추상화
- 수명 주기 메서드
  - 컴포넌트 수명 주기에 맞게 함수를 호출하고 부작용을 처리하는 메서드 제공
- 생태계와 도구
  - 최신 자바스크립트의 기능과 도구+타입스크립트 지원

## 10.7 반응형이 아닌 리액트 
- 리액트가 상태 변경에 따른 반응형 동작을 하는 것처럼 보이지만 전통적인 의미의 반응형과 다름
- 거친 반응성: 상태 변경에 따라 변경된 부분이 아닌 전체 컴포넌트를 다시 렌더링
  - 리액트로는 업데이트를 자동으로 관리하지는 못하지만 명시적 상태 업데이트를 통해 애플리케이션의 상태를 더 쉽게 추론하며 효율적으로 업데이트를 적용할 수 있음

### 10.8 리액트의 미래
- 리액트의 거친 반응성은 상태와 관련없는 자식 컴포넌트까지 리렌더링시키는 경우가 있어 memo를 통해 성능 최적화가 필요
- 리액트 팀은 이 문제를 해결하기 위해 시그널을 도입하기보다는 리액트 컴파일러를 개발하여 해결하려함
  - 알아서 똑똑하게 메모이제이션을 해주는 도구