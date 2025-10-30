import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Button, Typography, Image, Spin, Row, Col, Divider } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL } from '../../../../config/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOutlined, LinkOutlined, VideoCameraOutlined, CheckCircleTwoTone, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph, Link: AntLink } = Typography;

const LessonDetailPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const lessonId = props.lessonId || location.state?.lessonId;
  const [lesson, setLesson] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  let userRole = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user && user.role;
  } catch {
    userRole = null;
  }

  useEffect(() => {
    if (!lessonId) return;
    let isMounted = true;
    setLoading(true);
    axios.get(`${API_URL}api/Lesson/get-detail/${lessonId}`)
      .then(res => {
        if (isMounted) {
          setLesson(res.data.data);
          if (res.data.data && res.data.data.classID) {
            axios.get(`${API_URL}api/Class/get-by-id?id=${res.data.data.classID}`)
              .then(res2 => {
                if (isMounted) setClassInfo(res2.data);
              })
              .finally(() => setLoading(false));
          } else {
            setLoading(false);
          }
        }
      })
      .catch(() => setLoading(false));
    return () => { isMounted = false; };
  }, [lessonId]);

  const handleAttendanceClick = () => {
    if (userRole === 'Manager') {
      navigate('/dashboard/check-attendance', { state: { lessonId: lessonId } });
    } else if (userRole === 'Lecture') {
      navigate('/lecturer/check-attendance', { state: { lessonId: lessonId } });
    }
  };

  if (!lessonId) return <div style={{ textAlign: 'center', marginTop: 60, color: 'red' }}>Không tìm thấy lessonId!</div>;
  if (loading) return <div style={{ textAlign: 'center', marginTop: 60 }}><Spin size="large" /></div>;
  if (!lesson) return <div style={{ textAlign: 'center', marginTop: 60 }}>Không tìm thấy tiết học.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, minHeight: '100vh', boxSizing: 'border-box', background: '#fafcff' }}>
      <Card
        style={{ borderRadius: 16, boxShadow: '0 2px 12px #eee' }}
        bodyStyle={{ padding: 32 }}
        title={
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <BookOutlined style={{ color: '#1677ff' }} />
                {lesson.lessonTitle || 'Chi tiết tiết học'}
                <Tag color="blue" style={{ marginLeft: 8, fontSize: 16 }}>{lesson.className}</Tag>
              </Title>
            </Col>
            <Col>
              <Row gutter={12}>
                <Col>
                  {(userRole === 'Manager' || userRole === 'Lecture') && (
                    <Button
                      onClick={handleAttendanceClick}
                      size="large"
                      icon={<UserOutlined />}
                      style={{ fontWeight: 600 }}
                    >
                      Điểm danh
                    </Button>
                  )}
                </Col>
                <Col>
                  {lesson.linkMeetURL && (
                    <Button
                      type="primary"
                      href={lesson.linkMeetURL}
                      target="_blank"
                      size="large"
                      icon={<VideoCameraOutlined />}
                      style={{ fontWeight: 600, boxShadow: '0 2px 8px #1677ff22' }}
                    >
                      Vào lớp học
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        }
      >
        <Row gutter={32}>
          <Col xs={24} md={8}>
            {classInfo && classInfo.imageURL && (
              <Image src={classInfo.imageURL} alt="Ảnh lớp" width="100%" style={{ borderRadius: 12, marginBottom: 16 }} />
            )}
            {classInfo && (
              <div className="mb-16">
                <Title level={5} className="mb-8">Thông tin lớp</Title>
                <div><b>Tên lớp:</b> {classInfo.className}</div>
                <div><b>Sĩ số:</b> {lesson.numberStudentEnroll}</div>
              </div>
            )}
            {lesson.resources && (
              <div className="mb-16">
                <Tag color="gold" icon={<LinkOutlined />} style={{ fontSize: 15, padding: '6px 12px', fontWeight: 500, cursor: 'pointer' }}
                  onClick={() => {
                    const isUrl = /^https?:\/\//.test(lesson.resources);
                    if (isUrl) {
                      // If resources is a URL, open it in new tab
                      window.open(lesson.resources, '_blank');
                    } else {
                      // If resources is a lesson detail ID, navigate to appropriate preview page
                      if (userRole === 'Manager') {
                        navigate(`/dashboard/lesson-management/preview/${lesson.resources}`);
                      } else if (userRole === 'Lecture') {
                        navigate(`/lecturer/lesson-preview/${lesson.resources}`);
                      } else if (userRole === 'Student') {
                        navigate(`/student/lesson-preview/${lesson.resources}`);
                      } else {
                        navigate(`/lesson-preview/${lesson.resources}`);
                      }
                    }
                  }}
                >
                  <span style={{ color: '#b48800' }}>
                    Tài nguyên bài học
                  </span>
                </Tag>
              </div>
            )}
          </Col>
          <Col xs={24} md={16}>
            <Descriptions column={1} size="middle" className="mb-16">
              <Descriptions.Item label="Thời gian">
                {dayjs(lesson.dateTime).format('HH:mm')} - {dayjs(lesson.endTime).format('HH:mm')} | {dayjs(lesson.dateTime).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Giảng viên">{lesson.lecturerName}</Descriptions.Item>
              <Descriptions.Item label="Môn học">{lesson.subjectName}</Descriptions.Item>
              <Descriptions.Item label="Số học viên">{lesson.numberStudentEnroll}</Descriptions.Item>
              <Descriptions.Item label="Kiểm tra">
                {lesson.hasTest ? (
                  <Tag color="red" icon={<CheckCircleTwoTone twoToneColor="#faad14" />}>Có kiểm tra</Tag>
                ) : (
                  <Tag>Không</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={5}>Nội dung bài học</Title>
            <Paragraph className="mb-16">{lesson.content || <i>Chưa có nội dung</i>}</Paragraph>
            {/* {lesson.hasTest && (
              <div className="mt-24">
                <Button
                  type="primary"
                  ghost
                  href={`/test/${lesson.classLessonID}`}
                  target="_blank"
                  size="large"
                  icon={<CheckCircleTwoTone twoToneColor="#faad14" />}
                  style={{ fontWeight: 600 }}
                >
                  Xem kiểm tra
                </Button>
              </div>
            )} */}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LessonDetailPage; 