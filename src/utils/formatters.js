export function formatTgPreview(data) {
  let msg = `🕐 ${data.time}, ${data.day}\n🍽️ ${data.meal_type}\n\n`;
  if (data.foods && data.foods.length > 0) {
    data.foods.forEach(f => {
      msg += `• ${f.name} — ${f.amount}\n`;
      if (f.macros) {
        msg += `  Б: ${f.macros.proteins} Ж: ${f.macros.fats} У: ${f.macros.carbs} | ${f.macros.calories} ккал (на 100г)\n`;
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
