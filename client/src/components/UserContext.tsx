import { createContext } from 'react';

export type User = {
  userId: number | undefined;
  setId: (num: number) => void;
};

const defaultUser: User = {
  userId: undefined,
  setId: () => undefined,
};

export const UserContext = createContext(defaultUser);
