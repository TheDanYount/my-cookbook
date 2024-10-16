import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars } from 'react-icons/fa6';
import { useWindowDimensions } from '../lib/window-dimensions';

export function Menu() {
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(true);
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
          {isOpen && (
            <>
              <h1
                className={`font-["Permanent_Marker"] ${
                  width < 660 ? 'text-[30px]' : 'text-[45px]'
                } shadow-[0_2px_white]`}>
                MyCookbook
              </h1>
              <div className="placeholder w-[50px] h-[50px]"></div>
            </>
          )}
        </div>
        {isOpen && (
          <div className="flex flex-col items-center">
            <h2 className="mt-[40px] text-[28px] font-semibold shadow-[0_2px_white]">
              Cookbooks
            </h2>
            <div className="flex mt-[20px] gap-[20px]">
              <button className="w-[150px] h-[210px] border-white border-2 rounded-[6px] hover:scale-105 children-hover-sm">
                <div className="flex flex-col justify-center items-center h-full">
                  <p className='font-["Patrick_Hand"] text-[50px]'>+</p>
                  <p className='font-["Patrick_Hand"] w-4/5'>
                    Click to create your first cookbook!
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
}
