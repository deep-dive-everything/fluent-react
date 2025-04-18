# 1. 입문자를 위한 지식

## 1.1 리액트는 왜 필요한가요?

- 업데이트 : 새 페이지가 렌더링 되고 로딩되는걸 기다릴 필요 없이 즉시 업데이트 내용을 확인하고싶음.
- 즉각적 업데이트를 대규모로 수행하기 어려운 이유
    - 성능 : 웹페이지를 업데이트하면 브라우저가 페이지 레이아웃을 대신 계산하고 그리기 때문에 성능 병목현상 발생
    - 신뢰성 : 상태를 추적해 일관적으로 유지하기 어려움. 여러사람이 같은 코드베이스에서 작업할경우 어려움 up
    - 보안 : XSS및 CSRF같은 악용을 방지하기 위해 HTML과 JS를 모두 소독해야함.

## 1.2 리액트 이전의 세계

- 상태 처리의 어려움
    - 하나의 UI요소의 이벤트로 발생할 수 있는 여러 케이스를 대비하기 위한 상태 처리를 위해 html과 js에서 각 상태에 대한 속성을 추가해가면서 작업해야함.
        
        ⇒ 리액트는 상호작용이 필요한 UI를 많이 만들고 간단하고 효율적인 방식으로 이벤트에 반응해 UI를 업데이트함. 테스트 재연이 가능하고 선언적이고 성능이 뛰어나며 예측가능한 방식으로 수행.
        
        ⇒ 리액트는 UI상태를 완전히 제어하고 그 상태를 기반으로 렌더링 함으로 상태 예측이 훨씬 용이함
        
    - 확장하려는 애플리케이션 구축시 어려움
        - 오류가 쉽게 생김 : onsubmit, addEventListner 속성의 불완전함
        - 예측이 불가하다 : 다뤄야 할 요소가 JS와 HTML양쪽에 존재하는 경우.
        - 비효율적이다 : 반복되는 UI항목을 순차적으로 화면에 렌더링함. 성능과 비용 문제 발생.
    
    ⇒ 이런 문제들로 인해 안정적이고 확장 가능한 UI를 만들기 어려웠고, 리액트를 비롯한 추상화 도구의 필요성이 제기됨.
    

### 1.2.1 jQuery

- jQuery는 UI자체를 직접 조작함.
- side effect를 야기하기 쉬움 : 코드의 어느곳에서든 페이지 구조를 직접 또는 전역적으로 수정할 수 있기 때문. 페이지 일부를 변경하면 예상치 못한 다른 부분에도 영향을 미쳐 상호 작용이 복잡하고 동작을 파악하기 난해해짐.
- 유지보수와 디버깅이 어려워짐
- 테스트가 까다로움 : jQuery가 추가하는 동작은 격리하기 어려움
- 브라우저 환경에 크게 의존함.
- 크기 및 로딩시간 : jQuery 라이브러리를 웹 프로젝트에 통합하면 애플리케이션의 성능과 모바일 사용자의 경험에 부정적 영향을 미칠 수 있음.
- 최신 브라우저와의 중복성 : 과거 jQuery 에서만 지원하던 일관된 DOM조작이나 데이터 로딩 관련 네트워크 등이 최신 브라우저에서 기본적으로 지원되며 동일한 방식으로 동작함.
- 성능 고려 사항 : 네이티브 자바스크립트 메서드가 개선되어서 jquery의 비슷한 메서드 성능을 추월했음. 크고 복잡한 규모의 애플리케이션에서는 이 복잡성이 누적되어 눈에 띄게 버벅이거나 응답성이 저하될 수 있음.

### 1.2.2 Backbone

- MVC 패턴
    - 모델 : 애플리케이션의 데이터와 비즈니스 규칙을 담당함. 비즈니스 로직을 UI에서 분리함
    - 뷰 : UI를 나타냄. 모델이 제공한 데이터를 사용자에게 표시하고 사용자 명령을 컨트롤러로 전송함. 데이터를 직접 가져오거나 저장하지 않음. 자체적으로 사용자 상호 작용을 처리하지 않고 컨트롤러에 위임함.
    - 컨트롤러 : 모델과 뷰 사이의 인터페이스 역할.
