import { useState } from 'react';
import { getRecipeForm } from '../lib/page-skeletons';
import { IndividualPageProps } from './Page';
import { ToCEntry } from './ToCEntry';

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
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [yCoordinate, setYCoordinate] = useState<number>();

  const handlePointerMove = (event) => {
    if (isMouseDown) {
      // Distance down from the top of the Page component
      const y = event.clientY - 73;
      setYCoordinate(y);
      console.log(`Y Coordinate: ${y}`);
    }
  };

  const handlePointerDown = (event) => {
    console.log(event.target.closest('.relative').dataset.length);
    setIsMouseDown(true);
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);
  };

  function handleNewRecipe() {
    setPages([...pages, getRecipeForm()]);
    onPageTurn(pages.length - pageNum);
  }
  return (
    <div
      className="text-xs px-[30px]"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}>
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
            e.text = e.text as string;
            e.pageNum = e.pageNum as number;
            e.length = e.length as number;
            return (
              <ToCEntry
                text={e.text}
                pageNum={e.pageNum}
                length={e.length}
                key={`page:${currentPage},key:${keyCount}`}
              />
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
