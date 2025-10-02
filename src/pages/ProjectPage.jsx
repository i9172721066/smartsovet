import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Импортируем функции из caseStore
let caseStoreFunctions = {};
try {
  const caseStoreModule = await import('../lib/caseStore');
  caseStoreFunctions = {
    getCase: caseStoreModule.getCase,
    recordVote: caseStoreModule.recordVote,
    closeVoting: caseStoreModule.closeVoting,
    summarizeVoting: caseStoreModule.summarizeVoting,
    addTenderProposal: caseStoreModule.addTenderProposal,
    voteTenderProposal: caseStoreModule.voteTenderProposal,
    summarizeTender: caseStoreModule.summarizeTender,
    closeTender: caseStoreModule.closeTender,
    addPledge: caseStoreModule.addPledge,
    closeFunding: caseStoreModule.closeFunding,
    totalPledged: caseStoreModule.totalPledged,
    startExecution: caseStoreModule.startExecution,
    finishExecution: caseStoreModule.finishExecution,
    addReview: caseStoreModule.addReview,
    summarizeReviews: caseStoreModule.summarizeReviews,
    archiveCase: caseStoreModule.archiveCase
  };
} catch (error) {
  console.error('Ошибка загрузки caseStore:', error);
  alert('Критическая ошибка: система дел не загружена. Обновите страницу.');
}

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.username === 'admin' || currentUser.role === 'admin';

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = () => {
    setLoading(true);
    try {
      const data = caseStoreFunctions.getCase(id);
      setProject(data);
    } catch (error) {
      console.error('Ошибка загрузки проекта:', error);
      setProject(null);
    }
    setLoading(false);
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
    }, 'Загрузка дела...');
  }

  if (!project) {
    return React.createElement('div', {
      style: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        textAlign: 'center'
      }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { color: '#ef4444', marginBottom: '20px' }
      }, 'Дело не найдено'),
      
      React.createElement('button', {
        key: 'back',
        onClick: () => navigate('/projects'),
        style: {
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer'
        }
      }, 'Вернуться к списку дел')
    ]);
  }

  return React.createElement('div', {
    style: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px'
    }
  }, [
    React.createElement(ProjectHeader, {
      key: 'header',
      project: project,
      onBack: () => navigate('/projects')
    }),
    
    React.createElement(StatusStepper, {
      key: 'stepper',
      status: project.status
    }),
    
    React.createElement('div', {
      key: 'content',
      style: { marginTop: '30px' }
    }, [
      project.status === 'voting' && React.createElement(VotingSection, {
        key: 'voting',
        project: project,
        currentUser: currentUser,
        isAdmin: isAdmin,
        onUpdate: loadProject
      }),
      
      project.status === 'tender' && React.createElement(TenderSection, {
        key: 'tender',
        project: project,
        currentUser: currentUser,
        isAdmin: isAdmin,
        onUpdate: loadProject
      }),
      
      project.status === 'funding' && React.createElement(FundingSection, {
        key: 'funding',
        project: project,
        currentUser: currentUser,
        isAdmin: isAdmin,
        onUpdate: loadProject
      }),
      
      project.status === 'execution' && React.createElement(ExecutionSection, {
        key: 'execution',
        project: project,
        currentUser: currentUser,
        isAdmin: isAdmin,
        onUpdate: loadProject
      }),
      
      project.status === 'review' && React.createElement(ReviewSection, {
        key: 'review',
        project: project,
        currentUser: currentUser,
        isAdmin: isAdmin,
        onUpdate: loadProject
      }),
      
      (project.status === 'archived' || project.status === 'rejected') && React.createElement(CompletedSection, {
        key: 'completed',
        project: project
      })
    ])
  ]);
}

