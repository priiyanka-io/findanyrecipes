import { signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

const logoutBtn = document.getElementById("logoutBtn"); 

const handleLogout = async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}