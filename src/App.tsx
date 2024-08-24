import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import firebaseConfig from './firebaseconfig';

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

export const SimpleChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);

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
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.userId.slice(0, 6)}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};
