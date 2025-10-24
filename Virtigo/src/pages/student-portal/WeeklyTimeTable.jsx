import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Button, Spin, Typography, Card, Row, Col, Tag, Layout } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { API_URL } from '../../config/api';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import HeaderBar from '../../components/header/Header';  
import FooterBar from '../../components/footer/Footer';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import LessonDetailModal from '../../components/classes/detail/lesson/LessonDetailModal';
dayjs.locale('vi');
const { Title } = Typography;
const { Sider, Content } = Layout;

// Lấy thứ trong tuần (Thứ 2 = 1, Chủ nhật = 7)
const weekDays = [
  'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'
];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

function getSunday(monday) {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  return d;
}

function getWeekRange(date) {
  const monday = getMonday(date);
  const sunday = getSunday(monday);
  return {
    start: dayjs(monday).startOf('day'),
    end: dayjs(sunday).endOf('day'),
  };
}

const WeeklyTimeTable = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekIndex, setWeekIndex] = useState(0); // 0: tuần hiện tại, -1: tuần trước, +1: tuần sau
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const simple = params.get('simple') === 'true';

  useEffect(() => {
    const student = JSON.parse(localStorage.getItem('user'));
    const studentId = student?.accountId;
    if (!studentId) return;
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}api/Lesson/get-by-student?studentID=${studentId}`);
        setLessons(res.data.data || []);
      } catch (err) {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

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

  // Tính tuần đang chọn
  const currentMonday = useMemo(() => {
    const today = new Date();
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + weekIndex * 7);
    return monday;
  }, [weekIndex]);

  const weekRange = getWeekRange(currentMonday);

  // Group lessons theo ngày trong tuần đang chọn
  const lessonsByDay = useMemo(() => {
    const byDay = {};
    for (let i = 0; i < 7; i++) {
      const date = dayjs(weekRange.start).add(i, 'day').format('YYYY-MM-DD');
      byDay[date] = [];
    }
    lessons.forEach(lesson => {
      const lessonDate = dayjs(lesson.startTime).format('YYYY-MM-DD');
      if (byDay[lessonDate]) {
        byDay[lessonDate].push(lesson);
      }
    });
    return byDay;
  }, [lessons, weekRange]);

  if (loading) return <Spin size="large" style={{ margin: '80px auto', display: 'block' }} />;

  if (simple) {
    return (
      <>
        <HeaderBar />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Thời khóa biểu của bạn</Title>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Button icon={<LeftOutlined />} onClick={() => setWeekIndex(weekIndex - 1)} className="mr-16" />
            <span style={{ fontSize: 18, fontWeight: 500 }}>
              Tuần: {weekRange.start.format('DD/MM/YYYY')} - {weekRange.end.format('DD/MM/YYYY')}
            </span>
            <Button icon={<RightOutlined />} onClick={() => setWeekIndex(weekIndex + 1)} className="ml-16" />
          </div>
          <Card style={{ boxShadow: '0 2px 12px #eee' }}>
            <Row gutter={8} style={{ background: '#fafbfc', borderRadius: 8, padding: 8 }}>
              {weekDays.map((day, idx) => {
                const date = dayjs(weekRange.start).add(idx, 'day');
                return (
                  <Col key={day} span={24/7} style={{ minWidth: 120 }}>
                    <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 8 }}>{day}</div>
                    <div style={{ textAlign: 'center', color: '#888', marginBottom: 8, fontSize: 13 }}>{date.format('DD/MM')}</div>
                    <div className="min-h-[90px]">
                      {lessonsByDay[date.format('YYYY-MM-DD')] && lessonsByDay[date.format('YYYY-MM-DD')].length > 0 ? (
                        lessonsByDay[date.format('YYYY-MM-DD')].map(lesson => (
                          <Card key={lesson.classLessonID} size="small" style={{ marginBottom: 8, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                            <div className="font-medium">{lesson.subjectName}</div>
                            <div style={{ fontSize: 13, color: '#555' }}>
                              {dayjs(lesson.startTime).format('HH:mm')} - {dayjs(lesson.endTime).format('HH:mm')}
                            </div>
                            <div>
                              <Tag 
                                color="blue" 
                                style={{ marginTop: 4, cursor: 'pointer' }}
                                onClick={() => handleLessonClick(lesson)}
                              >
                                Vào lớp
                              </Tag>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div style={{ color: '#bbb', fontSize: 13, marginTop: 24 }}>Không có</div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </div>
        <FooterBar />
        <LessonDetailModal
          open={modalOpen}
          lesson={selectedLesson}
          onClose={handleModalClose}
          onUpdate={handleLessonUpdate}
        />
      </>
    );
  }

  // Layout với Sidebar bên trái, nội dung bên phải
  return (
    <Layout className="min-h-screen">
      {/* <Sidebar /> */}
      <Layout>
        <Content style={{ background: '#fff', minHeight: '100vh' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Thời khóa biểu của bạn</Title>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Button icon={<LeftOutlined />} onClick={() => setWeekIndex(weekIndex - 1)} className="mr-16" />
              <span style={{ fontSize: 18, fontWeight: 500 }}>
                Tuần: {weekRange.start.format('DD/MM/YYYY')} - {weekRange.end.format('DD/MM/YYYY')}
              </span>
              <Button icon={<RightOutlined />} onClick={() => setWeekIndex(weekIndex + 1)} className="ml-16" />
            </div>
            <Card style={{ boxShadow: '0 2px 12px #eee' }}>
              <Row gutter={8} style={{ background: '#fafbfc', borderRadius: 8, padding: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
                {weekDays.map((day, idx) => {
                  const date = dayjs(weekRange.start).add(idx, 'day');
                  return (
                    <Col key={day} flex={1} style={{ minWidth: 120, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 8 }}>{day}</div>
                      <div style={{ textAlign: 'center', color: '#888', marginBottom: 8, fontSize: 13 }}>{date.format('DD/MM')}</div>
                      <div style={{ minHeight: 90, flex: 1 }}>
                        {lessonsByDay[date.format('YYYY-MM-DD')] && lessonsByDay[date.format('YYYY-MM-DD')].length > 0 ? (
                          lessonsByDay[date.format('YYYY-MM-DD')].map(lesson => (
                            <Card key={lesson.classLessonID} size="small" style={{ marginBottom: 8, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                              <div className="font-medium">{lesson.subjectName}</div>
                              <div style={{ fontSize: 13, color: '#555' }}>
                                {dayjs(lesson.startTime).format('HH:mm')} - {dayjs(lesson.endTime).format('HH:mm')}
                              </div>
                              <div>
                                <Tag 
                                  color="blue" 
                                  style={{ marginTop: 4, cursor: 'pointer' }}
                                  onClick={() => handleLessonClick(lesson)}
                                >
                                  Vào lớp
                                </Tag>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div style={{ color: '#bbb', fontSize: 13, marginTop: 24 }}>Không có</div>
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </div>
        </Content>
      </Layout>
      <LessonDetailModal
        open={modalOpen}
        lesson={selectedLesson}
        onClose={handleModalClose}
        onUpdate={handleLessonUpdate}
      />
    </Layout>
  );
};

export default WeeklyTimeTable;
