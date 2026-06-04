export function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatTgPreview(data) {
  let msg = `#еда\n`;
  msg += `🕐 <b>${escapeHtml(data.time)}, ${escapeHtml(data.day)}</b>\n`;
  msg += `🍽️ <b>${escapeHtml(data.meal_type)}</b>\n\n`;

  let sumB = 0;
  let sumF = 0;
  let sumC = 0;
  let hasTotals = false;

  if (data.foods && data.foods.length > 0) {
    msg += `<b>Еда:</b>\n`;
    data.foods.forEach((f, idx) => {
      msg += `• <b>${escapeHtml(f.name)}</b> — ${escapeHtml(f.amount)}\n`;
      if (f.macros) {
        if (f.macros.per_100g) {
          const p100 = f.macros.per_100g;
          msg += `  БЖУ: <code>Б: ${p100.b} Ж: ${p100.f} У: ${p100.c} (на 100г)</code>\n`;
        } else if (f.macros.proteins !== undefined) {
          msg += `  БЖУ: <code>Б: ${f.macros.proteins} Ж: ${f.macros.fats} У: ${f.macros.carbs} | ${f.macros.calories} ккал (на 100г)</code>\n`;
        }
        
        if (f.macros.total) {
          const t = f.macros.total;
          msg += `  Итого (${escapeHtml(f.macros.total_weight)}): <code>Б: ${t.b} Ж: ${t.f} У: ${t.c}</code>\n`;
          sumB += Number(t.b) || 0;
          sumF += Number(t.f) || 0;
          sumC += Number(t.c) || 0;
          hasTotals = true;
        }
      }
      
      // Add a blank line between foods, except after the very last one where we just want a single newline later
      if (idx < data.foods.length - 1) {
        msg += `\n`;
      }
    });
    msg += `\n`;
  }

  if (hasTotals) {
    const round2 = (val) => Math.round(val * 100) / 100;
    msg += `<b>📊 Общий итог:</b>\n`;
    msg += `<i>Б: ${round2(sumB)} Ж: ${round2(sumF)} У: ${round2(sumC)}</i>\n\n`;
  }

  if (data.facts && data.facts.length > 0) {
    msg += `<b>📝 Факты:</b>\n`;
    data.facts.forEach(f => {
      msg += `— ${escapeHtml(f)}\n`;
    });
  }

  return msg.trim();
}
