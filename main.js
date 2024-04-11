const form = document.querySelector("#recipeSearch");
const input = document.querySelector("#searchTerm");
const main = document.querySelector("#main");

const ul = document.querySelector("#categoriesList");

const youtubeAPIURL = "https://www.googleapis.com/youtube/v3/search";
const youtubeAPIKey = "AIzaSyA6AyD_n58wxF5kqXfjQnGNH0Zr7prMSCo";

// *************** FORM ************************

const renderMeals = (meals) => {
  main.innerHTML = "";

  meals.forEach((meal) => {
    main.innerHTML += `
        <div class="recipe_card" data-idmeal="${meal.idMeal}">
          <h3 class="title title_sm" href="#" >${meal.strMeal}</h3>
          <img class="recipe_img" width="300" src="${meal.strMealThumb}">
        </div>`;
  });
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
    main.innerHTML = "no result";
  }
});

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
  // console.log(data);
  data.items.forEach((item) => {
    recipeDetailsEl.innerHTML += `
     <iframe src="https://www.youtube.com/embed/${item.id.videoId}"></iframe>`;
    // console.log(item.id.videoId);
  });
  //   console.log(reqURL);
}

// ******************************
const recipeDetailsEl = document.createElement("div");
recipeDetailsEl.className = "recipe_details_card";
const recipeInfo = document.createElement("div");
recipeInfo.className = "recipe_info";

async function showRecipeDetails(idMeal) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`
  );
  const data = await res.json();
  const recipeDetails = data.meals[0];

  console.log(recipeDetails);

  // strYoutube is not working for the iframe
  // because the url is as youtube.com/watch?v=12345
  // and for the iframe it need to be youtube.com/embed/12345
  // so we split strYoutube at "=" to extract the id
  // and we recreate the embed url
  const strYoutubeArray = recipeDetails.strYoutube.split("=");
  const youtubeId = strYoutubeArray[1];
  const newYoutubeSrc = "https://www.youtube.com/embed/" + youtubeId;

  recipeDetailsEl.innerHTML = "";
  recipeDetailsEl.innerHTML += `
   
    <h2 class="title title_md" href="#" data-idmeal="${recipeDetails.idMeal}">
      ${recipeDetails.strMeal}
    </h3>
    <iframe class="recipe_video" src="${newYoutubeSrc}"></iframe>
    <h4>Category:</h4> <a href="">${recipeDetails.strCategory}</a>
    <div class="recipe_info">
      <h4>Ingredients:</h4>
      <ul>
  `;

  // loop through the list of ingredients/measures as keys/values in array of meal
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipeDetails["strIngredient" + i];
    const measure = recipeDetails["strMeasure" + i];

    if (ingredient) {
      recipeInfo.innerHTML += `
          <li>
            ${ingredient}: ${measure}
          </li>
        `;
    }
  }

  recipeDetailsEl.innerHTML += `
      </ul>
      <h4>Instructions</h4>
      <p>${recipeDetails.strInstructions}</p>
    </div>
    <h4>See more videos:</h4>
  `;

  searchVideos(recipeDetails.strMeal);
  main.append(recipeDetailsEl);
  recipeDetailsEl.append(recipeInfo);
}

document.addEventListener("click", async (e) => {
  const idMealParent = e.target.closest("[data-idmeal]");

  if (!idMealParent) return;

  const idMeal = idMealParent.dataset.idmeal;
  // console.log(idMeal);

  // clean up MAIN
  main.innerHTML = "";

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
    ul.innerHTML += `
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
  main.innerHTML = "";
  const previousActived = document.querySelector(".active");
  if (previousActived) {
    previousActived.classList.remove("active");
  }

  // add active on the clicked category
  category.classList.add("active");

  showRecipesByCategory(category.textContent);
});
