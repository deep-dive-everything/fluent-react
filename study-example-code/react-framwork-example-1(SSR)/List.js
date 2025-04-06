import React, { useState, useEffect } from 'react'

const List = () => {
  const [things, setThings] = useState([])
  const [requestState, setRequestState] = useState('initial')
  const [error, setError] = useState(null)

  useEffect(() => {
    setRequestState("loading")
    fetch("https://api.com/get-list")
      .then((r) => r.json())
      .then(() => {
        setRequestState("success")
      })
      .catch((e) => {
        setRequestState("error")
        setError(e)
      })
  }, [])

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

export default List