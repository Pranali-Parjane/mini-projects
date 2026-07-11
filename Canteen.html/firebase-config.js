// Import Firebase SDKs from CDN for use directly in the browser
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNv4XiZUwt600-r5JYxv3Wsw5AI0aM-Co",
  authDomain: "canteen-ordering-system-dc25a.firebaseapp.com",
  projectId: "canteen-ordering-system-dc25a",
  storageBucket: "canteen-ordering-system-dc25a.firebasestorage.app",
  messagingSenderId: "1082057002219",
  appId: "1:1082057002219:web:51b3df2ef31b04385882ae",
  measurementId: "G-W1V41WTY2D"
};

// Initialize Firebase (once)
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Make database available globally
window.db = db;
window.auth = auth;

console.log('Firebase initialized successfully');

export { db, auth };

