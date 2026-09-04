
import {
 
  createUserWithEmailAndPassword,
  signInWithPopup,
 
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { serverTimestamp, doc, setDoc ,getDoc} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

  import { auth, db, googleProvider } from "./firebase-config.js";
const form = document.getElementById("signupForm");

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const unsub = onAuthStateChanged(auth, (user) => {
  unsub(); 
  if (user) {
    window.location.href = "recipe.html";
  }
});
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
        email: email,
        bio: "",
        createdAt: serverTimestamp()
      }
    );

      window.location.href = "recipe.html";
    form.reset();
  } catch (error) {
    
    if (error.code === "auth/email-already-in-use") {
      emailError.textContent =
        "This email is already registered.";
        emailError.classList.add("show"); 
    }
    else if (error.code === "auth/invalid-email") {
      emailError.textContent =
        "Please enter a valid email.";
        emailError.classList.add("show"); 
    }
    else {
      emailError.textContent =
        "Something went wrong. Please try again.";
        emailError.classList.add("show"); 
    }
  }
});

const signupWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "User",
        email: user.email,
        bio: "",
        createdAt: serverTimestamp()
      });
    }

    window.location.href = "recipe.html";
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
gsap.set(".brand-mark, .brand-copy h1, .brand-copy p", { opacity: 0, y: 24 });
gsap.set(".form-card", { opacity: 0, y: 30, scale: 0.97 });
gsap.set(".eyebrow, .form-card h2, .field, .btn-primary, .divider, .btn-google, .switch-line", { opacity: 0, y: 18 });

const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

tl.to(".brand-mark", { opacity: 1, y: 0, duration: 0.6 })
  .to(".brand-copy h1", { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
  .to(".brand-copy p", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
  .to(".form-card", { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.5")
  .to(".eyebrow", { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
  .to(".form-card h2", { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
  .to(".field", { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.25")
  .to(".btn-primary", { opacity: 1, y: 0, duration: 0.5 }, "-=0.15")
  .to(".divider", { opacity: 1, y: 0, duration: 0.4 }, "-=0.25")
  .to(".btn-google", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
  .to(".switch-line", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");