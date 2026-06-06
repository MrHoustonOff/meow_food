import React, { useState, useEffect } from 'react';
import styles from './DiaryEntryModal.module.css';

function today() {
  return new Date().toISOString().slice(0, 10);
}
function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const DiaryEntryModal = ({ open, initialData, onSave, onCancel }) => {
  const [date, setDate]         = useState(today());
  const [calories, setCalories] = useState('');
  const [proteins, setProteins] = useState('');
  const [fats, setFats]         = useState('');
  const [carbs, setCarbs]       = useState('');
  const [note, setNote]         = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setDate(initialData.date || today());
      setCalories(initialData.calories ?? '');
      setProteins(initialData.proteins ?? '');
      setFats(initialData.fats ?? '');
      setCarbs(initialData.carbs ?? '');
      setNote(initialData.note || '');
    } else {
      setDate(today());
      setCalories('');
      setProteins('');
      setFats('');
      setCarbs('');
      setNote('');
    }
  }, [open, initialData]);

  if (!open) return null;

  const isValid = date && (calories !== '' || proteins !== '' || fats !== '' || carbs !== '');

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      id: initialData?.id,
      date,
      calories: calories !== '' ? Number(calories) : null,
      proteins: proteins !== '' ? Number(proteins) : null,
      fats:     fats     !== '' ? Number(fats)     : null,
      carbs:    carbs    !== '' ? Number(carbs)    : null,
      note:     note.trim() || null,
    });
  };

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={`${styles.card} glass-thick`}>
        <h2 className={styles.title}>{initialData ? 'Редактировать запись' : 'Новая запись'}</h2>

        {/* Дата — быстрые табы + нативный пикер */}
        <div className={styles.dateRow}>
          <button
            className={`${styles.dateTab} ${date === today() ? styles.dateTabActive : ''}`}
            onClick={() => setDate(today())}
          >Сегодня</button>
          <button
            className={`${styles.dateTab} ${date === yesterday() ? styles.dateTabActive : ''}`}
            onClick={() => setDate(yesterday())}
          >Вчера</button>
          <input
            type="date"
            className={styles.datePicker}
            value={date}
            max={today()}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Поля КБЖУ */}
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>🔥 Ккал</span>
            <input
              type="number" inputMode="decimal"
              className={styles.input}
              value={calories} onChange={e => setCalories(e.target.value)}
              placeholder="1850"
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>🥩 Белки (г)</span>
            <input
              type="number" inputMode="decimal"
              className={styles.input}
              value={proteins} onChange={e => setProteins(e.target.value)}
              placeholder="120"
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>🥑 Жиры (г)</span>
            <input
              type="number" inputMode="decimal"
              className={styles.input}
              value={fats} onChange={e => setFats(e.target.value)}
              placeholder="60"
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>🍞 Углеводы (г)</span>
            <input
              type="number" inputMode="decimal"
              className={styles.input}
              value={carbs} onChange={e => setCarbs(e.target.value)}
              placeholder="180"
            />
          </div>
        </div>

        {/* Заметка */}
        <div className={styles.noteField}>
          <span className={styles.label}>Заметка (опционально)</span>
          <input
            type="text"
            className={styles.input}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Был читмил, много пиццы..."
            maxLength={120}
          />
        </div>

        <div className={styles.buttons}>
          <button className={`${styles.btn} ${styles.btnCancel} pressable`} onClick={onCancel}>
            Отмена
          </button>
          <button
            className={`${styles.btn} ${styles.btnSave} pressable`}
            onClick={handleSave}
            disabled={!isValid}
            style={{ opacity: !isValid ? 0.5 : 1 }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryEntryModal;
