import { RxCaretSort } from 'react-icons/rx';

type TocEntryProps = {
  text: string;
  pageNum: number;
  length: number;
};

export function ToCEntry({ text, pageNum, length }: TocEntryProps) {
  return (
    <div className="relative h-[16px]" data-length={length}>
      <div className="absolute flex justify-between items-start w-full">
        <div className="flex hover:scale-110 hover:cursor-pointer">
          <div className="text-base">
            <RxCaretSort />
          </div>
          <p className="select-none">{text}</p>
        </div>
        <p>{Number(pageNum)}</p>
      </div>
    </div>
  );
}
