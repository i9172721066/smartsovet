import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Импортируем функции из caseStore
let caseStoreFunctions = {};
try {
  const caseStoreModule = await import('../lib/caseStore');
  caseStoreFunctions = {
    createCase: caseStoreModule.createCase,
    startVoting: caseStoreModule.startVoting
  };
} catch (error) {
  console.error('Ошибка загрузки caseStore:', error);
}

export default function CreateCase() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.username === 'admin' || currentUser.role === 'admin';

  // Проверка прав доступа
  if (!isAdmin) {
    return React.createElement('div', {
      style: {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '40px',
        textAlign: 'center',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { color: '#ef4444', marginBottom: '16px' }
      }, 'Доступ запрещен'),
      
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280', marginBottom: '24px' }
      }, 'Только администраторы могут создавать новые дела'),
      
      React.createElement('button', {
        key: 'back',
        onClick: () => navigate('/projects'),
        style: {
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }
      }, 'Вернуться к делам')
    ]);
  }

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    participants: '',
    requiresFinancing: true,
    requiresInitiator: true,
    targetAmount: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Введите название дела';
    }

    if (!formData.text.trim()) {
      newErrors.text = 'Введите описание дела';
    }

    if (!formData.participants.trim()) {
      newErrors.participants = 'Укажите участников (минимум один)';
    }

    if (formData.requiresFinancing && (!formData.targetAmount || Number(formData.targetAmount) <= 0)) {
      newErrors.targetAmount = 'Укажите целевую сумму';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (asDraft) => {
    if (!validateForm()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Парсим участников (разделены запятой)
    const participants = formData.participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (participants.length === 0) {
      alert('Укажите хотя бы одного участника');
      return;
    }

    const caseData = {
      title: formData.title,
      text: formData.text,
      participants: participants,
      requiresFinancing: formData.requiresFinancing,
      requiresInitiator: formData.requiresInitiator,
      createdBy: currentUser.username,
      status: asDraft ? 'draft' : 'voting'
    };

    if (formData.requiresFinancing && formData.targetAmount) {
      caseData.funding = {
        targetAmount: Number(formData.targetAmount),
        pledges: [],
        closedAt: null
      };
    }

    try {
      const newCase = caseStoreFunctions.createCase(caseData);

      if (!asDraft) {
        // Сразу запускаем голосование
        caseStoreFunctions.startVoting(newCase.id);
      }

      alert(asDraft ? 'Дело сохранено как черновик' : 'Дело создано и голосование запущено!');
      navigate('/projects');
    } catch (error) {
      console.error('Ошибка создания дела:', error);
      alert('Ошибка при создании дела. Проверьте консоль.');
    }
  };

  return React.createElement('div', {
    style: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }
  }, [
    // Заголовок
    React.createElement('div', {
      key: 'header',
      style: {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '28px',
          fontWeight: 700,
          color: '#1f2937',
          margin: '0 0 8px 0'
        }
      }, 'Создание нового дела'),
      
      React.createElement('p', {
        key: 'subtitle',
        style: {
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }
      }, 'Заполните форму для создания нового дела. Вы можете сохранить как черновик или сразу запустить голосование.')
    ]),

    // Форма
    React.createElement('div', {
      key: 'form',
      style: {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px'
      }
    }, [
      // Название
      React.createElement('div', {
        key: 'title-field',
        style: { marginBottom: '20px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '14px',
            color: '#374151'
          }
        }, [
          'Название дела ',
          React.createElement('span', { key: 'required', style: { color: '#ef4444' } }, '*')
        ]),
        
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: formData.title,
          onChange: (e) => setFormData({...formData, title: e.target.value}),
          placeholder: 'Например: Ремонт детской площадки',
          style: {
            width: '100%',
            padding: '12px',
            border: `1px solid ${errors.title ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }
        }),
        
        errors.title && React.createElement('div', {
          key: 'error',
          style: {
            marginTop: '4px',
            fontSize: '12px',
            color: '#ef4444'
          }
        }, errors.title)
      ]),

      // Описание
      React.createElement('div', {
        key: 'text-field',
        style: { marginBottom: '20px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '14px',
            color: '#374151'
          }
        }, [
          'Описание дела ',
          React.createElement('span', { key: 'required', style: { color: '#ef4444' } }, '*')
        ]),
        
        React.createElement('textarea', {
          key: 'textarea',
          value: formData.text,
          onChange: (e) => setFormData({...formData, text: e.target.value}),
          placeholder: 'Подробное описание проблемы или вопроса для голосования...',
          rows: 4,
          style: {
            width: '100%',
            padding: '12px',
            border: `1px solid ${errors.text ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }
        }),
        
        errors.text && React.createElement('div', {
          key: 'error',
          style: {
            marginTop: '4px',
            fontSize: '12px',
            color: '#ef4444'
          }
        }, errors.text)
      ]),

      // Участники
      React.createElement('div', {
        key: 'participants-field',
        style: { marginBottom: '20px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '14px',
            color: '#374151'
          }
        }, [
          'Участники голосования ',
          React.createElement('span', { key: 'required', style: { color: '#ef4444' } }, '*')
        ]),
        
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: formData.participants,
          onChange: (e) => setFormData({...formData, participants: e.target.value}),
          placeholder: 'admin, al56, user1, user2 (через запятую)',
          style: {
            width: '100%',
            padding: '12px',
            border: `1px solid ${errors.participants ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }
        }),
        
        React.createElement('div', {
          key: 'hint',
          style: {
            marginTop: '4px',
            fontSize: '12px',
            color: '#6b7280'
          }
        }, 'Введите имена пользователей (логины) через запятую'),
        
        errors.participants && React.createElement('div', {
          key: 'error',
          style: {
            marginTop: '4px',
            fontSize: '12px',
            color: '#ef4444'
          }
        }, errors.participants)
      ]),

      // Требуется финансирование
      React.createElement('div', {
        key: 'financing-field',
        style: {
          marginBottom: '20px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }
      }, [
        React.createElement('label', {
          key: 'label',
          style: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '12px'
          }
        }, [
          React.createElement('input', {
            key: 'checkbox',
            type: 'checkbox',
            checked: formData.requiresFinancing,
            onChange: (e) => setFormData({...formData, requiresFinancing: e.target.checked}),
            style: {
              width: '18px',
              height: '18px',
              marginRight: '8px',
              cursor: 'pointer'
            }
          }),
          
          React.createElement('span', {
            key: 'text',
            style: {
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }
          }, 'Требуется финансирование')
        ]),

        formData.requiresFinancing && React.createElement('div', {
          key: 'amount-field',
          style: { marginTop: '12px' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#374151'
            }
          }, 'Целевая сумма (руб.)'),
          
          React.createElement('input', {
            key: 'input',
            type: 'number',
            value: formData.targetAmount,
            onChange: (e) => setFormData({...formData, targetAmount: e.target.value}),
            placeholder: '5000',
            min: '0',
            style: {
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${errors.targetAmount ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }
          }),
          
          errors.targetAmount && React.createElement('div', {
            key: 'error',
            style: {
              marginTop: '4px',
              fontSize: '12px',
              color: '#ef4444'
            }
          }, errors.targetAmount)
        ])
      ]),

      // Требуется инициатор
      React.createElement('div', {
        key: 'initiator-field',
        style: {
          marginBottom: '24px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }
      }, [
        React.createElement('label', {
          key: 'label',
          style: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }
        }, [
          React.createElement('input', {
            key: 'checkbox',
            type: 'checkbox',
            checked: formData.requiresInitiator,
            onChange: (e) => setFormData({...formData, requiresInitiator: e.target.checked}),
            style: {
              width: '18px',
              height: '18px',
              marginRight: '8px',
              cursor: 'pointer'
            }
          }),
          
          React.createElement('span', {
            key: 'text',
            style: {
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }
          }, 'Требуется инициатор исполнения')
        ]),
        
        React.createElement('div', {
          key: 'hint',
          style: {
            marginTop: '8px',
            marginLeft: '26px',
            fontSize: '12px',
            color: '#6b7280'
          }
        }, 'При голосовании участникам будет предложено указать готовность стать инициатором')
      ]),

      // Кнопки действий
      React.createElement('div', {
        key: 'actions',
        style: {
          display: 'flex',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }
      }, [
        React.createElement('button', {
          key: 'draft',
          onClick: () => handleSubmit(true),
          style: {
            flex: 1,
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px'
          }
        }, 'Сохранить как черновик'),
        
        React.createElement('button', {
          key: 'voting',
          onClick: () => handleSubmit(false),
          style: {
            flex: 1,
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px'
          }
        }, 'Создать и запустить голосование'),
        
        React.createElement('button', {
          key: 'cancel',
          onClick: () => navigate('/projects'),
          style: {
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px'
          }
        }, 'Отмена')
      ])
    ])
  ]);
}