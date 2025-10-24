import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Spin, Alert, Select, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import StudentTeacherClassCard from '../../components/class/StudentTeacherClassCard';
import EnrollSummary from './EnrollSummary';

const { Option } = Select;

const EnrollClass = () => {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState('Ongoing');
  const [selectedLecturer, setSelectedLecturer] = useState('All');

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const studentId = user?.accountId;
        if (!studentId) throw new Error('Không tìm thấy thông tin sinh viên.');
        const url = API_URL + endpoints.enrollment.myClasses.replace('{studentId}', studentId);
        const res = await axios.get(url, {
          headers: {'ngrok-skip-browser-warning': '1'}
        });
        setEnrolledClasses(res.data);
      } catch (err) {
        setError('Không thể tải danh sách lớp đã đăng ký.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledClasses();
  }, []);

  const handleStatusChange = (value) => setSelectedStatus(value);
  const handleLecturerChange = (value) => setSelectedLecturer(value);

  // Danh sách giảng viên không trùng nhau, loại null/undefined
  const allLecturers = [...new Set(enrolledClasses.map((c) => c.lecturerName).filter(Boolean))].sort();
  console.log("All Lecturers:", allLecturers);
  console.log("Selected Status:", selectedStatus);
  console.log("Selected Lecturer:", selectedLecturer);
  console.log("Enrolled Classes:", enrolledClasses);

  // Lọc lớp học theo trạng thái và giảng viên
  const filteredClasses = enrolledClasses.filter((c) => {
    const matchStatus = selectedStatus === 'All' || c.classStatus === selectedStatus;
    const matchLecturer = selectedLecturer === 'All' || c.lecturerName === selectedLecturer;
    return matchStatus && matchLecturer;
  });
  console.log("Filtered Classes:", filteredClasses);

  return (
    <Row gutter={[32, 0]} className="p-24">
      <Col xs={24} md={16}>
        <Typography.Title level={3} style={{fontWeight:'bolder', marginBottom: 16 }}>
          <BookOutlined /> Lớp đã đăng ký
        </Typography.Title>

        {/* Bộ lọc trạng thái và giảng viên */}
        <Row justify="space-between" align="middle" className="mb-16">
          <Space wrap>
            {/* Lọc theo trạng thái */}
            <div>
              <Typography.Text strong>Trạng thái:</Typography.Text>
              <Select
                style={{ width: 160, marginLeft: 8 }}
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                <Option value="All">Tất cả</Option>
                <Option value="Ongoing">Đang học</Option>
                <Option value="Completed">Đã hoàn thành</Option>
              </Select>
            </div>

            {/* Lọc theo giảng viên */}
            <div>
              <Typography.Text strong>Giảng viên:</Typography.Text>
              <Select
                style={{ width: 160, marginLeft: 8 }}
                value={selectedLecturer}
                onChange={handleLecturerChange}
              >
                <Option value="All">Tất cả</Option>
                {allLecturers.map((name) => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
        </Row>

        {/* Danh sách lớp học */}
        {loading ? (
          <Spin>
            <div style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Đang tải lớp đã đăng ký...
            </div>
          </Spin>
        ) : error ? (
          <Alert type="error" message={error} />
        ) : filteredClasses.length === 0 ? (
          <div>Không có lớp phù hợp.</div>
        ) : (
          <Row gutter={[0, 12]} justify="start">
            {filteredClasses.map((item) => (
              <Col xs={24} key={item.classID} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 800 }}>
                  <StudentTeacherClassCard
                    role="Student"
                    id={item.classID}
                    imageURL={item.imageURL}
                    className={item.className}
                    subjectName={item.subjectName}
                    lecturerName={item.lecturerName}
                    status={item.classStatus}
                    horizontal
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Col>

      <Col xs={24} md={8}>
        <EnrollSummary total={filteredClasses.length} />
      </Col>
    </Row>
  );
};

export default EnrollClass;
