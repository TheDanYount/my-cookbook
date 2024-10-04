import { RecipeForm } from './RecipeForm';

type Props = {
  left: boolean;
};

export function Page({ left }: Props) {
  return (
    <div
      className={`w-[281px] h-[346px] bg-gradient-to-r
        ${left ? 'from-[#FFE8AA]' : 'from-[#A89971]'}
        ${left ? 'from-90%' : 'from-0%'}
        ${left ? 'to-[#A89971]' : 'to-[#FFE8AA]'}
        ${left || 'to-10%'}`}>
      {left && <RecipeForm />}
    </div>
  );
}
