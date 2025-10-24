import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Skeleton } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const ClassCountBySubjectBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassCountData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + endpoints.chart.classCountBySubject);
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching class count by subject data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassCountData();
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
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 14 }} />
          <YAxis type="category" dataKey="subject" width={160} tick={{ fontSize: 14 }} />
          <Tooltip formatter={(value) => `${value} lớp`} />
          <Bar dataKey="count" fill="#1890ff" barSize={28} radius={[8, 8, 8, 8]}>
            <LabelList dataKey="count" position="right" style={{ fontWeight: 600, fontSize: 15 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Biểu đồ thể hiện tổng số lớp theo từng môn học.
      </div>
    </div>
  );
};

export default ClassCountBySubjectBarChart; 