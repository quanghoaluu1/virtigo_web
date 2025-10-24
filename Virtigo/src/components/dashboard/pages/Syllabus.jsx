import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Typography, Divider, Table, Tag, Space, Modal, Form, Input, InputNumber, message, Descriptions, Select, Alert } from 'antd';
import {
  ArrowLeftOutlined, ClockCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, CalendarOutlined, EyeOutlined,
  EyeInvisibleOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_URL, endpoints } from '../../../config/api';


// Import components
import SubjectInfo from './syllabus/SubjectInfo';
import AssessmentCriteria from './syllabus/AssessmentCriteria';
import SyllabusSchedule from './syllabus/SyllabusSchedule';
import SubjectClasses from './syllabus/SubjectClasses';
import {
  SubjectModal,
  AssessmentModal,
  ScheduleModal,
  DeleteConfirmModal
} from './syllabus/Modals';
import Notification from '../../common/Notification';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const Syllabus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const [subject, setSubject] = useState(null);
  const [syllabusSchedules, setSyllabusSchedules] = useState([]);
  const [syllabusScheduleTests, setSyllabusScheduleTests] = useState([]);
  const [assessmentCriteria, setAssessmentCriteria] = useState([]);
  const [classes, setClasses] = useState([]);

  // Modal states
  const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
  const [isAssessmentModalVisible, setIsAssessmentModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [subjectDeleteModalVisible, setSubjectDeleteModalVisible] = useState(false);
  const [assessmentDeleteModalVisible, setAssessmentDeleteModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [scheduleDeleteModalVisible, setScheduleDeleteModalVisible] = useState(false);
  const [deleteScheduleId, setDeleteScheduleId] = useState(null);
  // Modal confirm trạng thái môn học
  const [statusConfirmVisible, setStatusConfirmVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Form instances
  const [subjectForm] = Form.useForm();
  const [assessmentForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  // Editing states
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  // Show Table
  const [showSubjectInfo, setShowSubjectInfo] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showAssessment, setShowAssessment] = useState(true);
  const [showClasses, setShowClasses] = useState(true);

  // Class status enum
  const ClassStatus = {
    Pending: 0,
    Open: 1,
    Ongoing: 2,
    Completed: 3,
    Deleted: 4
  };

  // Utility to check if editing is allowed
  const hasActiveClasses = classes.some(c =>
    c.status === ClassStatus.Open ||
    c.status === ClassStatus.Ongoing
  );
  // Disable all editing if any class is Open or Ongoing
  const canEdit = subject && !hasActiveClasses && (subject.status === 0 || subject.status === 'Pending');

  // Notification state
  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });

  // Help modal state
  const [helpVisible, setHelpVisible] = useState(false);

  // Map category enum sang tên tiếng Việt/Anh
  const categoryMap = {
    0: 'Quiz',
    1: 'Presentation',
    2: 'Midterm',
    3: 'Final',
    4: 'Attendance',
    5: 'Assignment',
    6: 'Class Participation'
  };
  const testTypeOptions = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Vocabulary' },
    { value: 2, label: 'Grammar' },
    { value: 3, label: 'Listening' },
    { value: 4, label: 'Reading' },
    { value: 5, label: 'Writing' },
    { value: 6, label: 'Mix' },
    { value: 7, label: 'Other' }
  ];
  const assessmentCriteriaOptions = assessmentCriteria.map(item => ({
    value: String(item.assessmentCriteriaID),
    label: categoryMap[item.category] || item.category
  }));

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  useEffect(() => {
    if (subject?.code) {
      fetchSyllabusSchedules();
    }
  }, [subject]);

  useEffect(() => {
    if (subject?.code) {
      fetchAssessmentCriteria();
    }
  }, [subject]);

  useEffect(() => {
    if (subject?.code) {
      fetchClasses();
    }
  }, [subject]);

  useEffect(() => {
    if (syllabusSchedules.length > 0) {
      fetchSyllabusScheduleTests();
    }
  }, [syllabusSchedules]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}${endpoints.manageSubject.getById}${subjectId}`);
      if (response.data) {
        setSubject({
          id: response.data.subjectID,
          code: response.data.subjectID,
          name: response.data.subjectName,
          description: response.data.description,
          status: response.data.status,
          minAverageScoreToPass: response.data.minAverageScoreToPass,
          createAt: response.data.createAt
        });
      }
    } catch (error) {
      console.error('Error fetching subject:', error);
      setNotification({ visible: true, type: 'error', message: 'Không thể tải thông tin môn học' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSyllabusSchedules = async () => {
    try {
      if (!subject?.code) return;
      const response = await axios.get(`${API_URL}${endpoints.syllabus.getSyllabusSchedule}`, {
        params: { subject: subject.code }
      });
      const schedules = response.data.data || [];
      setSyllabusSchedules(schedules);
    } catch (error) {
      console.error('Error fetching syllabus schedules:', error);
      setNotification({ visible: true, type: 'error', message: 'Không thể tải lịch trình giảng dạy' });
    }
  };

  const fetchSyllabusScheduleTests = () => {
    // Extract test schedules from syllabusSchedules
    if (!Array.isArray(syllabusSchedules)) {
      setSyllabusScheduleTests([]);
      return;
    }
    const tests = syllabusSchedules
      .map((sch, idx) => ({ ...sch, slotIndex: idx + 1 })) // slotIndex là thứ tự thực tế trong lịch trình
      .filter(sch => sch.hasTest && sch.testData)
      .map(sch => ({
        syllabusScheduleID: sch.syllabusScheduleID,
        slotIndex: sch.slotIndex, // slot thực tế
        week: sch.week,
        lessonTitle: sch.lessonTitle,
        subjectID: sch.subjectID,
        testType: sch.testData.testType,
        testDurationMinutes: sch.testData.testDurationMinutes,
        allowMultipleAttempts: sch.testData.allowMultipleAttempts,
        category: sch.testData.category,
        minPassingScore: sch.testData.minPassingScore
      }));
    setSyllabusScheduleTests(tests);
  };

  const fetchAssessmentCriteria = async () => {
    try {
      if (!subject?.code) {
        console.error('No subject code available');
        return;
      }
      const response = await axios.get(`${API_URL}${endpoints.syllabus.getAssessmentCriteria}/${subject.code}`);
      console.log(response.data);

      // Check if response.data exists and is an array
      let criteriaData = [];
      if (response.data) {
        // If response.data is an array, use it directly
        if (Array.isArray(response.data)) {
          criteriaData = response.data;
        }
        // If response.data has a data property that's an array, use that
        else if (response.data.data && Array.isArray(response.data.data)) {
          criteriaData = response.data.data;
        }
        // If response.data has an items property that's an array, use that
        else if (response.data.items && Array.isArray(response.data.items)) {
          criteriaData = response.data.items;
        }
        // If it's a single object, wrap it in an array
        else if (typeof response.data === 'object' && response.data !== null) {
          criteriaData = [response.data];
        }
      }

      const formattedCriteria = criteriaData.map(criteria => {
        console.log('Raw criteria:', criteria);
        console.log('Category value:', criteria.category, 'Type:', typeof criteria.category);
        return {
          ...criteria,
          key: criteria.assessmentCriteriaID,
          weightPercent: criteria.weightPercent || 0,
          category: criteria.category || '',
          requiredCount: criteria.requiredCount || 0,
          duration: criteria.duration || 0,
          testType: criteria.testType || '',
          note: criteria.note || '',
          minPassingScore: criteria.minPassingScore || 0
        };
      });
      setAssessmentCriteria(formattedCriteria);
    } catch (error) {
      console.error('Error fetching assessment criteria:', error);
      setNotification({ visible: true, type: 'error', message: 'Không thể tải tiêu chí đánh giá' });
      setAssessmentCriteria([]);
    }
  };

  const fetchClasses = async () => {
    try {
      if (!subject?.code) {
        console.log('No subject code available');
        return;
      }
      const response = await axios.get(`${API_URL}${endpoints.manageClass.getbySubject}`, {
        params: {
          subjectId: subject.code,
          page: 1,
          pageSize: 10
        }
      });
      const sortedClasses = (response.data.items || []).sort((a, b) => a.classID.localeCompare(b.classID));
      setClasses(sortedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setNotification({ visible: true, type: 'error', message: 'Không thể tải danh sách lớp học' });
      setClasses([]);
    }
  };

  // Subject handlers
  const handleSubjectEdit = () => {
    if (hasActiveClasses) {
      setNotification({ visible: true, type: 'error', message: 'Không thể chỉnh sửa môn học khi có lớp đang mở hoặc đang diễn ra!' });
      return;
    }
    subjectForm.setFieldsValue({
      name: subject.name,
      description: subject.description,
      minAverageScoreToPass: subject.minAverageScoreToPass,
    });
    setIsSubjectModalVisible(true);
  };

  const handleSubjectDelete = () => {
    if (hasActiveClasses) {
      setNotification({ visible: true, type: 'error', message: 'Không thể xóa môn học khi có lớp đang mở hoặc đang diễn ra!' });
      return;
    }
    setSubjectDeleteModalVisible(true);
  };

  const handleSubjectModalOk = async () => {
    try {
      const values = await subjectForm.validateFields();
      // Only allow update if status is 0 (pending) or 1 (active)
      if (subject.status !== 0 && subject.status !== 1) {
        setNotification({ visible: true, type: 'error', message: 'Chỉ có thể cập nhật khi môn học ở trạng thái Pending hoặc Active.' });
        return;
      }
      const response = await axios.put(`${API_URL}${endpoints.manageSubject.update}`, {
        subjectID: subject.code,
        subjectName: values.name,
        description: values.description,
        status: subject.status, // keep current status
        minAverageScoreToPass: values.minAverageScoreToPass || 0
      });

      if (response.data) {
        const updatedSubject = {
          ...subject,
          name: values.name,
          description: values.description,
          minAverageScoreToPass: values.minAverageScoreToPass || 0
        };
        setSubject(updatedSubject);
        setNotification({ visible: true, type: 'success', message: 'Cập nhật môn học thành công' });
        setIsSubjectModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      setNotification({ visible: true, type: 'error', message: 'Không thể cập nhật môn học. Vui lòng thử lại.' });
    }
  };

  const handleSubjectDeleteConfirm = async () => {
    try {
      const subjectId = subject.id || subject.code;
      await axios.delete(`${API_URL}${endpoints.manageSubject.delete}${subjectId}`);
      setNotification({ visible: true, type: 'success', message: 'Xóa môn học thành công' });
      navigate('/dashboard/subject');
    } catch (error) {
      console.error('Error deleting subject:', error);
      setNotification({ visible: true, type: 'error', message: 'Không thể xóa môn học. Vui lòng thử lại.' });
    } finally {
      setSubjectDeleteModalVisible(false);
    }
  };

  const handleToggleSubjectStatus = () => {
    if (hasActiveClasses) {
      setNotification({ visible: true, type: 'error', message: 'Không thể thay đổi trạng thái môn học khi có lớp đang mở hoặc đang diễn ra!' });
      return;
    }
    if (!subject) return;

    // Chỉ kiểm tra khi chuyển từ pending sang active
    if (subject.status === 0) {
      // Kiểm tra lịch trình giảng dạy
      if (!syllabusSchedules || syllabusSchedules.length === 0) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Không thể công khai môn học',
          description: 'Vui lòng thêm lịch trình giảng dạy trước khi công khai môn học.'
        });
        return;
      }

      // Kiểm tra lịch kiểm tra
      if (!syllabusScheduleTests || syllabusScheduleTests.length === 0) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Không thể công khai môn học',
          description: 'Vui lòng thêm lịch kiểm tra trước khi công khai môn học.'
        });
        return;
      }

      // Kiểm tra tiêu chí đánh giá
      if (!assessmentCriteria || assessmentCriteria.length === 0) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Không thể công khai môn học',
          description: 'Vui lòng thêm tiêu chí đánh giá trước khi công khai môn học.'
        });
        return;
      }
    }

    const newStatus = subject.status === 0 ? 1 : 0;
    setPendingStatus(newStatus);
    setStatusConfirmVisible(true);
  };

  const handleStatusConfirmOk = async () => {
    try {
      // Kiểm tra lại một lần nữa trước khi gọi API
      if (pendingStatus === 1) {
        if (!syllabusSchedules || syllabusSchedules.length === 0) {
          setNotification({
            visible: true,
            type: 'error',
            message: 'Không thể công khai môn học',
            description: 'Vui lòng thêm lịch trình giảng dạy trước khi công khai môn học.'
          });
          return;
        }

        if (!syllabusScheduleTests || syllabusScheduleTests.length === 0) {
          setNotification({
            visible: true,
            type: 'error',
            message: 'Không thể công khai môn học',
            description: 'Vui lòng thêm lịch kiểm tra trước khi công khai môn học.'
          });
          return;
        }

        if (!assessmentCriteria || assessmentCriteria.length === 0) {
          setNotification({
            visible: true,
            type: 'error',
            message: 'Không thể công khai môn học',
            description: 'Vui lòng thêm tiêu chí đánh giá trước khi công khai môn học.'
          });
          return;
        }
      }

      await axios.put(`${API_URL}${endpoints.manageSubject.updateStatus}`, {
        subjectID: subject.code,
        status: pendingStatus
      });
      setSubject({ ...subject, status: pendingStatus });
      setNotification({
        visible: true,
        type: 'success',
        message: pendingStatus === 1 ? 'Môn học đã được công khai!' : 'Môn học đã được chuyển về trạng thái nháp!',
        description: pendingStatus === 1
          ? 'Môn học đã được công khai với đầy đủ lịch trình, lịch kiểm tra và tiêu chí đánh giá.'
          : 'Môn học đã được chuyển về trạng thái nháp và có thể chỉnh sửa.'
      });
    } catch (error) {
      setNotification({
        visible: true,
        type: 'error',
        message: 'Không thể thay đổi trạng thái môn học.',
        description: 'Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại sau.'
      });
    } finally {
      setStatusConfirmVisible(false);
      setPendingStatus(null);
    }
  };

  const handleStatusConfirmCancel = () => {
    setStatusConfirmVisible(false);
    setPendingStatus(null);
  };

  // Assessment handlers
  const handleAssessmentEdit = (record) => {
    if (hasActiveClasses) {
      setNotification({ visible: true, type: 'error', message: 'Không thể chỉnh sửa tiêu chí đánh giá khi có lớp đang mở hoặc đang diễn ra!' });
      return;
    }
    setEditingCriteria(record);
    assessmentForm.setFieldsValue(record);
    setIsAssessmentModalVisible(true);
  };

  // Schedule handlers
  const handleScheduleAdd = () => {
    if (hasActiveClasses) {
      setNotification({ visible: true, type: 'error', message: 'Không thể thêm lịch trình khi có lớp đang mở hoặc đang diễn ra!' });
      return;
    }
    setEditingSchedule(null);
    scheduleForm.resetFields();
    setIsScheduleModalVisible(true);
  };

  const handleScheduleEdit = (record) => {
    if (hasActiveClasses) {
      setNotification({ visible: true, type: 'error', message: 'Không thể chỉnh sửa lịch trình khi có lớp đang mở hoặc đang diễn ra!' });
      return;
    }
    setEditingSchedule(record);
    let initialValues = { ...record };
    const criteriaData = record.testData || record.itemsAssessmentCriteria;
    if (criteriaData) {
      initialValues.assessmentCriteriaID = criteriaData.assessmentCriteriaID
        ? String(criteriaData.assessmentCriteriaID)
        : undefined;
      initialValues.testDurationMinutes = criteriaData.duration ?? criteriaData.testDurationMinutes ?? '';
      initialValues.testType = (criteriaData.testType !== undefined && criteriaData.testType !== null && !isNaN(Number(criteriaData.testType)))
        ? Number(criteriaData.testType)
        : undefined;
      initialValues.hasTest = true;
    } else {
      initialValues.assessmentCriteriaID = undefined;
      initialValues.testDurationMinutes = '';
      initialValues.testType = undefined;
      initialValues.hasTest = false;
    }
    scheduleForm.setFieldsValue(initialValues);
    setIsScheduleModalVisible(true);
  };

  const handleScheduleDelete = (id) => {
    if (hasActiveClasses) {
      setNotification({ visible: true, type: 'error', message: 'Không thể xóa lịch trình khi có lớp đang mở hoặc đang diễn ra!' });
      return;
    }
    setDeleteScheduleId(id);
    setScheduleDeleteModalVisible(true);
  };

  const handleScheduleModalOk = async () => {
    try {
      const values = await scheduleForm.validateFields();
      let response;

      // Chuẩn bị dữ liệu cho bulk update
      const scheduleItem = {
        syllabusScheduleID: editingSchedule?.syllabusScheduleID || '',
        content: values.content,
        resources: values.resources,
        lessonTitle: values.lessonTitle,
        durationMinutes: values.durationMinutes,
        hasTest: values.hasTest || false
      };

      // Nếu có test data, thêm vào
      if (values.hasTest) {
        scheduleItem.itemsAssessmentCriteria = {
          assessmentCriteriaID: values.assessmentCriteriaID,
          duration: values.testDurationMinutes,
          testType: Number(values.testType)
        };
      }

      if (editingSchedule) {
        // Bulk update existing schedule
        response = await axios.put(`${API_URL}${endpoints.syllabus.updateSchedule}`, {
          subjectID: subject.code,
          scheduleItems: [scheduleItem]
        });
      } else {
        // Create new schedule
        response = await axios.post(`${API_URL}${endpoints.syllabus.createSyllabusSchedule}`, {
          ...values,
        });
      }

      if (response.data) {
        setNotification({
          visible: true,
          type: 'success',
          message: editingSchedule ? 'Cập nhật lịch trình thành công' : 'Thêm lịch trình thành công'
        });
        setIsScheduleModalVisible(false);
        fetchSyllabusSchedules();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setNotification({
        visible: true,
        type: 'error',
        message: 'Không thể lưu lịch trình',
        description: error.response?.data?.message || 'Vui lòng thử lại sau'
      });
    }
  };

  const handleScheduleDeleteConfirm = async () => {
    try {
      if (!deleteScheduleId) {
        setNotification({ visible: true, type: 'error', message: 'Không tìm thấy ID lịch trình' });
        return;
      }
      await axios.delete(`${API_URL}${endpoints.syllabus.deleteSchedule}/${deleteScheduleId}`);
      setNotification({ visible: true, type: 'success', message: 'Xóa lịch trình thành công' });
      fetchSyllabusSchedules();
      setScheduleDeleteModalVisible(false);
      setDeleteScheduleId(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setNotification({ visible: true, type: 'error', message: 'Không thể xóa lịch trình' });
    }
  };

  // Hàm bulk update cho nhiều lịch trình cùng lúc
  const handleBulkUpdateSchedules = async (schedules, isTestSchedule = false) => {
    try {
      const scheduleItems = schedules.map(schedule => {
        const item = {
          syllabusScheduleID: schedule.syllabusScheduleID,
          content: schedule.content,
          resources: schedule.resources,
          lessonTitle: schedule.lessonTitle,
          durationMinutes: schedule.durationMinutes,
          hasTest: isTestSchedule
        };

        // Ưu tiên lấy từ testData, fallback sang itemsAssessmentCriteria nếu có
        const criteriaData = schedule.testData || schedule.itemsAssessmentCriteria;
        if (criteriaData) {
          item.itemsAssessmentCriteria = {
            assessmentCriteriaID: criteriaData.assessmentCriteriaID,
            duration: criteriaData.duration ?? criteriaData.testDurationMinutes ?? 0,
            testType: criteriaData.testType ?? 0
          };
        }

        return item;
      });

      const response = await axios.put(`${API_URL}${endpoints.syllabus.bulkUpdateSchedule}`, {
        subjectID: subject.code,
        scheduleItems: scheduleItems
      });

      if (response.data) {
        setNotification({
          visible: true,
          type: 'success',
          message: isTestSchedule ? 'Cập nhật lịch kiểm tra thành công' : 'Cập nhật lịch trình giảng dạy thành công'
        });
        fetchSyllabusSchedules();
      }
    } catch (error) {
      console.error('Error bulk updating schedules:', error);
      setNotification({
        visible: true,
        type: 'error',
        message: error.response?.data?.message || (isTestSchedule ? 'Không thể cập nhật lịch kiểm tra' : 'Không thể cập nhật lịch trình giảng dạy'),
        description: error.response?.data?.description || ''
      });
    }
  };

  // Hàm xử lý cập nhật lịch kiểm tra
  const handleTestScheduleUpdate = async (testSchedule) => {
    if (hasActiveClasses) {
      setNotification({
        visible: true,
        type: 'error',
        message: 'Không thể chỉnh sửa lịch kiểm tra khi có lớp đang mở hoặc đang diễn ra!'
      });
      return;
    }

    try {
      await handleBulkUpdateSchedules([testSchedule], true);
    } catch (error) {
      console.error('Error updating test schedule:', error);
      setNotification({
        visible: true,
        type: 'error',
        message: 'Không thể cập nhật lịch kiểm tra',
        description: error.response?.data?.message || 'Vui lòng thử lại sau'
      });
    }
  };

  if (!subject) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>Không tìm thấy thông tin môn học</Title>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/subject')}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification({ ...notification, visible: false })}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/subject')}
          style={{ marginBottom: '16px' }}
        >
          Quay lại
        </Button>
        <Button
          type="default"
          icon={<QuestionCircleOutlined />}
          onClick={() => setHelpVisible(true)}
          style={{ marginBottom: '16px' }}
        >
          Hướng dẫn
        </Button>
      </div>

      <Card loading={loading}>
        <div style={{ padding: '0px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Thông tin môn học</Title>
            <Button
              type="text"
              icon={showSubjectInfo ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => setShowSubjectInfo(!showSubjectInfo)}
            />
          </div>
          {showSubjectInfo && (
            <SubjectInfo
              subject={subject}
              onEdit={handleSubjectEdit}
              onDelete={handleSubjectDelete}
              onToggleStatus={handleToggleSubjectStatus}
              canEdit={canEdit}
              hasActiveClasses={hasActiveClasses}
            />
          )}
          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Danh sách lớp học</Title>
            <Button
              type="text"
              icon={showClasses ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => setShowClasses(!showClasses)}
            />
          </div>
          {showClasses && (
            <SubjectClasses classes={classes} />
          )}
          <Divider />
          

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Lịch trình giảng dạy</Title>
          </div>
          <SyllabusSchedule
            schedules={syllabusSchedules}
            onEdit={canEdit ? handleScheduleEdit : undefined}
            onDelete={canEdit ? handleScheduleDelete : undefined}
            onAdd={undefined}
            subject={subject}
            canEdit={canEdit}
          />
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Tiêu chí đánh giá</Title>
            <Button
              type="text"
              icon={showAssessment ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => setShowAssessment(!showAssessment)}
            />
          </div>
          {showAssessment && (
            <AssessmentCriteria
              assessmentCriteria={assessmentCriteria}
              onEdit={canEdit ? handleAssessmentEdit : undefined}
              subject={subject}
              canEdit={canEdit}
            />
          )}
          <Divider/>  

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Lịch kiểm tra</Title>
          </div>
          <SyllabusSchedule
            schedules={syllabusScheduleTests}
            onEdit={canEdit ? handleScheduleEdit : undefined}
            onDelete={undefined}
            onAdd={undefined}
            subject={subject}
            canEdit={canEdit}
            testMode={true}
          />
          <Divider />

          
        </div>
      </Card>

      {/* Modals */}
      <SubjectModal
        visible={isSubjectModalVisible}
        onOk={handleSubjectModalOk}
        onCancel={() => setIsSubjectModalVisible(false)}
        form={subjectForm}
        initialValues={subject}
      />

      <AssessmentModal
        visible={isAssessmentModalVisible}
        onOk={undefined}
        onCancel={() => setIsAssessmentModalVisible(false)}
        form={assessmentForm}
        initialValues={editingCriteria}
      />

      <ScheduleModal
        visible={isScheduleModalVisible}
        onOk={handleScheduleModalOk}
        onCancel={() => setIsScheduleModalVisible(false)}
        form={scheduleForm}
        initialValues={editingSchedule}
        assessmentCriteriaOptions={assessmentCriteriaOptions}
        testTypeOptions={testTypeOptions}
      />

      <DeleteConfirmModal
        visible={subjectDeleteModalVisible}
        onOk={handleSubjectDeleteConfirm}
        onCancel={() => setSubjectDeleteModalVisible(false)}
      />

      <DeleteConfirmModal
        visible={scheduleDeleteModalVisible}
        onOk={handleScheduleDeleteConfirm}
        onCancel={() => setScheduleDeleteModalVisible(false)}
      />

      {/* Modal xác nhận đổi trạng thái môn học */}
      <Modal
        title={pendingStatus === 1 ? 'Công khai môn học?' : 'Ẩn môn học?'}
        open={statusConfirmVisible}
        onOk={handleStatusConfirmOk}
        onCancel={handleStatusConfirmCancel}
        okText={pendingStatus === 1 ? 'Công khai' : 'Ẩn'}
        cancelText="Hủy"
      >
        <div>
          {pendingStatus === 1
            ? 'Bạn có chắc chắn muốn công khai môn học này? Sau khi công khai, sinh viên sẽ có thể nhìn thấy môn học.'
            : 'Bạn có chắc chắn muốn chuyển môn học về trạng thái nháp? Môn học sẽ không còn hiển thị với sinh viên.'}
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal
        title={<span><QuestionCircleOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: 22 }} />Hướng dẫn sử dụng quản lý môn học</span>}
        open={helpVisible}
        onOk={() => setHelpVisible(false)}
        onCancel={() => setHelpVisible(false)}
        okText="Đã hiểu"
        cancelText="Đóng"
        footer={null}
      >
        <div className="p-8">
          <div className="mb-16">
            <Alert
              message={<b>Lưu ý quan trọng</b>}
              description={
                <div style={{ paddingLeft: 8 , fontSize: 15}}>
                  <div className="mb-4"><b>•</b> Môn học chỉ được chỉnh sửa ở trạng thái <b>Nháp</b>.</div>
                  <div className="mb-4"><b>•</b> Sau khi <b>Công khai</b>, <b>không thể chỉnh sửa</b> môn học.</div>
                  <div><b>•</b> Sau khi tạo môn học, <b>không thể thêm mới</b> tiêu chí hoặc lịch trình, <b>chỉ được phép chỉnh sửa</b> các mục đã có.</div>
                </div>
              }
              type="info"
            // showIcon
            />
          </div>

          {/* <div className="mt-16">
            <Typography.Title level={5} className="mb-8">Chi tiết:</Typography.Title>
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              <li className="mb-8">
                <b>Môn học sau khi công khai không được phép chỉnh sửa.</b>
              </li>
              <li className="mb-8">
                <b>Chỉ được phép chỉnh sửa ở trạng thái Nháp.</b>
              </li>
              <li className="mb-8">
                <b>Môn học sau khi tạo không được phép thêm tiêu chí, lịch trình. Chỉ được phép chỉnh sửa.</b>
              </li>
            </ul>
          </div> */}
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button type="primary" onClick={() => setHelpVisible(false)}>
              Đã hiểu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Syllabus; 