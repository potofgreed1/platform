import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'
import React, { useState, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Modal } from './components/Modal'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'
import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import RecentPlays from './sections/RecentPlays/RecentPlays'
import Toasts from './sections/Toasts'
import { MainWrapper, TosInner, TosWrapper } from './styles'
import { TOS_HTML } from './constants'
import { useWallet } from '@solana/wallet-adapter-react'
import { ref, push, set, onChildAdded, serverTimestamp } from "firebase/database"
import styled from 'styled-components'
import { db } from './firebaseconfig';

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function ErrorHandler() {
  const walletModal = useWalletModal()
  const toast = useToast()
  const [error, setError] = React.useState<Error>()

  useTransactionError(
    (error) => {
      if (error.message === 'NOT_CONNECTED') {
        walletModal.setVisible(true)
        return
      }
      toast({ title: '❌ Transaction error', description: error.error?.errorMessage ?? error.message })
    },
  )

  return (
    <>
      {error && (
        <Modal onClose={() => setError(undefined)}>
          <h1>Error occured</h1>
          <p>{error.message}</p>
        </Modal>
      )}
    </>
  )
}

export default function App() {
  const newcomer = useUserStore((state) => state.newcomer)
  const set = useUserStore((state) => state.set)
  const { publicKey } = useWallet()

  // Chat state
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const chatRef = ref(db, 'chat')

    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const messageData = snapshot.val()
      setMessages(prevMessages => [...prevMessages, messageData])
    })

    return () => unsubscribe()
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    if (!publicKey) {
      console.error("Wallet not connected")
      return
    }

    const chatRef = ref(db, 'chat')
    const newMessageRef = push(chatRef)

    try {
      await set(newMessageRef, {
        message: newMessage,
        timestamp: serverTimestamp(),
        userId: publicKey.toString()
      })
      setNewMessage('')
    } catch (error) {
      console.error("Error sending message: ", error)
    }
  }

  const formatUserId = (userId) => {
    if (!userId) return 'Unknown'
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`
  }

  return (
    <>
      {newcomer && (
        <Modal>
          <h1>Welcome</h1>
          <TosWrapper>
            <TosInner dangerouslySetInnerHTML={{ __html: TOS_HTML }} />
          </TosWrapper>
          <p>
            By playing on our platform, you confirm your compliance.
          </p>
          <GambaUi.Button main onClick={() => set({ newcomer: false })}>
            Acknowledge
          </GambaUi.Button>
        </Modal>
      )}
      <ScrollToTop />
      <ErrorHandler />
      <Header />
      <Toasts />
      <MainWrapper>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/:gameId" element={<Game />} />
        </Routes>
        <h2 style={{ textAlign: 'center' }}>Recent Plays</h2>
        <RecentPlays />
        
        {/* Chat UI */}
        <div>
          <div style={{height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px'}}>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{formatUserId(msg.userId)}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input 
              type="text" 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </MainWrapper>
    </>
  )
}
