import React from 'react';

/**
 * Hiển thị modal xác nhận xóa.
 * @param {Object} options
 * @param {string} options.title - Tiêu đề modal
 * @param {string} options.content - Nội dung modal
 * @param {function} options.onOk - Hàm callback khi xác nhận xóa
 * @param {function} [options.onCancel] - Hàm callback khi hủy
 * @param {string} [options.okText] - Text nút xác nhận
 * @param {string} [options.cancelText] - Text nút hủy
 * @param {number} [options.zIndex] - zIndex modal
 */
export default function DeleteConfirm({
  open,
  title = 'Xác nhận xóa',
  content = 'Bạn có chắc chắn muốn xóa mục này?',
  onOk,
  onCancel,
  okText = 'Xóa',
  cancelText = 'Hủy'
}) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>{title}</div>
        <div style={styles.content}>{content}</div>
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>{cancelText}</button>
          <button style={styles.deleteBtn} onClick={onOk}>{okText}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    zIndex: 9999,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    background: '#fff',
    borderRadius: 8,
    minWidth: 320,
    maxWidth: 400,
    padding: '24px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
  },
  title: {
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 12
  },
  content: {
    fontSize: 15,
    marginBottom: 24
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12
  },
  cancelBtn: {
    background: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: 4,
    padding: '8px 18px',
    cursor: 'pointer'
  },
  deleteBtn: {
    background: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '8px 18px',
    cursor: 'pointer'
  }
}; 