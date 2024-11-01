import { createContext, ReactNode, useCallback, useState } from 'react';

export type Cookbook = {
  cookbookId: number;
  userId: number;
  style: string;
  title: string;
  isPublic: boolean;
};

export type CookbookContextValues = {
  cookbook: Cookbook | undefined;
  setCookbook: (cookbook: Cookbook) => void;
};

export const CookbookContext = createContext<CookbookContextValues>({
  cookbook: undefined,
  setCookbook: () => undefined,
});

type Props = {
  children: ReactNode;
};

export function CookbookProvider({ children }: Props) {
  const [cookbook, setCookbook] = useState<Cookbook>();

  const contextValue = {
    cookbook,
    setCookbook: useCallback((cookbook: Cookbook) => setCookbook(cookbook), []),
  };
  return (
    <CookbookContext.Provider value={contextValue}>
      {children}
    </CookbookContext.Provider>
  );
}