function ProjectHeader({ project, onBack }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: '#6b7280',
      voting: '#3b82f6',
      tender: '#f59e0b',
      funding: '#10b981',
      execution: '#8b5cf6',
      review: '#06b6d4',
      archived: '#6b7280',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px'
    }
  }, 
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px'
      }
    }, [
      React.createElement('div', {
        key: 'main',
        style: { flex: 1 }
      }, [
        React.createElement('h1', {
          key: 'title',
          style: {
            fontSize: '28px',
            fontWeight: 700,
            color: '#1f2937',
            margin: '0 0 8px 0',
            lineHeight: 1.2
          }
        }, project.title || 'Без названия'),
        
        React.createElement('p', {
          key: 'text',
          style: {
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 16px 0',
            lineHeight: 1.5
          }
        }, project.text),
        
        React.createElement('div', {
          key: 'info',
          style: {
            display: 'flex',
            gap: '20px',
            fontSize: '14px',
            color: '#9ca3af'
          }
        }, [
          React.createElement('span', {
            key: 'participants'
          }, `Участников: ${project.participants?.length || 0}`),
          
          React.createElement('span', {
            key: 'created'
          }, `Создано: ${formatDate(project.createdAt)}`),
          
          React.createElement('span', {
            key: 'author'
          }, `Автор: ${project.createdBy}`)
        ])
      ]),
      
      React.createElement('div', {
        key: 'actions',
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px'
        }
      }, [
        React.createElement('span', {
          key: 'status',
          style: {
            color: 'white',
            backgroundColor: getStatusColor(project.status),
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }
        }, getStatusLabel(project.status)),
        
        React.createElement('button', {
          key: 'back',
          onClick: onBack,
          style: {
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }
        }, 'Назад')
      ])
    ])
  );
}

function StatusStepper({ status }) {
  const steps = [
    { key: 'voting', label: 'Голосование' },
    { key: 'tender', label: 'Тендер' },
    { key: 'funding', label: 'Финансирование' },
    { key: 'execution', label: 'Исполнение' },
    { key: 'review', label: 'Оценка' },
    { key: 'archived', label: 'Архив' }
  ];

  const currentIndex = steps.findIndex(step => step.key === status);
  const activeIndex = Math.max(currentIndex, 0);

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px'
    }
  },
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
      }
    },
      steps.map((step, index) => 
        React.createElement('div', {
          key: step.key,
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            flex: 1
          }
        }, [
          React.createElement('div', {
            key: 'indicator',
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 600,
              background: index <= activeIndex ? '#3b82f6' : '#f3f4f6',
              color: index <= activeIndex ? 'white' : '#9ca3af',
              marginBottom: '8px'
            }
          }, index < activeIndex ? '✓' : index + 1),
          
          React.createElement('div', {
            key: 'label',
            style: {
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: 1.2
            }
          }, step.label)
        ])
      )
    )
  );
}

