import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, Row, Col, Radio, Space, Card, Tabs, Alert, message } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateQuestion from './CreateQuestion';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import ImagePreviewModal from './ImagePreviewModal';

const { Option } = Select;
const { TabPane } = Tabs;

const TEST_SECTION_TYPE_OPTIONS = [
  { value: 'Multiple', label: 'Multiple Choice' },
  { value: 'TrueFalse', label: 'True/False' },
];

const SECTION_TYPE_OPTIONS_MAP = {
  default: [
    { value: 'MCQ', label: 'MCQs' },
    { value: 'TrueFalse', label: 'True/False' },
  ],
  writing: [
    { value: 'Writing', label: 'Writing' },
  ],
  all: [
    { value: 'Writing', label: 'Writing' },
    { value: 'MCQ', label: 'MCQs' },
    { value: 'TrueFalse', label: 'True/False' },
  ],
};

const DEFAULT_ANSWERS = [
  { text: '', key: 'A' },
  { text: '', key: 'B' },
  { text: '', key: 'C' },
  { text: '', key: 'D' },
];

const CreateAssessmentSection = ({
  testType,
  sections = [],
  onChange,
  onImportExcel,
  errors = {},
  showNoSectionWarning,
  onAddSectionWarningClear,
  showSectionNameError = {},
  onSectionNameInput
}) => {
  const [activeKey, setActiveKey] = useState('0');
  // Luôn lấy sectionList từ props.sections
  const sectionList = sections && sections.length > 0 ? sections : [];
  // State questions luôn đồng bộ với section đang active
  const [questions, setQuestions] = useState(sectionList[0]?.questions || []);
const [isPreviewVisible, setIsPreviewVisible] = useState(false);
const [previewImageUrl, setPreviewImageUrl] = useState('');
  // Đồng bộ questions khi sections hoặc activeKey thay đổi
  useEffect(() => {
    setQuestions(sectionList[Number(activeKey)]?.questions || []);
  }, [sections, activeKey]);

  // Đồng bộ lại type của section khi testType thay đổi
  useEffect(() => {
    if (testType === 'Writing') {
      const updatedSections = sectionList.map(sec =>
        sec.type !== 'Writing' ? { ...sec, type: 'Writing' } : sec
      );
      if (JSON.stringify(updatedSections) !== JSON.stringify(sectionList)) {
        onChange && onChange(updatedSections);
      }
    }
    // Không làm gì nếu testType khác 'Writing'
    // eslint-disable-next-line
  }, [testType]);

  // Handler cho các trường header
  const handleHeaderChange = (field, value) => {
    const idx = Number(activeKey);
    const newSections = sectionList.map((sec, i) => i === idx ? { ...sec, [field]: value } : sec);
    onChange && onChange(newSections);
  };

  // Thêm section mới
  const handleAddSection = () => {
    let newType;
    if (testType === 'Writing') {
      newType = 'Writing';
    } else {
      newType = undefined;
    }
    const newSection = { name: '', type: newType, score: 0, questions: [] };
    const newSections = [...sectionList, newSection];
    onChange && onChange(newSections);
    setActiveKey(String(newSections.length - 1));
    if (onAddSectionWarningClear) onAddSectionWarningClear();
  };

  // Xóa section
  const handleRemoveSection = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = 0;
    const newSections = sectionList.filter((_, i) => {
      if (String(i) === targetKey) {
        lastIndex = i - 1;
      }
      return String(i) !== targetKey;
    });
    if (newSections.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = String(lastIndex);
      } else {
        newActiveKey = '0';
      }
    }
    setActiveKey(newActiveKey);
    onChange && onChange(newSections);
  };

  // Khi chuyển tab
  const handleTabChange = (key) => {
    setActiveKey(key);
    setQuestions(sectionList[Number(key)].questions || []);
  };

  // Xử lý upload ảnh/audio chỉ cho phép 1 loại
  const handleSectionUpload = (file, type) => {
    if (type === 'image') {
      // Nếu upload ảnh thì xóa audio
      const newSection = { ...sectionList[Number(activeKey)], imageURL: file.name, audioURL: undefined };
      onChange && onChange([...sectionList.slice(0, Number(activeKey)), newSection, ...sectionList.slice(Number(activeKey) + 1)]);
    } else if (type === 'audio') {
      // Nếu upload audio thì xóa ảnh
      const newSection = { ...sectionList[Number(activeKey)], audioURL: file.name, imageURL: undefined };
      onChange && onChange([...sectionList.slice(0, Number(activeKey)), newSection, ...sectionList.slice(Number(activeKey) + 1)]);
    }
  };

  // Thêm câu hỏi mới
  const handleAddQuestion = () => {
    const newQuestions = [
      {
        content: '',
        answers: DEFAULT_ANSWERS.map(a => ({ ...a })),
        correct: 0, // index
      },
      ...questions,
    ];
    setQuestions(newQuestions);
    // Chỉ cập nhật questions, giữ nguyên các trường khác của section
    onChange && onChange([...sectionList.slice(0, Number(activeKey)), { ...sectionList[Number(activeKey)], questions: newQuestions }, ...sectionList.slice(Number(activeKey) + 1)]);
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = idx => {
    const newQuestions = questions.filter((_, i) => i !== idx);
    setQuestions(newQuestions);
    onChange && onChange([...sectionList.slice(0, Number(activeKey)), { ...sectionList[Number(activeKey)], questions: newQuestions }, ...sectionList.slice(Number(activeKey) + 1)]);
  };

  // Sửa nội dung câu hỏi
  const handleQuestionChange = (idx, field, value) => {
    const newQuestions = questions.map((q, i) =>
      i === idx ? { ...q, [field]: value } : q
    );
    setQuestions(newQuestions);
    onChange && onChange([...sectionList.slice(0, Number(activeKey)), { ...sectionList[Number(activeKey)], questions: newQuestions }, ...sectionList.slice(Number(activeKey) + 1)]);
  };

  // Upload ảnh/audio cho từng câu hỏi
  const handleQuestionUpload = (qIdx, file, type) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIdx) return q;
      if (type === 'image') {
        return { ...q, imageURL: file.name, audioURL: undefined };
      } else if (type === 'audio') {
        return { ...q, audioURL: file.name, imageURL: undefined };
      }
      return q;
    });
    setQuestions(newQuestions);
    onChange && onChange([...sectionList.slice(0, Number(activeKey)), { ...sectionList[Number(activeKey)], questions: newQuestions }, ...sectionList.slice(Number(activeKey) + 1)]);
  };

  // Sửa đáp án
  const handleAnswerChange = (qIdx, aIdx, value) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const newAnswers = q.answers.map((a, j) =>
        j === aIdx ? { ...a, text: value } : a
      );
      return { ...q, answers: newAnswers };
    });
    setQuestions(newQuestions);
    onChange && onChange([...sectionList.slice(0, Number(activeKey)), { ...sectionList[Number(activeKey)], questions: newQuestions }, ...sectionList.slice(Number(activeKey) + 1)]);
  };

  // Chọn đáp án đúng
  const handleCorrectChange = (qIdx, value) => {
    const newQuestions = questions.map((q, i) =>
      i === qIdx ? { ...q, correct: value } : q
    );
    setQuestions(newQuestions);
    onChange && onChange([...sectionList.slice(0, Number(activeKey)), { ...sectionList[Number(activeKey)], questions: newQuestions }, ...sectionList.slice(Number(activeKey) + 1)]);
  };

  // Tính điểm mỗi câu MCQ
  const perQuestionScore = (section) =>
    section.questions && section.questions.length > 0 && section.score
      ? (Number(section.score) / section.questions.length).toFixed(2)
      : '';

  // Tính tổng điểm các section
  const totalScore = sectionList.reduce((sum, sec) => sum + (Number(sec.score) || 0), 0);

  // Sau khi khai báo các biến, thêm hàm kiểm tra điều kiện tổng điểm barem cho writing section
  const isWritingCriteriaValid = sectionList
    .filter(sec => sec.type === 'Writing')
    .every(sec => {
      const q = (sec.questions && sec.questions[0]) || {};
      const totalCriteria = (q.criteriaList || []).reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0);
      return Number(sec.score) === totalCriteria;
    });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ minHeight: 24, display: 'flex', alignItems: 'center' }}>
          {showNoSectionWarning && (
            <span style={{ color: 'red', fontWeight: 500 }}>
              Chưa tạo trang cho bài kiểm tra !
            </span>
          )}
        </div>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSection}>
          Tạo trang mới
        </Button>
      </div>
      <Tabs
        type="editable-card"
        activeKey={activeKey}
        onChange={handleTabChange}
        onEdit={(targetKey, action) => {
          if (action === 'add') handleAddSection();
          if (action === 'remove') handleRemoveSection(targetKey);
        }}
        hideAdd
      >
        {sectionList.map((section, idx) => (
          <TabPane tab={`Trang ${idx + 1}`} key={String(idx)} closable={sectionList.length > 1}>
           <Row gutter={16} className="mb-24">
  {/* Tên trang: full width */}
  <Col span={24}>
    <div style={{ marginBottom: 4, fontWeight: 500 }}>Tên trang:</div>
    <Form.Item
      validateStatus={showSectionNameError?.[idx] && !section.name ? 'error' : ''}
      help={showSectionNameError?.[idx] && !section.name ? 'Chưa nhập tên trang!' : ''}
      className="mb-0"
    >
      <Input
        placeholder="Nhập tên trang"
        value={section.name || ''}
        onChange={e => {
          handleHeaderChange('name', e.target.value);
          onSectionNameInput?.(idx);
        }}
        status={showSectionNameError?.[idx] && !section.name ? 'error' : undefined}
      />
    </Form.Item>
  </Col>

  {/* Điểm và Loại: 2 cột 50/50 */}
  <Col span={12}>
    <div style={{ marginBottom: 4, fontWeight: 500 }}>Điểm:</div>
    <Form.Item
      validateStatus={errors[`score_${idx}`] ? 'error' : ''}
      help={errors[`score_${idx}`] ? 'Chưa nhập điểm hợp lệ!' : ''}
      className="mb-0"
    >
      <InputNumber
        className="w-full"
        value={section.score}
        onChange={val => handleHeaderChange('score', val)}
        placeholder="Nhập điểm"
        min={1}
        max={10}
      />
    </Form.Item>
  </Col>

  <Col span={12}>
    <div style={{ marginBottom: 4, fontWeight: 500 }}>Loại:</div>
    <Form.Item
      validateStatus={errors[`type_${idx}`] ? 'error' : ''}
      help={errors[`type_${idx}`] ? 'Chưa chọn loại trang!' : ''}
      className="mb-0"
    >
      {(() => {
        const MULTIPLE_TYPES = ['Vocabulary', 'Grammar', 'Listening', 'Reading', 'MCQ'];
        if (MULTIPLE_TYPES.includes(testType)) {
          return (
            <Select
              value={section.type || undefined}
              onChange={val => handleHeaderChange('type', val)}
              className="w-full"
              placeholder="Chọn thể loại kiểm tra"
              status={errors[`type_${idx}`] ? 'error' : undefined}
            >
              {SECTION_TYPE_OPTIONS_MAP.default.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          );
        }
        if (testType === 'Writing') {
          return (
            <Select
              value={section.type || undefined}
              onChange={val => handleHeaderChange('type', val)}
              className="w-full"
              placeholder="Chọn thể loại kiểm tra"
              disabled
            >
              {SECTION_TYPE_OPTIONS_MAP.writing.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          );
        }
        if (testType === 'Mix' || testType === 'Other') {
          return (
            <Select
              value={section.type || undefined}
              onChange={val => handleHeaderChange('type', val)}
              className="w-full"
              placeholder="Chọn thể loại kiểm tra"
              status={errors[`type_${idx}`] ? 'error' : undefined}
            >
              {SECTION_TYPE_OPTIONS_MAP.all.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          );
        }
        return <Input value={section.type || ''} disabled />;
      })()}
    </Form.Item>
  </Col>

  {/* Upload ảnh/audio tổng cho section */}
  <Col span={24}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      background: '#f6f8fa',
      borderRadius: 8,
      padding: '16px 20px',
      marginBottom: 20,
      marginTop: 8
    }}>
      {/* Upload ảnh */}
      <div className="flex items-center gap-16">
        <Upload
          customRequest={async (e) => {
            const file = e.file;
            try {
              const formData = new FormData();
              formData.append('file', file);
              const res = await axios.post(`${API_URL}api/Cloudinary/upload-image-test-section`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              const url = res.data.url || res.data;
              const newSections = [...sectionList];
              newSections[idx] = { ...newSections[idx], imageURL: url, audioURL: undefined };
              onChange && onChange(newSections);
            } catch (err) {}
          }}
          showUploadList={false}
          accept="image/*"
          disabled={!!section.audioURL}
        >
          <Button icon={<UploadOutlined />} disabled={!!section.audioURL} size="middle" type="primary">
            {section.imageURL ? 'Đổi ảnh' : 'Thêm ảnh'}
          </Button>
        </Upload>
        {section.imageURL && (
          <div className="flex items-center gap-8">
<img
  src={section.imageURL}
  alt="img"
  onClick={() => {
    setPreviewImageUrl(section.imageURL);
    setIsPreviewVisible(true);
  }}
  style={{
    maxWidth: 120,
    maxHeight: 80,
    borderRadius: 6,
    border: '1px solid #eee',
    boxShadow: '0 2px 8px #0001',
    cursor: 'pointer'
  }}
/>            <Button type="text" size="small" danger onClick={() => {
              const newSections = [...sectionList];
              newSections[idx] = { ...newSections[idx], imageURL: undefined };
              onChange && onChange(newSections);
            }} className="ml-0">X</Button>
          </div>
        )}
      </div>

      {/* Upload audio */}
      <div className="flex items-center gap-16">
        <Upload
          customRequest={async (e) => {
            const file = e.file;
            try {
              const formData = new FormData();
              formData.append('file', file);
              const res = await axios.post(`${API_URL}api/Cloudinary/upload-audio-test-section`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              const url = res.data.url || res.data;
              const newSections = [...sectionList];
              newSections[idx] = { ...newSections[idx], audioURL: url, imageURL: undefined };
              onChange && onChange(newSections);
            } catch (err) {}
          }}
          showUploadList={false}
          accept="audio/*"
          disabled={!!section.imageURL}
        >
          <Button icon={<UploadOutlined />} disabled={!!section.imageURL} size="middle" type="primary">
            {section.audioURL ? 'Đổi audio' : 'Thêm audio'}
          </Button>
        </Upload>
        {section.audioURL && (
          <div className="flex items-center gap-8">
            <audio controls src={section.audioURL} style={{ height: 36, verticalAlign: 'middle', borderRadius: 6, background: '#fff' }} />
            <Button type="text" size="small" danger onClick={() => {
              const newSections = [...sectionList];
              newSections[idx] = { ...newSections[idx], audioURL: undefined };
              onChange && onChange(newSections);
            }} className="ml-0">X</Button>
          </div>
        )}
      </div>
    </div>
  </Col>
</Row>

            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 24, minHeight: 200 }}>
              <div style={{ marginBottom: 16, fontWeight: 500, color: '#1677ff', fontSize: 16 }}>
                Tổng số câu hỏi: {section.questions ? section.questions.length : 0}
                {errors[`questions_${idx}`] && <span style={{ color: 'red', marginLeft: 16 }}>{errors[`questions_${idx}`]}</span>}
              </div>
              {section.type === 'Writing' ? (
                <>
                 
                  {section.questions && section.questions.map((q, qIdx) => (
                    <Card
                      key={qIdx}
                      className="mb-24"
                      title={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span>{`Câu ${qIdx + 1}:`}</span></div>}
                      extra={<Button type="text" icon={<DeleteOutlined />} danger onClick={() => {
                        const newQuestions = section.questions.filter((_, i) => i !== qIdx);
                        const newSections = [...sectionList];
                        newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                        onChange && onChange(newSections);
                      }} />}
                    >
                      <Form.Item
                        validateStatus={!q.content ? 'error' : ''}
                        help={!q.content ? 'Chưa nhập nội dung câu hỏi!' : ''}
                        className="mb-16"
                      >
                        <Input.TextArea
                          placeholder="Nhập nội dung câu hỏi viết"
                          value={q.content}
                          onChange={e => {
                            const newQuestions = section.questions.map((item, i) => i === qIdx ? { ...item, content: e.target.value } : item);
                            const newSections = [...sectionList];
                            newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                            onChange && onChange(newSections);
                          }}
                        />
                      </Form.Item>
                      {/* Barem chấm điểm cho câu hỏi viết */}
                      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 8 }}>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>Danh sách barem (tiêu chí chấm điểm):</div>
                        {(q.criteriaList || []).map((c, cIdx) => (
                          <div key={cIdx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <Input
                              placeholder="Tiêu chí"
                              value={c.criteriaName}
                              onChange={e => {
                                const newCriteria = (q.criteriaList || []).map((item, i) => i === cIdx ? { ...item, criteriaName: e.target.value } : item);
                                const newQuestions = section.questions.map((item, i) => i === qIdx ? { ...item, criteriaList: newCriteria } : item);
                                const newSections = [...sectionList];
                                newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                                onChange && onChange(newSections);
                              }}
                              className="w-[140px]"
                            />
                            <Input
                              placeholder="Điểm"
                              type="number"
                              min={0}
                              value={c.maxScore}
                              onChange={e => {
                                let val = Number(e.target.value);
                                if (val < 0) val = 0;
                                // Tính tổng điểm các barem nếu thay đổi
                                const otherScore = (q.criteriaList || []).reduce((sum, item, i) => i === cIdx ? sum : sum + (Number(item.maxScore) || 0), 0);
                                if (otherScore + val > Number(section.score || 0)) return; // Không cho vượt quá điểm section
                                const newCriteria = (q.criteriaList || []).map((item, i) => i === cIdx ? { ...item, maxScore: val } : item);
                                const newQuestions = section.questions.map((item, i) => i === qIdx ? { ...item, criteriaList: newCriteria } : item);
                                const newSections = [...sectionList];
                                newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                                onChange && onChange(newSections);
                              }}
                              className="w-[80px]"
                            />
                            <Input
                              placeholder="Mô tả"
                              value={c.description}
                              onChange={e => {
                                const newCriteria = (q.criteriaList || []).map((item, i) => i === cIdx ? { ...item, description: e.target.value } : item);
                                const newQuestions = section.questions.map((item, i) => i === qIdx ? { ...item, criteriaList: newCriteria } : item);
                                const newSections = [...sectionList];
                                newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                                onChange && onChange(newSections);
                              }}
                              className="w-[200px]"
                            />
                            <Button danger icon={<DeleteOutlined />} onClick={() => {
                              const newCriteria = (q.criteriaList || []).filter((_, i) => i !== cIdx);
                              const newQuestions = section.questions.map((item, i) => i === qIdx ? { ...item, criteriaList: newCriteria } : item);
                              const newSections = [...sectionList];
                              newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                              onChange && onChange(newSections);
                            }} />
                          </div>
                        ))}
                        {/* Nút import barem điểm và thêm barem nằm cạnh nhau */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            id={`import-barem-excel-input-${idx}-${qIdx}`}
                            onChange={async e => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  const score = section.score || 0;
                                  const res = await axios.post(
                                    `${API_URL}api/ImportExcel/barem/import/excel?scoreQuestion=${score}`,
                                    formData,
                                    { headers: { 'Content-Type': 'multipart/form-data' } }
                                  );
                                  const barems = Array.isArray(res.data?.data) ? res.data.data : [];
                                  const criteriaList = barems.map(item => ({
                                    criteriaName: item.criteriaName || item['Tiêu chí'] || '',
                                    maxScore: item.maxScore || item['Điểm tối đa'] || 0,
                                    description: item.description || item['Mô tả'] || '',
                                  }));
                                  const newQuestions = section.questions.map((item, i) => i === qIdx ? { ...item, criteriaList } : item);
                                  const newSections = [...sectionList];
                                  newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                                  onChange && onChange(newSections);
                                } catch (err) {
                                  message.error('Lỗi khi import barem điểm!');
                                }
                              }
                            }}
                          />
                          <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            onClick={() => document.getElementById(`import-barem-excel-input-${idx}-${qIdx}`).click()}
                          >
                            Import Excel barem điểm
                          </Button>
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              const totalScore = (q.criteriaList || []).reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0);
                              if (totalScore >= Number(section.score || 0)) return;
                              const newCriteria = [...(q.criteriaList || []), { criteriaName: '', maxScore: 0, description: '' }];
                              const newQuestions = section.questions.map((item, i) => i === qIdx ? { ...item, criteriaList: newCriteria } : item);
                              const newSections = [...sectionList];
                              newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                              onChange && onChange(newSections);
                            }}
                            disabled={((q.criteriaList || []).reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0) >= Number(section.score || 0))}
                          >
                            Thêm barem
                          </Button>
                        </div>
                        <div className="mt-8">
                          Tổng điểm barem: <b>{(q.criteriaList || []).reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0)}</b> / {section.score || 0}
                          {((q.criteriaList || []).reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0) > Number(section.score || 0)) && (
                            <span style={{ color: 'red', marginLeft: 8 }}>Tổng điểm barem không được vượt quá điểm section!</span>
                          )}
                        </div>
                      </div>
                      {/* End barem */}
                    </Card>
                  ))}
                  {(!section.questions || section.questions.length === 0) && (
                    <div style={{ textAlign: 'center', color: '#aaa' }}>
                      Chưa có câu hỏi nào. Nhấn <b>Thêm câu hỏi</b> để bắt đầu.
                    </div>
                  )}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      if ((section.questions || []).length < 1) {
                        const newQuestions = [...(section.questions || []), { content: '' }];
                        const newSections = [...sectionList];
                        newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                        onChange && onChange(newSections);
                      }
                    }}
                    style={{ width: '100%', marginTop: 24, height: 48, fontSize: 18, display: (section.questions && section.questions.length >= 1) ? 'none' : undefined }}
                  >
                    Thêm câu hỏi
                  </Button>
                </>
              ) : section.type === 'MCQ' || section.type === 'TrueFalse' ? (
                <CreateQuestion
                  questions={section.questions || []}
                  onChange={newQuestions => {
                    const newSections = [...sectionList];
                    newSections[Number(activeKey)] = { ...newSections[Number(activeKey)], questions: newQuestions };
                    onChange && onChange(newSections);
                  }}
                  type={section.type}
                  score={section.score}
                  onImportExcel={file => onImportExcel && onImportExcel(file, Number(activeKey))}
                  errors={errors}
                  sectionIdx={idx}
                />
              ) : (
                <div style={{ color: '#aaa', textAlign: 'center', margin: 24 }}>
                  Hãy chọn thể loại kiểm tra cho trang này.
                </div>
              )}
            </div>
          </TabPane>
        ))}
      </Tabs>
      {/* Cảnh báo tổng điểm các section phải bằng 10 */}
      {totalScore !== 10 && (
        <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
          Tổng điểm các trang phải bằng 10 điểm!
        </div>
      )}
      <ImagePreviewModal
  visible={isPreviewVisible}
  imageUrl={previewImageUrl}
  onClose={() => setIsPreviewVisible(false)}
/>
    </div>
  );
};

export default CreateAssessmentSection;
