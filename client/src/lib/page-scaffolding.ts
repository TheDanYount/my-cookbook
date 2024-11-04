import { PageData } from '../components/Cookbook';
import { authKey } from '../components/UserContext';

function buildRecipeData(formattedResult) {
  const recipePageDataArray: PageData[] = [];
  for (const recipe of formattedResult) {
    const ingredients = JSON.parse(recipe.ingredients);
    const directions = JSON.parse(recipe.directions);
    const notes = JSON.parse(recipe.notes);
    const recipeId = recipe.recipeId;
    let firstIngredients = true;
    let firstDirections = true;
    let firstNotes = true;
    let usedImage = false;
    for (let i = 0; i < recipe.length; i++) {
      const newData: PageData['data'] = [];
      if (i === 0) {
        newData.push({
          type: 'title',
          text: recipe.title,
          length: recipe.length,
          id: recipeId,
        });
      }
      if (i === recipe.length - 1 && !usedImage && !ingredients[i]) {
        newData.push({
          type: 'img-and-ingredients',
          text: '',
          fileUrl: recipe.imageUrl,
        });
      } else if (ingredients[i] && !usedImage) {
        usedImage = true;
        newData.push({
          type: 'img-and-ingredients',
          text: ingredients[i],
          fileUrl: recipe.imageUrl,
          first: firstIngredients,
        });
        firstIngredients = false;
      } else if (ingredients[i] && usedImage) {
        newData.push({
          type: 'img-and-ingredients',
          text: ingredients[i],
          first: firstIngredients,
        });
        firstIngredients = false;
      }
      if (directions[i]) {
        newData.push({
          type: 'directions',
          text: directions[i],
          first: firstDirections,
        });
        firstDirections = false;
      }
      if (notes[i]) {
        newData.push({
          type: 'notes',
          text: notes[i],
          first: firstNotes,
        });
        firstNotes = false;
      }
      recipePageDataArray.push({
        type: 'recipe',
        data: newData,
      });
    }
  }
  return recipePageDataArray;
}

export async function getRecipes(cookbookId) {
  try {
    const auth = localStorage.getItem(authKey);
    if (!auth) throw new Error('not properly logged in');
    const result = await fetch(`/api/read-recipes/${cookbookId}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(auth).token}`,
      },
    });
    const formattedResult = await result.json();
    if (!result.ok) throw new Error(formattedResult.error);
    return buildRecipeData(formattedResult);
  } catch (err) {
    alert(err);
  }
}

export async function getRecipeById(cookbookId, recipeId) {
  try {
    const auth = localStorage.getItem(authKey);
    if (!auth) throw new Error('not properly logged in');
    const result = await fetch(
      `/api/read-recipe-by-id/${cookbookId}/${recipeId}`,
      {
        headers: {
          Authorization: `Bearer ${JSON.parse(auth).token}`,
        },
      }
    );
    const formattedResult = await result.json();
    if (!result.ok) throw new Error(formattedResult.error);
    return buildRecipeData(formattedResult);
  } catch (err) {
    alert(err);
  }
}

export function buildToc(pages: PageData[]) {
  const recipes: PageData['data'] = [];
  let runningTotal = 3;
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].type === 'recipe') {
      if (pages[i].data[0].type === 'title') {
        const length = pages[i].data[0].length;
        recipes.push({
          type: 'recipe',
          text: pages[i].data[0].text,
          pageNum: runningTotal,
          length: length,
          id: pages[i].data[0].id,
        });
        if (length) runningTotal += length;
      }
    }
  }
  return {
    type: 'toc',
    data: [{ type: 'title' }, ...recipes, { type: 'addRecipeButton' }],
  };
}

export function addToToc(pages: PageData[], recipe) {
  for (let i = pages.length - 1; i > 0; i--) {
    if (pages[i].type === 'toc') {
      const prevPageNum = pages[i]?.data[pages[i].data.length - 2]?.pageNum;
      const prevPageLength = pages[i]?.data[pages[i].data.length - 2]?.length;
      const newPageNum =
        prevPageNum && prevPageLength ? prevPageNum + prevPageLength : i + 1;
      pages[i].data.splice(-1, 0, {
        type: 'recipe',
        text: recipe.title,
        pageNum: newPageNum,
        length: recipe.length,
        id: recipe.recipeId,
      });
    }
  }
}

export function getRecipeForm() {
  return {
    type: 'recipeForm',
    data: [
      { type: 'title' },
      { type: 'img-and-ingredients' },
      { type: 'directions' },
      { type: 'notes' },
      { type: 'submit' },
    ],
  };
}

export function convertRecipeToForm(
  pages: PageData[],
  setPages: (pages: PageData[]) => void,
  pageNum: number,
  length: number
) {
  const pagesToConvert: PageData[] = [];
  if (!(pages[pageNum].type === 'recipe')) return;
  for (let i = 0; i < length; i++) {
    pagesToConvert.push(pages[pageNum + i]);
  }
  const newPages = pagesToConvert.map((page) => {
    return {
      type: 'recipeForm',
      data: page.data,
    };
  });
  newPages[newPages.length - 1].data.push({ type: 'submit' });
  setPages([
    ...pages.slice(0, pageNum),
    ...newPages,
    ...pages.slice(pageNum + length),
  ]);
}

export async function deleteRecipe(cookbookId, recipeId) {
  try {
    const auth = localStorage.getItem(authKey);
    if (!auth) throw new Error('not properly logged in');
    const result = await fetch(`/api/delete-recipe/${cookbookId}/${recipeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${JSON.parse(auth).token}` },
    });
    if (!result.ok) throw new Error('Delete failed!');
  } catch (err) {
    alert(err);
  }
}
