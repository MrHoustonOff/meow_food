import React from 'react';
import styles from './CartModal.module.css';

const CartModal = ({ open, cartItems, onUpdateCart, onEditItem, onClose }) => {
  if (!open) return null;

  const handleRemove = (cartId) => {
    onUpdateCart(cartItems.filter(i => i.cartId !== cartId));
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.sheet}>
        <div className={styles.header}>
          <h2 className={styles.title}>Корзина ({cartItems.length})</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.list}>
          {cartItems.length === 0 ? (
            <div className={styles.empty}>Корзина пуста</div>
          ) : (
            cartItems.map(item => (
              <div key={item.cartId} className={styles.item}>
                <div className={styles.info}>
                  <span className={styles.name}>{item.name}</span>
                  {item.amount && <span className={styles.amount}>{item.isExactGrams ? `${item.amount}г` : item.amount}</span>}
                </div>
                <div className={styles.actions}>
                  <button className={`${styles.actionBtn} ${styles.btnEdit} pressable`} onClick={() => onEditItem(item)}>
                    ✏️
                  </button>
                  <button className={`${styles.actionBtn} ${styles.btnDelete} pressable`} onClick={() => handleRemove(item.cartId)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
