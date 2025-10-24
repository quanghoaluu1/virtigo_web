import React, { useState, useEffect } from 'react';
import { Button, Modal, message, Row, Col, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAssessmentsTableColumns } from './AssessmentsTableComponent';
import AssessmentBasicForm from './create/AssessmentBasicForm';
import CreateAssessmentStepper from './create/CreateAssessmentStepper';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import ViewDetailAssessment from './ViewDetailAssessment';
import * as XLSX from 'xlsx';
import AssessmentsTable from './AssessmentsTableComponent';
import Notification from '../common/Notification';


const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Drafted', label: 'Nháp' },
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Rejected', label: 'Từ chối' },
  { value: 'Actived', label: 'Đang hoạt động' },
  { value: 'Deleted', label: 'Đã xóa' },
];

const CATEGORY_LABELS = {
  Quiz: 'Kiểm tra 15 phút',
  Midterm: 'Thi giữa kì',
  Final: 'Thi cuối kì',
};
const ALLOWED_CATEGORIES = ['Quiz', 'Midterm', 'Final'];
const TEST_TYPE_ENUM_MAP = {
  Vocabulary: 1,
  Grammar: 2,
  Listening: 3,
  Reading: 4,
  Writing: 5,
  Mix: 6,
  MCQ: 7,
  Other: 8,
};
const CATEGORY_ENUM_MAP = {
  0: 'Quiz',
  2: 'Midterm',
  3: 'Final',
};

const TEST_SECTION_TYPE_ENUM_MAP = {
  MCQ: 0,
  TrueFalse: 1,
  Writing: 2,
};

const CATEGORY_ENUM_REVERSE_MAP = {
  Quiz: 0,
  Midterm: 2,
  Final: 3,
};

