import React from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import LecturerClassList from '../../class/LecturerClassList';

const LecturerDashboard = () => {
  // Dữ liệu thống kê mẫu
  const stats = [
    { title: 'Tổng số học viên', value: 156, icon: <UserOutlined />, color: '#1890ff' },
    { title: 'Khóa học đang dạy', value: 8, icon: <BookOutlined />, color: '#52c41a' },
    { title: 'Lớp học sắp tới', value: 12, icon: <CalendarOutlined />, color: '#faad14' },
    { title: 'Bài tập chờ chấm', value: 24, icon: <FileTextOutlined />, color: '#f5222d' },
  ];

  // Dữ liệu hoạt động gần đây
  const recentActivities = [
    { key: '1', student: 'Nguyễn Văn A', course: 'Hangul Cơ bản', action: 'Nộp bài tập', time: '2 giờ trước' },
    { key: '2', student: 'Trần Thị B', course: 'Hangul Nâng cao', action: 'Hoàn thành bài kiểm tra', time: '3 giờ trước' },
    { key: '3', student: 'Lê Văn C', course: 'Viết Hangul', action: 'Đặt câu hỏi', time: '5 giờ trước' },
  ];

  const columns = [
    { title: 'Học viên', dataIndex: 'student', key: 'student' },
    { title: 'Khóa học', dataIndex: 'course', key: 'course' },
    { title: 'Hoạt động', dataIndex: 'action', key: 'action' },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
  ];

  return (
    <div className="lecturer-dashboard" style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', color: '#1a1a1a', fontWeight: 600 }}>Bảng Điều Khiển Giảng Viên</h2>
      
      {/* Thẻ thống kê */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              style={{
                borderRadius: '15px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
              }}
            >
              <Statistic
                title={<span className="text-gray-600 text-base">{stat.title}</span>}
                value={stat.value}
                prefix={React.cloneElement(stat.icon, { style: { color: stat.color } })}
                valueStyle={{ color: stat.color, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Các thao tác nhanh */}
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Thao tác nhanh</span>}
        style={{ 
          marginBottom: '24px',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Space size="middle">
          <Button type="primary" size="large" style={{ borderRadius: '8px' }}>
            Tạo khóa học mới
          </Button>
          <Button size="large" style={{ borderRadius: '8px' }}>
            Lên lịch lớp học
          </Button>
          <Button size="large" style={{ borderRadius: '8px' }}>
            Chấm điểm bài tập
          </Button>
          <Button size="large" style={{ borderRadius: '8px' }}>
            Xem báo cáo
          </Button>
        </Space>
      </Card>

      {/* Hoạt động gần đây */}
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Hoạt động gần đây</span>}
        style={{ 
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table
          columns={columns}
          dataSource={recentActivities}
          pagination={false}
          style={{ borderRadius: '8px' }}
        />
      </Card>

      <LecturerClassList />
    </div>
  );
};

export default LecturerDashboard; 