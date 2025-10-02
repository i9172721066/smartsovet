// src/lib/caseStore.js
// Единая карточка дела (case) со статус-машиной и логикой подсчетов
// Адаптировано для проекта СмартСовет

const CASES_KEY = 'smartsovet_cases';

function readCases() {
  try { 
    return JSON.parse(localStorage.getItem(CASES_KEY) || '[]'); 
  } catch { 
    return []; 
  }
}

function writeCases(arr) {
  localStorage.setItem(CASES_KEY, JSON.stringify(arr || []));
}

function nowISO() { 
  return new Date().toISOString(); 
}

function uid(prefix = 'case_') { 
  return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36); 
}

// Инициализация тестовых данных
export function seedCasesIfEmpty() {
  const seeded = localStorage.getItem('smartsovet_cases_seeded');
  const cases = readCases();
  
  if (seeded === '1' || cases.length > 0) return;
  
  const sample = {
    id: uid('case_'),
    title: 'Срочно нужен трактор для расчистки снега',
    text: 'Требуется расчистка снега на улице Корабельная',
    status: 'voting', // draft | voting | tender | funding | execution | review | archived | rejected
    participants: ['al56', 'user1', 'user2'],
    requiresFinancing: true,
    requiresInitiator: true,
    createdBy: 'admin',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    
    voting: {
      startAt: nowISO(),
      endAt: null,
      votes: [] // {userId, houseId, choice:'yes'|'no'|'abstain', initiator:'yes'|'no', at}
    },
    
    tender: {
      proposals: [], // {id,title,description,cost,paymentType,executor,timeline,authorId,authorName,createdAt}
      votes: [],     // {userId,houseId,proposalId,at}
      winningProposalId: null,
      closedAt: null,
    },
    
    funding: {
      targetAmount: 5000,
      pledges: [],   // {userId,houseId,amount,at}
      closedAt: null,
    },
    
    execution: {
      startedAt: null,
      finishedAt: null,
      report: null,
    },
    
    reviews: []      // {userId,houseId,score,comment,at}
  };
  
  writeCases([sample]);
  localStorage.setItem('smartsovet_cases_seeded', '1');
}

// Получить список дел
export function listCases(filter) {
  const arr = readCases().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  
  if (filter === 'active') {
    return arr.filter(c => !['archived', 'rejected'].includes(c.status));
  }
  if (filter === 'archived') {
    return arr.filter(c => ['archived', 'rejected'].includes(c.status));
  }
  
  return arr;
}

// Получить одно дело по ID
export function getCase(id) {
  return readCases().find(c => c.id === id) || null;
}

// Сохранить дело
function saveCase(next) {
  const arr = readCases();
  const i = arr.findIndex(c => c.id === next.id);
  next.updatedAt = nowISO();
  
  if (i === -1) arr.push(next); 
  else arr[i] = next;
  
  writeCases(arr);
  return next;
}

// Изменить статус дела
export function setStatus(id, status) {
  const c = getCase(id); 
  if (!c) return null;
  
  c.status = status;
  return saveCase(c);
}

// ==================== VOTING ====================

export function recordVote(caseId, { userId, houseId, choice, initiator = 'no' }) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  if (!c.voting) c.voting = { startAt: nowISO(), endAt: null, votes: [] };
  
  // 1 дом = 1 голос: перезаписываем голос дома
  const idx = c.voting.votes.findIndex(v => v.houseId === houseId);
  const voteObj = { userId, houseId, choice, initiator, at: nowISO() };
  
  if (idx === -1) c.voting.votes.push(voteObj);
  else c.voting.votes[idx] = voteObj;
  
  return saveCase(c);
}

export function summarizeVoting(c) {
  const votes = c?.voting?.votes || [];
  const totals = votes.reduce((acc, v) => {
    acc.total++;
    if (v.choice === 'yes') acc.yes++;
    else if (v.choice === 'no') acc.no++;
    else acc.abstain++;
    return acc;
  }, { yes: 0, no: 0, abstain: 0, total: 0 });
  
  const totalEligible = Array.isArray(c?.participants) ? c.participants.length : 0;
  return { totals, totalEligible };
}

export function closeVoting(caseId) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  if (!c.voting) c.voting = { startAt: nowISO(), endAt: null, votes: [] };
  c.voting.endAt = nowISO();
  
  // Решение: «ДА» > «НЕТ» → тендер, иначе rejected
  const { totals } = summarizeVoting(c);
  if (totals.yes > totals.no) {
    c.status = 'tender';
  } else {
    c.status = 'rejected';
  }
  
  return saveCase(c);
}

// ==================== TENDER ====================

export function addTenderProposal(caseId, data, author = {}) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  if (!c.tender) c.tender = { proposals: [], votes: [], winningProposalId: null, closedAt: null };
  
  const p = {
    id: uid('proposal_'),
    title: data.title || '',
    description: data.description || '',
    cost: Number(data.cost || 0),
    paymentType: data.paymentType || 'prepaid',
    executor: data.executor || '',
    timeline: data.timeline || '',
    authorId: author.userId || 'user',
    authorName: author.name || 'Пользователь',
    createdAt: nowISO(),
  };
  
  c.tender.proposals.push(p);
  return saveCase(c);
}

