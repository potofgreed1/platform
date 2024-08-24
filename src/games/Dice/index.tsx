// Import Firebase
import firebase from 'firebase/app';
import 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Reference to the 'chat' node in the database
const chatRef = database.ref('chat');

// Generate a random user ID
const userId = 'user_' + Math.random().toString(36).substr(2, 9);

// Function to store a message
function storeMessage(message) {
  const timestamp = Date.now();
  return chatRef.push().set({
    message: message,
    timestamp: timestamp,
    userId: userId
  });
}

// Store a message
storeMessage("Hello, this is a test message!")
  .then(() => {
    console.log("Message stored successfully");
    // Close the connection after storing the message
    firebase.app().delete();
  })
  .catch((error) => {
    console.error("Error storing message:", error);
    // Close the connection even if there's an error
    firebase.app().delete();
  });
