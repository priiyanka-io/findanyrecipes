import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyD8D2Zy1kzVXlkdp_xJ1Tp3xq2guti9E44",
  authDomain: "myrasoi-io.firebaseapp.com",
  projectId: "myrasoi-io",
  storageBucket: "myrasoi-io.firebasestorage.app",
  messagingSenderId: "604933910454",
  appId: "1:604933910454:web:27363402f5da03306e5b17",
  measurementId: "G-G3LD6JV0S4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();