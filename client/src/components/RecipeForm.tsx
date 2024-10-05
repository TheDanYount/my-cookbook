import { useState } from 'react';

export function RecipeForm() {
  const [imgUrl, setImgUrl] = useState<string>();

  async function imgPreview(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => setImgUrl(e.target?.result as string);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
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
    <form className="px-[10px]" onSubmit={handleSubmit}>
      <textarea
        name="title"
        placeholder="[Input title here]"
        className={`block text-center w-full resize-none mb-1 bg-[#ffffff88]`}></textarea>
      <div className="flex my-[-4px]">
        <label
          className={`w-[120px] h-[120px] my-1 ${
            imgUrl ? 'bg-[#ffffff00]' : 'bg-[#ffffff88]'
          } text-xs text-center text-[#9CA3AF]`}>
          {imgUrl ? (
            <div className="relative h-full page-fade">
              <img src={imgUrl} className="object-cover h-full mx-auto" />
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
            onChange={(e) =>
              e.target.files && imgPreview(e.target.files[0])
            }></input>
        </label>
        <textarea
          name="ingredients"
          placeholder="[Input ingredients here]"
          className={`block basis-[151px] px-[2px] self-stretch resize-none my-1 bg-[#ffffff88]`}
          style={{ fontSize: '12px' }}></textarea>
      </div>
      <textarea
        name="directions"
        placeholder="[Input directions here]"
        className={`block w-full px-[2px] resize-none my-1 bg-[#ffffff88]`}
        style={{ fontSize: '12px' }}></textarea>
      <textarea
        name="notes"
        placeholder="[Input notes here]"
        className={`block w-full px-[2px] resize-none my-1 bg-[#ffffff88]`}
        style={{ fontSize: '12px' }}></textarea>
      <div className="h-[40px]">
        <button className="block underline mx-auto hover:scale-110">
          Submit
        </button>
        <p className="text-xs"></p>
      </div>
    </form>
  );
}
