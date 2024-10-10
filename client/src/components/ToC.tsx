import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeForm } from '../lib/page-scaffolding';
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
          reOrderTocEntries(pDDataCopy);
          const pagesCopy = pages.slice();
          pagesCopy.splice(movingToPos + 2, 1, pages[movingFromPos + 2]);
          pagesCopy.splice(movingFromPos + 2, 1, pages[movingToPos + 2]);
          const newPages = [
            ...pages.slice(0, 2),
            { type: 'toc', data: pDDataCopy },
            ...pagesCopy.slice(3),
          ];
          setPages(newPages);
        }
      }
    }
  };

  function handlePointerDown(e) {
    const target = e.currentTarget.closest('.relative');
    if (target) setEntryToMove(target);
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
                onPageTurn={onPageTurn}
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

function reOrderTocEntries(data) {
  let runningTotal = 3;
  for (let i = 0; i < data.length; i++) {
    if (data[i].type === 'recipe') {
      data[i].pageNum = runningTotal;
      runningTotal += data[i].length;
    }
  }
  return data;
}

async function reOrderRecipes(data, cookbookId) {
  for (let i = 0; i < data.length; i++) {
    try {
      const result = await fetch(
        `/api/re-order-recipes/${cookbookId}/${data[i].id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: i + 1 }),
        }
      );
      const formattedResult = await result.json();
      if (!result.ok) throw new Error(formattedResult.error);
    } catch (err) {
      alert(err);
    }
  }
}
