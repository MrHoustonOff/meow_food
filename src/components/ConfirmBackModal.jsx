import React from 'react';
import s from './ConfirmBackModal.module.css';

export default function ConfirmBackModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

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
        <h2 className={`${s.title} text-title-3`}>Точно назад? 🐱</h2>
        <p className={s.description}>
          Котики ничего не сохранят и придётся начать заново!
        </p>
        <div className={s.buttons}>
          <button
            id="modal-cancel"
            type="button"
            className={`${s.btnCancel} no-select`}
            onClick={onCancel}
          >
            Нет
          </button>
          <button
            id="modal-confirm"
            type="button"
            className={`${s.btnConfirm} no-select`}
            onClick={onConfirm}
          >
            Уйти
          </button>
        </div>
      </div>
    </div>
  );
}
