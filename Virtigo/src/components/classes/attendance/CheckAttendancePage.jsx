import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Typography, Button, Input, Space, Radio } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, SaveOutlined } from '@ant-design/icons';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useLocation, useNavigate } from 'react-router-dom';
import ActionConfirm from '../../common/ActionConfirm';
import Notification from '../../common/Notification';

const { Title } = Typography;
const { TextArea } = Input;

const statusMap = {
  0: { icon: <CheckCircleTwoTone twoToneColor="#52c41a" />, color: 'green', text: 'Có mặt' }, // Present
  1: { icon: <CloseCircleTwoTone twoToneColor="#ff4d4f" />, color: 'red', text: 'Vắng' },      // Absence
  2: { icon: <CloseCircleTwoTone twoToneColor="#faad14" />, color: 'orange', text: 'Chưa điểm danh' }, // NotAvailable
};

const CheckAttendancePage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const lessonId = props.lessonId || location.state?.lessonId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success',
    message: '',
    description: ''
  });

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    axios.get(`${API_URL}api/Attendance/get-by-lesson-id/${lessonId}`)
      .then(res => {
        const lessonData = res.data.data;
        setData(lessonData);
        // Khởi tạo attendance records từ dữ liệu API
        const records = lessonData.studentAttendanceRecords.map(record => ({
          attendanceRecordID: record.attendanceRecordID,
          attendanceStatus: record.attendanceStatus !== undefined ? record.attendanceStatus : 2,
          note: record.note || ''
        }));
        setAttendanceRecords(records);
      })
      .catch(error => {
        console.error('Error fetching attendance data:', error);
        setNotification({
          visible: true,
          type: 'error',
          message: 'Lỗi',
          description: 'Không thể tải dữ liệu điểm danh'
        });
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleStatusChange = (recordId, newStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.attendanceRecordID === recordId 
          ? { ...record, attendanceStatus: newStatus }
          : record
      )
    );
  };

  const handleNoteChange = (recordId, note) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.attendanceRecordID === recordId 
          ? { ...record, note }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const payload = {
        lessonId: lessonId,
        attendanceRecords: attendanceRecords
      };
      
      const response = await axios.put(`${API_URL}api/Attendance/check-attendace`, payload);
      
      if (response.data.success) {
        setNotification({
          visible: true,
          type: 'success',
          message: 'Thành công',
          description: response.data.message
        });
        setShowConfirm(false);
        
        // Reload data
        const res = await axios.get(`${API_URL}api/Attendance/get-by-lesson-id/${lessonId}`);
        setData(res.data.data);
      } else {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Lỗi',
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setNotification({
        visible: true,
        type: 'error',
        message: 'Lỗi',
        description: 'Không thể lưu điểm danh'
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 200,
      fixed: 'left',
    },
    {
      title: 'Trạng thái hiện tại',
      key: 'currentStatus',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const currentStatus = attendanceRecords.find(r => r.attendanceRecordID === record.attendanceRecordID)?.attendanceStatus ?? 2;
        return (
          <Tag color={statusMap[currentStatus].color} style={{ fontSize: 14, padding: '4px 8px' }}>
            {statusMap[currentStatus].icon} {statusMap[currentStatus].text}
          </Tag>
        );
      }
    },
    {
      title: 'Điểm danh',
      key: 'attendance',
      width: 200,
      align: 'center',
      render: (_, record) => {
        const currentStatus = attendanceRecords.find(r => r.attendanceRecordID === record.attendanceRecordID)?.attendanceStatus ?? 2;
        return (
          <Radio.Group 
            value={currentStatus} 
            onChange={(e) => handleStatusChange(record.attendanceRecordID, e.target.value)}
            size="middle"
          >
            <Space direction="vertical">
              <Radio value={0}>
                <CheckCircleTwoTone twoToneColor="#52c41a" /> Có mặt
              </Radio>
              <Radio value={1}>
                <CloseCircleTwoTone twoToneColor="#ff4d4f" /> Vắng
              </Radio>
              <Radio value={2}>
                <CloseCircleTwoTone twoToneColor="#faad14" /> Chưa điểm danh
              </Radio>
            </Space>
          </Radio.Group>
        );
      }
    },
    {
      title: 'Ghi chú',
      key: 'note',
      width: 300,
      render: (_, record) => {
        const currentNote = attendanceRecords.find(r => r.attendanceRecordID === record.attendanceRecordID)?.note || '';
        return (
          <TextArea
            value={currentNote}
            onChange={(e) => handleNoteChange(record.attendanceRecordID, e.target.value)}
            placeholder="Nhập ghi chú (nếu có)"
            rows={2}
            className="w-full"
          />
        );
      }
    }
  ];

  if (!lessonId) return <div style={{ textAlign: 'center', marginTop: 60, color: 'red' }}>Không tìm thấy lessonId!</div>;
  if (loading) return <div style={{ textAlign: 'center', marginTop: 60 }}><Spin size="large" /></div>;
  if (!data) return <div style={{ textAlign: 'center', marginTop: 60 }}>Không có dữ liệu điểm danh.</div>;

  return (
    <div style={{ margin: '0 auto', padding: 24, minHeight: '100vh', boxSizing: 'border-box'}}>
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification({ ...notification, visible: false })}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => navigate(-1)} className="mr-16" icon={<ArrowLeftOutlined />}>
            Quay lại
          </Button>
          <Title level={3} className="m-0">
            Điểm danh: {data.lessonTitle}
          </Title>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={() => setShowConfirm(true)}
          loading={saving}
        >
          Cập nhật điểm danh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data.studentAttendanceRecords}
        rowKey="attendanceRecordID"
        bordered
        pagination={false}
        scroll={{ x: 800 }}
        size="middle"
      />

      <ActionConfirm
        open={showConfirm}
        title="Xác nhận cập nhật điểm danh"
        content="Bạn có chắc chắn muốn cập nhật điểm danh cho tất cả học viên?"
        onOk={handleSaveAttendance}
        onCancel={() => setShowConfirm(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      />
    </div>
  );
};

export default CheckAttendancePage; 