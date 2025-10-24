import React from 'react';

/**
 * Modal xác nhận hành động chung
 * @param {Object} props
 * @param {boolean} props.open - Có hiển thị modal không
 * @param {React.ReactNode} props.title - Tiêu đề modal
 * @param {React.ReactNode} props.content - Nội dung modal
 * @param {function} props.onOk - Callback khi xác nhận
 * @param {function} props.onCancel - Callback khi hủy
 * @param {string} [props.okText] - Text nút xác nhận
 * @param {string} [props.cancelText] - Text nút hủy
 */
export default function ActionConfirm({
  open,
  title = 'Xác nhận',
  content = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  onOk,
  onCancel,
  okText = 'Xác nhận',
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
          <button style={styles.okBtn} onClick={onOk}>{okText}</button>
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
  okBtn: {
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '8px 18px',
    cursor: 'pointer'
  }
}; 