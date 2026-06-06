import React, { useState, useEffect } from 'react';
import styles from './JournalPage.module.css';
import FoodFormModal from './FoodFormModal.jsx';

const JournalPage = ({ onBack, onSelectFood }) => {
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('myau_food_journal');
    if (stored) {
      try {
        setFoods(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse food journal:', e);
      }
    }
  }, []);

  const saveToStorage = (newFoods) => {
    setFoods(newFoods);
    localStorage.setItem('myau_food_journal', JSON.stringify(newFoods));
  };

  const handleSaveFood = (food) => {
    if (editingFood) {
      saveToStorage(foods.map(f => f.id === food.id ? food : f));
    } else {
      saveToStorage([...foods, food]);
    }
    setModalOpen(false);
    setEditingFood(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Точно удалить блюдо?')) {
      saveToStorage(foods.filter(f => f.id !== id));
    }
  };

  const openEdit = (food) => {
    setEditingFood(food);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingFood(null);
    setModalOpen(true);
  };

  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className="container safe-bottom" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <header className={styles.pageHeader}>
            <button className={`${styles.backBtn} pressable`} onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Назад
            </button>
            <h1 className={styles.pageTitle}>Мяунал</h1>
          </header>

          <div className={styles.searchContainer}>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Поиск по журналу..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.list}>
            {filteredFoods.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ opacity: 0.6, marginBottom: '16px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.2' }}>
                  {` /\\_/\\ \n( o.o )\n > ^ < `}
                </div>
                {searchQuery ? 'Ничего не найдено 😿' : 'Здесь пока нет рыбов...'}
              </div>
            ) : (
              filteredFoods.map(food => (
                <div key={food.id} className={`${styles.card} glass-mid`}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.foodName}>{food.name}</h3>
                      {food.amount && <p className={styles.foodAmount}>{food.amount}</p>}
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openEdit(food)}>
                        ✏️
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(food.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  {food.macros && (
                    <div className={styles.macrosRow}>
                      {food.macros.b !== null && (
                        <div className={styles.macroItem}>
                          <span className={styles.macroLabel}>Белки</span>
                          <span className={styles.macroValue}>{food.macros.b}г</span>
                        </div>
                      )}
                      {food.macros.f !== null && (
                        <div className={styles.macroItem}>
                          <span className={styles.macroLabel}>Жиры</span>
                          <span className={styles.macroValue}>{food.macros.f}г</span>
                        </div>
                      )}
                      {food.macros.c !== null && (
                        <div className={styles.macroItem}>
                          <span className={styles.macroLabel}>Углеводы</span>
                          <span className={styles.macroValue}>{food.macros.c}г</span>
                        </div>
                      )}
                      {food.macros.kcal !== null && (
                        <div className={styles.macroItem}>
                          <span className={styles.macroLabel}>Ккал</span>
                          <span className={styles.macroValue}>{food.macros.kcal}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    className={`${styles.selectBtn} pressable`} 
                    onClick={() => {
                      onSelectFood(food);
                      onBack();
                    }}
                  >
                    Добавить к сообщению
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button className={`${styles.fab} pressable`} onClick={openAdd}>
        +
      </button>

      <FoodFormModal 
        open={modalOpen} 
        initialData={editingFood} 
        onSave={handleSaveFood} 
        onCancel={() => {
          setModalOpen(false);
          setEditingFood(null);
        }} 
      />
    </div>
  );
};

export default JournalPage;
