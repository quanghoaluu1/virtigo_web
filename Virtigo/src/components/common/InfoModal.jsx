import React from 'react';

/**
 * Modal thông báo đơn giản chỉ có nút Đóng
 * @param {Object} props
 * @param {boolean} props.open - Có hiển thị modal không
 * @param {React.ReactNode} props.title - Tiêu đề modal
 * @param {React.ReactNode} props.content - Nội dung modal
 * @param {function} props.onClose - Callback khi đóng
 * @param {string} [props.closeText] - Text nút đóng
 */
export default function InfoModal({
  open,
  title = 'Thông báo',
  content = '',
  onClose,
  closeText = 'Đóng'
}) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>{title}</div>
        <div style={styles.content}>{content}</div>
        <div style={styles.actions}>
          <button style={styles.closeBtn} onClick={onClose}>{closeText}</button>
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
  closeBtn: {
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '8px 18px',
    cursor: 'pointer'
  }
}; 