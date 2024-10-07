import { useEffect, useState } from 'react';
import { Page } from './Page';
import { useWindowDimensions } from '../lib/window-dimensions';

type Props = {
  style: string;
  title: string;
};

export type PageData = {
  type: string;
  data: { type: string; text?: string; file?: unknown; fileUrl?: string }[];
};

const dummyPagesForDevelopment = [
  { type: 'title', data: [] },
  { type: 'title', data: [] },
  { type: 'toc', data: [{ type: 'title' }, { type: 'addRecipeButton' }] },
  { type: 'edit', data: [] },
];

export function Cookbook({ style, title }: Props) {
  const [pages, setPages] = useState<PageData[]>([...dummyPagesForDevelopment]);
  const [leftPage, setLeftPage] = useState(1);
  const { width } = useWindowDimensions();
  const [smallScreenShift, setSmallScreenShift] = useState(false);

  useEffect(() => {
    if (width >= 660) {
      setSmallScreenShift(false);
    }
  }, [width]);

  // The following is just here to calm my linter during development
  console.log(title, 'title');
  console.log(pages, 'pages');
  console.log(setPages, 'setPages');

  function handlePageTurn(number) {
    if (Math.abs(number) === 2) {
      setLeftPage(leftPage + number);
    } else if (number === -1 && smallScreenShift) {
      setSmallScreenShift(false);
    } else if (number === 1 && !smallScreenShift) {
      setSmallScreenShift(true);
    }
  }

  return (
    <div
      className={`${
        smallScreenShift ? 'ml-[-234px]' : ''
      } flex w-[588px] m-[60px]`}>
      <div
        className="w-[294px] h-[372px] rounded-l-[6px] pt-[13px] pl-[13px]"
        style={{ backgroundColor: style }}>
        <Page
          left={true}
          onPageTurn={handlePageTurn}
          pageNum={leftPage}
          pageData={pages[leftPage]}
          pages={pages}
          setPages={setPages}
        />
      </div>
      <div
        className="w-[294px] h-[372px] rounded-r-[6px] pt-[13px]"
        style={{ backgroundColor: style }}>
        {pages[leftPage + 1] && (
          <Page
            left={false}
            onPageTurn={handlePageTurn}
            pageNum={leftPage + 1}
            pageData={pages[leftPage + 1]}
            pages={pages}
            setPages={setPages}
          />
        )}
      </div>
    </div>
  );
}
