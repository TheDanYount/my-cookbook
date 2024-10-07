export function GetToC() {
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
