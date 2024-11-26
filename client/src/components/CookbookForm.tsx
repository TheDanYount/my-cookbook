import { useContext, useState } from 'react';
import { authKey, UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';

export function CookbookForm() {
  const [title, setTitle] = useState<string>('');
  const [titleColor, setTitleColor] = useState('#FFBF00');
  const [bgColor, setBgColor] = useState('#825134');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  async function handlePsuedoSubmit() {
    const data = {
      userId: user?.userId,
      style: `titleColor:${titleColor}, bgColor:${bgColor}`,
      title: title,
    };
    try {
      const auth = localStorage.getItem(authKey);
      if (!auth) throw new Error('not properly logged in');
      const result = await fetch('/api/create-cookbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(auth).token}`,
        },
        body: JSON.stringify(data),
      });
      const formattedResult = await result.json();
      if (!result.ok) throw new Error(formattedResult.error);
      navigate(`/cookbook/${formattedResult.cookbookId}/page/1`);
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
            className="block w-[200px] border-2 rounded-[6px]"
            style={{ backgroundColor: user?.style }}
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
