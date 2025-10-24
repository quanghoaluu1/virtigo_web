import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Card, Avatar, Button } from 'antd';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const fetchStudentList = async (classId) => {
  const res = await axios.get(`${API_URL}api/Class/get-student-by-class/${classId}`);
  return res.data.data;
};

const genderMap = {
  0: 'Nam',
  1: 'Nữ',
  2: 'Khác',
};

const columns = [
  {
    title: 'STT',
    dataIndex: 'index',
    key: 'index',
    render: (_, __, idx) => idx + 1,
    width: 60,
  },
  {
    title: 'Avatar',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    render: (url) => <Avatar src={url} alt="avatar" />,
    width: 70,
  },
  {
    title: 'Tên học sinh',
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: 'Giới tính',
    dataIndex: 'gender',
    key: 'gender',
    render: (gender) => genderMap[gender] || 'Không xác định',
    width: 90,
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 130,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Ngày sinh',
    dataIndex: 'birthDate',
    key: 'birthDate',
    render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '',
    width: 120,
  },
];

const StudentListSection = ({ classId, subjectId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleAttendanceClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    let prefix = '';
    if (user?.role === 'Manager') prefix = '/dashboard';
    else if (user?.role === 'Lecture') prefix = '/lecturer';
    else prefix = '';
    navigate(`${prefix}/attendance`, { state: { classId } });
  };

  const handleGradeClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    let prefix = '';
    if (user?.role === 'Manager') prefix = '/dashboard';
    else if (user?.role === 'Lecture') prefix = '/lecturer';
    else prefix = '';
    navigate(`${prefix}/grades`, { state: { classId, subjectId } });
  };

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    fetchStudentList(classId)
      .then(res => {
        setData(res);
        console.log('Student list:', res);
      })
      .catch(() => setError('Không thể tải danh sách học sinh'))
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <Card
      className="mb-16"
      bodyStyle={{ padding: collapsed ? 0 : 24 }}
      title={
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
        >
          <div className="flex items-center gap-10">
            <span>Danh sách học sinh</span>
            <Button type="primary" onClick={handleAttendanceClick} disabled={!classId} size="small">
              Tình trạng điểm danh
            </Button>
            <Button type="primary" onClick={handleGradeClick} disabled={!classId} size="small">
              Bảng điểm
            </Button>
          </div>
          <span
            style={{ cursor: 'pointer', fontSize: 18, marginLeft: 16 }}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? '▼' : '▲'}
          </span>
        </div>
      }
    >
      {!collapsed && (
        loading ? (
          <Spin tip="Đang tải danh sách học sinh..." />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey={(record) => record.studentID || record.id || record.key}
            pagination={false}
          />
        )
      )}
    </Card>
  );
};

export default StudentListSection; 