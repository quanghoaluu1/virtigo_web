import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Spin, Alert, Tag, Button, Table, message } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import AddAssessmentToTestEventComponent from '../../components/classes/detail/AddAssessmentToTestEventComponent';
import UpdateAssessmentOfTestEventComponent from '../../components/classes/detail/UpdateAssessmentOfTestEventComponent';
import { Form } from 'antd';
import Notification from '../../components/common/Notification';
import dayjs from 'dayjs';

const TestSchedule = ({ classId, subjectId }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTestEvent, setModalTestEvent] = useState(null);
  const [form] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

  // State cho 2 modal riêng biệt
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalAddTestEvent, setModalAddTestEvent] = useState(null);
  const [modalUpdateOpen, setModalUpdateOpen] = useState(false);
  const [modalUpdateTestEvent, setModalUpdateTestEvent] = useState(null);

  const [notification, setNotification] = useState({
    visible: false,
    type: 'success',
    message: '',
    description: ''
  });

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}api/TestEvent/get-by-class-id/${classId}`);
        setTests(res.data.data || []);
      } catch (err) {
        setError('Không thể tải lịch kiểm tra.');
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchTests();
  }, [classId]);

  // Lấy role từ localStorage
  let userRole = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user && user.role;
  } catch (e) {
    userRole = null;
  }

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (error) return <Alert type="error" message={error} className="m-24" />;

  // Hàm xác định trạng thái bài kiểm tra dựa trên thời gian
  const getVirtualStatus = (startAt, endAt) => {
    const now = new Date();
    if (!startAt || !endAt) return { text: 'Chưa có thời gian kiểm tra', color: 'orange' };
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (now < start) return { text: 'Sắp diễn ra', color: 'orange' };
    if (now >= start && now <= end) return { text: 'Đang diễn ra', color: 'green' };
    if (now > end) return { text: 'Đã kết thúc', color: 'red' };
    return { text: 'Không xác định', color: 'default' };
  };

  // Reload tests after add
  const reloadTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}api/TestEvent/get-by-class-id/${classId}`);
      setTests(res.data.data || []);
    } catch (err) {
      setError('Không thể tải lịch kiểm tra.');
    } finally {
      setLoading(false);
    }
  };

  // Enum mapping giống PendingAssessmentCardList
  const TEST_TYPE_LABELS = {
    0: 'Không xác định',
    1: 'Từ vựng',
    2: 'Ngữ pháp',
    3: 'Nghe hiểu',
    4: 'Đọc hiểu',
    5: 'Viết',
    6: 'Tổng hợp',
    7: 'Trắc nghiệm',
    8: 'Khác'
  };
  const CATEGORY_LABELS = {
    0: 'Đề kiểm tra đánh giá',
    2: 'Đề thi giữa kì',
    3: 'Đề thi cuối kì',
  };

  // Thêm hàm tiện ích để cộng 7 giờ (UTC+7)
  function toVNTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setHours(d.getHours() + 7);
    return d;
  }

  // Nếu là giảng viên, hiển thị tất cả bài kiểm tra ở dạng bảng
  if (userRole === 'Lecture') {
    const columns = [
      { title: 'Tên bài kiểm tra', dataIndex: 'description', key: 'description', render: (text) => <b>{text}</b> },
      { title: 'Loại', dataIndex: 'assessmentCategory', key: 'assessmentCategory', render: (cat) => CATEGORY_LABELS[cat] || 'Không xác định' },
      { title: 'Kĩ năng', dataIndex: 'testType', key: 'testType', render: (type) => TEST_TYPE_LABELS[type] || 'Không xác định' },
      { title: 'Tiết', dataIndex: 'lessonTitle', key: 'lessonTitle' },
      { title: 'Ngày', dataIndex: 'lessonStartTime', key: 'lessonStartTime', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '--' },
      { title: 'Giờ', dataIndex: 'lessonStartTime', key: 'lessonStartTime_time', render: (date) => date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--' },
      { title: 'Thời gian kiểm tra', key: 'testTime', render: (_, item) => item.startAt && item.endAt ? `${toVNTime(item.startAt).toLocaleString('vi-VN')} - ${toVNTime(item.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Chưa có thời gian kiểm tra' },
      { title: 'Trạng thái', key: 'status', render: (_, item) => { const status = getVirtualStatus(item.startAt, item.endAt); return <Tag color={status.color}>{status.text}</Tag>; } },
      { title: 'Thao tác', key: 'actions', align: 'center', render: (_, item) => {
          if (item.assessmentCategory === 2 || item.assessmentCategory === 3) {
            // Giữa kì hoặc cuối kì: chỉ cho xem
            return item.testID ? (
              <Button size="small" type="primary" onClick={() => navigate(`/lecturer/view-test/${item.testEventID}`)}>
                Xem chi tiết
              </Button>
            ) : (
              <span style={{ color: '#aaa' }}>Chỉ xem</span>
            );
          }
          // Đề kiểm tra đánh giá: cho thêm hoặc xem
          return item.testID ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Button
                size="small"
                type="primary"
                style={{ minWidth: 120, fontWeight: 500 }}
                onClick={() => navigate(`/lecturer/view-test/${item.testEventID}`)}
              >
                Xem chi tiết
              </Button>
              <Button
                size="small"
                type="default"
                onClick={() => {
                  // Chuẩn bị initialValues cho popup chỉnh sửa
                  const initialValues = {
                    testID: item.testID || undefined,
                    description: item.description || '',
                    startTime: item.startAt ? dayjs(toVNTime(item.startAt)) : undefined,
                    endTime: item.endAt ? dayjs(toVNTime(item.endAt)) : undefined,
                    attemptLimit: item.attemptLimit || 1,
                    password: item.password || '',
                  };
                  setModalUpdateTestEvent({ ...item, initialValues });
                  setModalUpdateOpen(true);
                }}
                style={{ minWidth: 120, fontWeight: 500 }}
              >
                Chỉnh sửa
              </Button>
            </div>
          ) : (
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                setModalAddTestEvent(item);
                setModalAddOpen(true);
              }}
            >
              Thêm bài kiểm tra
            </Button>
          );
        }
      },
    ];
    return (
      <>
        <Notification
          visible={notification.visible}
          type={notification.type}
          message={notification.message}
          description={notification.description}
          onClose={() => setNotification(n => ({ ...n, visible: false }))}
        />
        <Card bordered className="rounded-[18px]">
          <Typography.Title level={4} className="mb-16">Lịch kiểm tra</Typography.Title>
          <Table
            columns={columns}
            dataSource={tests.map((t, idx) => ({ ...t, key: t.testEventID || idx }))}
            pagination={false}
            locale={{ emptyText: 'Chưa có lịch kiểm tra.' }}
          />
        </Card>
        {/* Modal thêm đề kiểm tra */}
        <AddAssessmentToTestEventComponent
          open={modalAddOpen}
          onCancel={() => setModalAddOpen(false)}
          onOk={async () => {
            setModalLoading(true);
            try {
              const values = await form.validateFields();
              // Lấy lessonStartTime từ modalAddTestEvent
              const lessonStart = modalAddTestEvent?.lessonStartTime ? new Date(modalAddTestEvent.lessonStartTime) : null;
              const lessonEnd = modalAddTestEvent?.lessonEndTime ? new Date(modalAddTestEvent.lessonEndTime) : null;
              const date = lessonStart ? new Date(lessonStart.setHours(0,0,0,0)) : null;
              // startAt = ngày lesson + giờ startTime
              const startAt = date && values.startTime ? new Date(date.setHours(values.startTime.hour(), values.startTime.minute(), 0, 0)) : null;
              // endAt = ngày lesson + giờ endTime
              const endAt = date && values.endTime ? new Date(date.setHours(values.endTime.hour(), values.endTime.minute(), 0, 0)) : null;
              // BỎ ĐOẠN KIỂM TRA durationMinutes
              const body = {
                testEventIdToUpdate: modalAddTestEvent?.testEventID,
                testID: values.testID,
                description: values.description,
                startAt: startAt ? startAt.toISOString() : null,
                endAt: endAt ? endAt.toISOString() : null,
                attemptLimit: values.attemptLimit,
                password: values.password,
              };
              await axios.put(`${API_URL}api/TestEvent/configure`, body);
              // Gọi API update status testEvent thành Actived (1)
              if (modalAddTestEvent?.testEventID) {
                await axios.put(`${API_URL}api/TestEvent/update-status`, {
                  testEventIDToUpdate: modalAddTestEvent.testEventID,
                  status: 1
                });
              }
              setModalAddOpen(false);
              await reloadTests();
              setNotification({
                visible: true,
                type: 'success',
                message: 'Thêm đề kiểm tra thành công!',
                description: ''
              });
            } catch (err) {
              setNotification({
                visible: true,
                type: 'error',
                message: 'Thêm đề kiểm tra thất bại!',
                description: err?.message || ''
              });
            } finally {
              setModalLoading(false);
            }
          }}
          form={form}
          loading={modalLoading}
          lessonStartTime={modalAddTestEvent?.lessonStartTime}
          lessonEndTime={modalAddTestEvent?.lessonEndTime}
          assessment={modalAddTestEvent}
          subjectId={subjectId}
          assessmentCategory={modalAddTestEvent?.assessmentCategory ?? modalAddTestEvent?.category}
          testType={modalAddTestEvent?.testType}
          API_URL={API_URL}
          onSuccess={reloadTests}
          initialValues={undefined}
        />
        {/* Modal cập nhật đề kiểm tra */}
        <UpdateAssessmentOfTestEventComponent
          open={modalUpdateOpen}
          onCancel={() => setModalUpdateOpen(false)}
          onOk={async () => {
            setModalLoading(true);
            try {
              const values = await form.validateFields();
              // Lấy lessonStartTime từ modalUpdateTestEvent
              const lessonStart = modalUpdateTestEvent?.lessonStartTime ? new Date(modalUpdateTestEvent.lessonStartTime) : null;
              const lessonEnd = modalUpdateTestEvent?.lessonEndTime ? new Date(modalUpdateTestEvent.lessonEndTime) : null;
              const date = lessonStart ? new Date(lessonStart.setHours(0,0,0,0)) : null;
              // startAt = ngày lesson + giờ startTime
              const startAt = date && values.startTime ? new Date(date.setHours(values.startTime.hour(), values.startTime.minute(), 0, 0)) : null;
              // endAt = ngày lesson + giờ endTime
              const endAt = date && values.endTime ? new Date(date.setHours(values.endTime.hour(), values.endTime.minute(), 0, 0)) : null;
              // BỎ ĐOẠN KIỂM TRA durationMinutes
              const body = {
                testEventIdToUpdate: modalUpdateTestEvent?.testEventID,
                testID: values.testID,
                description: values.description,
                startAt: startAt ? startAt.toISOString() : null,
                endAt: endAt ? endAt.toISOString() : null,
                attemptLimit: values.attemptLimit,
                password: values.password,
              };
              await axios.put(`${API_URL}api/TestEvent/configure`, body);
              // Gọi API update status testEvent thành Actived (1)
              if (modalUpdateTestEvent?.testEventID) {
                await axios.put(`${API_URL}api/TestEvent/update-status`, {
                  testEventIDToUpdate: modalUpdateTestEvent.testEventID,
                  status: 1
                });
              }
              setModalUpdateOpen(false);
              await reloadTests();
              setNotification({
                visible: true,
                type: 'success',
                message: 'Cập nhật đề kiểm tra thành công!',
                description: ''
              });
            } catch (err) {
              setNotification({
                visible: true,
                type: 'error',
                message: 'Cập nhật đề kiểm tra thất bại!',
                description: err?.message || ''
              });
            } finally {
              setModalLoading(false);
            }
          }}
          form={form}
          loading={modalLoading}
          lessonStartTime={modalUpdateTestEvent?.lessonStartTime}
          lessonEndTime={modalUpdateTestEvent?.lessonEndTime}
          assessment={modalUpdateTestEvent}
          subjectId={subjectId}
          assessmentCategory={modalUpdateTestEvent?.assessmentCategory ?? modalUpdateTestEvent?.category}
          testType={modalUpdateTestEvent?.testType}
          API_URL={API_URL}
          onSuccess={reloadTests}
          initialValues={modalUpdateTestEvent?.initialValues}
        />
      </>
    );
  }

  // Nếu không phải giảng viên, chỉ hiển thị các bài kiểm tra có status=1 ở dạng List
  const filteredTests = tests.filter(t => t.status === 1);
  const sortedTests = [...filteredTests].sort((a, b) => {
    if (!a.lessonStartTime) return 1;
    if (!b.lessonStartTime) return -1;
    return new Date(a.lessonStartTime) - new Date(b.lessonStartTime);
  });

  return (
    <Card bordered className="rounded-[18px]">
      <Typography.Title level={4} className="mb-16">Lịch kiểm tra</Typography.Title>
      <List
        dataSource={sortedTests}
        locale={{ emptyText: 'Chưa có lịch kiểm tra.' }}
        renderItem={item => (
          <List.Item>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  {item.description || 'Bài kiểm tra'}
                </div>
                {item.lessonTitle && (
                  <div style={{ color: '#888', fontSize: 14 }}>
                    <b>Tiết:</b> {item.lessonTitle}
                    {item.lessonStartTime && (
                      <>
                        {' | '}
                        {new Date(item.lessonStartTime).toLocaleDateString('vi-VN')} {new Date(item.lessonStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </>
                    )}
                  </div>
                )}
                <div style={{ color: '#888', fontSize: 14 }}>
                  <b>Thời gian kiểm tra:</b> {' '}
                  {item.startAt && item.endAt
                    ? `${toVNTime(item.startAt).toLocaleString('vi-VN')} - ${toVNTime(item.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Chưa có thời gian kiểm tra'}
                </div>
                {(() => {
                  const status = getVirtualStatus(item.startAt, item.endAt);
                  return (
                    <span style={{
                      marginTop: 4,
                      fontWeight: 500,
                      color: status.color,
                      display: 'inline-block',
                      fontWeight: 'bold'
                    }}>
                      {status.text}
                    </span>
                  );
                })()}
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TestSchedule; 