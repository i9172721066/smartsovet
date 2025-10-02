// src/layouts/RootLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const RootLayout = ({ currentUser, onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Функция для определения активной ссылки
  const isActive = (path) => {
    if (path === '/projects') {
      return location.pathname === '/' || location.pathname === '/projects' || location.pathname.startsWith('/project/')
    }
    return location.pathname === path
  }

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    onLogout()
    navigate('/login')
  }

  // Проверяем является ли пользователь админом
  const isAdmin = currentUser?.username === 'admin' || currentUser?.role === 'admin'

  return (
    <div className="root-layout">
      <header className="header">
        <div className="header-container">
          {/* Логотип и название */}
          <div className="header-brand">
            <Link to="/projects" className="brand-link">
              <span className="brand-icon">🏠</span>
              <span className="brand-text">СмартСовет</span>
              <span className="brand-env">local</span>
            </Link>
          </div>

          {/* Навигация для десктопа */}
          <nav className="desktop-nav">
            <Link 
              to="/projects" 
              className={`nav-link ${isActive('/projects') ? 'active' : ''}`}
            >
              Дела
            </Link>
            
            <Link 
              to="/vote" 
              className={`nav-link ${isActive('/vote') ? 'active' : ''}`}
            >
              Голосование
            </Link>
            
            <Link 
              to="/results" 
              className={`nav-link ${isActive('/results') ? 'active' : ''}`}
            >
              Результаты
            </Link>
            
            <Link 
              to="/tender" 
              className={`nav-link ${isActive('/tender') ? 'active' : ''}`}
            >
              Тендеры
            </Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Управление
              </Link>
            )}
          </nav>

          {/* Пользователь и выход */}
          <div className="header-user">
            <div className="user-info">
              <span className="user-label">Пользователь</span>
              <span className="user-name">{currentUser?.username || 'Гость'}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Выйти
            </button>
          </div>

          {/* Мобильное меню */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
        </div>

        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <Link 
              to="/projects" 
              className={`mobile-nav-link ${isActive('/projects') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Дела
            </Link>
            
            <Link 
              to="/vote" 
              className={`mobile-nav-link ${isActive('/vote') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Голосование
            </Link>
            
            <Link 
              to="/results" 
              className={`mobile-nav-link ${isActive('/results') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Результаты
            </Link>
            
            <Link 
              to="/tender" 
              className={`mobile-nav-link ${isActive('/tender') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Тендеры
            </Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className={`mobile-nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Управление
              </Link>
            )}

            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <span>Пользователь: {currentUser?.username || 'Гость'}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="mobile-logout-btn"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Основной контент */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Стили */}
      <style jsx>{`
        .root-layout {
          min-height: 100vh;
          background-color: #f9fafb;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
        }

        .header-brand {
          flex-shrink: 0;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #1f2937;
          font-weight: 600;
          font-size: 18px;
        }

        .brand-icon {
          font-size: 24px;
        }

        .brand-text {
          color: #1f2937;
        }

        .brand-env {
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 500;
        }

        .desktop-nav {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .nav-link {
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .nav-link.active {
          background: #3b82f6;
          color: white;
        }

        .nav-link.admin-link {
          background: #f59e0b;
          color: white;
        }

        .nav-link.admin-link:hover {
          background: #d97706;
        }

        .nav-link.admin-link.active {
          background: #d97706;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 12px;
        }

        .user-label {
          color: #9ca3af;
          margin-bottom: 2px;
        }

        .user-name {
          color: #374151;
          font-weight: 600;
        }

        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #dc2626;
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 3px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .hamburger {
          width: 20px;
          height: 2px;
          background: #374151;
          transition: all 0.2s;
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 16px 20px;
        }

        .mobile-nav-link {
          padding: 12px 0;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          border-bottom: 1px solid #f3f4f6;
        }

        .mobile-nav-link:last-of-type {
          border-bottom: none;
        }

        .mobile-nav-link.active {
          color: #3b82f6;
          font-weight: 600;
        }

        .mobile-nav-link.admin-link {
          color: #f59e0b;
        }

        .mobile-user-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .mobile-user-info {
          margin-bottom: 12px;
          font-size: 14px;
          color: #374151;
        }

        .mobile-logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
        }

        .main-content {
          min-height: calc(100vh - 60px);
          padding: 0;
        }

        /* Мобильные стили */
        @media (max-width: 768px) {
          .header-container {
            padding: 0 16px;
          }

          .desktop-nav {
            display: none;
          }

          .header-user {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .mobile-menu {
            display: flex;
          }

          .brand-text {
            display: none;
          }

          .brand-env {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0 12px;
            height: 56px;
          }

          .brand-link {
            font-size: 16px;
          }

          .brand-icon {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default RootLayout