import { Route, Routes } from 'react-router-dom';
import { CookbookContext } from './components/CookbookContext';
import { UserContext } from './components/UserContext';
import { Cookbook } from './components/Cookbook';
import { NotFound } from './components/NotFound';
import { Menu } from './components/Menu';
import { useState } from 'react';

export default function App() {
  const [cookbookId, setCookbookId] = useState<number>(1);
  const [userId, setUserId] = useState<number>();
  const cookbookContextValues = {
    cookbookId: cookbookId,
    setId: (num: number) => setCookbookId(num),
  };
  const userContextValues = {
    userId: userId,
    setId: (num: number) => setUserId(num),
  };
  return (
    <UserContext.Provider value={userContextValues}>
      <CookbookContext.Provider value={cookbookContextValues}>
        <Routes>
          <Route path="/" element={<Menu />}>
            <Route
              path="/cookbook/:cookbookId/page/:pageNum"
              element={<Cookbook />}></Route>
          </Route>
          <Route
            path="/sign-up"
            element={<Menu isSignUpFormOpen={true} />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </CookbookContext.Provider>
    </UserContext.Provider>
  );
}