const Assessments = () => {
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Actived');
  const [searchText, setSearchText] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    basicInfo: {},
    sections: [],
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Thêm state cho phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(200);
  const [total, setTotal] = useState(0);
const [savingType, setSavingType] = useState(null);
const [isPopupOpen, setIsPopupOpen] = useState(false);
  // Thêm state cho popup gửi duyệt
  const [sendApproveModal, setSendApproveModal] = useState(false);
  const [sendApproveLoading, setSendApproveLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Modal cho Lecturer
  const [lecturerModal, setLecturerModal] = useState(false);
  const [lecturerLoading, setLecturerLoading] = useState(false);

  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });

  useEffect(() => {
    if (location.state?.showNotification) {
      setNotification({
        visible: true,
        type: location.state.notificationType || 'success',
        message: location.state.notificationMessage || 'Thành công',
        description: location.state.notificationDescription || '',
      });
      // Xóa state để reload lại không hiện lại notification
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('user from localStorage:', user);
    setUserRole(user.role);
  }, []);

  // Fetch subjects từ API khi vào trang
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_URL}api/Subject/get-all?status=1`);
        setSubjects(res.data || []);
      } catch (e) {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch tests từ API (dùng get-by-status, có phân trang)
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get(`${API_URL}api/Test/get-by-status`, {
          params: {
            status: statusFilter,
            page,
            pageSize,
          }
        });
        const items = res.data?.items || [];
        setTotal(res.data?.total || 0);
        // Map đúng các trường cần thiết cho bảng
        const mapped = items.map(item => ({
          testID: item.testID,
          createdByName: item.createdByName,
          subjectName: item.subjectName,
          createAt: item.createAt,
          Status: statusFilter, // hoặc item.status nếu muốn dùng số
          testSections: item.testSections || [],
        }));
        setData(mapped);
      } catch (e) {
        setData([]);
        setTotal(0);
      }
    };
    fetchTests();
  }, [statusFilter, page, pageSize]);

  // Filter + search
  let currentUser = {};
  let currentRole = null;
  let currentAccountId = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('user')) || {};
    currentRole = currentUser.role;
    currentAccountId = currentUser.accountId;
  } catch {}
  const isManager = currentRole === 'Manager';
  const isLecturer = currentRole === 'Lecture' || currentRole === 'Lecturer';
  const filteredData = data.filter(item => {
    const matchStatus = statusFilter === 'all' || item.Status === statusFilter;
    const matchSearch =
      (item.testName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.subjectName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.createdByName || '').toLowerCase().includes(searchText.toLowerCase());
    // Nếu là Lecturer chỉ xem bài của mình (so sánh createBy với accountId)
    if (isLecturer) {
      return matchStatus && matchSearch && item.createBy === currentAccountId;
    }
    // Manager xem tất cả
    return matchStatus && matchSearch;
  });

  // Handlers
  const handleView = (record) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'Manager') {
      navigate(`/dashboard/assessment/${record.testID}`);
    } else if (user.role === 'Lecture' || user.role === 'Lecturer' || user.role === 'Teacher') {
      navigate(`/lecturer/assessment/${record.testID}`);
    } else {
      navigate(`/assessment/${record.testID}`);
    }
  };
  const handleEdit = (record) => {
    Modal.info({
      title: 'Chức năng sửa (demo)',
      content: 'Chức năng này sẽ được phát triển sau.',
    });
  };
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa bài kiểm tra "${record.testName}"?`,
      onOk: () => {
        setData(prev => prev.filter(item => item.testID !== record.testID));
        setNotification({
          visible: true,
          type: 'success',
          message: 'Xóa bài kiểm tra thành công!',
          description: `Bài kiểm tra "${record.testName}" đã được xóa khỏi hệ thống.`
        });
      },
    });
  };

  // Handler for create submit
  const handleCreateSubmit = (values) => {
    setData(prev => [
      {
        ...values,
        testID: 'T' + (Math.floor(Math.random() * 10000)).toString().padStart(4, '0'),
        Status: 'Drafted',
        testType: 'Mix',
        createdBy: 'A00000',
        category: values.category,
      },
      ...prev,
    ]);
    setShowCreate(false);
    setFormData({ basicInfo: {}, sections: [] });
    setNotification({
      visible: true,
      type: 'success',
      message: 'Tạo bài kiểm tra thành công!',
      description: `Bài kiểm tra "${values.TestName || 'Không tên'}" đã được lưu vào hệ thống.`
    });
  };

  // Handler khi hoàn thành stepper
  const handleStepperFinish = () => {
    console.log('Bấm hoàn thành!');
    if (userRole === 'Lecture') {
      console.log('Set lecturerModal true');
      setLecturerModal(true);
    } else if (userRole === 'Manager') {
      setOpenModal(true);
    }
  };

  // Hàm tạo test chung cho cả Manager và Lecturer
  const handleCreateTest = async (statusType) => {
    // statusType: 'Drafted', 'Pending', 'Actived'
    // 'Pending' chỉ dùng cho Lecturer gửi duyệt
    setModalLoading(true);
    setLecturerLoading(true);
    const basicInfo = formData.basicInfo;
    const sections = formData.sections;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const accountID = user.accountId;
      // 1. Tạo bài kiểm tra
      const payload = {
        accountID,
        subjectID: basicInfo.SubjectID,
        testType: TEST_TYPE_ENUM_MAP[basicInfo.testType],
        category: CATEGORY_ENUM_REVERSE_MAP[basicInfo.Category],
        testName: basicInfo.TestName,
      };
      const res = await axios.post(`${API_URL}api/Test/create`, payload);
      const newTestID = res.data?.testId;
      if (!newTestID) throw new Error("Không lấy được testID từ response");
      // 2. Tạo section cho từng section
      const sectionQuestionIdMap = [];
      const generatedQuestionsBySection = [];
      for (const section of sections) {
        const testSectionType = TEST_SECTION_TYPE_ENUM_MAP[section.type];
        const sectionRes = await axios.post(`${API_URL}api/TestSection`, {
          testID: newTestID,
          context: section.name,
          imageURL: section.imageURL || null,
          audioURL: section.audioURL || null,
          testSectionType,
          score: section.score,
          requestingAccountID: accountID,
        });
        const testSectionId = sectionRes.data?.testSectionId;
        if (!testSectionId) throw new Error("Không lấy được testSectionId từ response");
        const emptyQRes = await axios.post(`${API_URL}api/Questions/generate-empty`, {
          testSectionID: testSectionId,
          formatType: testSectionType,
          numberOfQuestions: section.questions.length,
        });
        const generatedQuestions = (emptyQRes.data?.data || []);
        const questionIDs = generatedQuestions.map(q => q.questionID);
        sectionQuestionIdMap.push({ testSectionId, questionIDs });
        generatedQuestionsBySection.push(generatedQuestions);
      }
      // 3. Cập nhật nội dung cho từng câu hỏi
      for (let sIdx = 0; sIdx < sections.length; ++sIdx) {
        const section = sections[sIdx];
        const questionIDs = sectionQuestionIdMap[sIdx].questionIDs;
        const generatedQuestions = generatedQuestionsBySection[sIdx];
        for (let qIdx = 0; qIdx < section.questions.length; ++qIdx) {
          const question = section.questions[qIdx];
          const questionID = questionIDs[qIdx];
          let answersWithMcqID = (question.answers || []);
          if (generatedQuestions && generatedQuestions[qIdx] && generatedQuestions[qIdx].options) {
            answersWithMcqID = answersWithMcqID.map((a, aIdx) => ({
              ...a,
              mcqOptionID: generatedQuestions[qIdx].options[aIdx]?.mcqOptionID
            }));
          }
          const options = (answersWithMcqID || []).map((ans, aIdx) => ({
            mcqOptionID: ans.mcqOptionID,
            context: ans.text,
            imageURL: ans.imageURL || "",
            audioURL: ans.audioURL || "",
            isCorrect: question.correct === aIdx,
          }));
          await axios.put(`${API_URL}api/Questions/questions/update`, {
            questionID,
            context: question.content,
            imageURL: question.imageURL || "",
            audioURL: question.audioURL || "",
            options,
          });
          // Nếu là câu hỏi viết (section.type === 'Writing') và có barem
          if (section.type === 'Writing' && Array.isArray(question.criteriaList) && question.criteriaList.length > 0) {
            // Gọi API tạo barem điểm cho writing
            const barems = question.criteriaList.map(barem => ({
              questionID,
              criteriaName: barem.criteriaName,
              maxScore: barem.maxScore,
              description: barem.description,
            }));
            await axios.post(`${API_URL}WritingBarem/bulk-create`, { barems });
          }
        }
      }
      // 4. Cập nhật trạng thái test
      if (statusType === 'Actived') {
        await axios.put(`${API_URL}api/Test/update-status-fix`, { testID: newTestID, testStatus: 3 });
        setNotification({
          visible: true,
          type: 'success',
          message: 'Tạo bài kiểm tra thành công!',
          description: `Bài kiểm tra "${basicInfo.TestName || 'Không tên'}" đã được tạo và chuyển sang trạng thái Đang hoạt động.`
        });
      } else if (statusType === 'Pending') {
        await axios.put(`${API_URL}api/Test/update-status-fix`, { testID: newTestID, testStatus: 1 });
        setNotification({
          visible: true,
          type: 'success',
          message: 'Gửi duyệt thành công!',
          description: `Bài kiểm tra "${basicInfo.TestName || 'Không tên'}" đã được gửi cho quản lý duyệt.`
        });
      } else {
        setNotification({
          visible: true,
          type: 'success',
          message: 'Tạo bài kiểm tra thành công!',
          description: `Bài kiểm tra "${basicInfo.TestName || 'Không tên'}" đã được lưu dưới dạng bản nháp.`
        });
      }
      setShowCreate(false);
      setFormData({ basicInfo: {}, sections: [] });
      setOpenModal(false);
      setLecturerModal(false);
      setModalLoading(false);
      setLecturerLoading(false);
      setPage(1); // Đảm bảo useEffect sẽ fetch lại danh sách mới nhất
      // Điều hướng về đúng sidebar
      if (userRole === 'Lecturer' || userRole === 'Lecture') {
        navigate('/lecturer/assessment');
      } else if (userRole === 'Manager') {
        navigate('/dashboard/assessment');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      setNotification({
        visible: true,
        type: 'error',
        message: 'Tạo bài kiểm tra thất bại!',
        description: 'Đã xảy ra lỗi khi tạo bài kiểm tra. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.'
      });
      setModalLoading(false);
      setLecturerLoading(false);
    }
  };

  // Handler khi chọn môn học
  const handleSubjectChange = async (subjectID) => {
    if (!subjectID) {
      setCategoryOptions([]);
      setFormData(f => ({ ...f, basicInfo: { ...f.basicInfo, subjectID: undefined, category: undefined } }));
      return;
    }
    setFormData(f => ({ ...f, basicInfo: { ...f.basicInfo, subjectID: subjectID, category: undefined } }));
    try {
      const res = await fetch(`${API_URL}api/AssessmentCriteria/get-by-subject/${subjectID}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const ALLOWED_CATEGORY_NUMS = [0, 2, 3];
        const cats = Array.from(
          new Set(
            data.data
              .filter(item => ALLOWED_CATEGORY_NUMS.includes(item.category))
              .map(item => CATEGORY_ENUM_MAP[item.category])
          )
        );
        setCategoryOptions(cats);
        console.log('categoryOptions:', cats);
      } else {
        setCategoryOptions([]);
      }
    } catch (e) {
      setCategoryOptions([]);
    }
  };

  const [userRole, setUserRole] = useState(null);

  // Add this handler for Excel import
  const handleImportExcel = async (file, sectionIdx = 0) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_URL}api/ImportExcel/mcq/import/excel`, {
        method: 'POST',
        body: formData,
      });
      const apiData = await response.json();
      // Map API data to FE format
      if (apiData && Array.isArray(apiData.data)) {
        const questions = apiData.data.map(q => {
          // Collect all optionX (A, B, C, D, ...)
          const answers = Object.keys(q)
            .filter(key => key.startsWith('option'))
            .map(key => ({
              text: q[key],
              key: key.replace('option', ''),
            }));
          // Find correct answer index
          const correctIdx = q.correctAnswer
            ? answers.findIndex(a => a.key === q.correctAnswer)
            : 0;
          return {
            content: q.content,
            answers,
            correct: correctIdx,
          };
        });
        setFormData(prev => {
          const newSections = [...(prev.sections || [])];
          if (!newSections[sectionIdx]) return prev;
          newSections[sectionIdx] = {
            ...newSections[sectionIdx],
            questions,
          };
          return { ...prev, sections: newSections };
        });
      } else {
        message.error('Dữ liệu file không hợp lệ!');
      }
    } catch (err) {
      message.error('Lỗi khi import file Excel!');
    }
  };

  // Callback duyệt bài kiểm tra (Manager)
  const handleApprove = async () => {
    if (!selectedTestDetail) return;
    setDetailApproving(true);
    try {
      await axios.put(`${API_URL}api/Test/update-status-fix`, { testID: selectedTestDetail.testID, testStatus: 3 });
      setSelectedTestDetail({ ...selectedTestDetail, status: 3 });
      message.success('Đã duyệt bài kiểm tra!');
    } catch (e) {
      message.error('Lỗi khi duyệt bài kiểm tra!');
    } finally {
      setDetailApproving(false);
    }
  };

  // Callback gửi duyệt (Lecturer)
  const handleSendApprove = async () => {
    if (!selectedTestDetail) return;
    setDetailApproving(true);
    try {
      await axios.put(`${API_URL}api/Test/update-status-fix`, { testID: selectedTestDetail.testID, testStatus: 1 });
      setSelectedTestDetail({ ...selectedTestDetail, status: 1 });
      message.success('Đã gửi bài kiểm tra cho quản lí duyệt!');
    } catch (e) {
      message.error('Lỗi khi gửi duyệt!');
    } finally {
      setDetailApproving(false);
    }
  };

  return (
    <div>
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification(n => ({ ...n, visible: false }))}
      />
      {!showCreate ? (
        <>
          <AssessmentsTable
            data={data}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSendApprove={handleSendApprove}
            searchText={searchText}
            setSearchText={setSearchText}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onCreate={() => setShowCreate(true)}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
          />
        </>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, margin: '0 auto', maxWidth: 900, boxShadow: '0 2px 8px #f0f1f2' }}>
          <h2 className="mb-24">Tạo bài kiểm tra mới</h2>
          <CreateAssessmentStepper
            formData={formData}
            setFormData={setFormData}
            onFinish={handleStepperFinish}
            showNotify={({ type, message: msg, description }) => message[type](msg)}
            subjects={subjects}
            categoryOptions={categoryOptions}
            onSubjectChange={handleSubjectChange}
            onImportExcel={handleImportExcel}
          />
        </div>
      )}
    <Modal
  open={openModal}
  title="Bạn muốn lưu bài kiểm tra ở trạng thái nào?"
  onCancel={() => {
    setOpenModal(false);
    setSavingType(null);
  }}
  footer={[
    <Button
      key="back"
      onClick={() => {
        setOpenModal(false);
        setSavingType(null);
      }}
      disabled={modalLoading}
    >
      Quay lại
    </Button>,

    (!savingType || savingType === 'Drafted') && (
      <Button
        key="drafted"
        loading={modalLoading && savingType === 'Drafted'}
        onClick={async () => {
          setSavingType('Drafted');
          setModalLoading(true);
          await handleCreateTest('Drafted');
          setModalLoading(false);
          setSavingType(null);
        }}
      >
        Lưu dưới dạng bản nháp
      </Button>
    ),

    (!savingType || savingType === 'Actived') && (
      <Button
        key="actived"
        type="primary"
        loading={modalLoading && savingType === 'Actived'}
        onClick={async () => {
          setSavingType('Actived');
          setModalLoading(true);
          await handleCreateTest('Actived');
          setModalLoading(false);
          setSavingType(null);
        }}
      >
        Lưu và kích hoạt
      </Button>
    )
  ]}
/>

      <Modal
        open={lecturerModal}
        title="Bạn có xác nhận tạo bài test này không?"
        onCancel={() => setLecturerModal(false)}
        footer={[
          <Button key="back" onClick={() => setLecturerModal(false)}>
            Quay lại
          </Button>,
          <Button key="drafted" loading={lecturerLoading} onClick={async () => { await handleCreateTest('Drafted'); }}>
            Xác nhận tạo
          </Button>,
          <Button key="pending" type="primary" loading={lecturerLoading} onClick={async () => { await handleCreateTest('Pending'); }}>
            Hoàn tất và gửi duyệt
          </Button>,
        ]}
      >
        Chọn hành động cho bài kiểm tra sau khi tạo.
      </Modal>
    </div>
  );
};

export default Assessments;
