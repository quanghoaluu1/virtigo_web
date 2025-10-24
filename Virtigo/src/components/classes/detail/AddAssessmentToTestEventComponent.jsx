import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, DatePicker, TimePicker, Spin, message, Button } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import ViewDetailAssessment from '../../assessments/ViewDetailAssessment';
import Notification from '../../common/Notification';

const AddAssessmentToTestEventComponent = ({
  open,
  onCancel,
  onOk,
  form,
  initialValues = {},
  endAt,
  loading,
  onTestChange,
  onDescriptionChange,
  onStartDateChange,
  onStartTimeChange,
  onAttemptLimitChange,
  onPasswordChange,
  lessonStartTime,
  lessonEndTime,
  assessment,
  subjectId,
  API_URL,
  onEndTimeChange,
  assessmentCategory,
  testType,
  onSuccess
}) => {
  // State cho danh sách bài test
  const [availableTests, setAvailableTests] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testNamesMap, setTestNamesMap] = useState({});

  // State cho giờ bắt đầu/kết thúc
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);

  // State cho modal xác nhận
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmValues, setConfirmValues] = useState(null);

  // State cho modal xem chi tiết bài test
  const [viewTestModalOpen, setViewTestModalOpen] = useState(false);
  const [viewTestID, setViewTestID] = useState(null);

  // State cho thông báo
  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });

  // State cho thời gian kiểm tra
  const [durationMinutes, setDurationMinutes] = useState(null);

  // Reset state khi popup đóng
  useEffect(() => {
    if (!open) {
      setViewTestModalOpen(false);
      setViewTestID(null);
    }
  }, [open]);

  // Reset lại form khi mở popup cho event mới
  useEffect(() => {
    if (open && assessment) {
      form.resetFields();
    }
  }, [open, assessment]);

  // Fetch danh sách bài test khi modal open và assessment thay đổi
  useEffect(() => {
    const fetchTests = async () => {
      if (!open) {
        setAvailableTests([]);
        return;
      }
      setTestLoading(true);
      try {
        const params = {
          category: assessmentCategory,
          subjectId: subjectId,
          testType: testType,
          status: 3,
        };
        console.log('API advanced-search params:', params);
        const res = await axios.get(`${API_URL}api/Test/advanced-search`, { params });
        console.log('API advanced-search result:', res.data);
        const tests = Array.isArray(res.data?.items) ? res.data.items : [];
        setAvailableTests(tests);
        // Nếu testName bị thiếu, fetch thêm từ API /api/Test/{testID}
        const missingNames = tests.filter(t => !t.testName && t.testID);
        if (missingNames.length > 0) {
          const namesMap = {};
          await Promise.all(missingNames.map(async t => {
            try {
              const res2 = await axios.get(`${API_URL}api/Test/${t.testID}`);
              if (res2.data && res2.data.testName) {
                namesMap[t.testID] = res2.data.testName;
              }
            } catch {}
          }));
          setTestNamesMap(prev => ({ ...prev, ...namesMap }));
        }
      } catch (err) {
        setAvailableTests([]);
        console.log('API advanced-search error:', err);
      } finally {
        setTestLoading(false);
      }
    };
    fetchTests();
  }, [open, assessmentCategory, testType, subjectId, API_URL]);

  // Khi mở modal, nếu có testEventID thì fetch durationMinutes
  useEffect(() => {
    if (open && assessment && assessment.testEventID && API_URL) {
      axios.get(`${API_URL}api/TestEvent/get-by-id/${assessment.testEventID}`)
        .then(res => {
          if (res.data && res.data.data && typeof res.data.data.durationMinutes === 'number') {
            setDurationMinutes(res.data.data.durationMinutes);
          } else {
            setDurationMinutes(null);
          }
        })
        .catch(() => setDurationMinutes(null));
    } else if (!open) {
      setDurationMinutes(null);
    }
  }, [open, assessment, API_URL]);

  // Lấy ngày lesson (chỉ cho chọn đúng ngày này)
  const lessonDate = lessonStartTime ? dayjs(lessonStartTime).startOf('day') : null;

  // Thêm prop xác định có phải final không
  const isFinal = assessmentCategory === 3;

  // Khi modal mở và là final, set attemptLimit = 1 cho form
  useEffect(() => {
    if (open && isFinal) {
      form.setFieldsValue({ attemptLimit: 1 });
    }
  }, [open, isFinal, form]);

  // Khi chọn giờ bắt đầu
  const handleStartTimeChange = (time) => {
    setSelectedStartTime(time);
    if (onStartTimeChange) onStartTimeChange(time);
    // Nếu giờ kết thúc hiện tại không hợp lệ, tự động cập nhật lại
    if (time && selectedEndTime) {
      const start = dayjs(time);
      const end = dayjs(selectedEndTime);
      if (end.diff(start, 'minute') < 15) {
        // Tính giờ kết thúc mới
        let newEnd = start.add(15, 'minute');
        // Nếu vượt quá lessonEndTime thì set null
        if (lessonEndTime && newEnd.isAfter(dayjs(lessonEndTime))) {
          setSelectedEndTime(null);
          if (onEndTimeChange) onEndTimeChange(null);
          form.setFieldsValue({ endTime: null });
        } else {
          setSelectedEndTime(newEnd);
          if (onEndTimeChange) onEndTimeChange(newEnd);
          form.setFieldsValue({ endTime: newEnd });
        }
      }
    }
  };

  // Khi chọn giờ kết thúc
  const handleEndTimeChange = (time) => {
    setSelectedEndTime(time);
    if (onEndTimeChange) onEndTimeChange(time);
  };

  // TimePicker: chỉ cho chọn giờ/phút hợp lệ
  const disabledStartTime = () => {
    if (!lessonStartTime || !lessonEndTime) return {};
    const start = dayjs(lessonStartTime);
    const end = dayjs(lessonEndTime).subtract(15, 'minute');
    return {
      disabledHours: () => {
        const arr = [];
        for (let i = 0; i < 24; i++) {
          if (i < start.hour() || i > end.hour()) arr.push(i);
        }
        return arr;
      },
      disabledMinutes: (selectedHour) => {
        let arr = [];
        if (selectedHour === start.hour()) {
          for (let i = 0; i < start.minute(); i++) arr.push(i);
        }
        if (selectedHour === end.hour()) {
          for (let i = end.minute() + 1; i < 60; i++) arr.push(i);
        }
        return arr;
      },
    };
  };
  const disabledEndTime = () => {
    if (!lessonStartTime || !lessonEndTime || !selectedStartTime) return {};
    const minEnd = dayjs(selectedStartTime).add(15, 'minute');
    const start = dayjs(lessonStartTime).add(15, 'minute');
    const end = dayjs(lessonEndTime);
    return {
      disabledHours: () => {
        const arr = [];
        for (let i = 0; i < 24; i++) {
          // Không cho chọn trước minEnd hoặc ngoài khoảng lessonEndTime
          if (i < minEnd.hour() || i > end.hour()) arr.push(i);
        }
        return arr;
      },
      disabledMinutes: (selectedHour) => {
        let arr = [];
        if (selectedHour === minEnd.hour()) {
          for (let i = 0; i < minEnd.minute(); i++) arr.push(i);
        }
        if (selectedHour === end.hour()) {
          for (let i = end.minute() + 1; i < 60; i++) arr.push(i);
        }
        return arr;
      },
    };
  };

  return (
    <>
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
      <Modal
        open={open}
        title="Thêm đề kiểm tra"
        onCancel={onCancel}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            // Validate giờ kết thúc phải sau giờ bắt đầu ít nhất 15 phút
            if (values.startTime && values.endTime) {
              const start = dayjs(values.startTime);
              const end = dayjs(values.endTime);
              if (end.diff(start, 'minute') < 15) {
                message.error('Giờ kết thúc phải sau giờ bắt đầu ít nhất 15 phút!');
                return;
              }
            }
            setConfirmValues(values);
            setConfirmVisible(true);
          } catch (err) {
            // Form validate lỗi, không làm gì
          }
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" initialValues={initialValues}>
          {/* Hiển thị thời gian kiểm tra nếu có */}
          {durationMinutes !== null && (
            <div style={{ marginBottom: 12, color: 'red', fontWeight: 600 }}>
              Thời gian kiểm tra của tiết này là: {durationMinutes} phút
            </div>
          )}
          <Form.Item
            label="Chọn bài kiểm tra"
            name="testID"
            rules={[{ required: true, message: 'Vui lòng chọn bài kiểm tra' }]}
          >
            {testLoading ? (
              <Spin size="small" style={{ display: 'block', margin: '8px auto' }} />
            ) : (
              <div className="flex items-center gap-8">
                <Select
                  placeholder="Chọn bài test"
                  notFoundContent="Hiện tại không có bài kiểm tra phù hợp"
                  value={form.getFieldValue('testID')}
                  onChange={value => {
                    onTestChange && onTestChange(value);
                    setViewTestID(value);
                    form.setFieldsValue({ testID: value });
                  }}
                  style={{ flex: 1 }}
                >
                  {availableTests.map(test => (
                    <Select.Option key={test.testID} value={test.testID}>
                      {test.testName || testNamesMap[test.testID] || test.testID}
                    </Select.Option>
                  ))}
                </Select>
                {viewTestID && (
                  <Button type="link" onClick={() => setViewTestModalOpen(true)} className="p-0">
                    Xem chi tiết bài test
                  </Button>
                )}
              </div>
            )}
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} onChange={onDescriptionChange} />
          </Form.Item>
          <Form.Item label="Ngày kiểm tra" required>
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              value={lessonDate}
              disabled
            />
          </Form.Item>
          <Form.Item label="Giờ bắt đầu" name="startTime" rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}> 
            <TimePicker
              className="w-full"
              format="HH:mm"
              onChange={handleStartTimeChange}
              disabledTime={disabledStartTime}
              minuteStep={5}
            />
          </Form.Item>
          <Form.Item label="Giờ kết thúc" name="endTime" rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}> 
            <TimePicker
              className="w-full"
              format="HH:mm"
              onChange={handleEndTimeChange}
              disabledTime={disabledEndTime}
              minuteStep={5}
            />
          </Form.Item>
          <Form.Item label="Số lần học sinh làm bài" name="attemptLimit" rules={[{ required: true, message: 'Nhập số lần học sinh được phép làm bài' }]}> 
            <Input
              type="number"
              min={1}
              onChange={onAttemptLimitChange}
              disabled={isFinal}
              value={isFinal ? 1 : undefined}
              style={isFinal ? { background: '#f5f5f5', color: '#222', fontWeight: 600, cursor: 'not-allowed' } : {}}
              title={isFinal ? 'Đề thi cuối kì chỉ được phép làm 1 lần' : undefined}
            />
          </Form.Item>
          <Form.Item label="Mật khẩu cho bài kiểm tra" name="password"> 
            <Input onChange={onPasswordChange} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal xác nhận thông tin nhập */}
      <Modal
        open={confirmVisible}
        title="Xác nhận thông tin bài kiểm tra"
        onCancel={() => setConfirmVisible(false)}
        onOk={async () => {
          if (onOk) {
            setConfirmVisible(false); // Đóng modal xác nhận NGAY LẬP TỨC
            try {
              await onOk();
              if (onCancel) onCancel();
              if (onSuccess) onSuccess();
            } catch (err) {
              let msg = 'Thêm bài kiểm tra không thành công!';
              if (err?.response?.data?.message) msg = err.response.data.message;
              else if (err?.message) msg = err.message;
              setNotification({ visible: true, type: 'error', message: msg });
            }
          }
        }}
        okText="Xác nhận"
        cancelText="Quay lại"
      >
        {confirmValues && (
          <div style={{ lineHeight: 2 }}>
            <div><b>Bài test:</b> {
              availableTests.find(t => t.testID === confirmValues.testID)?.testName
              || testNamesMap[confirmValues.testID]
              || confirmValues.testID
            }</div>
            <div><b>Mô tả:</b> {confirmValues.description}</div>
            <div><b>Ngày kiểm tra:</b> {lessonDate ? lessonDate.format('DD/MM/YYYY') : ''}</div>
            <div><b>Giờ bắt đầu:</b> {confirmValues.startTime ? dayjs(confirmValues.startTime).format('HH:mm') : ''}</div>
            <div><b>Giờ kết thúc:</b> {confirmValues.endTime ? dayjs(confirmValues.endTime).format('HH:mm') : ''}</div>
            <div><b>Số lần học sinh làm bài:</b> {confirmValues.attemptLimit}</div>
            <div><b>Password:</b> {confirmValues.password}</div>
          </div>
        )}
        <div style={{ marginTop: 16, fontWeight: 600, color: '#1677ff' }}>
          Bạn có xác nhận thêm bài kiểm tra không?
        </div>
      </Modal>
      {/* Modal xem chi tiết bài test */}
      <Modal
        open={viewTestModalOpen}
        title="Chi tiết bài kiểm tra"
        onCancel={() => setViewTestModalOpen(false)}
        footer={null}
        width={900}
      >
        {viewTestID && <ViewDetailAssessment testID={viewTestID} inModal />}
      </Modal>
    </>
  );
};

export default AddAssessmentToTestEventComponent;
