import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Table,
  Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  BookOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import { getUser } from '../../utils/auth';

const { Title } = Typography;

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

const testSectionTypeMap = {
  0: 'Trắc nghiệm',
  1: 'Đúng/Sai',
  2: 'Viết luận',
};

const ViewTestLecturer = () => {
  const { testEventID } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [sections, setSections] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [ungradedWriting, setUngradedWriting] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}${endpoints.testEvent.getById.replace('{testEventID}', testEventID)}`);
        if (res.data && res.data.success && res.data.data) {
          setTestData(res.data.data);
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
  }, [testEventID]);

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

  useEffect(() => {
    // Lấy danh sách kết quả của tất cả học sinh
    const fetchStudentResults = async () => {
      try {
        const res = await axios.get(`${API_URL}api/StudentTests/list-test-results/${testEventID}`);
        if (Array.isArray(res.data)) {
          setStudentResults(res.data);
        } else {
          setStudentResults([]);
        }
      } catch (err) {
        setStudentResults([]);
      }
    };
    if (testEventID) fetchStudentResults();
  }, [testEventID]);

  useEffect(() => {
    // Nếu là bài viết luận hoặc tổng hợp (Mix), lọc ra các bài chưa chấm
    console.log(testData);
    const isWritingTest = testData && (
      testData.testType === 5 ||
      testData.testType === 6 ||
      testData.testType === 'Writing' ||
      testData.testType === 'Mix'
    );
    if (isWritingTest) {
        console.log(studentResults);
      const ungraded = studentResults.filter(
        s => s.status === 'WaitingForWritingGrading' || s.status === 'Submitted'
      );
      setUngradedWriting(ungraded);
      console.log(ungraded);
    } else {
      setUngradedWriting([]);
    }
  }, [testData, studentResults]);

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

  // Tính tổng điểm tối đa
  const maxScore = sections.reduce((sum, s) => sum + (s.score || 0), 0);

  // Lấy role người dùng hiện tại
  let userRole = null;
  try {
    const user = getUser();
    userRole = user && user.role;
  } catch (e) {
    userRole = null;
  }
  const isLecturer = userRole === 'Lecture' || userRole === 'Lecturer' || userRole === 'Teacher';

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 32, margin: 24 }}>
      {/* Nút Quay lại nằm phía trên */}
      <div className="mb-16">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-0"
        >
          Quay lại
        </Button>
      </div>
      {/* Tiêu đề và nút Xem chi tiết đề kiểm tra */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-0"
        >
          Quay lại
        </Button> */}
        <div className="flex items-center gap-16">
          <Title level={2} style={{ fontWeight: 700, margin: 0 }}>
            {testData.lessonTitle || testData.description || 'Bài kiểm tra'}
          </Title>
          
        </div>
        <div>
        {isLecturer && testData.testID && (
            <Button
              type="primary"
              onClick={() => navigate(`/lecturer/assessment/${testData.testID}`)}
              className="ml-0"
            >
              Xem chi tiết đề kiểm tra
            </Button>
          )}
        </div>
      </div>
      <Row gutter={36}>
        <Col xs={12} lg={24}>
          <Card>
            <Descriptions title="Thông tin bài kiểm tra" bordered column={1}>
              <Descriptions.Item label="Tên bài kiểm tra">
                {testData.description || 'Bài kiểm tra'}
              </Descriptions.Item>
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
              {isLecturer && testData.password && (
                <Descriptions.Item label="Mật khẩu bài kiểm tra">
                  <span style={{ fontWeight: 600, letterSpacing: 1 }}>{testData.password}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
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
                    { title: 'Dạng', dataIndex: 'testSectionType', key: 'testSectionType', align: 'center'  },
                    { title: 'Điểm', dataIndex: 'score', key: 'score', align: 'center'  },
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
            {/* Bảng điểm học sinh */}
            <Divider />
            <Table
              dataSource={studentResults.map((s, idx) => ({
                key: s.studentTestID || idx,
                studentName: s.studentName,
                status: studentTestStatusMap[s.status] || s.status,
                score: (s.originalSubmissionScore !== undefined && (s.status === 'Published' || s.status === 'Graded')) ? `${s.originalSubmissionScore}/${maxScore}` : '',
                submitTime: s.submitTime ? dayjs(s.submitTime).format('DD/MM/YYYY HH:mm') : '',
                detailId: s.studentTestID
              }))}
              columns={[
                { title: 'Học sinh', dataIndex: 'studentName', key: 'studentName' },
                { title: 'Trạng thái', dataIndex: 'status', key: 'status',align: 'center'  },
                { title: 'Điểm', dataIndex: 'score', key: 'score', align: 'center' },
                { title: 'Nộp bài', dataIndex: 'submitTime', key: 'submitTime', align: 'center' },
                {
                  title: 'Chi tiết',
                  key: 'action',
                  align: 'center',
                  render: (_, record) => (
                    <Button size="small" onClick={() => navigate(`/lecturer/test-detail/${record.detailId}`)}>
                      Xem chi tiết
                    </Button>
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
            {/* Nếu là bài viết luận, hiển thị danh sách chưa chấm */}
            {(
              testData && (
                testData.testType === 5 ||
                testData.testType === 6 ||
                testData.testType === 'Writing' ||
                testData.testType === 'Mix'
              ) && ungradedWriting.length > 0
            ) && (
              <>
                <Divider />
                <Table
                  dataSource={ungradedWriting.map((s, idx) => ({
                    key: s.studentTestID || idx,
                    studentName: s.studentName,
                    submitTime: s.submitTime ? dayjs(s.submitTime).format('DD/MM/YYYY HH:mm') : '',
                    detailId: s.studentTestID
                  }))}
                  columns={[
                    { title: 'Học sinh', dataIndex: 'studentName', key: 'studentName' },
                    { title: 'Nộp bài', dataIndex: 'submitTime', key: 'submitTime', align: 'center' },
                    {
                      title: 'Chấm bài',
                      key: 'action',
                      align: 'center',
                      render: (_, record) => (
                        <Button size="small" type="primary" onClick={() => navigate(`/lecturer/test-detail/${record.detailId}`)}>
                          Chấm bài
                        </Button>
                      )
                    }
                  ]}
                  pagination={false}
                  bordered
                  title={() => (
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      Bài viết luận chưa chấm
                    </span>
                  )}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ViewTestLecturer; 