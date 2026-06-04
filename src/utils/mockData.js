/**
 * mockData.js — Мок-данные для имитации ответа ИИ.
 *
 * Генерирует реалистичный JSON-ответ и raw-текст.
 * В будущем заменяется реальным вызовом LLM провайдера.
 */

const DAYS_RU = [
  'Воскресенье', 'Понедельник', 'Вторник',
  'Среда', 'Четверг', 'Пятница', 'Суббота',
];

/**
 * Создаёт mock ответ ИИ на основе текущего времени.
 * @returns {{ parsed: object, raw: string }}
 */
export function generateMockResponse() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  const parsed = {
    time: `${hh}:${mm}`,
    day: DAYS_RU[now.getDay()],
    meal_type: getMealType(now.getHours()),
    foods: [
      { 
        name: 'борщ', 
        amount: 'тарелка', 
        macros: { proteins: 5, fats: 8, carbs: 12, calories: 150 } 
      },
      { name: 'хлеб чёрный', amount: '2 куска', macros: null },
      { name: 'сметана', amount: '1 ложка', macros: null },
    ],
    facts: ['немного устал'],
    has_food: true,
  };

  const raw = JSON.stringify(parsed, null, 2);

  return { parsed, raw };
}

/** Определяет тип приёма пищи по часу */
function getMealType(hour) {
  if (hour >= 5 && hour < 11) return 'Завтрак';
  if (hour >= 11 && hour < 16) return 'Обед';
  if (hour >= 16 && hour < 21) return 'Ужин';
  return 'Перекус';
}
