import React, { useEffect, useState } from 'react';
import { Input, Button, Card, Upload, Radio, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import ImagePreviewModal from './ImagePreviewModal';


const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const TRUE_FALSE_OPTIONS = [
  { text: 'True', key: 'A' },
  { text: 'False', key: 'B' },
];

const CreateQuestion = ({ questions = [], onChange, type = 'MCQ', score, onImportExcel, errors = {}, sectionIdx }) => {
  const [minOptions, setMinOptions] = useState(2);
  const [maxOptions, setMaxOptions] = useState(10);
const [previewImageUrl, setPreviewImageUrl] = useState(null);
const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  // Lấy min/max từ API khi type là MCQ
  useEffect(() => {
    if (type === 'MCQ') {
      fetch('https://9864a210fd0e.ngrok-free.app/api/SystemConfig/get-config-by-key/min_mcq_option_per_question')
        .then(res => res.json())
        .then(data => {
          if (data?.data?.value) setMinOptions(Number(data.data.value));
        });
      fetch('https://9864a210fd0e.ngrok-free.app/api/SystemConfig/get-config-by-key/max_mcq_option_per_question')
        .then(res => res.json())
        .then(data => {
          if (data?.data?.value) setMaxOptions(Number(data.data.value));
        });
    }
  }, [type]);

  // Đáp án mặc định khi tạo mới MCQ
  useEffect(() => {
    if (type === 'MCQ' && (!questions || questions.length < minOptions)) {
      const newAnswers = Array.from({ length: minOptions }, (_, i) => ({
        text: '',
        key: ALPHABET[i],
        imageURL: undefined,
        audioURL: undefined,
      }));
      if (!questions || questions.length === 0) {
        onChange && onChange([
          {
            content: '',
            answers: newAnswers,
            correct: 0,
          },
        ]);
      } else {
        // Nếu đã có câu hỏi, cập nhật số đáp án cho từng câu hỏi
        const newQuestions = questions.map(q => ({
          ...q,
          answers:
            q.answers && q.answers.length >= minOptions
              ? q.answers
              : [
                  ...q.answers,
                  ...Array.from({ length: minOptions - (q.answers?.length || 0) }, (_, i) => ({
                    text: '',
                    key: ALPHABET[(q.answers?.length || 0) + i],
                    imageURL: undefined,
                    audioURL: undefined,
                  })),
                ],
        }));
        onChange && onChange(newQuestions);
      }
    }
  }, [type, minOptions]);

  // Thêm đáp án cho câu hỏi idx
  const handleAddOption = (qIdx) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIdx) return q;
      if (q.answers.length >= maxOptions) {
        message.warning(`Không được vượt quá ${maxOptions} đáp án!`);
        return q;
      }
      return {
        ...q,
        answers: [
          ...q.answers,
          {
            text: '',
            key: ALPHABET[q.answers.length],
            imageURL: undefined,
            audioURL: undefined,
          },
        ],
      };
    });
    onChange && onChange(newQuestions);
  };

  // Xóa đáp án cho câu hỏi idx, đáp án aIdx
  const handleRemoveOption = (qIdx, aIdx) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIdx) return q;
      if (q.answers.length <= minOptions) {
        message.warning(`Phải có ít nhất ${minOptions} đáp án!`);
        return q;
      }
      let newAnswers = q.answers.filter((_, j) => j !== aIdx);
      // Cập nhật lại key cho các đáp án còn lại
      newAnswers = newAnswers.map((a, idx) => ({
        ...a,
        key: ALPHABET[idx],
      }));
      // Nếu đáp án đúng bị xóa, reset correct về 0
      let newCorrect = q.correct;
      if (q.correct === aIdx) newCorrect = 0;
      else if (q.correct > aIdx) newCorrect = q.correct - 1;
      return { ...q, answers: newAnswers, correct: newCorrect };
    });
    onChange && onChange(newQuestions);
  };

  // Thêm câu hỏi mới
  const handleAddQuestion = () => {
    const newQuestions = [
      type === 'MCQ'
        ? {
            content: '',
            answers: Array.from({ length: minOptions }, (_, i) => ({
              text: '',
              key: ALPHABET[i],
              imageURL: undefined,
              audioURL: undefined,
            })),
            correct: 0,
          }
        : { content: '' },
      ...questions,
    ];
    onChange && onChange(newQuestions);
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = idx => {
    const newQuestions = questions.filter((_, i) => i !== idx);
    onChange && onChange(newQuestions);
  };

  // Sửa nội dung câu hỏi
  const handleQuestionChange = (idx, value) => {
    const newQuestions = questions.map((q, i) =>
      i === idx ? { ...q, content: value } : q
    );
    onChange && onChange(newQuestions);
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
    onChange && onChange(newQuestions);
  };

  // Chọn đáp án đúng
  const handleCorrectChange = (qIdx, value) => {
    const newQuestions = questions.map((q, i) =>
      i === qIdx ? { ...q, correct: value } : q
    );
    onChange && onChange(newQuestions);
  };

  // Upload ảnh/audio cho từng câu hỏi (MCQ, Writing)
  const handleQuestionUpload = async (qIdx, file, type) => {
    if (type === 'image') {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API_URL}api/Cloudinary/upload-image-question`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data.url || res.data;
        const newQuestions = questions.map((q, i) => i === qIdx ? { ...q, imageURL: url, audioURL: undefined } : q);
        onChange && onChange(newQuestions);
      } catch (err) {}
    } else if (type === 'audio') {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API_URL}api/Cloudinary/upload-audio-question`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data.url || res.data;
        const newQuestions = questions.map((q, i) => i === qIdx ? { ...q, audioURL: url, imageURL: undefined } : q);
        onChange && onChange(newQuestions);
      } catch (err) {}
    }
  };

  // Upload ảnh/audio cho từng đáp án (MCQ)
  const handleAnswerUpload = async (qIdx, aIdx, file, type) => {
    if (type === 'image') {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API_URL}api/Cloudinary/upload-image-mcq-option`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data.url || res.data;
        const newQuestions = questions.map((q, i) => {
          if (i !== qIdx) return q;
          const newAnswers = q.answers.map((a, j) => j === aIdx ? { ...a, imageURL: url, audioURL: undefined } : a);
          return { ...q, answers: newAnswers };
        });
        onChange && onChange(newQuestions);
      } catch (err) {}
    } else if (type === 'audio') {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API_URL}api/Cloudinary/upload-audio-mcq-option`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data.url || res.data;
        const newQuestions = questions.map((q, i) => {
          if (i !== qIdx) return q;
          const newAnswers = q.answers.map((a, j) => j === aIdx ? { ...a, audioURL: url, imageURL: undefined } : a);
          return { ...q, answers: newAnswers };
        });
        onChange && onChange(newQuestions);
      } catch (err) {}
    }
  };

  // Xóa file ảnh/audio của đáp án
  const handleRemoveAnswerFile = (qIdx, aIdx, type) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const newAnswers = q.answers.map((a, j) => {
        if (j !== aIdx) return a;
        if (type === 'image') {
          return { ...a, imageURL: undefined };
        } else if (type === 'audio') {
          return { ...a, audioURL: undefined };
        }
        return a;
      });
      return { ...q, answers: newAnswers };
    });
    onChange && onChange(newQuestions);
  };

  // Tính điểm mỗi câu
  const perQuestionScore =
    questions.length > 0 && score
      ? (Number(score) / questions.length).toFixed(2)
      : '';

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (typeof onImportExcel === 'function') {
      onImportExcel(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        id="import-excel-input"
        onChange={handleImportExcel}
      />
      <Button
        type="primary"
        icon={<UploadOutlined />}
        className="mb-4"
        onClick={() => document.getElementById('import-excel-input').click()}
      >
        Import Excel
      </Button>
      {/* Nút import barem điểm cho Writing */}
      {type === 'Writing' && (
        <>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            id="import-barem-excel-input"
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                // Tạm thời chỉ log file, sau này sẽ xử lý API
                console.log('Import barem điểm:', file);
              }
            }}
          />
          <Button
            type="primary"
            icon={<UploadOutlined />}
            className="mb-4 ml-2"
            onClick={() => document.getElementById('import-barem-excel-input').click()}
          >
            Import Excel barem điểm
          </Button>
        </>
      )}
      <Button
        type="dashed"
        icon={<PlusOutlined />} 
        onClick={handleAddQuestion}
        className="w-full mb-6 h-12 text-lg"
      >
        Thêm câu hỏi
      </Button>
      {questions.map((q, idx) => (
        <Card
          key={idx}
          className="mb-6"
          title={
            <div className="flex items-center justify-between">
              <span>{`Câu ${questions.length - idx}:`}</span>
              <span className="text-gray-500 text-sm">
                Điểm: {perQuestionScore || '0'}
              </span>
            </div>
          }
          extra={
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteQuestion(idx)}
            />
          }
        >
          {type === 'MCQ' && (
            <>
              {/* Upload ảnh/audio cho từng câu hỏi */}
              <div className="mb-4 flex gap-4 items-center">
                <Upload
                  customRequest={e => handleQuestionUpload(idx, e.file, 'image')}
                  showUploadList={false}
                  accept="image/*"
                  disabled={!!q.audioURL}
                >
                  <Button icon={<UploadOutlined />} disabled={!!q.audioURL}>
                    {q.imageURL ? 'Đổi ảnh' : 'Thêm ảnh'}
                  </Button>
                </Upload>
                {q.imageURL && (
                  <>
                    <img src={q.imageURL} alt="img" className="max-w-[100px] max-h-[100px] ml-2" />
                    <span className="text-blue-500 ml-2">Đã chọn ảnh</span>
                    <Button type="link" size="small" onClick={() => {
                      // Xóa imageURL của câu hỏi
                      const newQuestions = questions.map((ques, i) => i === idx ? { ...ques, imageURL: undefined } : ques);
                      onChange && onChange(newQuestions);
                    }}>X</Button>
                  </>
                )}
                <Upload
                  customRequest={e => handleQuestionUpload(idx, e.file, 'audio')}
                  showUploadList={false}
                  accept="audio/*"
                  disabled={!!q.imageURL}
                >
                  <Button icon={<UploadOutlined />} disabled={!!q.imageURL}>
                    {q.audioURL ? 'Đổi audio' : 'Thêm audio'}
                  </Button>
                </Upload>
                {q.audioURL && (
                  <>
                    <span className="text-blue-500">{q.audioURL}</span>
                    <Button type="link" size="small" onClick={() => {
                      // Xóa audioURL của câu hỏi
                      const newQuestions = questions.map((ques, i) => i === idx ? { ...ques, audioURL: undefined } : ques);
                      onChange && onChange(newQuestions);
                    }}>X</Button>
                  </>
                )}
              </div>
            </>
          )}
          <Input.TextArea
            placeholder={type === 'MCQ' ? 'Nhập nội dung câu hỏi' : 'Nhập nội dung câu hỏi viết'}
            value={q.content}
            onChange={e => handleQuestionChange(idx, e.target.value)}
            className="mb-4"
            status={errors[`qcontent_${sectionIdx}_${idx}`] ? 'error' : undefined}
            autoSize={{ minRows: 2 }}
          />
          {errors[`qcontent_${sectionIdx}_${idx}`] && <div className="text-red-500 text-xs mb-2">Chưa nhập nội dung câu hỏi!</div>}
          {type === 'MCQ' && (
            <>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Đáp án (chọn đáp án đúng):
              </div>
              <Radio.Group
                value={q.correct}
                onChange={e => handleCorrectChange(idx, e.target.value)}
                className="w-full"
              >
                <Space direction="vertical" className="w-full">
                  {/* Xác định loại đáp án chung cho cả câu hỏi */}
                  {(() => {
                    let answerType = null;
                    if (q.answers.some(a => a.text)) answerType = 'text';
                    else if (q.answers.some(a => a.imageURL)) answerType = 'image';
                    else if (q.answers.some(a => a.audioURL)) answerType = 'audio';
                    return q.answers.map((a, aIdx) => (
                      <div key={a.key} className="flex items-center gap-8">
                        <Radio
                          value={aIdx}
                          style={errors[`qcorrect_${sectionIdx}_${idx}`] ? { border: '1px solid red', borderRadius: 4 } : {}}
                        />
                        <Input
                          placeholder={`Đáp án ${a.key}`}
                          value={a.text}
                          onChange={e => handleAnswerChange(idx, aIdx, e.target.value)}
                          style={{ flex: 1 }}
                          disabled={answerType === 'image' || answerType === 'audio' || !!a.imageURL || !!a.audioURL}
                          status={errors[`qanswer_${sectionIdx}_${idx}`] || errors[`qanswer_${sectionIdx}_${idx}_${aIdx}`] ? 'error' : undefined}
                          autoSize={{ minRows: 1, maxRows: 4 }}
                        />
                        {errors[`qanswer_${sectionIdx}_${idx}_${aIdx}`] && <span style={{ color: 'red', fontSize: 12 }}>Chưa nhập nội dung đáp án!</span>}
                        {/* Upload ảnh/audio cho đáp án */}
                        <Upload
                          customRequest={e => handleAnswerUpload(idx, aIdx, e.file, 'image')}
                          showUploadList={false}
                          accept="image/*"
                          disabled={answerType === 'text' || answerType === 'audio' || !!a.audioURL || !!a.text}
                        >
                          <Button icon={<UploadOutlined />} disabled={answerType === 'text' || answerType === 'audio' || !!a.audioURL || !!a.text} size="small">
                            {a.imageURL ? 'Đổi ảnh' : 'Ảnh'}
                          </Button>
                        </Upload>
                        {a.imageURL && (
                          <>
                            <img src={a.imageURL} alt="img" className="max-w-[40px] max-h-[40px] ml-8" />
                            <span style={{ color: '#1890ff', marginLeft: 8 }}>Đã chọn ảnh</span>
                          </>
                        )}
                        <Upload
                          customRequest={e => handleAnswerUpload(idx, aIdx, e.file, 'audio')}
                          showUploadList={false}
                          accept="audio/*"
                          disabled={answerType === 'text' || answerType === 'image' || !!a.imageURL || !!a.text}
                        >
                          <Button icon={<UploadOutlined />} disabled={answerType === 'text' || answerType === 'image' || !!a.imageURL || !!a.text} size="small">
                            {a.audioURL ? 'Đổi audio' : 'Audio'}
                          </Button>
                        </Upload>
                        {a.audioURL && (
                          <>
                            <span style={{ color: '#1890ff', fontSize: 12 }}>{a.audioURL}</span>
                            <Button type="link" size="small" onClick={() => handleRemoveAnswerFile(idx, aIdx, 'audio')}>X</Button>
                          </>
                        )}
                        {/* Nút xóa đáp án */}
                        {q.answers.length > minOptions && (
                          <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleRemoveOption(idx, aIdx)} />
                        )}
                      </div>
                    ));
                  })()}
                  {/* Nút thêm đáp án */}
                  {q.answers.length < maxOptions && (
                    <Button type="dashed" icon={<PlusOutlined />} size="small" onClick={() => handleAddOption(idx)}>
                      Thêm đáp án
                    </Button>
                  )}
                </Space>
              </Radio.Group>
              {errors[`qanswer_${sectionIdx}_${idx}`] && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>Phải có ít nhất 2 đáp án hợp lệ!</div>}
              {errors[`qcorrect_${sectionIdx}_${idx}`] && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>Chưa chọn đáp án đúng!</div>}
            </>
          )}
          {type === 'TrueFalse' && (
            <>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Đáp án (chọn đáp án đúng):
                {perQuestionScore && (
                  <span style={{ float: 'right', color: '#888' }}>
                    Điểm mỗi câu: {perQuestionScore}
                  </span>
                )}
              </div>
              <Radio.Group
                value={q.correct}
                onChange={e => handleCorrectChange(idx, e.target.value)}
                className="w-full"
              >
                <Space direction="vertical" className="w-full">
                  {TRUE_FALSE_OPTIONS.map((a, aIdx) => (
                    <div key={a.key} className="flex items-center gap-8">
                      <Radio value={aIdx} />
                      <Input value={a.text} disabled style={{ flex: 1 }} />
                    </div>
                  ))}
                </Space>
              </Radio.Group>
              {errors[`qcorrect_${sectionIdx}_${idx}`] && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>Chưa chọn đáp án đúng!</div>}
            </>
          )}
          {type === 'Writing' && Array.isArray(q.criteriaList) && q.criteriaList.length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <b>Barem chấm điểm:</b>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {q.criteriaList.map((barem, bIdx) => (
                  <div
                    key={bIdx}
                    style={{
                      background: '#f8fafd',
                      border: '1px solid #e6eaf0',
                      borderRadius: 10,
                      padding: '14px 18px',
                      fontSize: 16,
                      marginBottom: 4,
                      boxShadow: '0 1px 4px #f0f1f2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 24,
                    }}
                  >
                    <span style={{ minWidth: 120, fontWeight: 600 }}>{barem.criteriaName}</span>
                    <span style={{ minWidth: 60, color: '#1677ff', fontWeight: 600 }}>Điểm: {barem.maxScore}</span>
                    <span style={{ flex: 1, color: '#444' }}>{barem.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
      {questions.length === 0 && (
        <div style={{ textAlign: 'center', color: '#aaa' }}>
          Chưa có câu hỏi nào. Nhấn <b>Thêm câu hỏi</b> để bắt đầu.
        </div>
      )}
    </div>
  );
};

export default CreateQuestion;
