import React, { useState, useEffect } from 'react'

const Detail = ({thingId}) => {
	const [thing, setThing] = useState([])
	const [requestState, setRequestState] = useState("initial")
	const [error, setError] = useState(null)

	useEffect(() => {
		setRequestState("loading")
		fetch("https://api.com/get-list" + thingId)
			.then((r) => r.json())
			.then(setThing)
			.then(() => {
				setRequestState("success")
			})
			.catch((e) => {
				setRequestState("error")
				setError(e)
			})
	}, [])

	return(
		<div>
			<h1>The Thing!</h1>
			{thing}
		</div>
	)
}

export default Detail