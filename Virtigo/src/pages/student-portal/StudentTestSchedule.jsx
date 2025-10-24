import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, Select, DatePicker, Row, Col, Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const { Title } = Typography;
const { Option } = Select;


const getStatusFromTime = (startAt, endAt) => {
  const now = dayjs();
  if (startAt && now.isBefore(dayjs(startAt))) {
    return 'Sắp diễn ra';
  }
  if (startAt && endAt && now.isAfter(dayjs(startAt)) && now.isBefore(dayjs(endAt))) {
    return 'Đang diễn ra';
  }
  if (endAt && now.isAfter(dayjs(endAt))) {
    return 'Đã kết thúc';
  }
  return 'Không xác định';
};

const StudentTestSchedule = () => {
  const navigate = useNavigate();
  const [classFilter, setClassFilter] = useState(undefined);
  const [dateFilter, setDateFilter] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('Không tìm thấy thông tin người dùng');
        const user = JSON.parse(userStr);
        const studentId = user.accountId;
        const res = await axios.get(`${API_URL}${endpoints.testEvent.getByStudentId.replace('{studentId}', studentId)}`);
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          // Map dữ liệu về dạng table
          const rows = [];
          res.data.data.forEach(classItem => {
            const { className, subjectName, classID, testEvents } = classItem;
            if (Array.isArray(testEvents) && testEvents.length > 0) {
              testEvents.forEach(event => {
                rows.push({
                  key: event.testEventID,
                  testId: event.testID,
                  testEventID: event.testEventID,
                  testName: event.lessonTitle || event.description || 'Bài kiểm tra',
                  className,
                  subject: subjectName,
                  date: event.startAt ? dayjs(event.startAt).format('YYYY-MM-DD') : '',
                  time: event.startAt ? dayjs(event.startAt).format('HH:mm') : '',
                  status: getStatusFromTime(event.startAt, event.endAt),
                });
              });
            }
          });
          setTestData(rows);
        } else {
          setTestData([]);
        }
      } catch (err) {
        message.error('Lỗi khi tải lịch kiểm tra!');
        setTestData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewTest = (testEventID, testId) => {
    if (testId) {
      localStorage.setItem('currentTestId', testId);
    }
    navigate(`/student/view-test/${testEventID}`);
  };

  const columns = [
    {
      title: 'Tên bài kiểm tra',
      dataIndex: 'testName',
      key: 'testName',
      render: (text, record) => (
        <Button 
          type="link"
          onClick={() => handleViewTest(record.testEventID, record.testId)}
          style={{ padding: 0, height: 'auto', fontWeight: 500 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Lớp học',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Sắp diễn ra') color = 'blue';
        else if (status === 'Đang diễn ra') color = 'orange';
        else if (status === 'Đã kết thúc') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewTest(record.testEventID, record.testId)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const uniqueClasses = [...new Set(testData.map(item => item.className))];

  const filteredData = testData.filter(item => {
    const matchClass = classFilter ? item.className === classFilter : true;
    const matchDate = dateFilter ? dayjs(item.date).isSame(dateFilter, 'day') : true;
    return matchClass && matchDate;
  });

  const statusOrder = {
    'Đang diễn ra': 0,
    'Sắp diễn ra': 1,
    'Đã kết thúc': 2,
    'Không xác định': 3,
  };

  const sortedData = [...filteredData].sort((a, b) => {
    // So sánh theo trạng thái trước
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Nếu cùng trạng thái, sắp xếp theo ngày tăng dần (gần nhất lên trước)
    if (!a.date) return 1;
    if (!b.date) return -1;
    return dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1;
  });

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 32, margin: 24 }}>
      <Title level={2} style={{ fontWeight: 700, marginBottom: 24 }}>Lịch kiểm tra</Title>
      <Row gutter={16} className="mb-24">
        <Col>
          <Select
            allowClear
            placeholder="Chọn lớp học"
            style={{ minWidth: 400, maxWidth:400 }}
            value={classFilter}
            onChange={setClassFilter}
          >
            {uniqueClasses.map(className => (
              <Option key={className} value={className}>{className}</Option>
            ))}
          </Select>
        </Col>
        <Col>
          <DatePicker
            allowClear
            placeholder="Chọn ngày kiểm tra"
            value={dateFilter}
            onChange={setDateFilter}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>
      <Spin spinning={loading} tip="Đang tải...">
        <Table columns={columns} dataSource={sortedData} pagination={false} />
      </Spin>
    </div>
  );
};

export default StudentTestSchedule; 