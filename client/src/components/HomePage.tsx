import { authKey } from './UserContext';
import { useEffect, useState } from 'react';
import { CarouselButton } from './CarouselButton';
import { useWindowDimensions } from '../lib/window-dimensions';
import { CarouselContents } from './CarouselContents';

export type Cookbook = {
  cookbookId: number;
  isPublic: boolean;
  style: string;
  title: string;
  userId: number;
};

export function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [debounce, setDebounce] = useState<boolean>();
  const [carouselTeleports, setCarouselTeleports] = useState<boolean>();
  const { width } = useWindowDimensions();
  const visibleCookbooks = width < 660 ? 1 : width < 946 ? 2 : 3;
  useEffect(() => {
    async function getCookbooks() {
      try {
        const auth = localStorage.getItem(authKey);
        if (!auth) throw new Error('not properly logged in');
        const result = await fetch('/api/read-cookbooks', {
          headers: {
            Authorization: `Bearer ${JSON.parse(auth).token}`,
          },
        });
        const formattedResult = await result.json();
        if (!result.ok) throw new Error(formattedResult.error);
        setCookbooks(formattedResult);
        setCarouselIndex(formattedResult.length - 1);
        setIsLoading(false);
      } catch (err) {
        alert(err);
      }
    }
    getCookbooks();
  }, []);

  async function handleCarouselTurn(num) {
    if (debounce) return;
    setCarouselTeleports(false);
    setDebounce(true);
    const newIndex = carouselIndex + num;
    setCarouselIndex(newIndex);
    setTimeout(() => {
      if (newIndex < 0 || newIndex > cookbooks.length) {
        setCarouselTeleports(true);
        setCarouselIndex(
          (newIndex + cookbooks.length + 1) % (cookbooks.length + 1)
        );
      }
      setDebounce(false);
    }, 250);
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="mt-[40px] text-[28px] font-semibold underline">
        Cookbooks
      </h2>
      {isLoading ? (
        <div className="h-[262px] flex justify-center items-center">
          <img
            src="/rimmed-loader.png"
            alt="loading spinner"
            className="h-[40px] animate-spin"></img>
        </div>
      ) : (
        <div className="flex justify-center items-center mt-[20px] w-full">
          {cookbooks.length >= visibleCookbooks && (
            <CarouselButton
              isFlipped
              onButtonClick={() => handleCarouselTurn(-1)}
            />
          )}
          <div
            className={`${
              visibleCookbooks === 1
                ? 'basis-[218px]'
                : visibleCookbooks === 2
                ? 'basis-[378px]'
                : 'basis-[538px]'
            } p-[6px] overflow-hidden`}>
            <div
              className={`flex gap-[10px] ${
                carouselTeleports ||
                'transition-[margin-left] duration-[250ms] ease-in-out'
              } ${cookbooks.length < visibleCookbooks && 'justify-center'}`}
              style={{
                marginLeft: `${
                  cookbooks.length < visibleCookbooks
                    ? 0
                    : 28 + (carouselIndex + 1 + cookbooks.length) * -160
                }px`,
              }}>
              {cookbooks.length >= visibleCookbooks && (
                <CarouselContents cookbooks={cookbooks} />
              )}
              <CarouselContents cookbooks={cookbooks} />
              {cookbooks.length >= visibleCookbooks && (
                <CarouselContents cookbooks={cookbooks} />
              )}
            </div>
          </div>
          {cookbooks.length >= visibleCookbooks && (
            <CarouselButton onButtonClick={() => handleCarouselTurn(1)} />
          )}
        </div>
      )}
    </div>
  );
}
