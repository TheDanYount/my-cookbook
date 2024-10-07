import { useState } from 'react';
import { IndividualPageProps } from './Page';

export function RecipeForm({ pageData, pages }: IndividualPageProps) {
  const imgStore = pageData.data.find((e) => e.type === 'img-and-ingredients');
  const [imgUrl, setImgUrl] = useState<string | undefined>(imgStore?.fileUrl);
  let keyCount = -1;
  const currentPage = pages.findIndex((e) => e === pageData);

  async function imgPreview(file, data) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      setImgUrl(e.target?.result as string);
      data.file = file;
      data.fileUrl = e.target?.result as string;
    };
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
    const image = extractImage(formPages);
    data.append('image', image);
    const title = formPages[0].data[0].text as string;
    data.append('title', title);
    const ingredients = extractText(formPages, 'ingredients'); // An array
    data.append('ingredients', JSON.stringify(ingredients));
    const directions = extractText(formPages, 'directions'); // An array
    data.append('directions', JSON.stringify(directions));
    const notes = extractText(formPages, 'notes'); // An array
    data.append('notes', JSON.stringify(notes));
    try {
      const result = await fetch('/api/create-recipe', {
        method: 'POST',
        body: data,
      });
      const formattedResult = await result.json();
      if (!result.ok) throw new Error(formattedResult.error);
      alert('Recipe added successfully!');
    } catch (err) {
      alert(err);
    }
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
                className={`block text-center text-base w-full resize-none mb-1 bg-[#ffffff88]`}
                placeholder="[Input title here]"
                onChange={(event) => (e.text = event.currentTarget.value)}
                value={e.text}
                key={`page:${currentPage},key:${keyCount}`}></textarea>
            );
          case 'img-and-ingredients':
            return (
              <div
                className="flex my-[-4px]"
                key={`page:${currentPage},key:${keyCount}`}>
                <label
                  className={`w-[120px] h-[120px] my-1 ${
                    imgUrl ? 'bg-[#ffffff00]' : 'bg-[#ffffff88]'
                  } text-xs text-center text-[#9CA3AF]`}>
                  {imgUrl ? (
                    <div className="relative h-full">
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
                <textarea
                  name="ingredients"
                  placeholder="[Input ingredients here]"
                  className={`block basis-[151px] px-[2px] self-stretch resize-none my-1 bg-[#ffffff88]`}
                  style={{ fontSize: '12px' }}
                  onChange={(event) => (e.text = event.currentTarget.value)}
                  value={e.text}></textarea>
              </div>
            );
          case 'ingredients':
            return (
              <div
                className="flex justify-end my-[-4px]"
                key={`page:${currentPage},key:${keyCount}`}>
                <textarea
                  name="ingredients"
                  placeholder="[Input ingredients here]"
                  className={`block basis-[151px] px-[2px] resize-none my-1 bg-[#ffffff88]`}
                  style={{ fontSize: '12px' }}
                  onChange={(event) => (e.text = event.currentTarget.value)}
                  value={e.text}></textarea>
              </div>
            );
          case 'directions':
            return (
              <textarea
                name="directions"
                placeholder="[Input directions here]"
                className={`block w-full px-[2px] resize-none my-1 bg-[#ffffff88]`}
                style={{ fontSize: '12px' }}
                onChange={(event) => (e.text = event.currentTarget.value)}
                value={e.text}
                key={`page:${currentPage},key:${keyCount}`}></textarea>
            );
          case 'notes':
            return (
              <textarea
                name="notes"
                placeholder="[Input notes here]"
                className={`block w-full px-[2px] resize-none my-1 bg-[#ffffff88]`}
                style={{ fontSize: '12px' }}
                onChange={(event) => (e.text = event.currentTarget.value)}
                value={e.text}
                key={`page:${currentPage},key:${keyCount}`}></textarea>
            );
          case 'submit':
            return (
              <button
                className="block underline mx-auto text-base hover:scale-110"
                onClick={handlePsuedoSubmit}
                key={`page:${currentPage},key:${keyCount}`}>
                Submit
              </button>
            );
        }
      })}
    </div>
  );
}

function extractImage(formPages) {
  for (const formPage of formPages) {
    const imageStore = formPage.data.find(
      (element) => element.type === 'img-and-ingredients'
    );
    if (imageStore.file) {
      return imageStore.file;
    } else {
      return undefined;
    }
  }
}

function extractText(formPages, keyWord) {
  const textArray: string[] = [];
  for (const formPage of formPages) {
    const keyInput = formPage.data.find((element) => element.type === keyWord);
    if (keyInput?.text) {
      textArray.push(keyInput.text);
    } else textArray.push('');
  }
  return textArray;
}
