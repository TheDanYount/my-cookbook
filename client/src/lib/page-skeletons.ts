import { PageData } from '../components/Cookbook';

export async function getRecipes(cookbookId) {
  const recipePageDataArray: PageData[] = [];
  const result = await fetch(`/api/read-recipes/${cookbookId}`);
  const formattedResult = await result.json();
  if (!result.ok) throw new Error(formattedResult.error);
  for (const recipe of formattedResult) {
    const ingredients = JSON.parse(recipe.ingredients);
    const directions = JSON.parse(recipe.directions);
    const notes = JSON.parse(recipe.notes);
    let usedImage = false;
    for (let i = 0; i < recipe.length; i++) {
      const newData: PageData['data'] = [];
      if (i === 0) {
        newData.push({ type: 'title', text: recipe.title });
      }
      if (ingredients[i] && !usedImage) {
        usedImage = true;
        newData.push({
          type: 'img-and-ingredients',
          text: ingredients[i],
          fileUrl: recipe.imageUrl,
        });
      } else if (ingredients[i] && usedImage) {
        newData.push({
          type: 'img-and-ingredients',
          text: ingredients[i],
        });
      }
      if (directions[i]) {
        newData.push({
          type: 'directions',
          text: directions[i],
        });
      }
      if (notes[i]) {
        newData.push({
          type: 'notes',
          text: notes[i],
        });
      }
      recipePageDataArray.push({
        type: 'recipe',
        data: newData,
      });
    }
  }
  return recipePageDataArray;
}

export async function getRecipeByOrder(cookbookId, order) {
  const recipePageDataArray: PageData[] = [];
  const result = await fetch(
    `/api/read-recipe-by-order/${cookbookId}/${order}`
  );
  const formattedResult = await result.json();
  if (!result.ok) throw new Error(formattedResult.error);
  for (const recipe of formattedResult) {
    const ingredients = JSON.parse(recipe.ingredients);
    const directions = JSON.parse(recipe.directions);
    const notes = JSON.parse(recipe.notes);
    let usedImage = false;
    for (let i = 0; i < recipe.length; i++) {
      const newData: PageData['data'] = [];
      if (i === 0) {
        newData.push({ type: 'title', text: recipe.title });
      }
      if (ingredients[i] && !usedImage) {
        usedImage = true;
        newData.push({
          type: 'img-and-ingredients',
          text: ingredients[i],
          fileUrl: recipe.imageUrl,
        });
      } else if (ingredients[i] && usedImage) {
        newData.push({
          type: 'img-and-ingredients',
          text: ingredients[i],
        });
      }
      if (directions[i]) {
        newData.push({
          type: 'directions',
          text: directions[i],
        });
      }
      if (notes[i]) {
        newData.push({
          type: 'notes',
          text: notes[i],
        });
      }
      recipePageDataArray.push({
        type: 'recipe',
        data: newData,
      });
    }
  }
  return recipePageDataArray;
}

export function buildToc(pages: PageData[]) {
  const recipes: PageData['data'] = [];
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].type === 'recipe') {
      if (pages[i].data[0].type === 'title') {
        recipes.push({
          type: 'recipe',
          text: pages[i].data[0].text,
          pageNum: i + 2,
        });
      }
    }
  }
  return {
    type: 'toc',
    data: [{ type: 'title' }, ...recipes, { type: 'addRecipeButton' }],
  };
}

export function addToToc(pages: PageData[], title: string, pageNum: number) {
  for (let i = pages.length - 1; i > 0; i--) {
    if (pages[i].type === 'toc') {
      pages[i].data.splice(-1, 0, {
        type: 'recipe',
        text: title,
        pageNum: pageNum,
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
