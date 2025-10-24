import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Card } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import LessonDetailModal from './lesson/LessonDetailModal';

const fetchLessons = async (classId) => {
  const res = await axios.get(`${API_URL}api/Lesson/get-by-class/${classId}`);
  return res.data.data;
};

const MonthlyTimetableSection = ({ classId }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    fetchLessons(classId)
      .then(res => {
        setLessons(res);
      })
      .catch(() => setError('Không thể tải thời khóa biểu'))
      .finally(() => setLoading(false));
  }, [classId, reload]);

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

  const handleBadgeClick = (lesson) => {
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  const handleLessonUpdate = () => {
    setReload(r => r + 1);
    setModalOpen(false);
  };

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayLessons = lessonsByDate[dateStr] || [];
    return (
      <ul className="list-none p-0 m-0">
        {dayLessons.map((lesson, idx) => (
          <li key={idx} className="mb-8">
            <span onClick={() => handleBadgeClick(lesson)} style={{ cursor: 'pointer' }}>
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

  return (
    <div className="mb-16">
      <Card
        className="mb-16"
        bodyStyle={{ padding: collapsed ? 0 : 24 }}
        title={
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', fontWeight: 500, fontSize: 16, marginBottom: collapsed ? 0 : 16 }}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <span>Thời khóa biểu tháng</span>
            <span>{collapsed ? '▼' : '▲'}</span>
          </div>
        }
      >
        {!collapsed && (
          loading ? (
            <div className="p-24">Đang tải thời khóa biểu...</div>
          ) : error ? (
            <div style={{ padding: 24, color: 'red' }}>{error}</div>
          ) : (
            <Calendar cellRender={dateCellRender} />
          )
        )}
      </Card>
      <LessonDetailModal
        open={modalOpen}
        lesson={selectedLesson}
        onClose={() => setModalOpen(false)}
        onUpdate={handleLessonUpdate}
      />
    </div>
  );
};

export default MonthlyTimetableSection; 