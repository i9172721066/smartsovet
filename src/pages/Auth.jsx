// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { getCurrentUser, loginDemo } from "../lib/auth";

export default function Auth() {
  const navigate = useNavigate();
  const current = getCurrentUser();
  if (current) return <Navigate to="/vote" replace />;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = loginDemo(username.trim(), password.trim());
    if (res.ok) {
      navigate("/vote", { replace: true });
    } else {
      setMsg({ type: "err", text: res.error || "Ошибка входа" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-center">Голосование</h1>
        <p className="text-center text-gray-500 mt-1">Авторизация</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium">Логин</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Например: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Пароль</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {msg.text && (
            <p
              className={
                msg.type === "ok"
                  ? "text-green-600 text-sm"
                  : "text-red-600 text-sm"
              }
            >
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700"
          >
            Войти
          </button>

          <p className="text-xs text-center text-gray-400">
            Для теста: <b>admin</b> / <b>1234</b>
          </p>
        </form>
      </div>
    </div>
  );
}
