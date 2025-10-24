import React, { useState, useEffect } from 'react';
import { Steps, Button, Form, Typography, message, Modal } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { subjectService } from '../../../../services/subjectService';
import Notification from '../../../common/Notification';

import BasicInfoStep from './steps/BasicInfoStep';
import ConfigurationStep from './steps/ConfigurationStep';
import ClassInfoStep from './steps/ClassInfoStep';
import AssessmentStep from './steps/AssessmentStep';
import TestSlotsStep from './steps/TestSlotsStep';
import ConfirmationStep from './steps/ConfirmationStep';

const { Step } = Steps;
const { Title } = Typography;

const AssessmentCategoryLabel = {
  0: 'Quiz',
  1: 'Presentation',
  2: 'Midterm',
  3: 'Final',
  4: 'Attendance',
  5: 'Assignment',
  6: 'Class Participation'
};

const CreateSubject = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const isEditing = !!subjectId;
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({ visible: false, type: 'success', message: '', description: '' });
  const [subjectData, setSubjectData] = useState({ basicInfo: null, configuration: null, scheduleInfo: null, assessmentInfo: null, testSlots: null });
  const [classSlots, setClassSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editForm] = Form.useForm();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [createdSubjectId, setCreatedSubjectId] = useState(null);

  const handleCloseNotification = () => {
    setNotificationConfig(prev => ({ ...prev, visible: false }));
  };

  const generateClassSlots = (totalWeeks, slotsPerWeek, defaultDuration) => {
    const slots = [];
    let slotNumber = 1;
    for (let week = 1; week <= totalWeeks; week++) {
      for (let slot = 1; slot <= slotsPerWeek; slot++) {
        slots.push({ week, slot: slotNumber, title: `Tiết ${slotNumber}`, content: '', durationMinutes: defaultDuration || 0, resources: '', hasTest: false });
        slotNumber++;
      }
    }
    setClassSlots(slots);
  };

  const validateTestSlotCounts = () => {
    const testSlots = form.getFieldValue('testSlots') || [];
    const countMap = {};
    testSlots.forEach(slot => {
      if (slot?.criteriaId !== undefined) {
        countMap[slot.criteriaId] = (countMap[slot.criteriaId] || 0) + 1;
      }
    });

    const errors = [];
    (subjectData.assessmentInfo || []).forEach((criterion) => {
      const required = criterion?.requiredTestCount || 0;
      const actual = countMap[criterion.category] || 0;
      if (required !== actual) {
        errors.push(`${AssessmentCategoryLabel[criterion.category]} yêu cầu ${required} bài, nhưng đã chọn ${actual}`);
      }
    });

    if (errors.length > 0) return errors.join('; ');
    return null;
  };

  const validateTestSlotDurations = () => {
    const testSlots = form.getFieldValue('testSlots') || [];
    const errors = [];
    (testSlots || []).forEach((testSlot, idx) => {
      if (testSlot && testSlot.duration !== undefined && classSlots[idx]) {
        const lessonDuration = classSlots[idx].durationMinutes || 0;
        if (testSlot.duration > lessonDuration) {
          errors.push(`Slot kiểm tra ở tiết ${classSlots[idx].title} có thời gian kiểm tra (${testSlot.duration} phút) lớn hơn thời lượng buổi học (${lessonDuration} phút)`);
        }
      }
    });
    if (errors.length > 0) return errors.join('; ');
    return null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Kiểm tra duration test slot trước khi submit
      const durationError = validateTestSlotDurations();
      if (durationError) {
        setNotificationConfig({
          visible: true,
          type: 'error',
          message: 'Lỗi thời lượng kiểm tra',
          description: durationError,
        });
        setLoading(false);
        return;
      }

      // Lấy dữ liệu mới nhất từ form
      const values = await form.validateFields();

      // Lấy thông tin cơ bản từ values (form) hoặc từ state nếu không có
      const subjectName = values.name || subjectData.basicInfo?.name;
      const description = values.description || subjectData.basicInfo?.description;
      const minAverageScoreToPass = values.minAverageScoreToPass || subjectData.basicInfo?.minAverageScoreToPass;

      console.log('Submit subject:', { subjectName, description, minAverageScoreToPass });

      if (!subjectName || !description || !minAverageScoreToPass) {
        setNotificationConfig({
          visible: true,
          type: 'error',
          message: 'Thiếu thông tin!',
          description: 'Vui lòng nhập đầy đủ tên môn học, mô tả và điểm đạt.',
        });
        setLoading(false);
        return;
      }

      // Lấy configuration từ subjectData hoặc values
      const configuration = {
        totalWeeks: subjectData.configuration?.totalWeeks || values.totalWeeks,
        slotsPerWeek: subjectData.configuration?.slotsPerWeek || values.slotsPerWeek,
      };

      // 1. Tạo môn học mới
      const subjectRes = await subjectService.createSubject({
        subjectName,
        description,
        minAverageScoreToPass,
      });
      
      console.log('Subject creation response:', subjectRes);
      
      // Lấy subjectID từ response theo cấu trúc thực tế
      const subjectID = subjectRes?.message?.data || subjectRes?.subjectID;
      if (!subjectID) {
        console.error('Cannot get subjectID from response:', subjectRes);
        throw new Error('Không lấy được subjectID từ response');
      }
      
      console.log('Extracted subjectID:', subjectID);

      // 2. Tạo thời khóa biểu (slot học)
      const { totalWeeks, slotsPerWeek } = configuration;
      const scheduleRes = await subjectService.createSyllabusSchedule({
        subjectID,
        week: totalWeeks,
        slotInWeek: slotsPerWeek,
      });
      const scheduleIDs = scheduleRes?.data?.map(item => item.syllabusScheduleID);
      if (!scheduleIDs || scheduleIDs.length === 0) throw new Error('Không lấy được syllabusScheduleID');

      // 3. Tạo số lượng tiêu chí đánh giá
      const criteria = subjectData.assessmentInfo || [];
      const numCriteria = criteria.length;
      const criteriaRes = await subjectService.createAssessmentCriteriaMany({
        numberAssessmentCriteria: numCriteria,
        subjectID,
      });
      const assessmentCriteriaIDs = criteriaRes?.data?.map(item => item.assessmentCriteriaID);
      if (!assessmentCriteriaIDs || assessmentCriteriaIDs.length !== numCriteria) throw new Error('Không lấy đủ assessmentCriteriaID');

      // 4. Cập nhật nội dung cho từng tiêu chí đánh giá
      const updateCriteriaItems = criteria.map((item, idx) => ({
        assessmentCriteriaID: assessmentCriteriaIDs[idx],
        weightPercent: item.weightPercent,
        category: item.category,
        requiredTestCount: item.requiredTestCount,
        note: item.note,
        minPassingScore: 0,
      }));
      await subjectService.updateAssessmentCriteriaList({ items: updateCriteriaItems });

      // 5. Cập nhật lịch học với thông tin bài kiểm tra
      // Mapping scheduleItems từ classSlots và testSlots
      const testSlots = form.getFieldValue('testSlots') || [];
      // Map testSlots (theo slot) sang từng slot học
      const scheduleItems = (classSlots || []).map((slot, idx) => {
        const testSlot = testSlots[idx];
        let itemsAssessmentCriteria = null;
        if (testSlot && testSlot.criteriaId !== undefined && testSlot.criteriaId !== null) {
          // Tìm index của tiêu chí đánh giá theo category
          const criteriaIdx = criteria.findIndex(c => c.category === testSlot.criteriaId);
          if (criteriaIdx !== -1) {
            itemsAssessmentCriteria = {
              assessmentCriteriaID: assessmentCriteriaIDs[criteriaIdx],
              duration: testSlot.duration,
              testType: testSlot.testType,
            };
          }
        }
        return {
          syllabusScheduleID: scheduleIDs[idx],
          content: slot.content,
          resources: slot.resources,
          lessonTitle: slot.title,
          durationMinutes: slot.durationMinutes,
          hasTest: !!itemsAssessmentCriteria,
          itemsAssessmentCriteria: itemsAssessmentCriteria,
        };
      });
      await subjectService.bulkUpdateSyllabusSchedule({
        subjectID,
        scheduleItems,
      });

      setNotificationConfig({
        visible: true,
        type: 'success',
        message: 'Tạo môn học và cấu hình hoàn tất!',
        description: '',
      });
      setCreatedSubjectId(subjectID);
      setShowPublishModal(true);
    } catch (error) {
      console.log('Error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      
      let errorMessage = 'Có lỗi xảy ra trong quá trình lưu môn học. Vui lòng thử lại.';
      
      try {
        // Lấy message từ response của API
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            // Nếu message là object, lấy message.message
            if (typeof error.response.data.message === 'object' && error.response.data.message.message) {
              errorMessage = error.response.data.message.message;
            } else if (typeof error.response.data.message === 'string') {
              errorMessage = error.response.data.message;
            }
          } else if (error.response.data.errors) {
            // Nếu có nhiều lỗi validation, nối chúng lại
            const errorMessages = Object.values(error.response.data.errors).flat();
            errorMessage = errorMessages.join(' | ');
          }
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
        errorMessage = 'Có lỗi xảy ra trong quá trình lưu môn học. Vui lòng thử lại.';
      }
      
      setNotificationConfig({
        visible: true,
        type: 'error',
        message: 'Lỗi!',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoNext = (values) => {
    setSubjectData(prev => ({ ...prev, basicInfo: values }));
    setCurrent(current + 1);
  };

  const next = async () => {
    try {
      const values = await form.validateFields();
      if (current === 0) {
        setSubjectData(prev => ({
          ...prev,
          basicInfo: {
            name: values.name,
            description: values.description,
            minAverageScoreToPass: values.minAverageScoreToPass
          },
          configuration: {
            totalWeeks: values.totalWeeks,
            slotsPerWeek: values.slotsPerWeek,
            totalTests: values.totalTests,
            defaultDuration: values.defaultDuration
          }
        }));
        // Nếu chưa import Excel, luôn cập nhật lại classSlots
        if (!(classSlots.length > 0 && subjectData.configuration && subjectData.configuration.totalSlots)) {
          generateClassSlots(values.totalWeeks, values.slotsPerWeek, values.defaultDuration);
        }
      }

      if (current === 2) {
        setSubjectData(prev => ({ ...prev, assessmentInfo: values.criteria }));
        form.setFieldsValue({ criteria: values.criteria });
        const criteria = values.criteria || [];
        const totalWeight = criteria.reduce((sum, item) => sum + (item.weightPercent || 0), 0);
        if (totalWeight !== 100) {
          message.error('Tổng trọng số phải bằng 100%');
          return;
        }
      }

      // Kiểm tra duration test slot ở bước chọn slot kiểm tra
      if (current === 3) {
        const durationError = validateTestSlotDurations();
        if (durationError) {
          message.error(durationError);
          return;
        }
      }

      setCurrent(current + 1);
    } catch (error) {
      console.error('Validation failed:', error);
      if (error.errorFields) error.errorFields.forEach(field => message.error(field.errors[0]));
    }
  };

  const prev = () => setCurrent(current - 1);

  useEffect(() => {
    if (isEditing && subjectId) {
      const fetchSubjectData = async () => {
        try {
          const data = await subjectService.getSubjectById(subjectId);
          setSubjectData(prev => ({
            ...prev,
            basicInfo: {
              subjectID: data.subjectID,
              subjectName: data.subjectName,
              description: data.description,
              minAverageScoreToPass: data.minAverageScoreToPass,
              createAt: data.createAt,
            }
          }));
          form.setFieldsValue({ name: data.subjectName, description: data.description, minAverageScoreToPass: data.minAverageScoreToPass });
        } catch (error) {
          console.error('Error fetching subject data:', error);
          message.error('Không thể tải thông tin môn học để chỉnh sửa.');
        }
      };
      fetchSubjectData();
    }
  }, [isEditing, subjectId, form]);

  useEffect(() => {
    if (current === 3 && subjectData.assessmentInfo) {
      form.resetFields(['criteria']);
      form.setFieldsValue({ criteria: subjectData.assessmentInfo });
    }
  }, [current, subjectData.assessmentInfo, form]);

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    editForm.setFieldsValue({
      title: slot.title,
      content: slot.content,
      durationMinutes: slot.durationMinutes,
      resources: slot.resources,
    });
  };

  const handleUpdateSlot = () => {
    const updatedValues = editForm.getFieldsValue();
    setClassSlots(prev =>
      prev.map(slot =>
        slot.slot === editingSlot.slot
          ? { ...slot, ...updatedValues }
          : slot
      )
    );
    setEditingSlot(null);
    editForm.resetFields();
  };

  const handleImportExcelClassSlots = async (importedSlots) => {
    try {
      // Chỉ kiểm tra đã có thông tin môn học
      const values = form.getFieldsValue();
      const basicInfo = {
        name: values.name || subjectData.basicInfo?.name,
        description: values.description || subjectData.basicInfo?.description,
        minAverageScoreToPass: values.minAverageScoreToPass || subjectData.basicInfo?.minAverageScoreToPass
      };
      if (!basicInfo.name || !basicInfo.description || !basicInfo.minAverageScoreToPass) {
        setNotificationConfig({
          visible: true,
          type: 'error',
          message: 'Thiếu thông tin!',
          description: 'Vui lòng nhập đầy đủ thông tin môn học trước khi import file Excel.',
        });
        return;
      }
      setClassSlots(importedSlots);

      // Tính lại số tuần và số slot mỗi tuần từ importedSlots
      const weeks = [...new Set(importedSlots.map(slot => slot.week))];
      const slotsPerWeek = Math.max(...weeks.map(week =>
        importedSlots.filter(slot => slot.week === week).length
      ));
      setSubjectData(prev => ({
        ...prev,
        basicInfo,
        configuration: {
          ...prev.configuration,
          totalWeeks: weeks.length,
          slotsPerWeek: slotsPerWeek,
          totalSlots: importedSlots.length
        }
      }));

      // Cập nhật lại form values cho step 2
      form.setFieldsValue({
        totalWeeks: weeks.length,
        slotsPerWeek: slotsPerWeek,
      });

      setCurrent(1); // Chuyển sang bước 2
      setNotificationConfig({
        visible: true,
        type: 'success',
        message: 'Import thành công!',
        description: '',
      });
    } catch (error) {
      let errorMessage = 'Có lỗi khi import file Excel.';
      if (error.response && error.response.data && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      }
      setNotificationConfig({
        visible: true,
        type: 'error',
        message: 'Lỗi import!',
        description: errorMessage,
      });
    }
  };

  // Hàm xử lý công khai môn học (placeholder, cần tích hợp API nếu có)
  const handlePublishSubject = async (subjectId) => {
    try {
      console.log(subjectId);
      await subjectService.publishSubject(subjectId);
      message.success('Môn học đã được công khai!');
    } catch (err) {
      message.error('Không thể công khai môn học!');
    } finally {
      setShowPublishModal(false);
      navigate('/dashboard/subject');
    }
  };

  const steps = [
    { title: 'Thông tin & cấu hình môn học', content: (<><Title level={4}>Thông tin môn học</Title><BasicInfoStep form={form} subjectId={subjectId} isEditing={isEditing} /><Title level={4}>Cấu hình môn học</Title><ConfigurationStep onGenerateClassSlots={handleImportExcelClassSlots} onImportError={(msg) => setNotificationConfig({ visible: true, type: 'error', message: 'Lỗi import!', description: msg })} hasImportedClassSlots={classSlots.length > 0} /></>) },
    { title: 'Thông tin buổi học', content: <ClassInfoStep classSlots={classSlots} editingSlot={editingSlot} setEditingSlot={setEditingSlot} handleEditSlot={handleEditSlot} handleUpdateSlot={handleUpdateSlot} editForm={editForm} /> },
    { title: 'Thông tin đánh giá', content: <AssessmentStep form={form} configuration={subjectData.configuration} /> },
    { title: 'Chọn slot kiểm tra', content: <TestSlotsStep classSlots={classSlots} form={form} assessmentInfo={subjectData.assessmentInfo} /> },
    { title: 'Xác nhận thông tin', content: <ConfirmationStep form={form} classSlots={classSlots} assessmentInfo={subjectData.assessmentInfo} /> }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Notification {...notificationConfig} onClose={handleCloseNotification} />
      <Title level={3}>{isEditing ? 'Chỉnh sửa môn học' : 'Tạo môn học mới'}</Title>
      <Steps current={current} className="mb-24">
        {steps.map((item, index) => (<Step key={index} title={item.title} />))}
      </Steps>
      <Form form={form} layout="vertical">
        {steps[current].content}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={prev} disabled={current === 0}>Quay lại</Button>
            <Button 
              className="ml-8" 
              onClick={() => navigate('/dashboard/subject')}
            >
              Về trang lớp học
            </Button>
          </div>
          {current < steps.length - 1 && (
            <Button type="primary" icon={<ArrowRightOutlined />} onClick={next}>Tiếp theo</Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" loading={loading} onClick={handleSubmit}>Lưu môn học</Button>
          )}
        </div>
      </Form>
      <Modal
        visible={showPublishModal}
        title="Công khai môn học"
        onCancel={() => {
          setShowPublishModal(false);
          navigate('/dashboard/subject');
        }}
        footer={[
          <Button key="no" onClick={() => {
            setShowPublishModal(false);
            navigate('/dashboard/subject');
          }}>
            Không
          </Button>,
          <Button key="yes" type="primary" onClick={() => handlePublishSubject(createdSubjectId)}>
            Có
          </Button>
        ]}
      >
        Bạn có muốn công khai môn học để mở lớp không?
      </Modal>
    </div>
  );
};

export default CreateSubject;
