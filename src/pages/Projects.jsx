import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Импортируем функции из caseStore
let listCases, deleteCase, startVoting;
try {
  const caseStoreModule = await import('../lib/caseStore');
  listCases = caseStoreModule.listCases;
  deleteCase = caseStoreModule.deleteCase;
  startVoting = caseStoreModule.startVoting;
} catch (error) {
  console.warn('caseStore не найден, используем заглушку');
  listCases = (filter) => [];
  deleteCase = () => {};
  startVoting = () => {};
}

export default function Projects() {
  const navigate = useNavigate();
  const [active, setActive] = useState([]);
  const [archived, setArchived] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active | drafts | archived

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.username === 'admin' || currentUser.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const allCases = listCases();
      setDrafts(allCases.filter(c => c.status === 'draft'));
      setActive(allCases.filter(c => !['archived', 'rejected', 'draft'].includes(c.status)));
      setArchived(allCases.filter(c => ['archived', 'rejected'].includes(c.status)));
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setDrafts([]);
      setActive([]);
      setArchived([]);
    }
    setLoading(false);
  };

  const handleStartVoting = (caseId) => {
    if (!confirm('Начать голосование по этому делу?')) return;
    
    try {
      startVoting(caseId);
      loadData();
      alert('Голосование запущено!');
    } catch (error) {
      console.error('Ошибка запуска голосования:', error);
      alert('Ошибка при запуске голосования');
    }
  };

  const handleDelete = (caseId) => {
    if (!confirm('Удалить этот черновик? Это действие нельзя отменить.')) return;
    
    try {
      deleteCase(caseId);
      loadData();
      alert('Черновик удален');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении');
    }
  };

  if (loading) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#6b7280'
      }
    }, 'Загрузка дел...');
  }

  return React.createElement('div', {
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }
  }, [
    // Заголовок с кнопками
    React.createElement('div', {
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '24px',
          fontWeight: 600,
          color: '#1f2937',
          margin: 0
        }
      }, 'Управление делами'),
      
      React.createElement('div', {
        key: 'actions',
        style: {
          display: 'flex',
          gap: '12px'
        }
      }, [
        isAdmin && React.createElement('button', {
          key: 'create',
          onClick: () => navigate('/create-case'),
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, ['+ ', 'Создать дело']),
        
        React.createElement('button', {
          key: 'refresh',
          onClick: loadData,
          style: {
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }
        }, 'Обновить')
      ])
    ]),
    
    // Табы
    React.createElement('div', {
      key: 'tabs',
      style: {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb'
      }
    }, [
      React.createElement('button', {
        key: 'active-tab',
        onClick: () => setActiveTab('active'),
        style: {
          padding: '12px 24px',
          background: 'none',
          border: 'none',
          borderBottom: activeTab === 'active' ? '2px solid #3b82f6' : '2px solid transparent',
          color: activeTab === 'active' ? '#3b82f6' : '#6b7280',
          fontWeight: activeTab === 'active' ? 600 : 400,
          cursor: 'pointer',
          marginBottom: '-2px',
          fontSize: '14px'
        }
      }, `В работе (${active.length})`),
      
      isAdmin && React.createElement('button', {
        key: 'drafts-tab',
        onClick: () => setActiveTab('drafts'),
        style: {
          padding: '12px 24px',
          background: 'none',
          border: 'none',
          borderBottom: activeTab === 'drafts' ? '2px solid #3b82f6' : '2px solid transparent',
          color: activeTab === 'drafts' ? '#3b82f6' : '#6b7280',
          fontWeight: activeTab === 'drafts' ? 600 : 400,
          cursor: 'pointer',
          marginBottom: '-2px',
          fontSize: '14px'
        }
      }, `Черновики (${drafts.length})`),
      
      React.createElement('button', {
        key: 'archived-tab',
        onClick: () => setActiveTab('archived'),
        style: {
          padding: '12px 24px',
          background: 'none',
          border: 'none',
          borderBottom: activeTab === 'archived' ? '2px solid #3b82f6' : '2px solid transparent',
          color: activeTab === 'archived' ? '#3b82f6' : '#6b7280',
          fontWeight: activeTab === 'archived' ? 600 : 400,
          cursor: 'pointer',
          marginBottom: '-2px',
          fontSize: '14px'
        }
      }, `Архив (${archived.length})`)
    ]),
    
    // Контент табов
    React.createElement('div', {
      key: 'content'
    }, [
      activeTab === 'active' && React.createElement(ProjectsList, {
        key: 'active-list',
        items: active,
        emptyMessage: 'Пока нет активных дел',
        isAdmin: isAdmin
      }),
      
      activeTab === 'drafts' && React.createElement(DraftsList, {
        key: 'drafts-list',
        items: drafts,
        emptyMessage: 'Нет черновиков',
        onStartVoting: handleStartVoting,
        onDelete: handleDelete,
        isAdmin: isAdmin
      }),
      
      activeTab === 'archived' && React.createElement(ProjectsList, {
        key: 'archived-list',
        items: archived,
        emptyMessage: 'Архив пуст',
        isAdmin: isAdmin
      })
    ])
  ]);
}

