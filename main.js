const form = document.querySelector("#recipeSearch");
const input = document.querySelector("#searchTerm");
const main = document.querySelector("#main");
const categoriesList = document.querySelector("#categoriesList");

const youtubeAPIURL = "https://www.googleapis.com/youtube/v3/search";
const youtubeAPIKey = APIKEY;

// *************** FORM ************************

const renderMeals = (meals) => {
  const recipes = document.createElement("div");
  recipes.className = "recipes";

  meals.forEach((meal) => {
    recipes.innerHTML += `
        <div class="recipe_card" data-idmeal="${meal.idMeal}">
          <h3 class="title title_sm" href="#" >${meal.strMeal}</h3>
          <img class="recipe_img" width="300" src="${meal.strMealThumb}">
        </div>`;
  });

  main.innerHTML = "";
  main.append(recipes);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const searchTerm = input.value;

  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
  );
  const data = await res.json();

  if (data.meals) {
    renderMeals(data.meals);
  } else {
    main.innerHTML = `
      <p class="recommendation_info">No result</p>
    `;
  }
});

// ********************** RECOMMENDATIONS **********************

async function showRecommendation() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const data = await res.json();

  main.innerHTML = `
    <div class="recommendation_container">
      <div class="recipe_card" data-idmeal="${data.meals[0].idMeal}">
        <h2 class="title title_md">Some recommendations:</h2>
        <h3 class="title title_sm" href="#" >${data.meals[0].strMeal}</h3>
        <img class="recipe_img" width="300" src="${data.meals[0].strMealThumb}">
      </div>
    </div>
  `;
}
showRecommendation();

// **************************** RECIPE DETAILS ***********************
// ***************** YOUTUBE API CALL ***************

async function searchVideos(searchTerm) {
  const params = {
    q: searchTerm,
    key: youtubeAPIKey,
    part: "snippet",
    type: "video",
    safeSearch: "strict",
    videoDuration: "long",
    videoEmbeddable: true,
    maxResults: 3,
  };
  const reqURL = `${youtubeAPIURL}?${new URLSearchParams(params)}`;
  const res = await fetch(reqURL);
  const data = await res.json();

  let html = `
    <div class="recipe_extra_videos">`;

  data.items.forEach((item) => {
    html += `
      <iframe src="https://www.youtube.com/embed/${item.id.videoId}"></iframe>`;
  });

  html += `
    </div>`;

  return html;
}
// ************************** CLEAN UP Main *****************

function cleanUpMain() {
  main.innerHTML = "";
  const previousActived = document.querySelector(".active");
  console.log(previousActived);
  if (previousActived) {
    previousActived.classList.remove("active");
  }
}

// ******************************

async function showRecipeDetails(idMeal) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`
  );
  const data = await res.json();
  const recipeDetails = data.meals[0];

  // strYoutube is not working for the iframe
  // because the url is as youtube.com/watch?v=12345
  // and for the iframe it need to be youtube.com/embed/12345
  // so I split strYoutube at "=" to extract the id
  // and recreate the embed url
  const strYoutubeArray = recipeDetails.strYoutube.split("=");
  const youtubeId = strYoutubeArray[1];
  const newYoutubeSrc = "https://www.youtube.com/embed/" + youtubeId;

  cleanUpMain();

  let html = ``;
  html += `
    <div class="recipe_details_card">
      <h2 class="title title_md" data-idmeal="${recipeDetails.idMeal}">
        ${recipeDetails.strMeal}
      </h2>
      <div>
        <iframe class="recipe_video" src="${newYoutubeSrc}"></iframe>
      </div>
  `;

  if (recipeDetails.strArea) {
    html += `
      <div class="recipe_cuisine">
        <p class="recipe_details">Cuisine: ${recipeDetails.strArea}</p>
      </div>
      <div class="recipe_info-wrapper">
        <div>
        <h4 class="recipe_details">Ingredients</h4>
          <ul class="recipe_ingredients">`;
  }

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipeDetails["strIngredient" + i];
    const measure = recipeDetails["strMeasure" + i];

    if (ingredient) {
      html += `
            <li class="recipe_details">
              ${ingredient}: ${measure}
            </li>
        `;
    }
  }

  html += `
          </ul>
        </div>
        <div class="recipe_instructions">
          <h4 class="recipe_details">Instructions</h4>
          <p class="recipe_details">${recipeDetails.strInstructions}</p>
        </div>
      </div>
      <h4 class="recipe_details">Watch more videos:</h4>`;

  const iframes = await searchVideos(recipeDetails.strMeal);

  html += iframes;
  html += `</div>`;

  main.innerHTML = html;
}

document.addEventListener("click", async (e) => {
  const idMealParent = e.target.closest("[data-idmeal]");

  if (!idMealParent) return;

  const idMeal = idMealParent.dataset.idmeal;

  // clean up MAIN
  cleanUpMain();

  //add show class
  showRecipeDetails(idMeal);
});

// ************************* SIDEBAR WITH CATEGORIES ************************

async function showCategories() {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/categories.php"
  );
  const data = await res.json();

  data.categories.forEach((category) => {
    categoriesList.innerHTML += `
      <li class="category">
        <a class="category_link" href="#">${category.strCategory}</a>
      </li>
      `;
  });
}

showCategories();

//  *********************** RECIPES BY CATEGORY in MAIN ****************

async function showRecipesByCategory(category) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  );
  const data = await res.json();

  renderMeals(data.meals);
}

document.addEventListener("click", async (e) => {
  if (e.target.className !== "category_link") return;
  e.preventDefault();

  const category = e.target;

  // clean up
  cleanUpMain();

  // add active on the clicked category
  category.classList.add("active");

  showRecipesByCategory(category.textContent);
});
