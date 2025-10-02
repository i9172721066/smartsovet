import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'

// Импортируем страницы системы дел
let Projects, ProjectPage, CreateCase
try {
  Projects = React.lazy(() => import('./pages/Projects'))
  ProjectPage = React.lazy(() => import('./pages/ProjectPage'))
  CreateCase = React.lazy(() => import('./pages/CreateCase'))
} catch (e) {
  console.warn('Страницы системы дел не найдены:', e)
  Projects = () => React.createElement('div', { style: { padding: '40px', textAlign: 'center' } }, 'Страница Projects не найдена')
  ProjectPage = () => React.createElement('div', { style: { padding: '40px', textAlign: 'center' } }, 'Страница ProjectPage не найдена')
  CreateCase = () => React.createElement('div', { style: { padding: '40px', textAlign: 'center' } }, 'Страница CreateCase не найдена')
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем сохраненного пользователя
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('currentUser')
      }
    }
    setIsLoading(false)
  }, [])

  // Страница загрузки
  if (isLoading) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: '#f9fafb'
      }
    }, 'Проверка авторизации...')
  }

  // Если пользователь не авторизован - показываем логин
  if (!currentUser) {
    return React.createElement(LoginPage, { 
      onLogin: setCurrentUser 
    })
  }

  // Если авторизован - показываем приложение с роутингом
  return React.createElement(AuthenticatedApp, { 
    currentUser: currentUser,
    onLogout: () => {
      localStorage.removeItem('currentUser')
      setCurrentUser(null)
    }
  })
}

// Приложение для авторизованных пользователей с роутингом
function AuthenticatedApp({ currentUser, onLogout }) {
  const location = useLocation()
  const isAdmin = currentUser.role === 'admin'

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    // Заголовок с навигацией
    React.createElement('header', {
      key: 'header',
      style: {
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }
    }, 
      React.createElement('div', {
        style: {
          maxWidth: '1200px',
          margin: '0 auto'
        }
      }, [
        // Верхняя строка с брендом и пользователем
        React.createElement('div', {
          key: 'top-bar',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }
        }, [
          React.createElement(Link, {
            key: 'brand',
            to: '/',
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              textDecoration: 'none',
              color: 'inherit'
            }
          }, [
            React.createElement('span', {
              key: 'icon',
              style: { fontSize: '32px' }
            }, '🏠'),
            React.createElement('div', { key: 'text' }, [
              React.createElement('h1', {
                key: 'title',
                style: {
                  margin: 0,
                  fontSize: '24px',
                  color: '#1f2937',
                  fontWeight: '700'
                }
              }, 'СмартСовет'),
              React.createElement('p', {
                key: 'subtitle',
                style: {
                  margin: 0,
                  fontSize: '14px',
                  color: '#6b7280'
                }
              }, 'Система управления ЖК')
            ])
          ]),
          
          React.createElement('div', {
            key: 'user-menu',
            style: { display: 'flex', alignItems: 'center', gap: '16px' }
          }, [
            React.createElement('div', {
              key: 'user-info',
              style: { textAlign: 'right' }
            }, [
              React.createElement('div', {
                key: 'name',
                style: { fontWeight: '600', color: '#1f2937' }
              }, currentUser.fullName),
              React.createElement('div', {
                key: 'role',
                style: { fontSize: '12px', color: '#6b7280' }
              }, isAdmin ? 'Администратор' : 'Пользователь')
            ]),
            React.createElement('button', {
              key: 'logout',
              onClick: onLogout,
              style: {
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }
            }, 'Выйти')
          ])
        ]),

        // Навигационное меню
        React.createElement('nav', {
          key: 'navigation',
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }
        }, [
          React.createElement(NavLink, {
            key: 'home',
            to: '/',
            currentPath: location.pathname,
            exact: true
          }, 'Главная'),
          
          React.createElement(NavLink, {
            key: 'projects',
            to: '/projects',
            currentPath: location.pathname
          }, 'Дела'),
          
          React.createElement(NavLink, {
            key: 'contacts',
            to: '/contacts',
            currentPath: location.pathname
          }, 'Контакты')
        ])
      ])
    ),
    
    // Основной контент с роутами
    React.createElement('main', {
      key: 'main',
      style: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }
    },
      React.createElement(React.Suspense, {
        fallback: React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '16px',
            color: '#6b7280'
          }
        }, 'Загрузка страницы...')
      },
        React.createElement(Routes, null, [
          React.createElement(Route, {
            key: 'home',
            path: '/',
            element: React.createElement(HomePage, { currentUser })
          }),
          
          React.createElement(Route, {
            key: 'projects',
            path: '/projects',
            element: React.createElement(Projects)
          }),
          
          React.createElement(Route, {
            key: 'create-case',
            path: '/create-case',
            element: React.createElement(CreateCase)
          }),
          
          React.createElement(Route, {
            key: 'project',
            path: '/project/:id',
            element: React.createElement(ProjectPage)
          }),
          
          React.createElement(Route, {
            key: 'contacts',
            path: '/contacts',
            element: React.createElement(ContactsPage)
          }),
          
          React.createElement(Route, {
            key: '404',
            path: '*',
            element: React.createElement(Navigate, { to: '/', replace: true })
          })
        ])
      )
    )
  ])
}

