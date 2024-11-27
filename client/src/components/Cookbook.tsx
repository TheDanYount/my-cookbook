import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from './Page';
import { useWindowDimensions } from '../lib/window-dimensions';
import { buildToc, getRecipes } from '../lib/page-scaffolding';
import { CookbookContext } from './CookbookContext';

export type Entrant = {
  type: string;
  text?: string;
  file?: undefined | Blob;
  fileUrl?: string;
  fileChanged?: boolean;
  pageNum?: number;
  length?: number;
  id?: number;
  first?: boolean;
};

export type PageData = {
  type: string;
  data: Entrant[];
};

const zerothPagePlaceholder = { type: '', data: [] };

export function Cookbook() {
  const { cookbookId, pageNum } = useParams();
  const { cookbook } = useContext(CookbookContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [pages, setPages] = useState<PageData[]>([]);
  const [leftPage, setLeftPage] = useState(
    pageNum ? +pageNum - ((+pageNum + 1) % 2) : 1
  );
  const { width } = useWindowDimensions();
  const [smallScreenShift, setSmallScreenShift] = useState(width < 660);
  const [largeScreenZoom, setLargeScreenZoom] = useState(width >= 1280);

  useEffect(() => {
    if (!cookbook || !cookbookId || cookbook?.cookbookId !== +cookbookId)
      return;
    async function setup() {
      setIsLoading(true);
      try {
        const recipes = await getRecipes(cookbook?.cookbookId);
        if (recipes) {
          setPages(() => {
            const toc = buildToc(recipes);
            const titlePage = {
              type: 'title',
              data: [{ type: 'title', text: cookbook?.title }],
            };
            return [zerothPagePlaceholder, titlePage, toc, ...recipes];
          });
          setIsLoading(false);
        }
      } catch (err) {
        alert(err);
      }
    }
    setup();
  }, [cookbook, cookbookId]);

  useEffect(() => {
    if (!(isLoading === false)) return;
    if (!pageNum || +pageNum < 1 || +pageNum > pages.length - 1) {
      alert('page not found');
      navigate('/NotFound');
      throw new Error('page not found');
    }
    setLeftPage(+pageNum - ((+pageNum + 1) % 2));
  }, [pageNum, navigate, isLoading, pages.length]);

  useEffect(() => {
    if (width >= 1280 && largeScreenZoom === false) {
      setLargeScreenZoom(true);
    } else if (width < 1280 && largeScreenZoom === true) {
      setLargeScreenZoom(false);
    }
    if (width < 660 && smallScreenShift === false) {
      setSmallScreenShift(true);
    } else if (width >= 660 && smallScreenShift === true) {
      setSmallScreenShift(false);
    }
  }, [width, smallScreenShift, largeScreenZoom]);

  if (!(isLoading === false))
    return (
      <div className="h-screen flex justify-center items-center">
        <img
          src="/rimmed-loader.png"
          alt="loading spinner"
          className="h-[40px] animate-spin"></img>
      </div>
    );

  function handlePageTurn(number) {
    if (!pageNum) return;
    if (number === 2 && +pageNum === pages.length - 2) number -= 1;
    navigate(`/cookbook/${cookbook?.cookbookId}/page/${+pageNum + number}`);
  }

  const bgColorIndex = cookbook?.style.indexOf('bgColor');
  const bgColor =
    bgColorIndex && cookbook?.style.slice(bgColorIndex + 8, bgColorIndex + 15);

  return (
    <div
      className={`font-["Patrick_Hand"] text-[14px] ${
        smallScreenShift && pageNum
          ? +pageNum - leftPage === 1
            ? 'ml-[-234px]'
            : 'ml-[37px]'
          : 'mx-auto'
      }
          flex w-[588px]
      ${largeScreenZoom ? 'mt-[246px]' : 'mt-[60px]'}
      ${largeScreenZoom && 'scale-[2]'}`}>
      <div
        className="w-[294px] h-[372px] rounded-l-[6px] pt-[13px] pl-[13px]"
        style={{ backgroundColor: bgColor || '#4C301E' }}>
        {isLoading === false && pages[leftPage]?.type && (
          <Page
            left
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
        style={{ backgroundColor: bgColor || '#4C301E' }}>
        {isLoading === false && pages[leftPage + 1]?.type && (
          <Page
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
