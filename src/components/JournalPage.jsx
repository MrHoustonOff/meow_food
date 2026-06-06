import React, { useState, useEffect } from 'react';
import styles from './JournalPage.module.css';
import FoodFormModal from './FoodFormModal.jsx';
import ConfirmDeleteModal from './ConfirmDeleteModal.jsx';
import CartAddModal from './CartAddModal.jsx';
import CartModal from './CartModal.jsx';

const ITEMS_PER_PAGE = 10;

const JournalPage = ({ onBack, selectedFoods, setSelectedFoods }) => {
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);

  const [page, setPage] = useState(1);

  // Cart state
  const [cartAddModalOpen, setCartAddModalOpen] = useState(false);
  const [cartAddFoodTemplate, setCartAddFoodTemplate] = useState(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);

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

  const requestDelete = (id) => {
    setFoodToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (foodToDelete) {
      saveToStorage(foods.filter(f => f.id !== foodToDelete));
    }
    setDeleteModalOpen(false);
    setFoodToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setFoodToDelete(null);
  };

  const openEdit = (food) => {
    setEditingFood(food);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingFood(null);
    setModalOpen(true);
  };

  const handleOpenCartAdd = (food) => {
    setCartAddFoodTemplate({ ...food }); // copy
    setCartAddModalOpen(true);
  };

  const handleAddToCart = (ephemeralFood) => {
    // If it has cartId and it's already in selectedFoods, we replace it. 
    // Wait, the CartAddModal always sets a cartId. If editing an existing cart item:
    const exists = selectedFoods.some(f => f.cartId === ephemeralFood.cartId);
    if (exists) {
      setSelectedFoods(selectedFoods.map(f => f.cartId === ephemeralFood.cartId ? ephemeralFood : f));
    } else {
      setSelectedFoods([...selectedFoods, ephemeralFood]);
    }
    setCartAddModalOpen(false);
    setCartAddFoodTemplate(null);
  };

  const handleEditCartItem = (cartItem) => {
    setCartModalOpen(false);
    setCartAddFoodTemplate(cartItem);
    setCartAddModalOpen(true);
  };

  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;
  const paginatedFoods = filteredFoods.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page if search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const hasCart = selectedFoods.length > 0;

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
              paginatedFoods.map((food, idx) => {
                const addedCount = selectedFoods.filter(f => f.id === food.id).length;
                return (
                  <div key={food.id} className={`${styles.card} glass-mid`}>
                    <div className={styles.cardHeader}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <span className={styles.foodIndex}>{((page - 1) * ITEMS_PER_PAGE) + idx + 1}.</span>
                        <div>
                          <h3 className={styles.foodName}>{food.name}</h3>
                          {food.amount && <p className={styles.foodAmount}>{food.amount}</p>}
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEdit(food)}>
                          ✏️
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => requestDelete(food.id)}>
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
                      className={`${styles.selectBtn} ${addedCount > 0 ? styles.selectBtnAdded : ''} pressable`} 
                      onClick={() => handleOpenCartAdd(food)}
                    >
                      {addedCount > 0 ? `Добавлено (${addedCount})` : 'Добавить к сообщению'}
                    </button>
                  </div>
                );
              })
            )}
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className={styles.pagination} style={{ paddingBottom: hasCart ? '80px' : '0' }}>
                <button 
                  className={`${styles.pageBtn} pressable`} 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Назад
                </button>
                <span className={styles.pageInfo}>{page} / {totalPages}</span>
                <button 
                  className={`${styles.pageBtn} pressable`} 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className={`${styles.fab} ${hasCart ? styles.fabWithCart : ''} pressable`} onClick={openAdd}>
        +
      </button>

      {hasCart && (
        <div className={styles.cartBar}>
          <div className={styles.cartBarInfo} onClick={() => setCartModalOpen(true)}>
            <span className={styles.cartBarText}>В корзине:</span>
            <span className={styles.cartBarBadge}>{selectedFoods.length}</span>
          </div>
          <button className={styles.cartBarDone} onClick={onBack}>
            Готово
          </button>
        </div>
      )}

      <FoodFormModal 
        open={modalOpen} 
        initialData={editingFood} 
        onSave={handleSaveFood} 
        onCancel={() => {
          setModalOpen(false);
          setEditingFood(null);
        }} 
      />

      <ConfirmDeleteModal 
        open={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <CartAddModal 
        open={cartAddModalOpen}
        initialData={cartAddFoodTemplate}
        onAdd={handleAddToCart}
        onCancel={() => {
          setCartAddModalOpen(false);
          setCartAddFoodTemplate(null);
        }}
      />

      <CartModal 
        open={cartModalOpen}
        cartItems={selectedFoods}
        onUpdateCart={setSelectedFoods}
        onEditItem={handleEditCartItem}
        onClose={() => setCartModalOpen(false)}
      />
    </div>
  );
};

export default JournalPage;
