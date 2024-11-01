type Props = {
  title: string;
};

export function TitlePage({ title }: Props) {
  return (
    <>
      <div className="basis-[0px] grow-[1]"></div>
      <h1
        className="font-['Shantell_Sans'] text-[38px] text-center
      text-wrap p-[10px]">
        {title}
      </h1>
      <div className="basis-[0px] grow-[2]"></div>
    </>
  );
}
