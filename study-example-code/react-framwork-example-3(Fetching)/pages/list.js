import React, { useState, useEffect } from 'react'

export default function List({initailThings} /** <- 여기에 초기 프롭 설정 */) {
  // 위에서 초기 프롭을 추가했으므로 페이지를 렌더링하기 전에 서버에서 필요한 데이터를 가져오고,
  // 이 데이터를 컴포넌트에 전달하면 됩니다! server.js로 다시 가봅시다
  const [things, setThings] = useState([])
  const [requestState, setRequestState] = useState('initial')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initailThings) return
    setRequestState("loading")
    getData() // 이 부분은 아래의 함수를 참고해주세요!
      .then(() => {
        setRequestState("success")
      })
      .catch((e) => {
        setRequestState("error")
        setError(e)
      })
  }, [initailThings])

  return (
    <div>
      <ul>
        {things.map((thing) => (
          <li key={thing.id}>{thing.id}</li>
        ))}
      </ul>
    </div>
  )
}

// 서버에서 호출되어 props 속성의 값을 컴포넌트에 전달하는 역할을 합니다.
export const getData = async() => {
  return {
    props: {
      initailThings: await fetch("https://api.com/get-list")
      .then((r) => r.json())
    }
  }
}



/**
 * 결과적으로 3가지 문제를 해결했으며 이 3가지 기능은 다양한 프레임워크들이 공통으로 제공하는 기능입니다.
 * 다시 markdown으로 돌아갑니다!
 */