import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import SettingsPage from './components/SettingsPage';
import LoadingOverlay from './components/LoadingOverlay';
import PreviewPage from './components/PreviewPage';
import ConfirmBackModal from './components/ConfirmBackModal';
import ValidationModal from './components/ValidationModal';
import AiErrorModal from './components/AiErrorModal';
import TgErrorModal from './components/TgErrorModal';
import SuccessCopyModal from './components/SuccessCopyModal';
import TgSuccessModal from './components/TgSuccessModal';
import Onboarding from './components/Onboarding';
import JournalPage from './components/JournalPage';
import { Send, Cat, Paperclip, X } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useSettings } from './hooks/useSettings';
import { complete as llmComplete } from './services/llm/index.js';
import { buildPrompt, extractAndValidateJSON } from './utils/prompt.js';
import { send as sendToTg } from './services/telegram.js';
import { formatTgPreview } from './utils/formatters';
import styles from './App.module.css';

/* ─── КОНТЕКСТНЫЕ ПРИВЕТСТВИЯ ─────────────────────────────────── */
const GREETINGS = {
  morning: ['Доброе утро~ Что было на завтрак? 🌅', 'Утро началось! Расскажи что покушал~'],
  day:     ['Обедал(а) уже?~ Расскажи! ☀️', 'Самое время для обеда~ Что ел?'],
  evening: ['Ужин уже? Или ещё перекус?~ 🌆', 'Вечерок! Расскажи что сегодня ел~'],
  night:   ['Поздний перекус? Никто не осудит~ 🌙', 'Не сплю — жду твой рассказ~ 🌙'],
};

const PLACEHOLDERS = [
  'Я сегодня поймал ТАКУЮ РЫБУУ...',
  'Я сегодня поел...',
  'Рыбка, рыбка, рыбка...',
  'Ох кушал я сегодня...',
  'Расскажи мне что ты кушал, мяу~',
];

function getGreeting() {
  const h = new Date().getHours();
  const pool = h >= 5 && h < 11 ? GREETINGS.morning
             : h >= 11 && h < 16 ? GREETINGS.day
             : h >= 16 && h < 21 ? GREETINGS.evening
             : GREETINGS.night;
  return pool[Math.floor(Math.random() * pool.length)];
}

const BASE_HEIGHT_MULTIPLIER = 1.5;

/** Длительность mock-задержки (мс) */
const MOCK_DELAY = 2000;

