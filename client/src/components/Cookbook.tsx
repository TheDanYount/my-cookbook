import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from './Page';
import { useWindowDimensions } from '../lib/window-dimensions';
import { buildToc, getRecipes } from '../lib/page-scaffolding';

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
    length?: number;
    id?: number;
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
  const [isLoading, setIsLoading] = useState<boolean>();
  const [pages, setPages] = useState<PageData[]>([]);
  const [leftPage, setLeftPage] = useState(
    pageNum ? +pageNum - ((+pageNum + 1) % 2) : 1
  );
  const { width } = useWindowDimensions();
  const [smallScreenShift, setSmallScreenShift] = useState(width < 660);

  useEffect(() => {
    async function setup() {
      setIsLoading(true);
      try {
        const recipes = await getRecipes(cookbookId);
        if (recipes) {
          setPages(() => {
            const toc = buildToc(recipes);
            return [...dummyPagesForDevelopment, toc, ...recipes];
          });
          setIsLoading(false);
        }
      } catch (err) {
        alert(err);
      }
    }
    if (isLoading === undefined) setup();
  }, [cookbookId, isLoading]);

  useEffect(() => {
    if (width < 660 && smallScreenShift === false) {
      setSmallScreenShift(true);
    } else if (width >= 660 && smallScreenShift === true) {
      setSmallScreenShift(false);
    }
  }, [width, smallScreenShift]);

  if (
    isLoading === false &&
    (!pageNum || +pageNum < 1 || +pageNum > pages.length - 1)
  ) {
    navigate('/NotFound');
    return;
  }

  if (!(isLoading === false)) {
    return 'Loading';
  }

  function handlePageTurn(number) {
    if (!pageNum) return;
    navigate(`/cookbook/${cookbookId}/page/${+pageNum + number}`);
    setLeftPage(+pageNum + number - ((+pageNum + number + 1) % 2));
  }

  return (
    <div
      className={`font-["Patrick_Hand"] text-[14px] ${
        smallScreenShift && pageNum && +pageNum - leftPage === 1
          ? 'ml-[-234px]'
          : ''
      } flex w-[588px] mt-[60px] ${width < 660 ? 'ml-[60px]' : 'mx-auto'}`}>
      <div
        className="w-[294px] h-[372px] rounded-l-[6px] pt-[13px] pl-[13px]"
        style={{ backgroundColor: style }}>
        {isLoading === false && pages[leftPage]?.type && (
          <Page
            left={true}
            onPageTurn={handlePageTurn}
            thisPageNum={leftPage}
            pageData={pages[leftPage]}
            pages={pages}
            setPages={setPages}
          />
        )}
      </div>
      <div
        className="w-[294px] h-[372px] rounded-r-[6px] pt-[13px]"
        style={{ backgroundColor: style }}>
        {isLoading === false && pages[leftPage + 1]?.type && (
          <Page
            left={false}
            onPageTurn={handlePageTurn}
            thisPageNum={leftPage + 1}
            pageData={pages[leftPage + 1]}
            pages={pages}
            setPages={setPages}
          />
        )}
      </div>
    </div>
  );
}
