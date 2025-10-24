import React from 'react';
import { Table } from 'antd';

const columns = [
  { title: "Giảng viên", dataIndex: "lecturerName", key: "name" },
  { title: "Lớp đã dạy", dataIndex: "completedClasses", key: "completed" },
  { title: "Lớp đang dạy", dataIndex: "ongoingClasses", key: "ongoing" },
  { title: "Lớp bị huỷ", dataIndex: "cancelledClasses", key: "cancelled" },
  { title: "Lớp đang mở", dataIndex: "openClasses", key: "open" },
  { title: "Tổng lớp", dataIndex: "totalClasses", key: "total" },
  { title: "Tổng doanh thu", dataIndex: "totalRevenue", key: "revenue", align: 'right', render: (v) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }) },
];

const LecturerStatisticTable = ({ data = [], loading }) => (
  <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(24,144,255,0.04)', padding: 20, marginTop: 24 }}>
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#1890ff' }}>Thống kê giảng viên</div>
    <Table
      columns={columns}
      dataSource={data}
      rowKey="lecturerID"
      loading={loading}
      pagination={false}
      bordered
      size="middle"
    />
  </div>
);

export default LecturerStatisticTable; 