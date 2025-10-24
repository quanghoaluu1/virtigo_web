import React from 'react';
import { Card, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const EnrollSummary = ({ total }) => {
  return (
    <Card
      style={{
        borderRadius: 18,
        boxShadow: '0 4px 24px 0 rgba(24,144,255,0.10)',
        textAlign: 'center',
        marginTop: 32,
        padding: 0,
      }}
      bodyStyle={{ padding: '40px 24px' }}
    >
      <BookOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
      <Typography.Title level={2} style={{ margin: 0, color: '#222' }}>{total}</Typography.Title>
      <Typography.Text style={{ fontSize: 18, color: '#888' }}>Lớp đã đăng ký</Typography.Text>
    </Card>
  );
};

export default EnrollSummary; 