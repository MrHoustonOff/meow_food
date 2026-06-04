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
  { id: 'mock',   label: 'Mock',   badge: 'Dev' },
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
  onTestApi,
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
                {settings.provider === 'mock' ? (
                  <div style={{ padding: 'var(--space-3)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
                      Включен режим мокирования. Запросы к ИИ не отправляются, токены не тратятся. Котик просто притворится, что всё понял! 🐾
                    </p>
                  </div>
                ) : settings.provider === 'groq' ? (
                  <>
                    <SecretField
                      id="field-ai-key"
                      label="Groq API Key"
                      hint="Ключ для облачной модели Llama 3"
                      value={settings.aiKey}
                      onChange={(val) => updateField('aiKey', val)}
                      placeholder="gsk_••••••••••••••••"
                    />
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Основная модель</span>
                      <select 
                        className={styles.input} 
                        value={settings.groqModel || 'llama-3.3-70b-versatile'}
                        onChange={(e) => updateField('groqModel', e.target.value)}
                        style={{ fontFamily: 'var(--font-round)' }}
                      >
                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Умная, может падать)</option>
                        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Быстрая, стабильная)</option>
                      </select>
                    </div>

                    {(() => {
                      const fallbackUntil = localStorage.getItem('myau_groq_fallback_until');
                      let isFallbackActive = false;
                      let fallbackTimeLeft = '';
                      if (fallbackUntil) {
                        const untilTime = parseInt(fallbackUntil, 10);
                        const now = Date.now();
                        if (untilTime > now) {
                          isFallbackActive = true;
                          const diffMins = Math.ceil((untilTime - now) / 60000);
                          const h = Math.floor(diffMins / 60);
                          const m = diffMins % 60;
                          fallbackTimeLeft = h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
                        }
                      }
                      
                      const currentPrimary = settings.groqModel || 'llama-3.3-70b-versatile';
                      const currentModel = isFallbackActive ? 'llama-3.1-8b-instant' : currentPrimary;
                      
                      return (
                        <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--separator)' }}>
                          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            <b>Текущая модель:</b> {currentModel}
                            {isFallbackActive && <><br/><i>Сброс лимита через: {fallbackTimeLeft}</i></>}
                          </p>
                          {isFallbackActive && (
                            <button 
                              onClick={() => { 
                                localStorage.removeItem('myau_groq_fallback_until'); 
                                window.location.reload(); 
                              }}
                              style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Сбросить лимит вручную
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <SecretField
                      id="field-ollama-url"
                      label="Ollama URL"
                      hint="Локальный адрес сервера Ollama"
                      value={settings.ollamaUrl}
                      onChange={(val) => updateField('ollamaUrl', val)}
                      placeholder="http://localhost:11434"
                    />
                    <SecretField
                      id="field-ollama-model"
                      label="Модель Ollama"
                      hint="Название скачанной модели"
                      value={settings.ollamaModel}
                      onChange={(val) => updateField('ollamaModel', val)}
                      placeholder="llama3.1:8b"
                    />
                    <button
                      type="button"
                      className="pressable no-select"
                      style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-2)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        fontSize: 'var(--text-sm)',
                        textAlign: 'left'
                      }}
                      onClick={() => {
                        updateField('ollamaUrl', 'http://localhost:11434');
                        updateField('ollamaModel', 'llama3.1:8b');
                      }}
                    >
                      Сбросить по умолчанию
                    </button>
                  </>
                )}

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

            {/* ════ DEV SECTION ════════════════════════════════════ */}
            <section className={styles.section} style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
              <button
                type="button"
                className="pressable no-select"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--glass-bg)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  backdropFilter: 'var(--glass-blur)',
                  border: '1.5px solid var(--accent)',
                  boxShadow: 'var(--shadow-accent)',
                  fontFamily: 'var(--font-round)',
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '-0.01em',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)'
                }}
                onClick={() => {
                  if (onTestApi) onTestApi();
                }}
              >
                Отправить тестовый запрос 🐾
              </button>
              
              <button
                type="button"
                className="pressable no-select"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: 'var(--radius-xl)',
                  background: localStorage.getItem('myau_dev_force_onboarding') === 'true' ? 'var(--accent)' : 'transparent',
                  border: '1.5px solid var(--accent)',
                  fontFamily: 'var(--font-round)',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: localStorage.getItem('myau_dev_force_onboarding') === 'true' ? '#fff' : 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  const isDev = localStorage.getItem('myau_dev_force_onboarding') === 'true';
                  if (isDev) {
                    localStorage.removeItem('myau_dev_force_onboarding');
                  } else {
                    localStorage.setItem('myau_dev_force_onboarding', 'true');
                  }
                  window.location.reload();
                }}
              >
                {localStorage.getItem('myau_dev_force_onboarding') === 'true' ? 'Dev Mode: Включен (Выключить)' : 'Dev Mode: Выключен (Включить)'}
              </button>

              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                Мяувник v0.8
              </span>
            </section>

            <div className="bottom-nav-spacer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
