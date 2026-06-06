/**
 * Формула Миффлина–Сан Жеора.
 * Возвращает { calories, proteins, fats, carbs }
 */
export function calcGoals(profile) {
  const {
    gender = 'male',
    weight = 80,
    height = 180,
    age = 21,
    activity = 1.375,
    goal = 'maintain',
    custom_calories = null,
    custom_proteins = null,
    custom_fats = null,
    custom_carbs = null,
  } = profile || {};

  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  let tdee = bmr * activity;

  if (goal === 'lose') tdee -= 300;
  else if (goal === 'gain') tdee += 300;

  const calories = Math.round(tdee);
  const proteins = Math.round(weight * 1.8);        // 1.8 г/кг — спортивный стандарт
  const fats     = Math.round((calories * 0.25) / 9); // 25% ккал из жиров
  const carbs    = Math.round((calories - proteins * 4 - fats * 9) / 4);

  return {
    calories: custom_calories ?? calories,
    proteins: custom_proteins ?? proteins,
    fats:     custom_fats     ?? fats,
    carbs:    custom_carbs    ?? Math.max(carbs, 0),
    // raw (before custom override)
    _raw: { calories, proteins, fats, carbs: Math.max(carbs, 0) },
  };
}

export const ACTIVITY_OPTIONS = [
  { value: 1.2,   label: 'Минимальная', hint: 'Сидячий образ жизни' },
  { value: 1.375, label: 'Лёгкая',      hint: '1–3 тренировки в неделю' },
  { value: 1.55,  label: 'Средняя',     hint: '3–5 тренировок в неделю' },
  { value: 1.725, label: 'Высокая',     hint: '6–7 тренировок в неделю' },
];

export const GOAL_OPTIONS = [
  { value: 'lose',     label: 'Похудеть',  emoji: '🔥' },
  { value: 'maintain', label: 'Держать',   emoji: '⚖️' },
  { value: 'gain',     label: 'Набрать',   emoji: '💪' },
];

/** Цвет индикатора: percent — доля от цели (0–2+) */
export function indicatorColor(actual, target) {
  if (!target || target === 0) return 'neutral';
  const ratio = actual / target;
  if (ratio >= 0.9 && ratio <= 1.1) return 'green';
  if (ratio >= 0.75 || ratio <= 1.3) return 'yellow';
  return 'red';
}
