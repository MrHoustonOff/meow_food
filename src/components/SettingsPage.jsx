import React, { useState } from 'react';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import SecretField from './SecretField';
import AccentPicker from './AccentPicker';
import styles from './SettingsPage.module.css';
import { calcGoals, ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../utils/goals.js';

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

/* ─── СЕКЦИЯ ЦЕЛЕЙ ──────────────────────────────────────────────── */
function GoalsSection({ settings, updateField }) {
  const g = settings.goals || {};
  const [gender,   setGender]   = useState(g.gender   || 'male');
  const [weight,   setWeight]   = useState(g.weight   || 80);
  const [height,   setHeight]   = useState(g.height   || 180);
  const [age,      setAge]      = useState(g.age      || 21);
  const [activity, setActivity] = useState(g.activity || 1.375);
  const [goal,     setGoal]     = useState(g.goal     || 'maintain');
  const [custom,   setCustom]   = useState({
    calories: g.custom_calories ?? null,
    proteins: g.custom_proteins ?? null,
    fats:     g.custom_fats     ?? null,
    carbs:    g.custom_carbs    ?? null,
  });

  const raw = calcGoals({ gender, weight, height, age, activity, goal })._raw;

  const save = (patch) => {
    const next = { gender, weight, height, age, activity, goal,
      custom_calories: custom.calories, custom_proteins: custom.proteins,
      custom_fats: custom.fats, custom_carbs: custom.carbs,
      ...patch };
    updateField('goals', next);
  };

  const handleBlur = () => save({
    custom_calories: custom.calories,
    custom_proteins: custom.proteins,
    custom_fats:     custom.fats,
    custom_carbs:    custom.carbs,
  });

  const resetCustom = () => {
    setCustom({ calories: null, proteins: null, fats: null, carbs: null });
    save({ custom_calories: null, custom_proteins: null, custom_fats: null, custom_carbs: null });
  };

  const disp = (field) => custom[field] ?? raw[field];

  // Общий стиль инлайн-инпута числа (используется в нескольких местах)
  const numInputStyle = {
    width: 72,
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--separator)',
    background: 'var(--bg-app)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-round)',
    fontSize: 15,
    fontWeight: 600,
    outline: 'none',
    textAlign: 'right',
  };

  const segBtnStyle = (active) => ({
    flex: 1,
    padding: '8px 4px',
    borderRadius: 'var(--radius-lg)',
    border: active ? 'none' : '1px solid var(--separator)',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontFamily: 'var(--font-round)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle} style={{ fontSize: '20px', textTransform: 'none', color: 'var(--text-primary)', marginBottom: '4px' }}>
        Мои цели
      </h2>

      {/* ── Пол ── */}
      <div className={styles.card} style={{ background: 'var(--glass-bg)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Пол</span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {[{ v: 'male', l: 'Мужчина' }, { v: 'female', l: 'Женщина' }].map(o => (
              <button key={o.v} style={segBtnStyle(gender === o.v)} onClick={() => { setGender(o.v); save({ gender: o.v }); }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Вес / Рост / Возраст ── */}
        {[
          { label: 'Вес (кг)',  val: weight, field: 'weight', set: setWeight },
          { label: 'Рост (см)', val: height, field: 'height', set: setHeight },
          { label: 'Возраст',   val: age,    field: 'age',    set: setAge },
        ].map(it => (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--separator)', paddingTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{it.label}</span>
            <input
              type="number" inputMode="decimal"
              style={numInputStyle}
              value={it.val}
              onChange={e => { it.set(Number(e.target.value)); save({ [it.field]: Number(e.target.value) }); }}
            />
          </div>
        ))}
      </div>

      {/* ── Активность ── */}
      <div className={styles.card} style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--separator)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Активность</span>
        </div>
        {ACTIVITY_OPTIONS.map((o, i) => (
          <button
            key={o.value}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '14px var(--space-4)',
              background: activity === o.value ? 'var(--accent-muted)' : 'transparent',
              border: 'none',
              borderTop: i > 0 ? '1px solid var(--separator)' : 'none',
              fontFamily: 'var(--font-round)', cursor: 'pointer', textAlign: 'left',
            }}
            onClick={() => { setActivity(o.value); save({ activity: o.value }); }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: activity === o.value ? 'var(--accent)' : 'var(--text-primary)' }}>{o.label}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{o.hint}</span>
          </button>
        ))}
      </div>

      {/* ── Цель ── */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {GOAL_OPTIONS.map(o => (
          <button key={o.value} style={segBtnStyle(goal === o.value)} onClick={() => { setGoal(o.value); save({ goal: o.value }); }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* ── Превью целей ── */}
      <div className={styles.card} style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--separator)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Рассчитано для вас</span>
          <button style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', fontFamily: 'var(--font-round)', fontWeight: 600, cursor: 'pointer' }} onClick={resetCustom}>
            Сбросить
          </button>
        </div>
        {[
          { key: 'calories', label: 'Калории (ккал)' },
          { key: 'proteins', label: 'Белки (г)' },
          { key: 'fats',     label: 'Жиры (г)' },
          { key: 'carbs',    label: 'Углеводы (г)' },
        ].map((it, i) => (
          <div key={it.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px var(--space-4)', borderTop: i > 0 ? '1px solid var(--separator)' : 'none' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{it.label}</span>
            <input
              type="number" inputMode="decimal"
              style={{ ...numInputStyle, background: 'var(--bg-surface)' }}
              value={disp(it.key)}
              onChange={e => setCustom(prev => ({ ...prev, [it.key]: e.target.value === '' ? null : Number(e.target.value) }))}
              onBlur={handleBlur}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

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
              <h2 className={styles.sectionTitle} style={{ fontSize: '20px', textTransform: 'none', color: 'var(--text-primary)', marginBottom: '4px' }}>Нейросеть</h2>

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginLeft: 'var(--space-2)' }}>
                        Основная модель
                      </span>
                      <select 
                        value={settings.groqModel || 'llama-3.3-70b-versatile'}
                        onChange={(e) => updateField('groqModel', e.target.value)}
                        style={{ 
                          fontFamily: 'var(--font-round)', 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: 'var(--radius-lg)', 
                          background: 'var(--bg-app)', 
                          border: '1px solid var(--separator)', 
                          color: 'var(--text-primary)', 
                          fontSize: '16px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
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

              </div>
            </section>

            <div style={{ height: '1px', background: 'var(--separator)', margin: 'var(--space-2) var(--space-4)' }} />

            {/* ════ TELEGRAM ══════════════════════════════════════ */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle} style={{ fontSize: '20px', textTransform: 'none', color: 'var(--text-primary)', marginBottom: '4px' }}>Telegram</h2>

              <div className={styles.fieldsStack}>
                <div className={`${styles.card} glass-mid`}>
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

            {/* ── ЦЕЛИ И ПРОФИЛЬ ─────────────────────────────────── */}
            <GoalsSection settings={settings} updateField={updateField} />

            {/* ── СПРАВКА ПО ФОРМУЛЕ ───────────────────────── */}
            <section className={styles.section}>
              <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>Формула расчёта</span>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                  <b>Миффлин–Сан Жеор:</b><br />
                  Муж: BMR = 10×вес + 6.25×рост − 5×возраст + 5<br />
                  Жен: BMR = 10×вес + 6.25×рост − 5×возраст − 161<br />
                  TDEE = BMR × коэффициент активности<br />
                  Белки: 1.8 г/кг · вес | Жиры: 25% ккал | Углеводы: остаток
                </p>
              </div>
            </section>

            {/* ── Тестовый запрос + версия ── */}
            <section className={styles.section} style={{ alignItems: 'center' }}>
              <button
                type="button"
                className="pressable no-select"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  border: '1.5px solid var(--accent)',
                  boxShadow: 'var(--shadow-accent)',
                  fontFamily: 'var(--font-round)',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => { if (onTestApi) onTestApi(); }}
              >
                Тестовый запрос к ИИ
              </button>

              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                Мяувник v1.0
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
