import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { IndividualPageProps } from './Page';
import { PageData } from './Cookbook';
import { addToToc, updateToc, getRecipeById } from '../lib/page-scaffolding';
import { CookbookContext } from './CookbookContext';
import { FaTrash } from 'react-icons/fa';
import { authKey } from './UserContext';
import React from 'react';
import { useWindowDimensions } from '../lib/window-dimensions';
import { handleOverflow, handleUnderflow } from '../lib/flow-handling';

type RecipeFormIndividualPageProps = IndividualPageProps & {
  thisPageNum: number;
};

export function RecipeForm({
  pageData,
  pages,
  setPages,
  thisPageNum,
}: RecipeFormIndividualPageProps) {
  const { cookbook } = useContext(CookbookContext);
  const cookbookId = cookbook?.cookbookId;
  const imgStore = pageData.data.find((e) => e.type === 'img-and-ingredients');
  const [title, setTitle] = useState(
    pageData.data.find((e) => e.type === 'title')?.text || ''
  );
  const [ingredients, setIngredients] = useState(
    pageData.data.find((e) => e.type === 'img-and-ingredients')?.text ||
      pageData.data.find((e) => e.type === 'ingredients')?.text ||
      ''
  );
  const [directions, setDirections] = useState(
    pageData.data.find((e) => e.type === 'directions')?.text || ''
  );
  const [notes, setNotes] = useState(
    pageData.data.find((e) => e.type === 'notes')?.text || ''
  );
  const [imgUrl, setImgUrl] = useState<string>();
  const titleElement = useRef<HTMLTextAreaElement>(null);
  const ingredientsElement = useRef<HTMLTextAreaElement>(null);
  const directionsElement = useRef<HTMLTextAreaElement>(null);
  const notesElement = useRef<HTMLTextAreaElement>(null);
  const simulationElement = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  let keyCount = -1;

  useEffect(() => {
    setImgUrl(imgStore?.fileUrl);
  }, [imgStore?.fileUrl]);

  useEffect(() => {
    const newTitle = pageData.data.find((e) => e.type === 'title')?.text || '';
    setTitle(newTitle);
    if (titleElement.current) {
      titleElement.current.value = newTitle;
      titleElement.current.style.height = 'auto';
      titleElement.current.style.height =
        titleElement.current.scrollHeight + 'px';
    }
    const newIngredients =
      pageData.data.find((e) => e.type === 'img-and-ingredients')?.text ||
      pageData.data.find((e) => e.type === 'ingredients')?.text ||
      '';
    setIngredients(newIngredients);
    if (ingredientsElement.current) {
      ingredientsElement.current.value = newIngredients;
      ingredientsElement.current.style.height = 'auto';
      ingredientsElement.current.style.height =
        ingredientsElement.current.scrollHeight + 'px';
    }
    const newDirections =
      pageData.data.find((e) => e.type === 'directions')?.text || '';
    setDirections(newDirections);
    if (directionsElement.current) {
      directionsElement.current.value = newDirections;
      directionsElement.current.style.height = 'auto';
      directionsElement.current.style.height =
        directionsElement.current.scrollHeight + 'px';
    }
    const newNotes = pageData.data.find((e) => e.type === 'notes')?.text || '';
    setNotes(newNotes);
    if (notesElement.current) {
      notesElement.current.value = newNotes;
      notesElement.current.style.height = 'auto';
      notesElement.current.style.height =
        notesElement.current.scrollHeight + 'px';
    }
  }, [pages, pageData.data]);

  async function imgPreview(file, data) {
    data.fileChanged = true;
    if (!file) {
      data.file = undefined;
      data.fileUrl = undefined;
      return;
    }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    data.file = file;
    data.fileUrl = url;
  }

  async function handlePsuedoSubmit() {
    const thisPageIndex = pages.findIndex((e) => e === pageData);
    const endOfForm =
      pageData.data[0].type === 'submit' ? thisPageIndex - 1 : thisPageIndex;
    let startOfForm;
    for (let i = endOfForm; i > 0; i--) {
      if (pages[i].type === 'recipeForm') {
        if (pages[i].data[0].type === 'title') {
          startOfForm = i;
          break;
        }
      }
    }
    const formPages = pages.slice(startOfForm, endOfForm + 1);
    const data = new FormData();
    const image = extractImage(formPages) as Blob;
    data.append('image', image);
    const title = formPages[0].data[0].text as string;
    data.append('cookbookId', String(cookbookId));
    data.append('title', title);
    const ingredients = [
      ...extractText(formPages, 'img-and-ingredients'),
      ...extractText(formPages, 'ingredients'),
    ]; // An array
    data.append('ingredients', JSON.stringify(ingredients));
    const directions = extractText(formPages, 'directions'); // An array
    data.append('directions', JSON.stringify(directions));
    const notes = extractText(formPages, 'notes'); // An array
    data.append('notes', JSON.stringify(notes));
    data.append('length', String(endOfForm + 1 - startOfForm));
    if (imgStore?.fileChanged) data.append('imageState', 'new');
    if (formPages[0].data[0].id) {
      data.append(
        'order',
        String(
          pages[2].data.findIndex(
            (entry) => entry?.id === formPages[0].data[0].id
          )
        )
      );
      try {
        const auth = localStorage.getItem(authKey);
        if (!auth) throw new Error('not properly logged in');
        const result = await fetch(
          `/api/update-recipe/${cookbookId}/${formPages[0].data[0].id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${JSON.parse(auth).token}`,
            },
            body: data,
          }
        );
        const formattedResult = await result.json();
        if (!result.ok) throw new Error(formattedResult.error);
        const newRecipePages = await getRecipeById(
          cookbookId,
          formattedResult.recipeId
        );
        if (!newRecipePages) throw new Error('Failed to fetch new recipe!');
        pages.splice(
          startOfForm,
          endOfForm + 1 - startOfForm,
          ...newRecipePages
        );
        if (pageData.data[0].type === 'submit') pages.splice(endOfForm + 1, 1);
        setPages(pages);
        updateToc(pages, formattedResult);
        navigate(`/cookbook/${cookbookId}/page/${endOfForm}`);
      } catch (err) {
        alert(err);
      }
    } else {
      data.append('order', String(pages[2].data.length - 1));
      try {
        const auth = localStorage.getItem(authKey);
        if (!auth) throw new Error('not properly logged in');
        const result = await fetch('/api/create-recipe', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${JSON.parse(auth).token}`,
          },
          body: data,
        });
        const formattedResult = await result.json();
        if (!result.ok) throw new Error(formattedResult.error);
        const newRecipePages = await getRecipeById(
          cookbookId,
          formattedResult.recipeId
        );
        if (!newRecipePages) throw new Error('Failed to fetch new recipe!');
        pages.splice(
          startOfForm,
          endOfForm + 1 - startOfForm,
          ...newRecipePages
        );
        if (pageData.data[0].type === 'submit') pages.splice(endOfForm + 1, 1);
        setPages(pages);
        addToToc(pages, formattedResult);
        navigate(`/cookbook/${cookbookId}/page/${endOfForm}`);
      } catch (err) {
        alert(err);
      }
    }
  }

  const checkPageEnd = useCallback(() => {
    const availableHeight = width < 1280 ? 398 : 736; // with current Cookbook Position, update if changed
    const submitHeight = width < 1280 ? 24 : 48; // with current submit element, update if changed
    const lineHeight = width < 1280 ? 16 : 32; // for non-title inputs with current font size, update if changed
    const imageHeight = width < 1280 ? 120 : 240; // for non-title inputs with current font size, update if changed
    const lastInput =
      notesElement.current ||
      directionsElement.current ||
      ingredientsElement.current ||
      titleElement.current;
    if (!lastInput) return;
    const simElement = simulationElement.current;
    if (!simElement) return;
    const lastInputRect = lastInput?.getBoundingClientRect();
    const isSubmitPresent =
      pageData.data[pageData.data.length - 1].type === 'submit' ? true : false;
    const endOfPage =
      pageData.data[pageData.data.length - 1].type === 'img-and-ingredients' &&
      lastInputRect.height < 104 * (width < 1280 ? 1 : 2)
        ? imageHeight
        : lastInputRect.bottom + (isSubmitPresent ? submitHeight : 0);
    const formHasNextPage =
      pages[thisPageNum + 1]?.type === 'recipeForm' &&
      pages[thisPageNum + 1]?.data[0]?.type !== 'title';

    let changedAnything = false;
    const thisPage = pageData;
    if (endOfPage > availableHeight) {
      changedAnything = true;
      const nextPage = formHasNextPage
        ? pages[thisPageNum + 1]
        : { type: 'recipeForm', data: [] };
      if (!formHasNextPage) pages.splice(thisPageNum + 1, 0, nextPage);
      handleOverflow({
        availableHeight,
        endOfPage,
        submitHeight,
        lineHeight,
        imageHeight,
        isSubmitPresent,
        thisPage,
        nextPage,
        lastInput,
        lastInputRect,
        simElement,
        width,
      });
    } else {
      if (!formHasNextPage) return;
      const nextPage = pages[thisPageNum + 1];
      changedAnything = handleUnderflow({
        availableHeight,
        endOfPage,
        submitHeight,
        lineHeight,
        imageHeight,
        isSubmitPresent,
        thisPage,
        nextPage,
        lastInput,
        lastInputRect,
        simElement,
        width,
      });
    }
    if (changedAnything) {
      setPages([...pages]);
    }
  }, [pageData, pages, setPages, thisPageNum, width]);

  useEffect(() => checkPageEnd(), [checkPageEnd]);

  return (
    <div className="text-xs px-[10px]">
      {pageData.data.map((e) => {
        keyCount++;
        switch (e.type) {
          case 'title':
            return (
              <textarea
                name="title"
                rows={1}
                className={`block text-center text-base w-full resize-none
                  py-[12px] bg-[#ffffff88] h-[40px] overflow-hidden
                  leading-[16px] cols`}
                placeholder="[Input title here]"
                ref={titleElement}
                onChange={(event) => {
                  e.text = event.target.value;
                  setTitle(event.target.value);
                  const beforeHeight = event.target.style.height;
                  event.target.style.height = 'auto';
                  event.target.style.height = event.target.scrollHeight + 'px';
                  const afterHeight = event.target.style.height;
                  if (beforeHeight !== afterHeight) checkPageEnd();
                }}
                value={title}
                key={`key:${keyCount}`}></textarea>
            );
          case 'img-and-ingredients':
            return (
              <div className="relative flex" key={`key:${keyCount}`}>
                <label
                  className={`basis-[120px] h-[120px] ${
                    imgUrl ? 'bg-[#ffffff00]' : 'bg-[#ffffff88]'
                  } text-xs text-center text-[#9CA3AF]`}>
                  {imgUrl ? (
                    <div className="h-full">
                      <img
                        src={imgUrl}
                        className="object-cover h-full mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="hover:scale-110">
                      <p className="text-[40px] mt-[48px] mb-[4px]">+</p>
                      [Click to add an image]
                    </div>
                  )}
                  <input
                    name="image"
                    type="file"
                    accept=".png, .jpg, .jpeg, .gif"
                    className="hidden"
                    onChange={(event) => {
                      if (event.target.files) {
                        imgPreview(event.target.files[0], e);
                      }
                    }}></input>
                </label>
                {imgUrl && (
                  <div
                    className={`absolute top-[80px] left-[80px] w-[40px] h-[40px]
                  bg-gradient-to-br from-[#ffffff00] from-50% to-[#88888899] to-50%`}>
                    <div
                      className="w-[16px] h-[16px] m-[20px] pl-[1px] text-base
                  hover:scale-110 cursor-pointer"
                      onClick={() => imgPreview(undefined, e)}>
                      <FaTrash />
                    </div>
                  </div>
                )}
                <div className="basis-[141px] self-stretch">
                  {e.first && (
                    <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                      Ingredients
                    </h2>
                  )}
                  <textarea
                    name="ingredients"
                    rows={1}
                    className={`w-full pl-[2px] resize-none bg-[#ffffff88] overflow-hidden`}
                    placeholder="[Input ingredients here]"
                    style={{ fontSize: '14px' }}
                    ref={ingredientsElement}
                    onChange={(event) => {
                      e.text = event.target.value;
                      setIngredients(event.target.value);
                      const beforeHeight = event.target.style.height;
                      event.target.style.height = 'auto';
                      event.target.style.height =
                        event.target.scrollHeight + 'px';
                      const afterHeight = event.target.style.height;
                      if (beforeHeight !== afterHeight) checkPageEnd();
                    }}
                    value={ingredients}></textarea>
                </div>
              </div>
            );
          case 'ingredients':
            return (
              <div
                className="flex justify-end my-[-4px]"
                key={`key:${keyCount}`}>
                <div className="basis-[141px] self-stretch my-1">
                  {e.first && (
                    <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                      Ingredients
                    </h2>
                  )}
                  <textarea
                    name="ingredients"
                    rows={1}
                    className={`w-full pl-[2px] resize-none bg-[#ffffff88] overflow-hidden`}
                    placeholder="[Input ingredients here]"
                    style={{ fontSize: '14px' }}
                    ref={ingredientsElement}
                    onChange={(event) => {
                      e.text = event.target.value;
                      setIngredients(event.target.value);
                      const beforeHeight = event.target.style.height;
                      event.target.style.height = 'auto';
                      event.target.style.height =
                        event.target.scrollHeight + 'px';
                      const afterHeight = event.target.style.height;
                      if (beforeHeight !== afterHeight) checkPageEnd();
                    }}
                    value={ingredients}></textarea>
                </div>
              </div>
            );
          case 'directions':
            return (
              <React.Fragment key={`key:${keyCount}`}>
                {e.first && (
                  <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                    Directions
                  </h2>
                )}
                <textarea
                  name="directions"
                  rows={1}
                  className={`block w-full px-[2px] resize-none bg-[#ffffff88]
                    overflow-hidden`}
                  placeholder="[Input directions here]"
                  style={{ fontSize: '14px' }}
                  ref={directionsElement}
                  onChange={(event) => {
                    e.text = event.target.value;
                    setDirections(event.target.value);
                    const beforeHeight = event.target.style.height;
                    event.target.style.height = 'auto';
                    event.target.style.height =
                      event.target.scrollHeight + 'px';
                    const afterHeight = event.target.style.height;
                    if (beforeHeight !== afterHeight) checkPageEnd();
                  }}
                  value={directions}></textarea>
              </React.Fragment>
            );
          case 'notes':
            return (
              <React.Fragment key={`key:${keyCount}`}>
                {e.first && (
                  <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                    Notes
                  </h2>
                )}
                <textarea
                  name="notes"
                  rows={1}
                  className={`block w-full px-[2px] resize-none bg-[#ffffff88]
                    overflow-hidden`}
                  placeholder="[Input notes here]"
                  value={notes}
                  style={{ fontSize: '14px' }}
                  ref={notesElement}
                  onChange={(event) => {
                    e.text = event.target.value;
                    setNotes(event.target.value);
                    const beforeHeight = event.target.style.height;
                    event.target.style.height = 'auto';
                    event.target.style.height =
                      event.target.scrollHeight + 'px';
                    const afterHeight = event.target.style.height;
                    if (beforeHeight !== afterHeight) checkPageEnd();
                  }}></textarea>
              </React.Fragment>
            );
          case 'submit':
            return (
              <button
                className="block underline mx-auto text-base hover:scale-110"
                onClick={handlePsuedoSubmit}
                key={`key:${keyCount}`}>
                Submit
              </button>
            );
        }
      })}
      <textarea
        rows={1}
        className={`absolute top-0 pointer-events-none px-[2px] resize-none
          overflow-hidden opacity-0`}
        style={{ fontSize: '14px' }}
        ref={simulationElement}></textarea>
    </div>
  );
}

function extractImage(formPages: PageData[]) {
  for (const formPage of formPages) {
    const imageStore = formPage.data.find(
      (element) => element.type === 'img-and-ingredients'
    );
    if (imageStore?.file) {
      return imageStore.file;
    } else {
      return undefined;
    }
  }
}

function extractText(formPages: PageData[], keyWord: string) {
  const textArray: string[] = [];
  for (const formPage of formPages) {
    const keyInput = formPage.data.find((element) => element.type === keyWord);
    if (keyInput?.text) {
      textArray.push(keyInput.text);
    } else {
      if (!(keyWord === 'ingredients')) textArray.push('');
    }
  }
  return textArray;
}
