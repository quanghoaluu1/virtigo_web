import React from 'react';
import { Card, Button, Tag, Tooltip, Avatar } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const statusColor = (status) => (status === 1 ? 'success' : 'default');
const statusText = (status) => (status === 1 ? 'ACTIVE' : 'INACTIVE');

const StudentTeacherClassCard = ({
  imageURL,
  className,
  lecturerName,
  subjectName,
  priceOfClass,
  status,
  numberStudentEnroll,
  minStudentAcp,
  maxStudentAcp,
  role,
  id,
  horizontal = false,
}) => {
  const navigate = useNavigate();

  // Lấy role từ localStorage nếu không truyền prop
  let actualRole = role;
  if (!actualRole) {
    const user = JSON.parse(localStorage.getItem('user'));
    actualRole = user?.role || 'Student';
  }

  const handleView = () => {
    if (actualRole === 'Lecturer') {
      navigate(`/lecturer/myclass/${id}`);
    } else {
      navigate(`/student/enroll/${id}`);
    }
  };

  if (horizontal) {
    return (
      <Card
        hoverable
        style={{
          width: '100%',
          borderRadius: 0,
          margin: '1.2rem 0.7rem',
          boxShadow: '0 8px 32px 0 rgba(24,144,255,0.10), 0 1.5rem 3rem rgba(24,144,255,0.06)',
          border: 'none',
          overflow: 'visible',
          background: '#fff',
        }}
        bodyStyle={{ padding: 0, minHeight: 180 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: 180 }}>
          <div style={{ flex: '0 0 180px', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '18px 0 0 18px' }}>
            <img alt={className} src={imageURL} style={{ maxHeight: 160, maxWidth: '90%', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Tooltip title={className}>
              <h3 style={{ marginBottom: 10, minHeight: 32 }}><strong>{className} </strong></h3>
            </Tooltip>
            <div style={{ marginBottom: 6, color: '#888', fontSize: 15 }}>
              <b>Môn học:</b> {subjectName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ background: '#e6f7ff', color: '#1890ff', marginRight: 8 }} />
              <span>{lecturerName}</span>
            </div>
            {actualRole === 'Teacher' && (
              <>
                <div className="mb-6">
                  <b>Sĩ số:</b> {numberStudentEnroll} / {maxStudentAcp}
                </div>
                <div className="mb-6">
                  <b>Học phí:</b> {priceOfClass ? priceOfClass.toLocaleString() : '--'} VNĐ
                </div>
                <div className="mb-12">
                  <Tag color={statusColor(status)}>{statusText(status)}</Tag>
                </div>
              </>
            )}
            <div style={{ marginTop: 'auto' }}>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                style={{
                  background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  borderRadius: 10,
                  fontSize: 16,
                  boxShadow: '0 2px 8px rgba(24,144,255,0.2)',
                  letterSpacing: 1,
                  width: 180,
                }}
                onClick={handleView}
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  // layout dọc như cũ
  return (
    <Card
      hoverable
      style={{
        width: 320,
        borderRadius: 22,
        margin: '1.2rem 0.7rem',
        boxShadow: '0 8px 32px 0 rgba(24,144,255,0.10), 0 1.5rem 3rem rgba(24,144,255,0.06)',
        border: 'none',
        overflow: 'visible',
        background: '#fff',
      }}
      bodyStyle={{ padding: '22px 22px 18px 22px', minHeight: 180 }}
      cover={
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: 18 }}>
          <img alt={className} src={imageURL} style={{ maxHeight: 160, maxWidth: '90%', objectFit: 'contain' }} />
        </div>
      }
    >
      <Tooltip title={className}>
        <h3 style={{ marginBottom: 14, minHeight: 48 }}>{className}</h3>
      </Tooltip>
      <div style={{ marginBottom: 8, color: '#888', fontSize: 15 }}>
        <b>Môn học:</b> {subjectName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <Avatar size={32} icon={<UserOutlined />} style={{ background: '#e6f7ff', color: '#1890ff', marginRight: 8 }} />
        <span>{lecturerName}</span>
      </div>
      {actualRole === 'Teacher' && (
        <>
          <div className="mb-6">
            <b>Sĩ số:</b> {numberStudentEnroll} / {maxStudentAcp}
          </div>
          <div className="mb-6">
            <b>Học phí:</b> {priceOfClass ? priceOfClass.toLocaleString() : '--'} VNĐ
          </div>
          <div className="mb-12">
            <Tag color={statusColor(status)}>{statusText(status)}</Tag>
          </div>
        </>
      )}
      <Button
        type="primary"
        icon={<EyeOutlined />}
        block
        style={{
          background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          borderRadius: 10,
          fontSize: 16,
          boxShadow: '0 2px 8px rgba(24,144,255,0.2)',
          letterSpacing: 1,
        }}
        onClick={handleView}
      >
        Xem chi tiết
      </Button>
    </Card>
  );
};

export default StudentTeacherClassCard; 