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
const form = document.getElementById("signupForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();
 
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword =document.getElementById("confirmPassword").value;
 

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError =
    document.getElementById("confirmPasswordError");

  nameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";
  confirmPasswordError.textContent = "";
  let isValid = true;

  if (name === "") {
    nameError.textContent = "Name is required";
      nameError.classList.add("show");
    isValid = false;
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    nameError.textContent = "Enter a valid name";
      nameError.classList.add("show");
    isValid = false;
  }
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
  } else if (password.length < 6) {
    passwordError.textContent =
      "Password must be at least 6 characters";
        passwordError.classList.add("show");
    isValid = false;
  }

  if (confirmPassword === "") {
    confirmPasswordError.textContent =
      "Please confirm your password";
        passwordError.classList.add("show");
    isValid = false;
  } else if (password !== confirmPassword) {

    confirmPasswordError.textContent =
      "Passwords do not match";
        passwordError.classList.add("show");
    isValid = false;
  }
  if (!isValid) {
     
    return;
  }

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
    const user = userCredential.user;
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: name,
        email: email
      }
    );
    console.log("Signup successful:", user.uid);
    form.reset();
  } catch (error) {
    console.log(error);
    if (error.code === "auth/email-already-in-use") {
      emailError.textContent =
        "This email is already registered.";
    }
    else if (error.code === "auth/invalid-email") {
      emailError.textContent =
        "Please enter a valid email.";
    }
    else {
      emailError.textContent =
        "Something went wrong. Please try again.";
    }
  }
});

const signupWithGoogle = async () => {
  try {
    const result = await signInWithPopup(
      auth,
  googleProvider
    );
    const user = result.user;
    console.log("Google signup successful:", user);
  } catch (error) {
    console.log("Google signup error:", error);
  }
};
const googleSignupBtn =
  document.getElementById("googleSignupBtn");

googleSignupBtn.addEventListener(
  "click",
  signupWithGoogle
);