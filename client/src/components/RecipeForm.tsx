import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { IndividualPageProps } from './Page';
import { PageData } from './Cookbook';
import { addToToc, getRecipeById } from '../lib/page-scaffolding';
import { CookbookContext } from './CookbookContext';
import { FaTrash } from 'react-icons/fa';
import { authKey } from './UserContext';
import React from 'react';

export function RecipeForm({ pageData, pages, setPages }: IndividualPageProps) {
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
  const navigate = useNavigate();
  let keyCount = -1;

  useEffect(() => {
    setImgUrl(imgStore?.fileUrl);
  }, [imgStore?.fileUrl]);

  async function imgPreview(file, data) {
    data.fileChanged = true;
    if (!file) {
      setImgUrl(undefined);
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
    const endOfForm = pages.findIndex((e) => e === pageData);
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
    const ingredients = extractText(formPages, 'img-and-ingredients'); // An array
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
        setPages(pages);
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
        setPages(pages);
        addToToc(pages, formattedResult);
        navigate(`/cookbook/${cookbookId}/page/${endOfForm}`);
      } catch (err) {
        alert(err);
      }
    }
  }

  function checkPageEnd() {
    console.log('hi');
  }

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
                    className={`absolute top-[84px] left-[80px] w-[40px] h-[40px]
                  bg-gradient-to-br from-[#ffffff00] from-50% to-[#88888899] to-50%`}>
                    <div
                      className="w-[16px] h-[16px] m-[20px] pl-[1px] text-base
                  hover:scale-110 cursor-pointer"
                      onClick={() => imgPreview(undefined, e)}>
                      <FaTrash />
                    </div>
                  </div>
                )}
                <div className="basis-[141px] pl-[2px] self-stretch">
                  {e.first && (
                    <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                      Ingredients
                    </h2>
                  )}
                  <textarea
                    name="ingredients"
                    rows={1}
                    className={`w-full resize-none bg-[#ffffff88]`}
                    placeholder="[Input ingredients here]"
                    style={{ fontSize: '14px' }}
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
                <div className="basis-[141px] pl-[2px] self-stretch my-1">
                  {e.first && (
                    <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                      Ingredients
                    </h2>
                  )}
                  <textarea
                    name="ingredients"
                    rows={1}
                    className={`w-full resize-none bg-[#ffffff88]`}
                    placeholder="[Input ingredients here]"
                    style={{ fontSize: '14px' }}
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
                  className={`block w-full px-[2px] resize-none bg-[#ffffff88]`}
                  placeholder="[Input directions here]"
                  style={{ fontSize: '14px' }}
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
    } else textArray.push('');
  }
  return textArray;
}
