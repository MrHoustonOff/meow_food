export function formatTgPreview(data) {
  let msg = `🕐 ${data.time}, ${data.day}\n🍽️ ${data.meal_type}\n\n`;
  if (data.foods && data.foods.length > 0) {
    data.foods.forEach(f => {
      msg += `• ${f.name} — ${f.amount}\n`;
      if (f.macros) {
        if (f.macros.per_100g) {
          const p100 = f.macros.per_100g;
          msg += `  Б: ${p100.b} Ж: ${p100.f} У: ${p100.c} (на 100г)\n`;
          if (f.macros.total) {
            const t = f.macros.total;
            msg += `  Итого (${f.macros.total_weight}): Б: ${t.b} Ж: ${t.f} У: ${t.c}\n`;
          } else if (f.macros.note) {
            msg += `  * ${f.macros.note}\n`;
          }
        } else if (f.macros.proteins !== undefined) {
          msg += `  Б: ${f.macros.proteins} Ж: ${f.macros.fats} У: ${f.macros.carbs} | ${f.macros.calories} ккал (на 100г)\n`;
        }
      }
    });
    msg += '\n';
  }
  if (data.facts && data.facts.length > 0) {
    msg += `📝 Факты:\n`;
    data.facts.forEach(f => {
      msg += `— ${f}\n`;
    });
  }
  return msg.trim();
}
