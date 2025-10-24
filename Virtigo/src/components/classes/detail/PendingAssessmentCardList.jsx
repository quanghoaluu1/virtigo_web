import React, { useState } from 'react';
import { Card, Button, Form } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import AddAssessmentToTestEventComponent from './AddAssessmentToTestEventComponent';
import UpdateAssessmentOfTestEventComponent from './UpdateAssessmentOfTestEventComponent';
import Notification from '../../common/Notification';

// Enum mapping from AssessmentBasicForm
const TEST_CONTENT_OPTIONS = [
  { value: 'Vocabulary', label: 'Từ vựng' },
  { value: 'Grammar', label: 'Ngữ pháp' },
  { value: 'Listening', label: 'Nghe hiểu' },
  { value: 'Reading', label: 'Đọc hiểu' },
  { value: 'Writing', label: 'Viết' },
  { value: 'Mix', label: 'Tổng hợp' },
  { value: 'MCQ', label: 'Trắc nghiệm' },
  { value: 'Other', label: 'Khác' },
];
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
const CATEGORY_ENUM_MAP = {
  0: 'Quiz',
  2: 'Midterm',
  3: 'Final',
};

const PendingAssessmentCardList = ({ classId, assessments: initialAssessments, subjectId }) => {
  const [assessments, setAssessments] = useState(initialAssessments || []);
  const [notificationState, setNotificationState] = useState({ visible: false, type: 'success', message: '', description: '' });

  const total = assessments ? assessments.length : 0;
  const attached = assessments ? assessments.filter(a => a.testID).length : 0;
  const notAttached = total - attached;

  // Modal state
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalAddTestEvent, setModalAddTestEvent] = useState(null);
  const [modalUpdateOpen, setModalUpdateOpen] = useState(false);
  const [modalUpdateTestEvent, setModalUpdateTestEvent] = useState(null);
  const [addForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [selectedTestID, setSelectedTestID] = useState(null);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [attemptLimit, setAttemptLimit] = useState();
  const [password, setPassword] = useState('');
  const [form] = Form.useForm();
  const [modalAvailableTests, setModalAvailableTests] = useState([]);

  const handleOpenModal = async (assessment) => {
    setModalTestEvent(assessment);
    setModalOpen(true);
    setSelectedTestID(null);
    setDescription('');
    setAttemptLimit();
    setPassword('');
    // Nếu có lessonStartTime thì set luôn giá trị cho form
    if (assessment && assessment.lessonStartTime) {
      const lessonStart = dayjs(assessment.lessonStartTime);
      setStartDate(lessonStart);
      setStartTime(lessonStart);
      setEndTime(assessment.lessonEndTime ? dayjs(assessment.lessonEndTime) : null);
      form.setFieldsValue({
        startDate: lessonStart,
        startTime: lessonStart,
        endTime: assessment.lessonEndTime ? dayjs(assessment.lessonEndTime) : null,
      });
    } else {
      setStartDate(null);
      setStartTime(null);
      setEndTime(null);
      form.resetFields(["startDate", "startTime", "endTime"]);
    }
    form.resetFields(["testID", "description", "attemptLimit", "password"]);
  };

  // Hàm reload lại assessments sau khi thêm đề kiểm tra
  const reloadAssessments = async () => {
    try {
      const res = await axios.get(`${API_URL}api/TestEvent/get-by-class-id/${classId}`);
      setAssessments(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setAssessments([]);
    }
  };

  // Sửa lại phần Modal:
  return (
    <div>
      <Notification
        visible={notificationState.visible}
        type={notificationState.type}
        message={notificationState.message}
        description={notificationState.description}
        onClose={() => setNotificationState(prev => ({ ...prev, visible: false }))}
      />
      {/* <div style={{ textAlign: 'center', fontSize: 18, marginBottom: 12, fontWeight: 700, color: '#222' }}>
        Tổng số buổi kiểm tra: {total}
      </div> */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
          marginBottom: 6
        }}>
          <div style={{ flex: 1, textAlign: 'center', color: '#52c41a', fontWeight: 700, fontSize: 15 }}>
            Đã gắn đề
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: '#ff4d4f', fontWeight: 700, fontSize: 15 }}>
            Chưa gắn đề
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: 'gold', fontWeight: 700, fontSize: 15 }}>
            Tổng số
          </div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 8,
          padding: '8px 0',
        }}>
          <div style={{ flex: 1, textAlign: 'center', color: '#52c41a', fontWeight: 700, fontSize: 26 }}>
            {attached}
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: '#ff4d4f', fontWeight: 700, fontSize: 26 }}>
            {notAttached}
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: 'gold', fontWeight: 700, fontSize: 26 }}>
            {total}
          </div>
        </div>
      </div>
      {(!assessments || total === 0) ? (
        <div style={{ textAlign: 'center' }}>Không có buổi kiểm tra nào.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {assessments.map((assessment, idx) => {
            const testName = assessment.description || 'Chưa có đề kiểm tra';
            const hasQuestions = !!assessment.testID;
            let date = '';
            if (assessment.startAt) date = dayjs(assessment.startAt).format('DD/MM/YYYY');
            else if (assessment.endAt) date = dayjs(assessment.endAt).format('DD/MM/YYYY');
            let time = '';
            if (assessment.startAt && assessment.endAt) {
              time = `${dayjs(assessment.startAt).format('HH:mm')} - ${dayjs(assessment.endAt).format('HH:mm')}`;
            }
            let categoryLabel = '';
            if (assessment.assessmentCategory !== undefined && assessment.assessmentCategory !== null) {
              categoryLabel = CATEGORY_LABELS[assessment.assessmentCategory] || 'Không xác định';
            }
            let testTypeLabel = '';
            if (assessment.testType !== undefined && assessment.testType !== null) {
              testTypeLabel = TEST_TYPE_LABELS[assessment.testType] || 'Không xác định';
            }
            return (
              <Card
                key={assessment.testID || idx}
                style={{ width: 300, border: '1px solid #d9d9d9', borderRadius: 8 }}
                bodyStyle={{ padding: 16, background: '#fafbfc' }}
              >
                {!hasQuestions && (
                  <>
                    <div style={{ color: '#ff4d4f', fontWeight: 600, marginBottom: 8 }}>
                      Chưa có đề kiểm tra
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      className="mb-8"
                      onClick={() => {
                        setModalAddTestEvent(assessment);
                        setModalAddOpen(true);
                        // Nếu là đề thi cuối kì (final), set attemptLimit = 1
                        if (
                          assessment.assessmentCategory === 3 ||
                          assessment.category === 3
                        ) {
                          addForm.setFieldsValue({ attemptLimit: 1 });
                        }
                      }}
                    >
                      Thêm đề kiểm tra
                    </Button>
                  </>
                )}
                {hasQuestions && (
                  <>
                    <Button
                      type="default"
                      size="small"
                      style={{ marginBottom: 8, background: '#faad14', border: '1px solid #faad14', color: '#fff', transition: 'all 0.2s', marginRight: 8 }}
                      onMouseOver={e => e.currentTarget.style.background = '#ffd666'}
                      onMouseOut={e => e.currentTarget.style.background = '#faad14'}
                      onClick={() => {
                        const initialValues = {
                          testID: assessment.testID || undefined,
                          description: assessment.description || '',
                          startTime: assessment.startAt ? dayjs(assessment.startAt) : undefined,
                          endTime: assessment.endAt ? dayjs(assessment.endAt) : undefined,
                          attemptLimit: assessment.attemptLimit || 1,
                          password: assessment.password || '',
                        };
                        setModalUpdateTestEvent({ ...assessment, initialValues });
                        setModalUpdateOpen(true);
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      className="mb-8"
                      onClick={() => {
                        // Nếu có testEventID, chuyển hướng sang trang chi tiết bài test
                        if (assessment.testEventID) {
                          window.open(`/lecturer/view-test/${assessment.testEventID}`, '_blank');
                        }
                      }}
                      disabled={!assessment.testEventID}
                    >
                      Xem chi tiết
                    </Button>
                  </>
                )}
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {testName}
                </div>
                <div style={{ color: '#555', marginBottom: 8 }}>
                  <span role="img" aria-label="clock">🕒</span>
                  {' '}
                  {time}
                </div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
                  Ngày: <span>{date}</span>
                </div>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>
                  Loại: <b>{categoryLabel}</b>
                </div>
                <div style={{ fontSize: 13, color: '#333' }}>
                  Kĩ năng: <b>{testTypeLabel}</b>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {/* Modal thêm đề kiểm tra */}
      <AddAssessmentToTestEventComponent
        open={modalAddOpen}
        onCancel={() => setModalAddOpen(false)}
        onOk={async () => {
          try {
            const values = await addForm.validateFields();
            // Lấy lessonStartTime từ assessment
            const lessonStart = modalAddTestEvent?.lessonStartTime ? dayjs(modalAddTestEvent.lessonStartTime) : null;
            // Lấy lessonEndTime từ assessment
            const lessonEnd = modalAddTestEvent?.lessonEndTime ? dayjs(modalAddTestEvent.lessonEndTime) : null;
            // Ngày kiểm tra là lessonStart (chỉ 1 ngày)
            const date = lessonStart ? lessonStart.startOf('day') : null;
            // startAt = ngày lesson + giờ startTime (cộng thêm 7 giờ để lưu đúng giờ Việt Nam)
            const startAt = date && values.startTime ? date.hour(values.startTime.hour()).minute(values.startTime.minute()).add(7, 'hour') : null;
            // endAt = ngày lesson + giờ endTime (cộng thêm 7 giờ để lưu đúng giờ Việt Nam)
            const endAt = date && values.endTime ? date.hour(values.endTime.hour()).minute(values.endTime.minute()).add(7, 'hour') : null;
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
            await reloadAssessments();
          } catch (err) {
            let msg = 'Thêm bài kiểm tra không thành công!';
            if (err?.response?.data?.message) msg = err.response.data.message;
            else if (err?.message) msg = err.message;
            setNotificationState({ visible: true, type: 'error', message: msg });
          }
        }}
        availableTests={modalAvailableTests}
        form={addForm}
        endAt={endTime}
        loading={false}
        onTestChange={tid => setSelectedTestID(tid)}
        onDescriptionChange={e => setDescription(e.target.value)}
        onStartDateChange={date => setStartDate(date)}
        onStartTimeChange={time => setStartTime(time)}
        onEndTimeChange={time => setEndTime(time)}
        onAttemptLimitChange={e => {
          // Nếu là final thì không cho đổi
          if (
            modalAddTestEvent?.assessmentCategory === 3 ||
            modalAddTestEvent?.category === 3
          ) {
            addForm.setFieldsValue({ attemptLimit: 1 });
            setAttemptLimit(1);
            return;
          }
          setAttemptLimit(e.target.value);
        }}
        onPasswordChange={e => setPassword(e.target.value)}
        lessonStartTime={modalAddTestEvent?.lessonStartTime}
        lessonEndTime={modalAddTestEvent?.lessonEndTime}
        assessment={modalAddTestEvent}
        subjectId={subjectId}
        API_URL={API_URL}
        assessmentCategory={modalAddTestEvent?.assessmentCategory ?? modalAddTestEvent?.category}
        testType={modalAddTestEvent?.testType}
        onSuccess={reloadAssessments}
        initialValues={undefined}
      />
      {/* Modal cập nhật đề kiểm tra */}
      <UpdateAssessmentOfTestEventComponent
        open={modalUpdateOpen}
        onCancel={() => setModalUpdateOpen(false)}
        onOk={async () => {
          try {
            const values = await updateForm.validateFields();
            // Lấy lessonStartTime từ assessment
            const lessonStart = modalUpdateTestEvent?.lessonStartTime ? dayjs(modalUpdateTestEvent.lessonStartTime) : null;
            // Lấy lessonEndTime từ assessment
            const lessonEnd = modalUpdateTestEvent?.lessonEndTime ? dayjs(modalUpdateTestEvent.lessonEndTime) : null;
            // Ngày kiểm tra là lessonStart (chỉ 1 ngày)
            const date = lessonStart ? lessonStart.startOf('day') : null;
            // startAt = ngày lesson + giờ startTime (cộng thêm 7 giờ để lưu đúng giờ Việt Nam)
            const startAt = date && values.startTime ? date.hour(values.startTime.hour()).minute(values.startTime.minute()).add(7, 'hour') : null;
            // endAt = ngày lesson + giờ endTime (cộng thêm 7 giờ để lưu đúng giờ Việt Nam)
            const endAt = date && values.endTime ? date.hour(values.endTime.hour()).minute(values.endTime.minute()).add(7, 'hour') : null;
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
            await reloadAssessments();
            setNotificationState({ visible: true, type: 'success', message: 'Cập nhật đề kiểm tra thành công!' });
          } catch {
            setNotificationState({ visible: true, type: 'error', message: 'Cập nhật đề kiểm tra thất bại!' });
          }
        }}
        availableTests={modalAvailableTests}
        form={updateForm}
        endAt={endTime}
        loading={false}
        onTestChange={tid => setSelectedTestID(tid)}
        onDescriptionChange={e => setDescription(e.target.value)}
        onStartDateChange={date => setStartDate(date)}
        onStartTimeChange={time => setStartTime(time)}
        onEndTimeChange={time => setEndTime(time)}
        onAttemptLimitChange={e => setAttemptLimit(e.target.value)}
        onPasswordChange={e => setPassword(e.target.value)}
        lessonStartTime={modalUpdateTestEvent?.lessonStartTime}
        lessonEndTime={modalUpdateTestEvent?.lessonEndTime}
        assessment={modalUpdateTestEvent}
        subjectId={subjectId}
        API_URL={API_URL}
        assessmentCategory={modalUpdateTestEvent?.assessmentCategory ?? modalUpdateTestEvent?.category}
        testType={modalUpdateTestEvent?.testType}
        onSuccess={reloadAssessments}
        initialValues={modalUpdateTestEvent?.initialValues}
      />
    </div>
  );
};

export default PendingAssessmentCardList;