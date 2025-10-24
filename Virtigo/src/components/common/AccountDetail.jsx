import React, { useEffect, useState } from 'react';
import { Layout, Descriptions, Tag, Spin, Alert, Button, Input, DatePicker, Select, message, Upload, Avatar, Modal } from 'antd';
import { UploadOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import dayjs from 'dayjs';
import Notification from './Notification';
import { useParams, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Option } = Select;

// Map enum string sang tiếng Việt
const genderViMap = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' };
const roleViMap = { Manager: 'Quản lý', Lecture: 'Giảng viên', Student: 'Học sinh' };
// Map ngược lại từ tiếng Việt sang enum tiếng Anh
const genderEnMap = { 'Nam': 'Male', 'Nữ': 'Female', 'Khác': 'Other' };
const roleEnMap = { 'Quản lý': 'Manager', 'Giảng viên': 'Lecture', 'Học sinh': 'Student' };
const statusViMap = {
  Active: 'Đang hoạt động',
  Blocked: 'Đã bị khóa',
  Deleted: 'Đã xóa',
};
// const statusMap = { 0: <Tag color="green">Đang hoạt động</Tag>, 1: <Tag color="red">Ngưng hoạt động</Tag> };

const AccountDetail = ({ accountID: propAccountID, hideFields = [] }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [latestUploadedImage, setLatestUploadedImage] = useState(null);
  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentHistoryError, setPaymentHistoryError] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  // Thêm biến kiểm tra role của user đăng nhập
  let showBackButton = false;
  let isCurrentUserManager = false;
  // Thêm state cho lỗi email
  const [emailError, setEmailError] = useState('');
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'Manager') {
      showBackButton = true;
      isCurrentUserManager = true;
    }
  } catch {}

  useEffect(() => {
    // Lấy accountID từ prop, nếu không có thì lấy từ URL, nếu không thì hardcode
    let accountId = propAccountID || params.accountId || 'A00001';
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!propAccountID && !params.accountId && user && user.accountId) accountId = user.accountId;
    } catch {}

    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}api/Account/${accountId}`);
        // Map dữ liệu về đúng format
        const apiData = res.data;
        const genderStr = genderViMap[apiData.gender] || apiData.gender;
        const roleStr = apiData.role; // giữ nguyên enum tiếng Anh
        // Giữ nguyên status là enum chuỗi từ backend
        const mappedData = {
          accountID: apiData.accountID,
          lastName: apiData.lastName,
          firstName: apiData.firstName,
          gender: genderStr,
          phoneNumber: apiData.phoneNumber,
          email: apiData.email,
          birthDate: apiData.birthDate,
          role: roleStr, // enum tiếng Anh
          status: apiData.status,
          img: apiData.img || 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png',
        };
        console.log('Fetched account data:', mappedData);
        setStudentData(mappedData);
        setAvatarUrl(mappedData.img);
      } catch (err) {
        console.error('Error fetching account data:', err);
        setError('Không thể tải thông tin học sinh');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [propAccountID, params.accountId]);

  // Hàm buildPayload dùng chung
  const buildPayload = (overrides = {}) => {
    // Ưu tiên URL mới nhất từ overrides nếu có
    const finalImageUrl = overrides.image || latestUploadedImage || editValues.image || avatarUrl || studentData.img || '';
    
    const payload = {
      accountID: studentData.accountID,
      firstName: editValues.firstName || studentData.firstName,
      lastName: editValues.lastName || studentData.lastName,
      phoneNumber: editValues.phoneNumber || studentData.phoneNumber,
      email: editValues.email || studentData.email,
      gender: genderEnMap[editValues.gender] || editValues.gender || 'Male',
      role: roleEnMap[editValues.role] || editValues.role || studentData.role,
      status: editValues.status || studentData.status || 'Active',
      birthDate: editValues.birthDate
        ? dayjs(editValues.birthDate).format('YYYY-MM-DD')
        : studentData.birthDate,
      img: finalImageUrl,
    };
    
    // Debug log để kiểm tra giá trị img
    console.log('Debug buildPayload:');
    console.log('- overrides.image:', overrides.image);
    console.log('- latestUploadedImage:', latestUploadedImage);
    console.log('- editValues.image:', editValues.image);
    console.log('- avatarUrl:', avatarUrl);
    console.log('- studentData.img:', studentData.img);
    console.log('- Final img value:', payload.img);
    
    return payload;
  };

  const handleEditConfirmed = () => {
    const currentImage = studentData.img || avatarUrl || '';
    setEditValues({
      ...studentData,
      birthDate: studentData.birthDate ? dayjs(studentData.birthDate) : null,
      gender: studentData.gender,
      image: currentImage,
    });
    setAvatarUrl(currentImage || null);
    setLatestUploadedImage(null);
    setIsEditing(true);
    setShowEditConfirm(false);
  };

  const handleEdit = () => {
    setShowEditConfirm(true);
  };

  // Regex validate đầu số nhà mạng Việt Nam
  const validatePhoneNumber = (phone) => {
    const regex = /^(0(3[2-9]|5[689]|7[06789]|8[1-9]|9[0-9]))\d{7}$/;
    return regex.test(phone);
  };

  // Thêm hàm validate email
  const validateEmail = (email) => {
    // Đơn giản, có thể thay đổi regex nếu cần nghiêm ngặt hơn
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Khi thay đổi trường
  const handleChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
    if (field === 'phoneNumber') {
      if (!validatePhoneNumber(value)) {
        setPhoneError('Số điện thoại không hợp lệ hoặc không đúng đầu số nhà mạng!');
      } else {
        setPhoneError('');
      }
    }
    if (field === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Email không hợp lệ!');
      } else {
        setEmailError('');
      }
    }
    if (field === 'image') {
      setAvatarUrl(value);
      console.log('handleChange - updated image:', value);
    }
  };

  // Upload avatar
  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      setAvatarUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      setAvatarUploading(false);
      const url = typeof info.file.response === 'string'
        ? info.file.response
        : info.file.response?.url || info.file.response?.data?.url;
      
      console.log('handleAvatarChange - new image URL:', url);
      
      // Cập nhật state với callback để đảm bảo thứ tự
      setAvatarUrl(url);
      setLatestUploadedImage(url);
      setEditValues(prev => {
        const updated = { ...prev, image: url };
        console.log('Updated editValues.image:', updated.image);
        return updated;
      });
      
      message.success('Tải ảnh thành công!');

      // Đợi một chút để state được cập nhật trước khi gửi request
      await new Promise(resolve => setTimeout(resolve, 100));

      // Gửi đầy đủ thông tin lên backend khi đổi ảnh
      try {
        // Tạo payload với URL mới trực tiếp
        const payload = {
          accountID: studentData.accountID,
          firstName: editValues.firstName || studentData.firstName,
          lastName: editValues.lastName || studentData.lastName,
          phoneNumber: editValues.phoneNumber || studentData.phoneNumber,
          email: editValues.email || studentData.email,
          gender: genderEnMap[editValues.gender] || editValues.gender || 'Male',
          role: roleEnMap[editValues.role] || editValues.role || studentData.role,
          status: editValues.status || studentData.status || 'Active',
          birthDate: editValues.birthDate
            ? dayjs(editValues.birthDate).format('YYYY-MM-DD')
            : studentData.birthDate,
          img: url, // Sử dụng URL mới trực tiếp
        };
        
        // console.log('Payload khi đổi ảnh (với URL mới):', payload);
        // console.log(studentData.accountID);
        const res = await axios.put(`${API_URL}api/Account/update`, payload);
        console.log(res);
        if (res.data && res.data.success) {
          try {
            const refreshed = await axios.get(`${API_URL}api/Account/${studentData.accountID}`);
            const refreshedData = {
              ...refreshed.data,
              img: url, // fallback nếu backend chưa cập nhật kịp
            };
            setStudentData(refreshedData);
            setAvatarUrl(refreshedData.img);
            message.success('Cập nhật ảnh đại diện thành công!');
            setNotification({ visible: true, type: 'success', message: 'Cập nhật ảnh đại diện thành công!', description: '' });
            window.location.reload();
          } catch (refreshError) {
            console.error('Lỗi khi load lại dữ liệu sau khi upload avatar:', refreshError);
            message.warning('Tải ảnh xong nhưng không thể làm mới thông tin người dùng');
          }
        } else {
          setNotification({ visible: true, type: 'error', message: 'Cập nhật thất bại!', description: res.data?.message || '' });
        }
      } catch (err) {
        console.error('Error updating avatar:', err);
        message.error('Cập nhật ảnh đại diện thất bại!');
      }
    } else if (info.file.status === 'error') {
      setAvatarUploading(false);
      message.error('Tải ảnh thất bại!');
    }
  };

  const customAvatarUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API_URL}${endpoints.cloudinary.uploadAvatar}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(res.data.url || res.data.data?.url || res.data);
    } catch (err) {
      onError(err);
    }
  };

  // Lưu thông tin
  const handleSave = async () => {
    // Validate đầu vào
    if (!editValues.firstName || !editValues.lastName || !editValues.email) {
      message.warning('Vui lòng nhập đầy đủ họ, tên và email!');
      return;
    }
    if (isEditing && editValues.phoneNumber && !validatePhoneNumber(editValues.phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ hoặc không đúng đầu số nhà mạng!');
      message.warning('Số điện thoại không hợp lệ hoặc không đúng đầu số nhà mạng!');
      return;
    }
    // Kiểm tra lỗi email
    if (isEditing && editValues.email && !validateEmail(editValues.email)) {
      setEmailError('Email không hợp lệ!');
      message.warning('Email không hợp lệ!');
      return;
    }
    
    console.log('handleSave - editValues:', editValues);
    console.log('handleSave - avatarUrl:', avatarUrl);
    
    try {
      // Đảm bảo sử dụng ảnh mới nhất
      const currentImage = latestUploadedImage || avatarUrl || editValues.image || studentData.img || '';
      const payload = buildPayload({ image: currentImage });
      console.log('Payload gửi lên:', payload);
      const res = await axios.put(`${API_URL}api/Account/update`, payload);
      if (res.data && res.data.success) {
        setNotification({ visible: true, type: 'success', message: 'Cập nhật thành công!', description: res.data.message || '' });
        setIsEditing(false);
        setLoading(true);
        const refreshed = await axios.get(`${API_URL}api/Account/${studentData.accountID}`);
        const refreshedData = {
          ...refreshed.data,
          img: refreshed.data.img || avatarUrl,
        };
        setStudentData(refreshedData);
        setAvatarUrl(refreshedData.img);
      } else {
        setNotification({ visible: true, type: 'error', message: 'Cập nhật thất bại!', description: res.data?.message || '' });
      }
    } catch (err) {
      setNotification({ visible: true, type: 'error', message: 'Cập nhật thất bại!', description: err?.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
    setAvatarUrl(studentData?.img || null);
    setLatestUploadedImage(null);
  };

  // Thêm hàm kiểm tra role
  // const isManager = (studentData?.role === 'Manager' || (editValues?.role === 'Manager'));

  // Hàm lấy lịch sử thanh toán
  const fetchPaymentHistory = async () => {
    setPaymentHistoryLoading(true);
    setPaymentHistoryError(null);
    try {
      const res = await axios.get(`${API_URL}api/Payment/history/${studentData.accountID}`);
      if (res.data && res.data.success) {
        setPaymentHistory(res.data.data || []);
      } else {
        setPaymentHistory([]);
        setPaymentHistoryError(res.data?.message || 'Không thể lấy lịch sử thanh toán');
      }
    } catch (err) {
      setPaymentHistory([]);
      setPaymentHistoryError(err?.response?.data?.message || err.message);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
      <Content
        style={{
          // margin: '32px auto',
          // padding: 0,
          // borderRadius: '24px',
          // minHeight: 400,
          // maxWidth: 950,
          // background: '#fff',
          // boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          display: 'flex',
          flexDirection: 'row',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        {/* Left column: Avatar + Upload */}
        <div style={{
          flex: '0 0 320px',
          background: '#fafbfc',
          borderRadius: '24px',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}>
          {/* Nút quay lại nằm góc trái, avatar căn giữa */}
          <div style={{ position: 'relative', width: '100%', marginBottom: 24 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ position: 'absolute', top: 0, left: 0, minWidth: 40, height: 40, fontWeight: 500, marginBottom: 0, zIndex: 2 }}
            >
              Quay lại
            </Button>
            <div style={{ height: 60 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Avatar size={350} src={avatarUrl} icon={<UserOutlined />} style={{ border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 24 }} shape="square" />
            </div>
          </div>
          {/* Ẩn nút đổi ảnh nếu là Manager và không phải tài khoản của mình */}
          {!(isCurrentUserManager && studentData && (() => {
            try {
              const user = JSON.parse(localStorage.getItem('user'));
              return user && user.accountId !== studentData.accountID;
            } catch { return false; }
          })()) && (
            <Upload
              name="file"
              showUploadList={false}
              customRequest={customAvatarUpload}
              onChange={handleAvatarChange}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={avatarUploading} style={{ width: 180, height: 40, fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
                Đổi ảnh đại diện
              </Button>
            </Upload>
          )}
          {((isCurrentUserManager) || (studentData && (() => {
            try {
              const user = JSON.parse(localStorage.getItem('user'));
              return user && user.role === 'Student' && user.accountId === studentData.accountID;
            } catch { return false; }
          })())) && (
            <Button
              onClick={() => {
                setPaymentHistoryModalOpen(true);
                fetchPaymentHistory();
              }}
              style={{ width: 180, height: 40, fontWeight: 500, fontSize: 16, marginTop: 8 }}
            >
              Xem lịch sử thanh toán
            </Button>
          )}
        </div>
        {/* Thêm thẻ đóng div cho cột trái ở đây */}
        {/* Right column: Info fields */}
        <div style={{ flex: 1, padding: '32px 0 32px 0', position: 'relative', paddingTop: 0 }}>
          {/* Nút quay lại ở góc trên trái */}
          {/* <div style={{ position: 'absolute', top: 0, left: 0 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ minWidth: 40, height: 40, fontWeight: 500 }}
            >
              Quay lại
            </Button>
          </div> */}
          {/* Nút chỉnh sửa ở góc trên phải */}
          {!isEditing && studentData && studentData.accountID && (
            <div style={{ position: 'absolute', top: 0, right: 0 }}>
              <Button
                type="primary"
                onClick={handleEdit}
                style={{ minWidth: 140, height: 40, fontWeight: 500 }}
              >
                Chỉnh sửa
              </Button>
            </div>
          )}
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 32, textAlign: 'left' }}>Thông tin cá nhân</h2>
          {loading ? (
            <Spin />
          ) : error ? (
            <Alert type="error" message={error} />
          ) : studentData ? (
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Profile group */}
              <div style={{ gridColumn: '1 / span 2', marginBottom: 8, fontWeight: 600, fontSize: 18 }}>Thông tin tài khoản</div>
              <div>
                <label className="font-medium">Mã tài khoản</label>
                <Input value={studentData.accountID} disabled className="mt-4" />
              </div>
              <div></div>
              <div>
                <label className="font-medium">Họ</label>
                {isEditing ? (
                  <Input value={editValues.lastName} onChange={e => handleChange('lastName', e.target.value)} className="mt-4" />
                ) : (
                  <Input value={studentData.lastName} disabled className="mt-4" />
                )}
              </div>
              <div>
                <label className="font-medium">Tên</label>
                {isEditing ? (
                  <Input value={editValues.firstName} onChange={e => handleChange('firstName', e.target.value)} className="mt-4" />
                ) : (
                  <Input value={studentData.firstName} disabled className="mt-4" />
                )}
              </div>
              <div>
                <label className="font-medium">Giới tính</label>
                {isEditing ? (
                  <Select value={editValues.gender} onChange={v => handleChange('gender', v)} style={{ width: '100%', marginTop: 4 }}>
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                ) : (
                  <Input value={studentData.gender} disabled className="mt-4" />
                )}
              </div>
              <div>
                <label className="font-medium">Số điện thoại</label>
                {isEditing ? (
                  <>
                    <Input value={editValues.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} className="mt-4" />
                    {phoneError && <div style={{ color: 'red', marginTop: 4 }}>{phoneError}</div>}
                  </>
                ) : (
                  <Input value={studentData.phoneNumber} disabled className="mt-4" />
                )}
              </div>
              <div>
                <label className="font-medium">Email</label>
                {isEditing ? (
                  <>
                    <Input value={editValues.email} onChange={e => handleChange('email', e.target.value)} className="mt-4" />
                    {emailError && <div style={{ color: 'red', marginTop: 4 }}>{emailError}</div>}
                  </>
                ) : (
                  <Input value={studentData.email} disabled className="mt-4" />
                )}
              </div>
              {!hideFields.includes('birthDate') && (
                <div>
                  <label className="font-medium">Ngày sinh</label>
                  {isEditing ? (
                    <DatePicker value={editValues.birthDate ? dayjs(editValues.birthDate) : null} onChange={d => handleChange('birthDate', d)} format="YYYY-MM-DD" style={{ width: '100%', marginTop: 4 }} />
                  ) : (
                    <Input value={studentData.birthDate} disabled className="mt-4" />
                  )}
                </div>
              )}
              {!hideFields.includes('role') && (
                <div>
                  <label className="font-medium">Vai trò</label>
                  {isEditing && isCurrentUserManager ? (
                    <Select value={editValues.role} onChange={v => handleChange('role', v)} style={{ width: '100%', marginTop: 4 }}>
                      <Option value="Manager">Quản lý</Option>
                      <Option value="Lecture">Giảng viên</Option>
                      <Option value="Student">Học sinh</Option>
                    </Select>
                  ) : (
                    <Input value={roleViMap[studentData.role] || studentData.role} disabled className="mt-4" />
                  )}
                </div>
              )}
              {!hideFields.includes('status') && (
                <div>
                  <label className="font-medium">Trạng thái</label>
                  {isEditing && isCurrentUserManager ? (
                    <Select value={editValues.status} onChange={v => handleChange('status', v)} style={{ width: '100%', marginTop: 4 }}>
                      <Option value="Active">Đang hoạt động</Option>
                      <Option value="Blocked">Đã bị khóa</Option>
                      <Option value="Deleted">Đã xóa</Option>
                    </Select>
                  ) : (
                    <Input value={statusViMap[studentData.status] || studentData.status} disabled className="mt-4" />
                  )}
                </div>
              )}
              {/* Action buttons */}
              <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: isEditing ? 'flex-end' : 'center', gap: 16, marginTop: 24 }}>
                {isEditing ? (
                  <>
                    <Button type="primary" onClick={() => setShowSaveConfirm(true)} style={{ minWidth: 120, height: 40, fontWeight: 500 }}>Lưu</Button>
                    <Button onClick={handleCancel} style={{ minWidth: 120, height: 40, fontWeight: 500 }}>Hủy</Button>
                  </>
                ) : null}
              </div>
            </form>
          ) : null}
          <Modal
            open={showEditConfirm}
            onCancel={() => setShowEditConfirm(false)}
            onOk={handleEditConfirmed}
            okText="Đồng ý"
            cancelText="Hủy"
            title="Bạn có chắc muốn chỉnh sửa?"
          >
            Thao tác này sẽ cho phép chỉnh sửa thông tin cá nhân.
          </Modal>
          <Modal
            open={showSaveConfirm}
            onCancel={() => setShowSaveConfirm(false)}
            onOk={() => {
              setShowSaveConfirm(false);
              handleSave();
            }}
            okText="Đồng ý"
            cancelText="Hủy"
            title="Bạn có chắc muốn lưu thay đổi?"
          >
            {isCurrentUserManager ? (
              'Thao tác này sẽ lưu lại các thay đổi thông tin cá nhân của người dùng này.'
            ) : (
              'Thao tác này sẽ lưu lại các thay đổi thông tin cá nhân của bạn.'
            )}
          </Modal>
          {/* Modal lịch sử thanh toán */}
          <Modal
            open={paymentHistoryModalOpen}
            onCancel={() => setPaymentHistoryModalOpen(false)}
            footer={null}
            title="Lịch sử thanh toán"
            width={700}
          >
            {paymentHistoryLoading ? (
              <Spin />
            ) : paymentHistoryError ? (
              <Alert type="error" message={paymentHistoryError} />
            ) : (
              <>
                {paymentHistory.length === 0 ? (
                  <div>Không có lịch sử thanh toán.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #eee', padding: 8 }}>Mã thanh toán</th>
                        <th style={{ border: '1px solid #eee', padding: 8 }}>Lớp</th>
                        <th style={{ border: '1px solid #eee', padding: 8 }}>Số tiền</th>
                        <th style={{ border: '1px solid #eee', padding: 8 }}>Trạng thái</th>
                        <th style={{ border: '1px solid #eee', padding: 8 }}>Ngày thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map(item => (
                        <tr key={item.paymentId}>
                          <td style={{ border: '1px solid #eee', padding: 8 }}>{item.paymentId}</td>
                          <td style={{ border: '1px solid #eee', padding: 8 }}>{item.className}</td>
                          <td style={{ border: '1px solid #eee', padding: 8 }}>{item.total?.toLocaleString('vi-VN')}₫</td>
                          <td style={{ border: '1px solid #eee', padding: 8 }}>
                            {item.paymentStatus === 0 ? (
                              <Tag color="green">Đã thanh toán</Tag>
                            ) : (
                              <Tag color="red">Chưa thanh toán</Tag>
                            )}
                          </td>
                          <td style={{ border: '1px solid #eee', padding: 8 }}>{item.paidAt ? dayjs(item.paidAt).format('YYYY-MM-DD HH:mm') : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default AccountDetail;
