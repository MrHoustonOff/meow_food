# 🐱 Meow Food — Design System

> **Apple iOS Safari aesthetic · Liquid Glass · Light & Dark · Cat vibe**

---

## Философия

- **Монолит без рамок** — нет явных хедеров-разделителей, всё перетекает как одна живая поверхность
- **Liquid Glass** — элементы просвечивают, дышат, отражают фон
- **Spring-анимации** — каждый tap/hover ощущается живым, не механическим
- **iOS HIG-совместимость** — типографика, отступы и safe-area точно по Apple Human Interface Guidelines

---

## iOS Safari — управление статус-баром и safe-area

Белая/чёрная зона в iOS Safari управляется **четырьмя слоями одновременно**. Пропустишь один — зона вернётся к дефолту.

| Слой | Где | Что делает |
|------|-----|-----------|
| `color-scheme: light/dark` | `tokens.css` на `:root` / `[data-theme='dark']` | Нативные элементы браузера (скроллбар, инпуты) |
| `html { background-color }` | `useTheme.js` | Зона overscroll сверху/снизу при резком скролле |
| `body { background-color }` | `useTheme.js` | Основной фон под `#root` |
| `<meta name="theme-color">` | `index.html` + `useTheme.js` | Цвет статус-бара и адресной строки Safari |

**Критично:** в `index.html` нужны все три варианта `theme-color`:
```html
<!-- Для браузера без JS (по system preference) -->
<meta name="theme-color" content="#FAFAF7" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#1A1A1F" media="(prefers-color-scheme: dark)" />
<!-- Этот JS обновляет при переключении темы (по id) -->
<meta name="theme-color" content="#FAFAF7" id="theme-color-main" />
```

**`apple-mobile-web-app-status-bar-style: black-translucent`** — обязателен для того чтобы приложение рисовалось под статус-бар (вместе с `viewport-fit=cover`).



## Структура `src/styles/`

```
src/
├── styles/
│   ├── tokens.css      ← Единственный источник цветов, теней, радиусов, отступов
│   ├── typography.css  ← Шрифты, размеры, классы заголовков и тела
│   ├── animations.css  ← Все keyframes и easing-переменные
│   ├── glass.css       ← Liquid Glass классы (3 уровня глубины)
│   └── layout.css      ← Структурные блоки: screen, container, stack, row, grid
└── index.css           ← Точка входа: импортирует все модули + базовые стили body
```

---

## Модули

### `tokens.css` — Дизайн-токены

**Когда использовать:** в _любом_ CSS. Никогда не хардкодь цвета или числа — только переменные.

| Группа | Примеры |
|--------|---------|
| Фоны | `--bg-app`, `--bg-surface`, `--bg-surface-2` |
| Акценты | `--accent-pink`, `--accent-peach`, `--accent-lilac`, `--accent-mint` |
| Градиенты | `--gradient-accent`, `--gradient-soft`, `--gradient-bg` |
| Текст | `--text-primary`, `--text-secondary`, `--text-tertiary` |
| Стекло | `--glass-bg`, `--glass-blur`, `--glass-border`, `--glass-shadow` |
| Тени | `--shadow-xs` → `--shadow-xl`, `--shadow-accent` |
| Радиусы | `--radius-xs` (6px) → `--radius-2xl` (40px), `--radius-pill` |
| Отступы | `--space-1` (4px) → `--space-16` (64px) |
| Safe area | `--safe-top`, `--safe-bottom` |

**Темы** задаются через `data-theme="dark"` на `<html>`. Смена происходит в `useTheme.js`.

---

### `typography.css` — Типографика

**Когда использовать:** добавляй CSS-класс к элементу, не inline-стили.

```jsx
<h1 className="text-title-1 text-gradient">Заголовок</h1>
<p className="text-body">Тело</p>
<span className="text-caption-2">Мелкая подпись</span>
```

| Класс | Размер | Вес | Применение |
|-------|--------|-----|------------|
| `.text-hero` | 56px | 800 | Экраны-заставки |
| `.text-title-1` | 34px | 700 | Главный заголовок страницы |
| `.text-title-2` | 28px | 700 | Заголовок секции |
| `.text-title-3` | 24px | 600 | Подзаголовок |
| `.text-body-large` | 17px | 400 | Главный текст, описания |
| `.text-body` | 15px | 400 | Стандартное тело |
| `.text-label` | 13px | 500 | Uppercase-метки, табы |
| `.text-caption` | 13px | 400 | Подписи к контенту |
| `.text-caption-2` | 11px | 400 | Метаданные, timestamps |
| `.text-gradient` | — | — | Акцентный текст с градиентом |

---

### `animations.css` — Анимации

