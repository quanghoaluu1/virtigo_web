import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import dayjs from 'dayjs';
import UpdateLessonModal from './UpdateLessonModal';
import { useNavigate } from 'react-router-dom';

const LessonDetailModal = ({ open, lesson, onClose, onUpdate }) => {
  const [showUpdate, setShowUpdate] = useState(false);
  const navigate = useNavigate();

  let userRole = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user && user.role;
  } catch (e) {
    userRole = null;
  }

  const isManager = userRole === 'Manager';
  const isLecturer = userRole === 'Lecture';
  const isStudent = userRole === 'Student';

  const getLessonDetailPath = () => {
    if (isManager) return '/dashboard/lesson-detail';
    if (isLecturer) return '/lecturer/lesson-detail';
    if (isStudent) return '/student/lesson-detail';
    return '/dashboard/lesson-detail'; // default fallback
  };

  if (!lesson) return null;
  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title="Chi tiết buổi học"
      >
        <div style={{ marginBottom: 10, fontWeight: 600, fontSize: 16 }}>
         Môn: {lesson.subjectName} <span style={{ color: '#aaa', margin: '0 8px' }}>|</span> Giảng viên: {lesson.lectureName}
        </div>
        <div className="mb-10">
          <span className="font-medium">Thời gian:</span> {dayjs(lesson.startTime).format('HH:mm')} - {dayjs(lesson.endTime).format('HH:mm')}
        </div>
        <div className="mb-18">
          <span className="font-medium">Nội dung:</span> {lesson.lessonTitle}
        </div>
        {lesson.classLessonID && (
          <Button
            type="primary"
            className="mr-8"
            onClick={() => navigate(getLessonDetailPath(), { state: { lessonId: lesson.classLessonID } })}
          >
            Xem chi tiết tiết học
          </Button>
        )}
        {isManager && (
          <Button type="primary" onClick={() => setShowUpdate(true)} className="mt-8">
            Chỉnh sửa
          </Button>
        )}
      </Modal>
      <UpdateLessonModal
        open={showUpdate}
        lesson={lesson}
        onClose={() => setShowUpdate(false)}
        onUpdate={(updatedLesson) => {
          setShowUpdate(false);
          if (onUpdate) onUpdate(updatedLesson);
        }}
      />
    </>
  );
};

export default LessonDetailModal; 