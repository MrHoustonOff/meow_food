import { useState, useCallback } from 'react';

/*
 * useSettings — хранит API-ключи в localStorage.
 * Сейчас это плейсхолдеры; в будущем сюда же добавляются
 * выбор провайдера и любые другие настройки.
 */

const STORAGE_KEYS = {
  provider:       'myau_provider',
  aiKey:          'myau_api_key',
  groqModel:      'myau_groq_model',
  ollamaUrl:      'myau_ollama_url',
  ollamaModel:    'myau_ollama_model',
  telegramToken:  'myau_tg_token',
  telegramChatId: 'myau_tg_chat_id',
  sendToTelegram: 'myau_send_to_tg',
  goals:          'myau_goals',
};

const DEFAULTS = {
  provider:       'groq',
  aiKey:          '',
  groqModel:      'llama-3.3-70b-versatile',
  ollamaUrl:      'http://localhost:11434',
  ollamaModel:    'llama3.1:8b',
  telegramToken:  '',
  telegramChatId: '',
  sendToTelegram: true,
  goals:          { gender: 'male', weight: 80, height: 180, age: 21, activity: 1.375, goal: 'maintain' },
};

function loadSettings() {
  const stg = localStorage.getItem(STORAGE_KEYS.sendToTelegram);
  let goals = DEFAULTS.goals;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.goals);
    if (raw) goals = JSON.parse(raw);
  } catch {}
  return {
    provider:       localStorage.getItem(STORAGE_KEYS.provider)       ?? DEFAULTS.provider,
    aiKey:          localStorage.getItem(STORAGE_KEYS.aiKey)          ?? DEFAULTS.aiKey,
    groqModel:      localStorage.getItem(STORAGE_KEYS.groqModel)      ?? DEFAULTS.groqModel,
    ollamaUrl:      localStorage.getItem(STORAGE_KEYS.ollamaUrl)      ?? DEFAULTS.ollamaUrl,
    ollamaModel:    localStorage.getItem(STORAGE_KEYS.ollamaModel)    ?? DEFAULTS.ollamaModel,
    telegramToken:  localStorage.getItem(STORAGE_KEYS.telegramToken)  ?? DEFAULTS.telegramToken,
    telegramChatId: localStorage.getItem(STORAGE_KEYS.telegramChatId) ?? DEFAULTS.telegramChatId,
    sendToTelegram: stg === null ? DEFAULTS.sendToTelegram : stg === 'true',
    goals,
  };
}

export const useSettings = () => {
  const [settings, setSettingsState] = useState(loadSettings);

  const updateField = useCallback((key, value) => {
    const toStore = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
    localStorage.setItem(STORAGE_KEYS[key], toStore);
    setSettingsState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { settings, updateField };
};
