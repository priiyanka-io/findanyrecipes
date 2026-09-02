import {
    signInWithPopup,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { auth, googleProvider,db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "recipe.html";
  }
});
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  [emailError, passwordError].forEach(el => {
    el.textContent = "";
    el.classList.remove("show");
  });

  let isValid = true;

  if (email === "") {
    emailError.textContent = "Email is required";
    emailError.classList.add("show");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Enter a valid email";
    emailError.classList.add("show");
    isValid = false;
  }

  if (password === "") {
    passwordError.textContent = "Password is required";
    passwordError.classList.add("show");
    isValid = false;
  }

  if (!isValid) return;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    window.location.href = "profile.html";
  } catch (error) {
    console.log(error);
  console.log("User document nahi mila");

    if (error.code === "auth/invalid-credential") {
      emailError.textContent = "Incorrect email or password.";
       
      emailError.classList.add("show");
      
    } else if (error.code === "auth/too-many-requests") {
      emailError.textContent = "Too many attempts. Try again later.";
        
      emailError.classList.add("show");
    } else {
      emailError.textContent = "Something went wrong. Please try again.";
        
      emailError.classList.add("show");
    }
  }
});

const loginWithGoogle = async () => {
  const googleError = document.getElementById("googleError");
  googleError.textContent = "";
  googleError.classList.remove("show");

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
     
      await auth.signOut();
      googleError.textContent = "No account found with this email. Please sign up first.";
      googleError.classList.add("show");
      return;
    }

    window.location.href = "profile.html";

  } catch (error) {
    

    if (error.code === "auth/popup-closed-by-user") {
      googleError.textContent = "Popup closed before completing sign in.";
    } else if (error.code === "auth/popup-blocked") {
      googleError.textContent = "Popup was blocked. Please allow popups.";
    } else {
      googleError.textContent = "Google sign-in failed. Please try again.";
    }
    googleError.classList.add("show");
  }
};
const googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", loginWithGoogle);