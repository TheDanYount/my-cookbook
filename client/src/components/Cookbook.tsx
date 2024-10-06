import { useState } from 'react';
import { Page } from './Page';

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
  const [currentPage, setCurrentPage] = useState(1);
  // The following is just here to calm my linter during development
  console.log(title, 'title');
  console.log(pages, 'pages');
  console.log(setPages, 'setPages');

  function handlePageTurn(number) {
    const newPageNum = currentPage + number;
    if (newPageNum >= 1 && newPageNum <= pages.length) {
      setCurrentPage(currentPage + number);
    }
  }

  return (
    <div className="flex w-[588px] m-[60px]">
      <div
        className="w-[294px] h-[372px] rounded-l-[6px] pt-[13px] pl-[13px]"
        style={{ backgroundColor: style }}>
        <Page left={true} onPageTurn={handlePageTurn} pageNum={currentPage} />
      </div>
      <div
        className="w-[294px] h-[372px] rounded-r-[6px] pt-[13px]"
        style={{ backgroundColor: style }}>
        <Page
          left={false}
          onPageTurn={handlePageTurn}
          pageNum={currentPage + 1}
        />
      </div>
    </div>
  );
}
