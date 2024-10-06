import { useEffect, useState } from 'react';
import { Page } from './Page';
import { useWindowDimensions } from '../lib/window-dimensions';

type Props = {
  style: string;
  title: string;
};

type PageData = {
  type: string;
  data: object;
};

const dummyPagesForDevelopment = [
  { type: 'title', data: {} },
  { type: 'toc', data: {} },
  { type: 'edit', data: {} },
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
    const newPageNum = leftPage + number;
    if (
      Math.abs(number) === 2 &&
      newPageNum >= 1 &&
      newPageNum <= pages.length
    ) {
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
        <Page left={true} onPageTurn={handlePageTurn} pageNum={leftPage} />
      </div>
      <div
        className="w-[294px] h-[372px] rounded-r-[6px] pt-[13px]"
        style={{ backgroundColor: style }}>
        <Page left={false} onPageTurn={handlePageTurn} pageNum={leftPage + 1} />
      </div>
    </div>
  );
}
