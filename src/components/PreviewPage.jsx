import React, { useState, useRef } from 'react';
import { ChevronLeft, X, Plus, Paperclip, Check } from 'lucide-react';
import styles from './PreviewPage.module.css';

/**
 * MEAL_TYPES — полный список типов приёма пищи.
 * Если нужно расширить — просто добавь строку сюда.
 */
const MEAL_TYPES = ['Завтрак', 'Обед', 'Ужин', 'Перекус', 'Неизвестно'];

/**
 * PreviewPage — страница подтверждения ответа ИИ.
 *
 * Два режима: JSON (редактируемый) и Raw (read-only).
 * Props:
 *   aiResult   — parsed JSON (будет скопирован для редактирования)
 *   rawText    — raw строка ответа ИИ
 *   photo      — { file, url } | null
 *   onPhotoRemove — () => void
 *   onPhotoSelect — (e) => void  (onChange от file input)
 *   onConfirm  — (editedResult) => void
 *   onBack     — () => void
 *   isBlurred  — boolean (blur при tg_sending)
 */
function PreviewPage({
  aiResult,
  rawText,
  photo,
  onPhotoRemove,
  onPhotoSelect,
  onConfirm,
  onBack,
  isBlurred = false,
}) {
  // Локальная редактируемая копия
  const [data, setData] = useState(() => structuredClone(aiResult));
  const [mode, setMode] = useState('json'); // 'json' | 'raw'
  const fileInputRef = useRef(null);

  // ── Хелперы редактирования ─────────────────────────────────

  const updateMeta = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const updateFood = (index, field, value) => {
    setData(prev => {
      const foods = [...prev.foods];
      foods[index] = { ...foods[index], [field]: value };
      return { ...prev, foods };
    });
  };

  const removeFood = (index) => {
    setData(prev => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index),
    }));
  };

  const addFood = () => {
    setData(prev => ({
      ...prev,
      foods: [...prev.foods, { name: '', amount: '', macros: null }],
    }));
  };

  const updateFact = (index, value) => {
    setData(prev => {
      const facts = [...prev.facts];
      facts[index] = value;
      return { ...prev, facts };
    });
  };

  const removeFact = (index) => {
    setData(prev => ({
      ...prev,
      facts: prev.facts.filter((_, i) => i !== index),
    }));
  };

  const addFact = () => {
    setData(prev => ({
      ...prev,
      facts: [...prev.facts, ''],
    }));
  };

  // ── Рендер ─────────────────────────────────────────────────

  return (
    <div className={`${styles.page} ${isBlurred ? styles.blurred : ''}`}>
      {/* ── Верхняя панель ── */}
      <div className={styles.topBar}>
        <button
          id="btn-preview-back"
          type="button"
          className={`${styles.backButton} no-select`}
          onClick={onBack}
          aria-label="Назад"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
          <span>Назад</span>
        </button>

        {/* Табы JSON / Raw */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'json' ? styles.tabActive : ''}`}
            onClick={() => setMode('json')}
          >
            JSON
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'raw' ? styles.tabActive : ''}`}
            onClick={() => setMode('raw')}
          >
            Raw
          </button>
        </div>
      </div>

      {mode === 'json' ? (
        <>
          {/* ── Заголовок ── */}
          <p className={styles.heading}>
            Поговорил со своими котанами.{'\n'}Проверь, мяу~&nbsp;🐾
          </p>

          {/* ── Мета: Время + День ── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>🕐 Время и день</div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <input
                  id="preview-time"
                  className={styles.fieldInput}
                  type="text"
                  value={data.time}
                  onChange={(e) => updateMeta('time', e.target.value)}
                  placeholder="HH:MM"
                  aria-label="Время"
                />
              </div>
              <div className={styles.field}>
                <input
                  id="preview-day"
                  className={styles.fieldInput}
                  type="text"
                  value={data.day}
                  onChange={(e) => updateMeta('day', e.target.value)}
                  placeholder="День недели"
                  aria-label="День недели"
                />
              </div>
            </div>
          </div>

          {/* ── Мета: Тип приёма пищи ── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>🍽️ Тип приёма пищи</div>
            <select
              id="preview-meal-type"
              className={styles.fieldSelect}
              value={data.meal_type}
              onChange={(e) => updateMeta('meal_type', e.target.value)}
              aria-label="Тип приёма пищи"
            >
              {MEAL_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* ── Еда ── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>🥣 Еда</div>
            <div className={styles.itemList}>
              {data.foods.map((food, i) => (
                <div
                  key={i}
                  className={`${styles.item} glass-mid`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <input
                    className={styles.itemInput}
                    type="text"
                    value={food.name}
                    onChange={(e) => updateFood(i, 'name', e.target.value)}
                    placeholder="Название"
                    aria-label={`Еда ${i + 1} — название`}
                  />
                  <span className={styles.itemSep}>—</span>
                  <input
                    className={styles.itemInput}
                    type="text"
                    value={food.amount || ''}
                    onChange={(e) => updateFood(i, 'amount', e.target.value || null)}
                    placeholder="кол-во"
                    aria-label={`Еда ${i + 1} — количество`}
                  />
                  <button
                    type="button"
                    className={styles.itemRemove}
                    onClick={() => removeFood(i)}
                    aria-label={`Удалить ${food.name || 'еду'}`}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.addButton}
              onClick={addFood}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Добавить</span>
            </button>
          </div>

          {/* ── Факты ── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>📝 Факты</div>
            <div className={styles.itemList}>
              {data.facts.map((fact, i) => (
                <div
                  key={i}
                  className={`${styles.item} glass-mid`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <input
                    className={styles.itemInput}
                    type="text"
                    value={fact}
                    onChange={(e) => updateFact(i, e.target.value)}
                    placeholder="Что запомнить?"
                    aria-label={`Факт ${i + 1}`}
                  />
                  <button
                    type="button"
                    className={styles.itemRemove}
                    onClick={() => removeFact(i)}
                    aria-label="Удалить факт"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.addButton}
              onClick={addFact}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Добавить</span>
            </button>
          </div>

          {/* ── Фото ── */}
          <div className={styles.photoSection}>
            <div className={styles.sectionLabel}>📎 Фото</div>

            {/* Скрытый file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={onPhotoSelect}
              aria-hidden="true"
              tabIndex={-1}
            />

            {photo ? (
              <div className={`${styles.photoPreview} glass-mid`}>
                <img
                  src={photo.url}
                  alt="Прикреплённое фото"
                  className={styles.photoThumb}
                />
                <div className={styles.photoMeta}>
                  <span className={styles.photoName}>{photo.file.name}</span>
                  <span className={styles.photoSize}>
                    {(photo.file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.itemRemove}
                  onClick={onPhotoRemove}
                  aria-label="Удалить фото"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.attachBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={14} strokeWidth={2.5} />
                <span>Прикрепить фото</span>
              </button>
            )}
          </div>

          {/* ── Кнопка подтверждения ── */}
          <button
            id="btn-confirm"
            type="button"
            className={`${styles.confirmButton} no-select`}
            onClick={() => onConfirm(data)}
          >
            <Check size={18} strokeWidth={2.5} />
            <span>Да, киска~ Всё правильно&nbsp;🐾</span>
          </button>
        </>
      ) : (
        /* ── RAW MODE ── */
        <>
          <p className={styles.heading}>
            Raw ответ ИИ — только для чтения
          </p>
          <div className={`${styles.rawContainer} glass-mid`}>
            <pre className={styles.rawText}>{rawText}</pre>
          </div>
        </>
      )}
    </div>
  );
}

export default PreviewPage;
