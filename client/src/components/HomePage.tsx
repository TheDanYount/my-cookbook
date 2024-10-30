import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center">
      <h2 className="mt-[40px] text-[28px] font-semibold underline">
        Cookbooks
      </h2>
      <div className="flex mt-[20px] gap-[20px]">
        <button
          className="w-[150px] h-[210px] border-white border-2 rounded-[6px] hover:scale-105 children-hover-sm"
          onClick={() => navigate('/create-cookbook')}>
          <div className="flex flex-col justify-center items-center h-full">
            <p className='font-["Patrick_Hand"] text-[50px]'>+</p>
            <p className='font-["Patrick_Hand"] w-4/5'>
              Click to create your first cookbook!
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
