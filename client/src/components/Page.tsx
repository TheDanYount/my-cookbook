import { useWindowDimensions } from '../lib/window-dimensions';
import { PageData } from './Cookbook';
import { Recipe } from './Recipe';
import { RecipeForm } from './RecipeForm';
import { ToC } from './ToC';

type Props = {
  left: boolean;
  onPageTurn: (number) => void;
  thisPageNum: number;
  pageData: PageData;
  pages: PageData[];
  setPages: (pages: PageData[]) => void;
  cookbookId;
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
  cookbookId,
}: Props) {
  const { width } = useWindowDimensions();
  return (
    <div
      className={`relative flex flex-col justify-between w-[281px] h-[346px] bg-gradient-to-r
        ${left ? 'from-[#FFE8AA]' : 'from-[#A89971]'}
        ${left ? 'from-90%' : 'from-0%'}
        ${left ? 'to-[#A89971]' : 'to-[#FFE8AA]'}
        ${left || 'to-10%'}`}>
      {pageData.type === 'toc' && (
        <ToC
          pageData={pageData}
          pages={pages}
          setPages={setPages}
          onPageTurn={onPageTurn}
        />
      )}
      {pageData.type === 'recipe' && (
        <Recipe pageData={pageData} pages={pages} setPages={setPages} />
      )}
      {pageData.type === 'recipeForm' && (
        <RecipeForm
          pageData={pageData}
          pages={pages}
          setPages={setPages}
          cookbookId={cookbookId}
        />
      )}
      <div className="flex text-xs self-center">
        {left && thisPageNum > 1 && (
          <button onClick={() => onPageTurn(-2)}>Back</button>
        )}
        {!left && width < 660 && (
          <button onClick={() => onPageTurn(-1)}>Back</button>
        )}
        <p className="mx-2">{`- ${thisPageNum} -`}</p>
        {!left && thisPageNum < pages.length - 1 && (
          <button onClick={() => onPageTurn(2)}>Next</button>
        )}
        {left && width < 660 && pages.length > thisPageNum + 1 && (
          <button onClick={() => onPageTurn(1)}>Next</button>
        )}
      </div>
    </div>
  );
}
