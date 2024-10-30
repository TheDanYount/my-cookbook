import { useState, useRef, Fragment, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { getRecipeForm, deleteRecipe } from '../lib/page-scaffolding';
import { IndividualPageProps } from './Page';
import { ToCEntry } from './ToCEntry';
import { DeleteConfirm } from './DeleteConfirm';
import { CookbookContext } from './CookbookContext';
import { authKey } from './UserContext';

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
  const { pageNum } = useParams();
  const { cookbookId } = useContext(CookbookContext);
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
    if (isPointerDown) {
      setEntryToMove(undefined);
      setIsPointerDown(false);
      reOrderRecipes(
        pages[2].data.filter((e) => e.type === 'recipe'),
        cookbookId
      );
    }
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

  function handleDeleteClick(id) {
    setDeleteConfirmId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmId) return;
    deleteRecipe(cookbookId, deleteConfirmId);
    const pDDataCopy = pageData.data.filter((entry) => {
      if (entry.type === 'recipe' && entry.id === deleteConfirmId) return false;
      return true;
    });
    reOrderTocEntries(pDDataCopy);
    let recipeToBeDeletedFound = false;
    const newPages = [
      ...pages.slice(0, 2),
      { type: 'toc', data: pDDataCopy },
      ...pages.slice(3).filter((page) => {
        if (
          page?.data[0]?.type === 'title' &&
          page.data[0].id === deleteConfirmId
        ) {
          recipeToBeDeletedFound = true;
          return false;
        }
        if (recipeToBeDeletedFound && !(page?.data[0]?.type === 'title'))
          return false;
        return true;
      }),
    ];
    setPages(newPages);
    setDeleteConfirmId(undefined);
  }

  return (
    <>
      <div
        className="px-[30px]"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        ref={tocParentDiv}>
        {pageData.data.map((e) => {
          keyCount++;
          switch (e.type) {
            case 'title':
              return (
                <h1
                  className='text-center text-[18px] font-["Shantell_Sans"] font-semibold'
                  key={`page:${currentPage},key:${keyCount}`}>
                  Table of Contents
                </h1>
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
                    onDelete={handleDeleteClick}
                  />
                  {deleteConfirmId &&
                    deleteConfirmId === e.id &&
                    page &&
                    createPortal(
                      <DeleteConfirm
                        text={e.text as string}
                        setDeleteConfirmId={setDeleteConfirmId}
                        onDeleteConfirm={handleDeleteConfirm}
                      />,
                      page as HTMLDivElement
                    )}
                </Fragment>
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
      const auth = localStorage.getItem(authKey);
      if (!auth) throw new Error('not properly logged in');
      const result = await fetch(
        `/api/re-order-recipes/${cookbookId}/${data[i].id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${JSON.parse(auth).token}`,
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