// VOTING SECTION (оставляем как было - работает отлично)
function VotingSection({ project, currentUser, isAdmin, onUpdate }) {
  const [choice, setChoice] = useState('yes');
  const [initiator, setInitiator] = useState('no');
  
  const summary = caseStoreFunctions.summarizeVoting(project);
  const houseId = currentUser.username;
  const existingVote = project.voting?.votes?.find(v => v.houseId === houseId);
  const hasVoted = !!existingVote;

  useEffect(() => {
    if (existingVote) {
      setChoice(existingVote.choice);
      setInitiator(existingVote.initiator || 'no');
    }
  }, [existingVote]);

  const handleVote = () => {
    if (!currentUser.username) {
      alert('Необходимо войти в систему');
      return;
    }

    if (hasVoted) {
      alert('Вы уже проголосовали! Один дом может голосовать только один раз.');
      return;
    }

    caseStoreFunctions.recordVote(project.id, {
      userId: currentUser.username,
      houseId: houseId,
      choice,
      initiator
    });
    
    onUpdate();
    alert('Голос засчитан!');
  };

  const handleCloseVoting = () => {
    if (!confirm('Завершить голосование? Это действие нельзя отменить.')) return;
    
    caseStoreFunctions.closeVoting(project.id);
    onUpdate();
  };

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#1f2937',
        margin: '0 0 20px 0'
      }
    }, 'Голосование'),

    hasVoted && React.createElement('div', {
      key: 'voted-status',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, [
      React.createElement('span', {
        key: 'check',
        style: { color: '#16a34a', fontWeight: 'bold' }
      }, '✓'),
      React.createElement('span', {
        key: 'text',
        style: { color: '#166534', fontWeight: '500' }
      }, `Вы уже проголосовали: ${getVoteLabel(existingVote.choice)}${existingVote.initiator === 'yes' ? ' (готовы быть инициатором)' : ''}`)
    ]),
    
    React.createElement('div', {
      key: 'options',
      style: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        opacity: hasVoted ? 0.6 : 1
      }
    }, [
      ['yes', 'ДА'], ['no', 'НЕТ'], ['abstain', 'ВОЗДЕРЖАЛСЯ']
    ].map(([value, label]) =>
      React.createElement('label', {
        key: value,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: hasVoted ? 'not-allowed' : 'pointer'
        }
      }, [
        React.createElement('input', {
          key: 'radio',
          type: 'radio',
          name: 'vote',
          value: value,
          checked: choice === value,
          onChange: hasVoted ? undefined : (e) => setChoice(e.target.value),
          disabled: hasVoted
        }),
        React.createElement('span', { key: 'label' }, label)
      ])
    )),

    project.requiresInitiator && React.createElement('div', {
      key: 'initiator',
      style: {
        marginBottom: '20px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px',
        opacity: hasVoted ? 0.6 : 1
      }
    }, [
      React.createElement('p', {
        key: 'question',
        style: {
          margin: '0 0 12px 0',
          fontWeight: 500,
          color: '#374151'
        }
      }, 'Готовы быть инициатором?'),
      
      React.createElement('div', {
        key: 'options',
        style: { display: 'flex', gap: '20px' }
      }, [
        ['yes', 'ДА'], ['no', 'НЕТ']
      ].map(([value, label]) =>
        React.createElement('label', {
          key: value,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: hasVoted ? 'not-allowed' : 'pointer'
          }
        }, [
          React.createElement('input', {
            key: 'radio',
            type: 'radio',
            name: 'initiator',
            value: value,
            checked: initiator === value,
            onChange: hasVoted ? undefined : (e) => setInitiator(e.target.value),
            disabled: hasVoted
          }),
          React.createElement('span', { key: 'label' }, label)
        ])
      ))
    ]),

    React.createElement('div', {
      key: 'actions',
      style: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }
    }, [
      React.createElement('button', {
        key: 'vote',
        onClick: handleVote,
        disabled: hasVoted,
        style: {
          background: hasVoted ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: hasVoted ? 'not-allowed' : 'pointer',
          fontWeight: 500
        }
      }, hasVoted ? 'Уже проголосовали' : 'Проголосовать'),
      
      isAdmin && React.createElement('button', {
        key: 'close',
        onClick: handleCloseVoting,
        style: {
          background: '#dc2626',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }
      }, 'Завершить голосование')
    ]),

    React.createElement('div', {
      key: 'stats',
      style: {
        padding: '16px',
        background: '#f3f4f6',
        borderRadius: '8px'
      }
    }, [
      React.createElement('p', {
        key: 'total',
        style: { margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }
      }, `Проголосовало: ${summary.totals.total} из ${summary.totalEligible}`),
      
      React.createElement('p', {
        key: 'breakdown',
        style: { margin: '0', fontSize: '14px', color: '#374151' }
      }, `ДА: ${summary.totals.yes} | НЕТ: ${summary.totals.no} | ВОЗДЕРЖАЛИСЬ: ${summary.totals.abstain}`)
    ])
  ]);
}

