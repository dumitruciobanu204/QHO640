// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyJyTkLkPuqWPwV77rXir6EiaJddBWuqQ",
  authDomain: "places-to-stay-730e1.firebaseapp.com",
  projectId: "places-to-stay-730e1",
  storageBucket: "places-to-stay-730e1.appspot.com",
  messagingSenderId: "627603040882",
  appId: "1:627603040882:web:1cfd7f9bae294cb490f0eb",
  measurementId: "G-WBSK7F1NBB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// const analytics = getAnalytics(app);

export { db, auth, provider, signInWithPopup };