// Компонент навигационной ссылки
function NavLink({ to, currentPath, exact = false, children }) {
  const isActive = exact 
    ? currentPath === to 
    : currentPath.startsWith(to) && to !== '/'

  return React.createElement(Link, {
    to: to,
    style: {
      padding: '8px 16px',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      background: isActive ? '#3b82f6' : '#f3f4f6',
      color: isActive ? 'white' : '#374151',
      transition: 'all 0.2s'
    }
  }, children)
}

// Компонент страницы логина (без изменений)
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Имитация проверки логина
    setTimeout(() => {
      if ((username === 'admin' && password === '1234') || 
          (username === 'al56' && password === '123')) {
        
        const user = {
          username: username,
          role: username === 'admin' ? 'admin' : 'user',
          fullName: username === 'admin' ? 'Администратор' : 'Пользователь 56',
          loginTime: new Date().toISOString()
        }
        
        localStorage.setItem('currentUser', JSON.stringify(user))
        onLogin(user)
      } else {
        alert('Неверный логин или пароль!')
        setIsLoading(false)
      }
    }, 500)
  }

  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }
  }, 
    React.createElement('div', {
      style: {
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }
    }, [
      React.createElement('div', {
        key: 'logo',
        style: {
          fontSize: '48px',
          marginBottom: '20px'
        }
      }, '🏠'),
      
      React.createElement('h1', {
        key: 'title',
        style: {
          color: '#1f2937',
          marginBottom: '8px',
          fontSize: '28px',
          fontWeight: '700'
        }
      }, 'СмартСовет'),
      
      React.createElement('p', {
        key: 'subtitle',
        style: {
          color: '#6b7280',
          marginBottom: '30px',
          fontSize: '16px'
        }
      }, 'Система управления жилым комплексом'),
      
      React.createElement('form', {
        key: 'form',
        onSubmit: handleSubmit,
        style: { textAlign: 'left' }
      }, [
        React.createElement('div', {
          key: 'username-group',
          style: { marginBottom: '20px' }
        }, [
          React.createElement('label', {
            key: 'username-label',
            style: {
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500'
            }
          }, 'Логин:'),
          
          React.createElement('input', {
            key: 'username-input',
            type: 'text',
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: 'admin или al56',
            required: true,
            style: {
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s'
            }
          })
        ]),
        
        React.createElement('div', {
          key: 'password-group',
          style: { marginBottom: '30px' }
        }, [
          React.createElement('label', {
            key: 'password-label',
            style: {
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500'
            }
          }, 'Пароль:'),
          
          React.createElement('input', {
            key: 'password-input',
            type: 'password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: '1234 или 123',
            required: true,
            style: {
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none'
            }
          })
        ]),
        
        React.createElement('button', {
          key: 'submit-button',
          type: 'submit',
          disabled: isLoading,
          style: {
            width: '100%',
            background: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }
        }, isLoading ? 'Вход...' : 'Войти в систему')
      ]),
      
      React.createElement('div', {
        key: 'help',
        style: {
          marginTop: '30px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'left'
        }
      }, [
        React.createElement('div', {
          key: 'help-title',
          style: { fontWeight: '600', marginBottom: '8px' }
        }, 'Тестовые аккаунты:'),
        React.createElement('div', { key: 'admin' }, '• Администратор: admin / 1234'),
        React.createElement('div', { key: 'user' }, '• Пользователь: al56 / 123')
      ])
    ])
  )
}

