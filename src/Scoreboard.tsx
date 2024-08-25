import React, { useState, useEffect } from 'react'
import { ref, query, limitToLast, onChildAdded } from "firebase/database"
import { db } from './firebaseConfig'

interface CoinflipResult {
  timestamp: number
  side: string
  wager: number
  win: boolean
  payout: number
}

export const Scoreboard: React.FC = () => {
  const [results, setResults] = useState<CoinflipResult[]>([])

  useEffect(() => {
    const resultsRef = ref(db, 'coinflips')
    const recentResultsQuery = query(resultsRef, limitToLast(10))

    const unsubscribe = onChildAdded(recentResultsQuery, (snapshot) => {
      const resultData = snapshot.val() as CoinflipResult
      setResults(prevResults => [...prevResults, resultData].slice(-10))
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="scoreboard">
      <h2>Recent Coinflips</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            {result.side} - Wager: {result.wager} - 
            {result.win ? `Won ${result.payout}` : 'Lost'}
          </li>
        ))}
      </ul>
    </div>
  )
}
