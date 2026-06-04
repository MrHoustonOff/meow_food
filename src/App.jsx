import React, { useState, useRef } from 'react';
import Header from './components/Header';
import SettingsPage from './components/SettingsPage';
import { Send, Cat, Paperclip, X } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useSettings } from './hooks/useSettings';
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

function App() {
  // ── Глобальный стейт ──────────────────────────────────────────
  const { theme, accents, systemTheme, setTheme, toggleTheme, setSystemTheme, setAccent } = useTheme();
  const { settings, updateField } = useSettings();

  // ── Навигация ──────────────────────────────────────────────────
  const [view, setView] = useState('home'); // 'home' | 'settings'

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
  const thumbRef        = useRef(null); // ref на миниатюру для hero-origin
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
    if (dy < 0) return; // вверх не тянем
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
      // Возвращаем на место
      const img = lightboxImgRef.current;
      if (img) {
        img.style.transition = 'transform 300ms cubic-bezier(0.3, 1, 0.3, 1), opacity 200ms ease';
        img.style.transform  = 'translateY(0) scale(1)';
        img.style.opacity    = '1';
      }
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Убираем старый Object URL перед заменой
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto({ file, url: URL.createObjectURL(file) });
    // Сбрасываем input, чтобы можно было выбрать тот же файл повторно
    e.target.value = '';
  };

  const handlePhotoRemove = () => {
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto(null);
  };

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

  const handleSubmit = () => {
    if (!text.trim() && !photo) return;
    console.log('Отправляем:', text, photo?.file ?? null);
    // После отправки чистим фото
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto(null);
  };

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
      />
    );
  }

  // ── Главный экран ─────────────────────────────────────────────
  return (
    <div className="screen">
      <div className={styles.screenInner}>
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onSettings={() => setView('settings')}
        />

        <main className={`scroll-area ${styles.main}`}>
          <div className={`container safe-bottom ${styles.content}`}>

            {/* ── АВАТАРКА И ПРИВЕТСТВИЕ ── */}
            <section className={styles.hero}>
              <div className={`${styles.catAvatar} glass-mid anim-float`}>
                <Cat size={44} strokeWidth={1.5} className={styles.catIcon} />
              </div>
              <p className={`${styles.greeting} text-title-3`}>
                {greeting}
              </p>
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

              {/* Скрытый file input — без capture, чтобы ОС сама предложила камеру или галерею */}
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

      {/* ══ ЛАЙТБОКС ══ позиционируется вне скролла, поверх всего */}
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
          {/* Кнопка закрытия */}
          <button
            className={styles.lightboxCloseBtn}
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Закрыть"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Фото — стопим провал через оверлей */}
          <img
            ref={lightboxImgRef}
            src={photo.url}
            alt="Полное фото"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Хинт свайп */}
          <p className={styles.lightboxHint}>Свайпните вниз, чтобы закрыть</p>
        </div>
      )}
    </div>
  );
}

export default App;
