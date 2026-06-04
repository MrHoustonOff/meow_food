import React from 'react';
import { Check } from 'lucide-react';
import styles from './AccentPicker.module.css';

/*
 * AccentPicker — цветовой пикер акцента.
 * Показывает преcеты + нативный color input для custom цвета.
 *
 * Props:
 *   forTheme  — 'light' | 'dark'  (для какой темы этот пикер)
 *   current   — текущий HEX акцента этой темы
 *   onChange  — (hex: string) => void
 *   disabled  — если это не текущая тема — визуально приглушён
 */

// Пресеты: минималистичная Apple-совместимая палитра
const PRESETS = [
  { hex: '#FF375F', name: 'Pink'   },   // системный Pink (дефолт)
  { hex: '#FF9500', name: 'Orange' },
  { hex: '#34C759', name: 'Green'  },
  { hex: '#007AFF', name: 'Blue'   },
  { hex: '#AF52DE', name: 'Purple' },
  { hex: '#FFA6C9', name: 'Soft Pink' },
  { hex: '#5AC8FA', name: 'Teal'   },
  { hex: '#FFD60A', name: 'Yellow' },
];

const AccentPicker = ({ forTheme, current, onChange, disabled = false }) => {
  return (
    <div className={`${styles.root} ${disabled ? styles.disabled : ''}`} aria-hidden={disabled}>
      <div className={styles.swatches}>
        {PRESETS.map(({ hex, name }) => {
          const isActive = current?.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              className={`${styles.swatch} ${isActive ? styles.swatchActive : ''}`}
              style={{ '--swatch-color': hex }}
              onClick={() => !disabled && onChange(hex)}
              aria-label={`Акцент ${name}`}
              title={name}
            >
              {isActive && <Check size={12} strokeWidth={3} className={styles.check} />}
            </button>
          );
        })}

        {/* Кастомный цвет */}
        <label className={styles.customSwatch} title="Свой цвет">
          <span
            className={styles.customPreview}
            style={{ background: PRESETS.some(p => p.hex.toLowerCase() === current?.toLowerCase()) ? 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' : current }}
          />
          <input
            type="color"
            className={styles.colorInput}
            value={current ?? '#FF375F'}
            onChange={(e) => !disabled && onChange(e.target.value)}
            tabIndex={disabled ? -1 : 0}
          />
        </label>
      </div>
    </div>
  );
};

export default AccentPicker;
