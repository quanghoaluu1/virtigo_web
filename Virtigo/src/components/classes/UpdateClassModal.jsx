import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import { Form, Input, InputNumber, Button, DatePicker, TimePicker, Checkbox, Select, Card, Typography } from 'antd';
import dayjs from 'dayjs';
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

const UpdateClassModal = ({ open, classData, onSuccess, onClose, showNotify }) => {
  const [imageURL, setImageURL] = useState(classData?.imageURL || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [minStudentLimit, setMinStudentLimit] = useState(1);
  const [maxStudentLimit, setMaxStudentLimit] = useState(100);
  const [form] = Form.useForm();
  const [availableLecturers, setAvailableLecturers] = useState([]);
  const [lecturerLoading, setLecturerLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [maxDaysPerWeek, setMaxDaysPerWeek] = useState(3); 
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [minDaysBeforeStart, setMinDaysBeforeStart] = useState(0);

  useEffect(() => {
    axios.get(`${API_URL}api/SystemConfig/get-config-by-key/min_days_before_class_start_for_creation`)
      .then(res => {
        const value = parseInt(res.data.data.value, 10);
        setMinDaysBeforeStart(isNaN(value) ? 0 : value);
      })
      .catch(() => setMinDaysBeforeStart(0));
  }, []);

  useEffect(() => {
    const fetchMaxDays = async () => {
      if (classData?.subjectId) {
        try {
          const res = await axios.get(`${API_URL}api/SyllabusSchedule/max-slot/${classData.subjectId}`);
          if (res.data) {
            setMaxDaysPerWeek(res.data.data);
          }
        } catch (error) {
          console.error('Lỗi lấy maxDaysPerWeek:', error);
          setMaxDaysPerWeek(2); 
        }
      }
    };
  
    fetchMaxDays();
  }, [classData?.subjectId]);
  useEffect(() => {
    setImageURL(classData?.imageURL || '');
  }, [classData]);

  useEffect(() => {
    if (open) {
      axios.get(API_URL + endpoints.systemConfig.getConfigByKey + 'class_minStudent')
        .then(res => {
          if (res.data && res.data.data) setMinStudentLimit(Number(res.data.data.value));
        });
      axios.get(API_URL + endpoints.systemConfig.getConfigByKey + 'class_maxStudent')
        .then(res => {
          if (res.data && res.data.data) setMaxStudentLimit(Number(res.data.data.value));
        });
        
    }
  }, [open]);

  const canFetchLecturers = (values) => {
    return !!(
      values.teachingStartTime &&
      values.lessonTime &&
      Array.isArray(values.weekDays) &&
      values.weekDays.length === maxDaysPerWeek &&
      (classData.subjectId || classData.subjectID)
    );
  };

  const fetchAvailableLecturers = async (values) => {
    setLecturerLoading(true);
    setAvailableLecturers([]);
    try {
      const teachingStartTime = new Date(values.teachingStartTime);
      teachingStartTime.setHours(teachingStartTime.getHours() + 7);
      const params = new URLSearchParams();
      params.append('SubjectID', classData.subjectId || classData.subjectID);
      params.append('DateStart', teachingStartTime.toISOString());
      params.append('Time', dayjs(values.lessonTime).format('HH:mm:ss'));
      (values.weekDays || []).forEach(day => params.append('dayOfWeeks', day));
      const res = await axios.get(
        `${API_URL}api/Account/get-lecturer-free?${params.toString()}`
      );
      setAvailableLecturers(res.data.data || []);
    } catch (e) {
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
    if (allValues.accountID) {
      // callback nếu cần
    }
  };

  useEffect(() => {
    if (classData) {
      form.setFieldsValue({
        className: classData.className || '',
        priceOfClass: classData.priceOfClass || '',
        minStudentAcp: classData.minStudentAcp || minStudentLimit,
        maxStudentAcp: classData.maxStudentAcp || maxStudentLimit,
        lecturerId: classData.lecturerId || '',
        teachingStartTime: classData.teachingStartTime ? dayjs(classData.teachingStartTime) : null,
        lessonTime: classData.lessonTime ? dayjs(classData.lessonTime, 'HH:mm:ss') : null,
        weekDays: Array.isArray(classData.dayOfWeeks) ? classData.dayOfWeeks : [],
      });
    }
  }, [classData, minStudentLimit, maxStudentLimit, form]);

  useEffect(() => {
    if (classData && classData.status === 0) {
      axios.get(API_URL + endpoints.manageSubject.getSubject, { params: { status: 1 } })
        .then(res => {
          setSubjects(res.data.data || []);
        });
    }
  }, [classData]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        API_URL + endpoints.cloudinary.uploadClassImage,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data) {
        setImageURL(res.data);
        showNotify({ type: 'success', message: 'Tải ảnh lên thành công!' });
      } else {
        showNotify({ type: 'error', message: 'Tải ảnh lên thất bại!' });
      }
    } catch (err) {
      showNotify({ type: 'error', message: 'Lỗi khi tải ảnh!', description: err.message });
    } finally {
      setUploading(false);
    }
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault && e.preventDefault();
    try {
      const values = await form.validateFields();
      // So sánh các trường cần thiết
      const oldStart = classData.teachingStartTime ? dayjs(classData.teachingStartTime).toISOString() : '';
      const newStart = values.teachingStartTime
      ? dayjs(values.teachingStartTime).add(7, 'hour').toISOString()
      : '';
      const oldLesson = classData.lessonTime ? dayjs(classData.lessonTime, 'HH:mm:ss').format('HH:mm') : '';
      const newLesson = values.lessonTime ? dayjs(values.lessonTime).format('HH:mm') : '';
      const oldDays = Array.isArray(classData.dayOfWeeks) ? classData.dayOfWeeks.map(Number).sort().join(',') : '';
      const newDays = Array.isArray(values.weekDays)
      ? values.weekDays.map(Number).sort()
      : [];
      const oldLecturer = classData.lecturerId || classData.accountID || '';
      const newLecturer = values.accountID || values.lecturerId || '';
      let needUpdateLesson = false;
      if (oldStart !== newStart || oldLesson !== newLesson || oldDays !== newDays || oldLecturer !== newLecturer) {
        needUpdateLesson = true;
      }
      await axios.put(`${API_URL}api/Class/update`, {
        classID: classData.classId,
        lecturerID: newLecturer,
        subjectID: values.subjectID || classData.subjectID || classData.subjectId,
        className: values.className,
        minStudentAcp: values.minStudentAcp,
        maxStudentAcp: values.maxStudentAcp,
        priceOfClass: values.priceOfClass,
        teachingStartTime: newStart,
        imageURL: imageURL,
        status: classData.status
      });
      if (needUpdateLesson) {
        try {
 
          await axios.delete(`${API_URL}api/Lesson/delete-by-class-id/${classData.classId}`);
      

          const lessonNew = await axios.post(`${API_URL}api/Lesson/create-from-schedule`, {
            classId: classData.classId,
            startHour: newLesson,
            daysOfWeek: newDays
          });
      
          console.log("hi" + lessonNew.data); 
        } catch (err) {
          console.error('Tạo lesson mới thất bại:', err?.response?.data?.message || err.message || err);
          showNotify({
            type: 'error',
            message: 'Tạo lịch học thất bại!',
            description: err?.response?.data?.message || err.message || '',
          });
          return; 
        }
      }
      
      showNotify({
        type: 'success',
        message: 'Cập nhật lớp học thành công!',
        description: '',
      });
      onSuccess && onSuccess();
    } catch (error) {
      showNotify({
        type: 'error',
        message: 'Cập nhật lớp học thất bại!',
        description: error?.response?.data?.message || error.message || '',
      });
    }
  };

  if (!open || !classData) return null;

  const disableClassFields = classData.numberStudentEnroll > 0;

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}>
      <div className="modal-content" style={{ background: '#fff', margin: '60px auto', padding: 24, borderRadius: 8, width: 600, position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Cập nhật thông tin lớp học</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          initialValues={{
            className: classData.className || '',
            priceOfClass: classData.priceOfClass || '',
            minStudentAcp: classData.minStudentAcp || minStudentLimit,
            maxStudentAcp: classData.maxStudentAcp || maxStudentLimit,
            lecturerId: classData.lecturerId || '',
            teachingStartTime: classData.teachingStartTime ? dayjs(classData.teachingStartTime) : null,
            lessonTime: classData.lessonTime ? dayjs(classData.lessonTime, 'HH:mm:ss') : null,
            weekDays: Array.isArray(classData.dayOfWeeks) ? classData.dayOfWeeks : [],
            accountID: classData.accountID || classData.lecturerId || '',
          }}
        >
          <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
              <div style={{ width: '100%', textAlign: 'center' }}>
                {imageURL && (
                  <img src={imageURL} alt="class" style={{ width: '100%', maxWidth: 160, borderRadius: 8, marginBottom: 12, objectFit: 'cover' }} />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <Button
                type="default"
                style={{ marginTop: 4, borderColor: '#1976d2', color: '#1976d2' }}
                onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}
                loading={uploading}
                disabled={uploading}
              >
                Đổi ảnh
              </Button>
            </div>
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {classData.status === 0 ? (
                <Form.Item label="Môn học" name="subjectID" rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}> 
                  <Select showSearch optionFilterProp="children">
                    {subjects.map(sub => (
                      <Select.Option key={sub.subjectID} value={sub.subjectID}>
                        {sub.subjectName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item label="Môn học">
                  <Input value={classData.subjectName} disabled />
                </Form.Item>
              )}
              <Form.Item label="Tên lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}> 
                <Input disabled={disableClassFields} />
              </Form.Item>
              <Form.Item label="Số học viên đã đăng ký">
                <Input value={classData.numberStudentEnroll} disabled />
              </Form.Item>
              <Form.Item label="Giá tiền học" name="priceOfClass" rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}> 
                <InputNumber className="w-full" disabled={disableClassFields || (classData.numberStudentEnroll > 0)} min={0} />
              </Form.Item>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 0 }}>
            <Form.Item style={{ flex: 1 }} label={`Số học viên tối thiểu (>= ${minStudentLimit})`} name="minStudentAcp" rules={[{ required: true, message: 'Nhập số tối thiểu!' }]}> 
              <InputNumber min={minStudentLimit} max={maxStudentLimit} className="w-full" />
            </Form.Item>
            <Form.Item style={{ flex: 1 }} label={`Số lượng tối đa (<= ${maxStudentLimit})`} name="maxStudentAcp" rules={[{ required: true, message: 'Nhập số tối đa!' }]}> 
              <InputNumber min={minStudentLimit} max={maxStudentLimit} className="w-full" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 0 }}>
            <Form.Item style={{ flex: 2 }} label="Dự kiến ngày học chính thức" name="teachingStartTime" rules={[
                { required: true, message: 'Vui lòng chọn ngày học chính thức!' },
                { 
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    return Promise.resolve();
                  }
                }
              ]} extra={`Chỉ được chọn từ ngày hiện tại + ${minDaysBeforeStart} ngày trở lên`}>
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
            <Form.Item style={{ flex: 1 }} label="Giờ học" name="lessonTime" rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.reject('Vui lòng chọn giờ học!');
                    }
                    return Promise.resolve();
                  },
                },
              ]}>
              <TimePicker format="HH:mm" className="w-full" minuteStep={5} />
            </Form.Item>
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
            <Button type="default" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#fff' }}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ padding: '8px 16px', borderRadius: 4 }}>Lưu</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UpdateClassModal;
