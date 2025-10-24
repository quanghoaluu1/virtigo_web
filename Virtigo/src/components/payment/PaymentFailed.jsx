import React from 'react';
import { motion } from 'framer-motion';
import { CloseCircleFilled } from '@ant-design/icons';
import '../../styles/Payment.css';

const PaymentFailed = () => {
  return (
    <motion.div 
      className="payment-status-container failed"
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
        <CloseCircleFilled style={{ fontSize: '80px', color: '#f44336' }} />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Thanh toán thất bại
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
      </motion.p>
      <motion.button
        className="retry-button"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = '/payment'}
      >
        Thử lại
      </motion.button>
    </motion.div>
  );
};

export default PaymentFailed; 