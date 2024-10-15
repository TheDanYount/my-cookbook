import { useState, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { getRecipeForm } from '../lib/page-scaffolding';
import { IndividualPageProps } from './Page';
import { ToCEntry } from './ToCEntry';
import { DeleteConfirm } from './DeleteConfirm';

type tocIndividualPageProps = IndividualPageProps & {
  onPageTurn: (num) => void;
};

type entry = {
  text: string;
  pageNum: number;
  length: number;
  id: number;
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<number>();
  const tocParentDiv = useRef<HTMLDivElement | null>(null);
  const page = tocParentDiv?.current?.parentNode;

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

  function handleDelete(id) {
    console.log('I should delete', id);
    setDeleteConfirmId(id);
  }

  return (
    <>
      <div
        className="text-xs px-[30px]"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        ref={tocParentDiv}>
        {pageData.data.map((e) => {
          console.log(page);
          keyCount++;
          switch (e.type) {
            case 'title':
              return (
                <Fragment key={`page:${currentPage},key:${keyCount}`}>
                  <h1 className="text-center text-base">Table of Contents</h1>
                  {deleteConfirmId &&
                    deleteConfirmId === e.id &&
                    page &&
                    createPortal(
                      <DeleteConfirm
                        text={e.text as string}
                        id={e.id as number}
                        setDeleteConfirmId={setDeleteConfirmId}
                      />,
                      page as HTMLDivElement
                    )}
                </Fragment>
              );
            case 'recipe':
              return (
                <Fragment key={`page:${currentPage},key:${keyCount}`}>
                  <ToCEntry
                    entry={e as entry}
                    placementOnPage={keyCount}
                    onPointerMove={handlePointerMove}
                    onPointerDown={handlePointerDown}
                    onPageTurn={onPageTurn}
                    pages={pages}
                    setPages={setPages}
                    onDelete={handleDelete}
                  />
                  {deleteConfirmId &&
                    deleteConfirmId === e.id &&
                    page &&
                    createPortal(
                      <DeleteConfirm
                        text={e.text as string}
                        id={e.id as number}
                        setDeleteConfirmId={setDeleteConfirmId}
                      />,
                      page as HTMLDivElement
                    )}
                </Fragment>
              );
            case 'addRecipeButton':
              return (
                <Fragment key={`page:${currentPage},key:${keyCount}`}>
                  <div className="relative">
                    <button
                      className="h-[24px] text-left hover:scale-110"
                      onClick={handleNewRecipe}>
                      + Add Recipe
                    </button>
                  </div>
                  {deleteConfirmId &&
                    deleteConfirmId === e.id &&
                    page &&
                    createPortal(
                      <DeleteConfirm
                        text={e.text as string}
                        id={e.id as number}
                        setDeleteConfirmId={setDeleteConfirmId}
                      />,
                      page as HTMLDivElement
                    )}
                </Fragment>
              );
          }
        })}
      </div>
    </>
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
