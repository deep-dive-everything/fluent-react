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
  const exportedStuff = await import(
    join(process.cwd(), "pages", req.params.route)
  );

  const Page = exportedStuff.default;

  // 컴포넌트의 데이터를 가져오기
  const data = await exportedStuff.getData();
  const props = req.query;

  res.setHeader("Content-Type", "text/html");
  // 프롭과 데이터 전달 (다시 list로 가봅시다. getData를 만들어줘야해요!)
  res.end(createLayout(renderToString(<Page {...props} {...data.props} />)));
})


// 	로컬에서 http://localhost:3000으로 서버를 실행합니다.
app.listen(3000, () => {
  console.info("App is listening")
})