**Когда использовать:** 
- Классы `.anim-*` — для появления элементов (один раз при маунте)
- `.pressable` — для любых кнопок (scale при tap)
- `.hoverable` — для карточек (lift при hover)
- CSS-переменные `--ease-*` и `--dur-*` — в `transition` / `animation` компонентов

```jsx
{/* Карточка появляется снизу, третья с задержкой */}
<div className="anim-slide-up anim-delay-3 pressable hoverable">...</div>

{/* Иконка парит */}
<div className="anim-float">🐱</div>

{/* Скелетон загрузки */}
<div className="anim-shimmer" style={{ height: 60, borderRadius: 'var(--radius-md)' }} />
```

| Класс | Описание |
|-------|----------|
| `.anim-slide-up` | Появление снизу (карточки, листы) |
| `.anim-slide-down` | Появление сверху (алерты) |
| `.anim-pop-in` | Пружинный pop (иконки, теги) |
| `.anim-fade-in` | Мягкое появление |
| `.anim-float` | Бесконечное парение |
| `.anim-shimmer` | Скелетон загрузки |
| `.anim-pulse-accent` | Пульс акцентного цвета |
| `.anim-delay-1..5` | Stagger-задержки 60–300ms |
| `.pressable` | Scale 0.96 при tap |
| `.hoverable` | Lift + shadow при hover |

**Easing-переменные** для `transition`:

```css
transition: transform var(--dur-normal) var(--ease-spring);
```

| Переменная | Применение |
|-----------|------------|
| `--ease-spring` | Главный — пружина с выбегом |
| `--ease-smooth` | Плавный iOS-переход |
| `--ease-snappy` | Мгновенный отклик кнопок |
| `--ease-out-expo` | Крупные переходы экранов |

---

### `glass.css` — Liquid Glass

**Когда использовать:** добавляй класс к JSX-элементу.

```jsx
{/* Фоновый оверлей */}
<div className="glass-light">...</div>

{/* Карточки, кнопки */}
<div className="glass-mid">...</div>

{/* Bottom Sheet, модалка */}
<div className="glass-heavy">...</div>

{/* Акцентная плашка */}
<div className="glass-accent">...</div>

{/* Добавить внутреннее свечение к любому */}
<div className="glass-mid glass-inner-glow">...</div>
```

| Класс | Blur | Плотность | Применение |
|-------|------|-----------|------------|
| `.glass-light` | 12px | 40% | Фоны, оверлеи |
| `.glass-mid` | 24px | 62% | Карточки, кнопки |
| `.glass-heavy` | 40px | 82% | Модалки, Bottom Sheet |
| `.glass-accent` | 24px | акцент | Бейджи, highlight-элементы |

---

### `layout.css` — Структура

**Когда использовать:** строй каркас экранов из этих блоков.

```jsx
<div className="screen">           {/* Полный экран с фоном */}
  <main className="scroll-area">   {/* Скролл-контейнер */}
    <div className="container safe-bottom">
      
      <section className="section">
        <div className="row row--between">
          <h2 className="text-title-3">Заголовок</h2>
          <button>Действие</button>
        </div>
        
        <div className="stack stack--sm">  {/* Вертикальный стек */}
          <div className="grid-2">...</div> {/* 2 колонки */}
        </div>
      </section>

      <div className="bottom-nav-spacer" /> {/* Место под таб-бар */}
    </div>
  </main>
</div>
```

---

## CSS Modules в компонентах

Каждый компонент — `ComponentName.jsx` + `ComponentName.module.css`.

**Правило:** в `.module.css` — только **уникальная геометрия** компонента.  
Глобальные классы применяются через `className` в JSX.

```jsx
// ✅ Правильно
<div className={`${styles.card} glass-mid pressable anim-slide-up`}>

// ❌ Неправильно — дублируем glass стили в module
.card {
  backdrop-filter: blur(24px); /* это уже в glass.css */
}
```

---

## Правила именования

| Что | Формат | Пример |
|-----|--------|--------|
| CSS-переменные | `--kebab-case` | `--accent-pink` |
| CSS Module классы | camelCase | `.mealCard` |
| Глобальные классы | kebab-case | `.glass-mid` |
| ID кнопок | kebab-case | `btn-add-meal` |
| Компоненты | PascalCase | `MealCard.jsx` |

---

## Чеклист нового компонента

- [ ] Файл `ComponentName.jsx` + `ComponentName.module.css`
- [ ] Только токены из `tokens.css` в стилях (без хардкода)
- [ ] Интерактивные элементы имеют класс `.pressable`
- [ ] Карточки имеют класс `.hoverable`
- [ ] Появление через `.anim-slide-up` или `.anim-pop-in`
- [ ] Стекло через `.glass-mid` (не пишешь `backdrop-filter` вручную)
- [ ] ID на всех кнопках для тестирования (`id="btn-xxx"`)
- [ ] `aria-label` на иконочных кнопках
