import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeForm } from '../lib/page-skeletons';
import { IndividualPageProps } from './Page';
import { ToCEntry } from './ToCEntry';

type tocIndividualPageProps = IndividualPageProps & {
  onPageTurn: (num) => void;
};

export function ToC({
  pageData,
  pages,
  setPages,
  onPageTurn,
}: tocIndividualPageProps) {
  let keyCount = -1;
  const { pageNum, cookbookId } = useParams();
  const currentPage = pages.findIndex((e) => e === pageData);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [entryToMove, setEntryToMove] = useState<HTMLElement>();

  const handlePointerMove = (event) => {
    if (!pageNum) return;
    if (isPointerDown) {
      const currentTarget = event.currentTarget;
      if (entryToMove && !(currentTarget === entryToMove)) {
        const movingFromPos = Number(entryToMove?.dataset.placementonpage);
        const movingToPos = Number(currentTarget?.dataset.placementonpage);
        if (movingFromPos && movingToPos) {
          const pDDataCopy = pageData.data.slice();
          pDDataCopy.splice(movingToPos, 1, pageData.data[movingFromPos]);
          pDDataCopy.splice(movingFromPos, 1, pageData.data[movingToPos]);
          setEntryToMove(currentTarget);
          const newPages = [
            ...pages.slice(0, 2),
            { type: 'toc', data: pDDataCopy },
            ...pages.slice(3),
          ];
          setPages(newPages);
        }
      }
    }
  };

  function handlePointerDown(e) {
    const currentTarget = e.currentTarget;
    if (currentTarget) setEntryToMove(currentTarget);
    setIsPointerDown(true);
  }

  function finishPointerHandling() {
    setEntryToMove(undefined);
    setIsPointerDown(false);
    reOrderRecipes(
      pages[2].data.filter((e) => e.type === 'recipe'),
      cookbookId
    );
  }

  function handlePointerUp() {
    finishPointerHandling();
  }

  function handlePointerLeave() {
    finishPointerHandling();
  }

  function handleNewRecipe() {
    setPages([...pages, getRecipeForm()]);
    if (!pageNum) return;
    onPageTurn(pages.length - +pageNum);
  }
  return (
    <div
      className="text-xs px-[30px]"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}>
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
                placementOnPage={keyCount}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
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

async function reOrderRecipes(data, cookbookId) {
  for (let i = 0; i < data.length; i++) {
    try {
      const result = await fetch(`/api/re-order-recipes/${cookbookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: data[i].text, order: i + 1 }),
      });
      const formattedResult = await result.json();
      if (!result.ok) throw new Error(formattedResult.error);
    } catch (err) {
      alert(err);
    }
  }
}
