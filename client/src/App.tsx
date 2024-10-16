import { Route, Routes } from 'react-router-dom';
import { CookbookContext } from './components/CookbookContext';
import { Cookbook } from './components/Cookbook';
import { NotFound } from './components/NotFound';
import { Menu } from './components/Menu';
import { useState } from 'react';

export default function App() {
  const [cookbookId, setCookbookId] = useState<number>(1);
  const cookbookContextValues = {
    cookbookId: cookbookId,
    setId: (num: number) => setCookbookId(num),
  };
  return (
    <CookbookContext.Provider value={cookbookContextValues}>
      <Routes>
        <Route path="/" element={<Menu />}>
          <Route
            path="/cookbook/:cookbookId/page/:pageNum"
            element={<Cookbook />}></Route>
        </Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </CookbookContext.Provider>
  );
}
