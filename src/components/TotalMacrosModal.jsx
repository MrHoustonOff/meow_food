import React, { useState, useEffect } from 'react';
import s from './MacrosModal.module.css';

export default function TotalMacrosModal({ open, initialTotal, onSave, onClear, onCancel }) {
  const [weight, setWeight] = useState('');
  const [b, setB] = useState('');
  const [f, setF] = useState('');
  const [c, setC] = useState('');

  useEffect(() => {
    if (open) {
      setWeight(initialTotal?.total_weight || '');
      setB(initialTotal?.total?.b?.toString() || '');
      setF(initialTotal?.total?.f?.toString() || '');
      setC(initialTotal?.total?.c?.toString() || '');
    }
  }, [open, initialTotal]);

  if (!open) return null;

  const handleSave = () => {
    onSave({
      total_weight: weight,
      total: {
        b: Number(b),
        f: Number(f),
        c: Number(c),
      }
    });
  };

  return (
    <div className={s.overlay} role="dialog" aria-modal="true" onClick={onCancel}>
      <div className={`${s.card} glass-thick`} onClick={(e) => e.stopPropagation()}>
        <h2 className={s.title}>Редактировать Итого</h2>
        
        <div className={s.inputWrapper} style={{ marginBottom: 'var(--space-4)' }}>
          <label className={s.label}>Итоговый вес (например, 125г)</label>
          <input
            className={s.input}
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="125г"
          />
        </div>

        <div className={s.grid}>
          <div className={s.inputWrapper}>
            <label className={s.label}>Белки</label>
            <input
              className={s.input}
              type="number"
              inputMode="decimal"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Жиры</label>
            <input
              className={s.input}
              type="number"
              inputMode="decimal"
              value={f}
              onChange={(e) => setF(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Углеводы</label>
            <input
              className={s.input}
              type="number"
              inputMode="decimal"
              value={c}
              onChange={(e) => setC(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className={s.buttons}>
          <button type="button" className={`${s.btnClear} pressable`} onClick={onClear}>
            Удалить Итог
          </button>
          <button type="button" className={`${s.btnSave} pressable`} onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
