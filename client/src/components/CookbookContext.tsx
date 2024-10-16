import { createContext } from 'react';

export type CurrentCookbook = {
  cookbookId: number | undefined;
  setId: (num: number) => void;
};

const defaultCookbook: CurrentCookbook = {
  cookbookId: undefined,
  setId: () => undefined,
};

export const CookbookContext = createContext(defaultCookbook);
