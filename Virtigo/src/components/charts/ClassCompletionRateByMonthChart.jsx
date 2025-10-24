import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const ClassCompletionRateByMonthChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}api/Chart/completion-rate-by-month`)
      .then(res => {
        setData(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 14 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 14 }} allowDecimals={false} label={{ value: 'Số lớp', angle: -90, position: 'insideLeft', offset: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 14 }} domain={[0, 100]} label={{ value: 'Tỉ lệ (%)', angle: 90, position: 'insideRight', offset: 10 }} />
          <Tooltip formatter={(value, name) => name === 'rate' ? `${value}%` : value} />
          <Legend verticalAlign="top" height={36} />
          <Bar yAxisId="left" dataKey="completed" name="Hoàn thành" fill="#52c41a" barSize={22} radius={[6, 6, 0, 0]}>
            <LabelList dataKey="completed" position="top" style={{ fontWeight: 600, fontSize: 13 }} />
          </Bar>
          <Bar yAxisId="left" dataKey="cancelled" name="Huỷ" fill="#f5222d" barSize={22} radius={[6, 6, 0, 0]}>
            <LabelList dataKey="cancelled" position="top" style={{ fontWeight: 600, fontSize: 13 }} />
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="rate" name="Tỉ lệ hoàn thành" stroke="#1890ff" strokeWidth={3} dot={{ r: 4 }}>
            <LabelList dataKey="rate" position="top" formatter={v => `${v}%`} style={{ fontWeight: 600, fontSize: 13 }} />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 8, color: '#666', fontSize: 15, fontStyle: 'italic' }}>
        Biểu đồ thể hiện tỷ lệ hoàn thành lớp của 6 tháng gần nhất.
      </div>
      {loading && <div style={{ textAlign: 'center', color: '#1890ff', marginTop: 12 }}>Đang tải dữ liệu...</div>}
    </div>
  );
};

export default ClassCompletionRateByMonthChart; 