- MVC패턴의 한계
    - 복잡한 상호 작용 및 상태 관리
        - 대화형 요소가 많은 복잡한 UI를 다룰때 어려움. 늘어난 컨트롤러로 인해 상태변경과 UI의 다양한 부분에 미치는 영향을 관리하기 어려움.
        - 리액트는 UI컴포넌트가 입력(프롭)을 받고 그 입력에 따라 출력(엘리먼트)을 반환하는 함수와 같다고 가정해 상태 변화와 그 영향을 쉽게 파악할 수 있음.
    - 양방향 데이터 바인딩
        - MVC는 양방향 데이터 바인딩을 사용하기 때문에 주의해야함. 뷰가 모델과 동기화 되지 않거나 모델이 뷰와 동기화되지 않기도함.
        - 리액트는 단방향 데이터 흐름이라는 패턴을 활용함. 리액트 컴파일러로 단방향 데이터 흐름의 우선순위를 정하고 강제함. UI의 예측 가능성을 높이고 관심사를 명확하게 분리해줌
    - 강한 결합
        - 모델, 뷰, 컨트롤러의 강한 결합으로 독립적으로 하나만 변경하거나 리팩토링 어려움
        - 리액트는 컴포넌트 기반 모델을 통해 더 모듈화 되고 분리된 접근 방식 장려
- Backbone 의 특징
    - 모델, 뷰와 작업할 수 있는 API를 제공하고 모델과 뷰를 연결하는 방법을 제시함. 확장 가능, 개발자가 코드를 격리해 테스트 가능
- Backbone의 단점
    - 장황한 코드 및 보일러 플레이트 코드
    - 양방향 데이터 바인딩 부족
    - 이벤트 중심 아키텍처
    - 조합성 부족

### 1.2.3 Knockout

- MVVM 패턴
    - 모델
        - 뷰 및 뷰모델을 인식하지 못합니다.
    - 뷰
        - 애플리케이션 UI표시
    - 뷰 모델
        - 모델과 뷰 사이의 다리 역할
        - 뷰에 바인딩할 데이터와 명령 제공
        - 명령 패턴 통해 사용자 입력 처리
- MVVM 패턴의 장점
    - 테스트 가능성 : 뷰에서 뷰모델을 분리하면 UI를 포함하지 않고도 단위 테스트를 쉽게 작성 가능
    - 재사용성 : 뷰모델을 여러 뷰 또는 플랫폼에서 재사용 가능
    - 유지 보수성 : 명확한 분리를 통해 코드를 관리, 확장, 리팩토링 하기 더 쉬워짐
    - 데이터 바인딩 : 데이터바인딩을 지원하는 플랫폼에서 좋은 성능. UI 업데이트에 필요한 보일러플레이트 코드의 양을 줄임
- MVC와 MVVM패턴의 차이점 : 결합과 바인딩
- Knockout 의 특징
    - 뷰모델에 HTML요소를 바인딩하면서 사용자와 상호작용
    - UI를 업데이트할때 많은 보일러플레이트 코드가 필요함. 리팩터링과 코드 최적화과 불확실해짐.

### 1.2.4 앵귤러JS

- 양방향 데이터 바인딩
    - 모델이 변경되면 뷰도 변경사항을 반영하도록 자동으로 업데이트 (jquery 는 개발자가 수동으로)
- 모듈식 아키텍처
    - 애플리케이션의 구성 요소를 논리적으로 분리할 수 있음.
- 의존성 주입
    - 서비스를 의존성으로 선언해두기만 하면 서비스를 생성하고 주입하는 작업은 앵귤러 js가 처리함. 의존성 관리가 간소화 되고 컴포넌트의 테스트 가능성과 재사용성이 향상됨.
- Backbone과 Knockout 비교
    - 코드 통제 유연성 : Backbone은 유연성을 허용하는 대신 보일러플레이트 코드가 많이 필요함. 앵귤러js는 양방향 데이터바인딩과 의존성주입을 통해 구조화된 개발이 가능하고 작업 속도가 높아짐.
    - 뷰를 변경하는 규칙 : Backbone은 변경 방법에 대한 규칙이 없음. 앵귤러js는 양방향 데이터바인딩
    - knockout : 데이터 바인딩에 중점을 두었지만 앵귤러js의 의존성 주입, 모듈식 아키텍처등의 도구는 없음.
- 앵귤러JS 트레이드오프
    - 성능
    - 복잡성
    - 앵귤러 2+로의 마이그레이션 문제
    - 복잡한 템플릿 문법
    - 타입 안정성 부재
    - 혼동되는 $scope 모델
    - 제한적인 개발 도구

## 1.3 리액트 등장

- 컴포넌트 기반
- 단방향 데이터 흐름 패턴 도입 : 개발자의 애플리케이션 제어 용이, 데이터 변화 추적 용이
- 가상 DOM : DOM을 직접 조작할 때 성능문제와 일관성 없는 상태 문제 해결

