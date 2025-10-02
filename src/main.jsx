console.log('main.jsx загружен, создаем root и загружаем React')

// Создаем root элемент программно (это работает!)
document.body.innerHTML = ''
const rootElement = document.createElement('div')
rootElement.id = 'root'
document.body.appendChild(rootElement)

console.log('Root создан:', rootElement)

// Показываем загрузку
rootElement.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background: #f9fafb;">
    <div style="text-align: center;">
      <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
      <div style="color: #374151; font-size: 16px;">Загрузка СмартСовет...</div>
      <div style="color: #6b7280; font-size: 14px; margin-top: 8px;">Инициализация системы управления ЖК</div>
    </div>
    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
  </div>
`

// Загружаем React асинхронно
async function loadReact() {
  try {
    console.log('Импорт React модулей...')
    
    const React = await import('react')
    const ReactDOM = await import('react-dom/client')
    const { BrowserRouter } = await import('react-router-dom')
    
    console.log('React модули загружены')
    
    // Инициализация системы дел
    try {
      const { seedCasesIfEmpty } = await import('./lib/caseStore')
      const { migrateLegacyPollsToCases } = await import('./lib/migrateLegacy')
      seedCasesIfEmpty()
      migrateLegacyPollsToCases()
      console.log('Система СмартСовет инициализирована')
    } catch (e) {
      console.warn('Системы дел пока нет, продолжаем без неё:', e)
    }
    
    // Загружаем App компонент
    let App
    try {
      const appModule = await import('./App.jsx')
      App = appModule.default
      console.log('App.jsx загружен')
    } catch (e) {
      console.warn('App.jsx не найден, создаем простое приложение')
      App = () => React.createElement('div', { 
        style: { 
          padding: '40px', 
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          background: '#f9fafb',
          minHeight: '100vh'
        } 
      }, [
        React.createElement('div', {
          key: 'container',
          style: {
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }
        }, [
          React.createElement('h1', { 
            key: 'title',
            style: { color: '#1f2937', marginBottom: '20px' }
          }, '🏠 СмартСовет'),
          React.createElement('p', { 
            key: 'desc',
            style: { color: '#6b7280', fontSize: '18px', marginBottom: '30px' }
          }, 'Система управления жилым комплексом'),
          React.createElement('div', { 
            key: 'status',
            style: { 
              background: '#10b981', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '6px',
              display: 'inline-block',
              fontWeight: '500'
            }
          }, '✅ React успешно загружен!')
        ])
      ])
    }
    
    // Создаем React root и рендерим
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(BrowserRouter, null,
          React.createElement(App, null)
        )
      )
    )
    
    console.log('React приложение успешно запущено!')
    
  } catch (error) {
    console.error('Ошибка загрузки React:', error)
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background: #f9fafb;">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #ef4444; margin-bottom: 20px;">Ошибка загрузки приложения</h2>
          <p style="color: #6b7280; margin-bottom: 30px;">Проверьте консоль браузера для деталей</p>
          <button onclick="window.location.reload()" 
                  style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
            Перезагрузить страницу
          </button>
        </div>
      </div>
    `
  }
}

// Запускаем загрузку React
loadReact()