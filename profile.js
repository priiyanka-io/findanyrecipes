import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

const userName = document.getElementById("userName");
const userBio = document.getElementById("userBio");
const joinedDate = document.getElementById("joinedDate");
const avatar = document.getElementById("avatar");
const navDp = document.getElementById("navDp");
const useremail = document.getElementById("userEmail");
const likedRecipesGrid = document.getElementById("likedRecipesGrid");

let currentUid = null;

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUid = user.uid;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();

    if (useremail) useremail.textContent = data.email;
    if (userName) userName.textContent = data.name;
    if (userBio) userBio.textContent = data.bio || "No bio added yet.";

    const firstLetter = data.name ? data.name.charAt(0).toUpperCase() : "U";
    if (avatar) avatar.textContent = firstLetter;
    if (navDp) navDp.textContent = firstLetter;

    if (data.createdAt && joinedDate) {
      const date = data.createdAt.toDate();
      joinedDate.textContent = "Joined: " + date.toLocaleDateString("en-IN");
    }
  } else {
    console.log("User document nahi mila");
  }

  loadSavedRecipes(user.uid);
});



async function loadSavedRecipes(uid) {
  if (!likedRecipesGrid) return;

  likedRecipesGrid.innerHTML = `<p class="loading-text">Loading saved recipes...</p>`;

  try {
    const savedRef = collection(db, "users", uid, "savedRecipes");
    const snap = await getDocs(savedRef);

    if (snap.empty) {
      renderEmptyState();
      return;
    }

    likedRecipesGrid.innerHTML = "";

    snap.forEach((docSnap) => {
      const recipe = docSnap.data();
      const card = createRecipeCard(docSnap.id, recipe);
      likedRecipesGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading saved recipes:", error);
    likedRecipesGrid.innerHTML = `<p class="loading-text">Kuch gadbad ho gayi, dobara try karo.</p>`;
  }
}

function renderEmptyState() {
  likedRecipesGrid.innerHTML = `
    <div class="empty-state">
      <p>No Recipe saved yet</p>
      <a href="recipe.html" class="explore-btn">Explore Recipes</a>
    </div>
  `;
}

function createRecipeCard(id, recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.dataset.id = id;

  card.innerHTML = `
    <button class="remove-btn" aria-label="Remove">&times;</button>
    <img src="${recipe.image}" alt="${recipe.name}" class="recipe-img">
    <div class="recipe-card-body">
      <h4 class="recipe-name">${recipe.name}</h4>
      <p class="recipe-desc">${recipe.area ? recipe.area + " cuisine" : ""}</p>
    </div>
  `;

  const removeBtn = card.querySelector(".remove-btn");
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeSavedRecipe(id, card);
  });

  card.addEventListener("click", () => {
    openRecipeModal(id);
  });

  return card;
}

async function removeSavedRecipe(id, cardEl) {
  if (!currentUid) return;

  try {
    await deleteDoc(doc(db, "users", currentUid, "savedRecipes", id));
    cardEl.remove();

    if (!likedRecipesGrid.querySelector(".recipe-card")) {
      renderEmptyState();
    }
  } catch (error) {
    console.error("Error removing recipe:", error);
  }
}


const recipeModal = document.getElementById("recipeModal");
const recipeModalBody = document.getElementById("recipeModalBody");
const recipeModalClose = document.getElementById("recipeModalClose");

async function openRecipeModal(mealId) {
  if (!recipeModal || !recipeModalBody) return;

  recipeModal.classList.add("active");
  recipeModalBody.innerHTML = `<p class="loading-text">Loading recipe...</p>`;

  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    const data = await res.json();
    const meal = data.meals ? data.meals[0] : null;

    if (!meal) {
      recipeModalBody.innerHTML = `<p class="loading-text">Recipe detail nahi mili.</p>`;
      return;
    }

    let ingredientsHtml = "";
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredientsHtml += `<li>${measure ? measure + " " : ""}${ing}</li>`;
      }
    }

    recipeModalBody.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="modal-recipe-img">
      <h2>${meal.strMeal}</h2>
      <p class="modal-tags">${meal.strArea || ""} ${meal.strCategory ? "· " + meal.strCategory : ""}</p>
      <h3>Ingredients</h3>
      <ul class="modal-ingredients">${ingredientsHtml}</ul>
      <h3>Instructions</h3>
      <p class="modal-instructions">${meal.strInstructions}</p>
      ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="modal-video-link">Watch on YouTube</a>` : ""}
    `;

  } catch (error) {
    console.error("Error fetching recipe detail:", error);
    recipeModalBody.innerHTML = `<p class="loading-text">Kuch gadbad ho gayi, dobara try karo.</p>`;
  }
}

function closeRecipeModal() {
  if (recipeModal) recipeModal.classList.remove("active");
}

if (recipeModalClose) {
  recipeModalClose.addEventListener("click", closeRecipeModal);
}

if (recipeModal) {
  recipeModal.addEventListener("click", (e) => {
    if (e.target === recipeModal) closeRecipeModal();
  });
}


const handleSave = async () => {
  const newBio = document.getElementById("bioInput").value.trim();

  if (!newBio) {
    document.getElementById("bioError").textContent = "Bio cannot be empty";
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User is not logged in");

    await setDoc(doc(db, "users", user.uid), { bio: newBio }, { merge: true });
    window.location.href = "profile.html";

  } catch (error) {
    console.error("Error saving bio:", error);
  }
};

const saveBioBtn = document.getElementById("saveBioBtn");
if (saveBioBtn) {
  saveBioBtn.addEventListener("click", handleSave);
}