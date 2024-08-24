import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import firebaseConfig from '../../firebaseconfig';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
const chatRef = database.ref('chat');

interface Message {
  message: string;
  timestamp: number;
  userId: string;
}

export default function SharedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewMessage = (snapshot: firebase.database.DataSnapshot) => {
      const messageData = snapshot.val();
      setMessages(prevMessages => [...prevMessages, messageData]);
    };

    chatRef.on('child_added', handleNewMessage);

    return () => {
      chatRef.off('child_added', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      chatRef.push().set({
        message: newMessage,
        timestamp: Date.now(),
        userId: userId
      });
      setNewMessage('');
    }
  };

  return (
    <div style={{ width: '300px', margin: '20px auto' }}>
      <h2>Shared Chat</h2>
      <div ref={chatLogRef} style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
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
  );
}
