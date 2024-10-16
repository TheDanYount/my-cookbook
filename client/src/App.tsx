import { Route, Routes } from 'react-router-dom';
import { Cookbook } from './components/Cookbook';
import { NotFound } from './components/NotFound';
import { Menu } from './components/Menu';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />}>
        <Route
          path="/cookbook/:cookbookId/page/:pageNum"
          element={<Cookbook />}></Route>
      </Route>
      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  );
}
