import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

  const firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  
  const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const form = document.getElementById("signupForm");
document.getElementById('signupForm').addEventListener('submit', () => console.log('test fired'))
form.addEventListener("submit", async (e) => {
  console.log("1. Form submitted"); 
  e.preventDefault();

 
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword =document.getElementById("confirmPassword").value;
  console.log("2. Values:", name, email, password, confirmPassword); 

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
     console.log("3. Validation FAILED, stopping here");
    return;
  }
  console.log("4. Validation PASSED, calling Firebase");
  try {
  console.log("Trying signup with:", email, password); 
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