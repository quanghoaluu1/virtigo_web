import React, { useState } from 'react';
import { Card, Typography, Badge } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import LessonDetailModal from '../classes/detail/lesson/LessonDetailModal';

const { Text } = Typography;

const UpcomingLessonsSidebar = ({ lessons }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getUpcomingLessons = () => {
    const now = dayjs();
    return lessons
      .filter(lesson => dayjs(lesson.startTime).isAfter(now))
      .sort((a, b) => dayjs(a.startTime) - dayjs(b.startTime))
      .slice(0, 5);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedLesson(null);
  };

  const handleLessonUpdate = () => {
    // Reload data if needed
    setModalOpen(false);
    setSelectedLesson(null);
  };

  const upcomingLessons = getUpcomingLessons();

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Statistics Card */}
        <Card title="Thống kê" size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Tổng số tiết học:</Text>
              <Text strong>{lessons.length}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Đã hoàn thành:</Text>
              <Text strong className="text-green-500">
                {lessons.filter(l => dayjs(l.endTime).isBefore(dayjs())).length}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Sắp diễn ra:</Text>
              <Text strong className="text-blue-500">
                {lessons.filter(l => dayjs(l.startTime).isAfter(dayjs())).length}
              </Text>
            </div>
          </div>
        </Card>

        {/* Upcoming Lessons */}
        <Card title="Tiết học sắp tới" size="small">
          {upcomingLessons.length === 0 ? (
            <Text type="secondary">Không có tiết học nào sắp tới</Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingLessons.map((lesson, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '8px', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '4px',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.borderColor = '#1890ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.borderColor = '#d9d9d9';
                  }}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <ClockCircleOutlined style={{ marginRight: 4, fontSize: 12 }} />
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>
                      {dayjs(lesson.startTime).format('HH:mm')} - {dayjs(lesson.endTime).format('HH:mm')}
                    </Text>
                  </div>
                  <Text style={{ fontSize: 11, color: '#1890ff', fontWeight: 500 }}>
                    {lesson.subjectName}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: '#666' }}>
                      Lớp: {lesson.classID}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#666' }}>
                      {dayjs(lesson.startTime).format('DD/MM')}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <LessonDetailModal
        open={modalOpen}
        lesson={selectedLesson}
        onClose={handleModalClose}
        onUpdate={handleLessonUpdate}
      />
    </>
  );
};

export default UpcomingLessonsSidebar; 