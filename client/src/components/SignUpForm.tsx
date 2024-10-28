import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

export function SignUpForm() {
  const [page, setPage] = useState(0);
  const [imgUrl, setImgUrl] = useState<string>();
  const [checkedBg, setCheckedBg] = useState('#C45056');
  async function imgPreview(file) {
    if (file) setImgUrl(URL.createObjectURL(file));
  }
  return (
    <>
      <h2 className="text-[28px] font-semibold text-center underline">
        Sign up
      </h2>
      {page === 0 && (
        <div
          className={`flex flex-col items-center w-[200px] mx-auto
        text-[24px] font-['Patrick_Hand']`}>
          <label className="mt-[30px]">
            First:
            <input
              name="first"
              className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
            />
          </label>
          <label>
            Last:
            <input
              name="last"
              className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
            />
          </label>
          <p className="text-center my-[30px]">Profile Pic:</p>
          <label className="text-center rounded-full select-none">
            <div
              className={`w-[200px] h-[200px] border-white border-2
            rounded-full hover:scale-105 text-[56px] leading-[184px]`}>
              {imgUrl ? (
                <img
                  src={imgUrl}
                  className="object-cover h-full mx-auto rounded-full"
                />
              ) : (
                '+'
              )}
            </div>
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .gif"
              name="image"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  imgPreview(event.target.files[0]);
                }
              }}
            />
          </label>
          {imgUrl && (
            <div
              className={`trash w-[21px] ml-auto mt-[-24px] cursor-pointer
                children-hover`}
              onClick={() => {
                setImgUrl(undefined);
              }}>
              <FaTrash className="text-[24px]" />
            </div>
          )}
          <p className="mt-[30px] mb-[4px]">Background:</p>
          <div className="flex gap-[4px]">
            <button
              className={`w-[48px] h-[48px] border-white border-2 rounded-[6px]
                font-bold hover:scale-110`}
              onClick={() => setCheckedBg('#C45056')}>
              {checkedBg === '#C45056' && '\u2713'}
            </button>
            <button
              className="w-[48px] h-[48px] border-white border-2 rounded-[6px]
              font-bold bg-[#4E88BF] hover:scale-110"
              onClick={() => setCheckedBg('#4E88BF')}>
              {checkedBg === '#4E88BF' && '\u2713'}
            </button>
            <button
              className="w-[48px] h-[48px] border-white border-2 rounded-[6px]
              font-bold bg-[#3E3F5B] hover:scale-110"
              onClick={() => setCheckedBg('#3E3F5B')}>
              {checkedBg === '#3E3F5B' && '\u2713'}
            </button>
            <label>
              <button
                className="relative w-[48px] h-[48px] border-white border-2
                rounded-[6px] hover:scale-110 leading-[16px] font-bold bg-"
                style={{
                  backgroundColor: `${
                    checkedBg !== '#C45056' &&
                    checkedBg !== '#4E88BF' &&
                    checkedBg !== '#3E3F5B'
                      ? checkedBg
                      : '#C45056'
                  }`,
                }}>
                {checkedBg !== '#C45056' &&
                  checkedBg !== '#4E88BF' &&
                  checkedBg !== '#3E3F5B' &&
                  '\u2713'}
                {(checkedBg === '#C45056' ||
                  checkedBg === '#4E88BF' ||
                  checkedBg === '#3E3F5B') && (
                  <p className="text-[48px] mt-[-8px] font-normal">+</p>
                )}
                <input
                  type="color"
                  className={`absolute opacity-0 top-0 left-0 w-[48px] h-[48px] cursor-pointer
                  ${
                    checkedBg !== '#C45056' &&
                    checkedBg !== '#4E88BF' &&
                    checkedBg !== '#3E3F5B' &&
                    checkedBg
                  }`}
                  onChange={(event) =>
                    setCheckedBg(event.target.value)
                  }></input>
              </button>
            </label>
          </div>
          <button
            className="mt-[30px] hover:scale-110"
            onClick={() => setPage(1)}>
            Next &gt;
          </button>
        </div>
      )}
      {page === 1 && (
        <div
          className={`flex flex-col items-center w-[200px] mx-auto
        text-[24px] font-['Patrick_Hand']`}>
          <label>
            Username:
            <input
              name="username"
              className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
            />
          </label>
          <label>
            Password:
            <input
              name="password"
              className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
            />
          </label>
          <label>
            Re-enter Password:
            <input
              name="password2"
              className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
            />
          </label>
          <label>
            Email:
            <input
              name="email"
              className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
            />
          </label>
          <button
            className="mt-[30px] text-[30px] underline font-normal
          hover:scale-110">
            Submit
          </button>
          <button
            className="mt-[30px] hover:scale-110"
            onClick={() => setPage(0)}>
            Prev &lt;
          </button>
        </div>
      )}
    </>
  );
}
