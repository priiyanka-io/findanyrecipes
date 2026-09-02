import {
    signInWithPopup,
 
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { auth, googleProvider } from "./firebase-config.js";


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
     window.location.href = "profile.html";
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
     window.location.href = "profile.html";
  } catch (error) {
    console.log("Google login error:", error);
  }
};

const googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", loginWithGoogle);