function App() {
  // ── Глобальный стейт ──────────────────────────────────────────
  const { theme, accents, systemTheme, setTheme, toggleTheme, setSystemTheme, setAccent } = useTheme();
  const { settings, updateField } = useSettings();

  // ── Onboarding ─────────────────────────────────────────────────
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    const isComplete = localStorage.getItem('myau_onboarding_complete') === 'true';
    const forceDev = localStorage.getItem('myau_dev_force_onboarding') === 'true';
    if (forceDev) return false;
    return isComplete;
  });

  // ── Навигация ──────────────────────────────────────────────────
  const [view, setView] = useState('home'); // 'home' | 'settings' | 'journal'

  // ── Журнал ─────────────────────────────────────────────────────
  const [selectedJournalFoods, setSelectedJournalFoods] = useState([]);

  // ── Фаза основного flow ────────────────────────────────────────
  // 'idle' | 'ai_loading' | 'preview' | 'tg_sending'
  const [phase, setPhase] = useState('idle');



  // ── Результат ИИ ──────────────────────────────────────────────
  const [aiResult, setAiResult] = useState(null);  // parsed JSON
  const [rawText, setRawText] = useState('');       // raw string

  // ── Модалка «Назад» ──────────────────────────────────────────
  const [showBackModal, setShowBackModal] = useState(false);

  // ── Обработка ошибок и валидация ──────────────────────────────
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  
  const [aiErrorText, setAiErrorText] = useState(null);
  const [tgErrorText, setTgErrorText] = useState(null);
  const [lastTgData, setLastTgData] = useState(null); // Для кнопки копирования
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showTgSuccess, setShowTgSuccess] = useState(false);

  // ── Главный экран ──────────────────────────────────────────────
  const [text, setText] = useState('');
  const [greeting] = useState(getGreeting);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );
  const textareaRef   = useRef(null);
  const baseHeightRef = useRef(null);
  const fileInputRef  = useRef(null);

  // ── Прикреплённое фото ────────────────────────────────────────
  const [photo, setPhoto] = useState(null); // { file, url }

  // ── Лайтбокс ─────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState(false);
  const thumbRef        = useRef(null);
  const dragRef         = useRef({ startY: 0, dy: 0, active: false });
  const lightboxImgRef  = useRef(null);

  const openLightbox = () => setLightbox(true);

  const closeLightbox = (fast = false) => {
    const img = lightboxImgRef.current;
    if (!img) { setLightbox(false); return; }
    img.style.transition = fast
      ? 'transform 200ms ease, opacity 200ms ease'
      : 'transform 350ms cubic-bezier(0.3, 1, 0.3, 1), opacity 300ms ease';
    img.style.transform = 'scale(0.4)';
    img.style.opacity   = '0';
    setTimeout(() => setLightbox(false), fast ? 200 : 340);
  };

  // Свайп вниз для закрытия
  const onLightboxTouchStart = (e) => {
    dragRef.current = { startY: e.touches[0].clientY, dy: 0, active: true };
  };

  const onLightboxTouchMove = (e) => {
    if (!dragRef.current.active) return;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    dragRef.current.dy = dy;
    if (dy < 0) return;
    const img = lightboxImgRef.current;
    if (!img) return;
    const scale = Math.max(0.6, 1 - dy / 600);
    img.style.transition = 'none';
    img.style.transform  = `translateY(${dy * 0.6}px) scale(${scale})`;
    img.style.opacity    = `${Math.max(0, 1 - dy / 250)}`;
  };

  const onLightboxTouchEnd = () => {
    const { dy } = dragRef.current;
    dragRef.current.active = false;
    if (dy > 90) {
      closeLightbox(true);
    } else {
      const img = lightboxImgRef.current;
      if (img) {
        img.style.transition = 'transform 300ms cubic-bezier(0.3, 1, 0.3, 1), opacity 200ms ease';
        img.style.transform  = 'translateY(0) scale(1)';
        img.style.opacity    = '1';
      }
    }
  };

  // ── Фото: выбор / удаление ────────────────────────────────────

  const handlePhotoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto({ file, url: URL.createObjectURL(file) });
    e.target.value = '';
  }, [photo]);

  const handlePhotoRemove = useCallback(() => {
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto(null);
  }, [photo]);

  // ── Textarea auto-resize ──────────────────────────────────────

  const handleInput = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (!ta) return;

    ta.style.height = 'auto';
    ta.style.overflowY = 'hidden';

    if (baseHeightRef.current === null) {
      baseHeightRef.current = ta.scrollHeight;
    }

    const base = baseHeightRef.current;
    const maxH = Math.round(base * BASE_HEIGHT_MULTIPLIER);
    const desired = ta.scrollHeight;

    if (desired <= maxH) {
      ta.style.height = `${desired}px`;
      ta.style.overflowY = 'hidden';
      ta.classList.remove(styles.textareaScrollable);
    } else {
      ta.style.height = `${maxH}px`;
      ta.style.overflowY = 'scroll';
      ta.classList.add(styles.textareaScrollable);
    }
  };

  /** Хелпер для копирования (с фоллбэком) */
  const handleCopyText = (text) => {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
  };

  // ══════════════════════════════════════════════════════════════
  //  СТЕЙТ-МАШИНА: handlers
  // ══════════════════════════════════════════════════════════════

  /** Шаг 1: Отправить → Валидация → AI loading (mock 2 сек) */
  const handleSubmit = async () => {
    if (!text.trim() && !photo) return;

    const missing = [];
    if (settings.provider === 'groq' && !settings.aiKey) missing.push('Groq API Key');
    if (settings.sendToTelegram) {
      if (!settings.telegramToken) missing.push('Telegram Bot Token');
      if (!settings.telegramChatId) missing.push('Telegram Chat ID');
    }

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowValidationModal(true);
      return;
    }

    setPhase('ai_loading');

    const timestamp = new Date().toLocaleString('ru-RU', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    const messages = buildPrompt(text, timestamp);

    let parsed = null;
    let raw = '';
    let success = false;

    // 3 Попытки
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        raw = await llmComplete(messages, settings);
        parsed = extractAndValidateJSON(raw);
        
        // Внедрение выбранных блюд из журнала в ответ ИИ
        if (selectedJournalFoods.length > 0) {
          const journalFoodsFormatted = selectedJournalFoods.map(jf => ({
            name: jf.name,
            amount: jf.amount || null,
            macros: jf.macros ? { per_100g: null, total: jf.macros, total_weight: jf.amount } : null
          }));
          parsed.foods = [...journalFoodsFormatted, ...parsed.foods];
          parsed.has_food = true;
        }

        success = true;
        break; // успех
      } catch (e) {
        console.error('LLM attempt failed:', e);
        if (e.status === 429) {
          setAiErrorText('Модель перегружена (429 Rate Limit). Попробуй позже.');
          break; // Не ретраим 429 для той же модели
        }
        if (attempt === 3) {
          setAiErrorText(e.message || 'Ошибка парсинга JSON');
        }
      }
    }

    if (success) {
      setAiResult(parsed);
      setRawText(raw);
      setPhase('preview');
    } else {
      setPhase('idle');
    }
  };

  /** Шаг 2 (preview): Нажали «Назад» → показать модалку */
  const handlePreviewBack = () => {
    setShowBackModal(true);
  };

  /** Модалка: подтвердили «Уйти» → сброс в idle */
  const handleConfirmBack = () => {
    setShowBackModal(false);
    setAiResult(null);
    setRawText('');
    setSelectedJournalFoods([]);
    setPhase('idle');
  };

  /** Модалка: нажали «Нет» → закрыть модалку */
  const handleCancelBack = () => {
    setShowBackModal(false);
  };

  /** Шаг 3: Подтвердить → TG sending (mock 2 сек) */
  const handleConfirm = async (editedData) => {
    console.log('Отправляем в TG:', editedData, photo?.file ?? null);
    const formattedText = formatTgPreview(editedData);
    
    if (!settings.sendToTelegram) {
      setLastTgData(formattedText);
      setShowCopyModal(true);

      if (photo?.url) URL.revokeObjectURL(photo.url);
      setPhoto(null);
      setText('');
      setAiResult(null);
      setRawText('');
      setSelectedJournalFoods([]);
      setPhase('idle');
      return;
    }

    setPhase('tg_sending');

    try {
      await sendToTg(formattedText, photo?.file, settings.telegramToken, settings.telegramChatId);
      
      // Полный сброс
      if (photo?.url) URL.revokeObjectURL(photo.url);
      setPhoto(null);
      setText('');
      setAiResult(null);
      setRawText('');
      setSelectedJournalFoods([]);
      setPhase('idle');
      setShowTgSuccess(true);

      // Сбрасываем textarea height
      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = 'auto';
        ta.style.overflowY = 'hidden';
        ta.classList.remove(styles.textareaScrollable);
        baseHeightRef.current = null;
      }
    } catch (e) {
      setTgErrorText(e.message || 'Ошибка отправки в Telegram');
      setLastTgData(formattedText); // Мокаем сырой текст для копирования
      setPhase('idle'); 
    }
  };

  const handleTestApi = async () => {
    try {
      const messages = [{ role: 'user', content: 'Привет, ответь "мяу", это проверка.' }];
      await llmComplete(messages, settings);
      alert('Всё работает отлично! 🐾');
    } catch (e) {
      alert(`Ошибка API: ${e.message}`);
    }
  };

  // ══════════════════════════════════════════════════════════════
  //  РЕНДЕР
  // ══════════════════════════════════════════════════════════════

  // ── Рендер Онбординга (до инициализации основного UI) ──────────
  if (!isOnboardingComplete) {
    return <Onboarding onComplete={() => setIsOnboardingComplete(true)} />;
  }

  // ── Страница настроек ─────────────────────────────────────────
  if (view === 'settings') {
    return (
      <SettingsPage
        onBack={() => setView('home')}
        settings={settings}
        updateField={updateField}
        theme={theme}
        setTheme={setTheme}
        systemTheme={systemTheme}
        setSystemTheme={setSystemTheme}
        accents={accents}
        setAccent={setAccent}
        onTestApi={handleTestApi}
      />
    );
  }

  // ── Страница Мяунала ──────────────────────────────────────────
  if (view === 'journal') {
    return (
      <JournalPage 
        onBack={() => setView('home')}
        onSelectFood={(food) => setSelectedJournalFoods([...selectedJournalFoods, food])}
      />
    );
  }

  // ── Preview page (phase: preview | tg_sending) ────────────────
  if (phase === 'preview' || phase === 'tg_sending') {
    return (
      <div className="screen">
        <div className={styles.screenInner}>
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            onSettings={() => setView('settings')}
            onJournal={() => setView('journal')}
          />

          <main className={`scroll-area ${styles.main}`}>
            <div className={`container safe-bottom ${styles.content}`}>
              <PreviewPage
                aiResult={aiResult}
                rawText={rawText}
                photo={photo}
                onPhotoRemove={handlePhotoRemove}
                onPhotoSelect={handlePhotoSelect}
                onConfirm={handleConfirm}
                onBack={handlePreviewBack}
                isBlurred={phase === 'tg_sending'}
              />
            </div>
          </main>
        </div>

        {/* Loading overlay для TG sending */}
        {phase === 'tg_sending' && (
          <LoadingOverlay type="telegram" />
        )}

        {/* Модалка «Назад» */}
        <ConfirmBackModal
          open={showBackModal}
          onCancel={handleCancelBack}
          onConfirm={handleConfirmBack}
        />
      </div>
    );
  }

  // ── Главный экран (phase: idle | ai_loading) ──────────────────
  return (
    <div className="screen">
      <div className={styles.screenInner}>
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onSettings={() => setView('settings')}
          onJournal={() => setView('journal')}
        />

        <main className={`scroll-area ${styles.main}`}>
          <div
            className={`container safe-bottom ${styles.content} ${
              phase === 'ai_loading' ? styles.contentBlurred : ''
            }`}
          >

            {/* ── АВАТАРКА / ВЫБРАННАЯ ЕДА И ПРИВЕТСТВИЕ ── */}
            <section className={styles.hero}>
              {selectedJournalFoods.length > 0 ? (
                <div className={styles.selectedJournalContainer} style={{ animation: 'fadeIn 300ms ease' }}>
                  <h3 className={styles.selectedJournalTitle}>Выбрано из мяунала:</h3>
                  <div className={styles.selectedJournalList}>
                    {selectedJournalFoods.map((jf, idx) => (
                      <div key={`${jf.id}-${idx}`} className={`${styles.selectedJournalItem} glass-mid`}>
                        <span className={styles.selectedJournalName}>{jf.name}</span>
                        <button 
                          className={styles.selectedJournalRemove}
                          onClick={() => setSelectedJournalFoods(selectedJournalFoods.filter((_, i) => i !== idx))}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className={`${styles.catAvatar} glass-mid anim-float`} style={{ animation: 'fadeIn 300ms ease' }}>
                    <Cat size={44} strokeWidth={1.5} className={styles.catIcon} />
                  </div>
                  <p className={`${styles.greeting} text-title-3`} style={{ animation: 'fadeIn 300ms ease' }}>
                    {greeting}
                  </p>
                </>
              )}
            </section>

            {/* ── ВВОД ── */}
            <section className={styles.inputSection}>
              <div className={`${styles.inputWrap} glass-mid`}>
                <textarea
                  ref={textareaRef}
                  id="meal-input"
                  className={styles.textarea}
                  value={text}
                  onInput={handleInput}
                  onChange={handleInput}
                  placeholder={placeholder}
                  rows={6}
                  aria-label="Расскажи что ты ел"
                />
              </div>

              {/* Скрытый file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handlePhotoSelect}
                aria-hidden="true"
                tabIndex={-1}
              />

              {/* Превью прикреплённого фото */}
              {photo && (
                <div className={`${styles.photoPreview} glass-mid`}>
                  <img
                    ref={thumbRef}
                    src={photo.url}
                    alt="Прикреплённое фото"
                    className={`${styles.photoThumb} ${styles.photoThumbClickable}`}
                    onClick={openLightbox}
                  />
                  <div className={styles.photoMeta}>
                    <span className={styles.photoName}>{photo.file.name}</span>
                    <span className={styles.photoSize}>
                      {(photo.file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.photoRemoveBtn}
                    onClick={handlePhotoRemove}
                    aria-label="Удалить фото"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* Кнопка прикрепить + кнопка отправить */}
              <div className={styles.actionRow}>
                <button
                  id="btn-attach"
                  type="button"
                  className={`${styles.attachButton} glass-mid no-select ${photo ? styles.attachButtonActive : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Прикрепить фото"
                >
                  <Paperclip size={18} strokeWidth={2} />
                </button>

                <button
                  id="btn-submit"
                  className={`${styles.submitButton} no-select`}
                  onClick={handleSubmit}
                  disabled={!text.trim() && !photo}
                  aria-label="Отправить котику"
                >
                  <Send size={17} strokeWidth={2.5} />
                  <span>Отправить котику 🐾</span>
                </button>
              </div>
            </section>

            <div className="bottom-nav-spacer" />
          </div>
        </main>
      </div>

      {/* ══ LOADING OVERLAY (AI) ══ */}
      {phase === 'ai_loading' && (
        <LoadingOverlay type="ai" />
      )}

      {/* ══ ЛАЙТБОКС ══ */}
      {lightbox && photo && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => closeLightbox()}
          onTouchStart={onLightboxTouchStart}
          onTouchMove={onLightboxTouchMove}
          onTouchEnd={onLightboxTouchEnd}
          aria-modal="true"
          role="dialog"
          aria-label="Просмотр фото"
        >
          <button
            className={styles.lightboxCloseBtn}
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Закрыть"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          <img
            ref={lightboxImgRef}
            src={photo.url}
            alt="Полное фото"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />

          <p className={styles.lightboxHint}>Свайпните вниз, чтобы закрыть</p>
        </div>
      )}

      {/* ══ ОШИБКИ И ВАЛИДАЦИЯ ══ */}
      <ValidationModal
        open={showValidationModal}
        missingFields={missingFields}
        onClose={() => setShowValidationModal(false)}
        onSettings={() => {
          setShowValidationModal(false);
          setView('settings');
        }}
      />

      <AiErrorModal
        open={!!aiErrorText}
        errorText={aiErrorText || ''}
        onHome={() => setAiErrorText(null)}
      />

      <TgErrorModal
        open={!!tgErrorText}
        errorText={tgErrorText || ''}
        onCopy={() => {
          handleCopyText(lastTgData);
          setTgErrorText(null);
        }}
        onHome={() => setTgErrorText(null)}
      />

      <SuccessCopyModal
        open={showCopyModal}
        formattedText={lastTgData || ''}
        onCopy={() => {
          handleCopyText(lastTgData);
          setShowCopyModal(false);
        }}
        onHome={() => setShowCopyModal(false)}
      />

      <TgSuccessModal
        open={showTgSuccess}
        onHome={() => setShowTgSuccess(false)}
      />
    </div>
  );
}

export default App;