### 1.3.1 리액트의 핵심 가치

- 선언적 코드와 명령형 코드
    - DOM에 대한 선언적 추상화 제공
    - 보고자하는 것을 코드로 표현하는 방법 제공, 어떻게 할지는 리액트가 알아서 함
    - 리액트 엘리먼트를 내부에서 생성해 식별자를 읽을 필요 없음.
    - 컴포넌트의 역할 : UI에서 이 영역이 어떤 모습이어야 하는지에 대한 설명 반환. 가상 DOM을 사용해 이루어짐
- 가상 DOM
    - 실제 DOM을 자바스크립트 객체로 표현하는 프로그래밍 개념
    - 컴포넌트의 변경사항을 추적하고 필요할때만 다시 렌더링함. 변경사항이 있을떄마다 전체 트리를 업데이트하는것보다 효율적
    - 재조정 : 새로운 가상 DOM과 이전 가상 DOM을 비교하는 과정. 실제 업데이트 할 부분 결정.
- 컴포넌트 모델
    - DRY : 한 곳만 수정해도 재사용된 모든 곳이 한번에 수정됨.
    - Keying : key프롭으로 컴포넌트를 반복해서 식별하고 업데이트를 추적하여 메모화, 일괄처리, 최적화 작업 등 성능 작업을 쉽게 수행하고 컴포넌트를 쉽게 추적함.
    - composition : 관심사를 분리하고 로직이 영향을 미치는 UI에 관련 로직을 더 가깝게 배치. 이렇게 여러 컴포넌트를 조합해 사용하는 방식
    - 모듈성 향상, 디버깅 용이, 코드 재사용성 향상, 효율성 향상
- 불변 상태
    - 애플리케이션 상태를 불변하는 값의 집합으로 기술하는 패러다임 강조
    - 상태 업데이트는 새로운 독립된 스냅숏과 메모리 참조로 취급됨
    - 불변성을 강제함으로 UI컴포넌트가 특정 시점의 특정 상태를 반영하도록 보장
        
        ⇒ 변경사항 추적, 디버깅 용이, 애플리케이션 동작 이해
        
    - 하나의 상태가 다른 상태 업데이트를 손상시킬 위험 없음. 상태 관리를 더 잘 예측하게 되어 복잡한 상태 변환을 할때 애플리케이션 성능 향상됨
    - 불변 데이터 흐름의 명확성은 애플리케이션 작동 방식을 더 쉽게 이해할 수 있는 형태로 단순화.
    - 최신 함수형 프로그래밍 원칙에 부합, 효율적인 UI업데이트, 성능 최적화, 버그 발생 가능성 감소, 전반적인 개발자 경험 개선

### 1.3.3 플럭스 아키텍처

- 클라이언트 측 웹 어플리케이션 구축을 위한 아키텍처 디자인 패턴
- 단방향 데이터 흐름을 강조해 애플리케이션 데이터의 흐름을 예측가능하게 함
- 액션
    - 새 데이터와 액션의 종류를 식별하는 속성을 포함하는 단순 객체
    - 사용자 상호작용, 서버응답, 양식 입력 등 시스템 내외부 입력 표현
- 디스패처
    - 액션을 받아서 애플리케이션에 등록된 스토어로 보냄.
    - 스토어 디스패처 콜백 목록 관리
    - 액션을 디스패칭하면 등록된 모든 콜백으로 액션 전송
- 스토어
    - 애플리케이션 상태와 로직 포함
    - 스토어 자신을 디스패처에 등록, 액션 처리하는 콜백 제공.
    - 스토어 업데이트시 변경 이벤트를 발생시켜 뷰에 변경 사항 알림
- 뷰
    - 리액트 컴포넌트. 스토어에서 변경 이벤트를 받으며 의존하는 데이터가 변경되면 스스로 업데이트

### 1.3.4 플럭스 아키텍처의 장점

- 단일 정보 출처
    - 애플리케이션 상태에 대한 단일정보출처가 스토어에 저장되는 것이 중요
    - 서로 의존적인 다수의 정보 출처에서 발생할 수 있는 복잡성 제거
    - 중앙 집중식 상태관리로 애플리케이션 동작 예측 가능, 버그나 상태 불일치 문제 방지
- 테스트 가능성
    - 플럭스의 잘 정의된 구조와 예측 가능한 데이터 흐름으로 애플리케이션의 테스트 가능성을 높임
    - 관심사를 분리해 각 부분을 독립적인 단위테스트 가능
- 관심사 분리
    - 액션, 디스패쳐, 스토어, 뷰등으로 관심사 분리가 명확함
    - 시스템 모듈화로 유지 보수용이, 파악하기 쉬움.

# 2. JSX

- JSX : 자바스크립트의 확장 구문. 자바스크립트 XML이라고도 함.

## 2.1 자바스크립트 XML?

- JSX : 자바스크립트 코드 내에서 HTML과 유사한 코드를 작성할 수 있게 하는 자바스크립트용 구문 확장자.
- 별도의 언어가 아니라 컴파일러나 트랜스파일러에 의해 일반 자바스크립트로 변환되는 확장 구문
- HTML과의 차이점
    - 중괄호를 사용해 HTML과 유사한 코드 내에 자바스크립트 표현식을 삽입함
    - 카멜케이스로 작성
- React에서 JSX로 작성할 때 가독성과 유지보수성이 향상됨

## 2.2 JSX의 장점

- 더 쉬운 읽기 및 쓰기
- 향상된 보안 : 데이터 소독을 통해 위험한 문자가 HTML문자열에 포함된 경우 컴파일 할 때 다른 문자로 변환
- 강력한 타이핑 : JSDoc스타일 주석, propTypes로 타입 안정성을 향상
- 컴포넌트 기반 아키텍쳐
- 광범위한 사용 : 리액트 아닌 라이브러리와 프레임워크에서도 사용됨

## 2.3 JSX의 약점

- 학습 곡선 가중
- 전용 도구 필요 : 일반 자바스크립트 코드로 컴파일 하기 위한 추가 개발도구 필요
- 관심사 혼합 : 표현과 논리를 분리하기 어렵다는 지적
- 자바스크립트 호환성 부족 : 인라인 표현식은 지원하지만 인라인 블록은 지원하지 않음

## 2.4 내부 동작

### 2.4.1 코드는 어떻게 작동하나요?

- 컴파일러 : 특정 규칙에 따라 고급 프로그래밍 언어로 작성된 소스 코드를 구문 트리로 변환하는 소프트웨어
- 구문 트리 : 자바스크립트 객체같은 트리 자료 구조
- 컴파일 3단계
    1. 토큰화
        - 문자열을 의미 있는 토클으로 분해하는것
        - 렉서 : 토큰이 부모나 자식에 관한 상태를 포함하고, 상태를 가지고 있는 토크나이저
        - 렉싱 : 상태를 가지는 토큰화
        - 렉서 규칙 : 정규 표현식을 사용해 프로그래밍 언어에서 변수 이름, 객체 키 및 값 같은 주요 토큰을 감지함.
        - 문자열이 토큰화되거나 렉싱되면 다음 단계인 구문화로 넘어감
    2. 구문 분석
        - 토큰을 가져와 구문 트리로 변환하는 과정
    3. 코드 생성
        - 컴파일러가 추상구문트리(AST)에서 기계어를 생성하는 과정
        - 기계어는 이후 자바스크립트 엔진에 의해 실행됨
- 컴파일러의 종류
    - 네이티브 컴파일러
    - 크로스 컴파일러
    - JIT 컴파일러
    - 인터프리터
- 웹 브라우저를 비롯해 최신 환경에서는 JIT컴파일러를 많이 사용함.
- 런타임 : 엔진과 연동해 환경에 맞는 콘텍스트 헬퍼와 기능을 더 많이 제공함. (구글 크롬의 크로미움)

### 2.4.2 JSX로 자바스크립트 구문 확장하기

- 자바스크립트 구문을 확장하려면 새로운 구문을 이해하는 다른 엔진이 필요하거나 엔진보다 앞서 새로운 구문을 처리해야함
- 트랜스파일 : 코드를 변환한 뒤 컴파일함. 엔진보다 앞서 구문을 처리하도록 함.
- JSX는 브라우저에서 직접 사용할 수 없고 바벨과 같은 구문 분석기를 통해 구문 트리로 컴파일 하는 빌드 단계가 필요함. 이 코드는 바닐라JS로 변환되어 최종 배포용 번들에 포함됨

## 2.5 JSX 프라그마

- 언어 자체에 내포된 것 이상의 추가 정보를 컴파일러에 제공할 때 사용하는 컴파일러 지시어
- use strict 프라그마

```jsx
<MyComponent prop="속성값">콘텐츠</MyComponent>
```

## 2.6 표현식

- 엘리멘트 트리 내에서 코드를 실행하는 것.
- 목록 반복, 삼항 연산자를 사용한 조건 검사, 문자열 치환등의 표현식을 실행할 수 있음.
- 표현식은 평가되지만 문장은 평가되지 않음.
