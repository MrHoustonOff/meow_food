import React from 'react';
import styles from './ConfirmDeleteModal.module.css';

const ConfirmDeleteModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={`${styles.card} glass-thick`}>
        <h3 className={styles.title}>Удалить блюдо?</h3>
        <p className={styles.subtitle}>Это действие нельзя отменить.</p>
        
        <div className={styles.buttons}>
          <button className={`${styles.btn} ${styles.btnCancel} pressable`} onClick={onCancel}>
            Отмена
          </button>
          <button className={`${styles.btn} ${styles.btnConfirm} pressable`} onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
