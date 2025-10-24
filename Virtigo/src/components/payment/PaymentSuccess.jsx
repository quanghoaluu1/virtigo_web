import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleFilled } from '@ant-design/icons';
import '../../styles/Payment.css';

const PaymentSuccess = () => {
  return (
    <motion.div 
      className="payment-status-container success"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="icon-container"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircleFilled style={{ fontSize: '80px', color: '#4CAF50' }} />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Thanh toán thành công!
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
      </motion.p>
      <motion.button
        className="back-button"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = '/'}
      >
        Quay về trang chủ
      </motion.button>
    </motion.div>
  );
};

export default PaymentSuccess; 