import { useState, useCallback } from 'react';

/*
 * useSettings — хранит API-ключи в localStorage.
 * Сейчас это плейсхолдеры; в будущем сюда же добавляются
 * выбор провайдера и любые другие настройки.
 */

const STORAGE_KEYS = {
  provider:       'myau_provider',
  aiKey:          'myau_api_key',
  ollamaUrl:      'myau_ollama_url',
  ollamaModel:    'myau_ollama_model',
  telegramToken:  'myau_tg_token',
  telegramChatId: 'myau_tg_chat_id',
  sendToTelegram: 'myau_send_to_tg',
};

const DEFAULTS = {
  provider:       'groq',   // 'groq' | 'ollama'
  aiKey:          '',
  ollamaUrl:      'http://localhost:11434',
  ollamaModel:    'llama3.1:8b',
  telegramToken:  '',
  telegramChatId: '',
  sendToTelegram: true,
};

function loadSettings() {
  const stg = localStorage.getItem(STORAGE_KEYS.sendToTelegram);
  return {
    provider:       localStorage.getItem(STORAGE_KEYS.provider)       ?? DEFAULTS.provider,
    aiKey:          localStorage.getItem(STORAGE_KEYS.aiKey)          ?? DEFAULTS.aiKey,
    ollamaUrl:      localStorage.getItem(STORAGE_KEYS.ollamaUrl)      ?? DEFAULTS.ollamaUrl,
    ollamaModel:    localStorage.getItem(STORAGE_KEYS.ollamaModel)    ?? DEFAULTS.ollamaModel,
    telegramToken:  localStorage.getItem(STORAGE_KEYS.telegramToken)  ?? DEFAULTS.telegramToken,
    telegramChatId: localStorage.getItem(STORAGE_KEYS.telegramChatId) ?? DEFAULTS.telegramChatId,
    sendToTelegram: stg === null ? DEFAULTS.sendToTelegram : stg === 'true',
  };
}

export const useSettings = () => {
  const [settings, setSettingsState] = useState(loadSettings);

  const updateField = useCallback((key, value) => {
    localStorage.setItem(STORAGE_KEYS[key], value);
    setSettingsState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { settings, updateField };
};
