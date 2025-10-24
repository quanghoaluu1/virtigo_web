import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Spin, Alert, Tooltip, Button, Modal } from 'antd';
import { LockOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const Syllabus = ({ classId }) => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [docModal, setDocModal] = useState({ open: false, content: '' });
  const [resourceMap, setResourceMap] = useState({});

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}api/Lesson/get-by-class/${classId}`);
        setLessons(res.data.data || []);
      } catch {
        setError('Không thể tải danh sách bài học.');
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchLessons();
  }, [classId]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${API_URL}api/Attendance/get-by-class-id/${classId}`);
        const user = JSON.parse(localStorage.getItem('user'));
        const studentId = user?.accountId;
        const map = {};
        (res.data.data.lessonAttendances || []).forEach(lesson => {
          const record = (lesson.studentAttendanceRecords || []).find(r => r.studentID === studentId);
          if (record) map[lesson.lessonID] = record.attendanceStatus;
        });
        setAttendanceMap(map);
      } catch {
        // Ignore errors for attendance
      }
    };
    if (classId) fetchAttendance();
  }, [classId]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${API_URL}api/SyllabusSchedule/ongoing-class/${classId}/schedules-basic`);
        const map = {};
        (res.data.data || []).forEach(item => {
          map[item.syllabusScheduleID] = item.resources;
        });
        setResourceMap(map);
      } catch {
        // Ignore errors for resources
      }
    };
    if (classId) fetchResources();
  }, [classId]);


  const attendanceStatusMap = {
    0: { text: 'Có mặt', color: '#52c41a', icon: <CheckCircleOutlined /> },
    1: { text: 'Vắng', color: '#ff4d4f', icon: <CloseCircleOutlined /> },
    2: { text: 'Chưa điểm danh', color: '#aaa', icon: <MinusCircleOutlined /> },
  };

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (error) return <Alert type="error" message={error} className="m-24" />;

  return (
    <>
      <Card bordered className="rounded-[18px]">
        <Typography.Title level={4} className="mb-16">Lịch học</Typography.Title>
        <List
          dataSource={lessons}
          locale={{ emptyText: 'Chưa có bài học.' }}
          renderItem={item => {
            return (
              <List.Item>
                <div className="w-full">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{item.lessonTitle}</span>
                    {(() => {
                      const att = attendanceStatusMap[attendanceMap[item.classLessonID]];
                      if (att) {
                        return (
                          <span style={{ color: att.color, fontWeight: 600, fontSize: 15 }}>
                            {att.icon} {att.text}
                          </span>
                        );
                      } else {
                        // return (
                        //   <span style={{ color: statusColor[status], fontWeight: 600, fontSize: 15 }}>
                        //     {statusIcon[status]} {statusText[status]}
                        //   </span>
                        // );
                      }
                    })()}
                  </div>
                  <div style={{ color: '#888', fontSize: 14 }}>
                    <Tooltip title={
                      <>
                        <div>Bắt đầu: {item.startTime ? new Date(item.startTime).toLocaleString('vi-VN') : '---'}</div>
                        <div>Kết thúc: {item.endTime ? new Date(item.endTime).toLocaleString('vi-VN') : '---'}</div>
                      </>
                    }>
                      {item.startTime ? `${new Date(item.startTime).toLocaleDateString('vi-VN')} ${new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Chưa có lịch'}
                      {item.endTime ? ` - ${new Date(item.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </Tooltip>
                  </div>
                  <div style={{ color: '#888', fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                    <span>
                      <b>Giáo Viên:</b> {item.lectureName}
                    </span>
                    <span style={{ flex: 0 }} />
                    {/* {item.linkMeetURL && (
                      <Button
                        type="primary"
                        size="small"
                        href={item.linkMeetURL}
                        target="_blank"
                        className="ml-16"
                      >
                        Meet
                      </Button>
                    )} */}
                    {(() => {
                      const resources = resourceMap[item.syllabusScheduleID];
                      if (resources && resources.trim() !== "") {
                        const isDocLink = /^https?:\/\//.test(resources);
                        return (
                          <Button
                            size="small"
                            style={{ marginLeft: 8 }}
                            type="primary"
                            onClick={() => {
                              console.log('Resources value:', resources);
                              console.log('Is URL?', isDocLink);
                              
                              if (isDocLink) {
                                // If resources is a URL, open it in new tab
                                console.log('Opening URL in new tab');
                                window.open(resources, '_blank');
                              } else {
                                // If resources is a lesson detail ID, navigate to public preview page
                                console.log('Navigating to:', `/lesson-preview/${resources}`);
                                navigate(`/lesson-preview/${resources}`);
                              }
                            }}
                          >
                           Chi tiết bài học
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </Card>
      <Modal
        open={docModal.open}
        onCancel={() => setDocModal({ open: false, content: '' })}
        footer={null}
        title="Tài liệu bài học"
      >
        <div style={{ whiteSpace: 'pre-wrap' }}>{docModal.content}</div>
      </Modal>
    </>
  );
};

export default Syllabus; 