import { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars } from 'react-icons/fa6';
import { useWindowDimensions } from '../lib/window-dimensions';
import { CookbookContext } from './CookbookContext';
import { CookbookForm } from './CookbookForm';
import { UserContext } from './UserContext';
import { SignUpForm } from './SignUpForm';
import { HomePage } from './HomePage';
import { SignInForm } from './SignInForm';

export function Menu() {
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [isCookbookFormOpen, setIsCookbookFormOpen] = useState(false);
  const [isSignUpFormOpen, setIsSignUpFormOpen] = useState(false);
  const { cookbookId } = useContext(CookbookContext);
  const { userId } = useContext(UserContext);
  useEffect(() => {
    if (cookbookId === undefined) setIsOpen(true);
  }, [cookbookId]);

  return (
    <>
      <div
        className={`absolute top-0 transition-all duration-500 ${
          isOpen ? 'w-4/5 left-[10%]' : 'w-[50px] left-0'
        } h-full bg-[#C45056] font-["Shantell_Sans"] text-white z-50
        shadow-[0_0_6px_2px_#000000aa]`}>
        <div className="flex justify-between">
          <button
            className="w-[50px] h-[50px] children-hover "
            onClick={() => setIsOpen(!isOpen)}>
            <FaBars className="w-[32px] h-[32px] mx-auto" />
          </button>
          {isOpen && !isSignUpFormOpen && (
            <>
              <h1
                className={`font-["Permanent_Marker"] inline-block mx-auto wrap ${
                  width < 660 ? 'text-[30px]' : 'text-[45px]'
                } text-center shadow-[0_2px_white] basis-[204px]`}>
                {userId ? 'MyCookBook' : 'Welcome to MyCookbook!'}
              </h1>
              <div className="placeholder w-[50px] h-[50px]"></div>
            </>
          )}
        </div>
        {isOpen &&
          (userId ? (
            !isCookbookFormOpen ? (
              <HomePage setIsCookbookFormOpen={setIsCookbookFormOpen} />
            ) : (
              <CookbookForm />
            )
          ) : !isSignUpFormOpen ? (
            <SignInForm setIsSignUpFormOpen={setIsSignUpFormOpen} />
          ) : (
            <SignUpForm />
          ))}
      </div>
      <Outlet />
    </>
  );
}
