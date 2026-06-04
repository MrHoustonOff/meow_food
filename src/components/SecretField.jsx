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

  const handleReveal = () => {
    setRevealed(true);
    // Фокус — чтобы сразу можно было печатать
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    // Если поле пустое — прячем снова
    if (!value) setRevealed(false);
  };

  return (
    <div className={styles.root}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {hint && <p className={styles.hint}>{hint}</p>}

      <div className={`${styles.inputWrap} glass-mid`} onClick={!revealed ? handleReveal : undefined}>
        <input
          ref={inputRef}
          id={id}
          type={revealed ? 'text' : 'password'}
          className={`${styles.input} ${!revealed ? styles.blurred : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          readOnly={!revealed}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={(e) => {
            e.stopPropagation();
            setRevealed((v) => !v);
            setTimeout(() => inputRef.current?.focus(), 0);
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