// TENDER SECTION (НОВАЯ ПОЛНАЯ РЕАЛИЗАЦИЯ)
function TenderSection({ project, currentUser, isAdmin, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: '',
    paymentType: 'prepaid',
    executor: '',
    timeline: ''
  });

  const houseId = currentUser.username;
  const proposals = caseStoreFunctions.summarizeTender(project);
  const userVote = project.tender?.votes?.find(v => v.houseId === houseId);
  const hasVoted = !!userVote;

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.cost || !formData.executor) {
      alert('Заполните все обязательные поля');
      return;
    }

    caseStoreFunctions.addTenderProposal(project.id, formData, {
      userId: currentUser.username,
      name: currentUser.fullName || currentUser.username
    });
    
    setFormData({
      title: '',
      description: '',
      cost: '',
      paymentType: 'prepaid',
      executor: '',
      timeline: ''
    });
    setShowForm(false);
    onUpdate();
    alert('Предложение добавлено!');
  };

  const handleVoteProposal = (proposalId) => {
    if (hasVoted) {
      alert('Вы уже проголосовали! Один дом может голосовать только один раз.');
      return;
    }

    caseStoreFunctions.voteTenderProposal(project.id, proposalId, {
      userId: currentUser.username,
      houseId: houseId
    });
    
    onUpdate();
    alert('Ваш голос учтен!');
  };

  const handleCloseTender = () => {
    if (proposals.length === 0) {
      alert('Нельзя завершить тендер без предложений');
      return;
    }

    if (!confirm('Завершить тендер и выбрать победителя? Это действие нельзя отменить.')) return;
    
    caseStoreFunctions.closeTender(project.id);
    onUpdate();
  };

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#1f2937',
        margin: '0 0 20px 0'
      }
    }, 'Тендер - Выбор исполнителя'),

    hasVoted && React.createElement('div', {
      key: 'voted-notice',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        color: '#166534'
      }
    }, 'Вы уже проголосовали за предложение'),

    React.createElement('button', {
      key: 'add-btn',
      onClick: () => setShowForm(!showForm),
      style: {
        background: showForm ? '#6b7280' : '#10b981',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 500,
        marginBottom: '20px'
      }
    }, showForm ? 'Отменить' : 'Добавить предложение'),

    showForm && React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmitProposal,
      style: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'title-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: { display: 'block', marginBottom: '5px', fontWeight: 500 }
        }, 'Название предложения *'),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: formData.title,
          onChange: (e) => setFormData({...formData, title: e.target.value}),
          placeholder: 'Например: Расчистка снега трактором МТЗ-80',
          style: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }
        })
      ]),

      React.createElement('div', {
        key: 'desc-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: { display: 'block', marginBottom: '5px', fontWeight: 500 }
        }, 'Описание'),
        React.createElement('textarea', {
          key: 'input',
          value: formData.description,
          onChange: (e) => setFormData({...formData, description: e.target.value}),
          placeholder: 'Детали предложения',
          rows: 3,
          style: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical'
          }
        })
      ]),

      React.createElement('div', {
        key: 'cost-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: { display: 'block', marginBottom: '5px', fontWeight: 500 }
        }, 'Стоимость (руб.) *'),
        React.createElement('input', {
          key: 'input',
          type: 'number',
          value: formData.cost,
          onChange: (e) => setFormData({...formData, cost: e.target.value}),
          placeholder: '5000',
          min: '0',
          style: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }
        })
      ]),

      React.createElement('div', {
        key: 'payment-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: { display: 'block', marginBottom: '5px', fontWeight: 500 }
        }, 'Условия оплаты'),
        React.createElement('select', {
          key: 'select',
          value: formData.paymentType,
          onChange: (e) => setFormData({...formData, paymentType: e.target.value}),
          style: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }
        }, [
          React.createElement('option', { key: 'prepaid', value: 'prepaid' }, 'Предоплата'),
          React.createElement('option', { key: 'postpaid', value: 'postpaid' }, 'Постоплата'),
          React.createElement('option', { key: 'mixed', value: 'mixed' }, 'Смешанная')
        ])
      ]),

      React.createElement('div', {
        key: 'executor-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: { display: 'block', marginBottom: '5px', fontWeight: 500 }
        }, 'ФИО исполнителя *'),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: formData.executor,
          onChange: (e) => setFormData({...formData, executor: e.target.value}),
          placeholder: 'Иванов Иван Иванович',
          style: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }
        })
      ]),

      React.createElement('div', {
        key: 'timeline-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: { display: 'block', marginBottom: '5px', fontWeight: 500 }
        }, 'Сроки выполнения'),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: formData.timeline,
          onChange: (e) => setFormData({...formData, timeline: e.target.value}),
          placeholder: 'В течение 2 дней',
          style: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }
        })
      ]),

      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        style: {
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }
      }, 'Отправить предложение')
    ]),

    proposals.length === 0 ? React.createElement('div', {
      key: 'empty',
      style: {
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280'
      }
    }, 'Пока нет предложений') : React.createElement('div', {
      key: 'proposals',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }
    }, proposals.map(p => 
      React.createElement('div', {
        key: p.id,
        style: {
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          background: '#ffffff'
        }
      }, [
        React.createElement('div', {
          key: 'header',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px'
          }
        }, [
          React.createElement('div', {
            key: 'info',
            style: { flex: 1 }
          }, [
            React.createElement('h4', {
              key: 'title',
              style: {
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1f2937'
              }
            }, p.title),
            
            p.description && React.createElement('p', {
              key: 'desc',
              style: {
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: '#6b7280'
              }
            }, p.description),
            
            React.createElement('div', {
              key: 'meta',
              style: {
                fontSize: '13px',
                color: '#9ca3af'
              }
            }, `Автор: ${p.authorName} • Исполнитель: ${p.executor}`)
          ]),
          
          React.createElement('div', {
            key: 'badge',
            style: {
              background: '#f0fdf4',
              color: '#166534',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600
            }
          }, `${p.votes} голосов`)
        ]),
        
        React.createElement('div', {
          key: 'details',
          style: {
            display: 'flex',
            gap: '20px',
            marginBottom: '12px',
            fontSize: '14px',
            color: '#374151'
          }
        }, [
          React.createElement('span', {
            key: 'cost'
          }, `Стоимость: ${p.cost} руб.`),
          
          p.timeline && React.createElement('span', {
            key: 'timeline'
          }, `Сроки: ${p.timeline}`)
        ]),
        
        !hasVoted && React.createElement('button', {
          key: 'vote',
          onClick: () => handleVoteProposal(p.id),
          style: {
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }
        }, 'Проголосовать за это предложение')
      ])
    )),

    isAdmin && proposals.length > 0 && React.createElement('button', {
      key: 'close-tender',
      onClick: handleCloseTender,
      style: {
        background: '#dc2626',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 500,
        marginTop: '20px',
        width: '100%'
      }
    }, 'Завершить тендер и выбрать победителя')
  ]);
}

