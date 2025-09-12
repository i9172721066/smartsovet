import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Провайдеры контекстов
import { AppProvider } from "./lib/repo/context.jsx";

// Лейаут
import RootLayout from "./layouts/RootLayout.jsx";

// Страницы
import Vote from "./pages/Vote.jsx";
import Results from "./pages/Results.jsx";
import CreateVoting from "./pages/CreateVoting.jsx";
import TenderPage from "./pages/TenderPage.jsx";
import TenderManagement from "./pages/TenderManagement.jsx";
import AdminBallots from "./pages/AdminBallots.jsx";
import AdminBallotEdit from "./pages/AdminBallotEdit.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to="/vote" replace />} />

            {/* Основные страницы */}
            <Route path="/vote" element={<Vote />} />
            <Route path="/results" element={<Results />} />
            <Route path="/create" element={<CreateVoting />} />

            {/* Тендерная часть (если включена в feature flags) */}
            <Route path="/tender" element={<TenderPage />} />
            <Route path="/tender/manage" element={<TenderManagement />} />

            {/* Админка */}
            <Route path="/admin" element={<AdminBallots />} />
            <Route path="/admin/:id" element={<AdminBallotEdit />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Страница входа вне лейаута */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>

        {/* Глобальные уведомления */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </AppProvider>
  );
}