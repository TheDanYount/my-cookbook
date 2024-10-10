import { RxCaretSort } from 'react-icons/rx';

type TocEntryProps = {
  text: string;
  pageNum: number;
  length: number;
  placementOnPage: number;
  onPointerMove: (event) => void;
  onPointerDown: (event) => void;
};

export function ToCEntry({
  text,
  pageNum,
  length,
  placementOnPage,
  onPointerMove,
  onPointerDown,
}: TocEntryProps) {
  return (
    <div
      className="relative h-[16px] hover:cursor-pointer"
      data-title={text}
      data-length={length}
      data-placementonpage={placementOnPage}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}>
      <div className="absolute flex justify-between items-start w-full">
        <div className="flex hover:scale-110">
          <div className="text-base">
            <RxCaretSort />
          </div>
          <p className="select-none">{text}</p>
        </div>
        <p className="select-none">{Number(pageNum)}</p>
      </div>
    </div>
  );
}
