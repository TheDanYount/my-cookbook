import { useParams } from 'react-router-dom';
import { RxCaretSort } from 'react-icons/rx';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { convertRecipeToForm } from '../lib/page-scaffolding';
import { PageData } from './Cookbook';

type TocEntryProps = {
  entry: { text: string; pageNum: number; length: number; id: number };
  placementOnPage: number;
  onPointerMove: (event) => void;
  onPointerDown: (event) => void;
  onPageTurn: (number) => void;
  pages: PageData[];
  setPages: (pages: PageData[]) => void;
  onDelete: (id: number) => void;
};

export function ToCEntry({
  entry,
  placementOnPage,
  onPointerMove,
  onPointerDown,
  onPageTurn,
  pages,
  setPages,
  onDelete,
}: TocEntryProps) {
  const { pageNum: currentPage } = useParams();
  const { pageNum, text, length, id } = entry;

  function handleRecipeNavigation() {
    if (!currentPage) return;
    onPageTurn(pageNum - +currentPage);
  }

  function handleEdit() {
    convertRecipeToForm(pages, setPages, pageNum, length);
    handleRecipeNavigation();
  }

  return (
    <div
      className="relative h-[16px]"
      data-title={text}
      data-length={length}
      data-placementonpage={placementOnPage}
      onPointerMove={onPointerMove}>
      <div className="absolute children-hover flex justify-between items-start w-full">
        <div className="flex hover:cursor-pointer">
          <div className="text-base" onPointerDown={onPointerDown}>
            <RxCaretSort />
          </div>
          <div className="my-[2px]" onClick={handleEdit}>
            <FaPencilAlt />
          </div>
          <div className="my-[2px]" onClick={() => onDelete(id)}>
            <FaTrash />
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
