import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Select, Card, Typography, message, Input } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL } from '../../../../config/api';
import Notification from '../../../common/Notification';

const { Text } = Typography;

const UpdateLessonModal = ({ open, lesson, onClose, onUpdate }) => {
  const [form] = Form.useForm();
  const [lecturers, setLecturers] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [teachingSchedulesDetail, setTeachingSchedulesDetail] = useState([]);
  const [notify, setNotify] = useState({ visible: false, type: 'success', message: '' });

  useEffect(() => {
    if (open) {
      setLoadingLecturers(true);
      axios.get(`${API_URL}api/Account/get-by-role-actived?role=1`)
        .then(res => {
          setLecturers(res.data || []);
        })
        .catch(() => setLecturers([]))
        .finally(() => setLoadingLecturers(false));
    }
  }, [open]);

  useEffect(() => {
    if (lesson) {
      form.setFieldsValue({
        lecturerID: lesson.lectureID,
        startTime: lesson.startTime ? dayjs(lesson.startTime) : null,
        lecturerName: lesson.lectureName || '',
      });
      const found = lecturers.find(l => l.accountID === lesson.lectureID);
      setSelectedLecturer(found || null);
      // Fetch lịch dạy chi tiết nếu có lecturerID
      if (lesson.lectureID) {
        fetchTeachingScheduleDetail(lesson.lectureID);
      }
    } else {
      form.resetFields();
      setSelectedLecturer(null);
      setTeachingSchedulesDetail([]);
    }
    // eslint-disable-next-line
  }, [lesson, form, lecturers]);

  const fetchTeachingScheduleDetail = async (accountID) => {
    try {
      const response = await axios.get(`${API_URL}api/Account/teaching-schedule-detail/${accountID}`);
      if (response.data.success) {
        setTeachingSchedulesDetail(response.data.data);
        console.log(response.data.data);
      } else {
        setTeachingSchedulesDetail([]);
      }
    } catch (error) {
      setTeachingSchedulesDetail([]);
      message.error('Không thể lấy lịch dạy của giảng viên');
    }
  };

  // Trả về object nếu trùng, null nếu hợp lệ
  const getConflictSchedule = (date) => {
    if (!date || !teachingSchedulesDetail?.length) return null;
    const selectedDate = dayjs(date);
    return teachingSchedulesDetail.find(schedule => {
      const scheduleDate = dayjs(schedule.teachingDay);
      if (!selectedDate.isSame(scheduleDate, 'day')) return false;
      const selectedTime = selectedDate;
      const scheduleStart = dayjs(`${schedule.teachingDay} ${schedule.startTime}`);
      const scheduleEnd = dayjs(`${schedule.teachingDay} ${schedule.endTime}`);
      return (
        selectedTime.isSame(scheduleStart) ||
        (selectedTime.isAfter(scheduleStart) && selectedTime.isBefore(scheduleEnd))
      );
    }) || null;
  };

  const handleLecturerChange = (value) => {
    const lecturer = lecturers.find(lec => lec.accountID === value);
    if (lecturer) {
      const fullName = `${lecturer.lastName} ${lecturer.firstName}`;
      setSelectedLecturer(lecturer);
      form.setFieldsValue({ lecturerID: value, lecturerName: fullName });
      fetchTeachingScheduleDetail(value);
    } else {
      setTeachingSchedulesDetail([]);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        classLessonID: lesson.classLessonID,
        lecturerID: values.lecturerID,
        startTime: values.startTime ? values.startTime.format('YYYY-MM-DDTHH:mm:ss') : lesson.startTime,
      };
      const res = await axios.put(`${API_URL}api/Lesson/update`, payload);
      console.log(res.data);
      if (res.data && res.data.success) {
        setNotify({ visible: true, type: 'success', message: res.data.message || 'Cập nhật thành công!' });
        onUpdate && onUpdate({ ...lesson, ...payload });
        onClose();
      } else {
        setNotify({ visible: true, type: 'error', message: res.data.message || 'Cập nhật thất bại!' });
      }
    } catch (err) {
      setNotify({ visible: true, type: 'error', message: err?.response?.data?.message || 'Cập nhật thất bại!' });
    }
  };

  return (
    <>
      <Notification
        visible={notify.visible}
        type={notify.type}
        message={notify.message}
        onClose={() => setNotify({ ...notify, visible: false })}
      />
      <Modal
        open={open}
        onCancel={onClose}
        onOk={handleOk}
        title="Cập nhật buổi học"
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Giảng viên" name="lecturerID" rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}> 
            <Select
              loading={loadingLecturers}
              placeholder="Chọn giảng viên"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              onChange={handleLecturerChange}
            >
              {lecturers.map(lec => (
                <Select.Option key={lec.accountID} value={lec.accountID}>
                  {lec.lastName + ' ' + lec.firstName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {selectedLecturer && (
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6f8fa' }}>
              <div className="flex items-center gap-8">
                <Text strong>Giảng viên:</Text>
                <Text>{selectedLecturer.lastName} {selectedLecturer.firstName}</Text>
                {selectedLecturer.email && (
                  <>
                    <Text type="secondary">|</Text>
                    <Text type="secondary">{selectedLecturer.email}</Text>
                  </>
                )}
              </div>
            </Card>
          )}
          <Form.Item name="lecturerName" hidden>
            <Input />
          </Form.Item>
          <Form.Item 
            label="Thời gian bắt đầu" 
            name="startTime" 
            rules={[ 
              { required: true, message: 'Vui lòng chọn thời gian bắt đầu' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (dayjs(value).isBefore(dayjs(), 'minute')) {
                    return Promise.reject('Không được chọn ngày trong quá khứ!');
                  }
                  const conflict = getConflictSchedule(value);
                  if (conflict) {
                    return Promise.reject(`Trùng với lịch dạy: ${conflict.startTime} - ${conflict.endTime} ngày ${dayjs(conflict.teachingDay).format('DD/MM/YYYY')}`);
                  }
                  return Promise.resolve();
                }
              }
            ]}
          > 
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm" 
              className="w-full" 
              disabledDate={(current) => current && current < dayjs().startOf('day')} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateLessonModal; 