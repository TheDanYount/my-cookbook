import { getRecipeForm } from '../lib/page-skeletons';
import { IndividualPageProps } from './Page';

type tocIndividualPageProps = IndividualPageProps & {
  onPageTurn: (num) => void;
  pageNum: number;
};

export function ToC({
  pageData,
  pages,
  setPages,
  onPageTurn,
  pageNum,
}: tocIndividualPageProps) {
  let keyCount = -1;
  const currentPage = pages.findIndex((e) => e === pageData);
  function handleNewRecipe() {
    setPages([...pages, getRecipeForm()]);
    onPageTurn(pages.length - pageNum);
  }
  return (
    <div className="text-xs px-[30px]">
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
          case 'recipe':
            return (
              <div
                className="flex justify-between items-start"
                key={`page:${currentPage},key:${keyCount}`}>
                <p>{e.text}</p>
                <p>{Number(e.pageNum)}</p>
              </div>
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
