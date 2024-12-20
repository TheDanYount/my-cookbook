import { useParams } from 'react-router-dom';
import { useWindowDimensions } from '../lib/window-dimensions';
import { PageData } from './Cookbook';
import { Recipe } from './Recipe';
import { RecipeForm } from './RecipeForm';
import { TitlePage } from './TitlePage';
import { ToC } from './ToC';

type Props = {
  left?: boolean;
  onPageTurn: (number) => void;
  thisPageNum: number;
  pageData: PageData;
  pages: PageData[];
  setPages: (pages: PageData[]) => void;
};

export type IndividualPageProps = {
  pageData: PageData;
  pages: PageData[];
  setPages: (pages: PageData[]) => void;
};

export function Page({
  left,
  onPageTurn,
  thisPageNum,
  pageData,
  pages,
  setPages,
}: Props) {
  const { width } = useWindowDimensions();
  const { pageNum } = useParams();
  return (
    <div
      className={`relative flex flex-col justify-between w-[281px] h-[346px] bg-gradient-to-r
        ${left ? 'from-[#FFE8AA]' : 'from-[#A89971]'}
        ${left ? 'from-90%' : 'from-0%'}
        ${left ? 'to-[#A89971]' : 'to-[#FFE8AA]'}
        ${left || 'to-10%'}`}>
      {pageData.type === 'title' && (
        <TitlePage title={pageData.data[0].text || ''} />
      )}
      {pageData.type === 'toc' && (
        <ToC pageData={pageData} pages={pages} setPages={setPages} />
      )}
      {pageData.type === 'recipe' && (
        <Recipe pageData={pageData} pages={pages} setPages={setPages} />
      )}
      {pageData.type === 'recipeForm' && (
        <RecipeForm
          pageData={pageData}
          pages={pages}
          setPages={setPages}
          thisPageNum={thisPageNum}
        />
      )}
      <div className="flex w-full text-[14px] self-center">
        <div className="basis-[40px] grow text-right">
          {left && thisPageNum > 1 && (
            <button onClick={() => onPageTurn(-2)}>Back</button>
          )}
          {!left && width < 660 && pageNum && +pageNum > 1 && (
            <button onClick={() => onPageTurn(-1)}>Back</button>
          )}
        </div>
        <p className="mx-2">{`- ${thisPageNum} -`}</p>
        <div className="basis-[40px] grow">
          {!left && thisPageNum < pages.length - 1 && (
            <button onClick={() => onPageTurn(2)}>Next</button>
          )}
          {left && width < 660 && pages.length > thisPageNum + 1 && (
            <button onClick={() => onPageTurn(1)}>Next</button>
          )}
        </div>
      </div>
    </div>
  );
}
