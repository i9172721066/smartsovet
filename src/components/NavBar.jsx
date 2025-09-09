import { NavLink } from "react-router-dom";

const linkBase =
  "px-3 py-2 rounded-md text-sm font-medium transition-colors";
const active = "bg-slate-900 text-white";
const normal = "text-slate-700 hover:bg-slate-100";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-semibold text-slate-900">
          СмартСовет
        </NavLink>
        <nav className="flex gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${linkBase} ${isActive ? active : normal}`}
          >
            Голосования
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) => `${linkBase} ${isActive ? active : normal}`}
          >
            Создать
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) => `${linkBase} ${isActive ? active : normal}`}
          >
            Контакты
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
