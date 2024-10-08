import { Route, Routes } from 'react-router-dom';
import { Cookbook } from './components/Cookbook';
import { NotFound } from './components/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/">
        <Route
          path="/cookbook/:cookbookId/page/:pageNum"
          element={<Cookbook />}></Route>
      </Route>
      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  );
}
