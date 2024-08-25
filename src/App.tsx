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
import { db } from './firebaseconfig.ts' // Import db from index.tsx
import styled from 'styled-components'


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

const ChatContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
`;

const MessageList = styled.div`
  height: 300px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  background: #f9f9f9;
  border-radius: 5px;
`;

const MessageForm = styled.form`
  display: flex;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background: #9564ff;
  color: white;
  border: none;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  &:hover {
    background: #7d4cff;
  }
`;

function ChatRoom() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { publicKey } = useWallet();

    useEffect(() => {
        const chatRef = ref(db, 'chat');

        const unsubscribe = onChildAdded(chatRef, (snapshot) => {
            const messageData = snapshot.val();
            setMessages(prevMessages => [...prevMessages, messageData]);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!publicKey) {
            console.error("Wallet not connected");
            return;
        }

        const chatRef = ref(db, 'chat');
        const newMessageRef = push(chatRef);

        try {
            await set(newMessageRef, {
                message: newMessage,
                timestamp: serverTimestamp(),
                userId: publicKey.toString()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    const formatUserId = (userId) => {
        if (!userId) return 'Unknown';
        return `${userId.slice(0, 4)}...${userId.slice(-4)}`;
    };

    return (
        <ChatContainer>
            <MessageList>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{formatUserId(msg.userId)}:</strong> {msg.message}
                    </div>
                ))}
            </MessageList>
            <MessageForm onSubmit={sendMessage}>
                <MessageInput 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                />
                <SendButton type="submit">Send</SendButton>
            </MessageForm>
        </ChatContainer>
    );
}

export default function App() {
  const newcomer = useUserStore((state) => state.newcomer)
  const set = useUserStore((state) => state.set)
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
          <Route path="/" element={<><Dashboard /><ChatRoom /></>} />
          <Route path="/:gameId" element={<Game />} />
        </Routes>
        <h2 style={{ textAlign: 'center' }}>Recent Plays</h2>
        <RecentPlays />
      </MainWrapper>
    </>
  )
}
