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
      if (
        i === recipe.length - 1 &&
        !usedImage &&
        !ingredients[i] &&
        recipe.imageUrl
      ) {
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
          type: 'ingredients',
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

export function updateToc(pages: PageData[], recipe) {
  for (let i = 2; i < pages.length; i++) {
    if (pages[i].type === 'toc') {
      const oldEntryIndex = pages[i].data.findIndex(
        (e) => e.id === recipe.recipeId
      );
      if (oldEntryIndex !== -1) {
        pages[i].data.splice(oldEntryIndex, 1, {
          type: 'recipe',
          text: recipe.title,
          pageNum: pages[i].data[oldEntryIndex].pageNum,
          length: recipe.length,
          id: recipe.recipeId,
        });
        break;
      }
    }
  }
}

export function getRecipeForm() {
  return {
    type: 'recipeForm',
    data: [
      { type: 'title', text: '' },
      { type: 'img-and-ingredients', text: '', first: true },
      { type: 'directions', text: '', first: true },
      { type: 'notes', text: '', first: true },
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
  let usedIngredients = false;
  let usedDirections = false;
  let usedNotes = false;
  const newPages = pagesToConvert.map((page, mapIndex) => {
    if (
      !usedIngredients &&
      page.data.find((e) => e.type === 'img-and-ingredients')
    )
      usedIngredients = true;
    if (!usedDirections && page.data.find((e) => e.type === 'directions'))
      usedDirections = true;
    if (!usedNotes && page.data.find((e) => e.type === 'notes'))
      usedNotes = true;
    const dataToAdd: PageData['data'] = [];
    for (let i = 0; i < page.data.length; i++) {
      const type = page.data[i].type;
      if (!usedIngredients) {
        if (type === 'img-and-ingredients') {
          usedIngredients = true;
        } else if (type === 'directions' || type === 'notes') {
          dataToAdd.push({
            type: 'img-and-ingredients',
            text: '',
            first: true,
          });
          usedIngredients = true;
        }
      }
      if (!usedDirections) {
        if (type === 'directions') {
          usedIngredients = true;
        } else if (type === 'notes') {
          dataToAdd.push({ type: 'directions', text: '', first: true });
          usedDirections = true;
        }
      }
      if (!usedNotes && type === 'notes') {
        usedNotes = true;
      }
      dataToAdd.push(page.data[i]);
      if (
        i === page.data.length - 1 &&
        mapIndex === pagesToConvert.length - 1
      ) {
        if (!usedIngredients)
          dataToAdd.push({
            type: 'img-and-ingredients',
            text: '',
            first: true,
          });
        if (!usedDirections)
          dataToAdd.push({ type: 'directions', text: '', first: true });
        if (!usedNotes)
          dataToAdd.push({ type: 'notes', text: '', first: true });
        dataToAdd.push({ type: 'submit' });
      }
    }
    return {
      type: 'recipeForm',
      data: dataToAdd,
    };
  });
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
