export function RecipeForm() {
  async function handleSubmit(e) {
    e.preventDefault();
  }
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        name="title"
        placeholder="Title"
        className={`block text-center px-[10px] w-full resize-none`}></textarea>
      <div className="flex">
        <label>
          <input name="image" className="ml-[10px] w-[120px] h-[100px]"></input>
        </label>
        <textarea
          name="ingredients"
          placeholder="Ingredients"
          className={`block basis-[151px] px-[10px] resize-none`}></textarea>
      </div>
      <textarea
        name="directions"
        placeholder="Directions"
        className={`block px-[10px] w-full resize-none`}></textarea>
      <textarea
        name="notes"
        placeholder="Notes"
        className={`block px-[10px] w-full resize-none`}></textarea>
      <div className="px-[10px]">
        <button className="underline hover:scale-110">Submit</button>
        <p></p>
      </div>
    </form>
  );
}
