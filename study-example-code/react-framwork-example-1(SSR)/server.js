import express from "express"
// 간단한 설명을 위해 renderToString을 사용했으나, 실제 프로덕션 환경에서는 renderToPipeableStream 등을 권장
import {renderToString} from "react-dom/server" 

import { List } from "./List"
import { Detail } from "./Detail"

const app = express();

app.use(express.static("./dist")) // 클라이언트 JS와 같은 정적 파일 가져오기

// SSR된 React 컴포넌트를 받아 전체 HTML 페이지로 감싸는 역할.
const createLayout = (children) => `<html lang="en">
<head>
</head>
<body>
  ${children}
  <script src="/clientBundle.js"></script>
</body>
</html>`;

// 클라이언트 측의 index.js 자체에도 클라이언트 라우터가 있고, 서버를 위해서는 다른 종류의 라우터를 추가했습니다.
// (대부분의 프레임워크는 클라이언트와 서버 모두에서 작동하는 동형 라우터를 제공합니다.)
// 라우팅의 확장성이 좋지 않으니 react-framework-example-2의 server.js로 이동합시다!
// 파일 시스템 기반 라우팅 역시 적용해볼 겁니다.
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(createLayout(renderToString(<List />)));
})

app.get("/detail", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(createLayout(renderToString(<Detail thingId={req.params.thingId} />)));
})

// 	로컬에서 http://localhost:3000으로 서버를 실행합니다.
app.listen(3000, () => {
  console.info("App is listening")
})