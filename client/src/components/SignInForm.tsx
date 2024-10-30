import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';

export function SignInForm() {
  const { handleSignIn } = useContext(UserContext);
  async function handleLogin(event) {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };
      const result = await fetch('/api/auth/sign-in', req);
      const formattedResult = await result.json();
      if (!result.ok) throw new Error(formattedResult.error);
      const { user, token } = formattedResult;
      handleSignIn(user, token);
    } catch (err) {
      alert(err);
    }
  }

  return (
    <>
      <h2 className="mt-[120px] text-[28px] font-semibold text-center ">
        Sign in:
      </h2>
      <form
        className="flex flex-col items-center w-[200px] mx-auto text-[20px] font-['Patrick_Hand']"
        onSubmit={handleLogin}>
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
            name="password"
            type="password"
            className="block w-[200px] bg-[#C45056] border-2 rounded-[6px]"
          />
        </label>
        <Link to={'/sign-up'} className="text-[16px] underline  self-end">
          need to sign up? Click here!
        </Link>
        <button className="underline text-[28px]">Login</button>
      </form>
    </>
  );
}
