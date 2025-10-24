import React, { useEffect, useState } from 'react';
import { List, Card, Typography, Spin, Button, Empty } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ViewLessonsOfClass = ({ classId }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy role từ localStorage
  let userRole = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user && user.role;
  } catch (e) {
    userRole = null;
  }

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}api/Lesson/get-by-class/${classId}`);
        setLessons(res.data.data || []);
      } catch (err) {
        setError('Không thể tải danh sách bài học.');
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchLessons();
  }, [classId]);

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} size="large" />;
  if (error) return <div style={{ color: 'red', textAlign: 'center', margin: 24 }}>{error}</div>;
  if (!lessons.length) return <Empty description="Chưa có bài học nào cho lớp này." className="m-40" />;

  return (
    <div className="mt-32">
      <Title level={4} className="mb-24">Danh sách bài học</Title>
      <List
        grid={{ gutter: 24, column: 1 }}
        dataSource={lessons}
        renderItem={lesson => (
          <List.Item>
            <Card bordered>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={5} className="m-0">{lesson.lessonTitle}</Title>
                {userRole === 'Lecture' && (
                  <Button size="small" type="primary" className="ml-12" onClick={() => navigate('/lecturer/check-attendance', { state: { lessonId: lesson.classLessonID } })}>
                    Điểm danh
                  </Button>
                )}
              </div>
              <div><Text strong>Thời gian:</Text> {new Date(lesson.startTime).toLocaleString()} - {new Date(lesson.endTime).toLocaleString()}</div>
              <div><Text strong>Giảng viên:</Text> {lesson.lectureName}</div>
              <div><Text strong>Môn học:</Text> {lesson.subjectName}</div>
              {lesson.linkMeetURL && (
                <div className="mt-8">
                  <Button type="link" href="#" target="_blank">Chi tiết bài học</Button>
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ViewLessonsOfClass;
