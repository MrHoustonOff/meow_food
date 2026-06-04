import { useState, useCallback } from 'react';

/*
 * useSettings — хранит API-ключи в localStorage.
 * Сейчас это плейсхолдеры; в будущем сюда же добавляются
 * выбор провайдера и любые другие настройки.
 */

const STORAGE_KEYS = {
  provider:       'myau_provider',
  aiKey:          'myau_api_key',
  telegramToken:  'myau_tg_token',
  telegramChatId: 'myau_tg_chat_id',
};

const DEFAULTS = {
  provider:       'groq',   // 'groq' | 'ollama'  (в будущем расширять здесь)
  aiKey:          '',
  telegramToken:  '',
  telegramChatId: '',
};

function loadSettings() {
  return {
    provider:       localStorage.getItem(STORAGE_KEYS.provider)       ?? DEFAULTS.provider,
    aiKey:          localStorage.getItem(STORAGE_KEYS.aiKey)          ?? DEFAULTS.aiKey,
    telegramToken:  localStorage.getItem(STORAGE_KEYS.telegramToken)  ?? DEFAULTS.telegramToken,
    telegramChatId: localStorage.getItem(STORAGE_KEYS.telegramChatId) ?? DEFAULTS.telegramChatId,
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