// FUNDING SECTION (НОВАЯ ПОЛНАЯ РЕАЛИЗАЦИЯ)
function FundingSection({ project, currentUser, isAdmin, onUpdate }) {
  const [amount, setAmount] = useState('');
  
  const winner = project.tender?.proposals?.find(p => p.id === project.tender?.winningProposalId);
  const targetAmount = winner?.cost || project.funding?.targetAmount || 0;
  const pledged = caseStoreFunctions.totalPledged(project);
  const progress = targetAmount > 0 ? Math.min((pledged / targetAmount) * 100, 100) : 0;
  const remaining = Math.max(targetAmount - pledged, 0);

  const handlePledge = (e) => {
    e.preventDefault();
    
    const pledgeAmount = Number(amount);
    if (!pledgeAmount || pledgeAmount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    caseStoreFunctions.addPledge(project.id, {
      userId: currentUser.username,
      houseId: currentUser.username,
      amount: pledgeAmount
    });
    
    setAmount('');
    onUpdate();
    alert(`Взнос ${pledgeAmount} руб. принят!`);
  };

  const handleCloseFunding = () => {
    if (pledged < targetAmount) {
      if (!confirm(`Собрано ${pledged} из ${targetAmount} руб. Завершить сбор досрочно?`)) return;
    }

    caseStoreFunctions.closeFunding(project.id);
    onUpdate();
  };

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#1f2937',
        margin: '0 0 20px 0'
      }
    }, 'Сбор средств'),

    winner && React.createElement('div', {
      key: 'winner',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'label',
        style: {
          fontSize: '12px',
          color: '#166534',
          fontWeight: 600,
          marginBottom: '8px',
          textTransform: 'uppercase'
        }
      }, 'Победитель тендера'),
      
      React.createElement('div', {
        key: 'title',
        style: {
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f2937',
          marginBottom: '4px'
        }
      }, winner.title),
      
      React.createElement('div', {
        key: 'details',
        style: {
          fontSize: '14px',
          color: '#374151'
        }
      }, `Исполнитель: ${winner.executor} • Стоимость: ${winner.cost} руб.`)
    ]),

    React.createElement('div', {
      key: 'progress',
      style: {
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '14px'
        }
      }, [
        React.createElement('span', {
          key: 'label',
          style: { color: '#374151', fontWeight: 500 }
        }, 'Прогресс сбора'),
        
        React.createElement('span', {
          key: 'value',
          style: { color: '#1f2937', fontWeight: 600 }
        }, `${pledged} / ${targetAmount} руб. (${Math.round(progress)}%)`)
      ]),
      
      React.createElement('div', {
        key: 'bar',
        style: {
          width: '100%',
          height: '24px',
          background: '#e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative'
        }
      }, [
        React.createElement('div', {
          key: 'fill',
          style: {
            width: `${progress}%`,
            height: '100%',
            background: progress >= 100 ? '#10b981' : '#3b82f6',
            transition: 'width 0.3s ease'
          }
        }),
        
        React.createElement('div', {
          key: 'text',
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: progress > 30 ? 'white' : '#1f2937',
            fontSize: '12px',
            fontWeight: 600
          }
        }, `${Math.round(progress)}%`)
      ]),
      
      remaining > 0 && React.createElement('div', {
        key: 'remaining',
        style: {
          marginTop: '8px',
          fontSize: '13px',
          color: '#6b7280'
        }
      }, `Осталось собрать: ${remaining} руб.`)
    ]),

    React.createElement('form', {
      key: 'form',
      onSubmit: handlePledge,
      style: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('label', {
        key: 'label',
        style: {
          display: 'block',
          marginBottom: '8px',
          fontWeight: 500,
          fontSize: '14px'
        }
      }, 'Внести взнос'),
      
      React.createElement('div', {
        key: 'input-group',
        style: {
          display: 'flex',
          gap: '10px'
        }
      }, [
        React.createElement('input', {
          key: 'input',
          type: 'number',
          value: amount,
          onChange: (e) => setAmount(e.target.value),
          placeholder: 'Сумма в рублях',
          min: '1',
          style: {
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }
        }),
        
        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }
        }, 'Внести')
      ])
    ]),

    project.funding?.pledges?.length > 0 && React.createElement('div', {
      key: 'pledges',
      style: {
        marginBottom: '20px'
      }
    }, [
      React.createElement('h4', {
        key: 'title',
        style: {
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '12px',
          color: '#1f2937'
        }
      }, 'История взносов'),
      
      React.createElement('div', {
        key: 'list',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }
      }, project.funding.pledges.map((p, idx) =>
        React.createElement('div', {
          key: idx,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: '#f9fafb',
            borderRadius: '6px',
            fontSize: '14px'
          }
        }, [
          React.createElement('span', {
            key: 'user',
            style: { color: '#374151' }
          }, p.userId),
          
          React.createElement('span', {
            key: 'amount',
            style: { color: '#1f2937', fontWeight: 600 }
          }, `${p.amount} руб.`)
        ])
      ))
    ]),

    isAdmin && React.createElement('button', {
      key: 'close',
      onClick: handleCloseFunding,
      style: {
        background: '#dc2626',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 500,
        width: '100%'
      }
    }, 'Завершить сбор средств и начать исполнение')
  ]);
}

