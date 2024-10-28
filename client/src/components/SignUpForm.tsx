export function SignUpForm() {
  return (
    <>
      <h2 className="text-[28px] font-semibold text-center underline">
        Sign up
      </h2>
      <div className="flex flex-col items-center w-[200px] mx-auto text-[20px] font-['Patrick_Hand']">
        <label className="mt-[40px]">
          First:
          <input
            name="first"
            className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
          />
        </label>
        <label>
          Last:
          <input
            name="last"
            className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
          />
        </label>
        <label className="text-center mt-[40px]">
          Profile Pic:
          <div
            className={`w-[200px] h-[200px] mt-[20px] border-white border-2
            rounded-full hover:scale-105 text-[56px] leading-[184px]`}>
            +
          </div>
          <input
            type="file"
            accept=".png, .jpg, .jpeg, .gif"
            name="image"
            className="block w-[200px] bg-[#C45056] border-2 rounded-[6px] hidden"
          />
        </label>
      </div>
    </>
  );
}
