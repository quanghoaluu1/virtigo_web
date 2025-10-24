import React, { useState, useRef, useEffect  } from 'react';
import { Steps, Button, message, notification } from 'antd';
import BasicInfoForm from './BasicInfoForm';
import LessonCreator from './LessonCreator';
import TeachingScheduleModal from './TeachingScheduleModal';
import ConfirmCreateClass from './ConfirmCreateClass';
import { API_URL } from '../../../config/api';
import axios from 'axios';
import dayjs from 'dayjs';
import Notification from '../../common/Notification';
import ActionConfirm from '../../common/ActionConfirm';

const CreateClassStepper = ({
  lectures,
  subjects,
  formData,
  setFormData,
  onFinish,
  showNotify
}) => {
  const [current, setCurrent] = useState(0);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const basicInfoFormRef = useRef(); 
  const lessonCreatorRef = useRef();
  const [maxDaysPerWeek, setMaxDaysPerWeek] = useState(3); // mặc định 3
  const [teachingSchedulesDetail, setTeachingSchedulesDetail] = useState([]);
  const [teachingWeekly, setTeachingWeekly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openRecruit, setOpenRecruit] = useState(false);

  const fetchTeachingScheduleDetail = async (accountID) => {
    try {
      const response = await axios.get(`${API_URL}api/Account/teaching-schedule-detail/${accountID}`);
      if (response.data.success) {
        setTeachingSchedulesDetail(response.data.data);
        console.log(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teaching schedule detail:', error);
      message.error('Không thể lấy lịch dạy của giảng viên');
    }
  };

  const fetchTeachingWeekly = async () => {
    try {
      const response = await axios.get(`${API_URL}api/Account/teaching-schedule`);
      if (response.data.success) {
        setTeachingWeekly(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teaching weekly schedule:', error);
      message.error('Không thể lấy lịch dạy hàng tuần của giảng viên');
    }
  };

  useEffect(() => {
    fetchTeachingWeekly();
  }, []);

  const handleBasicInfoChange = (values) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: values
    }));
    if (values.accountID) {
      fetchTeachingScheduleDetail(values.accountID);
    }
  };

  const handleLessonCreatorChangeLecturer = (accountID) => {
    if (accountID) {
      fetchTeachingScheduleDetail(accountID);
    }
  };

  useEffect(() => {
    const fetchMaxDays = async () => {
      if (formData.basicInfo?.subjectID) {
        try {
          const res = await axios.get(`${API_URL}api/SyllabusSchedule/max-slot/${formData.basicInfo.subjectID}`);
          if (res.data) {
            setMaxDaysPerWeek(res.data.data);
          }
          console.log(res.data.data);
        } catch (error) {
          console.error('Lỗi lấy maxDaysPerWeek:', error);
          setMaxDaysPerWeek(2); 
        }
      }
    };
  
    fetchMaxDays();
  }, [formData.basicInfo?.subjectID]);

  const steps = [
    {
      title: 'Nhập thông tin cơ bản',
      content: (
        <BasicInfoForm
          ref={basicInfoFormRef}
          lectures={lectures}
          subjects={subjects}
          formData={formData.basicInfo}
          onChange={handleBasicInfoChange}
        />
      ),
    },
    {
      title: 'Xếp lịch học',
      content: (
        <LessonCreator
          ref={lessonCreatorRef}
          lectures={lectures}
          formData={formData.lessons}
          teachingSchedulesDetail={teachingSchedulesDetail}
          teachingWeekly={teachingWeekly}
          onChange={(data) => setFormData(prev => ({ ...prev, lessons: data }))}
          maxDaysPerWeek={maxDaysPerWeek}
          onLecturerChange={handleLessonCreatorChangeLecturer}
          subjectID={formData.basicInfo?.subjectID}
        />
      )
    },
    {
      title: 'Xác nhận thông tin',
      content: <ConfirmCreateClass formData={formData} />
    }
  ];

  const next = async () => {
    if (current === 0) {
      try {
        await basicInfoFormRef.current?.validate();
        setCurrent(1);
      } catch (_) {}
    } else if (current === 1) {
      try {
        await lessonCreatorRef.current?.validate();
        setCurrent(2);
      } catch (_) {}
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => setCurrent(current - 1);

  const handleApiError = (error) => {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data;
  
      if (response?.errors?.length > 0) {
        response.errors.forEach((err) => {
          message.error(err.message);
        });
      } else if (response?.message) {
        message.error(response.message);
      } else {
        message.error('Đã xảy ra lỗi không xác định');
      }
    } else {
      message.error('Lỗi không phải từ server: ' + error.message);
    }
  };
  
  const handleFinish = async (shouldOpenRecruit) => {
    try {
      setLoading(true);
      const { basicInfo, lessons } = formData;
      const teachingStartTime = new Date(lessons.teachingStartTime);
      teachingStartTime.setHours(teachingStartTime.getHours() + 7);
      const classResponse = await axios.post(`${API_URL}api/Class/create`, {
        lecturerID: lessons.accountID,
        subjectID: basicInfo.subjectID,
        className: basicInfo.className,
        minStudentAcp: basicInfo.minStudentAcp,
        maxStudentAcp: basicInfo.maxStudentAcp,
        priceOfClass: basicInfo.priceOfClass,
        teachingStartTime: teachingStartTime.toISOString(),
        imageURL: basicInfo.imageURL
      });
      const classId = classResponse.data.data;
      const lessonResponse = await axios.post(`${API_URL}api/Lesson/create-from-schedule`, {
        classId: classId,
        startHour: dayjs(lessons.lessonTime).format('HH:mm'),
        daysOfWeek: lessons.weekDays
      });
      if (classResponse.data.success) {
        if (shouldOpenRecruit) {
          await axios.put(`${API_URL}api/Class/update-status`, {
            classId: classId,
            classStatus: 1
          });
          const descriptionString = [
            lessonResponse.data.message,
            // testEventResponse.data.message,
            'Lớp đã được mở tuyển sinh!'
          ].join('\n');
          showNotify({
            type: 'success',
            message: classResponse.data.message,
            description: descriptionString
          });
        } else {
          const descriptionString = [
            lessonResponse.data.message,
          ].join('\n');
          showNotify({
            type: 'success',
            message: classResponse.data.message,
            description: descriptionString
          });
        }
      } else {
        showNotify({
          type: 'error',
          message: classResponse.data.message || 'Tạo lớp học thất bại!',
          description: ''
        });
      }
      onFinish?.();
    } catch (error) {
      showNotify({
        type: 'error',
        message: 'Có lỗi xảy ra khi tạo lớp học!',
        description: error.message
      });
      handleApiError(error);
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  return (
    <>
      <Steps current={current}>
        {steps.map(item => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ margin: '24px 0' }}>{steps[current].content}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {current === 0 && (
          <Button onClick={() => setOpenScheduleModal(true)}>
            Xem lịch dạy giảng viên
          </Button>
        )}
    
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={prev}>
            Quay lại
          </Button>
        )}
        {current === 1 && (
          <Button onClick={() => setOpenScheduleModal(true)}>
            Xem lịch dạy giảng viên
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button
            type="primary"
            onClick={next}
          >
            Tiếp theo
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => setOpenConfirm(true)}
            loading={loading}
          >
            Hoàn thành
          </Button>
        )}
      </div>
      <TeachingScheduleModal open={openScheduleModal} onClose={() => setOpenScheduleModal(false)} />
      <ActionConfirm
        open={openConfirm}
        title="Mở tuyển sinh cho lớp?"
        content="Bạn có muốn mở tuyển sinh cho lớp này luôn không?"
        okText="Có, mở tuyển sinh"
        cancelText="Không, để sau"
        onOk={() => handleFinish(true)}
        onCancel={() => handleFinish(false)}
      />
    </>
  );
};

export default CreateClassStepper;
