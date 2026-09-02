
import {

  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
   
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import { auth, db } from "./firebase-config.js";



const userName = document.getElementById("userName");
const userBio = document.getElementById("userBio");
const joinedDate = document.getElementById("joinedDate");
const avatar = document.getElementById("avatar");
const navDp = document.getElementById("navDp");
const useremail =document.getElementById("userEmail");


onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  
  console.log("UID:", user.uid);

 
  const userRef = doc(db, "users", user.uid);


  const userSnap = await getDoc(userRef);

 
  if (userSnap.exists()) {

    const data = userSnap.data();

    
   console.log("Firestore data:", data);

if (useremail) {
  useremail.textContent = data.email;
}

if (userName) {
  userName.textContent = data.name;
}

if (userBio) {
  userBio.textContent = data.bio || "No bio added yet.";
}

const firstLetter = data.name
  ? data.name.charAt(0).toUpperCase()
  : "U";

if (avatar) {
  avatar.textContent = firstLetter;
}

if (navDp) {
  navDp.textContent = firstLetter;
}

if (data.createdAt && joinedDate) {
  const date = data.createdAt.toDate();

  joinedDate.textContent =
    "Joined: " + date.toLocaleDateString("en-IN");
}
  } else {

    console.log("User document nahi mila");

  }

});
const handleSave = async () => {
  const newBio = document.getElementById("bioInput").value.trim();

  if (!newBio) {
    document.getElementById("bioError").textContent =
      "Bio cannot be empty";
    return;
  }

  try {
    const user =  auth.currentUser;

    if (!user) {
      throw new Error("User is not logged in");
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        bio: newBio
      },
      { merge: true }
    );

    
    window.location.href = "profile.html";

  } catch (error) {
    console.error("Error saving bio:", error);
  }
};
const saveBioBtn = document.getElementById("saveBioBtn");

if (saveBioBtn) {
  saveBioBtn.addEventListener("click", handleSave);
}