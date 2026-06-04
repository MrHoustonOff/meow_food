import React, { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './SecretField.module.css';

/*
 * SecretField — поле ввода секретного ключа.
 * По умолчанию: значение заблюрено, тип — password.
 * Нажатие на кнопку-глаз → снимает блюр и показывает текст.
 * Использование:
 *   <SecretField
 *     id="groq-key"
 *     label="AI API Key"
 *     hint="Groq API ключ для запросов к языковой модели"
 *     value={settings.aiKey}
 *     onChange={(val) => updateField('aiKey', val)}
 *   />
 */
const SecretField = ({ id, label, hint, value, onChange, placeholder = '••••••••••••••••' }) => {
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef(null);

  const handleBlur = () => {
    setRevealed(false);
  };

  return (
    <div className={styles.root}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {hint && <p className={styles.hint}>{hint}</p>}

      <div className={`${styles.inputWrap} glass-mid`}>
        <input
          ref={inputRef}
          id={id}
          type={revealed ? 'text' : 'password'}
          className={`${styles.input} ${!revealed ? styles.blurred : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setRevealed(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onPointerDown={(e) => {
            e.preventDefault(); // Предотвращаем потерю фокуса у инпута
            e.stopPropagation();
            setRevealed((v) => !v);
          }}
          aria-label={revealed ? 'Скрыть ключ' : 'Показать ключ'}
          tabIndex={-1}
        >
          {revealed
            ? <EyeOff size={16} strokeWidth={2} />
            : <Eye    size={16} strokeWidth={2} />
          }
        </button>
      </div>
    </div>
  );
};

export default SecretField;
