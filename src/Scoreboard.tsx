import React, { useState, useEffect } from 'react'
import { ref, query, limitToLast, onChildAdded } from "firebase/database"
import { db } from './firebaseconfig'

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
    <div className="scoreboard" style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2 style={{ marginBottom: '10px' }}>Recent Coinflips</h2>
      {results.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {results.map((result, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>
              {result.side} - Wager: {result.wager} - 
              {result.win ? <span style={{ color: 'green' }}>Won {result.payout}</span> : <span style={{ color: 'red' }}>Lost</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent coinflips to display.</p>
      )}
    </div>
  )
}
