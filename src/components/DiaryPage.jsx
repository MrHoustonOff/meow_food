import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import styles from './DiaryPage.module.css';
import DiaryEntryModal from './DiaryEntryModal.jsx';
import DiaryExportModal from './DiaryExportModal.jsx';
import { calcGoals, indicatorColor } from '../utils/goals.js';

// ─── Утилиты дат ────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }

function startOf(period) {
  const d = new Date();
  if (period === 'day')   { return today(); }
  if (period === 'week')  { d.setDate(d.getDate() - 6); }
  if (period === 'month') { d.setDate(d.getDate() - 29); }
  if (period === 'year')  { d.setFullYear(d.getFullYear() - 1); }
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso) {
  const [, m, d] = iso.split('-');
  return `${d}.${m}`;
}

function fmtDateFull(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

// ─── Индикаторная полоска ────────────────────────────────────────
function ProgressBar({ value, target, color }) {
  const pct = target ? Math.min((value / target) * 100, 130) : 0;
  const bg = color === 'green' ? '#34C759' : color === 'yellow' ? '#FF9F0A' : '#FF3B30';
  return (
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${pct}%`, background: bg }} />
    </div>
  );
}

// ─── Карточка итогов ─────────────────────────────────────────────
function SummaryCard({ entries, goals }) {
  const totCal = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const totP   = entries.reduce((s, e) => s + (e.proteins || 0), 0);
  const totF   = entries.reduce((s, e) => s + (e.fats || 0), 0);
  const totC   = entries.reduce((s, e) => s + (e.carbs || 0), 0);
  const n = entries.length || 1; // дней в периоде

  const avgCal = Math.round(totCal / n);
  const avgP   = Math.round(totP / n);
  const avgF   = Math.round(totF / n);
  const avgC   = Math.round(totC / n);

  const calColor = indicatorColor(avgCal, goals.calories);
  const pColor   = indicatorColor(avgP,   goals.proteins);
  const fColor   = indicatorColor(avgF,   goals.fats);
  const cColor   = indicatorColor(avgC,   goals.carbs);

  const colorDot = (c) =>
    c === 'green' ? '#34C759' : c === 'yellow' ? '#FF9F0A' : '#FF3B30';

  const items = [
    { label: '🔥 Ккал', val: totCal, avg: avgCal, goal: goals.calories, color: calColor },
    { label: '🥩 Белки', val: totP,   avg: avgP,   goal: goals.proteins, color: pColor },
    { label: '🥑 Жиры',  val: totF,   avg: avgF,   goal: goals.fats,     color: fColor },
    { label: '🍞 Углев', val: totC,   avg: avgC,   goal: goals.carbs,    color: cColor },
  ];

  return (
    <div className={`${styles.summaryCard} glass-mid`}>
      <div className={styles.summaryHeader}>
        <span className={styles.summaryTitle}>Итог периода</span>
        <span className={styles.summaryMeta}>{entries.length} записей</span>
      </div>
      <div className={styles.summaryGrid}>
        {items.map(it => (
          <div key={it.label} className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{it.label}</span>
            <span className={styles.summaryVal} style={{ color: colorDot(it.color) }}>
              {it.val}
            </span>
            <span className={styles.summaryAvg}>ср. {it.avg} / {it.goal}</span>
            <ProgressBar value={it.avg} target={it.goal} color={it.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Карточка записи ─────────────────────────────────────────────
function EntryCard({ entry, goals, onEdit, onDelete }) {
  const calColor = indicatorColor(entry.calories || 0, goals.calories);
  const dot = calColor === 'green' ? '#34C759' : calColor === 'yellow' ? '#FF9F0A' : '#FF3B30';

  return (
    <div className={`${styles.entryCard} glass-mid`} style={{ borderLeft: `3px solid ${dot}` }}>
      <div className={styles.entryTop}>
        <span className={styles.entryDate}>{fmtDateFull(entry.date)}</span>
        <div className={styles.entryActions}>
          <button className={styles.entryBtn} onClick={() => onEdit(entry)}>✏️</button>
          <button className={`${styles.entryBtn} ${styles.entryBtnDel}`} onClick={() => onDelete(entry.id)}>🗑️</button>
        </div>
      </div>

      <div className={styles.entryMacros}>
        {entry.calories != null && <span className={styles.macroBig}>{entry.calories} ккал</span>}
        {entry.proteins != null && <span className={styles.macroSmall}>Б: {entry.proteins}г</span>}
        {entry.fats     != null && <span className={styles.macroSmall}>Ж: {entry.fats}г</span>}
        {entry.carbs    != null && <span className={styles.macroSmall}>У: {entry.carbs}г</span>}
      </div>

      {entry.note && <p className={styles.entryNote}>{entry.note}</p>}
    </div>
  );
}

// ─── Тултип графика ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--glass-bg-thick)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 12,
      color: 'var(--text-primary)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ───────────────────────────────────────────
const PERIODS = [
  { key: 'day',   label: 'День' },
  { key: 'week',  label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'year',  label: 'Год' },
];

const LINE_KEYS = [
  { key: 'calories', label: '🔥 Ккал',  color: '#FF375F' },
  { key: 'proteins', label: '🥩 Белки', color: '#30B0C7' },
  { key: 'fats',     label: '🥑 Жиры',  color: '#FF9F0A' },
  { key: 'carbs',    label: '🍞 Углев', color: '#34C759' },
];

const ITEMS_PER_PAGE = 10;

const DiaryPage = ({ onBack, entries, addEntry, updateEntry, deleteEntry, settings }) => {
  const [tab, setTab]       = useState('records'); // 'records' | 'charts'
  const [period, setPeriod] = useState('week');
  const [page, setPage]     = useState(1);

  // Записи модалки
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry]     = useState(null);

  // Удаление
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Экспорт
  const [exportOpen, setExportOpen] = useState(false);

  // Чарт-фильтры
  const [visibleLines, setVisibleLines] = useState(
    Object.fromEntries(LINE_KEYS.map(l => [l.key, true]))
  );
  const [showGoalLines, setShowGoalLines] = useState(true);

  // Цели
  const profile = settings?.goals || {};
  const goals   = calcGoals(profile);

  // Фильтрация записей по периоду
  const start = startOf(period);
  const filtered = useMemo(() =>
    entries
      .filter(e => e.date >= start && e.date <= today())
      .sort((a, b) => b.date.localeCompare(a.date)),
    [entries, start]
  );

  // Пагинация
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Сброс страницы при смене периода или вкладки
  const handlePeriodChange = (p) => { setPeriod(p); setPage(1); };
  const handleTabChange    = (t) => { setTab(t); setPage(1); };

  // Данные для графика
  const chartData = useMemo(() => {
    const map = {};
    entries
      .filter(e => e.date >= start && e.date <= today())
      .forEach(e => { map[e.date] = e; });
    const dates = Object.keys(map).sort();
    return dates.map(d => ({
      date: fmtDate(d),
      calories: map[d].calories,
      proteins: map[d].proteins,
      fats:     map[d].fats,
      carbs:    map[d].carbs,
    }));
  }, [entries, start]);

  const toggleLine = (key) => setVisibleLines(v => ({ ...v, [key]: !v[key] }));

  const handleSaveEntry = (data) => {
    if (data.id) {
      // Редактирование — проверяем, нет ли другой записи с такой же датой
      const duplicate = entries.find(e => e.date === data.date && e.id !== data.id);
      if (duplicate) {
        alert(`Запись за ${data.date} уже существует. Отредактируй её.`);
        return;
      }
      updateEntry(data.id, data);
    } else {
      // Новая запись — запрет дубля по дате
      const duplicate = entries.find(e => e.date === data.date);
      if (duplicate) {
        alert(`Запись за ${data.date} уже существует. Отредактируй её.`);
        return;
      }
      addEntry(data);
    }
    setEntryModalOpen(false);
    setEditingEntry(null);
    setPage(1);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEntryModalOpen(true);
  };

  const handleDeleteConfirm = (id) => { setConfirmDeleteId(id); };
  const handleDeleteFinal   = () => { deleteEntry(confirmDeleteId); setConfirmDeleteId(null); };

  return (
    <div className={styles.page}>
      {/* ── Шапка ── */}
      <div className={styles.header}>
        <button className={`${styles.backBtn} pressable`} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Назад
        </button>
        <h1 className={styles.pageTitle}>Мяу-Дневник</h1>
        <button className={`${styles.exportBtn} pressable`} onClick={() => setExportOpen(true)}>
          ↑ Экспорт
        </button>
      </div>

      {/* ── Внутренние табы ── */}
      <div className={styles.innerTabs}>
        <button
          className={`${styles.innerTab} ${tab === 'records' ? styles.innerTabActive : ''}`}
          onClick={() => handleTabChange('records')}
        >Записи</button>
        <button
          className={`${styles.innerTab} ${tab === 'charts' ? styles.innerTabActive : ''}`}
          onClick={() => handleTabChange('charts')}
        >Графики</button>
      </div>

      {/* ── Фильтр периода (общий) ── */}
      <div className={styles.periodRow}>
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`${styles.periodBtn} ${period === p.key ? styles.periodBtnActive : ''}`}
            onClick={() => handlePeriodChange(p.key)}
          >{p.label}</button>
        ))}
      </div>

      {/* ── ВКЛАДКА: ЗАПИСИ ── */}
      {tab === 'records' && (
        <div className={styles.content}>
          {filtered.length > 0 && <SummaryCard entries={filtered} goals={goals} />}

          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', opacity: 0.5, lineHeight: 1.2 }}>
                {` /\\_/\\ \n( -.-)  \n > □ < `}
              </div>
              <p>Записей нет. Нажми + чтобы добавить!</p>
            </div>
          ) : (
            <>
              {paginated.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  goals={goals}
                  onEdit={handleEdit}
                  onDelete={handleDeleteConfirm}
                />
              ))}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ''}`}
                      onClick={() => setPage(n)}
                    >{n}</button>
                  ))}
                  <button
                    className={styles.pageBtn}
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >›</button>
                </div>
              )}
            </>
          )}
          <div style={{ height: 100 }} />
        </div>
      )}

      {/* ── ВКЛАДКА: ГРАФИКИ ── */}
      {tab === 'charts' && (
        <div className={styles.content}>
          {/* Чекбоксы линий */}
          <div className={styles.lineToggles}>
            {LINE_KEYS.map(l => (
              <button
                key={l.key}
                className={`${styles.lineToggle} ${visibleLines[l.key] ? styles.lineToggleOn : ''}`}
                style={visibleLines[l.key] ? { borderColor: l.color, color: l.color, background: l.color + '18' } : {}}
                onClick={() => toggleLine(l.key)}
              >
                {l.label}
              </button>
            ))}
            <button
              className={`${styles.lineToggle} ${showGoalLines ? styles.lineToggleOn : ''}`}
              style={showGoalLines ? { borderColor: '#8E8E93', color: '#8E8E93', background: '#8E8E9318' } : {}}
              onClick={() => setShowGoalLines(v => !v)}
            >
              Цели
            </button>
          </div>

          {chartData.length < 2 ? (
            <div className={styles.empty}>
              <p>Нужно минимум 2 записи для графика</p>
            </div>
          ) : (
            <div className={`${styles.chartCard} glass-mid`}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {LINE_KEYS.map(l => visibleLines[l.key] && (
                    <Line
                      key={l.key}
                      type="monotone"
                      dataKey={l.key}
                      name={l.label}
                      stroke={l.color}
                      strokeWidth={2}
                      dot={{ r: 4, fill: l.color, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}

                  {showGoalLines && visibleLines.calories && (
                    <ReferenceLine y={goals.calories} stroke="#FF375F" strokeDasharray="6 3" strokeOpacity={0.5}
                      label={{ value: 'Цель ккал', position: 'insideTopRight', fontSize: 10, fill: '#FF375F' }} />
                  )}
                  {showGoalLines && visibleLines.proteins && (
                    <ReferenceLine y={goals.proteins} stroke="#30B0C7" strokeDasharray="6 3" strokeOpacity={0.5}
                      label={{ value: 'Цель Б', position: 'insideTopRight', fontSize: 10, fill: '#30B0C7' }} />
                  )}
                  {showGoalLines && visibleLines.fats && (
                    <ReferenceLine y={goals.fats} stroke="#FF9F0A" strokeDasharray="6 3" strokeOpacity={0.5} />
                  )}
                  {showGoalLines && visibleLines.carbs && (
                    <ReferenceLine y={goals.carbs} stroke="#34C759" strokeDasharray="6 3" strokeOpacity={0.5} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ height: 80 }} />
        </div>
      )}

      {/* ── FAB ── */}
      {tab === 'records' && (
        <button
          className={`${styles.fab} pressable`}
          onClick={() => { setEditingEntry(null); setEntryModalOpen(true); }}
        >+</button>
      )}

      {/* ── Модалки ── */}
      <DiaryEntryModal
        open={entryModalOpen}
        initialData={editingEntry}
        onSave={handleSaveEntry}
        onCancel={() => { setEntryModalOpen(false); setEditingEntry(null); }}
      />

      <DiaryExportModal
        open={exportOpen}
        entries={entries}
        settings={settings}
        onClose={() => setExportOpen(false)}
      />

      {/* ── Подтверждение удаления ── */}
      {confirmDeleteId && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteId(null)}>
          <div className={`${styles.confirmCard} glass-thick`} onClick={e => e.stopPropagation()}>
            <p className={styles.confirmText}>Удалить запись?</p>
            <div className={styles.confirmBtns}>
              <button className={`${styles.confirmCancel} pressable`} onClick={() => setConfirmDeleteId(null)}>Отмена</button>
              <button className={`${styles.confirmOk} pressable`} onClick={handleDeleteFinal}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;
