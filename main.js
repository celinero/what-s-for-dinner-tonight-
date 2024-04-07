// *********************** SEARCH FORM *************

const form = document.querySelector(".recipe-search");
const input = document.querySelector(".search-term");
const main = document.querySelector("#main");

// ---

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const searchTerm = input.value;

  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
  );
  const data = await res.json();

  main.innerHTML = "";

  if (data.meals) {
    data.meals.forEach((meal) => {
      main.innerHTML += `
        <div class="recipe_card">
          <h3 class="title title_sm" href="#" data-idmeal="${meal.idMeal}">${meal.strMeal}</h3>
          <img class="recipe_img" src="${meal.strMealThumb}">
        </div>`;
    });
  } else {
    main.innerHTML = "no result";
  }
});

// **************************** RECIPE DETAILS ***********************

async function showRecipeDetails(idMeal) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`
  );
  const data = await res.json();
  const recipeDetails = data.meals[0];

  console.log(recipeDetails);

  const strYoutubeArray = recipeDetails.strYoutube.split("=");
  const youtubeId = strYoutubeArray[1];
  const newYoutubeSrc = "https://www.youtube.com/embed/" + youtubeId;

  main.innerHTML = "";
  main.innerHTML += `
    <h3 class=" title title_sm" href="#" data-idmeal="${recipeDetails.idMeal}">
      ${recipeDetails.strMeal}
    </h3>
    <iframe src="${newYoutubeSrc}"></iframe>
    <p>Category: <a href="">${recipeDetails.strCategory}</a></p>
    <ul>
  `;

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipeDetails["strIngredient" + i];
    const measure = recipeDetails["strMeasure" + i];

    if (ingredient) {
      main.innerHTML += `
          <li>
            ${ingredient}: ${measure}
          </li>
        `;
    }
  }

  main.innerHTML += `
    </ul>
    <h4>Instructions</h4>
    <p>${recipeDetails.strInstructions}</p>
  `;

  // main.innerHTML = `;
  //  <h3 class=" title title_sm" href="#" data-idmeal="${recipeDetails.idMeal}">${recipeDetails.strMeal}</h3>
  //   <iframe src="${newYoutubeSrc}"></iframe>
  //   <p>Category: <a href="">${recipeDetails.strCategory}</a></p>
  //   <ul>Ingredients</ul>
  //   <li>${recipeDetails.strIngredient1}</li>
  //   <li>${recipeDetails.strIngredient2}</li>
  //   <li>${recipeDetails.strIngredient3}</li>
  //   <h4>Instructions</h4>
  //   <p>${recipeDetails.strInstructions}</p>
  // `;
}

document.addEventListener("click", async (e) => {
  if (!e.target.dataset.idmeal) return;

  const idMeal = e.target.dataset.idmeal;

  //add show class
  showRecipeDetails(idMeal);
});
