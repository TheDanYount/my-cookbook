import { Link } from 'react-router-dom';

export function SignInForm() {
  function handleLogin(event) {
    event.preventDefault();
  }

  return (
    <>
      <h2 className="mt-[120px] text-[28px] font-semibold text-center ">
        Sign in:
      </h2>
      <form className="flex flex-col items-center w-[200px] mx-auto text-[20px] font-['Patrick_Hand']">
        <label>
          Username:
          <input
            name="username"
            className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
          />
        </label>
        <label className="mt-[8px]">
          Password:
          <input
            name="username"
            className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
          />
        </label>
        <Link to={'/sign-up'} className="text-[16px] underline  self-end">
          need to sign up? Click here!
        </Link>
        <button className="underline text-[28px]" onClick={handleLogin}>
          Login
        </button>
      </form>
    </>
  );
}
