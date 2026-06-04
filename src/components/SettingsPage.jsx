import React from 'react';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import SecretField from './SecretField';
import AccentPicker from './AccentPicker';
import styles from './SettingsPage.module.css';

/*
 * SettingsPage — страница настроек.
 * Получает всё снаружи через пропсы, сама ничего не хранит —
 * стейт живёт в App.jsx через хуки useSettings + useTheme.
 *
 * Props:
 *   onBack          — () => void
 *   settings        — { provider, aiKey, telegramToken, telegramChatId }
 *   updateField     — (key, value) => void
 *   theme           — 'light' | 'dark'
 *   setTheme        — (t: 'light'|'dark') => void
 *   systemTheme     — boolean
 *   setSystemTheme  — (bool) => void
 *   accents         — { light: '#...', dark: '#...' }
 *   setAccent       — (forTheme, hex) => void
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
  systemTheme,
  setSystemTheme,
  accents,
  setAccent,
}) => {
  return (
    <div className="screen">
      <div className={styles.page}>

        {/* ── ЕДИНЫЙ СКРОЛЛ-КОНТЕЙНЕР ────────────────────────────── */}
        <div className={styles.content}>
          <div className={`container safe-bottom ${styles.sections}`}>

            {/* ── ЗАГОЛОВОК СТРАНИЦЫ (скроллится вместе) ── */}
            <div className={styles.pageHeader}>
              <button
                id="btn-settings-back"
                className={`${styles.backBtn} no-select pressable`}
                onClick={onBack}
                aria-label="Назад"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
                <span>Назад</span>
              </button>
              <h1 className={styles.pageTitle}>Настройки</h1>
            </div>

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

                <div className={`${styles.card} glass-mid`} style={{ marginTop: 'var(--space-2)' }}>
                  <button
                    type="button"
                    className={`${styles.systemThemeBtn} ${settings.sendToTelegram ? styles.systemThemeActive : ''} no-select`}
                    onClick={() => updateField('sendToTelegram', !settings.sendToTelegram)}
                  >
                    <span className={styles.systemThemeLabel}>Отправлять в Telegram</span>
                    <div className={styles.toggleSwitch}>
                      <div className={styles.toggleKnob} />
                    </div>
                  </button>
                </div>

                <div style={{ 
                  opacity: settings.sendToTelegram ? 1 : 0.4, 
                  pointerEvents: settings.sendToTelegram ? 'auto' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  transition: 'opacity 200ms ease'
                }}>
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
              </div>
            </section>

            {/* ════ ТЕМА ══════════════════════════════════════════ */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Тема</h2>
              
              {/* Автоматически по системе */}
              <div className={`${styles.card} glass-mid`}>
                <button
                  type="button"
                  className={`${styles.systemThemeBtn} ${systemTheme ? styles.systemThemeActive : ''} no-select`}
                  onClick={() => setSystemTheme(!systemTheme)}
                >
                  <span className={styles.systemThemeLabel}>По теме устройства</span>
                  <div className={styles.toggleSwitch}>
                    <div className={styles.toggleKnob} />
                  </div>
                </button>
              </div>

              {/* Переключатель светлая / тёмная */}
              <div className={`${styles.card} glass-mid`} style={{ opacity: systemTheme ? 0.5 : 1, pointerEvents: systemTheme ? 'none' : 'auto' }}>
                <div className={styles.themeRow}>
                  {[
                    { id: 'light', icon: <Sun size={20} strokeWidth={2.5} />, label: 'Светлая' },
                    { id: 'dark',  icon: <Moon size={20} strokeWidth={2.5} />, label: 'Тёмная'  },
                  ].map((t) => (
                    <button
                      key={t.id}
                      id={`btn-theme-${t.id}`}
                      type="button"
                      className={`${styles.themeBtn} ${theme === t.id && !systemTheme ? styles.themeBtnActive : ''} no-select`}
                      onClick={() => !systemTheme && setTheme(t.id)}
                    >
                      <span className={styles.themeIcon}>{t.icon}</span>
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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
