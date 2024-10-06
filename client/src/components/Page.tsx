import { RecipeForm } from './RecipeForm';

type Props = {
  left: boolean;
  onPageTurn: (number) => void;
  pageNum: number;
};

export function Page({ left, onPageTurn, pageNum }: Props) {
  return (
    <div
      className={`flex flex-col justify-between w-[281px] h-[346px] bg-gradient-to-r
        ${left ? 'from-[#FFE8AA]' : 'from-[#A89971]'}
        ${left ? 'from-90%' : 'from-0%'}
        ${left ? 'to-[#A89971]' : 'to-[#FFE8AA]'}
        ${left || 'to-10%'}`}>
      {left && <RecipeForm />}
      <div className="flex text-xs">
        <button onClick={() => onPageTurn(-1)}>Back</button>
        <p className="mx-2">{pageNum}</p>
        <button onClick={() => onPageTurn(1)}>Next</button>
      </div>
    </div>
  );
}
