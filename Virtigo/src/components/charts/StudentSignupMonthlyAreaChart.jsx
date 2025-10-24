import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Skeleton } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const StudentSignupMonthlyAreaChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentSignupData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + endpoints.chart.studentSignupMonthly);
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching student signup monthly data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSignupData();
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
        <AreaChart
          data={data}
          margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 14 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
          <Tooltip formatter={(value) => `${value} học viên`} />
          <Area type="monotone" dataKey="count" stroke="#1890ff" fill="url(#colorCount)" strokeWidth={3} dot={{ r: 4 }}>
            <LabelList dataKey="count" position="top" style={{ fontWeight: 600, fontSize: 14 }} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Biểu đồ thể hiện số học viên đăng ký theo từng tháng.
      </div>
    </div>
  );
};

export default StudentSignupMonthlyAreaChart; 