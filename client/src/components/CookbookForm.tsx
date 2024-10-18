import { useState } from 'react';

export function CookbookForm() {
  const [color, setColor] = useState('#4C301E');
  return (
    <div className="flex flex-col items-center">
      <h2 className="mt-[40px] text-[28px] font-semibold underline">
        New Cookbook
      </h2>
      <form className="flex flex-col items-center text-[20px]">
        <label className="block my-[20px]">
          Title:
          <input className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]" />
        </label>
        <label className="relative block my-[20px]">
          <p>Color:</p>
          <input
            className="opacity-0 w-[50px] h-[50px]"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
          <div
            className="absolute bottom-0 w-[50px] h-[50px] border-2
          border-white rounded-[6px] hover:scale-110"
            style={{ backgroundColor: color }}></div>
        </label>
        <input
          className="text-[24px] underline hover:scale-110"
          type="submit"
        />
      </form>
    </div>
  );
}
