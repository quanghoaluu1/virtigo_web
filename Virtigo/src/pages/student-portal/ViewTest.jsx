import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Typography,
  Descriptions,
  Button,
  Space,
  Tag,
  Divider,
  Alert,
  Spin,
  Row,
  Col,
  List,
  Avatar,
  Modal,
  Input,
  Table
} from 'antd';
import {
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import Notification from '../../components/common/Notification';

const { Title, Text, Paragraph } = Typography;

const statusMap = {
  0: 'Sắp diễn ra',
  1: 'Đang diễn ra',
  2: 'Đã kết thúc',
  3: 'Đã xóa'
};

const testTypeMap = {
  0: 'Không xác định',
  1: 'Từ vựng',
  2: 'Ngữ pháp',
  3: 'Nghe hiểu',
  4: 'Đọc hiểu',
  5: 'Viết',
  6: 'Tổng hợp',
  7: 'Trắc nghiệm',
  8: 'Khác',
};

const studentTestStatusMap = {
  Pending: 'Chưa làm',
  Submitted: 'Đã nộp bài',
  AutoGradedWaitingForWritingGrading: 'Đã chấm tự động',
  WaitingForWritingGrading: 'Chờ chấm tự luận',
  Graded: 'Đã chấm',
  Published: 'Đã công bố điểm',
};

const ViewTest = () => {
  const { testEventID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sections, setSections] = useState([]);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState({ visible: false, type: 'error', message: '', description: '' });

  // Lấy lịch sử làm bài
  const fetchHistory = useCallback(async (testEventID) => {
    try {
      let accountId = '';
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        accountId = user?.accountId || '';
      } catch {}
      if (!accountId) {
        setHistory([]);
        localStorage.removeItem('studentTestHistory');
        return;
      }
      // Gọi API trả về tất cả kết quả
      const res = await axios.get(`${API_URL}api/StudentTests/list-test-results/${testEventID}`);
      if (Array.isArray(res.data)) {
        // Lọc lại chỉ lấy kết quả của accountId hiện tại
        const filtered = res.data.filter(item => item.studentID === accountId);
        setHistory(filtered);
        localStorage.setItem('studentTestHistory', JSON.stringify(filtered));
      } else {
        setHistory([]);
        localStorage.removeItem('studentTestHistory');
      }
    } catch (err) {
      setHistory([]);
      localStorage.removeItem('studentTestHistory');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}${endpoints.testEvent.getById.replace('{testEventID}', testEventID)}`);
        if (res.data && res.data.success && res.data.data) {
          setTestData(res.data.data);
          fetchHistory(testEventID);
        } else {
          setTestData(null);
        }
      } catch (err) {
        setTestData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Nếu vừa nộp bài xong, luôn fetch lại lịch sử
    if (location.state?.reloadHistory) {
      fetchHistory(testEventID);
      // Xóa flag reloadHistory để tránh fetch lại không cần thiết
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [testEventID, fetchHistory, location.state, navigate, location.pathname]);

  useEffect(() => {
    const fetchSections = async () => {
      if (testData && testData.testID) {
        try {
          const res = await axios.get(`${API_URL}api/TestSection/by-test/${testData.testID}`);
          if (Array.isArray(res.data)) {
            setSections(res.data);
          } else {
            setSections([]);
          }
        } catch (err) {
          setSections([]);
        }
      } else {
        setSections([]);
      }
    };
    fetchSections();
  }, [testData]);

  const handleStartTest = () => {
    // Kiểm tra thời gian hiện tại có nằm trong khoảng kiểm tra không
    if (testData && testData.startAt && testData.endAt) {
      const now = dayjs();
      const start = dayjs(testData.startAt);
      const end = dayjs(testData.endAt);
      if (now.isBefore(start)) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Chưa đến thời gian làm bài',
          description: 'Vui lòng đợi đến khi bài kiểm tra bắt đầu.'
        });
        return;
      }
      if (now.isAfter(end)) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Đã hết thời gian làm bài',
          description: 'Bạn không thể vào làm bài nữa.'
        });
        return;
      }
    }
    if (testData && testData.password) {
      setPasswordModalVisible(true);
      setInputPassword('');
      setPasswordError('');
      return;
    }
    if (testData && testData.testID) {
      navigate(`/student/take-test/${testEventID}`, { state: { durationMinutes: testData.durationMinutes } });
    }
  };

  const handlePasswordOk = () => {
    if (inputPassword === testData.password) {
      setPasswordModalVisible(false);
      navigate(`/student/take-test/${testEventID}`, { state: { durationMinutes: testData.durationMinutes } });
    } else {
      setPasswordError('Mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
    setInputPassword('');
    setPasswordError('');
  };

  const handleViewResult = () => {
    if (testData && testData.testID) {
      navigate(`/student/test-result/${testData.testID}`);
    }
  };

  const testSectionTypeMap = {
    0: 'Trắc nghiệm',
    1: 'Đúng/Sai',
    2: 'Viết luận',
  };

  // Thêm biến kiểm tra giới hạn số lần làm bài
  const hasReachedAttemptLimit = testData?.attemptLimit > 0 && history.length >= testData.attemptLimit;

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

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 32, margin: 24 }}>
      {/* Header */}
      <div className="mb-24">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/student/test-schedule')}
          className="mb-16"
        >
          Quay lại lịch kiểm tra
        </Button>
        <Title level={2} style={{ fontWeight: 700, margin: 0 }}>
          {testData.lessonTitle || testData.description || 'Bài kiểm tra'}
        </Title>
      </div>

      <Row gutter={24}>
        {/* Main content */}
        <Col xs={24} lg={16}>
          <Card>
            <Descriptions title="Thông tin bài kiểm tra" bordered column={1}>
              {/* <Descriptions.Item label="Mã bài kiểm tra">
                {testData.testID}
              </Descriptions.Item> */}
              <Descriptions.Item label="Tên bài kiểm tra">
                {testData.description || 'Bài kiểm tra'}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Mô tả">
                {testData.description}
              </Descriptions.Item> */}
              <Descriptions.Item label="Thời gian kiểm tra">
                <Space>
                  <CalendarOutlined />
                  {testData.startAt ? dayjs(testData.startAt).format('DD/MM/YYYY') : ''}
                  {testData.startAt ? dayjs(testData.startAt).format('HH:mm') : ''}
                  {testData.startAt && testData.endAt ? '-' : ''}
                  {testData.endAt ? dayjs(testData.endAt).format('HH:mm') : ''}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian làm bài">
                {testData.durationMinutes ? `${testData.durationMinutes} phút` : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Loại bài kiểm tra">
                {testTypeMap[testData.testType] || 'Không xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Giới hạn lượt làm">
                {testData.attemptLimit}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(statusMap[testData.status])} icon={getStatusIcon(statusMap[testData.status])}>
                  {statusMap[testData.status] || 'Không xác định'}
                </Tag>
              </Descriptions.Item> */}
            </Descriptions>

            {/* Bảng thông tin các phần của bài kiểm tra */}
            {sections.length > 0 && (
              <>
                <Divider />
                <Table
                  dataSource={sections.map((s, idx) => ({
                    key: s.testSectionID || idx,
                    context: s.context,
                    testSectionType: testSectionTypeMap[s.testSectionType],
                    score: s.score,
                  }))}
                  columns={[
                    { title: 'Nội dung', dataIndex: 'context', key: 'context' },
                    { title: 'Dạng', dataIndex: 'testSectionType', key: 'testSectionType' },
                    { title: 'Điểm', dataIndex: 'score', key: 'score' },
                  ]}
                  pagination={false}
                  bordered
                  title={() => (
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      Các phần của bài kiểm tra
                    </span>
                  )}
                />
              </>
            )}

            {/* Bảng thông tin tiết học nếu có */}
            {testData.classLessonID && (
              <>
                <Divider />
                <Descriptions title="Thông tin tiết học liên quan" bordered column={1}>
                  {/* <Descriptions.Item label="Mã tiết học">
                    {testData.classLessonID}
                  </Descriptions.Item> */}
                  <Descriptions.Item label="Tên tiết học">
                    {testData.lessonTitle}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian bắt đầu">
                    {testData.lessonStartTime ? dayjs(testData.lessonStartTime).format('DD/MM/YYYY HH:mm') : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian kết thúc">
                    {testData.lessonEndTime ? dayjs(testData.lessonEndTime).format('DD/MM/YYYY HH:mm') : ''}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {/* Bảng lịch sử làm bài */}
            {history.length > 0 && (
              <>
                <Divider />
                <Table
                  dataSource={history.map((h, idx) => ({
                    key: h.attemptId || h.studentTestID || idx,
                    startTime: h.startTime,
                    submitTime: h.submitTime,
                    status: h.status,
                    // Lấy điểm tổng từ originalSubmissionScore
                    originalSubmissionScore: h.originalSubmissionScore,
                    // Tính maxScore nếu có sections
                    maxScore: Array.isArray(h.sections)
                      ? h.sections.reduce((sum, s) => sum + (s.sectionScore || 0), 0)
                      : '',
                    attemptId: h.attemptId || h.studentTestID
                  }))}
                  columns={[
                    { title: 'Bắt đầu', dataIndex: 'startTime', key: 'startTime', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '', align: 'center' },
                    { title: 'Nộp bài', dataIndex: 'submitTime', key: 'submitTime', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '', align: 'center' },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: v => studentTestStatusMap[v] || v, align: 'center' },
                    { 
                      title: 'Điểm', 
                      dataIndex: 'originalSubmissionScore', 
                      key: 'originalSubmissionScore',
                      render: (v, record) =>
                        (record.status === 'Published' || record.status === 'Graded') && v !== undefined
                          ? (record.maxScore ? `${v}/${record.maxScore}` : v)
                          : '',
                      align: 'center' 
                    },
                    {
                      title: 'Chi tiết',
                      key: 'action',
                      align: 'center',
                      render: (_, record) => (
                        (record.status === 'Published' || record.status === 'Graded') ? (
                          <Button 
                            size="small" 
                            onClick={() => navigate(`/student/test-detail/${record.attemptId}`)}
                          >
                            Xem chi tiết
                          </Button>
                        ) : null
                      )
                    }
                  ]}
                  pagination={false}
                  bordered
                  title={() => (
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      Lịch sử làm bài
                    </span>
                  )}
                />
              </>
            )}

          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="Thao tác">
            <Space direction="vertical" className="w-full">
              {hasReachedAttemptLimit && (
                <Alert
                  message="Đã đạt giới hạn số lần làm bài"
                  description={`Bạn đã làm bài đủ ${testData.attemptLimit} lần. Không thể làm lại.`}
                  type="warning"
                  showIcon
                />
              )}

              {!hasReachedAttemptLimit && statusMap[testData.status] === 'Sắp diễn ra' && (
                <Alert
                  message="Bài kiểm tra chưa bắt đầu"
                  description="Vui lòng đợi đến thời gian quy định để bắt đầu làm bài."
                  type="info"
                  showIcon
                />
              )}

              {!hasReachedAttemptLimit && statusMap[testData.status] === 'Đang diễn ra' && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleStartTest}
                  icon={<FileTextOutlined />}
                >
                  Bắt đầu làm bài
                </Button>
              )}

              {statusMap[testData.status] === 'Đã hoàn thành' && (
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={handleViewResult}
                  icon={<CheckCircleOutlined />}
                >
                  Xem kết quả chi tiết
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Modal nhập mật khẩu */}
      <Modal
        title="Nhập mật khẩu để làm bài"
        open={passwordModalVisible}
        onOk={handlePasswordOk}
        onCancel={handlePasswordCancel}
        okText="Vào làm bài"
        cancelText="Hủy"
      >
        <Input.Password
          placeholder="Nhập mật khẩu"
          value={inputPassword}
          onChange={e => setInputPassword(e.target.value)}
          onPressEnter={handlePasswordOk}
        />
        {passwordError && <div style={{ color: 'red', marginTop: 8 }}>{passwordError}</div>}
      </Modal>

      {/* Notification */}
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification(n => ({ ...n, visible: false }))}
      />
    </div>
  );
};

export default ViewTest; 