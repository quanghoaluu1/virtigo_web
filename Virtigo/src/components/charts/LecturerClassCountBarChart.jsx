import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Skeleton } from 'antd';

const LecturerClassCountBarChart = ({ data = [], loading }) => {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} style={{ width: '100%', height: 340 }} />;
  }
  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="lecturerName" tick={{ fontSize: 14 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
          <Tooltip formatter={(value) => `${value} lớp`} />
          <Bar dataKey="totalClasses" fill="#1890ff" barSize={32} radius={[8, 8, 0, 0]}>
            <LabelList dataKey="totalClasses" position="top" style={{ fontWeight: 600, fontSize: 15 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Số lượng lớp theo từng giảng viên.
      </div>
    </div>
  );
};

export default LecturerClassCountBarChart; 