// Компонент главной страницы с кликабельными карточками
function HomePage({ currentUser }) {
  return React.createElement('div', {
    style: { padding: '20px 0' }
  }, [
    React.createElement('div', {
      key: 'welcome',
      style: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center',
        marginBottom: '30px'
      }
    }, [
      React.createElement('h2', {
        key: 'welcome-title',
        style: {
          fontSize: '32px',
          color: '#1f2937',
          marginBottom: '16px',
          fontWeight: '700'
        }
      }, `Добро пожаловать, ${currentUser.fullName}!`),
      
      React.createElement('p', {
        key: 'welcome-text',
        style: {
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '32px'
        }
      }, 'СмартСовет успешно запущен и готов к работе'),
      
      React.createElement('div', {
        key: 'status',
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#dcfce7',
          color: '#166534',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500'
        }
      }, ['✅ ', 'Система готова к использованию'])
    ]),
    
    // Карточки функций (теперь кликабельные)
    React.createElement('div', {
      key: 'features',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }
    }, [
      React.createElement(Link, {
        key: 'feature-1',
        to: '/projects',
        style: {
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textAlign: 'center',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          transition: 'all 0.2s'
        }
      }, [
        React.createElement('div', {
          key: 'icon-1',
          style: { fontSize: '48px', marginBottom: '16px' }
        }, '🗳️'),
        React.createElement('h3', {
          key: 'title-1',
          style: { fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }
        }, 'Голосования'),
        React.createElement('p', {
          key: 'desc-1',
          style: { color: '#6b7280', lineHeight: '1.5' }
        }, 'Система электронных голосований для принятия коллективных решений')
      ]),
      
      React.createElement(Link, {
        key: 'feature-2',
        to: '/projects',
        style: {
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textAlign: 'center',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          transition: 'all 0.2s'
        }
      }, [
        React.createElement('div', {
          key: 'icon-2',
          style: { fontSize: '48px', marginBottom: '16px' }
        }, '🏗️'),
        React.createElement('h3', {
          key: 'title-2',
          style: { fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }
        }, 'Тендеры'),
        React.createElement('p', {
          key: 'desc-2',
          style: { color: '#6b7280', lineHeight: '1.5' }
        }, 'Организация тендеров и выбор лучших предложений от жильцов')
      ]),
      
      React.createElement(Link, {
        key: 'feature-3',
        to: '/projects',
        style: {
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textAlign: 'center',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          transition: 'all 0.2s'
        }
      }, [
        React.createElement('div', {
          key: 'icon-3',
          style: { fontSize: '48px', marginBottom: '16px' }
        }, '💰'),
        React.createElement('h3', {
          key: 'title-3',
          style: { fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }
        }, 'Финансирование'),
        React.createElement('p', {
          key: 'desc-3',
          style: { color: '#6b7280', lineHeight: '1.5' }
        }, 'Прозрачный сбор и управление финансами для общих проектов')
      ])
    ])
  ])
}

// Простая страница контактов
function ContactsPage() {
  return React.createElement('div', {
    style: {
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      textAlign: 'center'
    }
  }, [
    React.createElement('h2', {
      key: 'title',
      style: { fontSize: '24px', marginBottom: '20px', color: '#1f2937' }
    }, 'Контакты'),
    React.createElement('p', {
      key: 'text',
      style: { color: '#6b7280', fontSize: '16px' }
    }, 'Страница контактов будет добавлена в следующих версиях')
  ])
}

export default App