import { createContext, ReactNode, useCallback, useState } from 'react';

export const authKey = 'um.auth';

export type User = {
  userId: number;
  photoUrl: string | null;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  style: string;
};

export type UserContextValues = {
  user: User | undefined;
  token: string | undefined;
  handleSignIn: (user: User, token: string) => void;
  handleSignOut: () => void;
};

export const UserContext = createContext<UserContextValues>({
  user: undefined,
  token: undefined,
  handleSignIn: () => undefined,
  handleSignOut: () => undefined,
});

type Auth = {
  user: User;
  token: string;
};

function saveAuth(user: User, token: string) {
  const auth: Auth = { user, token };
  localStorage.setItem(authKey, JSON.stringify(auth));
}

function removeAuth() {
  localStorage.removeItem(authKey);
}

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();

  const handleSignIn = useCallback((user: User, token: string) => {
    setUser(user);
    setToken(token);
    saveAuth(user, token);
  }, []);

  const handleSignOut = useCallback(() => {
    setUser(undefined);
    setToken(undefined);
    removeAuth();
  }, []);

  const contextValue = { user, token, handleSignIn, handleSignOut };
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
