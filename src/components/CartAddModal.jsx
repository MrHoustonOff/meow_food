import React, { useState, useEffect } from 'react';
import styles from './CartAddModal.module.css';

const CartAddModal = ({ open, initialData, onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [isExactGrams, setIsExactGrams] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || '');
      setAmount(initialData.amount || '');
      setIsExactGrams(initialData.isExactGrams || false);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    onAdd({
      ...initialData,
      cartId: initialData.cartId || (Date.now().toString() + Math.random().toString(36).substring(2)),
      name: name.trim(),
      amount: amount.trim() || null,
      isExactGrams
    });
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={`${styles.card} glass-thick`}>
        <h2 className={styles.title}>{initialData?.cartId ? 'Изменить выбор' : 'Уточнить выбор'}</h2>
        
        <div className={styles.fieldGroup}>
          <span className={styles.label}>Название</span>
          <input 
            className={styles.input} 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Овсянка на молоке" 
          />
        </div>

        <div className={styles.switchRow}>
          <span className={styles.switchLabel}>Ввод в граммах</span>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={isExactGrams} 
              onChange={(e) => setIsExactGrams(e.target.checked)} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>{isExactGrams ? 'Граммы (опционально)' : 'Порция / Вес'}</span>
          <input 
            type={isExactGrams ? "number" : "text"}
            inputMode={isExactGrams ? "decimal" : "text"}
            className={styles.input} 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder={isExactGrams ? "150" : "1 порция / 200г"} 
          />
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
            {initialData?.cartId ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartAddModal;
