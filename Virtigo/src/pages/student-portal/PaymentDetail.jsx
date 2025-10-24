import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Spin, Alert, Button } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';

const statusMap = {
  0: 'Đã thanh toán',
  1: 'Đang chờ',
  2: 'Yêu cầu hoàn tiền',
  3: 'Đã hoàn tiền',
};

const PaymentDetail = () => {
  const { paymentID } = useParams();
  const location = useLocation();
  const [data, setData] = useState(location.state?.payment || null);
  const [loading, setLoading] = useState(!location.state?.payment);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (data) return; // Đã có data từ state
    if (!paymentID) {
      setError('Không tìm thấy mã giao dịch.');
      setLoading(false);
      return;
    }
    axios.get(`${API_URL}api/Refund/detail?paymentId=${paymentID}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải chi tiết giao dịch.');
        setLoading(false);
      });
  }, [paymentID, data]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Button type="link" onClick={() => navigate(-1)} className="mb-16">
        ← Quay lại
      </Button>
      <h1>Chi tiết thanh toán</h1>
      {error && <Alert type="error" message={error} showIcon className="mb-16" />}
      <Spin spinning={loading} tip="Đang tải...">
        {data && (
          <Card bordered>
            <p><b>Mã giao dịch:</b> {data.paymentID}</p>
            <p><b>Tên lớp:</b> {data.className}</p>
            <p><b>Số tiền:</b> {data.amount?.toLocaleString('vi-VN')} ₫</p>
            <p><b>Ngày thanh toán:</b> {data.paymentDate && new Date(data.paymentDate).toLocaleString('vi-VN')}</p>
            <p><b>Ngày đăng ký:</b> {data.enrolledDate && new Date(data.enrolledDate).toLocaleString('vi-VN')}</p>
            <p><b>Trạng thái:</b> {statusMap[data.status] || 'Không xác định'}</p>
            <p><b>Mã lớp:</b> {data.classID}</p>
            <p><b>Mã sinh viên:</b> {data.studentID}</p>
            <p><b>Tên sinh viên:</b> {data.studentName}</p>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default PaymentDetail; 