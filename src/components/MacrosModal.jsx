import React, { useState, useEffect } from 'react';
import s from './MacrosModal.module.css';

export default function MacrosModal({ open, initialMacros, onSave, onClear, onCancel }) {
  const [proteins, setProteins] = useState('');
  const [fats, setFats] = useState('');
  const [carbs, setCarbs] = useState('');
  const [calories, setCalories] = useState('');

  // Синхронизация состояния при открытии
  useEffect(() => {
    if (open) {
      const m = initialMacros || {};
      const p100 = m.per_100g || {};
      
      setProteins((p100.b ?? m.proteins ?? '').toString());
      setFats((p100.f ?? m.fats ?? '').toString());
      setCarbs((p100.c ?? m.carbs ?? '').toString());
      setCalories((m.calories ?? '').toString());
    }
  }, [open, initialMacros]);

  if (!open) return null;

  const handleSave = () => {
    onSave({
      proteins: Number(proteins),
      fats: Number(fats),
      carbs: Number(carbs),
      calories: Number(calories),
    });
  };

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className={`${s.card} glass-thick`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={s.title}>БЖУ на 100 грамм</h2>
        
        <div className={s.grid}>
          <div className={s.inputWrapper}>
            <label className={s.label}>Белки</label>
            <input
              className={s.input}
              type="number"
              inputMode="decimal"
              value={proteins}
              onChange={(e) => setProteins(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Жиры</label>
            <input
              className={s.input}
              type="number"
              inputMode="decimal"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Углеводы</label>
            <input
              className={s.input}
              type="number"
              inputMode="decimal"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Ккал</label>
            <input
              className={s.input}
              type="number"
              inputMode="decimal"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className={s.buttons}>
          <button
            type="button"
            className={`${s.btnClear} pressable`}
            onClick={onClear}
          >
            Очистить
          </button>
          <button
            type="button"
            className={`${s.btnSave} pressable`}
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
