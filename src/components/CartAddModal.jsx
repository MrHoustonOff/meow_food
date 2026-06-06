import React, { useState, useEffect } from 'react';
import styles from './CartAddModal.module.css';

const CartAddModal = ({ open, initialData, onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || '');
      setAmount(initialData.amount || '');
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

        <div className={styles.fieldGroup}>
          <span className={styles.label}>Порция / Вес</span>
          <input 
            className={styles.input} 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="1 порция / 200г" 
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
