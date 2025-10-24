import React from 'react';
import { Modal } from 'antd';

const ImagePreviewModal = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={onClose}
      centered
      closable
      bodyStyle={{ padding: 0, textAlign: 'center' }}
    >
      <img
        src={imageUrl}
        alt="preview"
        style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
      />
    </Modal>
  );
};

export default ImagePreviewModal;
