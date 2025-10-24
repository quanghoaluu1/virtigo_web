import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  List,
  Tag,
  Divider,
  Descriptions
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TestResult = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  // Mock result data
  useEffect(() => {
    setTimeout(() => {
      // Dữ liệu kết quả cho các bài kiểm tra khác nhau
      const resultDataMap = {
        'T0001': {
          testId: 'T0001',
          testName: 'Kiểm tra giữa kỳ',
          subject: 'Toán học',
          className: 'Lớp 10A1',
          date: '2024-06-10',
          time: '08:00',
          duration: 90,
          totalQuestions: 25,
          maxScore: 10,
          studentScore: 8.5,
          completedAt: '2024-06-10T09:30:00',
          timeSpent: 75,
          correctAnswers: 21,
          wrongAnswers: 3,
          unanswered: 1,
          grade: 'A',
          feedback: 'Bạn đã làm bài rất tốt! Hãy tiếp tục phát huy.',
          questions: [
            {
              id: 1,
              question: 'Câu 1: Giải phương trình x² - 5x + 6 = 0',
              studentAnswer: 'x = 2, x = 3',
              correctAnswer: 'x = 2, x = 3',
              isCorrect: true,
              score: 0.4,
              maxScore: 0.4,
              explanation: 'Đáp án đúng. Phương trình có 2 nghiệm x = 2 và x = 3.'
            },
            {
              id: 2,
              question: 'Câu 2: Tính giá trị của biểu thức A = 2x + 3y khi x = 2, y = 3',
              studentAnswer: '13',
              correctAnswer: '13',
              isCorrect: true,
              score: 0.4,
              maxScore: 0.4,
              explanation: 'Đáp án đúng. A = 2(2) + 3(3) = 4 + 9 = 13.'
            },
            {
              id: 3,
              question: 'Câu 3: Chọn tất cả các số nguyên tố trong danh sách sau:',
              studentAnswer: ['2', '7', '11'],
              correctAnswer: ['2', '7', '11'],
              isCorrect: true,
              score: 0.4,
              maxScore: 0.4,
              explanation: 'Đáp án đúng. Các số nguyên tố là 2, 7, 11.'
            },
            {
              id: 4,
              question: 'Câu 4: Viết công thức tính diện tích hình tròn.',
              studentAnswer: 'S = πr²',
              correctAnswer: 'S = πr²',
              isCorrect: true,
              score: 0.4,
              maxScore: 0.4,
              explanation: 'Đáp án đúng. Công thức diện tích hình tròn là S = πr².'
            },
            {
              id: 5,
              question: 'Câu 5: Giải thích tại sao phương trình bậc hai có thể có 0, 1 hoặc 2 nghiệm thực.',
              studentAnswer: 'Phương trình bậc hai ax² + bx + c = 0 có số nghiệm phụ thuộc vào biệt thức Δ = b² - 4ac. Nếu Δ > 0: 2 nghiệm, Δ = 0: 1 nghiệm, Δ < 0: 0 nghiệm.',
              correctAnswer: 'Phương trình bậc hai có thể có 0, 1 hoặc 2 nghiệm thực tùy thuộc vào biệt thức Δ = b² - 4ac.',
              isCorrect: false,
              score: 0.2,
              maxScore: 0.4,
              explanation: 'Câu trả lời chưa đầy đủ. Cần giải thích rõ hơn về điều kiện của biệt thức.'
            }
          ]
        },
        'T0003': {
          testId: 'T0003',
          testName: 'Kiểm tra Listening',
          subject: 'Tiếng Anh',
          className: 'Lớp 10A1',
          date: '2024-05-30',
          time: '09:00',
          duration: 45,
          totalQuestions: 20,
          maxScore: 10,
          studentScore: 9.0,
          completedAt: '2024-05-30T09:45:00',
          timeSpent: 40,
          correctAnswers: 18,
          wrongAnswers: 2,
          unanswered: 0,
          grade: 'A',
          feedback: 'Xuất sắc! Kỹ năng nghe hiểu của bạn rất tốt.',
          questions: [
            {
              id: 1,
              question: 'Câu 1: What did the speaker say about the weather?',
              studentAnswer: 'It will rain tomorrow',
              correctAnswer: 'It will rain tomorrow',
              isCorrect: true,
              score: 0.5,
              maxScore: 0.5,
              explanation: 'Đáp án đúng. Speaker đã nói rằng trời sẽ mưa vào ngày mai.'
            },
            {
              id: 2,
              question: 'Câu 2: Where is the meeting scheduled?',
              studentAnswer: 'Conference room',
              correctAnswer: 'Conference room',
              isCorrect: true,
              score: 0.5,
              maxScore: 0.5,
              explanation: 'Đáp án đúng. Cuộc họp được lên lịch tại phòng họp.'
            },
            {
              id: 3,
              question: 'Câu 3: What time does the movie start?',
              studentAnswer: '7:30 PM',
              correctAnswer: '8:00 PM',
              isCorrect: false,
              score: 0,
              maxScore: 0.5,
              explanation: 'Sai. Phim bắt đầu lúc 8:00 PM, không phải 7:30 PM.'
            },
            {
              id: 4,
              question: 'Câu 4: How many people attended the event?',
              studentAnswer: '150',
              correctAnswer: '150',
              isCorrect: true,
              score: 0.5,
              maxScore: 0.5,
              explanation: 'Đáp án đúng. Có 150 người tham dự sự kiện.'
            },
            {
              id: 5,
              question: 'Câu 5: What is the main topic of the lecture?',
              studentAnswer: 'Climate change',
              correctAnswer: 'Environmental protection',
              isCorrect: false,
              score: 0,
              maxScore: 0.5,
              explanation: 'Sai. Chủ đề chính là bảo vệ môi trường, không phải biến đổi khí hậu.'
            }
          ]
        },
        'T0004': {
          testId: 'T0004',
          testName: 'Bài kiểm tra 15 phút - Đại số',
          subject: 'Toán học',
          className: 'Lớp 10A1',
          date: dayjs().format('YYYY-MM-DD'),
          time: '14:00',
          duration: 15,
          totalQuestions: 10,
          maxScore: 10,
          studentScore: 8.0,
          completedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          timeSpent: 12,
          correctAnswers: 8,
          wrongAnswers: 2,
          unanswered: 0,
          grade: 'B',
          feedback: 'Làm bài tốt! Cần cẩn thận hơn trong việc tính toán.',
          questions: [
            {
              id: 1,
              question: 'Câu 1: Giải phương trình x² - 5x + 6 = 0',
              studentAnswer: 'x = 2, x = 3',
              correctAnswer: 'x = 2, x = 3',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. Phương trình có 2 nghiệm x = 2 và x = 3.'
            },
            {
              id: 2,
              question: 'Câu 2: Tính giá trị của biểu thức A = 2x + 3y khi x = 2, y = 3',
              studentAnswer: '13',
              correctAnswer: '13',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. A = 2(2) + 3(3) = 4 + 9 = 13.'
            },
            {
              id: 3,
              question: 'Câu 3: Phương trình x² + 4x + 4 = 0 có nghiệm là:',
              studentAnswer: 'x = 2',
              correctAnswer: 'x = -2',
              isCorrect: false,
              score: 0,
              maxScore: 1.0,
              explanation: 'Sai. Phương trình có nghiệm kép x = -2.'
            },
            {
              id: 4,
              question: 'Câu 4: Tìm x biết: 3x - 7 = 8',
              studentAnswer: 'x = 5',
              correctAnswer: 'x = 5',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. 3x - 7 = 8 → 3x = 15 → x = 5.'
            },
            {
              id: 5,
              question: 'Câu 5: Giải phương trình: 2x + 5 = 3x - 1',
              studentAnswer: 'x = 6',
              correctAnswer: 'x = 6',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. 2x + 5 = 3x - 1 → 5 + 1 = 3x - 2x → x = 6.'
            },
            {
              id: 6,
              question: 'Câu 6: Tính: (x + 2)²',
              studentAnswer: 'x² + 4x + 4',
              correctAnswer: 'x² + 4x + 4',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. (x + 2)² = x² + 4x + 4.'
            },
            {
              id: 7,
              question: 'Câu 7: Phương trình x² - 9 = 0 có nghiệm là:',
              studentAnswer: 'x = 3 và x = -3',
              correctAnswer: 'x = 3 và x = -3',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. x² - 9 = 0 → x² = 9 → x = ±3.'
            },
            {
              id: 8,
              question: 'Câu 8: Tìm x biết: 4x = 20',
              studentAnswer: 'x = 5',
              correctAnswer: 'x = 5',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. 4x = 20 → x = 5.'
            },
            {
              id: 9,
              question: 'Câu 9: Giải phương trình: x² - 4x + 4 = 0',
              studentAnswer: 'x = 2',
              correctAnswer: 'x = 2',
              isCorrect: true,
              score: 1.0,
              maxScore: 1.0,
              explanation: 'Đáp án đúng. x² - 4x + 4 = 0 → (x - 2)² = 0 → x = 2.'
            },
            {
              id: 10,
              question: 'Câu 10: Tính: 3x² - 2x + 1 khi x = 2',
              studentAnswer: '11',
              correctAnswer: '9',
              isCorrect: false,
              score: 0,
              maxScore: 1.0,
              explanation: 'Sai. 3(2)² - 2(2) + 1 = 3(4) - 4 + 1 = 12 - 4 + 1 = 9.'
            }
          ]
        },
        'T0005': {
          testId: 'T0005',
          testName: 'Kiểm tra từ vựng Unit 5',
          subject: 'Tiếng Anh',
          className: 'Lớp 10A2',
          date: dayjs().format('YYYY-MM-DD'),
          time: '15:30',
          duration: 20,
          totalQuestions: 15,
          maxScore: 10,
          studentScore: 9.3,
          completedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          timeSpent: 18,
          correctAnswers: 14,
          wrongAnswers: 1,
          unanswered: 0,
          grade: 'A',
          feedback: 'Tuyệt vời! Vốn từ vựng của bạn rất phong phú.',
          questions: [
            {
              id: 1,
              question: 'Câu 1: What does "technology" mean?',
              studentAnswer: 'Công nghệ',
              correctAnswer: 'Công nghệ',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Technology" có nghĩa là công nghệ.'
            },
            {
              id: 2,
              question: 'Câu 2: Choose the correct word: "I use my _____ to browse the internet."',
              studentAnswer: 'computer',
              correctAnswer: 'computer',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Computer" là danh từ số ít phù hợp.'
            },
            {
              id: 3,
              question: 'Câu 3: What is the opposite of "online"?',
              studentAnswer: 'offline',
              correctAnswer: 'offline',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Offline" là từ trái nghĩa với "online".'
            },
            {
              id: 4,
              question: 'Câu 4: "Download" means:',
              studentAnswer: 'Tải xuống',
              correctAnswer: 'Tải xuống',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Download" có nghĩa là tải xuống.'
            },
            {
              id: 5,
              question: 'Câu 5: Choose the correct form: "She _____ emails every day."',
              studentAnswer: 'sends',
              correctAnswer: 'sends',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. Chủ ngữ số ít "She" cần động từ thêm "s".'
            },
            {
              id: 6,
              question: 'Câu 6: What does "software" refer to?',
              studentAnswer: 'Phần mềm',
              correctAnswer: 'Phần mềm',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Software" chỉ phần mềm.'
            },
            {
              id: 7,
              question: 'Câu 7: "Password" means:',
              studentAnswer: 'Mật khẩu',
              correctAnswer: 'Mật khẩu',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Password" có nghĩa là mật khẩu.'
            },
            {
              id: 8,
              question: 'Câu 8: Choose the correct word: "I need to _____ my phone."',
              studentAnswer: 'charge',
              correctAnswer: 'charge',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Charge" là động từ nguyên mẫu sau "to".'
            },
            {
              id: 9,
              question: 'Câu 9: What is a "website"?',
              studentAnswer: 'Một trang web',
              correctAnswer: 'Một trang web',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Website" là một trang web.'
            },
            {
              id: 10,
              question: 'Câu 10: "Social media" includes:',
              studentAnswer: 'Facebook, Instagram, Twitter',
              correctAnswer: 'Facebook, Instagram, Twitter',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. Mạng xã hội bao gồm Facebook, Instagram, Twitter.'
            },
            {
              id: 11,
              question: 'Câu 11: What does "upload" mean?',
              studentAnswer: 'Tải lên',
              correctAnswer: 'Tải lên',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "Upload" có nghĩa là tải lên.'
            },
            {
              id: 12,
              question: 'Câu 12: Choose the correct form: "They _____ videos on YouTube."',
              studentAnswer: 'watch',
              correctAnswer: 'watch',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. Chủ ngữ số nhiều "They" cần động từ nguyên mẫu.'
            },
            {
              id: 13,
              question: 'Câu 13: "WiFi" is:',
              studentAnswer: 'Mạng không dây',
              correctAnswer: 'Mạng không dây',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "WiFi" là mạng không dây.'
            },
            {
              id: 14,
              question: 'Câu 14: What is an "app"?',
              studentAnswer: 'Ứng dụng',
              correctAnswer: 'Ứng dụng',
              isCorrect: true,
              score: 0.67,
              maxScore: 0.67,
              explanation: 'Đáp án đúng. "App" là viết tắt của application (ứng dụng).'
            },
            {
              id: 15,
              question: 'Câu 15: "Digital" means:',
              studentAnswer: 'Tương tự',
              correctAnswer: 'Số hóa',
              isCorrect: false,
              score: 0,
              maxScore: 0.67,
              explanation: 'Sai. "Digital" có nghĩa là số hóa, không phải tương tự.'
            }
          ]
        }
      };

      const selectedResult = resultDataMap[testId] || resultDataMap['T0001'];
      setResultData(selectedResult);
      setLoading(false);
    }, 1000);
  }, [testId]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return 'green';
      case 'B':
        return 'blue';
      case 'C':
        return 'orange';
      case 'D':
        return 'red';
      case 'F':
        return 'red';
      default:
        return 'default';
    }
  };

  const getGradeText = (grade) => {
    switch (grade) {
      case 'A':
        return 'Xuất sắc';
      case 'B':
        return 'Tốt';
      case 'C':
        return 'Trung bình';
      case 'D':
        return 'Yếu';
      case 'F':
        return 'Kém';
      default:
        return grade;
    }
  };

  const calculatePercentage = (score, maxScore) => {
    return Math.round((score / maxScore) * 100);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const percentage = calculatePercentage(resultData.studentScore, resultData.maxScore);

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 32, margin: 24 }}>
      {/* Header */}
      <div className="mb-24">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/student/view-test/${testId}`)}
          className="mb-16"
        >
          Quay lại
        </Button>
        <Title level={2} style={{ fontWeight: 700, margin: 0 }}>
          Kết quả bài kiểm tra
        </Title>
      </div>

      <Row gutter={24}>
        {/* Main content */}
        <Col xs={24} lg={16}>
          {/* Score Summary */}
          <Card className="mb-24">
            <Row gutter={16} align="middle">
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={percentage}
                    format={() => `${resultData.studentScore}/${resultData.maxScore}`}
                    size={120}
                    strokeColor={percentage >= 80 ? '#52c41a' : percentage >= 60 ? '#1890ff' : '#1890ff'}
                  />
                  <div className="mt-16">
                    <Tag 
                      color={getGradeColor(resultData.grade)} 
                      size="large"
                      icon={<TrophyOutlined />}
                    >
                      {resultData.grade} - {getGradeText(resultData.grade)}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={16}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tên bài kiểm tra">
                    {resultData.testName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Môn học">
                    <Space>
                      <BookOutlined />
                      {resultData.subject}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lớp học">
                    {resultData.className}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày làm bài">
                    {dayjs(resultData.completedAt).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian làm bài">
                    <Space>
                      <ClockCircleOutlined />
                      {resultData.timeSpent} phút / {resultData.duration} phút
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          {/* Statistics */}
          <Card title="Thống kê chi tiết" className="mb-24">
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                    {resultData.correctAnswers}
                  </Title>
                  <Text type="secondary">Đúng</Text>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>
                    {resultData.wrongAnswers}
                  </Title>
                  <Text type="secondary">Sai</Text>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                    {resultData.unanswered}
                  </Title>
                  <Text type="secondary">Chưa trả lời</Text>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                    {percentage}%
                  </Title>
                  <Text type="secondary">Tỷ lệ đúng</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Feedback */}
          <Card title="Nhận xét" className="mb-24">
            <Alert
              message={resultData.feedback}
              type={percentage >= 80 ? 'success' : percentage >= 60 ? 'info' : 'warning'}
              showIcon
            />
          </Card>

          {/* Question Review */}
          <Card title="Chi tiết từng câu hỏi">
            <List
              dataSource={resultData.questions}
              renderItem={(question, index) => (
                <List.Item>
                  <div className="w-full">
                    <div className="mb-16">
                      <Title level={5}>Câu {index + 1}</Title>
                      <Paragraph>{question.question}</Paragraph>
                    </div>
                    
                    <Row gutter={16} className="mb-16">
                      <Col xs={24} md={12}>
                        <Text strong>Đáp án của bạn:</Text>
                        <div className="mt-8">
                          {Array.isArray(question.studentAnswer) ? (
                            question.studentAnswer.join(', ')
                          ) : (
                            question.studentAnswer
                          )}
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <Text strong>Đáp án đúng:</Text>
                        <div className="mt-8">
                          {Array.isArray(question.correctAnswer) ? (
                            question.correctAnswer.join(', ')
                          ) : (
                            question.correctAnswer
                          )}
                        </div>
                      </Col>
                    </Row>

                    <Row gutter={16} className="mb-16">
                      <Col xs={12}>
                        <Text>Điểm: {question.score}/{question.maxScore}</Text>
                      </Col>
                      <Col xs={12}>
                        <Tag 
                          color={question.isCorrect ? 'green' : 'red'}
                          icon={question.isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        >
                          {question.isCorrect ? 'Đúng' : 'Sai'}
                        </Tag>
                      </Col>
                    </Row>

                    <Alert
                      message="Giải thích"
                      description={question.explanation}
                      type={question.isCorrect ? 'success' : 'info'}
                      showIcon
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="Thao tác">
            <Space direction="vertical" className="w-full">
              <Button 
                type="primary" 
                size="large" 
                block
                onClick={() => navigate('/student/test-schedule')}
              >
                Quay lại lịch kiểm tra
              </Button>
              <Button 
                type="default" 
                size="large" 
                block
                onClick={() => navigate(`/student/view-test/${testId}`)}
              >
                Xem lại bài kiểm tra
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TestResult; 