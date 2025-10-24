import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Progress,
  Alert,
  Spin,
  Row,
  Col,
  Radio,
  Checkbox,
  Input,
  Divider,
  Modal,
  message,
  Steps,
  Tabs,
  Tag
} from 'antd';
import { 
  ClockCircleOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReadOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  FileTextOutlined,
  FlagOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const TakeTest = () => {
  const { testEventID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const durationFromViewTest = location.state?.durationMinutes;
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [questionFontSize, setQuestionFontSize] = useState(16);

  // Lấy dữ liệu bài test từ API thật
  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Bạn không được phép truy cập vào kiểm tra này');
          navigate(`/student/view-test/${testEventID}`);
          return;
        }
        const url = `${API_URL}${endpoints.testEvent.getAssignment.replace('{testEventID}', testEventID)}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.data) {
          setTestData(res.data);
          // Timer logic with localStorage
          const attemptKey = `testAttempt_${testEventID}`;
          let attempt = null;
          try {
            attempt = JSON.parse(localStorage.getItem(attemptKey));
          } catch {}
          const now = Date.now();
          let expireTime;
          if (!attempt) {
            // Lần đầu vào làm bài
            const duration = (durationFromViewTest !== undefined ? durationFromViewTest : res.data.durationMinutes) || 0;
            const startTime = now;
            expireTime = startTime + duration * 60 * 1000;
            localStorage.setItem(attemptKey, JSON.stringify({ startTime, expireTime }));
          } else {
            expireTime = attempt.expireTime;
          }
          const timeLeftCalc = Math.floor((expireTime - now) / 1000);
          if (timeLeftCalc <= 0) {
            // Hết giờ
            localStorage.removeItem(attemptKey);
            message.warning('Đã hết giờ! Bài làm sẽ được tự động nộp.');
            setTimeout(() => handleSubmitTest(), 500);
            setTimeLeft(0);
          } else {
            setTimeLeft(timeLeftCalc);
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          message.error('Bạn không được phép truy cập vào kiểm tra này');
          navigate(`/student/view-test/${testEventID}`);
        } else {
          setTestData(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [testEventID, durationFromViewTest]);

  // Timer countdown
  useEffect(() => {
    if (loading) return;
    const attemptKey = `testAttempt_${testEventID}`;
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        const now = Date.now();
        let attempt = null;
        try {
          attempt = JSON.parse(localStorage.getItem(attemptKey));
        } catch {}
        if (!attempt) {
          message.error('Không tìm thấy phiên làm bài.');
          navigate(`/student/view-test/${testEventID}`);
          clearInterval(timer);
          return;
        }
        const remaining = Math.floor((attempt.expireTime - now) / 1000);
        if (remaining <= 0) {
          clearInterval(timer);
          localStorage.removeItem(attemptKey);
          message.warning('Đã hết giờ! Bài làm sẽ được tự động nộp.');
          setTimeout(() => handleSubmitTest(), 500);
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, loading, testEventID, navigate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextSection = () => {
    if (currentSection < testData.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmitTest = () => {
    setShowConfirmSubmit(true);
  };

  // Hàm build payload submit
  const buildSubmitPayload = () => {
    let studentId = '';
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      studentId = user?.accountId || '';
    } catch {}
    return {
      studentId: studentId,
      testEventID: testEventID,
      sectionAnswers: (testData.sections || []).map(section => ({
        sectionID: section.testSectionID,
        formatType: section.formatType,
        answers: (section.questions || []).map(q => ({
          questionID: q.questionID,
          answers: answers[q.questionID]
            ? Array.isArray(answers[q.questionID])
              ? answers[q.questionID]
              : [answers[q.questionID]]
            : []
        }))
      }))
    };
  };

  // Hàm submit bài làm
  const submitTest = async (payload) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}api/StudentTests/submit`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Nộp bài thành công!');
      navigate(`/student/view-test/${testEventID}`, { state: { reloadHistory: true } });
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      message.error('Có lỗi xảy ra khi nộp bài.');
    }
  };

  const confirmSubmit = async () => {
    setShowConfirmSubmit(false);
    const attemptKey = `testAttempt_${testEventID}`;
    localStorage.removeItem(attemptKey);
    const payload = buildSubmitPayload();
    await submitTest(payload);
  };

  const renderQuestion = (question) => {
    return (
      <div>
        {/* Hiển thị hình ảnh nếu có */}
        {question.imageURL && question.imageURL.trim() !== "" && (
          <div className="mb-12">
            <img
              src={question.imageURL.startsWith('http') ? question.imageURL : `/public/images/${question.imageURL}`}
              alt="question"
              style={{ maxWidth: 300, maxHeight: 200 }}
            />
          </div>
        )}
        {/* Hiển thị audio nếu có */}
        {question.audioURL && question.audioURL.trim() !== "" && (
          <div className="mb-12">
            <audio controls src={question.audioURL.startsWith('http') ? question.audioURL : `/public/audio/${question.audioURL}`} />
          </div>
        )}
        {/* Trắc nghiệm */}
        {question.options && Array.isArray(question.options) ? (
          <Radio.Group
            value={answers[question.questionID]}
            onChange={(e) => handleAnswerChange(question.questionID, e.target.value)}
            style={{ fontSize: questionFontSize }}
          >
            <Space direction="vertical" className="w-full">
              {question.options.map((option) => (
                <Radio key={option.optionID} value={option.optionID} style={{ fontSize: questionFontSize }}>
                  {option.context}
                  {/* Hiển thị hình ảnh option nếu có */}
                  {option.imageURL && option.imageURL.trim() !== "" && (
                    <div className="mt-8">
                      <img
                        src={option.imageURL.startsWith('http') ? option.imageURL : `/public/images/${option.imageURL}`}
                        alt="option"
                        style={{ maxWidth: 200, maxHeight: 100 }}
                      />
                    </div>
                  )}
                  {/* Hiển thị audio option nếu có */}
                  {option.audioURL && option.audioURL.trim() !== "" && (
                    <div className="mt-8">
                      <audio controls src={option.audioURL.startsWith('http') ? option.audioURL : `/public/audio/${option.audioURL}`} />
                    </div>
                  )}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        ) : (
          // Tự luận
          <Input.TextArea
            rows={6}
            placeholder="Nhập câu trả lời"
            value={answers[question.questionID] || ''}
            onChange={(e) => handleAnswerChange(question.questionID, e.target.value)}
            style={{ fontSize: questionFontSize }}
          />
        )}
      </div>
    );
  };

  const getSectionIcon = (sectionName) => {
    if (sectionName.toLowerCase().includes('reading')) return <ReadOutlined />;
    if (sectionName.toLowerCase().includes('listening')) return <CustomerServiceOutlined />;
    if (sectionName.toLowerCase().includes('writing')) return <EditOutlined />;
    return <FileTextOutlined />;
  };

  // Scroll đến câu hỏi theo id
  const scrollToQuestion = (questionID) => {
    const el = document.getElementById(`question-${questionID}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Gắn/bỏ cờ câu hỏi
  const toggleFlag = (questionID) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionID)
        ? prev.filter((id) => id !== questionID)
        : [...prev, questionID]
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!testData) {
    return <Alert message="Không tìm thấy thông tin bài kiểm tra" type="error" showIcon className="m-24" />;
  }

  const sections = testData.sections || [];
  const currentSectionData = sections[currentSection];
  const totalQuestions = sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
  const answeredCount = Object.keys(answers).length;
  const progressByQuestions = (answeredCount / totalQuestions) * 100;

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 32, margin: 24 }}>
      {/* Header */}
      <div className="mb-24">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/student/view-test/${testEventID}`)}
          className="mb-16"
        >
          Quay lại
        </Button>
        <Title level={2} style={{ fontWeight: 700, margin: 0 }}>
          {testData.testName || 'Bài kiểm tra'}
        </Title>
      </div>

      {/* Timer and Progress */}
      <Row gutter={16} className="mb-24">
        <Col xs={24} md={12}>
          <Alert
            message={`Thời gian còn lại: ${formatTime(timeLeft)}`}
            type={timeLeft < 300 ? 'warning' : 'info'}
            icon={<ClockCircleOutlined />}
            showIcon
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ textAlign: 'right' }}>
            <Text>Tiến độ: {answeredCount}/{totalQuestions} câu hỏi</Text>
            <Progress percent={progressByQuestions} size="small" className="mt-8" />
          </div>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Main content */}
        <Col xs={24} md={18} lg={19}>
          {/* Điều chỉnh cỡ chữ */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Điều chỉnh cỡ chữ:</span>
            <Button size="small" onClick={() => setQuestionFontSize(f => Math.max(12, f - 2))}>A-</Button>
            <Button size="small" onClick={() => setQuestionFontSize(f => Math.min(32, f + 2))}>A+</Button>
            <span style={{ fontSize: 12, color: '#888' }}>{questionFontSize}px</span>
          </div>
          {/* Navigation section (chọn phần làm bài) */}
          <Card className="mb-24">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sections.map((section, index) => {
                const sectionAnsweredCount = (section.questions || []).filter(q => answers[q.questionID] !== undefined).length;
                const isCompleted = sectionAnsweredCount === (section.questions?.length || 0);
                return (
                  <Button
                    key={section.testSectionID || index}
                    type={currentSection === index ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setCurrentSection(index)}
                    style={{
                      minWidth: 140,
                      height: 'auto',
                      padding: '8px 12px',
                      backgroundColor: isCompleted ? '#52c41a' : undefined,
                      borderColor: isCompleted ? '#52c41a' : undefined,
                      color: isCompleted ? 'white' : undefined
                    }}
                  >
                    <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                      <div className="font-medium">{section.context || `Phần ${index + 1}`}</div>
                      <div style={{ fontSize: '10px', opacity: 0.8, marginTop: 2 }}>
                        {sectionAnsweredCount}/{section.questions?.length || 0} câu
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </Card>
          <Card>
            <div className="mb-24">
              <Title level={3}>{currentSectionData?.context || `Phần ${currentSection + 1}`}</Title>
              <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>
                {currentSectionData?.description}
              </Paragraph>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* <Text type="secondary">
                  Thời gian cho phần này: {currentSectionData?.timeLimit || ''} phút
                </Text> */}
                <Text type="secondary">
                  {(currentSectionData?.questions?.length || 0)} câu hỏi
                </Text>
              </div>
            </div>

            <Divider />

            {/* Questions in current section */}
            <div className="mb-32">
              {(currentSectionData?.questions || []).map((question, index) => (
                <div id={`question-${question.questionID}`} key={question.questionID} style={{ marginBottom: 32, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8, position: 'relative', fontSize: questionFontSize }}>
                  <FlagOutlined
                    style={{
                      color: flaggedQuestions.includes(question.questionID) ? '#1890ff' : '#bbb',
                      fontSize: 20,
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onClick={() => toggleFlag(question.questionID)}
                    title={flaggedQuestions.includes(question.questionID) ? 'Bỏ gắn cờ' : 'Gắn cờ lưu ý'}
                  />
                  <div className="mb-16">
                    <span style={{ fontWeight: 600 }}>Câu {index + 1}:</span>
                    <span className="ml-8">{question.content}</span>
                  </div>

                  <div style={{ marginBottom: 16, fontSize: questionFontSize }}>
                    {renderQuestion(question)}
                  </div>

                  {/* Question status indicator */}
                  <div className="mt-8">
                    {answers[question.questionID] !== undefined ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Đã trả lời
                      </Tag>
                    ) : (
                      <Tag color="orange">
                        Chưa trả lời
                      </Tag>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handlePrevSection}
                disabled={currentSection === 0}
              >
                Trang trước
              </Button>

              <Space>
                {currentSection < sections.length - 1 ? (
                  <Button type="primary" onClick={handleNextSection}>
                    Trang sau
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    danger
                    icon={<CheckCircleOutlined />}
                    onClick={handleSubmitTest}
                  >
                    Nộp bài
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </Col>
        {/* Sidebar câu hỏi - chuyển sang phải, sticky */}
        <Col xs={24} md={6} lg={5} style={{ marginBottom: 24, position: 'sticky', top: 32, alignSelf: 'flex-start', zIndex: 2 }}>
          <Card title="Danh sách câu hỏi" bordered className="min-h-[300px]">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(currentSectionData?.questions || []).map((question, idx) => (
                <Button
                  key={question.questionID}
                  size="small"
                  type="default"
                  style={{
                    width: 44,
                    height: 44,
                    padding: 0,
                    borderColor: flaggedQuestions.includes(question.questionID) ? '#1890ff' : undefined,
                    background: flaggedQuestions.includes(question.questionID) ? '#e6f7ff' : undefined,
                    position: 'relative',
                  }}
                  onClick={() => scrollToQuestion(question.questionID)}
                >
                  <span style={{ fontWeight: 600 }}>{idx + 1}</span>
                  <FlagOutlined
                    style={{
                      color: flaggedQuestions.includes(question.questionID) ? '#1890ff' : '#bbb',
                      fontSize: 16,
                      position: 'absolute',
                      right: 4,
                      top: 4,
                      cursor: 'pointer',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      toggleFlag(question.questionID);
                    }}
                  />
                </Button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Confirm Submit Modal */}
      <Modal
        title="Xác nhận nộp bài"
        open={showConfirmSubmit}
        onOk={confirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        okText="Nộp bài"
        cancelText="Tiếp tục làm bài"
      >
        <p>Bạn có chắc chắn muốn nộp bài kiểm tra?</p>
        <p>Đã trả lời: {answeredCount}/{totalQuestions} câu hỏi</p>
        {answeredCount < totalQuestions && (
          <Alert
            message="Cảnh báo"
            description={`Bạn chưa trả lời ${totalQuestions - answeredCount} câu hỏi. Bạn có muốn tiếp tục?`}
            type="warning"
            showIcon
            className="mt-16"
          />
        )}
      </Modal>
    </div>
  );
};

export default TakeTest; 