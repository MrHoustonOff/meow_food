import React from 'react';
import s from './ValidationModal.module.css';

export default function ValidationModal({ open, missingFields = [], onClose, onSettings }) {
  if (!open) return null;

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`${s.card} glass-thick`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`${s.title} text-title-3`}>Упс! Ты не заполнил:</h2>
        
        <div className={s.list}>
          {missingFields.map((field, idx) => (
            <div key={idx} className={s.listItem}>— {field}</div>
          ))}
        </div>

        <div className={s.buttons}>
          <button
            id="val-close"
            type="button"
            className={`${s.btnCancel} no-select`}
            onClick={onClose}
          >
            Закрыть
          </button>
          <button
            id="val-settings"
            type="button"
            className={`${s.btnSettings} no-select`}
            onClick={onSettings}
          >
            В настройки
          </button>
        </div>
      </div>
    </div>
  );
}
