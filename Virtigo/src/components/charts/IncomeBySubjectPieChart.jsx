import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Skeleton } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#13c2c2", "#bfbfbf", "#f5222d"];
const formatCurrency = (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const IncomeBySubjectPieChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + endpoints.chart.subjectIncome);
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching income by subject data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIncomeData();
  }, []);

  if (loading) {
    return (
      <div style={{ width: '100%', height: 340 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalRevenue"
            nameKey="subjectName"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ subjectName, percent }) => `${subjectName}: ${(percent * 100).toFixed(0)}%`}
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
        Biểu đồ thể hiện phân bổ thu nhập theo môn học.
      </div>
    </div>
  );
};

export default IncomeBySubjectPieChart; 