// EXECUTION SECTION (НОВАЯ ПОЛНАЯ РЕАЛИЗАЦИЯ)
function ExecutionSection({ project, currentUser, isAdmin, onUpdate }) {
  const [report, setReport] = useState('');
  
  const winner = project.tender?.proposals?.find(p => p.id === project.tender?.winningProposalId);
  const hasStarted = !!project.execution?.startedAt;
  const hasFinished = !!project.execution?.finishedAt;

  const handleStart = () => {
    if (!confirm('Начать исполнение работ?')) return;
    
    caseStoreFunctions.startExecution(project.id);
    onUpdate();
  };

  const handleFinish = (e) => {
    e.preventDefault();
    
    if (!report.trim()) {
      alert('Введите отчет о выполненных работах');
      return;
    }

    if (!confirm('Завершить исполнение? Это действие нельзя отменить.')) return;
    
    caseStoreFunctions.finishExecution(project.id, { text: report });
    onUpdate();
  };

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#1f2937',
        margin: '0 0 20px 0'
      }
    }, 'Исполнение работ'),

    winner && React.createElement('div', {
      key: 'winner',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'label',
        style: {
          fontSize: '12px',
          color: '#166534',
          fontWeight: 600,
          marginBottom: '8px',
          textTransform: 'uppercase'
        }
      }, 'Исполнитель'),
      
      React.createElement('div', {
        key: 'name',
        style: {
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f2937',
          marginBottom: '4px'
        }
      }, winner.executor),
      
      React.createElement('div', {
        key: 'details',
        style: {
          fontSize: '14px',
          color: '#374151'
        }
      }, `Работа: ${winner.title} • Стоимость: ${winner.cost} руб.`)
    ]),

    React.createElement('div', {
      key: 'timeline',
      style: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }
    }, [
      hasStarted ? [
        React.createElement('div', {
          key: 'started',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: hasFinished ? '12px' : '0',
            color: '#374151',
            fontSize: '14px'
          }
        }, [
          React.createElement('span', {
            key: 'icon',
            style: { color: '#10b981', fontSize: '18px' }
          }, '✓'),
          React.createElement('span', { key: 'text' }, `Работы начаты: ${formatDateTime(project.execution.startedAt)}`)
        ]),
        
        hasFinished && React.createElement('div', {
          key: 'finished',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#374151',
            fontSize: '14px'
          }
        }, [
          React.createElement('span', {
            key: 'icon',
            style: { color: '#10b981', fontSize: '18px' }
          }, '✓'),
          React.createElement('span', { key: 'text' }, `Работы завершены: ${formatDateTime(project.execution.finishedAt)}`)
        ])
      ] : React.createElement('div', {
        key: 'not-started',
        style: {
          color: '#6b7280',
          fontSize: '14px'
        }
      }, 'Работы еще не начаты')
    ]),

    hasFinished && project.execution?.report && React.createElement('div', {
      key: 'report',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'label',
        style: {
          fontSize: '12px',
          color: '#166534',
          fontWeight: 600,
          marginBottom: '8px',
          textTransform: 'uppercase'
        }
      }, 'Отчет о выполненных работах'),
      
      React.createElement('div', {
        key: 'text',
        style: {
          fontSize: '14px',
          color: '#374151',
          lineHeight: 1.6
        }
      }, project.execution.report)
    ]),

    isAdmin && !hasStarted && React.createElement('button', {
      key: 'start',
      onClick: handleStart,
      style: {
        background: '#10b981',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 500,
        width: '100%'
      }
    }, 'Начать исполнение работ'),

    isAdmin && hasStarted && !hasFinished && React.createElement('form', {
      key: 'finish-form',
      onSubmit: handleFinish,
      style: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px'
      }
    }, [
      React.createElement('label', {
        key: 'label',
        style: {
          display: 'block',
          marginBottom: '8px',
          fontWeight: 500,
          fontSize: '14px'
        }
      }, 'Отчет о выполненных работах'),
      
      React.createElement('textarea', {
        key: 'textarea',
        value: report,
        onChange: (e) => setReport(e.target.value),
        placeholder: 'Опишите выполненные работы, использованные материалы, результат...',
        rows: 4,
        style: {
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '12px',
          resize: 'vertical'
        }
      }),
      
      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        style: {
          background: '#dc2626',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
          width: '100%'
        }
      }, 'Завершить исполнение и перейти к оценке')
    ])
  ]);
}

