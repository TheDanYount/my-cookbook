import { useContext, useState } from 'react';
import { UserContext } from './UserContext';
import { CookbookContext } from './CookbookContext';

export function CookbookForm() {
  const [title, setTitle] = useState<string>('');
  const [titleColor, setTitleColor] = useState('#fff');
  const [bgColor, setBgColor] = useState('#4C301E');
  const { userId } = useContext(UserContext);
  const { setId } = useContext(CookbookContext);

  async function handlePsuedoSubmit() {
    const data = {
      userId: userId,
      style: `titleColor:${titleColor}, bgColor:${bgColor}`,
      title: title,
    };
    try {
      const result = await fetch('/api/create-cookbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const formattedResult = await result.json();
      if (!result.ok) throw new Error(formattedResult.error);
      console.log(formattedResult.cookbookId);
      setId(formattedResult.cookbookId);
      alert('Cookbook added successfully!');
    } catch (err) {
      alert(err);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="mt-[40px] text-[28px] font-semibold underline">
        New Cookbook
      </h2>
      <div className="flex flex-col items-center text-[20px]">
        <label className="block my-[20px]">
          Title:
          <input
            name="title"
            value={title}
            className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
        </label>
        <label className="relative flex flex-col items-center block my-[20px]">
          <p>Title Color:</p>
          <input
            className="opacity-0 w-[50px] h-[50px]"
            type="color"
            name="title-color"
            value={titleColor}
            onChange={(event) => setTitleColor(event.target.value)}
          />
          <div
            className="absolute bottom-0 w-[50px] h-[50px] border-2
          border-white rounded-[6px] hover:scale-110"
            style={{ backgroundColor: titleColor }}></div>
        </label>
        <label className="relative flex flex-col items-center block my-[20px]">
          <p>Background Color:</p>
          <input
            className="opacity-0 w-[50px] h-[50px]"
            type="color"
            name="bg-color"
            value={bgColor}
            onChange={(event) => setBgColor(event.target.value)}
          />
          <div
            className="absolute bottom-0 w-[50px] h-[50px] border-2
          border-white rounded-[6px] hover:scale-110"
            style={{ backgroundColor: bgColor }}></div>
        </label>
        <button
          className="text-[24px] underline hover:scale-110"
          onClick={handlePsuedoSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
