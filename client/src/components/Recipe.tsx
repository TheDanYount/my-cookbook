import { IndividualPageProps } from './Page';

export function Recipe({ pageData, pages }: IndividualPageProps) {
  let keyCount = -1;
  const currentPage = pages.findIndex((e) => e === pageData);

  return (
    <div className="text-xs px-[10px]">
      {pageData.data.map((e) => {
        keyCount++;
        switch (e.type) {
          case 'title':
            return (
              <h1
                className="text-center text-base w-full"
                key={`page:${currentPage},key:${keyCount}`}>
                {e.text}
              </h1>
            );
          case 'img-and-ingredients':
            return (
              <div
                className="flex my-[-4px]"
                key={`page:${currentPage},key:${keyCount}`}>
                <div className={`w-[120px] h-[120px] my-1`}>
                  <img
                    src={e.fileUrl}
                    className="object-cover h-full mx-auto"
                  />
                </div>
                <p
                  className={`block basis-[151px] px-[2px] my-1`}
                  style={{ fontSize: '12px' }}>
                  {e.text}
                </p>
              </div>
            );
          case 'directions':
            return (
              <p
                className={`px-[2px] my-1`}
                style={{ fontSize: '12px' }}
                key={`page:${currentPage},key:${keyCount}`}>
                {e.text}
              </p>
            );
          case 'notes':
            return (
              <p
                className={`px-[2px] my-1`}
                style={{ fontSize: '12px' }}
                key={`page:${currentPage},key:${keyCount}`}>
                {e.text}
              </p>
            );
        }
      })}
    </div>
  );
}
