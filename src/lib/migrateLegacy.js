// src/lib/migrateLegacy.js
// Переносим старый формат 'vg_votings' в новый 'vg_cases' (один раз).

import { getCase, listCases } from './caseStore';

const CASES_KEY = 'vg_cases';

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nowISO(){ return new Date().toISOString(); }

function uid(p='case_'){ return p + Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function migrateLegacyPollsToCases() {
  try {
    if (localStorage.getItem('vg_migrated_polls_to_cases') === '1') return;
    
    const old = read('vg_votings', []);
    if (!Array.isArray(old) || old.length === 0) {
      localStorage.setItem('vg_migrated_polls_to_cases','1');
      return;
    }
    
    const existed = read(CASES_KEY, []);
    
    const converted = old.map(v => ({
      id: uid(),
      title: v.title || '',
      text: v.text || '',
      status: (['tender','funding','execution','review','archived','rejected','draft'].includes(v.status))
        ? v.status
        : 'voting',
      participants: Array.isArray(v.participants) ? v.participants : [],
      requiresFinancing: !!v.requiresFinancing,
      requiresInitiator: !!v.requiresInitiator,
      createdBy: v.createdBy || 'system',
      createdAt: v.createdAt || nowISO(),
      updatedAt: nowISO(),
      voting: { startAt: nowISO(), endAt: null, votes: [] },
      tender: { proposals: v.tenderProposals || [], votes: [], winningProposalId: null, closedAt: null },
      funding: { targetAmount: Number(v.targetAmount || 0), pledges: [], closedAt: null },
      execution: { startedAt: null, finishedAt: null, report: null },
      reviews: []
    }));
    
    // Склейка без дублей
    const byId = new Map(existed.map(c => [c.id, c]));
    for (const c of converted) byId.set(c.id, { ...(byId.get(c.id)||{}), ...c });
    
    write(CASES_KEY, Array.from(byId.values()));
    localStorage.setItem('vg_migrated_polls_to_cases','1');
  } catch (e) {
    console.warn('migrateLegacyPollsToCases error:', e);
  }
}