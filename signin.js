import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js"; 
  
  const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  emailError.textContent = "";
  passwordError.textContent = "";
  let isValid = true;

  if (email === "") {
    emailError.textContent = "Email is required";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Enter a valid email";
    isValid = false;
  }

  if (password === "") {
    passwordError.textContent = "Password is required";
    isValid = false;
  }

  if (!isValid) return;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login successful:", user.uid);
    
  } catch (error) {
    console.log(error);
    if (error.code === "auth/user-not-found") {
      emailError.textContent = "No account found with this email.";
    } else if (error.code === "auth/wrong-password") {
      passwordError.textContent = "Incorrect password.";
    } else if (error.code === "auth/invalid-credential") {
      emailError.textContent = "Invalid email or password.";
    } else {
      emailError.textContent = "Something went wrong. Please try again.";
    }
  }
});


const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google login successful:", user);
    // window.location.href = "dashboard.html";
  } catch (error) {
    console.log("Google login error:", error);
  }
};

const googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", loginWithGoogle);