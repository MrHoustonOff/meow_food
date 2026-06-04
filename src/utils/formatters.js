export function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatTgPreview(data) {
  let msg = `#еда\n`;
  msg += `<u><b>Время:</b></u>\n`;
  msg += `🕐 ${escapeHtml(data.time)}, ${escapeHtml(data.day)}\n`;
  msg += `🍽️ ${escapeHtml(data.meal_type)}\n\n`;

  let sumB = 0;
  let sumF = 0;
  let sumC = 0;
  let hasTotals = false;

  let totalText = '';

  if (data.foods && data.foods.length > 0) {
    msg += `<pre>Еда:\n`;
    data.foods.forEach(f => {
      msg += `• ${escapeHtml(f.name)} — ${escapeHtml(f.amount)}\n`;
      if (f.macros) {
        if (f.macros.per_100g) {
          const p100 = f.macros.per_100g;
          msg += `  Б: ${p100.b} Ж: ${p100.f} У: ${p100.c} (на 100г)\n`;
          if (f.macros.total) {
            const t = f.macros.total;
            totalText += `${escapeHtml(f.name)} — ${escapeHtml(f.amount)} - (${escapeHtml(f.macros.total_weight)}): Б: ${t.b} Ж: ${t.f} У: ${t.c}\n`;
            sumB += Number(t.b) || 0;
            sumF += Number(t.f) || 0;
            sumC += Number(t.c) || 0;
            hasTotals = true;
          }
        } else if (f.macros.proteins !== undefined) {
          msg += `  Б: ${f.macros.proteins} Ж: ${f.macros.fats} У: ${f.macros.carbs} | ${f.macros.calories} ккал (на 100г)\n`;
        }
      }
    });
    msg += `</pre>\n\n`;
  }

  if (hasTotals || totalText) {
    msg += `<u><b>Расчет БЖУ</b></u> <i>(МОЖЕТ БЫТЬ НЕ ТОЧНЫМ!)</i>\n`;
    msg += totalText;
    if (hasTotals) {
      // Округление до 2 знаков
      const round2 = (val) => Math.round(val * 100) / 100;
      msg += `<b>Общий Итог: Б: ${round2(sumB)} Ж: ${round2(sumF)} У: ${round2(sumC)}</b>\n\n`;
    } else {
      msg += `\n`;
    }
  }

  if (data.facts && data.facts.length > 0) {
    msg += `<u><b>📝 Факты:</b></u>\n`;
    data.facts.forEach(f => {
      msg += `— ${escapeHtml(f)}\n`;
    });
  }

  return msg.trim();
}
