import { useParams } from 'react-router-dom';
import { RxCaretSort } from 'react-icons/rx';
import { FaPencilAlt } from 'react-icons/fa';
import { convertRecipeToForm } from '../lib/page-scaffolding';

type TocEntryProps = {
  text: string;
  pageNum: number;
  length: number;
  placementOnPage: number;
  onPointerMove: (event) => void;
  onPointerDown: (event) => void;
  onPageTurn: (number) => void;
};

export function ToCEntry({
  text,
  pageNum,
  length,
  placementOnPage,
  onPointerMove,
  onPointerDown,
  onPageTurn,
}: TocEntryProps) {
  const { pageNum: currentPage } = useParams();

  function handleRecipeNavigation() {
    if (!currentPage) return;
    onPageTurn(pageNum - +currentPage);
  }

  function handleEdit() {
    convertRecipeToForm(pageNum);
    handleRecipeNavigation();
  }

  return (
    <div
      className="relative h-[16px]"
      data-title={text}
      data-length={length}
      data-placementonpage={placementOnPage}
      onPointerMove={onPointerMove}>
      <div className="absolute flex justify-between items-start w-full">
        <div className="flex hover:scale-110 hover:cursor-pointer">
          <div className="text-base" onPointerDown={onPointerDown}>
            <RxCaretSort />
          </div>
          <div className="my-[2px]" onClick={handleEdit}>
            <FaPencilAlt />
          </div>
          <p className="select-none" onClick={handleRecipeNavigation}>
            {text}
          </p>
        </div>
        <p className="select-none">{Number(pageNum)}</p>
      </div>
    </div>
  );
}
