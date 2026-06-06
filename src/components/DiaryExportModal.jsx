import React, { useState } from 'react';
import styles from './DiaryExportModal.module.css';
import { send as sendToTg } from '../services/telegram.js';

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function buildMarkdown(entries, from, to, allTime) {
  let filtered = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (!allTime && from && to) {
    filtered = filtered.filter(e => e.date >= from && e.date <= to);
  }
  if (!filtered.length) return '_Нет записей за выбранный период._';

  const label = allTime
    ? 'Весь архив'
    : `${formatDate(from)} – ${formatDate(to)}`;

  let md = `# 🐱 Мяу-Дневник: ${label}\n\n`;
  md += `| Дата | Ккал | Белки | Жиры | Углеводы |\n`;
  md += `|------|------|-------|------|----------|\n`;

  let totCal = 0, totP = 0, totF = 0, totC = 0;
  for (const e of filtered) {
    totCal += e.calories || 0;
    totP   += e.proteins || 0;
    totF   += e.fats     || 0;
    totC   += e.carbs    || 0;
    md += `| ${formatDate(e.date)} | ${e.calories ?? '—'} | ${e.proteins != null ? e.proteins + 'г' : '—'} | ${e.fats != null ? e.fats + 'г' : '—'} | ${e.carbs != null ? e.carbs + 'г' : '—'} |\n`;
    if (e.note) md += `| _${e.note}_ | | | | |\n`;
  }

  md += `\n**Итого за период:**\n`;
  md += `Ккал: ${totCal} | Б: ${totP}г | Ж: ${totF}г | У: ${totC}г\n`;
  return md;
}

const DiaryExportModal = ({ open, entries, settings, onClose }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [allTime, setAllTime] = useState(true);
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState(todayStr);
  const [tgStatus, setTgStatus] = useState(null); // null | 'sending' | 'ok' | 'err'

  if (!open) return null;

  const md = buildMarkdown(entries, from, to, allTime);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(md); } catch {}
  };

  const handleFile = () => {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'myau-diary.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTg = async () => {
    if (!settings?.telegramToken || !settings?.telegramChatId) {
      setTgStatus('no-token');
      return;
    }
    setTgStatus('sending');
    try {
      // Создаём Blob-файл и отправляем как документ
      const blob = new Blob([md], { type: 'text/markdown' });
      const file = new File([blob], 'myau-diary.md', { type: 'text/markdown' });
      await sendToTg(null, file, settings.telegramToken, settings.telegramChatId);
      setTgStatus('ok');
    } catch {
      setTgStatus('err');
    }
  };

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`${styles.card} glass-thick`}>
        <h2 className={styles.title}>Экспорт дневника</h2>

        {/* Переключатель весь архив */}
        <div className={styles.switchRow}>
          <span className={styles.switchLabel}>Весь архив</span>
          <label className={styles.switch}>
            <input type="checkbox" checked={allTime} onChange={e => setAllTime(e.target.checked)} />
            <span className={styles.slider}></span>
          </label>
        </div>

        {!allTime && (
          <div className={styles.dateRange}>
            <div className={styles.dateField}>
              <span className={styles.label}>С</span>
              <input type="date" className={styles.datePicker} value={from} max={to || todayStr} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className={styles.dateField}>
              <span className={styles.label}>По</span>
              <input type="date" className={styles.datePicker} value={to} min={from} max={todayStr} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
        )}

        {/* Превью */}
        <pre className={styles.preview}>{md.slice(0, 400)}{md.length > 400 ? '\n...' : ''}</pre>

        {/* Статус TG */}
        {tgStatus === 'no-token' && <p className={styles.statusErr}>Нет Telegram токена в настройках</p>}
        {tgStatus === 'ok'       && <p className={styles.statusOk}>Отправлено!</p>}
        {tgStatus === 'err'      && <p className={styles.statusErr}>Ошибка отправки</p>}

        {/* Кнопки */}
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnCopy} pressable`} onClick={handleCopy}>
            📋 Скопировать
          </button>
          <button className={`${styles.btn} ${styles.btnFile} pressable`} onClick={handleFile}>
            📄 Скачать .md
          </button>
          <button
            className={`${styles.btn} ${styles.btnTg} pressable`}
            onClick={handleTg}
            disabled={tgStatus === 'sending'}
          >
            {tgStatus === 'sending' ? 'Отправка...' : '✈️ В Telegram'}
          </button>
        </div>

        <button className={`${styles.btnClose} pressable`} onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default DiaryExportModal;
