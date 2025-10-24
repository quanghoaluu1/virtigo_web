import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Card, Spin, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL } from '../../config/api';
import Notification from '../common/Notification';
import UpcomingLessonsSidebar from './UpcomingLessonsSidebar';
import LessonDetailModal from '../classes/detail/lesson/LessonDetailModal';

const { Title, Text } = Typography;

const TeachingSchedule = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success',
    message: '',
    description: ''
  });
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  useEffect(() => {
    fetchLecturerLessons();
  }, []);

  const fetchLecturerLessons = async () => {
    try {
      setLoading(true);
      let lecturerID = null;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        lecturerID = user && user.accountId;
      } catch (e) {
        lecturerID = null;
      }
      
      if (!lecturerID) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Lỗi',
          description: 'Không tìm thấy thông tin giảng viên'
        });
        return;
      }

      const response = await axios.get(`${API_URL}api/Lesson/get-by-lecturer?lecturerID=${lecturerID}`);
      console.log(response.data.data);
      if (response.data.success) {
        setLessons(response.data.data || []);
      } else {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Lỗi',
          description: response.data.message || 'Không thể tải lịch giảng dạy'
        });
      }
    } catch (error) {
      console.error('Error fetching lecturer lessons:', error);
      setNotification({
        visible: true,
        type: 'error',
        message: 'Lỗi',
        description: 'Không thể tải lịch giảng dạy'
      });
    } finally {
      setLoading(false);
    }
  };

  // Group lessons by date (YYYY-MM-DD)
  const lessonsByDate = React.useMemo(() => {
    const map = {};
    lessons.forEach(lesson => {
      const date = dayjs(lesson.startTime).format('YYYY-MM-DD');
      if (!map[date]) map[date] = [];
      map[date].push(lesson);
    });
    return map;
  }, [lessons]);

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayLessons = lessonsByDate[dateStr] || [];
    return (
      <ul className="list-none p-0 m-0">
        {dayLessons.map((lesson, idx) => (
          <li key={idx} className="mb-8">
            <span style={{ cursor: 'pointer' }} onClick={() => handleLessonClick(lesson)}>
              <Badge
                status="processing"
                text={
                  <span className="font-medium">
                    {dayjs(lesson.startTime).format('HH:mm')} - {dayjs(lesson.endTime).format('HH:mm')}
                  </span>
                }
              />
            </span>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spin size="large" />
        <div className="mt-16">Đang tải lịch giảng dạy...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification({ ...notification, visible: false })}
      />

      <div className="mb-24">
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <BookOutlined className="mr-8" />
          Lịch Giảng Dạy
        </Title>
        <Text type="secondary">
          Quản lý và theo dõi lịch giảng dạy của bạn
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Main Calendar */}
        <Card 
          title="Lịch giảng dạy theo tháng"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Calendar dateCellRender={dateCellRender} />
        </Card>

        {/* Sidebar */}
        <UpcomingLessonsSidebar lessons={lessons} />
      </div>
      <LessonDetailModal
        open={isLessonModalOpen}
        lesson={selectedLesson}
        onClose={() => setIsLessonModalOpen(false)}
      />
    </div>
  );
};

export default TeachingSchedule; 