import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ref, push, set, onChildAdded, serverTimestamp, query, limitToLast } from "firebase/database"
import { db } from './firebaseconfig'
import styled from 'styled-components'

interface Message {
  message: string
  timestamp: number
  userId: string
}

const ChatContainer = styled.div`
  margin-top: 20px;
`

const MessageList = styled.div`
  height: 300px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
`

const MessageForm = styled.form`
  display: flex;
`

const MessageInput = styled.input`
  flex-grow: 1;
  margin-right: 10px;
`

export const Chatroom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { publicKey } = useWallet()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const chatRef = ref(db, 'chat')
    const recentMessagesQuery = query(chatRef, limitToLast(50))

    const unsubscribe = onChildAdded(recentMessagesQuery, (snapshot) => {
      const messageData = snapshot.val() as Message
      setMessages(prevMessages => [...prevMessages, messageData])
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
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

  const formatUserId = (userId: string) => {
    if (!userId) return 'Unknown'
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`
  }

  return (
    <ChatContainer>
      <MessageList>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{formatUserId(msg.userId)}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </MessageList>
      <MessageForm onSubmit={sendMessage}>
        <MessageInput 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </MessageForm>
    </ChatContainer>
  )
}
