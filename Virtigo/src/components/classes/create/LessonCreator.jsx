import React, { useState, useRef, useEffect  } from 'react';
import { Form, TimePicker, Checkbox, DatePicker, Card, Typography, Input, Select } from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import axios from 'axios';
import { API_URL } from '../../../config/api';

const { Text } = Typography;

const weekDays = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];

const LessonCreator = React.forwardRef(({ formData = {}, onChange, maxDaysPerWeek = 3, lectures = [], onLecturerChange, subjectID }, ref) => {
  const [form] = Form.useForm();
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [minDaysBeforeStart, setMinDaysBeforeStart] = useState(0);
  const [availableLecturers, setAvailableLecturers] = useState([]);
  const [lecturerLoading, setLecturerLoading] = useState(false);

  const initialLessonTime = formData.teachingStartTime
    ? dayjs(formData.teachingStartTime).format('HH:mm')
    : null;

  useEffect(() => {
    if (initialLessonTime) {
      form.setFieldsValue({
        lessonTime: dayjs(initialLessonTime, 'HH:mm'),
      });
    }
  }, [initialLessonTime]);

  useEffect(() => {
    if (formData.accountID && lectures.length > 0) {
      const lecturer = lectures.find(lec => lec.accountID === formData.accountID);
      if (lecturer) {
        const fullName = `${lecturer.lastName} ${lecturer.firstName}`;
        setSelectedLecturer(lecturer);
        form.setFieldsValue({ lecturerName: fullName });
        handleValuesChange(null, { 
          ...form.getFieldsValue(), 
          lecturerName: fullName 
        });
      }
    }
  }, [formData.accountID, lectures]);

  useEffect(() => {
    axios.get(`${API_URL}api/SystemConfig/get-config-by-key/min_days_before_class_start_for_creation`)
      .then(res => {
        const value = parseInt(res.data.data.value, 10);
        setMinDaysBeforeStart(isNaN(value) ? 0 : value);
      })
      .catch(() => setMinDaysBeforeStart(0));
  }, []);

  const canFetchLecturers = (values) => {
    return !!(
      values.teachingStartTime &&
      values.lessonTime &&
      Array.isArray(values.weekDays) &&
      values.weekDays.length === maxDaysPerWeek &&
      subjectID
    );
  };

  const fetchAvailableLecturers = async (values) => {
    setLecturerLoading(true);
    setAvailableLecturers([]);
    try {
      const teachingStartTime = new Date(values.teachingStartTime);
      teachingStartTime.setHours(teachingStartTime.getHours() + 7);
      const params = new URLSearchParams();
      params.append('SubjectID', subjectID);
      params.append('DateStart', teachingStartTime.toISOString());
      params.append('Time', dayjs(values.lessonTime).format('HH:mm:ss'));
      values.weekDays.forEach(day => params.append('dayOfWeeks', day));

      const res = await axios.get(
        `${API_URL}api/Account/get-lecturer-free?${params.toString()}`
      );
      setAvailableLecturers(res.data.data || []);
    } catch (e) {
      // Log lỗi
      if (e.response) {
        console.log("Lecture free response (error):", JSON.stringify(e.response.data, null, 2));
      } else {
        console.log("Lecture free response (error):", e);
      }
      setAvailableLecturers([]);
    } finally {
      setLecturerLoading(false);
    }
  };

  const handleValuesChange = (_, allValues) => {
    const teachingStartTimeISO = dayjs(allValues.teachingStartTime).format('YYYY-MM-DDTHH:mm:ss');
    console.log('teachingStartTime ISO:', teachingStartTimeISO);
  
    if (allValues.weekDays?.length > maxDaysPerWeek) {
      allValues.weekDays = allValues.weekDays.slice(0, maxDaysPerWeek);
    }
    if (!canFetchLecturers(allValues)) {
      form.setFieldsValue({ accountID: undefined, lecturerName: undefined });
      setSelectedLecturer(null);
      setAvailableLecturers([]);
    } else {
      fetchAvailableLecturers(allValues);
    }
    if (allValues.accountID && onLecturerChange) {
      onLecturerChange(allValues.accountID);
    }
    onChange && onChange(allValues);
  };

 
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...formData,
        teachingStartTime: formData.teachingStartTime
          ? dayjs(formData.teachingStartTime)
          : null,
        lessonTime: initialLessonTime ? dayjs(initialLessonTime, 'HH:mm') : null,
      }}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label="Dự kiến ngày học chính thức"
        name="teachingStartTime"
        rules={[
          { required: true, message: 'Vui lòng chọn ngày học chính thức!' },
          { 
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              return Promise.resolve();
            }
          }
        ]}
        extra={`Chỉ được chọn từ ngày hiện tại + ${minDaysBeforeStart} ngày trở lên`}
      >
        <DatePicker 
          showTime
          className="w-full" 
          placeholder="Chọn ngày học chính thức"
          format="DD/MM/YYYY HH:mm"
          disabledDate={(current) => {
            if (!current) return false;
            return current < dayjs().add(minDaysBeforeStart, 'day').startOf('day');
          }}
        />
      </Form.Item>

      <Form.Item
        label="Giờ học"
        name="lessonTime"
        rules={[
          {
            validator: (_, value) => {
              if (!value) {
                return Promise.reject('Vui lòng chọn giờ học!');
              }
              return Promise.resolve();
            },
          },
        ]}
        extra="Giữ nguyên giờ học theo giờ khai giảng để đảm bảo lịch học ổn định, trừ khi tiết đầu là buổi giới thiệu."
      >
        <TimePicker format="HH:mm" className="w-full" minuteStep={5} />
      </Form.Item>

      <Form.Item
        label={`Chọn các thứ trong tuần sẽ học (chọn chính xác ${maxDaysPerWeek} ngày)`}
        name="weekDays"
        dependencies={['lessonTime']}
        rules={[
          {
            validator: (_, value) => {
              const lessonTime = form.getFieldValue('lessonTime');
              if (!value || value.length === 0) {
                return Promise.reject(`Vui lòng chọn chính xác ${maxDaysPerWeek} ngày!`);
              }
              if (!lessonTime) {
                return Promise.reject('Vui lòng chọn giờ học trước!');
              }
              const intDays = value.map(v => parseInt(v, 10));
              if (intDays.length !== maxDaysPerWeek) {
                return Promise.reject(`Vui lòng chọn chính xác ${maxDaysPerWeek} ngày!`);
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Checkbox.Group
          options={weekDays}
          onChange={(checkedValues) => {
            const intValues = checkedValues.map(v => parseInt(v, 10));
            const limited = intValues.slice(0, maxDaysPerWeek);
            form.setFieldsValue({ weekDays: limited });
          }}
        />
      </Form.Item>

      {/* Chọn giảng viên - luôn hiển thị */}
      <Form.Item
        label="Giảng viên"
        name="accountID"
        rules={[{ required: true, message: 'Vui lòng chọn giảng viên!' }]}
      >
        <Select
          placeholder={(() => {
            const values = form.getFieldsValue();
            if (!canFetchLecturers(values)) {
              return 'Vui lòng chọn ngày bắt đầu, giờ học và các ngày trong tuần trước';
            }
            if (availableLecturers.length === 0) {
              return 'Không có giảng viên nào trống lịch giờ này';
            }
            return 'Chọn giảng viên';
          })()}
          loading={lecturerLoading}
          disabled={
            !canFetchLecturers(form.getFieldsValue()) || availableLecturers.length === 0
          }
          onChange={(value) => {
            const lecturer = availableLecturers.find(lec => lec.accountID === value);
            if (lecturer) {
              const fullName = `${lecturer.lastName} ${lecturer.firstName}`;
              setSelectedLecturer(lecturer);
              form.setFieldsValue({ accountID: value, lecturerName: fullName });
              handleValuesChange(null, {
                ...form.getFieldsValue(),
                accountID: value,
                lecturerName: fullName
              });
            }
          }}
        >
          {availableLecturers.map(lec => (
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

      <Form.Item
        name="lecturerName"
        hidden
      >
        <Input />
      </Form.Item>

    </Form>
  );
});

export default LessonCreator;
