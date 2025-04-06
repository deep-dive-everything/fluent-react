// 해당 코드 파일은 예시 코드만 작성된, 실제 리액트 앱이 아닙니다.
import React from 'react';
import ReactDOM from 'react-dom/client';
import List from './List';
import Detail from './pages/Detail';

const root = ReactDOM.createRoot(document);
const params = new URLSearchParams();
const thingId = params.get("id")

root.render(
  window.location.pathname === '/' ? <List /> : <Detail thingId={thingId} />
);
