import { useNavigate } from 'react-router-dom';
import { Cookbook } from './HomePage';

type Props = {
  cookbooks: Cookbook[];
};

export function CarouselContents({ cookbooks }: Props) {
  const navigate = useNavigate();
  return (
    <>
      {cookbooks?.map((book) => {
        const titleColorIndex = book.style.indexOf('titleColor');
        const titleColor = book.style.slice(
          titleColorIndex + 11,
          titleColorIndex + 18
        );
        const bgColorIndex = book.style.indexOf('bgColor');
        const bgColor = book.style.slice(bgColorIndex + 8, bgColorIndex + 15);
        return (
          <button
            className="shrink-0 w-[150px] h-[210px] border-white border-2
                rounded-[6px] hover:scale-105 flex flex-col h-[206px]
                items-center overflow-hidden break-words text-[26px]"
            onClick={() => navigate(`/cookbook/${book.cookbookId}/page/1`)}
            key={`cookbook${book.cookbookId}`}
            style={{ backgroundColor: bgColor }}>
            <div className="basis-[40px]"></div>
            <p className="w-full break-words" style={{ color: titleColor }}>
              {book.title}
            </p>
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
    </>
  );
}
