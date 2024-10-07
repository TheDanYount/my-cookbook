import { getRecipeForm } from '../lib/page-skeletons';
import { IndividualPageProps } from './Page';

export function ToC({ pageData, pages, setPages }: IndividualPageProps) {
  let keyCount = -1;
  const currentPage = pages.findIndex((e) => e === pageData);
  function handleNewRecipe() {
    setPages([...pages, getRecipeForm()]);
  }
  return (
    <div className="text-xs">
      {pageData.data.map((e) => {
        keyCount++;
        switch (e.type) {
          case 'title':
            return (
              <h1
                className="text-center text-base"
                key={`page:${currentPage},key:${keyCount}`}>
                Table of Contents
              </h1>
            );
          case 'addRecipeButton':
            return (
              <div
                className="relative"
                key={`page:${currentPage},key:${keyCount}`}>
                <button
                  className="h-[24px] text-left hover:scale-110"
                  onClick={handleNewRecipe}>
                  + Add Recipe
                </button>
              </div>
            );
        }
      })}
    </div>
  );
}
