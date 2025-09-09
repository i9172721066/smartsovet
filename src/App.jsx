// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";

// твои страницы из src/pages
import Vote from "./pages/Vote.jsx";
import Results from "./pages/Results.jsx";
import CreateVoting from "./pages/CreateVoting.jsx";
import TenderPage from "./pages/TenderPage.jsx";
import TenderManagement from "./pages/TenderManagement.jsx";
import AdminBallots from "./pages/AdminBallots.jsx";
import AdminBallotEdit from "./pages/AdminBallotEdit.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFound from "./pages/NotFound.jsx";

// Если auth ещё не готов — временные заглушки:
const user = null;
const onLogout = () => {};

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout user={user} onLogout={onLogout} />}>
        <Route index element={<Navigate to="/vote" replace />} />

        {/* Твои страницы */}
        <Route path="/vote" element={<Vote />} />
        <Route path="/results" element={<Results />} />
        <Route path="/create" element={<CreateVoting />} />

        {/* Тендерная часть — отдельный путь */}
        <Route path="/tender" element={<TenderPage />} />
        <Route path="/tender/manage" element={<TenderManagement />} />

        {/* Админка (если используешь) */}
        <Route path="/admin" element={<AdminBallots />} />
        <Route path="/admin/:id" element={<AdminBallotEdit />} />

        <Route path="/login" element={<LoginPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
