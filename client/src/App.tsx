import { Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import { Cookbook } from './components/Cookbook';
import { NotFound } from './components/NotFound';
import { Menu } from './components/Menu';
import { CookbookProvider } from './components/CookbookContext';

export default function App() {
  return (
    <UserProvider>
      <CookbookProvider>
        <Routes>
          <Route path="/" element={<Menu />}>
            <Route
              path="/cookbook/:cookbookId/page/:pageNum"
              element={<Cookbook />}></Route>
          </Route>
          <Route path="/sign-up" element={<Menu mode="sign-up" />}></Route>
          <Route
            path="/create-cookbook"
            element={<Menu mode="create-cookbook" />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </CookbookProvider>
    </UserProvider>
  );
}
