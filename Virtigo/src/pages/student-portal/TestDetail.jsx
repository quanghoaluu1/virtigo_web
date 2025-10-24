import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, Alert, Descriptions, Divider, Tag, Radio } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusMap = {
  Pending: 'Chưa làm',
  Submitted: 'Đã nộp bài',
  AutoGradedWaitingForWritingGrading: 'Đã chấm tự động',
  WaitingForWritingGrading: 'Chờ chấm tự luận',
  Graded: 'Đã chấm',
  Published: 'Đã công bố điểm',
};

const TestDetail = () => {
  const { studentTestID } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    setLoading(true);
    try {
      const history = JSON.parse(localStorage.getItem('studentTestHistory') || '[]');
      const found = history.find(item => item.studentTestID === studentTestID);
      setData(found || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentTestID]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Spin size="large" /></div>;
  }
  if (!data) {
    return <Alert message="Không tìm thấy thông tin bài làm" type="error" showIcon className="m-24" />;
  }

  // Tổng điểm tối đa
  const maxScore = Array.isArray(data.sections)
    ? data.sections.reduce((sum, s) => sum + (s.sectionScore || 0), 0)
    : '';

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 32, margin: 24, minHeight: 600 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-16">
        Quay lại
      </Button>
      <Title level={2} style={{ fontWeight: 700, marginBottom: 8 }}>Chi tiết bài làm</Title>
      <Descriptions bordered column={2} style={{ marginBottom: 24, background: '#fafcff', borderRadius: 12, padding: 16 }}>
        <Descriptions.Item label="Học sinh">{data.studentName}</Descriptions.Item>
        <Descriptions.Item label="Mã bài làm">{data.studentTestID}</Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">{data.startTime ? dayjs(data.startTime).format('DD/MM/YYYY HH:mm') : ''}</Descriptions.Item>
        <Descriptions.Item label="Thời gian nộp">{data.submitTime ? dayjs(data.submitTime).format('DD/MM/YYYY HH:mm') : ''}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={2}>
          <Tag color="blue" className="text-[16px]">{statusMap[data.status] || data.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Điểm" span={2}>
          <Text strong className="text-[16px]">{data.originalSubmissionScore}{maxScore ? ` / ${maxScore}` : ''}</Text>
        </Descriptions.Item>
        {data.comment && <Descriptions.Item label="Nhận xét" span={2}>{data.comment}</Descriptions.Item>}
      </Descriptions>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Điều chỉnh cỡ chữ:</span>
        <Button size="small" onClick={() => setFontSize(f => Math.max(12, f - 2))}>A-</Button>
        <Button size="small" onClick={() => setFontSize(f => Math.min(32, f + 2))}>A+</Button>
        <span style={{ fontSize: 14, color: '#888' }}>{fontSize}px</span>
      </div>
      {Array.isArray(data.sections) && data.sections.map((section, idx) => (
        <Card
          key={section.testSectionID || idx}
          style={{ marginBottom: 32, borderRadius: 16, boxShadow: '0 2px 8px #f0f1f2' }}
          bodyStyle={{ background: '#fafdff', borderRadius: 16 }}
          title={<span style={{ fontWeight: 600, fontSize: 18 }}>{section.context}</span>}
          extra={<Text type="secondary">Điểm phần này: <b>{section.studentGetScore} / {section.sectionScore}</b></Text>}
        >
          <Divider />
          {section.questions.map((q, qIdx) => (
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
                {/* Điểm từng câu ở góc phải */}
                {q.type === 0 && (() => {
                  const correctOptionIDs = q.options.filter(o => o.isCorrect).map(o => o.mcqOptionID);
                  const selectedOptionIDs = q.studentAnswer?.selectedOptionIDs || [];
                  const allCorrect = correctOptionIDs.length === selectedOptionIDs.length &&
                    correctOptionIDs.every(id => selectedOptionIDs.includes(id));
                  const anyWrong = selectedOptionIDs.some(id => !correctOptionIDs.includes(id));
                  const isFullScore = allCorrect && !anyWrong;
                  return (
                    <span style={{ fontWeight: 600, fontSize: fontSize - 2 }}>
                      Điểm: {isFullScore ? q.score : 0} / {q.score}
                    </span>
                  );
                })()}
                {q.type === 2 && (
                  <span style={{ fontWeight: 600, fontSize: fontSize - 2 }}>
                    {/* Điểm: {typeof q.studentAnswer?.writingScore === 'number' ? q.studentAnswer.writingScore : 0} / {q.score} */}
                  </span>
                )}
              </div>
              {q.type === 0 && Array.isArray(q.options) && (
                <div className="mb-8">
                  <Text type="secondary">Tất cả đáp án:</Text>
                  <Radio.Group value={q.studentAnswer?.selectedOptionIDs?.length === 1 ? q.studentAnswer.selectedOptionIDs[0] : undefined} style={{ width: '100%', marginTop: 8 }} disabled>
                    {q.options.map(opt => {
                      const isSelected = q.studentAnswer?.selectedOptionIDs?.includes(opt.mcqOptionID);
                      const isCorrect = opt.isCorrect;
                      const correctOptionCount = q.options.filter(o => o.isCorrect).length;
                      const selectedCorrectCount = q.options.filter(o => o.isCorrect && q.studentAnswer?.selectedOptionIDs?.includes(o.mcqOptionID)).length;
                      const selectedWrongCount = q.options.filter(o => !o.isCorrect && q.studentAnswer?.selectedOptionIDs?.includes(o.mcqOptionID)).length;
                      // Xác định màu tick
                      let icon = null;
                      if (isSelected) {
                        if (isCorrect && correctOptionCount === 1) {
                          icon = <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />;
                        } else if (!isCorrect && correctOptionCount === 1) {
                          icon = <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 20 }} />;
                        } else if (correctOptionCount > 1) {
                          if (selectedCorrectCount === correctOptionCount && selectedWrongCount === 0) {
                            icon = <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />;
                          } else if (isCorrect) {
                            icon = <ExclamationCircleFilled style={{ color: '#1890ff', fontSize: 20 }} />;
                          } else {
                            icon = <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 20 }} />;
                          }
                        }
                      }
                      // Nền đáp án
                      let background = undefined;
                      if (isSelected) {
                        if (icon && icon.props.style.color === '#52c41a') background = '#f6ffed';
                        else if (icon && icon.props.style.color === '#1890ff') background = '#e6f7ff';
                        else if (icon && icon.props.style.color === '#ff4d4f') background = '#fff1f0';
                        else background = '#e6f7ff';
                      }
                      return (
                        <div
                          key={opt.mcqOptionID}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 8,
                            padding: '8px 12px',
                            borderRadius: 8,
                            background,
                            fontSize: fontSize
                          }}
                        >
                          <Radio
                            value={opt.mcqOptionID}
                            checked={isSelected}
                            disabled
                            className="mr-10"
                          />
                          <span>{opt.context}</span>
                          {isSelected && (
                            <span className="ml-10">{icon}</span>
                          )}
                        </div>
                      );
                    })}
                  </Radio.Group>
                  {/* Hiển thị đáp án đúng dưới mỗi câu */}
                  <div style={{
                    marginTop: 4,
                    marginBottom: 4,
                    border: '1.5px solid #52c41a',
                    background: '#f6ffed',
                    borderRadius: 8,
                    padding: '6px 12px',
                    display: 'inline-block'
                  }}>
                    <span className="font-medium"><strong>Đáp án đúng:</strong> </span>
                    {q.options.filter(opt => opt.isCorrect).map(opt => (
                      <span key={opt.mcqOptionID} style={{ color: '#389e0d', fontWeight: 600, marginRight: 12 }}>{opt.context}</span>
                    ))}
                  </div>
                </div>
              )}
              {q.type === 2 && (
                <div className="mb-8">
                  <Text>Đáp án của bạn: </Text>
                  <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: fontSize, minHeight: 100 }}>
                    {q.studentAnswer?.studentEssay || <i>Chưa trả lời</i>}
                  </div>
                  {q.studentAnswer?.feedback && (
                    <div style={{ background: '#fffbe6', padding: 10, borderRadius: 6, marginTop: 8 }}>
                      <Text type="secondary">Nhận xét: {q.studentAnswer.feedback}</Text>
                    </div>
                  )}
                </div>
              )}
              {typeof q.score === 'number' && (
                <div className="mt-8">
                  {/* <Text type="secondary">Điểm: {q.score}</Text> */}
                </div>
              )}
              {typeof q.studentAnswer?.writingScore === 'number' && (
                <div className="mt-8">
                  <Text type="secondary">Điểm tự luận: {q.studentAnswer.writingScore}</Text>
                </div>
              )}
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};

export default TestDetail; 