import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Skeleton } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const formatCurrency = (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const RevenueByMonthLineChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + endpoints.chart.revenueByMonth);
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching revenue by month data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
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
        <LineChart
          data={data}
          margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 14 }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 14 }} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Line type="monotone" dataKey="revenue" stroke="#1890ff" strokeWidth={3} dot={{ r: 4 }}>
            <LabelList dataKey="revenue" position="top" formatter={formatCurrency} style={{ fontWeight: 600, fontSize: 14 }} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Biểu đồ thể hiện doanh thu 6 tháng gần nhất.
      </div>
    </div>
  );
};

export default RevenueByMonthLineChart; 