function ProjectsList({ items, emptyMessage, isAdmin }) {
  if (!items.length) {
    return React.createElement('div', {
      style: {
        border: '2px dashed #d1d5db',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        background: '#f9fafb',
        color: '#6b7280'
      }
    }, emptyMessage);
  }

  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }
  }, 
    items.map(project => React.createElement(ProjectCard, {
      key: project.id,
      project: project
    }))
  );
}

function DraftsList({ items, emptyMessage, onStartVoting, onDelete, isAdmin }) {
  if (!items.length) {
    return React.createElement('div', {
      style: {
        border: '2px dashed #d1d5db',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        background: '#f9fafb',
        color: '#6b7280'
      }
    }, emptyMessage);
  }

  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }
  }, 
    items.map(draft => React.createElement(DraftCard, {
      key: draft.id,
      draft: draft,
      onStartVoting: onStartVoting,
      onDelete: onDelete,
      isAdmin: isAdmin
    }))
  );
}

function ProjectCard({ project }) {
  const getStatusInfo = (status) => {
    const statusMap = {
      draft: { label: 'Черновик', color: '#6b7280' },
      voting: { label: 'Голосование', color: '#3b82f6' },
      tender: { label: 'Тендер', color: '#f59e0b' },
      funding: { label: 'Сбор средств', color: '#10b981' },
      execution: { label: 'Исполнение', color: '#8b5cf6' },
      review: { label: 'Оценка', color: '#06b6d4' },
      archived: { label: 'Архив', color: '#6b7280' },
      rejected: { label: 'Отклонено', color: '#ef4444' },
    };
    
    return statusMap[status] || { label: status, color: '#6b7280' };
  };

  const statusInfo = getStatusInfo(project.status);

  return React.createElement(Link, {
    to: `/project/${project.id}`,
    style: {
      display: 'block',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s'
    }
  }, 
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'main',
        style: { flex: 1 }
      }, [
        React.createElement('div', {
          key: 'title',
          style: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '8px',
            lineHeight: 1.4
          }
        }, project.title || 'Без названия'),
        
        React.createElement('div', {
          key: 'description',
          style: {
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '12px',
            lineHeight: 1.5
          }
        }, project.text),
        
        React.createElement('div', {
          key: 'meta',
          style: {
            display: 'flex',
            gap: '20px',
            fontSize: '12px',
            color: '#9ca3af'
          }
        }, [
          React.createElement('span', {
            key: 'participants'
          }, `Участников: ${project.participants?.length || 0}`),
          
          React.createElement('span', {
            key: 'created'
          }, `Создано: ${formatDate(project.createdAt)}`)
        ])
      ]),
      
      React.createElement('div', {
        key: 'status',
        style: { flexShrink: 0 }
      },
        React.createElement('span', {
          style: {
            display: 'inline-block',
            color: 'white',
            backgroundColor: statusInfo.color,
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }
        }, statusInfo.label)
      )
    ])
  );
}

function DraftCard({ draft, onStartVoting, onDelete, isAdmin }) {
  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px'
    }
  }, [
    React.createElement('div', {
      key: 'content',
      style: {
        marginBottom: '16px'
      }
    }, [
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }
      }, [
        React.createElement('div', {
          key: 'title',
          style: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937'
          }
        }, draft.title || 'Без названия'),
        
        React.createElement('span', {
          key: 'badge',
          style: {
            display: 'inline-block',
            color: 'white',
            backgroundColor: '#6b7280',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase'
          }
        }, 'Черновик')
      ]),
      
      React.createElement('div', {
        key: 'description',
        style: {
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '12px',
          lineHeight: 1.5
        }
      }, draft.text),
      
      React.createElement('div', {
        key: 'meta',
        style: {
          display: 'flex',
          gap: '20px',
          fontSize: '12px',
          color: '#9ca3af'
        }
      }, [
        React.createElement('span', {
          key: 'participants'
        }, `Участников: ${draft.participants?.length || 0}`),
        
        React.createElement('span', {
          key: 'created'
        }, `Создан: ${formatDate(draft.createdAt)}`),
        
        React.createElement('span', {
          key: 'author'
        }, `Автор: ${draft.createdBy}`)
      ])
    ]),
    
    isAdmin && React.createElement('div', {
      key: 'actions',
      style: {
        display: 'flex',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }
    }, [
      React.createElement('button', {
        key: 'start',
        onClick: () => onStartVoting(draft.id),
        style: {
          flex: 1,
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }
      }, 'Начать голосование'),
      
      React.createElement(Link, {
        key: 'view',
        to: `/project/${draft.id}`,
        style: {
          flex: 1,
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          textAlign: 'center',
          textDecoration: 'none',
          display: 'block'
        }
      }, 'Просмотреть'),
      
      React.createElement('button', {
        key: 'delete',
        onClick: () => onDelete(draft.id),
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }
      }, 'Удалить')
    ])
  ]);
}

function formatDate(dateString) {
  if (!dateString) return 'Неизвестно';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  } catch {
    return 'Неизвестно';
  }
}