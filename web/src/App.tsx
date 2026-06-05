import { NavLink, Route, Routes } from 'react-router-dom';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <strong>Plasma Icons Mapper</strong>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Search
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Admin
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}