// REVIEW SECTION (НОВАЯ ПОЛНАЯ РЕАЛИЗАЦИЯ)
function ReviewSection({ project, currentUser, isAdmin, onUpdate }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  
  const houseId = currentUser.username;
  const existingReview = project.reviews?.find(r => r.houseId === houseId);
  const hasReviewed = !!existingReview;
  const summary = caseStoreFunctions.summarizeReviews(project);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (hasReviewed) {
      alert('Вы уже оставили оценку');
      return;
    }

    caseStoreFunctions.addReview(project.id, {
      userId: currentUser.username,
      houseId: houseId,
      score: score,
      comment: comment
    });
    
    onUpdate();
    alert('Ваша оценка учтена!');
  };

  const handleArchive = () => {
    if (!confirm('Отправить дело в архив? Это действие нельзя отменить.')) return;
    
    caseStoreFunctions.archiveCase(project.id);
    onUpdate();
  };

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#1f2937',
        margin: '0 0 20px 0'
      }
    }, 'Оценка выполнения'),

    summary.count > 0 && React.createElement('div', {
      key: 'summary',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        textAlign: 'center'
      }
    }, [
      React.createElement('div', {
        key: 'avg',
        style: {
          fontSize: '32px',
          fontWeight: 700,
          color: '#166534',
          marginBottom: '4px'
        }
      }, summary.avg.toFixed(1)),
      
      React.createElement('div', {
        key: 'label',
        style: {
          fontSize: '14px',
          color: '#166534'
        }
      }, `Средняя оценка (${summary.count} отзывов)`)
    ]),

    hasReviewed ? React.createElement('div', {
      key: 'reviewed',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }
      }, [
        React.createElement('span', {
          key: 'icon',
          style: { color: '#16a34a', fontWeight: 'bold' }
        }, '✓'),
        React.createElement('span', {
          key: 'text',
          style: { color: '#166534', fontWeight: 500 }
        }, `Вы уже оставили оценку: ${existingReview.score}/10`)
      ]),
      
      existingReview.comment && React.createElement('div', {
        key: 'comment',
        style: {
          fontSize: '14px',
          color: '#374151',
          fontStyle: 'italic'
        }
      }, `"${existingReview.comment}"`)
    ]) : React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmitReview,
      style: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'score-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '14px'
          }
        }, `Оценка: ${score}/10`),
        
        React.createElement('input', {
          key: 'input',
          type: 'range',
          min: '1',
          max: '10',
          value: score,
          onChange: (e) => setScore(Number(e.target.value)),
          style: {
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }),
        
        React.createElement('div', {
          key: 'scale',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
            fontSize: '12px',
            color: '#9ca3af'
          }
        }, Array.from({length: 10}, (_, i) => 
          React.createElement('span', {
            key: i + 1,
            style: {
              fontWeight: score === i + 1 ? 600 : 400,
              color: score === i + 1 ? '#3b82f6' : '#9ca3af'
            }
          }, i + 1)
        ))
      ]),
      
      React.createElement('div', {
        key: 'comment-field',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'label',
          style: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '14px'
          }
        }, 'Комментарий (необязательно)'),
        
        React.createElement('textarea', {
          key: 'textarea',
          value: comment,
          onChange: (e) => setComment(e.target.value),
          placeholder: 'Поделитесь своим мнением о выполненных работах...',
          rows: 3,
          style: {
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical'
          }
        })
      ]),
      
      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        style: {
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
          width: '100%'
        }
      }, 'Отправить оценку')
    ]),

    project.reviews?.length > 0 && React.createElement('div', {
      key: 'reviews',
      style: { marginBottom: '20px' }
    }, [
      React.createElement('h4', {
        key: 'title',
        style: {
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '12px',
          color: '#1f2937'
        }
      }, 'Все отзывы'),
      
      React.createElement('div', {
        key: 'list',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }
      }, project.reviews.map((r, idx) =>
        React.createElement('div', {
          key: idx,
          style: {
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px',
            background: '#ffffff'
          }
        }, [
          React.createElement('div', {
            key: 'header',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }
          }, [
            React.createElement('span', {
              key: 'user',
              style: {
                fontSize: '14px',
                fontWeight: 500,
                color: '#1f2937'
              }
            }, r.userId),
            
            React.createElement('span', {
              key: 'score',
              style: {
                fontSize: '14px',
                fontWeight: 600,
                color: '#3b82f6'
              }
            }, `${r.score}/10`)
          ]),
          
          r.comment && React.createElement('div', {
            key: 'comment',
            style: {
              fontSize: '14px',
              color: '#6b7280',
              fontStyle: 'italic'
            }
          }, `"${r.comment}"`)
        ])
      ))
    ]),

    isAdmin && React.createElement('button', {
      key: 'archive',
      onClick: handleArchive,
      style: {
        background: '#6b7280',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 500,
        width: '100%'
      }
    }, 'Отправить дело в архив')
  ]);
}

