import { useNavigate } from 'react-router-dom';
import { authKey } from './UserContext';
import { useEffect, useState } from 'react';
import { CarouselButton } from './CarouselButton';

type Cookbook = {
  cookbookId: number;
  isPublic: boolean;
  style: string;
  title: string;
  userId: number;
};

type Props = {
  setIsOpen: (boolean) => void;
};

export function HomePage({ setIsOpen }: Props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [debounce, setDebounce] = useState<boolean>();
  const [carouselTeleports, setCarouselTeleports] = useState<boolean>();

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
        <p>Loading...</p>
      ) : (
        <div className="flex justify-evenly items-center mt-[20px] w-full">
          <CarouselButton
            isFlipped
            onButtonClick={() => handleCarouselTurn(-1)}
          />
          <div className="basis-[70%] p-[6px] overflow-hidden">
            <div
              className={`flex gap-[20px] ${
                carouselTeleports ||
                'transition-[margin-left] duration-[250ms] ease-in-out'
              }`}
              style={{ marginLeft: `${carouselIndex * -170}px` }}>
              {cookbooks?.map((book) => {
                const titleColorIndex = book.style.indexOf('titleColor');
                const titleColor = book.style.slice(
                  titleColorIndex + 11,
                  titleColorIndex + 18
                );
                const bgColorIndex = book.style.indexOf('bgColor');
                const bgColor = book.style.slice(
                  bgColorIndex + 8,
                  bgColorIndex + 15
                );
                return (
                  <button
                    className="shrink-0 w-[150px] h-[210px] border-white border-2
                rounded-[6px] hover:scale-105"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/cookbook/${book.cookbookId}/page/1`);
                    }}
                    key={`cookbook${book.cookbookId}`}>
                    <div
                      className="flex flex-col h-[206px] overflow-hidden
                break-words text-[26px] rounded-[6px]"
                      style={{ backgroundColor: bgColor }}>
                      <div className="basis-[40px]"></div>
                      <p className="text-pretty" style={{ color: titleColor }}>
                        {book.title}
                      </p>
                    </div>
                  </button>
                );
              })}
              <button
                className="shrink-0 w-[150px] h-[210px] border-white border-2 rounded-[6px]
            hover:scale-105"
                onClick={() => navigate('/create-cookbook')}>
                <div className="flex flex-col justify-center items-center h-full">
                  <p className='font-["Patrick_Hand"] text-[50px]'>+</p>
                  <p className='font-["Patrick_Hand"] w-4/5'>
                    {!cookbooks
                      ? 'Click to create your first cookbook!'
                      : 'Click to create a new cookbook!'}
                  </p>
                </div>
              </button>
              {cookbooks?.map((book) => {
                const titleColorIndex = book.style.indexOf('titleColor');
                const titleColor = book.style.slice(
                  titleColorIndex + 11,
                  titleColorIndex + 18
                );
                const bgColorIndex = book.style.indexOf('bgColor');
                const bgColor = book.style.slice(
                  bgColorIndex + 8,
                  bgColorIndex + 15
                );
                return (
                  <button
                    className="shrink-0 w-[150px] h-[210px] border-white border-2
                rounded-[6px] hover:scale-105"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/cookbook/${book.cookbookId}/page/1`);
                    }}
                    key={`cookbook${book.cookbookId}v2`}>
                    <div
                      className="flex flex-col h-[206px] overflow-hidden
                break-words text-[26px] rounded-[6px]"
                      style={{ backgroundColor: bgColor }}>
                      <div className="basis-[40px]"></div>
                      <p className="text-pretty" style={{ color: titleColor }}>
                        {book.title}
                      </p>
                    </div>
                  </button>
                );
              })}
              <button
                className="shrink-0 w-[150px] h-[210px] border-white border-2 rounded-[6px]
            hover:scale-105"
                onClick={() => navigate('/create-cookbook')}>
                <div className="flex flex-col justify-center items-center h-full">
                  <p className='font-["Patrick_Hand"] text-[50px]'>+</p>
                  <p className='font-["Patrick_Hand"] w-4/5'>
                    {!cookbooks
                      ? 'Click to create your first cookbook!'
                      : 'Click to create a new cookbook!'}
                  </p>
                </div>
              </button>
            </div>
          </div>
          <CarouselButton onButtonClick={() => handleCarouselTurn(1)} />
        </div>
      )}
    </div>
  );
}
