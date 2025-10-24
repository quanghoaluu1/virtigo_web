import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Card, Collapse, List, Spin, Alert, Button, Tag, Typography, Row, Col, Input, InputNumber, message, Modal, notification } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { UserOutlined, FileTextOutlined, InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ActionConfirm from '../common/ActionConfirm';
import Notification from '../common/Notification';

const { Panel } = Collapse;

const STATUS_LABELS = {
  0: 'Nháp',
  1: 'Chờ duyệt',
  2: 'Từ chối',
  3: 'Đang hoạt động',
  4: 'Đã xóa',
};

const CATEGORY_LABELS = {
  0: 'Kiểm tra 15 phút',
  2: 'Thi giữa kì',
  3: 'Thi cuối kì',
};

const TEST_TYPE_LABELS = {
  1: 'Vocabulary',
  2: 'Grammar',
  3: 'Listening',
  4: 'Reading',
  5: 'Writing',
  6: 'Mix',
  7: 'MCQ',
  8: 'Other',
};

// State để lưu barem điểm cho từng questionID
const useWritingBarem = (sections) => {
  const [baremMap, setBaremMap] = useState({});
  useEffect(() => {
    const fetchBarem = async () => {
      const map = {};
      for (const section of sections) {
        if (section.testSectionType === 2 && Array.isArray(section.questions)) {
          for (const q of section.questions) {
            if (q.questionID) {
              try {
                const res = await axios.get(`${API_URL}WritingBarem/${q.questionID}`);
                map[q.questionID] = res.data?.data || [];
              } catch {
                map[q.questionID] = [];
              }
            }
          }
        }
      }
      setBaremMap(map);
    };
    if (sections && sections.length > 0) fetchBarem();
  }, [sections]);
  return baremMap;
};

const ViewDetailAssessment = ({ testID: propTestID, inModal }) => {
  // testID có thể lấy từ prop hoặc từ URL
  const params = useParams();
  const testID = propTestID || params.testID;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();
  const [approving, setApproving] = useState(false);
  const [testStatus, setTestStatus] = useState();
  const [creatorFullname, setCreatorFullname] = useState('');
  const [createBy, setCreateBy] = useState('');
  const [testInfo, setTestInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editSections, setEditSections] = useState([]);
  const [editTestName, setEditTestName] = useState('');
  let userRole = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user && user.role;
  } catch (e) {
    userRole = null;
  }
  const isManager = userRole === 'Manager';
  const isLecturer = userRole === 'Lecture';
  const isStudent = userRole === 'Student';

  // Lấy user info từ localStorage
  let currentUser = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('user')) || {};
  } catch {}
  const isOwnDraft = isManager && testInfo.status === 0 && testInfo.account?.accountID === currentUser.accountId;
  const isLecture = userRole === 'Lecture';
  const isOwnDraftLecture = isLecture && testInfo.status === 0 && createBy === currentUser.accountId;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(undefined);
      try {
        // Lấy chi tiết section (có imageURL) từ API mới
        const sectionRes = await axios.get(`${API_URL}api/TestSection/by-test/${testID}`);
        const sectionList = Array.isArray(sectionRes.data) ? sectionRes.data : [];
        // Lấy chi tiết câu hỏi từ API cũ
        const res = await axios.get(`${API_URL}api/Questions/by-test/${testID}`);
        let questionSections = res.data || [];
        // Merge imageURL và audioURL từ sectionList vào questionSections
        questionSections = questionSections.map((sec, idx) => {
          const match = sectionList[idx] || {};
          return {
            ...sec,
            imageURL: match.imageURL || sec.imageURL,
            audioURL: match.audioURL || sec.audioURL,
          };
        });
        setSections(questionSections);
        setEditSections(JSON.parse(JSON.stringify(questionSections)));
        // Lấy status từ section đầu tiên (giả sử backend trả về status ở đây)
        if (questionSections && questionSections[0] && questionSections[0].testStatus !== undefined) {
          setTestStatus(questionSections[0].testStatus);
        } else if (questionSections && questionSections[0] && questionSections[0].status !== undefined) {
          setTestStatus(questionSections[0].status);
        }
        // Gọi thêm API để lấy fullname người tạo
        try {
          const testRes = await axios.get(`${API_URL}api/Test/${testID}`);
          const fullname = testRes.data?.account?.fullname || '';
          const createBy = testRes.data?.createBy || '';
          setCreatorFullname(fullname);
          setCreateBy(createBy);
          setTestInfo(testRes.data || {});
          setEditTestName(testRes.data?.testName || '');
        } catch {}
      } catch (e) {
        setError('Không thể tải chi tiết bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    if (testID) fetchDetail();
  }, [testID]);

  // Lấy barem điểm cho từng questionID
  const writingBaremMap = useWritingBarem(sections);

  // Lấy thông tin cơ bản từ section đầu tiên nếu có
  const basicInfo = sections.length > 0 ? sections[0] : {};

  // Hàm duyệt bài kiểm tra (API sẽ gắn sau)
  const handleApprove = async () => {
    setApproving(true);
    try {
      // Không cần truyền accountID nữa
      await axios.put(`${API_URL}api/Test/update-status-fix`, { testID, testStatus: 3 });
      setTestStatus(3);
      // Reload lại chi tiết
      const res = await axios.get(`${API_URL}api/Questions/by-test/${testID}`);
      setSections(res.data || []);
    } catch (e) {
      // message.error('Lỗi khi duyệt bài kiểm tra!');
    } finally {
      setApproving(false);
    }
  };

  // Hàm xử lý thay đổi nội dung câu hỏi
  const handleQuestionChange = (sectionIdx, qIdx, value) => {
    setEditSections(prev => prev.map((sec, i) => i !== sectionIdx ? sec : {
      ...sec,
      questions: sec.questions.map((q, j) => j !== qIdx ? q : { ...q, context: value })
    }));
  };

  // Hàm xử lý thay đổi đáp án
  const handleAnswerChange = (sectionIdx, qIdx, aIdx, value) => {
    setEditSections(prev => prev.map((sec, i) => i !== sectionIdx ? sec : {
      ...sec,
      questions: sec.questions.map((q, j) => j !== qIdx ? q : {
        ...q,
        options: q.options.map((a, k) => k !== aIdx ? a : { ...a, context: value })
      })
    }));
  };

  // Thêm câu hỏi
  const handleAddQuestion = (sectionIdx) => {
    setEditSections(prev => prev.map((sec, i) => i !== sectionIdx ? sec : {
      ...sec,
      questions: [
        ...sec.questions,
        { context: '', options: [], imageURL: '', audioURL: '' }
      ]
    }));
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (sectionIdx, qIdx) => {
    setEditSections(prev => prev.map((sec, i) => i !== sectionIdx ? sec : {
      ...sec,
      questions: sec.questions.filter((_, j) => j !== qIdx)
    }));
  };

  // Thêm đáp án
  const handleAddAnswer = (sectionIdx, qIdx) => {
    setEditSections(prev => prev.map((sec, i) => i !== sectionIdx ? sec : {
      ...sec,
      questions: sec.questions.map((q, j) => j !== qIdx ? q : {
        ...q,
        options: [...(q.options || []), { context: '', isCorrect: false }]
      })
    }));
  };

  // Xóa đáp án
  const handleDeleteAnswer = (sectionIdx, qIdx, aIdx) => {
    setEditSections(prev => prev.map((sec, i) => i !== sectionIdx ? sec : {
      ...sec,
      questions: sec.questions.map((q, j) => j !== qIdx ? q : {
        ...q,
        options: q.options.filter((_, k) => k !== aIdx)
      })
    }));
  };

  // Đánh dấu đáp án đúng
  const handleSetCorrect = (sectionIdx, qIdx, aIdx) => {
    setEditSections(prev => prev.map((sec, i) => i !== sectionIdx ? sec : {
      ...sec,
      questions: sec.questions.map((q, j) => j !== qIdx ? q : {
        ...q,
        options: q.options.map((a, k) => ({ ...a, isCorrect: k === aIdx }))
      })
    }));
  };

  // Thêm state notification cho Notification.tsx custom
  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });

  // Hàm xác nhận lưu
  const handleSave = async () => {
    try {
      // Lấy accountId từ localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const accountId = user?.accountId;
      // 1. Gọi API update testName
      console.time('updateTest');
      const resTest = await axios.put(`${API_URL}api/Test/${testID}`, {
        testID,
        testName: editTestName,
        requestingAccountID: accountId
      });
      console.timeEnd('updateTest');
      if (resTest.data && resTest.data.success === false) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Cập nhật thất bại',
          description: resTest.data.message || 'Cập nhật tên bài kiểm tra thất bại!'
        });
        setIsEditing(false);
        return;
      }
      // 2. Chuẩn bị dữ liệu cho API bulk-update questions
      const questionsPayload = [];
      for (const section of editSections) {
        for (const q of section.questions || []) {
          questionsPayload.push({
            questionID: q.questionID,
            context: q.context,
            imageURL: q.imageURL || '',
            audioURL: q.audioURL || '',
            options: Array.isArray(q.options) ? q.options.map(a => ({
              context: a.context,
              imageURL: a.imageURL || '',
              audioURL: a.audioURL || '',
              isCorrect: !!a.isCorrect
            })) : []
          });
        }
      }
      // 3. Gọi API bulk-update questions nếu có câu hỏi
      if (questionsPayload.length > 0) {
        console.time('bulkUpdateQuestions');
        const resQuestions = await axios.put(`${API_URL}api/Questions/questions/bulk-update`, {
          questions: questionsPayload
        });
        console.timeEnd('bulkUpdateQuestions');
        if (resQuestions.data && resQuestions.data.success === false) {
          setNotification({
            visible: true,
            type: 'error',
            message: 'Cập nhật thất bại',
            description: resQuestions.data.message || 'Cập nhật câu hỏi thất bại!'
          });
          setIsEditing(false);
          return;
        }
      }
      setTestInfo(prev => ({ ...prev, testName: editTestName }));
      setNotification({
        visible: true,
        type: 'success',
        message: 'Thành công',
        description: 'Đã cập nhật bài kiểm tra!'
      });
    } catch (e) {
      let msg = 'Cập nhật bài kiểm tra thất bại!';
      if (e.response && e.response.data && e.response.data.message) {
        msg = e.response.data.message;
      }
      setNotification({
        visible: true,
        type: 'error',
        message: 'Cập nhật thất bại',
        description: msg
      });
    }
    setIsEditing(false);
  };

  // Kiểm tra testType là Writing (6)
  const isWritingTest = testInfo.testType === 6;

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  // Thêm state cho xác nhận cập nhật
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

  // Thêm state cho preview ảnh
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const handlePreview = (src) => {
    setPreviewImage(src);
    setPreviewVisible(true);
  };
  const handleClosePreview = () => {
    setPreviewVisible(false);
    setPreviewImage(null);
  };

  return (
    <div style={{ maxWidth: 950, margin: '0 auto', padding: 24 }}>
      {/* Notification */}
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification(n => ({ ...n, visible: false }))}
      />
      {/* Thanh tiêu đề & nút thao tác */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="flex items-center gap-12">
          <FileTextOutlined style={{ fontSize: 32, color: '#1677ff' }} />
          {isEditing ? (
            <Input
              value={editTestName}
              onChange={e => setEditTestName(e.target.value)}
              style={{ fontSize: 24, fontWeight: 700, color: '#1677ff', width: 350 }}
              maxLength={100}
            />
          ) : (
            <Typography.Title level={2} style={{ margin: 0, color: '#1677ff', fontWeight: 700, fontSize: 28 }}>
              {testInfo.testName || 'Chi tiết bài kiểm tra'}
            </Typography.Title>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* MANAGER: Chỉ 1 nút duyệt khi nháp, 2 nút khi chờ duyệt */}
          {isManager && testInfo.status === 0 && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setShowApproveConfirm(true)}
                loading={approving}
                disabled={loading || approving}
              >
                Duyệt bài kiểm tra
              </Button>
              <ActionConfirm
                open={showApproveConfirm}
                title="Xác nhận duyệt bài kiểm tra"
                content="Bạn xác nhận muốn duyệt bài kiểm này?"
                onOk={async () => {
                  setShowApproveConfirm(false);
                  setApproving(true);
                  try {
                    await axios.put(`${API_URL}api/Test/update-status-fix`, { testID, testStatus: 3 });
                    setTestStatus(3);
                    navigate('/dashboard/assessment', {
                      state: {
                        showNotification: true,
                        notificationType: 'success',
                        notificationMessage: 'Thành công',
                        notificationDescription: 'Đã duyệt bài kiểm tra!'
                      }
                    });
                  } catch {
                    setNotification({
                      visible: true,
                      type: 'error',
                      message: 'Lỗi',
                      description: 'Lỗi khi duyệt bài kiểm tra!'
                    });
                  } finally {
                    setApproving(false);
                  }
                }}
                onCancel={() => setShowApproveConfirm(false)}
              />
            </>
          )}
          {isManager && testInfo.status === 1 && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setShowApproveConfirm(true)}
                loading={approving}
                disabled={loading || approving}
                className="mr-8"
              >
                Duyệt bài kiểm tra
              </Button>
              <ActionConfirm
                open={showApproveConfirm}
                title="Xác nhận duyệt bài kiểm tra"
                content="Bạn xác nhận muốn duyệt bài kiểm này?"
                onOk={async () => {
                  setShowApproveConfirm(false);
                  setApproving(true);
                  try {
                    await axios.put(`${API_URL}api/Test/update-status-fix`, { testID, testStatus: 3 });
                    setTestStatus(3);
                    navigate('/dashboard/assessment', {
                      state: {
                        showNotification: true,
                        notificationType: 'success',
                        notificationMessage: 'Thành công',
                        notificationDescription: 'Đã duyệt bài kiểm tra!'
                      }
                    });
                  } catch {
                    setNotification({
                      visible: true,
                      type: 'error',
                      message: 'Lỗi',
                      description: 'Lỗi khi duyệt bài kiểm tra!'
                    });
                  } finally {
                    setApproving(false);
                  }
                }}
                onCancel={() => setShowApproveConfirm(false)}
              />
            </>
          )}
          {/* LECTURER: Chỉ hiện nút gửi duyệt nếu là bài nháp của mình */}
          {isOwnDraftLecture && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={async () => {
                setApproving(true);
                try {
                  await axios.put(`${API_URL}api/Test/update-status-fix`, { testID, testStatus: 1 });
                  setTestStatus(1);
                  navigate('/lecturer/assessment', {
                    state: {
                      showNotification: true,
                      notificationType: 'success',
                      notificationMessage: 'Thành công',
                      notificationDescription: 'Đã gửi bài kiểm tra cho quản lí duyệt!'
                    }
                  });
                } catch {}
                setApproving(false);
              }}
              loading={approving}
              disabled={loading || approving || testInfo.status !== 0}
            >
              Gửi duyệt cho quản lí
            </Button>
          )}
          {/* Nút cập nhật và quay lại giữ nguyên logic cũ */}
          {testInfo.status === 0 && (isOwnDraft || isOwnDraftLecture) && !isEditing && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Cập nhật
            </Button>
          )}
          {isEditing && (
            <>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => setShowUpdateConfirm(true)}>
                Xác nhận
              </Button>
              <ActionConfirm
                open={showUpdateConfirm}
                title="Xác nhận cập nhật bài kiểm tra"
                content="Bạn có chắc chắn muốn cập nhật bài kiểm tra này?"
                onOk={async () => {
                  setShowUpdateConfirm(false);
                  await handleSave();
                }}
                onCancel={() => setShowUpdateConfirm(false)}
                okText="Xác nhận"
                cancelText="Hủy"
              />
            </>
          )}
          {!inModal && (
            <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
              Quay lại
            </Button>
          )}
        </div>
      </div>
      {/* Card thông tin test */}
      <Card bordered style={{ marginBottom: 32, background: '#f8fafd', boxShadow: '0 2px 8px #f0f1f2' }}>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            {(() => {
              let subjectName = '';
              if (testInfo.subject && testInfo.subject.subjectName) subjectName = testInfo.subject.subjectName;
              else if (testInfo.subjectName) subjectName = testInfo.subjectName;
              else subjectName = 'Chưa có môn học';
              return (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                  <b>Môn học:</b>&nbsp;
                  <span style={{ color: '#1677ff', fontWeight: 600 }}>{subjectName}</span>
                </div>
              );
            })()}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              <b>Loại:</b>&nbsp;{testInfo.testType === 6 ? 'Tổng hợp' : (TEST_TYPE_LABELS[testInfo.testType] ?? testInfo.testType)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              <b>Phân loại:</b>&nbsp;{CATEGORY_LABELS[testInfo.category] ?? testInfo.category}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              <b>Người tạo:</b>&nbsp;{creatorFullname}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <CheckCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              <b>Trạng thái:</b>&nbsp;
              <Tag color={testInfo.status === 3 ? 'green' : testInfo.status === 1 ? 'orange' : testInfo.status === 0 ? 'default' : 'red'} style={{ fontWeight: 600, fontSize: 15 }}>
                {STATUS_LABELS[testInfo.status] ?? testInfo.status}
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>
      {/* Danh sách section & câu hỏi */}
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 16, color: '#222' }}>
        Danh sách section & câu hỏi
      </Typography.Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(isEditing ? editSections : sections).map((section, idx) => (
          <Card key={idx} bordered style={{ background: '#fff', boxShadow: '0 1px 6px #f0f1f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Typography.Title level={5} style={{ margin: 0, color: '#1677ff' }}>
                Trang {idx + 1}: <span style={{ color: '#222' }}>{section.context || ''}</span>
              </Typography.Title>
              <span style={{ fontWeight: 500, color: '#888' }}>Điểm: {section.score}</span>
            </div>
            {/* Hiển thị ảnh/audio tổng của section */}
            {(section.imageURL || section.audioURL) && (
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                {section.imageURL && (
                  <img
                    src={section.imageURL}
                    alt="img"
                    style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #eee', boxShadow: '0 2px 8px #0001', cursor: 'pointer' }}
                    onClick={() => handlePreview(section.imageURL)}
                  />
                )}
                {section.audioURL && (
                  <audio controls src={section.audioURL} style={{ height: 36, borderRadius: 6, background: '#fff' }} />
                )}
              </div>
            )}
            <Typography.Text strong style={{ color: '#444', fontSize: 16 }}>Danh sách câu hỏi</Typography.Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
              {(section.questions || []).map((q, qIdx) => (
                <Card
                  key={qIdx}
                  size="small"
                  style={{ background: '#f6faff', border: '1px solid #e6eaf0', boxShadow: '0 1px 3px #f0f1f2' }}
                  bodyStyle={{ padding: 16 }}
                  title={<span style={{ color: '#1677ff', fontWeight: 600 }}>Câu {qIdx + 1}</span>}
                  extra={isEditing && <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDeleteQuestion(idx, qIdx)} />}
                >
                  <div className="mb-8">
                    <b>Nội dung:</b> {isEditing ? (
                      <Input.TextArea
                        value={q.context}
                        onChange={e => handleQuestionChange(idx, qIdx, e.target.value)}
                        autoSize
                        className="mt-4"
                      />
                    ) : (
                      <span style={{ color: '#222' }}>{q.context}</span>
                    )}
                    {/* Hiển thị ảnh/audio cho câu hỏi */}
                    {q.imageURL && (
                      <img src={q.imageURL} alt="img" style={{ maxWidth: 120, marginLeft: 8, verticalAlign: 'middle', borderRadius: 4, border: '1px solid #eee', cursor: 'pointer' }} onClick={() => handlePreview(q.imageURL)} />
                    )}
                    {q.audioURL && (
                      <audio src={q.audioURL} controls style={{ marginLeft: 8, verticalAlign: 'middle' }} />
                    )}
                    {/* Hiển thị barem điểm cho câu hỏi viết nếu testSectionType === 2 */}
                    {section.testSectionType === 2 && (
                      <div style={{ marginTop: 12, marginBottom: 8 }}>
                        <b>Barem chấm điểm:</b>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid #eee', padding: 4 }}>Tiêu chí</th>
                              <th style={{ border: '1px solid #eee', padding: 4 }}>Điểm</th>
                              <th style={{ border: '1px solid #eee', padding: 4 }}>Mô tả</th>
                            </tr>
                          </thead>
                          <tbody>
                           {q.questionID && writingBaremMap[q.questionID] ? (
                             writingBaremMap[q.questionID].length > 0 ? (
                               writingBaremMap[q.questionID].map((c, cIdx) => (
                                 <tr key={c.writingBaremID || cIdx}>
                                   <td style={{ border: '1px solid #eee', padding: 4 }}>{c.criteriaName}</td>
                                   <td style={{ border: '1px solid #eee', padding: 4 }}>{c.maxScore}</td>
                                   <td style={{ border: '1px solid #eee', padding: 4 }}>{c.description}</td>
                                 </tr>
                               ))
                             ) : (
                               <tr>
                                 <td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 8 }}>
                                   Chưa có barem chấm điểm
                                 </td>
                               </tr>
                             )
                           ) : (
                             <tr>
                               <td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 8 }}>
                                 Đang tải barem điểm...
                               </td>
                             </tr>
                           )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="mt-8">
                      <b>Đáp án:</b>
                      <ul style={{ paddingLeft: 24, margin: 0 }}>
                        {q.options.map((a, aIdx) => (
                          <li key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            {isEditing ? (
                              <>
                                <Input
                                  value={a.context}
                                  onChange={e => handleAnswerChange(idx, qIdx, aIdx, e.target.value)}
                                  className="w-[200px]"
                                />
                                <Button
                                  type={a.isCorrect ? 'primary' : 'default'}
                                  onClick={() => handleSetCorrect(idx, qIdx, aIdx)}
                                  size="small"
                                  icon={<CheckOutlined />}
                                >
                                  Đúng
                                </Button>
                                <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAnswer(idx, qIdx, aIdx)} />
                              </>
                            ) : (
                              <>
                                <span className="font-medium">{String.fromCharCode(65 + aIdx)}.</span>
                                <span style={{ color: a.isCorrect ? '#389e0d' : '#222', fontWeight: a.isCorrect ? 600 : 400 }}>
                                  {a.context}
                                  {a.isCorrect && <span className="ml-6">(Đúng)</span>}
                                </span>
                              </>
                            )}
                            {a.imageURL && (
                              <img src={a.imageURL} alt="img" style={{ maxWidth: 60, marginLeft: 8, verticalAlign: 'middle', borderRadius: 4, border: '1px solid #eee', cursor: 'pointer' }} onClick={() => handlePreview(a.imageURL)} />
                            )}
                            {a.audioURL && (
                              <audio src={a.audioURL} controls style={{ marginLeft: 8, verticalAlign: 'middle' }} />
                            )}
                          </li>
                        ))}
                        {isEditing && (
                          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => handleAddAnswer(idx, qIdx)} className="mt-4">
                            Thêm đáp án
                          </Button>
                        )}
                      </ul>
                    </div>
                  )}
                  {isEditing && (
                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => handleAddQuestion(idx)} className="mt-8">
                      Thêm câu hỏi
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {/* Modal preview ảnh */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={handleClosePreview}
        centered
        bodyStyle={{
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
          minHeight: 0,
          minWidth: 0,
          overflow: 'visible'
        }}
        style={{
          background: 'rgba(0,0,0,0.15)',
          boxShadow: 'none',
          top: 0,
          padding: 0,
          margin: 0,
        }}
        maskStyle={{
          background: 'rgba(0,0,0,0.35)'
        }}
        width="auto"
      >
        {previewImage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40vh',
              minWidth: '40vw',
              maxWidth: '90vw',
              maxHeight: '80vh',
              margin: '0 auto',
              padding: 0,
              background: 'transparent'
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                padding: 16,
                maxWidth: '90vw',
                maxHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'zoomIn 0.25s'
              }}
            >
              <img
                src={previewImage}
                alt="preview"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '70vh',
                  borderRadius: 12,
                  boxShadow: '0 2px 12px #0002',
                  background: '#fff',
                  display: 'block'
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ViewDetailAssessment;
