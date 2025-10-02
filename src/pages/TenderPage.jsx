import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TenderPage = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [newProposal, setNewProposal] = useState({
    description: '',
    cost: '',
    conditions: '',
    timeline: ''
  });
  const [showForm, setShowForm] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadTenders();
    loadUserVotes();
  }, []);

  const loadTenders = () => {
    const savedTenders = JSON.parse(localStorage.getItem('tenders') || '[]');
    
    // Добавляем тестовые тендеры если их нет
    if (savedTenders.length === 0) {
      const testTenders = [
        {
          id: 1,
          title: "Срочно нужен трактор для расчистки снега",
          description: "Срочно нужен трактор для расчистки снега на улице Корабельная",
          status: "active",
          endTime: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 дня
          proposals: [
            {
              id: 1,
              initiator: "Бубукин И.И.",
              description: "Тракторист Тимофей, завтра утром",
              cost: 5000,
              conditions: "Предоплата",
              phone: "+7-900-123-45-67",
              votes: []
            },
            {
              id: 2, 
              initiator: "Фьютькевич А.П.",
              description: "На авито 2-3 часа, + контроль",
              cost: 10000,
              conditions: "50% предоплаты",
              phone: "+7-900-234-56-78",
              votes: []
            },
            {
              id: 3,
              initiator: "Гадя Петрович",
              description: "Можно ручками убрать",
              cost: 0,
              conditions: "Нет",
              phone: "+7-900-345-67-89",
              votes: []
            }
          ]
        }
      ];
      
      localStorage.setItem('tenders', JSON.stringify(testTenders));
      setTenders(testTenders);
    } else {
      setTenders(savedTenders);
    }
  };

  const loadUserVotes = () => {
    const votes = JSON.parse(localStorage.getItem(`tender_votes_${currentUser.username}`) || '{}');
    setUserVotes(votes);
  };

  const saveUserVotes = (votes) => {
    localStorage.setItem(`tender_votes_${currentUser.username}`, JSON.stringify(votes));
    setUserVotes(votes);
  };

  const saveTenders = (updatedTenders) => {
    localStorage.setItem('tenders', JSON.stringify(updatedTenders));
    setTenders(updatedTenders);
  };

  const voteForProposal = (tenderId, proposalId) => {
    // Проверяем, не голосовал ли уже за этот тендер
    if (userVotes[tenderId]) {
      alert('Вы уже проголосовали в этом тендере!');
      return;
    }

    // Обновляем тендеры
    const updatedTenders = tenders.map(tender => {
      if (tender.id === tenderId) {
        const updatedProposals = tender.proposals.map(proposal => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votes: [...(proposal.votes || []), currentUser.username]
            };
          }
          return proposal;
        });
        return { ...tender, proposals: updatedProposals };
      }
      return tender;
    });

    // Сохраняем голос пользователя
    const newVotes = { ...userVotes, [tenderId]: proposalId };
    
    saveTenders(updatedTenders);
    saveUserVotes(newVotes);
    
    alert('Голос засчитан!');
  };

  const addProposal = (tenderId) => {
    if (!newProposal.description || !newProposal.cost) {
      alert('Заполните описание и стоимость');
      return;
    }

    const updatedTenders = tenders.map(tender => {
      if (tender.id === tenderId) {
        const newId = Math.max(...tender.proposals.map(p => p.id), 0) + 1;
        const proposal = {
          id: newId,
          initiator: `${currentUser.username}`,
          description: newProposal.description,
          cost: parseInt(newProposal.cost),
          conditions: newProposal.conditions,
          timeline: newProposal.timeline,
          phone: currentUser.phone || "+7-900-000-00-00",
          votes: []
        };
        
        return {
          ...tender,
          proposals: [...tender.proposals, proposal]
        };
      }
      return tender;
    });

    saveTenders(updatedTenders);
    setNewProposal({ description: '', cost: '', conditions: '', timeline: '' });
    setShowForm(false);
    alert('Предложение добавлено!');
  };

  const getWinner = (tender) => {
    if (!tender.proposals.length) return null;
    
    return tender.proposals.reduce((winner, current) => {
      const currentVotes = (current.votes || []).length;
      const winnerVotes = (winner.votes || []).length;
      
      if (currentVotes > winnerVotes) {
        return current;
      } else if (currentVotes === winnerVotes && current.cost < winner.cost) {
        // При равенстве голосов побеждает дешевле
        return current;
      }
      return winner;
    });
  };

  const getTotalVotes = (tender) => {
    return tender.proposals.reduce((total, proposal) => 
      total + (proposal.votes || []).length, 0
    );
  };

  const isExpired = (tender) => {
    return Date.now() > tender.endTime;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('ru-RU');
  };

  const getTenderStatus = (tender) => {
    if (isExpired(tender)) {
      const winner = getWinner(tender);
      return {
        status: 'completed',
        message: winner 
          ? `Победитель: ${winner.initiator} (${winner.votes?.length || 0} голосов)`
          : 'Нет предложений'
      };
    }
    
    const timeLeft = Math.ceil((tender.endTime - Date.now()) / (1000 * 60 * 60));
    return {
      status: 'active',
      message: `Осталось: ${timeLeft} часов`
    };
  };

  return (
    <div className="tender-page">
      <div className="tender-header">
        <h2>🏗️ Тендеры</h2>
        <p>Голосование за лучшие предложения инициаторов</p>
        
        {/* ВРЕМЕННАЯ КНОПКА ДЛЯ ОТЛАДКИ */}
        <button 
          onClick={() => {
            const newTenders = [{
              id: Date.now(),
              title: "ТЕСТ: Срочно нужен трактор для расчистки снега",
              description: "Тестовый тендер с актуальным временем",
              status: "active",
              endTime: Date.now() + 2 * 60 * 60 * 1000, // 2 часа от текущего времени
              proposals: [
                {
                  id: 1,
                  initiator: "Бубукин И.И.",
                  description: "Тракторист Тимофей, завтра утром", 
                  cost: 5000,
                  conditions: "Предоплата",
                  phone: "+7-900-123-45-67",
                  votes: []
                },
                {
                  id: 2,
                  initiator: "Фьютькевич А.П.",
                  description: "На авито 2-3 часа, + контроль",
                  cost: 10000, 
                  conditions: "50% предоплаты",
                  phone: "+7-900-234-56-78",
                  votes: []
                }
              ]
            }];
            localStorage.setItem('tenders', JSON.stringify(newTenders));
            // Очищаем голоса всех пользователей
            localStorage.removeItem('tender_votes_admin');
            localStorage.removeItem('tender_votes_al56');
            window.location.reload();
          }}
          style={{
            background: '#ef4444',
            color: 'white', 
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🔄 Создать новый тестовый тендер
        </button>
      </div>

      {tenders.length === 0 ? (
        <div className="no-tenders">
          <p>Активных тендеров нет</p>
          <button onClick={() => navigate('/vote')}>К голосованиям</button>
        </div>
      ) : (
        <div className="tenders-list">
          {tenders.map(tender => {
            const tenderStatus = getTenderStatus(tender);
            const userVoted = userVotes[tender.id];
            const totalVotes = getTotalVotes(tender);
            
            return (
              <div key={tender.id} className={`tender-card ${tenderStatus.status}`}>
                <div className="tender-info">
                  <h3>{tender.title}</h3>
                  <p>{tender.description}</p>
                  
                  <div className="tender-meta">
                    <span className="deadline">⏰ До: {formatTime(tender.endTime)}</span>
                    <span className={`status ${tenderStatus.status}`}>
                      {tenderStatus.message}
                    </span>
                    <span className="votes-total">📊 Всего голосов: {totalVotes}</span>
                  </div>
                </div>

                <div className="proposals">
                  <h4>Предложения ({tender.proposals.length})</h4>
                  
                  {tender.proposals.map(proposal => {
                    const votes = (proposal.votes || []).length;
                    const isVotedFor = userVoted === proposal.id;
                    const winner = getWinner(tender);
                    const isWinner = tenderStatus.status === 'completed' && 
                                   winner && winner.id === proposal.id;
                    
                    return (
                      <div key={proposal.id} 
                           className={`proposal ${isVotedFor ? 'voted' : ''} ${isWinner ? 'winner' : ''}`}>
                        <div className="proposal-header">
                          <div className="proposal-info">
                            <strong>{proposal.initiator}</strong>
                            {isWinner && <span className="winner-badge">🏆 Победитель</span>}
                          </div>
                          <div className="proposal-votes">
                            👍 {votes}
                            {isVotedFor && <span className="your-vote">✓ Ваш голос</span>}
                          </div>
                        </div>
                        
                        <p><strong>Предложение:</strong> {proposal.description}</p>
                        <p><strong>Стоимость:</strong> {proposal.cost.toLocaleString()} ₽</p>
                        <p><strong>Условия:</strong> {proposal.conditions}</p>
                        <p><strong>Телефон:</strong> {proposal.phone}</p>
                        
                        {tenderStatus.status === 'active' && !userVoted && (
                          <button 
                            className="vote-btn"
                            onClick={() => voteForProposal(tender.id, proposal.id)}
                          >
                            Голосовать за это предложение
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {tenderStatus.status === 'active' && (
                  <div className="add-proposal">
                    {!showForm ? (
                      <button 
                        className="add-proposal-btn"
                        onClick={() => setShowForm(true)}
                      >
                        + Подать свое предложение
                      </button>
                    ) : (
                      <div className="proposal-form">
                        <h4>Новое предложение</h4>
                        
                        <textarea
                          placeholder="Описание предложения"
                          value={newProposal.description}
                          onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                        />
                        
                        <input
                          type="number"
                          placeholder="Стоимость (рубли)"
                          value={newProposal.cost}
                          onChange={(e) => setNewProposal({...newProposal, cost: e.target.value})}
                        />
                        
                        <input
                          type="text"
                          placeholder="Условия оплаты"
                          value={newProposal.conditions}
                          onChange={(e) => setNewProposal({...newProposal, conditions: e.target.value})}
                        />
                        
                        <input
                          type="text"
                          placeholder="Сроки выполнения"
                          value={newProposal.timeline}
                          onChange={(e) => setNewProposal({...newProposal, timeline: e.target.value})}
                        />
                        
                        <div className="form-buttons">
                          <button 
                            className="submit-btn"
                            onClick={() => addProposal(tender.id)}
                          >
                            Подать предложение
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={() => setShowForm(false)}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tenderStatus.status === 'completed' && (
                  <div className="tender-results">
                    <h4>🎯 Результаты тендера</h4>
                    {getWinner(tender) ? (
                      <div className="winner-info">
                        <p><strong>Победитель:</strong> {getWinner(tender).initiator}</p>
                        <p><strong>Предложение:</strong> {getWinner(tender).description}</p>
                        <p><strong>Стоимость:</strong> {getWinner(tender).cost.toLocaleString()} ₽</p>
                        <p><strong>Голосов:</strong> {getWinner(tender).votes?.length || 0}</p>
                        <button className="proceed-btn">
                          Перейти к финансированию →
                        </button>
                      </div>
                    ) : (
                      <p>Нет предложений для выполнения</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .tender-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .tender-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .tender-header h2 {
          color: #2563eb;
          margin-bottom: 10px;
        }

        .no-tenders {
          text-align: center;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .tenders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tender-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: white;
        }

        .tender-card.completed {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .tender-info h3 {
          color: #1f2937;
          margin-bottom: 10px;
        }

        .tender-meta {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin: 10px 0;
          font-size: 14px;
        }

        .status.active {
          color: #f59e0b;
        }

        .status.completed {
          color: #10b981;
        }

        .votes-total {
          color: #6b7280;
        }

        .proposals {
          margin-top: 20px;
        }

        .proposals h4 {
          color: #374151;
          margin-bottom: 15px;
        }

        .proposal {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
          background: #f9fafb;
        }

        .proposal.voted {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .proposal.winner {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .proposal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .proposal-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .winner-badge {
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .proposal-votes {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6b7280;
        }

        .your-vote {
          color: #3b82f6;
          font-weight: bold;
        }

        .proposal p {
          margin: 5px 0;
          color: #374151;
        }

        .vote-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 10px;
        }

        .vote-btn:hover {
          background: #2563eb;
        }

        .add-proposal {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .add-proposal-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .add-proposal-btn:hover {
          background: #059669;
        }

        .proposal-form {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 20px;
        }

        .proposal-form h4 {
          margin-bottom: 15px;
          color: #374151;
        }

        .proposal-form textarea,
        .proposal-form input {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          margin-bottom: 10px;
          box-sizing: border-box;
        }

        .proposal-form textarea {
          height: 80px;
          resize: vertical;
        }

        .form-buttons {
          display: flex;
          gap: 10px;
        }

        .submit-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .submit-btn:hover {
          background: #059669;
        }

        .cancel-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background: #4b5563;
        }

        .tender-results {
          background: #f0fdf4;
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }

        .tender-results h4 {
          color: #10b981;
          margin-bottom: 15px;
        }

        .winner-info p {
          margin: 5px 0;
          color: #374151;
        }

        .proceed-btn {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 15px;
        }

        .proceed-btn:hover {
          background: #d97706;
        }

        @media (max-width: 768px) {
          .tender-page {
            padding: 10px;
          }
          
          .tender-meta {
            flex-direction: column;
            gap: 5px;
          }
          
          .proposal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .form-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TenderPage;