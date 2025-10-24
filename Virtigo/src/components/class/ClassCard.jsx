import React from 'react';
import { Card, Button, Tag, Tooltip, Avatar } from 'antd';
import { EyeOutlined, UserOutlined, ClockCircleOutlined, StarOutlined } from '@ant-design/icons';
import '../../styles/ClassCard.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const statusColor = (status) => {
  switch (status) {
    case 0: return 'default'; // Pending
    case 1: return 'blue';    // Open
    case 2: return 'green';   // Ongoing
    case 3: return 'gold';    // Completed
    case 4: return 'red';     // Deleted
    case 5: return 'volcano'; // Cancelled
    default: return 'default';
  }
};

const statusText = (status) => {
  switch (status) {
    case 0: return 'Chờ xử lý';
    case 1: return 'Mở tuyển sinh';
    case 2: return 'Đang dạy';
    case 3: return 'Hoàn thành';
    case 4: return 'Đã xóa';
    case 5: return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const ClassCard = ({
  imageURL,
  className,
  lecturerName,
  priceOfClass,
  status,
  onView,
  id,
  rating = 4.8,
  studentsCount = 125,
  duration = "8 tuần",
  isPopular = false,
  originalPrice = null
}) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/class-detail/${id}`);
  };

  const discountPercent = originalPrice && priceOfClass ? 
    Math.round(((originalPrice - priceOfClass) / originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="class-card-motion"
      whileHover={{ y: -12 }}
    >
      <Card
        hoverable
        className="class-card"
        cover={
          <div className="class-card-img-wrap">
            <img alt={className} src={imageURL} className="class-card-img" />
            <div className="class-card-overlay">
              <div className="class-card-badges">
                {status === 1 && (
                  <Tag color="green" className="class-card-badge new-badge">
                    <span className="badge-text">Mới</span>
                  </Tag>
                )}
                {isPopular && (
                  <Tag color="orange" className="class-card-badge popular-badge">
                    <StarOutlined className="mr-4" />
                    <span className="badge-text">Phổ biến</span>
                  </Tag>
                )}
                {discountPercent > 0 && (
                  <Tag color="red" className="class-card-badge discount-badge">
                    <span className="badge-text">-{discountPercent}%</span>
                  </Tag>
                )}
              </div>
            </div>
            <div className="class-card-img-gradient"></div>
          </div>
        }
        style={{
          width: 340,
          borderRadius: 24,
          margin: '1.2rem 0.7rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 8px 40px rgba(251, 176, 64, 0.12)',
          border: 'none',
          overflow: 'hidden',
          background: '#fff',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        bodyStyle={{ padding: '24px 24px 20px 24px' }}
      >
        <div className="class-card-header">
          <Tooltip title={className} placement="top">
            <h3 className="class-card-title">
              {className}
            </h3>
          </Tooltip>
          
          
        </div>

        <div className="class-card-lecturer-section">
          <div className="lecturer-info">
            <Avatar
              size={36}
              icon={<UserOutlined />}
              className="lecturer-avatar"
            />
            <div className="lecturer-details">
              <span className="lecturer-name">{lecturerName}</span>
              <span className="lecturer-title">Giảng viên</span>
            </div>
          </div>
          
          
        </div>

        <div className="class-card-price-section">
          <div className="price-container">
            <span className="current-price">
              {priceOfClass ? priceOfClass.toLocaleString() : '--'}
              <span className="currency">VNĐ</span>
            </span>
            {originalPrice && (
              <span className="original-price">
                {originalPrice.toLocaleString()} VNĐ
              </span>
            )}
          </div>
          
          <Tag color={statusColor(status)} className="status-tag">
            {statusText(status)}
          </Tag>
        </div>

        <Button
          type="primary"
          icon={<EyeOutlined />}
          block
          className="class-card-cta-btn"
          onClick={handleView}
          size="large"
        >
          Xem chi tiết
        </Button>
      </Card>
    </motion.div>
  );
};

export default ClassCard;