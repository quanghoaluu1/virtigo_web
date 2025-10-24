import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export const attendanceRateByClass = [
  { classId: "CL001", className: "Sơ cấp 1A", attendanceRate: 92 },
  { classId: "CL002", className: "Trung cấp 2B", attendanceRate: 85 },
  { classId: "CL003", className: "Cao cấp 3C", attendanceRate: 78 },
  { classId: "CL004", className: "Luyện thi TOPIK", attendanceRate: 69 },
];

const getBarColor = (rate) => {
  if (rate >= 85) return '#52c41a'; // xanh lá
  if (rate >= 70) return '#faad14'; // cam
  return '#f5222d'; // đỏ
};

const AttendanceRateByClassBarChart = ({ data = attendanceRateByClass }) => {
  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="className" tick={{ fontSize: 14 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 14 }} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="attendanceRate" name="Tỉ lệ điểm danh" isAnimationActive fill="#52c41a">
            {
              data.map((entry, idx) => (
                <cell key={`cell-${entry.classId}`} fill={getBarColor(entry.attendanceRate)} />
              ))
            }
            <LabelList dataKey="attendanceRate" position="top" formatter={v => `${v}%`} style={{ fontWeight: 600, fontSize: 14 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Biểu đồ thể hiện tỷ lệ điểm danh theo từng lớp.
      </div>
    </div>
  );
};

export default AttendanceRateByClassBarChart; 