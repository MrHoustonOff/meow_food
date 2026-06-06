import React, { useState, useEffect } from 'react';
import styles from './FoodFormModal.module.css';

const FoodFormModal = ({ open, initialData, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [proteins, setProteins] = useState('');
  const [fats, setFats] = useState('');
  const [carbs, setCarbs] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || '');
        setAmount(initialData.amount || '');
        setProteins(initialData.macros?.b ?? '');
        setFats(initialData.macros?.f ?? '');
        setCarbs(initialData.macros?.c ?? '');
        setCalories(initialData.macros?.kcal ?? '');
      } else {
        setName('');
        setAmount('');
        setProteins('');
        setFats('');
        setCarbs('');
        setCalories('');
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    const macros = (proteins !== '' || fats !== '' || carbs !== '' || calories !== '') 
      ? {
          b: proteins !== '' ? Number(proteins) : null,
          f: fats !== '' ? Number(fats) : null,
          c: carbs !== '' ? Number(carbs) : null,
          kcal: calories !== '' ? Number(calories) : null
        }
      : null;

    onSave({
      id: initialData?.id || (Date.now().toString() + Math.random().toString(36).substring(2)),
      name: name.trim(),
      amount: amount.trim() || null,
      macros
    });
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={`${styles.card} glass-thick`}>
        <h2 className={styles.title}>{initialData ? 'Редактировать блюдо' : 'Новое блюдо'}</h2>
        
        <div className={styles.fieldGroup}>
          <span className={styles.label}>Название *</span>
          <input 
            className={styles.input} 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Овсянка на молоке" 
          />
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>Порция / Вес (опционально)</span>
          <input 
            className={styles.input} 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="1 порция / 200г" 
          />
        </div>

        <div className={styles.macrosGrid}>
          <div className={styles.fieldGroup}>
            <span className={styles.label}>Белки</span>
            <input 
              type="number" 
              inputMode="decimal"
              className={styles.input} 
              value={proteins} 
              onChange={(e) => setProteins(e.target.value)} 
              placeholder="0" 
            />
          </div>
          <div className={styles.fieldGroup}>
            <span className={styles.label}>Жиры</span>
            <input 
              type="number" 
              inputMode="decimal"
              className={styles.input} 
              value={fats} 
              onChange={(e) => setFats(e.target.value)} 
              placeholder="0" 
            />
          </div>
          <div className={styles.fieldGroup}>
            <span className={styles.label}>Углеводы</span>
            <input 
              type="number" 
              inputMode="decimal"
              className={styles.input} 
              value={carbs} 
              onChange={(e) => setCarbs(e.target.value)} 
              placeholder="0" 
            />
          </div>
          <div className={styles.fieldGroup}>
            <span className={styles.label}>Ккал</span>
            <input 
              type="number" 
              inputMode="decimal"
              className={styles.input} 
              value={calories} 
              onChange={(e) => setCalories(e.target.value)} 
              placeholder="0" 
            />
          </div>
        </div>

        <div className={styles.buttonsRow}>
          <button className={`${styles.btn} ${styles.btnCancel} pressable`} onClick={onCancel}>
            Отмена
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSave} pressable`} 
            onClick={handleSave}
            disabled={!name.trim()}
            style={{ opacity: !name.trim() ? 0.5 : 1 }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodFormModal;
