import { Page } from './Page';

type Props = {
  style: string;
  title: string;
};

export function Cookbook({ style, title }: Props) {
  // The following is just here to calm my linter during development
  console.log(title, 'title');
  return (
    <div className="flex w-[588px] m-[60px]">
      <div
        className="w-[294px] h-[372px] rounded-l-[6px] pt-[13px] pl-[13px]"
        style={{ backgroundColor: style }}>
        <Page left={true} />
      </div>
      <div
        className="w-[294px] h-[372px] rounded-r-[6px] pt-[13px]"
        style={{ backgroundColor: style }}>
        <Page left={false} />
      </div>
    </div>
  );
}
