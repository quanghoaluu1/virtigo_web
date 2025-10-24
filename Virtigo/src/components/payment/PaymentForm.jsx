import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import { Card, Typography, Spin, Alert, Space, Button, message, Divider, Input } from 'antd';
import { QrcodeOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentForm = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [amount, setAmount] = useState(null);
  const bankInfo = {
    BankName: 'MBBank',
    AccountNumber: '0896671154',
    AccountName: 'Luu Quang Hoa',
  };
  const transferNote = `ID${paymentInfo?.paymentId || ''}`;

  const student = JSON.parse(localStorage.getItem('user'));
  const studentAccountId = student?.accountId;
  
  if (!studentAccountId) {
    return (
      <Alert
        message="Yêu cầu đăng nhập"
        description="Bạn cần đăng nhập để thực hiện thanh toán."
        type="warning"
        showIcon
        
      />
    );
  }

  useEffect(() => {
    let intervalId;
  
    // Lấy thông tin ngân hàng
    const fetchBankInfo = async () => {
      try {
        // Giả sử có endpoint API_URL + 'api/Payment/bank-info'
        const res = await axios.get(`${API_URL}api/Payment/bank-info`);
        setBankInfo(res.data);
      } catch (e) {
        setBankInfo(null);
      }
    };

    fetchBankInfo();

    const createPaymentAndFetchQR = async () => {
      setLoading(true);
      let paymentId = '';
  
      try {
        // Tạo thanh toán
        const createRes = await axios.post(`${API_URL}${endpoints.payment.create}`, {
          accountID: studentAccountId,
          classID: classId,
          description: "Thanh toán học phí"
        });
        console.log("Created payment:", createRes.data);
        paymentId = createRes.data.paymentID;
        setPaymentInfo({ paymentId }); 
        setAmount(createRes.data.amount);
  
        // Lấy mã QR
        const qrRes = await axios.get(`${API_URL}api/Payment/qr/${paymentId}`);
        const rawQrUrl = qrRes.data.qrCodeUrl;
        const cleanQrUrl = rawQrUrl.replace(/amount=(\d+)\.(\d{2})/, (_, intPart, decimal) => {
          return `amount=${intPart}${decimal}`;
        });
        setQrUrl(cleanQrUrl);
        console.log("QR code:", cleanQrUrl);
  
        // Kiểm tra trạng thái lần đầu
        const statusRes = await axios.get(`${API_URL}api/Payment/status/${paymentId}`);
        setAmount(statusRes.data.total);
        if (statusRes.data.status === 0) {
          try {
            await axios.post(`${API_URL}api/Enrollment/create`, {
              paymentID: paymentId,
              studentID: studentAccountId,
              classID: classId
            });
            message.success('Thanh toán và đăng ký thành công!');
            navigate(`/payment-success`);
            return;
          } catch (enrollErr) {
            setError('Thanh toán thành công nhưng đăng ký lớp thất bại. Vui lòng liên hệ hỗ trợ.');
            return;
          }
        }
  
        intervalId = setInterval(async () => {
          try {
            const res = await axios.get(`${API_URL}api/Payment/status/${paymentId}`);
            const updatedStatus = res.data.status;
            console.log('Status trả về:', updatedStatus);
  
            if (updatedStatus === 0) {
              clearInterval(intervalId);
              setIsPolling(false);
              try {
                await axios.post(`${API_URL}api/Enrollment/create`, {
                  paymentID: paymentId,
                  studentID: studentAccountId,
                  classID: classId
                });
                message.success('Thanh toán và đăng ký thành công!');
                navigate(`/payment-success`);
              } catch (enrollErr) {
                setError('Thanh toán thành công nhưng đăng ký lớp thất bại. Vui lòng liên hệ hỗ trợ.');
              }
            }
          } catch (pollError) {
            console.error("Polling error:", pollError.response?.data || pollError.message);
          }
        }, 1500);
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
  
    createPaymentAndFetchQR();

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [classId, studentAccountId, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin indicator={<LoadingOutlined className="text-[24px]" spin />} />
        <Text style={{ display: 'block', marginTop: '16px' }}>Đang tạo mã thanh toán...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi thanh toán"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32,
      justifyContent: 'center',
      alignItems: 'flex-start',
      margin: '40px 0',
    }}>
      {/* Left column: Thông tin tài khoản */}
      <Card
        style={{
          flex: '1 1 340px',
          maxWidth: 400,
          minWidth: 320,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
          padding: 0,
          minHeight: 500,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-24">
          <Title level={4} style={{ marginBottom: 20, color: '#222' }}>
            <span role="img" aria-label="bank">🏦</span> Thông tin tài khoản
          </Title>
          <div className="mb-16">
            <Text style={{ color: '#222' }}>Chủ tài khoản</Text>
            <Input value={bankInfo.AccountName} readOnly style={{ fontWeight: 600, color: '#222', marginTop: 4 }} />
          </div>
          <div className="mb-16">
            <Text style={{ color: '#222' }}>Số tài khoản</Text>
            <Input value={bankInfo.AccountNumber} readOnly style={{ fontWeight: 600, color: '#222', marginTop: 4 }} />
          </div>
          <div className="mb-16">
            <Text style={{ color: '#222' }}>Ngân hàng</Text>
            <Input value={bankInfo.BankName} readOnly style={{ fontWeight: 600, color: '#222', marginTop: 4 }} />
          </div>
          <div className="mb-16">
            <Text style={{ color: '#222' }}>Nội dung chuyển</Text>
            <Input value={transferNote} readOnly style={{ fontWeight: 600, color: '#222', marginTop: 4 }} />
          </div>
        </div>
        <div style={{ background: '#fffbe6', borderTop: '1px solid #ffe58f', padding: 16, borderRadius: '0 0 12px 12px' }}>
          <Text strong>Lưu ý quan trọng</Text>
          <ul style={{ paddingLeft: 18, margin: '8px 0 0 0', fontSize: 13 }}>
            <li>Vui lòng chuyển đúng <b>nội dung</b> để tránh trường hợp không nhận được xác nhận.</li>
            <li>Sau khi chuyển khoản, vui lòng chờ 1-2 phút để hệ thống xử lý.</li>
            <li>Nếu có vấn đề, liên hệ hỗ trợ.</li>
          </ul>
        </div>
      </Card>
      {/* Right column: QR và hướng dẫn */}
      <Card
        style={{
          flex: '1 1 340px',
          maxWidth: 400,
          minWidth: 320,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
          textAlign: 'center',
          minHeight: 600,
        }}
      >
        <Title level={4} className="mb-20">Quét mã QR để nạp tiền</Title>
        <div style={{ padding: '20px 0', background: '#f5f5f5', borderRadius: '8px', marginBottom: 16 }}>
          {qrUrl && (
            <img
              src={qrUrl}
              alt="QR code"
              style={{
                width: 250,
                height: 250,
                marginBottom: '20px',
                borderRadius: '8px',
                background: '#fff',
              }}
            />
          )}
        </div>
        {amount && (
          <div className="mb-16">
            <Text strong>Số tiền cần chuyển khoản:</Text>
            <div style={{ fontSize: '20px', color: '#d4380d', fontWeight: 700 }}>
              {amount.toLocaleString('vi-VN')} VNĐ
            </div>
          </div>
        )}
        <Alert
          message="Hướng dẫn nhanh"
          description={
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              <li>Mở ứng dụng banking trên điện thoại</li>
              <li>Chọn "Quét mã QR" hoặc "Chuyển tiền QR"</li>
              <li>Quét mã QR và xác nhận giao dịch</li>
              <li>Chờ 1-2 phút để hệ thống xác nhận</li>
            </ol>
          }
          type="info"
          showIcon
          style={{ marginTop: 8, textAlign: 'left' }}
        />
        {isPolling && (
          <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
            Đang kiểm tra trạng thái thanh toán...
          </Text>
        )}
      </Card>
    </div>
  );
};


export default PaymentForm;
