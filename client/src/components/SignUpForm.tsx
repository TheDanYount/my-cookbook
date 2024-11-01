import { useContext, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

export function SignUpForm() {
  const navigate = useNavigate();
  const { handleSignIn, handleSignOut } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [imgFile, setImgFile] = useState();
  const [checkedBg, setCheckedBg] = useState('#C45056');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');
  handleSignOut();

  async function imgPreview(file) {
    if (file) {
      setImgUrl(URL.createObjectURL(file));
      setImgFile(file);
    }
  }

  async function handlePseudoSubmit() {
    if (!username) {
      alert('A username is required!');
      return;
    }
    if (!(password === password2)) {
      alert('Password and re-entered password must match!');
      return;
    }
    const data = new FormData();
    data.append('newPhotoUrl', imgUrl ? 'new' : '');
    data.append('username', username);
    data.append('password', password);
    data.append('email', email);
    data.append('firstName', firstName);
    data.append('lastName', lastName);
    data.append('style', checkedBg);
    if (imgFile) data.append('image', imgFile as Blob);
    try {
      setIsLoading(true);
      const result = await fetch('/api/auth/sign-up', {
        method: 'POST',
        body: data,
      });
      const formattedResult = await result.json();
      if (!result.ok) throw new Error(formattedResult.error);
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      };
      const result2 = await fetch('/api/auth/sign-in', req);
      const formattedResult2 = await result2.json();
      if (!result2.ok) throw new Error(formattedResult2.error);
      const { user, token } = formattedResult2;
      handleSignIn(user, token);
      navigate('/');
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-[28px] font-semibold text-center underline">
        Sign up
      </h2>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          {page === 0 && (
            <div
              className={`flex flex-col items-center w-[200px] mx-auto
        text-[24px] font-['Patrick_Hand']`}>
              <label className="mt-[30px]">
                First:
                <input
                  name="firstName"
                  value={firstName}
                  className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
                  onChange={(event) => setFirstName(event.currentTarget.value)}
                />
              </label>
              <label>
                Last:
                <input
                  name="lastName"
                  value={lastName}
                  className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
                  onChange={(event) => setLastName(event.currentTarget.value)}
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
                    setImgUrl('');
                    setImgFile(undefined);
                  }}>
                  <FaTrash className="text-[24px]" />
                </div>
              )}
              <p className="mt-[30px] mb-[4px]">Background:</p>
              <div className="flex gap-[4px]">
                <button
                  className={`w-[48px] h-[48px] border-white border-2 rounded-[6px]
                font-bold hover:scale-110 outline-0`}
                  onClick={() => setCheckedBg('#C45056')}>
                  {checkedBg === '#C45056' && '\u2713'}
                </button>
                <button
                  className="w-[48px] h-[48px] border-white border-2 rounded-[6px]
              font-bold bg-[#4E88BF] hover:scale-110 outline-0"
                  onClick={() => setCheckedBg('#4E88BF')}>
                  {checkedBg === '#4E88BF' && '\u2713'}
                </button>
                <button
                  className="w-[48px] h-[48px] border-white border-2 rounded-[6px]
              font-bold bg-[#3E3F5B] hover:scale-110 outline-0"
                  onClick={() => setCheckedBg('#3E3F5B')}>
                  {checkedBg === '#3E3F5B' && '\u2713'}
                </button>
                <label>
                  <button
                    className="relative w-[48px] h-[48px] border-white border-2
                rounded-[6px] hover:scale-110 leading-[16px] font-bold
                outline-0"
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
                  value={username}
                  className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
                  onChange={(event) => setUsername(event.currentTarget.value)}
                />
              </label>
              <label>
                Password:
                <input
                  name="password"
                  type="password"
                  value={password}
                  className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
                  onChange={(event) => setPassword(event.currentTarget.value)}
                />
              </label>
              <label>
                Re-enter Password:
                <input
                  name="password2"
                  type="password"
                  value={password2}
                  className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
                  onChange={(event) => setPassword2(event.currentTarget.value)}
                />
              </label>
              <label>
                Email:
                <input
                  name="email"
                  type="email"
                  value={email}
                  className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
                  onChange={(event) => setEmail(event.currentTarget.value)}
                />
              </label>
              <button
                className="mt-[30px] text-[30px] underline font-normal
          hover:scale-110"
                onClick={handlePseudoSubmit}>
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
      )}
    </>
  );
}
