import React, { useEffect } from 'react';
import { notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface NotificationProps {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
  description?: string;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  visible,
  type,
  message,
  description,
  onClose
}) => {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (visible) {
      let descriptionText = '';
      if (description) {
        if (typeof description === 'string') {
          descriptionText = description;
        } else if (typeof description === 'object') {
          descriptionText = JSON.stringify(description);
        } else {
          descriptionText = String(description);
        }
      }
      
      api[type]({
        message,
        description: descriptionText,
        icon: type === 'success' ? (
          <CheckCircleOutlined className="text-green-500" />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        ),
        placement: 'topRight',
        duration: 3,
        onClose,
      });
    }
  }, [visible]);

  return <>{contextHolder}</>;
};

export default Notification;
