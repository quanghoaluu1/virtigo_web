import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import { Link } from 'react-router-dom';

// PaymentStatus enum mapping từ backend:
// 0: Paid, 1: Pending, 2: RequestRefund, 3: Refunded
// Có thể trả về dạng số hoặc chuỗi, đều được map linh hoạt ở đây.
const statusMap = {
  Paid: { label: 'Đã thanh toán', color: 'green' },
  // Pending: { label: 'Đang chờ', color: 'gold' },
  RequestRefund: { label: 'Yêu cầu hoàn tiền', color: 'orange' },
  Refunded: { label: 'Đã hoàn tiền', color: 'red' },
  0: { label: 'Đã thanh toán', color: 'green' },
  // 1: { label: 'Đang chờ', color: 'gold' },
  2: { label: 'Yêu cầu hoàn tiền', color: 'orange' },
  3: { label: 'Đã hoàn tiền', color: 'red' },
};

const columns = [
  {
    title: 'Mã giao dịch',
    dataIndex: 'paymentID',
    key: 'paymentID',
    width: 80,
    fixed: 'left',
  },
  {
    title: 'Học viên',
    dataIndex: 'studentName',
    key: 'studentName',
    width: 160,
    render: (text, record) => (
      <Link to={`/dashboard/profile/${record.studentID}`}>{text}</Link>
    ),
  },
  {
    title: 'Lớp học',
    dataIndex: 'className',
    key: 'className',
    width: 200,
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    key: 'amount',
    align: 'center',
    render: (amount, record) => {
      if (record.status === 'Refunded') {
        return `- ${amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })}`;
      }
      return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
    },
    width: 60,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',  
    key: 'status',
    align: 'center',
    sorter: (a, b) => {
      // Đưa status về số để so sánh, ưu tiên số nếu có, nếu không thì so sánh chuỗi
      const getStatusValue = (status) => {
        if (typeof status === 'number') return status;
        if (status === 'Paid') return 0;
        if (status === 'Pending') return 1;
        if (status === 'RequestRefund') return 2;
        if (status === 'Refunded') return 3;
        return 99; // unknown
      };
      return getStatusValue(a.status) - getStatusValue(b.status);
    },
    render: (status) => {
      const s = statusMap[status] || { label: status, color: 'default' };
      return <Tag color={s.color}>{s.label}</Tag>;
    },
    width: 110,
  },
  {
    title: 'Ngày thanh toán',
    dataIndex: 'paidAt',
    key: 'paidAt',
    align: 'center',
    render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    width: 130,
  },
];

const PaymentTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchPayments = async (pageNum = 1, pageSz = 10) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL + endpoints.analytic.paymentTable}?page=${pageNum}&pageSize=${pageSz}`);
      const result = res.data.data;
      setData(result.items);
      setTotal(result.totalItems);
    } catch (err) {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, pageSize);
  }, [page, pageSize]);

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(24,144,255,0.04)', padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#1890ff' }}>Danh sách giao dịch thanh toán</div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="paymentID"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showTotal: (total) => `Tổng cộng ${total} giao dịch`,
        }}
        scroll={{ x: 900 }}
        bordered
        size="middle"
      />
    </div>
  );
};

export default PaymentTable; 