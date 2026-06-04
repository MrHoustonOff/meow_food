import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, X, Plus, Paperclip, Check } from 'lucide-react';
import styles from './PreviewPage.module.css';
import MacrosModal from './MacrosModal';
import TotalMacrosModal from './TotalMacrosModal';
import { formatTgPreview } from '../utils/formatters';

const MEAL_TYPES = ['Завтрак', 'Обед', 'Ужин', 'Перекус', 'Неизвестно'];
const DAYS_RU = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'
];

/**
 * AutoResizeTextarea — компонент для авторасширяющегося поля ввода.
 */
function AutoResizeTextarea({ value, onChange, placeholder, className, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = '24px';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={1}
      {...props}
    />
  );
}



/**
 * PreviewPage — страница подтверждения ответа ИИ.
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
  const [data, setData] = useState(() => structuredClone(aiResult));
  const [mode, setMode] = useState('json'); // 'json' | 'tg' | 'raw'
  const [editingMacrosIndex, setEditingMacrosIndex] = useState(null);
  const [editingTotalMacrosIndex, setEditingTotalMacrosIndex] = useState(null);
  const fileInputRef = useRef(null);

  // ── Хелперы редактирования ─────────────────────────────────
  const updateMeta = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const updateFood = (index, field, value) => {
    setData(prev => {
      const foods = [...prev.foods];
      foods[index] = { ...foods[index], [field]: value };
      return { ...prev, foods };
    });
  };

  const handleMacrosSave = (macros) => {
    updateFood(editingMacrosIndex, 'macros', macros);
    setEditingMacrosIndex(null);
  };

  const handleMacrosClear = () => {
    updateFood(editingMacrosIndex, 'macros', null);
    setEditingMacrosIndex(null);
  };

  const removeFood = (index) => setData(prev => ({
    ...prev,
    foods: prev.foods.filter((_, i) => i !== index),
  }));

  const addFood = () => setData(prev => ({
    ...prev,
    foods: [...prev.foods, { name: '', amount: '', macros: null }],
  }));

  const updateFact = (index, value) => {
    setData(prev => {
      const facts = [...prev.facts];
      facts[index] = value;
      return { ...prev, facts };
    });
  };

  const removeFact = (index) => setData(prev => ({
    ...prev,
    facts: prev.facts.filter((_, i) => i !== index),
  }));

  const addFact = () => setData(prev => ({
    ...prev,
    facts: [...prev.facts, ''],
  }));

  const handleSaveTotalMacros = (totalData) => {
    setData(prev => {
      const foods = [...prev.foods];
      const target = { ...foods[editingTotalMacrosIndex] };
      
      if (!target.macros) target.macros = {};
      target.macros.total_weight = totalData.total_weight;
      target.macros.total = totalData.total;
      
      foods[editingTotalMacrosIndex] = target;
      return { ...prev, foods };
    });
    setEditingTotalMacrosIndex(null);
  };

  const handleClearTotalMacros = () => {
    setData(prev => {
      const foods = [...prev.foods];
      const target = { ...foods[editingTotalMacrosIndex] };
      if (target.macros) {
        delete target.macros.total;
        delete target.macros.total_weight;
      }
      foods[editingTotalMacrosIndex] = target;
      return { ...prev, foods };
    });
    setEditingTotalMacrosIndex(null);
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

        {/* Табы JSON / TG / Raw */}
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
            className={`${styles.tab} ${mode === 'tg' ? styles.tabActive : ''}`}
            onClick={() => setMode('tg')}
          >
            TG
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

      {mode === 'json' && (
        <>
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
                <select
                  id="preview-day"
                  className={styles.fieldSelect}
                  value={data.day}
                  onChange={(e) => updateMeta('day', e.target.value)}
                  aria-label="День недели"
                >
                  {DAYS_RU.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
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
                  <div className={styles.itemRow}>
                    <AutoResizeTextarea
                      className={styles.autoResizeTextarea}
                      value={food.name}
                      onChange={(e) => updateFood(i, 'name', e.target.value)}
                      placeholder="Название"
                      aria-label={`Еда ${i + 1} — название`}
                    />
                    <span className={styles.itemSep}>—</span>
                    <AutoResizeTextarea
                      className={styles.autoResizeTextarea}
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
                  {/* БЖУ / Макросы */}
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    {food.macros ? (
                      <button 
                        type="button" 
                        onClick={() => setEditingMacrosIndex(i)}
                        className={styles.macrosBadgeButton}
                        aria-label={`Редактировать БЖУ для ${food.name}`}
                      >
                        {food.macros.per_100g ? (
                          <>
                            <span className={styles.macroBadge}>Б: {food.macros.per_100g.b}</span>
                            <span className={styles.macroBadge}>Ж: {food.macros.per_100g.f}</span>
                            <span className={styles.macroBadge}>У: {food.macros.per_100g.c}</span>
                            <span className={styles.macroBadge}>(на 100г)</span>
                            {food.macros.total && (
                              <span
                                className={`${styles.macroBadge} pressable`}
                                style={{ background: 'var(--accent)', color: 'white' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTotalMacrosIndex(i);
                                }}
                              >
                                Итого: Б:{food.macros.total.b} Ж:{food.macros.total.f} У:{food.macros.total.c}
                              </span>
                            )}
                            {food.macros.note && (
                              <span className={styles.macroBadge} style={{ color: 'var(--text-tertiary)' }}>
                                {food.macros.note}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className={styles.macroBadge}>Б: {food.macros.proteins}</span>
                            <span className={styles.macroBadge}>Ж: {food.macros.fats}</span>
                            <span className={styles.macroBadge}>У: {food.macros.carbs}</span>
                            <span className={styles.macroBadge}>{food.macros.calories} ккал (на 100г)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingMacrosIndex(i)}
                        className={styles.addMacrosBtn}
                      >
                        <Plus size={12} strokeWidth={2.5} style={{ marginRight: 4 }} />
                        БЖУ (на 100г)
                      </button>
                    )}
                  </div>
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
                  <div className={styles.itemRow}>
                    <AutoResizeTextarea
                      className={styles.autoResizeTextarea}
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
      )}

      {mode === 'tg' && (
        <>
          <p className={styles.heading}>
            Превью для Telegram
          </p>
          <div className={styles.tgPreview}>
            <pre className={styles.tgText}>{formatTgPreview(data)}</pre>
          </div>
        </>
      )}

      {mode === 'raw' && (
        <>
          <p className={styles.heading}>
            Raw ответ ИИ — только для чтения
          </p>
          <div className={`${styles.rawContainer} glass-mid`}>
            <pre className={styles.rawText}>{rawText}</pre>
          </div>
        </>
      )}

      {editingMacrosIndex !== null && (
        <MacrosModal
          open={true}
          initialMacros={data.foods[editingMacrosIndex].macros}
          onSave={handleMacrosSave}
          onClear={handleMacrosClear}
          onCancel={() => setEditingMacrosIndex(null)}
        />
      )}

      {editingTotalMacrosIndex !== null && (
        <TotalMacrosModal
          open={true}
          initialTotal={data.foods[editingTotalMacrosIndex].macros}
          onSave={handleSaveTotalMacros}
          onClear={handleClearTotalMacros}
          onCancel={() => setEditingTotalMacrosIndex(null)}
        />
      )}
    </div>
  );
}

export default PreviewPage;
