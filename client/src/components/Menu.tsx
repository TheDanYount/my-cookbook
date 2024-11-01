import { useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { FaBars } from 'react-icons/fa6';
import { useWindowDimensions } from '../lib/window-dimensions';
import { CookbookContext } from './CookbookContext';
import { CookbookForm } from './CookbookForm';
import { UserContext } from './UserContext';
import { SignUpForm } from './SignUpForm';
import { HomePage } from './HomePage';
import { SignInForm } from './SignInForm';
import { authKey } from './UserContext';

type Props = {
  mode?: string;
};

export function Menu({ mode }: Props) {
  const { width } = useWindowDimensions();
  const { user } = useContext(UserContext);
  const { handleSignIn } = useContext(UserContext);
  const { cookbookId } = useParams();
  const { setCookbook } = useContext(CookbookContext);
  const [isOpen, setIsOpen] = useState<boolean>(cookbookId ? false : true);

  useEffect(() => {
    const stringAuth = localStorage.getItem(authKey);
    const auth = stringAuth ? JSON.parse(stringAuth) : undefined;
    if (auth) {
      handleSignIn(auth.user, auth.token);
    }
  }, [handleSignIn]);

  useEffect(() => {
    setIsOpen(cookbookId ? false : true);
    if (!cookbookId) return;
    async function getCookbook() {
      try {
        const auth = localStorage.getItem(authKey);
        if (!auth) throw new Error('not properly logged in');
        const result = await fetch(`/api/read-cookbook/${cookbookId}`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(auth).token}`,
          },
        });
        const formattedResult = await result.json();
        if (!result.ok) throw new Error(formattedResult.error);
        setCookbook(formattedResult);
      } catch (err) {
        alert(err);
      }
    }
    getCookbook();
  }, [cookbookId, setCookbook]);

  return (
    <>
      <div
        className={`absolute top-0 transition-all duration-500 ${
          isOpen ? 'w-4/5 left-[10%]' : 'w-[50px] left-0'
        } h-full font-["Shantell_Sans"] text-white z-50
        shadow-[0_0_6px_2px_#000000aa]`}
        style={{ backgroundColor: `${user ? user.style : '#C45056'}` }}>
        <div className="flex justify-between">
          <button
            className="w-[50px] h-[50px] children-hover "
            onClick={() => setIsOpen(!isOpen)}>
            <FaBars className="w-[32px] h-[32px] mx-auto" />
          </button>
          {isOpen && !mode && (
            <>
              <h1
                className={`font-["Permanent_Marker"] inline-block mx-auto wrap ${
                  width < 660 ? 'text-[30px]' : 'text-[45px]'
                } text-center shadow-[0_2px_white] basis-[204px]`}>
                {user ? 'MyCookBook' : `Welcome to MyCookbook!`}
              </h1>
              <div className="placeholder w-[50px] h-[50px]"></div>
            </>
          )}
        </div>
        {isOpen && (
          <>
            {!mode && (user ? <HomePage /> : <SignInForm />)}
            {mode === 'sign-up' && <SignUpForm />}
            {mode === 'create-cookbook' && <CookbookForm />}
          </>
        )}
      </div>
      <Outlet />
    </>
  );
}
