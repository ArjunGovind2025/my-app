// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYFhWuqjhnUMnXGqUnOVVOdquAoyA82pk",
  authDomain: "ai-d-ce511.firebaseapp.com",
  projectId: "ai-d-ce511",
  storageBucket: "ai-d-ce511.appspot.com",
  messagingSenderId: "1031121340028",
  appId: "1:1031121340028:web:41617dec64853b35b3ebf9",
  measurementId: "G-E0VBP7P79B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);


export { auth, provider, signInWithPopup, db, signOut };