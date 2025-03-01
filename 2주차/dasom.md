# 2장 JSX

2025.03.01 Dasom

## 2.1 자바스크립트 XML?

JSX는 자바스크립트의 확장 구문(eXtension)으로, XML과 유사한 문법을 자바스크립트 코드 내에서 사용할 수 있도록 함. JSX는 별도의 언어가 아닌 **자바스크립트 코드로 변환되는 문법**이며, 컴파일러(주로 Babel)를 통해 변환됨.

JSX와 HTML의 차이

- JSX는 중괄호 `{}` 를 사용하여 표현식을 삽입할 수 있음
- JSX의 속성은 **카멜 케이스(camelCase)** 를 따름 (예: `onClick` vs HTML의 `onclick`)
- JSX는 XML과 유사하지만 `class` 대신 `className`을 사용함

```
const MyComponent = () => (
  <section id="list">
    <h1>내가 만든 목록!</h1>
    <p>대단하지 않나요? 멋진 것들이 모여 있습니다</p>
    <ul>
      {amazingThings.map((t) => (
        <li key={t.id}>{t.label}</li>
      ))}
    </ul>
  </section>
);
```

위 JSX 코드는 `React.createElement`를 사용하여 다음과 같이 변환됨.

```
const MyComponent = () =>
  React.createElement(
    "section",
    { id: "list" },
    React.createElement("h1", {}, "내가 만든 목록!"),
    React.createElement("p", {}, "대단하지 않나요? 멋진 것들이 모여 있습니다"),
    React.createElement(
      "ul",
      {},
      amazingThings.map((t) =>
        React.createElement("li", { key: t.id }, t.label)
      )
    )
  );
```

## 2.2 JSX의 장점

- **가독성 향상**: HTML과 유사한 문법으로 더 직관적인 코드 작성 가능
- **보안성 강화**: JSX 코드가 변환되면서 XSS 공격을 방지할 수 있도록 처리됨
- **타입 안정성**: `propTypes`나 TypeScript와 결합해 안전한 코드 작성 가능
- **컴포넌트 기반 개발**: UI를 작은 단위의 컴포넌트로 나눠 재사용성과 유지보수성을 높일 수 있음
- **다양한 환경에서 사용 가능**: React 외에도 다양한 라이브러리와 프레임워크에서 활용 가능

## 2.3 JSX의 약점

- **학습 곡선**: JSX는 JavaScript의 표준 문법이 아니므로 추가 학습이 필요함
- **빌드 과정 필요**: 브라우저가 JSX를 직접 실행할 수 없기 때문에 Babel 등의 트랜스파일러가 필요함
- **관심사의 혼합**: HTML과 JavaScript가 함께 포함되므로, 일부 개발자에게는 코드의 역할이 명확하지 않을 수 있음
- **자바스크립트의 일부 문법과 호환되지 않음**: JSX 내부에서 `if`, `switch` 같은 명령문을 사용할 수 없음

## 2.4 내부 동작

### 2.4.1 코드는 어떻게 작동하나요?

컴퓨터가 코드를 해석하고 실행하기 위해서는 **컴파일러를 통해 고급 프로그래밍 언어로 작성된 소스 코드를 구문 트리로 변환**하는 과정이 필요함.

컴파일러의 변환 과정

- **토큰화**: 문자열을 의미 있는 토큰으로 분해하는 과정
- **구문 분석**: 토큰을 구문 트리로 변환
- **코드 생성**: AST(추상 구문 트리)에서 기계어를 생성

이 과정이 끝나면 자바스크립트 엔진이 코드를 실행함.

### 2.4.2 JSX로 자바스크립트 구문 확장하기

JSX는 브라우저에서 직접 실행할 수 없기 때문에 **빌드 단계**가 필요함. 이 과정에서 JSX가 바닐라 JS로 변환됨. 이를 **트랜스파일(transpile)** 이라고 부름.

JSX의 트랜스파일링을 담당하는 주요 도구는 Babel이며, TypeScript, SWC(Speedy Web Compiler) 같은 대체 도구도 있음.

## 2.5 JSX 프라그마

JSX 프라그마는 JSX가 변환될 때 호출할 함수를 변경할 수 있도록 해줌. 기본적으로 JSX는 `React.createElement`로 변환됨.

프라그마를 변경하면 React 없이 JSX를 사용할 수도 있음.

```
/** @jsx customCreateElement */
const element = <MyComponent prop="값">내용</MyComponent>;
```

위 코드는 다음과 같이 변환됨.

```
customCreateElement(MyComponent, { prop: "값" }, "내용");
```

## 2.6 표현식

JSX는 표현식을 사용할 수 있지만, `if`, `switch` 같은 명령문은 JSX 내부에서 사용할 수 없음.

```
const value = 10;
const MyComponent = () => <p>{value > 5 ? "큰 값" : "작은 값"}</p>; // 가능
```

그러나 블록 문장은 JSX 내부에서 사용할 수 없으므로 아래 코드는 에러 발생.

```
const MyComponent = () => (
  <p>
    {if (value > 5) {
      "큰 값";
    }}
  </p>
); // 불가능
```

이 경우, JSX 외부에서 변수를 선언한 후 JSX 내부에서 사용할 수 있음.

```
const MyComponent = () => {
  let message;
  if (value > 5) {
    message = "큰 값";
  } else {
    message = "작은 값";
  }
  return <p>{message}</p>;
};
```

