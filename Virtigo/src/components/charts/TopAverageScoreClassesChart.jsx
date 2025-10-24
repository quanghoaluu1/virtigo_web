import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend } from 'recharts';

export const topAverageScoreClasses = {
  highest: [
    { classId: "CL0012", className: "Lớp TOPIK 3C", averageScore: 8.8 },
    { classId: "CL0009", className: "Lớp Sơ cấp 2A", averageScore: 8.5 },
    { classId: "CL0010", className: "Lớp Sơ cấp 1A", averageScore: 8.2 },
  ],
  lowest: [
    { classId: "CL0011", className: "Lớp Trung cấp 2B", averageScore: 5.5 },
    { classId: "CL0005", className: "Lớp Trung cấp 1B", averageScore: 5.9 },
    { classId: "CL0003", className: "Lớp Sơ cấp 1B", averageScore: 6.2 },
  ],
};

const TopAverageScoreClassesChart = ({ data = topAverageScoreClasses }) => {
  // Lấy tất cả className duy nhất
  const allClasses = [
    ...data.highest.map(item => ({ ...item, highestScore: item.averageScore, lowestScore: null })),
    ...data.lowest.map(item => ({ ...item, highestScore: null, lowestScore: item.averageScore })),
  ];
  // Loại bỏ trùng className
  const uniqueClasses = [];
  const seen = new Set();
  for (const item of allClasses) {
    if (!seen.has(item.className)) {
      uniqueClasses.push(item);
      seen.add(item.className);
    }
  }

  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={uniqueClasses}
          layout="vertical"
          margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 14 }} />
          <YAxis type="category" dataKey="className" width={180} tick={{ fontSize: 14 }} />
          <Tooltip formatter={(value) => value} labelFormatter={() => ''} />
          <Legend />
          <Bar dataKey="highestScore" name="Top cao nhất" fill="#52c41a" isAnimationActive>
            <LabelList dataKey="highestScore" position="right" style={{ fontWeight: 600, fontSize: 14 }} />
          </Bar>
          <Bar dataKey="lowestScore" name="Top thấp nhất" fill="#f5222d" isAnimationActive>
            <LabelList dataKey="lowestScore" position="right" style={{ fontWeight: 600, fontSize: 14 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Biểu đồ Top 3 lớp có điểm trung bình cao nhất (ghi nhận) và thấp nhất (cần can thiệp).
      </div>
    </div>
  );
};

export default TopAverageScoreClassesChart; 