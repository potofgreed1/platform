import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebaseconfig.ts';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

// Function to store a message in Firestore
async function storeMessage(message: string, userId: string) {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      message: message,
      userId: userId,
      timestamp: new Date()
    });
    console.log("Message stored with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error storing message: ", error);
    throw error;
  }
}

// Example usage
const userId = 'user_' + Math.random().toString(36).substr(2, 9);
storeMessage("Hello, this is a test message!", userId)
  .then((messageId) => {
    console.log("Message stored successfully with ID:", messageId);
  })
  .catch((error) => {
    console.error("Failed to store message:", error);
  });
