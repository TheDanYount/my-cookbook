import { FaChevronRight } from 'react-icons/fa';

type Props = {
  isFlipped?: boolean;
  onButtonClick: () => void;
};

export function CarouselButton({ isFlipped, onButtonClick }: Props) {
  return (
    <button onClick={onButtonClick}>
      <FaChevronRight
        className={`text-[40px] m-[6px] ${
          isFlipped ? 'scale-[-1] hover:scale-[-1.1]' : 'hover:scale-110'
        } `}
      />
    </button>
  );
}