export function voteTenderProposal(caseId, proposalId, { userId, houseId }) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  if (!c.tender) c.tender = { proposals: [], votes: [], winningProposalId: null, closedAt: null };
  
  // 1 дом = 1 голос за тендер
  const idx = c.tender.votes.findIndex(v => v.houseId === houseId);
  const voteObj = { userId, houseId, proposalId, at: nowISO() };
  
  if (idx === -1) c.tender.votes.push(voteObj);
  else c.tender.votes[idx] = voteObj;
  
  return saveCase(c);
}

export function summarizeTender(c) {
  const proposals = c?.tender?.proposals || [];
  const votes = c?.tender?.votes || [];
  
  const countByProposal = votes.reduce((m, v) => {
    m[v.proposalId] = (m[v.proposalId] || 0) + 1;
    return m;
  }, {});
  
  return proposals
    .map(p => ({ ...p, votes: countByProposal[p.id] || 0 }))
    .sort((a, b) => (b.votes - a.votes) || (a.cost - b.cost));
}

export function closeTender(caseId) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  const ranked = summarizeTender(c);
  c.tender.closedAt = nowISO();
  c.tender.winningProposalId = ranked[0]?.id || null;
  
  // если есть финансирование — переходим к сбору, иначе сразу к исполнению
  c.status = c.requiresFinancing ? 'funding' : 'execution';
  return saveCase(c);
}

// ==================== FUNDING ====================

export function addPledge(caseId, { userId, houseId, amount }) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  if (!c.funding) c.funding = { targetAmount: 0, pledges: [], closedAt: null };
  
  // Разрешим несколько платежей от дома — суммируем
  c.funding.pledges.push({ 
    userId, 
    houseId, 
    amount: Number(amount || 0), 
    at: nowISO() 
  });
  
  return saveCase(c);
}

export function totalPledged(c) {
  return (c?.funding?.pledges || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
}

export function closeFunding(caseId) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  c.funding.closedAt = nowISO();
  c.status = 'execution';
  return saveCase(c);
}

// ==================== EXECUTION ====================

export function startExecution(caseId) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  if (!c.execution) c.execution = { startedAt: null, finishedAt: null, report: null };
  c.execution.startedAt = nowISO();
  return saveCase(c);
}

export function finishExecution(caseId, { text }) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  if (!c.execution) c.execution = { startedAt: null, finishedAt: null, report: null };
  c.execution.finishedAt = nowISO();
  c.execution.report = text || 'Работы завершены';
  c.status = 'review';
  return saveCase(c);
}

// ==================== REVIEW ====================

export function addReview(caseId, { userId, houseId, score, comment }) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  const s = Math.max(1, Math.min(10, Number(score || 0)));
  
  // 1 дом = 1 оценка (перезапись)
  const idx = c.reviews.findIndex(r => r.houseId === houseId);
  const rv = { userId, houseId, score: s, comment: comment || '', at: nowISO() };
  
  if (idx === -1) c.reviews.push(rv);
  else c.reviews[idx] = rv;
  
  return saveCase(c);
}

export function summarizeReviews(c) {
  const r = c?.reviews || [];
  const count = r.length;
  const sum = r.reduce((s, x) => s + (Number(x.score) || 0), 0);
  const avg = count ? Math.round((sum / count) * 10) / 10 : 0;
  return { count, avg };
}

export function archiveCase(caseId) {
  const c = getCase(caseId); 
  if (!c) return null;
  
  c.status = 'archived';
  return saveCase(c);
}
// ==================== CREATE & MANAGE ====================
// ДОБАВЬ ЭТИ ФУНКЦИИ В КОНЕЦ ФАЙЛА src/lib/caseStore.js

export function createCase(data) {
  const cases = readCases();
  
  const newCase = {
    id: uid('case_'),
    title: data.title || 'Без названия',
    text: data.text || '',
    status: data.status || 'draft',
    participants: data.participants || [],
    requiresFinancing: data.requiresFinancing !== undefined ? data.requiresFinancing : false,
    requiresInitiator: data.requiresInitiator !== undefined ? data.requiresInitiator : false,
    createdBy: data.createdBy || 'system',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    
    voting: {
      startAt: null,
      endAt: null,
      votes: []
    },
    
    tender: {
      proposals: [],
      votes: [],
      winningProposalId: null,
      closedAt: null
    },
    
    funding: data.funding || {
      targetAmount: 0,
      pledges: [],
      closedAt: null
    },
    
    execution: {
      startedAt: null,
      finishedAt: null,
      report: null
    },
    
    reviews: []
  };
  
  cases.push(newCase);
  writeCases(cases);
  return newCase;
}

export function startVoting(caseId) {
  const c = getCase(caseId);
  if (!c) return null;
  
  if (c.status !== 'draft') {
    console.warn('Голосование можно запустить только для черновиков');
    return null;
  }
  
  c.status = 'voting';
  c.voting.startAt = nowISO();
  return saveCase(c);
}

export function deleteCase(caseId) {
  const cases = readCases();
  const filtered = cases.filter(c => c.id !== caseId);
  writeCases(filtered);
  return true;
}