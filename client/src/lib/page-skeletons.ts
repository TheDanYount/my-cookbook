import { PageData } from '../components/Cookbook';

export async function getRecipes(cookbookId) {
  try {
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
        const newData = [] as {
          type: string;
          text?: string | undefined;
          file?: unknown;
          fileUrl?: string | undefined;
        }[];
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
        }
        if (ingredients[i] && usedImage) {
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
  } catch (err) {
    alert(err);
  }
}

export function getToC() {
  return {
    type: 'toc',
    data: [{ type: 'title' }, { type: 'addRecipeButton' }],
  };
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
