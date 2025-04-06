import express from "express"
import {join} from "path" // 추가됨!
import {renderToString} from "react-dom/server" 

const app = express();

app.use(express.static("./dist")) // 클라이언트 JS와 같은 정적 파일 가져오기

const createLayout = (children) => `<html lang="en">
<head>
</head>
<body>
  ${children}
  <script src="/clientBundle.js"></script>
</body>
</html>`;


app.get("/:route", async(req, res) => {
  // pages티렉터리에서 라우트 컴포넌트 가져오기
  const exportedStuff = await import(
    join(process.cwd(), "pages", req.params.route)
    // → process.cwd()는 현재 실행 중인 디렉토리 (예: 프로젝트 루트)
    // 결과적으로 pages/detail 또는 pages/list import하는 효과
  );

  // 예측 가능한 방법이 필요하니 이름 붙여서 내보내지 않고 디폴트로 보냅니다.
  // 이를 위해 각 컴포넌트는 디폴트로 내보내야 합니다. (지금까지 export default로 내보내고 있었습니다! 컴포넌트 참고)
  const Page = exportedStuff.default;

  // query 문자열에서 props를 짐작할 수 있을까요? (정답은 yes! {...props}로 보내고 있죠?)
  // 단 파라미터는 무조건 문자열로 가니 숫자를 전달한다면 파싱해줘야 할 겁니다.
  const props = req.query;

  res.setHeader("Content-Type", "text/html");
  res.end(createLayout(renderToString(<Page {...props} />)));
})
/**
 * 설명)
 * /detail, /list 같은 URL 요청이 들어오면
 * pages/detail.js, pages/list.js 파일을 동적으로 import 합니다.
 * 이제 마지막으로 네트워크 폭포 문제만 해결해봅시다! (example-3의 list로 가봅시다!)
 */


// 	로컬에서 http://localhost:3000으로 서버를 실행합니다.
app.listen(3000, () => {
  console.info("App is listening")
})