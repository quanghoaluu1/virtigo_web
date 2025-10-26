import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Typography, Button, Spin, Alert, Descriptions, Divider, Tag, Input, message, Modal, Table } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL } from '../../config/api';
import Notification from '../../components/common/Notification';

const { Title, Text } = Typography;

const statusMap = {
  Pending: 'Chưa làm',
  Submitted: 'Đã nộp bài',
  AutoGradedWaitingForWritingGrading: 'Đã chấm tự động',
  WaitingForWritingGrading: 'Chờ chấm tự luận',
  Graded: 'Đã chấm',
  Published: 'Đã công bố điểm',
};

const LecturerTestDetail = () => {
  // Lấy studentTestID từ params hoặc state
  const { studentTestID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Nếu không có params, thử lấy từ state (khi chuyển trang bằng navigate)
  const studentTestIdParam = studentTestID || location.state?.studentTestID;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [writingScores, setWritingScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [saving, setSaving] = useState(false);
  const [showEssay, setShowEssay] = useState(true);
  const [showMCQ, setShowMCQ] = useState(true);
  const [mcqSectionVisibility, setMcqSectionVisibility] = useState({});
  const [essaySectionVisibility, setEssaySectionVisibility] = useState({});
  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });
  const [showGuide, setShowGuide] = useState(false);
  const [barems, setBarems] = useState({});
  const [baremLoading, setBaremLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Gọi API lấy chi tiết bài làm theo studentTestID
        if (!studentTestIdParam) {
          setData(null);
          setLoading(false);
          return;
        }
        const res = await axios.get(`${API_URL}api/StudentTests/result-by-student-test/${studentTestIdParam}`);
        if (res.data && res.data.success && res.data.data) {
          setData(res.data.data);
          // Khởi tạo state điểm và feedback cho các câu writing
          const found = res.data.data;
          if (found && Array.isArray(found.sections)) {
            const scores = {};
            const fbs = {};
            found.sections.forEach(section => {
              if (Array.isArray(section.questions)) {
                section.questions.forEach(q => {
                  if (q.type === 2) {
                    scores[q.questionID] = q.studentAnswer?.writingScore ?? '';
                    fbs[q.questionID] = q.studentAnswer?.feedback ?? '';
                  }
                });
              }
            });
            setWritingScores(scores);
            setFeedbacks(fbs);
          }
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentTestIdParam]);

  const handleScoreChange = (questionID, value) => {
    setWritingScores(prev => ({ ...prev, [questionID]: value }));
  };
  const handleFeedbackChange = (questionID, value) => {
    setFeedbacks(prev => ({ ...prev, [questionID]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Lấy token và graderAccountID từ localStorage
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token') || (userStr ? JSON.parse(userStr).token : undefined);
      const graderAccountID = userStr ? JSON.parse(userStr).accountId : undefined;
      console.log('Token gửi lên:', token);
      if (!token || !graderAccountID) {
        setNotification({ visible: true, type: 'error', message: 'Lỗi xác thực', description: 'Không tìm thấy thông tin người dùng hoặc token!' });
        setSaving(false);
        return;
      }
      // Duyệt qua từng câu writing và gửi PUT
      const writingQuestions = [];
      if (data && Array.isArray(data.sections)) {
        data.sections.forEach(section => {
          if (Array.isArray(section.questions)) {
            section.questions.forEach(q => {
              if (q.type === 2 && q.studentAnswer?.writingAnswerID) {
                writingQuestions.push({
                  writingAnswerID: q.studentAnswer.writingAnswerID,
                  studentTestID: data.studentTestID,
                  writingScore: writingScores[q.questionID],
                  feedback: feedbacks[q.questionID],
                  graderAccountID,
                  testSectionID: section.testSectionID
                });
              }
            });
          }
        });
      }
      // Kiểm tra có câu nào chưa nhập điểm không
      const missingScore = writingQuestions.some(q => q.writingScore === '' || q.writingScore === undefined || q.writingScore === null);
      if (writingQuestions.length === 0 || missingScore) {
        setNotification({ visible: true, type: 'error', message: 'Chưa nhập đủ điểm', description: 'Vui lòng nhập điểm cho tất cả câu tự luận trước khi lưu!' });
        setSaving(false);
        return;
      }
      // Gửi tuần tự từng câu (có thể dùng Promise.all nếu muốn gửi song song)
      for (const payload of writingQuestions) {
        console.log('Payload gửi lên:', payload);
        const response = await axios.put(
          `${API_URL}api/StudentTests/writing/grade`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Kết quả trả về:', response?.data);
      }
      // Gọi API chuyển điểm sang bảng điểm
      try {
        await axios.put(
          `${API_URL}api/StudentMarks/update-marks-by-student-test/${data.studentTestID}`,
          null,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (err) {
        setNotification({ visible: true, type: 'error', message: 'Lỗi cập nhật bảng điểm', description: err?.message || 'Có lỗi khi cập nhật bảng điểm.' });
        setSaving(false);
        return;
      }
      setNotification({ visible: true, type: 'success', message: 'Chấm điểm thành công', description: 'Đã lưu/chấm điểm thành công!' });
      setTimeout(() => {
        navigate(-1);
      }, 1200);
    } catch (err) {
      console.error('Lỗi khi gọi API chấm điểm:', err);
      setNotification({ visible: true, type: 'error', message: 'Lỗi khi lưu/chấm điểm', description: err?.message || 'Có lỗi khi lưu/chấm điểm.' });
    } finally {
      setSaving(false);
    }
  };

  // Tổng điểm tối đa
  const maxScore = Array.isArray(data?.sections)
    ? data.sections.reduce((sum, s) => sum + (s.sectionScore || 0), 0)
    : '';

  // Tách câu hỏi tự luận và trắc nghiệm
  const essaySections = Array.isArray(data?.sections)
    ? data.sections.map(section => ({
        ...section,
        questions: section.questions.filter(q => q.type === 2)
      })).filter(section => section.questions.length > 0)
    : [];
  const mcqSections = Array.isArray(data?.sections)
    ? data.sections.map(section => ({
        ...section,
        questions: section.questions.filter(q => q.type !== 2)
      })).filter(section => section.questions.length > 0)
    : [];

  // Lấy danh sách questionID tự luận
  const essayQuestionIDs = essaySections.flatMap(section => section.questions.map(q => q.questionID));

  // Fetch barem khi mở modal hướng dẫn
  useEffect(() => {
    if (showGuide && essayQuestionIDs.length > 0) {
      setBaremLoading(true);
      Promise.all(
        essayQuestionIDs.map(qid =>
          axios.get(`${API_URL}WritingBarem/${qid}`)
            .then(res => ({ qid, data: res.data?.data || [] }))
            .catch(() => ({ qid, data: null }))
        )
      ).then(results => {
        const baremMap = {};
        results.forEach(({ qid, data }) => {
          baremMap[qid] = data;
        });
        setBarems(baremMap);
      }).finally(() => setBaremLoading(false));
    }
  }, [showGuide, essayQuestionIDs.join(",")]);

  // Early returns moved here, after all hooks
  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Spin size="large" /></div>;
  }
  if (!data) {
    return <Alert message="Không tìm thấy thông tin bài làm" type="error" showIcon className="m-6" />;
  }

  return (
    <div className="bg-white rounded-[20px] p-8 m-6 min-h-[600px]">
      <Notification {...notification} onClose={() => setNotification(n => ({ ...n, visible: false }))} />
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
        Quay lại
      </Button>
      <Title level={2} className="font-bold mb-2">Chấm bài tự luận</Title>
      <Descriptions bordered column={2} className="mb-6 bg-[#fafcff] rounded-xl p-4">
        <Descriptions.Item label="Học sinh">{data.studentName}</Descriptions.Item>
        <Descriptions.Item label="Mã bài làm">{data.studentTestID}</Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">{data.startTime ? dayjs(data.startTime).format('DD/MM/YYYY HH:mm') : ''}</Descriptions.Item>
        <Descriptions.Item label="Thời gian nộp">{data.submitTime ? dayjs(data.submitTime).format('DD/MM/YYYY HH:mm') : ''}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={2}>
          <span className="font-bold">{statusMap[data.status] || data.status}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Điểm" span={2}>
          {(data.status === 'Graded' || data.status === 'Published') ? (
            <Text className="font-bold">{data.originalSubmissionScore}</Text>
          ) : (
            <span className="font-bold">-</span>
          )}
        </Descriptions.Item>
        {data.comment && <Descriptions.Item label="Nhận xét" span={2}>{data.comment}</Descriptions.Item>}
      </Descriptions>
      <div className="mb-4 flex items-center gap-2">
        <span>Điều chỉnh cỡ chữ:</span>
        <Button size="small" onClick={() => setFontSize(f => Math.max(12, f - 2))}>A-</Button>
        <Button size="small" onClick={() => setFontSize(f => Math.min(32, f + 2))}>A+</Button>
        <span className="text-sm text-gray-500">{fontSize}px</span>
      </div>
      {/* Toggle Essay Section */}
      <div className="mb-3">
        <Button onClick={() => setShowEssay(v => !v)} type="default" className="mr-2">
          {showEssay ? 'Ẩn phần tự luận' : 'Hiện phần tự luận'}
        </Button>
        <Button onClick={() => setShowMCQ(v => !v)} type="default" className="mr-2">
          {showMCQ ? 'Ẩn phần trắc nghiệm' : 'Hiện phần trắc nghiệm'}
        </Button>
        <Button onClick={() => setShowGuide(true)} type="dashed">
          Hướng dẫn chấm điểm bài tự luận
        </Button>
      </div>
      {/* Modal hướng dẫn chấm điểm */}
      <Modal
        title="Hướng dẫn chấm điểm bài tự luận"
        open={showGuide}
        onCancel={() => setShowGuide(false)}
        footer={null}
        width={700}
      >
        {baremLoading ? (
          <Spin />
        ) : essayQuestionIDs.length === 0 ? (
          <div>Không có câu hỏi tự luận nào trong bài này.</div>
        ) : (
          essayQuestionIDs.map((qid, idx) => (
            <div key={qid} className="mb-24">
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Câu {idx + 1}:</div>
              {barems[qid] && Array.isArray(barems[qid]) && barems[qid].length > 0 ? (
                <Table
                  dataSource={barems[qid].map((item, i) => ({ ...item, key: item.writingBaremID || i }))}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Tiêu chí', dataIndex: 'criteriaName', key: 'criteriaName', width: 120 },
                    { title: 'Mô tả', dataIndex: 'description', key: 'description', width: 300 },
                    { title: 'Điểm tối đa', dataIndex: 'maxScore', key: 'maxScore', width: 100 },
                  ]}
                />
              ) : (
                <div className="text-gray-500">Không có barem chấm điểm cho câu hỏi này.</div>
              )}
            </div>
          ))
        )}
      </Modal>
      {/* ESSAY SECTIONS */}
      {essaySections.length > 0 && (
        <div className="mb-8">
          {/* <span style={{ fontWeight: 600, fontSize: 18, marginRight: 8 }}>Phần tự luận</span> */}
          <span
            style={{ cursor: 'pointer', fontSize: 20 }}
            onClick={() => setShowEssay(v => !v)}
            title={showEssay ? 'Ẩn phần tự luận' : 'Hiện phần tự luận'}
          >
            {/* {showEssay ? <EyeOutlined /> : <EyeInvisibleOutlined />} */}
          </span>
        </div>
      )}
      {showEssay && essaySections.map((section, idx) => {
        const sectionKey = section.testSectionID || idx;
        const isVisible = essaySectionVisibility[sectionKey] !== false; // mặc định hiện
        return (
          <Card
            key={sectionKey}
            style={{ marginBottom: 32, borderRadius: 16, boxShadow: '0 2px 8px #f0f1f2' }}
            bodyStyle={{ background: '#fafdff', borderRadius: 16 }}
            title={<span style={{ fontWeight: 600, fontSize: 18 }}>{section.context}</span>}
            extra={
              <div className="flex items-center gap-12">
                {section.questions.length === 1 && section.questions[0].type === 2 ? (
                  <span className="flex items-center gap-4">
                    <Text type="secondary">Điểm phần này:</Text>
                    <Input
                      className="w-[80px]"
                      type="number"
                      min={0}
                      max={section.sectionScore}
                      value={writingScores[section.questions[0].questionID] !== undefined ? Number(writingScores[section.questions[0].questionID]) : ''}
                      onChange={e => handleScoreChange(section.questions[0].questionID, e.target.value)}
                    />
                    <span>/ {section.sectionScore}</span>
                  </span>
                ) : (
                  <Text type="secondary">Điểm phần này: <b>{section.studentGetScore} / {section.sectionScore}</b></Text>
                )}
                <span
                  style={{ cursor: 'pointer', fontSize: 20 }}
                  onClick={e => {
                    e.stopPropagation();
                    setEssaySectionVisibility(prev => ({
                      ...prev,
                      [sectionKey]: !isVisible
                    }));
                  }}
                  title={isVisible ? 'Ẩn phần này' : 'Hiện phần này'}
                >
                  {isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
              </div>
            }
          >
            <Divider />
            {isVisible && section.questions.map((q, qIdx) => (
              <div
                key={q.questionID}
                style={{
                  marginBottom: 24,
                  padding: 16,
                  border: '1px solid #e6f4ff',
                  borderRadius: 10,
                  background: '#fff',
                  fontSize: fontSize
                }}
              >
                <div style={{ 
                  marginBottom: 8, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <Text strong style={{ fontSize: fontSize }}>Câu {qIdx + 1}:</Text> <span style={{ fontSize: fontSize }}>{q.context}</span>
                  </div>
                  {/* <span style={{ fontWeight: 600, fontSize: fontSize - 2 }}>
                    Điểm: <Input
                      className="w-[80px]"
                      type="number"
                      min={0}
                      max={section.sectionScore}
                      value={writingScores[q.questionID] !== undefined ? Number(writingScores[q.questionID]) : ''}
                      onChange={e => handleScoreChange(q.questionID, e.target.value)}
                    />
                    / {section.sectionScore}
                  </span> */}
                </div>
                <div className="mb-8">
                  <Text>Đáp án của học sinh: </Text>
                  <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: fontSize, minHeight: 100 }}>
                    {q.studentAnswer?.studentEssay || <i>Chưa trả lời</i>}
                  </div>
                  <div className="mt-8">
                    <Text>Feedback:</Text>
                    <Input.TextArea
                      rows={2}
                      placeholder="Nhận xét cho học sinh..."
                      value={feedbacks[q.questionID]}
                      onChange={e => handleFeedbackChange(q.questionID, e.target.value)}
                      className="mt-4"
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        );
      })}
      {/* MCQ SECTIONS */}
      {mcqSections.length > 0 && (
        <div className="mb-8">
          {/* <span style={{ fontWeight: 600, fontSize: 18, marginRight: 8 }}>Phần trắc nghiệm</span> */}
          <span
            style={{ cursor: 'pointer', fontSize: 20 }}
            onClick={() => setShowMCQ(v => !v)}
            title={showMCQ ? 'Ẩn phần trắc nghiệm' : 'Hiện phần trắc nghiệm'}
          >
            {/* {showMCQ ? <EyeOutlined /> : <EyeInvisibleOutlined />} */}
          </span>
        </div>
      )}
      {showMCQ && mcqSections.map((section, idx) => {
        const sectionKey = section.testSectionID || idx;
        const isVisible = mcqSectionVisibility[sectionKey] !== false; // mặc định hiện
        return (
          <Card
            key={sectionKey}
            style={{ marginBottom: 32, borderRadius: 16, boxShadow: '0 2px 8px #f0f1f2' }}
            bodyStyle={{ background: '#fafdff', borderRadius: 16 }}
            title={<span style={{ fontWeight: 600, fontSize: 18 }}>{section.context}</span>}
            extra={
              <div className="flex items-center gap-12">
                <Text type="secondary">Điểm phần này: <b>{section.studentGetScore} / {section.sectionScore}</b></Text>
                <span
                  style={{ cursor: 'pointer', fontSize: 20 }}
                  onClick={e => {
                    e.stopPropagation();
                    setMcqSectionVisibility(prev => ({
                      ...prev,
                      [sectionKey]: !isVisible
                    }));
                  }}
                  title={isVisible ? 'Ẩn phần này' : 'Hiện phần này'}
                >
                  {isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
              </div>
            }
          >
            <Divider />
            {isVisible && section.questions.map((q, qIdx) => (
              <div
                key={q.questionID}
                style={{
                  marginBottom: 24,
                  padding: 16,
                  border: '1px solid #e6f4ff',
                  borderRadius: 10,
                  background: '#fff',
                  fontSize: fontSize
                }}
              >
                <div style={{ 
                  marginBottom: 8, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <Text strong style={{ fontSize: fontSize }}>Câu {qIdx + 1}:</Text> <span style={{ fontSize: fontSize }}>{q.context}</span>
                  </div>
                  {/* <span style={{ fontWeight: 600, fontSize: fontSize - 2 }}>
                    Điểm: {typeof q.score === 'number' ? q.score : 0} / {q.score}
                  </span> */}
                </div>
                {/* Đáp án và lựa chọn của sinh viên */}
                {Array.isArray(q.options) && (
                  <div className="mb-8">
                    <Text type="secondary">Tất cả đáp án:</Text>
                    <div className="mt-8">
                      {q.options.map(opt => {
                        const isSelected = q.studentAnswer?.selectedOptionIDs?.includes(opt.mcqOptionID);
                        const isCorrect = opt.isCorrect;
                        let icon = null;
                        if (isSelected) {
                          if (isCorrect) {
                            icon = <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />;
                          } else {
                            icon = <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 18 }} />;
                          }
                        }
                        return (
                          <div
                            key={opt.mcqOptionID}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: 6,
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: isSelected ? (isCorrect ? '#f6ffed' : '#fff1f0') : undefined,
                              fontSize: fontSize
                            }}
                          >
                            <span className="mr-8">{String.fromCharCode(65 + (q.options.findIndex(o => o.mcqOptionID === opt.mcqOptionID)))}</span>
                            <span>{opt.context}</span>
                            {isSelected && (
                              <span className="ml-10">{icon}</span>
                            )}
                            {isCorrect && (
                              <span style={{ marginLeft: 10, color: '#389e0d', fontWeight: 600 }}>(Đáp án đúng)</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Hiển thị đáp án sinh viên đã chọn */}
                    <div style={{ marginTop: 4, marginBottom: 4, border: '1.5px solid #1890ff', background: '#e6f7ff', borderRadius: 8, padding: '6px 12px', display: 'inline-block' }}>
                      <span className="font-medium"><strong>Đáp án sinh viên chọn:</strong> </span>
                      {Array.isArray(q.options) && Array.isArray(q.studentAnswer?.selectedOptionIDs) && q.options.filter(opt => q.studentAnswer.selectedOptionIDs.includes(opt.mcqOptionID)).length > 0 ? (
                        q.options.filter(opt => q.studentAnswer.selectedOptionIDs.includes(opt.mcqOptionID)).map(opt => (
                          <span key={opt.mcqOptionID} style={{ color: '#1890ff', fontWeight: 600, marginRight: 12 }}>{opt.context}</span>
                        ))
                      ) : (
                        <span className="text-gray-500"><i>Chưa chọn đáp án</i></span>
                      )}
                    </div>
                    {/* Hiển thị đáp án đúng dưới mỗi câu */}
                    <div style={{ marginTop: 4, marginBottom: 4, border: '1.5px solid #52c41a', background: '#f6ffed', borderRadius: 8, padding: '6px 12px', display: 'inline-block' }}>
                      <span className="font-medium"><strong>Đáp án đúng:</strong> </span>
                      {q.options.filter(opt => opt.isCorrect).map(opt => (
                        <span key={opt.mcqOptionID} style={{ color: '#389e0d', fontWeight: 600, marginRight: 12 }}>{opt.context}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* <div className="mb-8">
                  <Text type="secondary">(Không phải câu tự luận)</Text>
                </div> */}
              </div>
            ))}
          </Card>
        );
      })}
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Button type="primary" size="large" loading={saving} onClick={handleSave}>
          Chấm điểm
        </Button>
      </div>
    </div>
  );
};

export default LecturerTestDetail; 