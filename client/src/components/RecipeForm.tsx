import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { IndividualPageProps } from './Page';
import { Entrant, PageData } from './Cookbook';
import { addToToc, updateToc, getRecipeById } from '../lib/page-scaffolding';
import { CookbookContext } from './CookbookContext';
import { FaTrash } from 'react-icons/fa';
import { authKey } from './UserContext';
import React from 'react';
import { useWindowDimensions } from '../lib/window-dimensions';

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
      ...extractText(formPages, 'ingredients'),
      ...extractText(formPages, 'img-and-ingredients'),
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
        alert('Recipe updated successfully!');
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
        if (pageData.data[0].type === 'submit')
          pages.splice(pages.length - 1, 1);
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
        alert('Recipe added successfully!');
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
        if (pageData.data[0].type === 'submit')
          pages.splice(pages.length - 1, 1);
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
    const lastInput =
      notesElement.current ||
      directionsElement.current ||
      ingredientsElement.current ||
      titleElement.current;
    if (!lastInput) return;
    if (!simulationElement.current) return;
    const lastInputRect = lastInput?.getBoundingClientRect();
    const isSubmitPresent =
      pageData.data[pageData.data.length - 1].type === 'submit' ? true : false;
    /*
    Determine end of page
      While content is too long
        let changedAnything = false
        If nextPage is of this form
          set it as nextPage
        Else
          Create new page and splice it in pages
          set it as nextPage
        If submit is present
          Pop submit as entrantToBeMoved
          Unshift EntrantToBeMoved
          Update remainingExcess
          ChangedAnything = true
        Else if last element should be moved entirely
          Pop
          Unshift
          Update remainingExcess
            If not first: with height
            Else if 'img-and-ingredients and height < 104: with (width < 1280 ? 120 : 240)
            Else: with height + lineHeight (for subtitle)
          ChangedAnything = true
        Else, meaning split
          Update simulationElement's width to lastInput's width
          use adjustInput with heightGoal of height - remainingExcess, original text, & simulationElement, it returns text & unformattedLeftover
          If UL starts with a '\n' and has length > 1, trim it w/ splice(1);
          Update remainingExcess with
            If img-and-ingredients and height < (width < 1280 ? 104 : 208): height - (width < 1280 ? 120 : 240)
            Else: height - simulationElement.current.getBoundingRect().height
          Set lastInput's text to text
          Set entrantToBeMoved to contain leftover unless types match, in which case set first element on next page to have text of leftover + '\n' + current
          ChangedAnything = true
        If changedAnything
            setPages
      While content is too short
        Check for next page
          If not, break
        Check for if emptySpace >= lineHeight + 1
          If not, break
        let changedAnything = false
        If submit is next
          If emptySpace > submitHeight
            Pop
            Unshift
            Update emptySpace
            ChangedAnything = true
          Else
            Break
        Else if types match and emptySpace
          Update simulationElement's width to lastInput's width
          use adjustInput with heightGoal of height + emptySpace, the concatenated texts, & simulationElement, it returns text & unformattedLeftover
          Update emptySpace with simulationElement.current.getBoundingRect().height - height
          If UL is blank
            shift
          Else
            If UL starts w/ '\n' and has length > 1
              Trim
            Next page's first element's text is set to UL
          Set lastInput's text to text
          ChangedAnything = true
        Else if next is 'img-and-ingredients'
          If emptySpace >= (width < 1280 ? 120 : 240)
          Update simulationElement's width to lastInput's width
          use adjustInput with heightGoal of height + emptySpace, next's text, & simulationElement, it returns text & unformattedLeftover
          Update emptySpace with
            If simulationElement's height > (width < 1280 ? 120 : 240)
              simulationElement's height
            Else
              (width < 1280 ? 120 : 240)
          Push a copy of 'img-and-ingredients with text as text
          Shift
            If Ul !== ''
              If UL starts w/ '\n' and has length > 1
                Trim
              Create new 'ingredients' with UL as text
              Unshift new 'ingredients'
          Else
            Break
        Else if next is 'ingredients'
          Update simulationElement's width to lastInput's width
          use adjustInput with heightGoal of height <= (width < 1280 ? 120 : 240) ? (width < 1280 ? 120 : 240) + emptySpace : height + emptySpace, the concatenated texts, & simulationElement, it returns text & unformattedLeftover
          Update emptySpace with
            If simulationElement's height < (width < 1280 ? 120 : 240): 0
            If height <= (width < 1280 ? 120 : 240)
              simulationElement's height - (width < 1280 ? 120 : 240)
            Else
              simulationElement's height - height
          Set lastInput's text to text
          If Ul !== ''
            If UL starts w/ '\n' and has length > 1
              Trim
            Next's text = UL
          Else
            Shift
          ChangedAnything = true
        Else if types do not match and emptySpace >= 2*lineHeight + 1
          Update simulationElement's width to lastInput's width
          use adjustInput with heightGoal of height + emptySpace, next's text, & simulationElement, it returns text & unformattedLeftover
          Update emptySpace with simulationElement's height + lineHeight
          Push entrantToBeMoved with text as text and first
          If UL starts with '\n' and has length > 1
            trim
          If l !== ''
            Next's text = L
          Else
            Shift
          ChangedAnything = true
          Else
            Break
        If changedAnything
            setPages

    */
    while (false) {
      if (changedAnything) {
        setPages([...pages]);
      }
    }
  }, [pageData, pages, setPages, thisPageNum]);

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
        className="absolute top-0 pointer-events-none px-[2px] resize-none overflow-hidden opacity-0"
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

function adjustInput(
  heightGoal: number,
  text: string,
  element: HTMLTextAreaElement
): string[] {
  if (text === '') return ['\n', ''];
  const recursiveTextSplitter = (
    str,
    leftover,
    lengthOfSplit,
    finalComparison
  ): string[] | undefined => {
    element.value = str;
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
    if (element.scrollHeight > heightGoal) {
      if (lengthOfSplit === 1) {
        if (finalComparison) {
          return undefined;
        } else {
          return [
            str.slice(0, str.length - 1),
            str.slice(str.length - 1) + leftover,
          ];
        }
      }
      return recursiveTextSplitter(
        str.slice(0, str.length - Math.ceil(lengthOfSplit / 2)),
        str.slice(str.length - Math.ceil(lengthOfSplit / 2)) + leftover,
        Math.ceil(lengthOfSplit - lengthOfSplit / 2),
        false
      );
    } else {
      if (lengthOfSplit === 1) {
        if (finalComparison) {
          return [str, leftover];
        } else {
          return (
            recursiveTextSplitter(
              str + leftover.slice(0, 1),
              leftover.slice(1),
              1,
              true
            ) || [str, leftover]
          );
        }
      }
      return recursiveTextSplitter(
        str + leftover.slice(0, Math.ceil(lengthOfSplit / 2)),
        leftover.slice(Math.ceil(lengthOfSplit / 2)),
        Math.ceil(lengthOfSplit - lengthOfSplit / 2),
        false
      );
    }
  };
  return recursiveTextSplitter(
    text.slice(0, text.length / 2),
    text.slice(text.length / 2),
    Math.ceil(text.length / 2),
    false
  ) as string[];
}
