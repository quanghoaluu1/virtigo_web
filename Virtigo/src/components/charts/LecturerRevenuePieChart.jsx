import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Skeleton } from 'antd';

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#13c2c2", "#bfbfbf", "#f5222d"];
const formatCurrency = (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const LecturerRevenuePieChart = ({ data = [], loading }) => {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} style={{ width: '100%', height: 340 }} />;
  }
  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalRevenue"
            nameKey="lecturerName"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ lecturerName, percent }) => `${lecturerName}: ${(percent * 100).toFixed(0)}%`}
          >
            <LabelList dataKey="totalRevenue" position="outside" formatter={formatCurrency} style={{ fontWeight: 600, fontSize: 14 }} />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={formatCurrency} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Tỷ lệ doanh thu theo từng giảng viên.
      </div>
    </div>
  );
};

export default LecturerRevenuePieChart; 