import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const STATUS_COLORS = {
  Deleted: '#f5222d', // đỏ
  Pending: '#1890ff', // xanh dương
  Open: '#91d5ff', // xanh dương nhạt
  Ongoing: '#faad14', // vàng cam hợp lý
  Completed: '#52c41a', // xanh lá
  Cancelled: '#bfbfbf', // xám nhạt phù hợp
};

const ClassStatusDistributionPieChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassStatusData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + endpoints.chart.classStatusDistribution);
        setData(response.data.data || []);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching class status distribution data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassStatusData();
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
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#d9d9d9'} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} lớp`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Biểu đồ thể hiện phân bổ trạng thái các lớp học.
      </div>
    </div>
  );
};

export default ClassStatusDistributionPieChart; 