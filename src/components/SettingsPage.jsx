import React from 'react';
import { ChevronLeft } from 'lucide-react';
import SecretField from './SecretField';
import AccentPicker from './AccentPicker';
import styles from './SettingsPage.module.css';

/*
 * SettingsPage — страница настроек.
 * Получает всё снаружи через пропсы, сама ничего не хранит —
 * стейт живёт в App.jsx через хуки useSettings + useTheme.
 *
 * Props:
 *   onBack       — () => void
 *   settings     — { provider, aiKey, telegramToken, telegramChatId }
 *   updateField  — (key, value) => void
 *   theme        — 'light' | 'dark'
 *   setTheme     — (t: 'light'|'dark') => void
 *   accents      — { light: '#...', dark: '#...' }
 *   setAccent    — (forTheme, hex) => void
 */

/* ─── ПРОВАЙДЕРЫ (расширять здесь) ─────────────────────────────── */
const PROVIDERS = [
  { id: 'groq',   label: 'Groq',   badge: 'Cloud' },
  { id: 'ollama', label: 'Ollama', badge: 'Local' },
];

const SettingsPage = ({
  onBack,
  settings,
  updateField,
  theme,
  setTheme,
  accents,
  setAccent,
}) => {
  return (
    <div className="screen">
      <div className={styles.page}>

        {/* ── НАВИГАЦИЯ ──────────────────────────────────────────── */}
        <header className={`${styles.navBar} glass-mid`}>
          <button
            id="btn-settings-back"
            className={`${styles.backBtn} no-select pressable`}
            onClick={onBack}
            aria-label="Назад"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
            <span>Назад</span>
          </button>
          <h1 className={styles.navTitle}>Настройки</h1>
          {/* правый слот — пустой, для симметрии */}
          <div className={styles.navRight} />
        </header>

        {/* ── КОНТЕНТ ────────────────────────────────────────────── */}
        <main className={`scroll-area ${styles.content}`}>
          <div className={`container safe-bottom ${styles.sections}`}>

            {/* ════ AI ПРОВАЙДЕР ══════════════════════════════════ */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>ИИ Провайдер</h2>

              <div className={`${styles.card} glass-mid`}>
                <div className={styles.providerRow}>
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      id={`btn-provider-${p.id}`}
                      type="button"
                      className={`${styles.providerBtn} ${settings.provider === p.id ? styles.providerActive : ''} no-select`}
                      onClick={() => updateField('provider', p.id)}
                    >
                      <span className={styles.providerLabel}>{p.label}</span>
                      <span className={styles.providerBadge}>{p.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ════ API КЛЮЧИ ═════════════════════════════════════ */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Ключи доступа</h2>

              <div className={styles.fieldsStack}>
                <SecretField
                  id="field-ai-key"
                  label="AI API Key"
                  hint="Ключ для выбранного провайдера (Groq, Ollama и др.)"
                  value={settings.aiKey}
                  onChange={(val) => updateField('aiKey', val)}
                  placeholder="sk-••••••••••••••••"
                />
                <SecretField
                  id="field-tg-token"
                  label="Telegram Bot Token"
                  hint="Токен бота из @BotFather — для уведомлений"
                  value={settings.telegramToken}
                  onChange={(val) => updateField('telegramToken', val)}
                  placeholder="123456789:AABBcc••••"
                />
                <SecretField
                  id="field-tg-chat"
                  label="Telegram Chat ID"
                  hint="Идентификатор чата куда бот отправит результат"
                  value={settings.telegramChatId}
                  onChange={(val) => updateField('telegramChatId', val)}
                  placeholder="-100••••••••••"
                />
              </div>
            </section>

            {/* ════ ТЕМА ══════════════════════════════════════════ */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Тема</h2>

              {/* Переключатель светлая / тёмная */}
              <div className={`${styles.card} glass-mid`}>
                <div className={styles.themeRow}>
                  {[
                    { id: 'light', emoji: '☀️', label: 'Светлая' },
                    { id: 'dark',  emoji: '🌙', label: 'Тёмная'  },
                  ].map((t) => (
                    <button
                      key={t.id}
                      id={`btn-theme-${t.id}`}
                      type="button"
                      className={`${styles.themeBtn} ${theme === t.id ? styles.themeBtnActive : ''} no-select`}
                      onClick={() => setTheme(t.id)}
                    >
                      <span className={styles.themeEmoji}>{t.emoji}</span>
                      <span className={styles.themeLabel}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Акценты — для каждой темы отдельно */}
              {[
                { id: 'light', label: 'Акцент светлой темы' },
                { id: 'dark',  label: 'Акцент тёмной темы'  },
              ].map((t) => (
                <div key={t.id} className={`${styles.accentBlock} glass-mid`}>
                  <div className={styles.accentHeader}>
                    <span className={styles.accentLabel}>{t.label}</span>
                    {theme === t.id && (
                      <span className={styles.accentBadgeActive}>Активна</span>
                    )}
                  </div>
                  <AccentPicker
                    forTheme={t.id}
                    current={accents[t.id]}
                    onChange={(hex) => setAccent(t.id, hex)}
                    disabled={false}
                  />
                </div>
              ))}
            </section>

            <div className="bottom-nav-spacer" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
