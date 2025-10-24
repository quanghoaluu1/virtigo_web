import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Button, Modal, Descriptions, Tag } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { getUser } from '../../utils/auth';
import { EyeOutlined } from '@ant-design/icons';

const statusMap = {
  'Paid': 'Đã thanh toán',
  'Pending': 'Đang chờ',
  'RefundRequested': 'Yêu cầu hoàn tiền',
  'Refunded': 'Đã hoàn tiền',
};

const columns = [
  {
    title: 'Mã giao dịch',
    dataIndex: 'paymentID',
    key: 'paymentID',
  },
  {
    title: 'Tên lớp',
    dataIndex: 'className',
    key: 'className',
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount) => amount?.toLocaleString('vi-VN') + ' ₫',
  },
  {
    title: 'Ngày thanh toán',
    dataIndex: 'paymentDate',
    key: 'paymentDate',
    render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '',
  },
  // Bỏ cột ngày đăng ký vì không có trong response mới
  // {
  //   title: 'Ngày đăng ký',
  //   dataIndex: 'enrolledDate',
  //   key: 'enrolledDate',
  //   render: (date) => new Date(date).toLocaleString('vi-VN'),
  // },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: (status) => (
      <Tag color={
        status === 'Paid' ? 'green' :
        status === 'Pending' ? 'orange' :
        status === 'RefundRequested' ? 'red' :
        status === 'Refunded' ? 'blue' : 'default'
      }>
        {statusMap[status] || 'Không xác định'}
      </Tag>
    ),
  },
];

const PaymentHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const columnsWithAction = [
    ...columns,
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedPayment(record);
            setModalOpen(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const user = getUser();
    const studentId = user?.accountId;
    if (!studentId) {
      setError('Không tìm thấy thông tin sinh viên.');
      setLoading(false);
      return;
    }
    axios.get(`${API_URL}api/PayOs?userId=${studentId}`)
      .then(res => {
        console.log('API Response:', res.data);
        // Map lại các trường dữ liệu cho đúng với frontend
        // Try different possible response structures
        let rawData = [];
        if (Array.isArray(res.data)) {
          rawData = res.data;
        } else if (Array.isArray(res.data.data)) {
          rawData = res.data.data;
        } else if (res.data && typeof res.data === 'object') {
          // If it's an object, check for common array properties
          rawData = res.data.items || res.data.result || res.data.payments || [];
        }
        
        console.log('Raw Data:', rawData);
        const mappedData = rawData.map(item => ({
          paymentID: item.paymentID,
          className: item.className,
          amount: item.total,
          paymentDate: item.dayCreate,
          status: item.status,
        }));
        console.log('Mapped Data:', mappedData);
        setData(mappedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching payment history:', error);
        setError('Không thể tải lịch sử thanh toán.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="font-bold">Lịch sử thanh toán</h1>
      {error && <Alert type="error" message={error} showIcon className="mb-16" />}
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columnsWithAction}
          dataSource={data}
          rowKey="paymentID"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title="Chi tiết thanh toán"
      >
        {selectedPayment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã giao dịch">{selectedPayment.paymentID}</Descriptions.Item>
            <Descriptions.Item label="Tên lớp">{selectedPayment.className}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">{selectedPayment.amount?.toLocaleString('vi-VN')} ₫</Descriptions.Item>
            <Descriptions.Item label="Ngày thanh toán">{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleString('vi-VN') : ''}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={
                selectedPayment.status === 'Paid' ? 'green' :
                selectedPayment.status === 'Pending' ? 'orange' :
                selectedPayment.status === 'RefundRequested' ? 'red' :
                selectedPayment.status === 'Refunded' ? 'blue' : 'default'
              }>
                {statusMap[selectedPayment.status] || 'Không xác định'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PaymentHistory; 