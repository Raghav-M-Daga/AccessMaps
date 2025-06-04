// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0E1QEEw1ymzUhBPPxiAJawBEz3GXH6uQ",
  authDomain: "accessmaps-b3f0a.firebaseapp.com",
  projectId: "accessmaps-b3f0a",
  storageBucket: "accessmaps-b3f0a.firebasestorage.app",
  messagingSenderId: "297530230217",
  appId: "1:297530230217:web:c09af7e286b2f93c9b1418",
  measurementId: "G-51N4R3W7D3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Only initialize analytics on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };