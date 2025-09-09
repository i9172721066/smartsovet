// src/layouts/RootLayout.jsx
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function RootLayout() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vg_user") || "null"); }
    catch { return null; }
  });

  // Подхватываем изменения localStorage (например, после логина/логаута из другой вкладки)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "vg_user") {
        try { setUser(JSON.parse(e.newValue || "null")); }
        catch { setUser(null); }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem("vg_user");
    setUser(null);
    navigate("/login");
  };

  const tabClass = ({ isActive }) =>
    "px-3 py-1 rounded " + (isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-100");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/vote" className="font-semibold">СмартСовет</Link>

          <nav className="flex items-center gap-3">
            <NavLink className={tabClass} to="/vote">Голосование</NavLink>
            <NavLink className={tabClass} to="/results">Результаты</NavLink>
            {user?.role === "responsible" && (
              <NavLink className={tabClass} to="/admin">Управление</NavLink>
            )}

            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden sm:inline">
                  вошли как <b>{user.fullName || user.login}</b>
                </span>
                <button
                  onClick={logout}
                  className="rounded bg-rose-500 text-white px-3 py-1"
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded bg-indigo-600 text-white px-3 py-1">
                Войти
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
