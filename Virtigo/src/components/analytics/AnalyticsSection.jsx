import React from 'react';
import { Card, Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

const AnalyticsSection = ({ title, expanded, onToggle, children }) => {
  return (
    <Card
      title={title}
      extra={
        <Button
          type="text"
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={onToggle}
        />
      }
      style={{
        minHeight: 80,
        borderRadius: 14,
        boxShadow: '0 2px 8px 0 rgba(24,144,255,0.04)',
        transition: 'all 0.2s',
        width: '100%',
        marginBottom: 0,
        background: '#fff',
      }}
      bodyStyle={{
        fontSize: 16,
        minHeight: expanded ? 120 : 0,
        background: '#fff',
        transition: 'all 0.2s',
        padding: expanded ? 24 : 0,
      }}
    >
      {expanded && children}
    </Card>
  );
};

export default AnalyticsSection; 