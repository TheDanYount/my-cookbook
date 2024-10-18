import { createContext } from 'react';

export type Cookbook = {
  cookbookId: number | undefined;
  setId: (num: number) => void;
};

const defaultCookbook: Cookbook = {
  cookbookId: undefined,
  setId: () => undefined,
};

export const CookbookContext = createContext(defaultCookbook);
