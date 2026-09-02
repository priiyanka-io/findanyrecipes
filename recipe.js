import { auth, db } from "./firebase-config.js";
import { doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const chipRow = document.getElementById("chipRow");
const recipeGrid = document.getElementById("recipeGrid");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");


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
    console.log("Recipe saved successfully:", meal.strMeal);
  } catch (err) {
    console.error("SAVE ERROR:", err);
  }
}

async function removeRecipe(mealId) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "savedRecipes", mealId));
    console.log("Recipe removed successfully:", mealId);
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
      console.log("Save button clicked for:", meal.strMeal);

      const currentlySaved = saveBtn.dataset.saved === "true";
      console.log("Currently saved?", currentlySaved);

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

async function openRecipeModal(id) {
  const meal = await getRecipeDetails(id);
  const modalOverlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("recipeModal");

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

  modalOverlay.classList.add("open");

  document.getElementById("modalClose").addEventListener("click", () => {
    modalOverlay.classList.remove("open");
  });
}


let searchTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  const query = e.target.value.trim();

  searchTimer = setTimeout(async () => {
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



renderCategoryChips();
getAllMeals().then(meals => renderMeals(meals));