// COMPLETED SECTION
function CompletedSection({ project }) {
  const summary = caseStoreFunctions.summarizeReviews(project);
  const winner = project.tender?.proposals?.find(p => p.id === project.tender?.winningProposalId);

  return React.createElement('div', {
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center'
    }
  }, [
    React.createElement('div', {
      key: 'icon',
      style: {
        fontSize: '48px',
        marginBottom: '16px'
      }
    }, project.status === 'archived' ? '✓' : '✗'),
    
    React.createElement('h3', {
      key: 'title',
      style: {
        fontSize: '24px',
        fontWeight: 600,
        color: project.status === 'archived' ? '#10b981' : '#ef4444',
        marginBottom: '16px'
      }
    }, project.status === 'archived' ? 'Дело завершено' : 'Дело отклонено'),

    project.status === 'archived' && summary.count > 0 && React.createElement('div', {
      key: 'summary',
      style: {
        background: '#f0fdf4',
        border: '1px solid #dcfce7',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'avg',
        style: {
          fontSize: '36px',
          fontWeight: 700,
          color: '#166534',
          marginBottom: '8px'
        }
      }, summary.avg.toFixed(1)),
      
      React.createElement('div', {
        key: 'label',
        style: {
          fontSize: '14px',
          color: '#166534',
          marginBottom: '12px'
        }
      }, `Средняя оценка (${summary.count} отзывов)`),

      winner && React.createElement('div', {
        key: 'winner',
        style: {
          fontSize: '14px',
          color: '#374151',
          marginTop: '12px'
        }
      }, `Исполнитель: ${winner.executor}`)
    ])
  ]);
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function getStatusLabel(status) {
  const labels = {
    draft: 'Черновик',
    voting: 'Голосование',
    tender: 'Тендер',
    funding: 'Сбор средств',
    execution: 'Исполнение',
    review: 'Оценка',
    archived: 'Архив',
    rejected: 'Отклонено'
  };
  return labels[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return 'Неизвестно';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Неизвестно';
  }
}

function formatDateTime(dateString) {
  if (!dateString) return 'Неизвестно';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Неизвестно';
  }
}

function getVoteLabel(choice) {
  const labels = {
    yes: 'ДА',
    no: 'НЕТ', 
    abstain: 'ВОЗДЕРЖАЛСЯ'
  };
  return labels[choice] || choice;
}