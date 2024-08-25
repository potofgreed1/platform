import React, { useState, useEffect } from 'react'
import { ref, query, limitToLast, onChildAdded } from "firebase/database"
import { db } from './firebaseconfig'

interface FlipResult {
  timestamp: number
  userId: string
  side: string
  wager: number
  win: boolean
  payout: number
}

export const Scoreboard: React.FC = () => {
  const [results, setResults] = useState<FlipResult[]>([])

  useEffect(() => {
    const flipResultsRef = ref(db, 'flipResults')
    const recentFlipsQuery = query(flipResultsRef, limitToLast(10))

    const unsubscribe = onChildAdded(recentFlipsQuery, (snapshot) => {
      const flipData = snapshot.val() as FlipResult
      setResults(prevResults => [...prevResults, flipData].slice(-10))
    })

    return () => unsubscribe()
  }, [])

  const formatUserId = (userId: string) => {
    if (!userId) return 'Unknown'
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`
  }

  return (
    <div className="scoreboard" style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2 style={{ marginBottom: '10px' }}>Recent Flips</h2>
      {results.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {results.map((result, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              <div>User: {formatUserId(result.userId)}</div>
              <div>
                {result.side} - Wager: {result.wager} - 
                {result.win ? <span style={{ color: 'green' }}>Won {result.payout}</span> : <span style={{ color: 'red' }}>Lost</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent flips to display.</p>
      )}
    </div>
  )
}
