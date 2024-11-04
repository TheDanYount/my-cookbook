import React from 'react';
import { IndividualPageProps } from './Page';

export function Recipe({ pageData }: IndividualPageProps) {
  let keyCount = -1;

  return (
    <div className="text-xs px-[10px]">
      {pageData.data.map((e) => {
        keyCount++;
        let formattedText;
        if (e.text) {
          formattedText = e.text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {e.text && index < e.text.split('\n').length - 1 && <br />}
            </React.Fragment>
          ));
        }
        switch (e.type) {
          case 'title':
            return (
              <h1
                className='text-center text-[18px] my-[12px] w-full font-["Shantell_Sans"] font-semibold'
                key={'key:' + keyCount}>
                {formattedText}
              </h1>
            );
          case 'img-and-ingredients':
            return (
              <React.Fragment key={'key:' + keyCount}>
                <div className="flex my-[-4px]">
                  <div className={`basis-[120px] h-[120px] my-1`}>
                    <img
                      src={e.fileUrl}
                      className="object-cover h-full mx-auto"
                    />
                  </div>
                  <div className={`block basis-[141px] px-[2px] my-1`}>
                    {e.first && (
                      <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                        Ingredients
                      </h2>
                    )}
                    <p style={{ fontSize: '14px' }}>{formattedText}</p>
                  </div>
                </div>
              </React.Fragment>
            );
          case 'directions':
            return (
              <React.Fragment key={'key:' + keyCount}>
                {e.first && (
                  <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                    Directions
                  </h2>
                )}
                <p className={`px-[2px] my-1`} style={{ fontSize: '14px' }}>
                  {formattedText}
                </p>
              </React.Fragment>
            );
          case 'notes':
            return (
              <React.Fragment key={'key:' + keyCount}>
                {e.first && (
                  <h2 className="font-['Shantell_Sans'] font-semibold text-[14px]">
                    Notes
                  </h2>
                )}
                <p className={`px-[2px] my-1`} style={{ fontSize: '14px' }}>
                  {formattedText}
                </p>
              </React.Fragment>
            );
        }
      })}
    </div>
  );
}
