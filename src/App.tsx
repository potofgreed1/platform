import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'
import React, { useState, useEffect, useRef } from 'react'
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
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import firebaseConfig from './firebaseconfig.ts';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
const database = firebase.database()
const chatRef = database.ref('chat')

interface Message {
  message: string
  timestamp: number
  userId: string
}

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

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`)
  const chatLogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleNewMessage = (snapshot: firebase.database.DataSnapshot) => {
      const messageData = snapshot.val()
      setMessages(prevMessages => [...prevMessages, messageData])
    }

    chatRef.on('child_added', handleNewMessage)

    return () => {
      chatRef.off('child_added', handleNewMessage)
    }
  }, [])

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (newMessage.trim()) {
      chatRef.push().set({
        message: newMessage,
        timestamp: Date.now(),
        userId: userId
      })
      setNewMessage('')
    }
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
        
        {/* Chat Section */}
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2 style={{ textAlign: 'center' }}>Chat</h2>
          <div ref={chatLogRef} style={{ height: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>{msg.userId.slice(0, 6)}</strong>: {msg.message}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{ flexGrow: 1, marginRight: '10px', padding: '5px' }}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage} style={{ padding: '5px 10px' }}>Send</button>
          </div>
        </div>
      </MainWrapper>
    </>
  )
}
