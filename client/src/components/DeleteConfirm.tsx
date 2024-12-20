type Props = {
  text: string;
  setDeleteConfirmId: (value: number | undefined) => void;
  onDeleteConfirm: () => void;
};

export function DeleteConfirm({
  text,
  setDeleteConfirmId,
  onDeleteConfirm,
}: Props) {
  return (
    <div className="absolute flex flex-col justify-center top-0 bottom-0 left-0 right-0 text-[14px] pointer-events-none">
      <div className="self-center text-center w-[220px] p-[10px] bg-[#FFE8AA] shadow-[0_0_5px_1px_#00000088] pointer-events-auto">
        <p>Are you sure you would like to delete {text}?</p>
        <div className="flex w-full mt-[8px] justify-around">
          <button
            className="underline hover:scale-110"
            onClick={() => setDeleteConfirmId(undefined)}>
            Cancel
          </button>
          <button
            className="underline hover:scale-110"
            onClick={onDeleteConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
