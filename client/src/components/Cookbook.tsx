import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from './Page';
import { useWindowDimensions } from '../lib/window-dimensions';
import { buildToc, getRecipes } from '../lib/page-skeletons';

// For development
const style = '#4C301E';

export type PageData = {
  type: string;
  data: {
    type: string;
    text?: string;
    file?: unknown;
    fileUrl?: string;
    pageNum?: number;
  }[];
};

const dummyPagesForDevelopment = [
  { type: 'title', data: [] },
  { type: 'title', data: [] },
];

export function Cookbook() {
  const { cookbookId, pageNum } = useParams();
  const navigate = useNavigate();
  if (!cookbookId || !pageNum) navigate('/NotFound');
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<PageData[]>([...dummyPagesForDevelopment]);
  const [leftPage, setLeftPage] = useState(
    pageNum ? +pageNum - ((+pageNum + 1) % 2) : 1
  );
  const { width } = useWindowDimensions();
  const [smallScreenShift, setSmallScreenShift] = useState(false);

  async function setup() {
    const recipes = await getRecipes(cookbookId);
    const toc = recipes ? buildToc([...pages, ...recipes]) : buildToc(pages);
    if (recipes) {
      setPages([...pages, toc, ...recipes]);
      setIsLoading(false);
    }
  }
  if (isLoading) {
    setup();
  }

  useEffect(() => {
    if (width < 660 && pageNum && leftPage < +pageNum) {
      setSmallScreenShift(true);
    } else {
      setSmallScreenShift(false);
    }
  }, [width, leftPage, pageNum]);

  useEffect(() => {
    if (!pageNum || +pageNum < 1 || +pageNum > pages.length) {
      navigate('/NotFound');
      return;
    }
  }, [pageNum, pages, navigate]);

  if (isLoading) {
    return 'Loading';
  }

  function handlePageTurn(number) {
    if (!pageNum) return;
    if (Math.abs(number) === 2) {
      navigate(`/cookbook/${cookbookId}/page/${+pageNum + number}`);
      setLeftPage(leftPage + number);
    } else if (number === -1 && smallScreenShift) {
      navigate(`/cookbook/${cookbookId}/page/${+pageNum + number}`);
    } else if (number === 1 && !smallScreenShift) {
      navigate(`/cookbook/${cookbookId}/page/${+pageNum + number}`);
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
        {pages.length >= Number(pageNum) && (
          <Page
            left={true}
            onPageTurn={handlePageTurn}
            pageNum={leftPage}
            pageData={pages[leftPage]}
            pages={pages}
            setPages={setPages}
          />
        )}
      </div>
      <div
        className="w-[294px] h-[372px] rounded-r-[6px] pt-[13px]"
        style={{ backgroundColor: style }}>
        {pages.length >= Number(pageNum) + 2 && (
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
