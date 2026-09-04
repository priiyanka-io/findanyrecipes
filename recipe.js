import { auth, db } from "./firebase-config.js";
import { doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const chipRow = document.getElementById("chipRow");
const recipeGrid = document.getElementById("recipeGrid");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");


async function isRecipeSaved(mealId) {
  const user = auth.currentUser;
  if (!user) return false;

  const ref = doc(db, "users", user.uid, "savedRecipes", mealId);
  const snap = await getDoc(ref);
  return snap.exists();
}

async function saveRecipe(meal) {
  const user = auth.currentUser;
  if (!user) {
    alert("Pehle login karo recipe save karne ke liye");
    return;
  }

  try {
    await setDoc(doc(db, "users", user.uid, "savedRecipes", meal.idMeal), {
      name: meal.strMeal,
      image: meal.strMealThumb,
      area: meal.strArea || "",
      savedAt: new Date()
    });
  } catch (err) {
    console.error("SAVE ERROR:", err);
  }
}

async function removeRecipe(mealId) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "savedRecipes", mealId));
  } catch (err) {
    console.error("REMOVE ERROR:", err);
  }
}

function updateButtonState(btn, isSaved) {
  btn.dataset.saved = isSaved;
  btn.textContent = isSaved ? "Remove" : "Save";
  btn.classList.toggle("saved", isSaved);
}


async function getAllCategories() {
  const res = await fetch(`${BASE_URL}/categories.php`);
  const data = await res.json();
  return data.categories;
}

async function getByCategory(category) {
  const res = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
  const data = await res.json();
  return data.meals;
}

async function getByIngredient(ingredient) {
  const res = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
  const data = await res.json();
  return data.meals;
}

async function searchByName(query) {
  const res = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.meals;
}

async function getRecipeDetails(id) {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals[0];
}

async function getAllMeals() {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");

  const requests = letters.map(letter =>
    fetch(`${BASE_URL}/search.php?f=${letter}`)
      .then(res => res.json())
      .then(data => data.meals || [])
  );

  const results = await Promise.all(requests);
  return results.flat();
}


function showGridLoading(count = 8) {
  recipeGrid.innerHTML = "";
  emptyState.hidden = true;
  resultCount.textContent = "Loading...";

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "recipe-card skeleton-card";
    skeleton.innerHTML = `
      <div class="card-image skeleton-shimmer"></div>
      <div class="card-body">
        <div class="skeleton-line skeleton-shimmer" style="width:70%;"></div>
        <div class="skeleton-line skeleton-shimmer" style="width:45%;"></div>
      </div>
    `;
    recipeGrid.appendChild(skeleton);
  }
}


function renderMeals(meals) {
  recipeGrid.innerHTML = "";

  if (!meals || meals.length === 0) {
    emptyState.hidden = false;
    resultCount.textContent = "0 recipes";
    return;
  }

  emptyState.hidden = true;
  resultCount.textContent = `${meals.length} recipes`;

  meals.forEach(async meal => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = `
      <div class="card-image" style="background-image:url('${meal.strMealThumb}');background-size:cover;background-position:center;"></div>
      <div class="card-body">
        <h3> ${meal.strMeal}</h3>
        ${meal.strArea ? `<p class="recipe-country">From: ${meal.strArea}</p>` : ""}
        <button class="save-btn-card">Save</button>
      </div>
    `;
    const saveBtn = card.querySelector(".save-btn-card");

    card.addEventListener("click", () => openRecipeModal(meal.idMeal));

    saveBtn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const currentlySaved = saveBtn.dataset.saved === "true";

      if (currentlySaved) {
        await removeRecipe(meal.idMeal);
        updateButtonState(saveBtn, false);
      } else {
        await saveRecipe(meal);
        updateButtonState(saveBtn, true);
      }
    });

    recipeGrid.appendChild(card);
    const alreadySaved = await isRecipeSaved(meal.idMeal);
    updateButtonState(saveBtn, alreadySaved);
  });
}


async function openRecipeModal(id) {
  const modalOverlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("recipeModal");

  modal.innerHTML = `
    <button class="modal-close" id="modalClose">&times;</button>
    <div class="modal-loading">
      <div class="spinner"></div>
      <p>Loading recipe...</p>
    </div>
  `;
  modalOverlay.classList.add("open");

  document.getElementById("modalClose").addEventListener("click", () => {
    modalOverlay.classList.remove("open");
  });

  const meal = await getRecipeDetails(id);

  let ingredientsHtml = "";
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim() !== "") {
      ingredientsHtml += `<li>${measure} ${ing}</li>`;
    }
  }

modal.innerHTML = `
  <button class="modal-close" id="modalClose">&times;</button>
  <div class="modal-image" style="background-image:url('${meal.strMealThumb}');background-size:cover;background-position:center;"></div>
  <div class="modal-content">
    <span class="cat-tag">${meal.strCategory}</span>
    <h2>${meal.strMeal}</h2>
    ${meal.strYoutube ? `
      <a href="${meal.strYoutube}" target="_blank" rel="noopener" class="youtube-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2c-.3-1.1-1.1-1.9-2.2-2.2C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.3.5C1.6 4.3.8 5.1.5 6.2 0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1.1 1.1 1.9 2.2 2.2 1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
        </svg>
        Watch on YouTube
      </a>
    ` : ""}
    <div class="modal-section">
      <h3>Ingredients</h3>
      <ul class="ingredient-list">${ingredientsHtml}</ul>
    </div>
    <div class="modal-section">
      <h3>Instructions</h3>
      <p>${meal.strInstructions}</p>
    </div>
  </div>
`;

  document.getElementById("modalClose").addEventListener("click", () => {
    modalOverlay.classList.remove("open");
  });
}


searchInput.addEventListener("input", () => {
  if (searchInput.value.length > 0) {
    clearSearchBtn.classList.add("show");
  } else {
    clearSearchBtn.classList.remove("show");
  }
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearSearchBtn.classList.remove("show");
  searchInput.focus();
  searchInput.dispatchEvent(new Event("input"));
});

let searchTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  const query = e.target.value.trim();

  searchTimer = setTimeout(async () => {
    showGridLoading();

    if (query === "") {
      const meals = await getAllMeals();
      renderMeals(meals);
      return;
    }

    const [byName, byIngredient] = await Promise.all([
      searchByName(query),
      getByIngredient(query)
    ]);

    const combinedMap = new Map();
    (byName || []).forEach(meal => combinedMap.set(meal.idMeal, meal));
    (byIngredient || []).forEach(meal => combinedMap.set(meal.idMeal, meal));

    const meals = Array.from(combinedMap.values());
    renderMeals(meals);
  }, 400);
});

// ---------------- CATEGORY CHIPS ----------------

async function renderCategoryChips() {
  const categories = await getAllCategories();

  categories.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.cat = cat.strCategory;
    chip.textContent = cat.strCategory;
    chipRow.appendChild(chip);
  });

  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", async () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      showGridLoading();

      const category = chip.dataset.cat;

      if (category === "all") {
        const meals = await getAllMeals();
        renderMeals(meals);
      } else {
        const meals = await getByCategory(category);
        renderMeals(meals);
      }
    });
  });
}


onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  showGridLoading();
  renderCategoryChips();
  getAllMeals().then(meals => renderMeals(meals));
});
gsap.set(".navbar", { opacity: 0, y: -20 });
gsap.set(".hero-bar", { opacity: 0, y: 20 });
gsap.set(".section-head", { opacity: 0, y: 20 });

const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

tl.to(".navbar", { opacity: 1, y: 0, duration: 0.6 })
  .to(".hero-bar", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
  .to(".section-head", { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");