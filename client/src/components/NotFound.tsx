import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <p>
      Page not found. Click{' '}
      <Link to="" className="underline text-[#0000FF]">
        here
      </Link>{' '}
      to return to the homepage.
    </p>
  );
}
