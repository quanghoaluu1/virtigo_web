import React, { useState, useRef } from 'react';
import { Steps, Button } from 'antd';
import AssessmentBasicForm from './AssessmentBasicForm';
import CreateAssessmentSection from './CreateAssessmentSection';
import CreateAssessmentConfirm from './CreateAssessmentConfirm';



// TODO: tạo SectionQuestionsForm đúng logic mới
const SectionQuestionsForm = () => <div>SectionQuestionsForm (TODO)</div>;

const CreateAssessmentStepper = ({ formData, setFormData, onFinish, showNotify, subjects, categoryOptions, onSubjectChange, onImportExcel, isWritingCriteriaValid }) => {
  const [current, setCurrent] = useState(0);
  const basicInfoFormRef = useRef();
  const sectionFormsRef = useRef([]); // ref cho các form section
  const [showNoSectionWarning, setShowNoSectionWarning] = useState(false);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionNameErrors, setSectionNameErrors] = useState({});
  const [baremError, setBaremError] = useState(false);

  // Validate sections, questions, answers
  const validateSections = () => {
    const errors = {};
    const nameErrors = {};
    let hasError = false;
    (formData.sections || []).forEach((section, sIdx) => {
      // Validate section name
      if (!section.name || !section.name.trim()) {
        nameErrors[sIdx] = true;
        hasError = true;
      }
      // Validate section type
      if (!section.type) {
        errors[`type_${sIdx}`] = true;
        hasError = true;
      }
      // Validate section score (chỉ check, không return sớm)
      if (section.score === undefined || section.score === null || section.score === '' || isNaN(Number(section.score))) {
        errors[`score_${sIdx}`] = true;
        hasError = true;
      }
      // Validate questions (luôn check, không return sớm)
      if (!section.questions || section.questions.length === 0) {
        errors[`questions_${sIdx}`] = 'Chưa có câu hỏi';
        hasError = true;
      }
      (section.questions || []).forEach((q, qIdx) => {
        // Validate question content
        if (!q.content || !q.content.trim()) {
          errors[`qcontent_${sIdx}_${qIdx}`] = true;
          hasError = true;
        }
        // Validate MCQ answers
        if (section.type === 'MCQ') {
          if (!q.answers || q.answers.length < 2) {
            errors[`qanswer_${sIdx}_${qIdx}`] = true;
            hasError = true;
          } else {
            q.answers.forEach((a, aIdx) => {
              if ((!a.text || !a.text.trim()) && !a.imageURL && !a.audioURL) {
                errors[`qanswer_${sIdx}_${qIdx}_${aIdx}`] = true;
                hasError = true;
              }
            });
          }
          // Validate correct answer
          if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= (q.answers ? q.answers.length : 0)) {
            errors[`qcorrect_${sIdx}_${qIdx}`] = true;
            hasError = true;
          }
        }
        // Validate TrueFalse correct
        if (section.type === 'TrueFalse') {
          if (typeof q.correct !== 'number' || (q.correct !== 0 && q.correct !== 1)) {
            errors[`qcorrect_${sIdx}_${qIdx}`] = true;
            hasError = true;
          }
        }
      });
    });
    setSectionErrors(errors);
    setSectionNameErrors(nameErrors);
    // Luôn trả về false nếu có lỗi, true nếu không có lỗi
    return !hasError;
  };

  const steps = [
    {
      title: 'Thông tin cơ bản',
      content: (
        <AssessmentBasicForm
          ref={basicInfoFormRef}
          subjects={subjects}
          formData={formData.basicInfo}
          onChange={values => setFormData(prev => ({ ...prev, basicInfo: values }))}
          categoryOptions={categoryOptions}
          onSubjectChange={onSubjectChange}
        />
      ),
    },
    {
      title: 'Tạo Trang & nhập câu hỏi',
      content: (
        <CreateAssessmentSection
          ref={sectionFormsRef}
          testType={formData.basicInfo?.testType}
          sections={formData.sections}
          onChange={sections => setFormData(prev => ({ ...prev, sections }))}
          onImportExcel={onImportExcel}
          showNoSectionWarning={showNoSectionWarning}
          onAddSectionWarningClear={() => setShowNoSectionWarning(false)}
          errors={sectionErrors}
          showSectionNameError={sectionNameErrors}
          onSectionNameInput={idx => {
            setSectionNameErrors(prev => ({ ...prev, [idx]: false }));
          }}
        />
      ),
    },
    {
      title: 'Xác nhận',
      content: (
        <CreateAssessmentConfirm
          basicInfo={formData.basicInfo}
          sections={formData.sections}
        />
      ),
    },
  ];

  const next = async () => {
    if (current === 0) {
      try {
        await basicInfoFormRef.current?.validate();
        setCurrent(1);
      } catch (_) {
      }
    } else if (current === 1) {
      if (!formData.sections || formData.sections.length === 0) {
        setShowNoSectionWarning(true);
        return;
      }
      setShowNoSectionWarning(false);
      const totalScore = (formData.sections || []).reduce((sum, sec) => sum + (Number(sec?.score) || 0), 0);
      if (totalScore !== 10) {
        showNotify && showNotify({ type: 'error', message: 'Tổng điểm các trang phải đúng 10 điểm!' });
        return;
      }
      // Validate sections/questions/answers
      const valid = validateSections();
      if (!valid) {
        showNotify && showNotify({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin cho tất cả các trang, câu hỏi và đáp án!' });
        // Force re-render to show all errors
        setSectionErrors(prev => ({ ...prev }));
        return;
      }
      setCurrent(2);
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => setCurrent(current - 1);

  return (
    <>
      <Steps current={current} className="mb-32">
        {steps.map(item => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ margin: '24px 0' }}>{steps[current].content}</div>
      {baremError && (
        <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
          Barem điểm chưa đủ!
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        {current > 0 && (
          <Button onClick={prev}>
            Quay lại
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => {
            if (current === 1) {
              // Kiểm tra writing section
              const writingSections = formData.sections?.filter(sec => sec.type === 'Writing') || [];
              const hasInvalid = writingSections.some(sec => {
                const q = (sec.questions && sec.questions[0]) || {};
                const totalCriteria = (q.criteriaList || []).reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0);
                return Number(sec.score) !== Number(totalCriteria);
              });
              if (hasInvalid) {
                setBaremError(true);
                return;
              } else {
                setBaremError(false);
              }
            }
            next();
          }}>
            {current === 0 ? 'Tiếp tục' : 'Tiếp theo'}
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => {
            if (current === 1) {
              const writingSections = formData.sections?.filter(sec => sec.type === 'Writing') || [];
              const hasInvalid = writingSections.some(sec => {
                const q = (sec.questions && sec.questions[0]) || {};
                const totalCriteria = (q.criteriaList || []).reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0);
                return Number(sec.score) !== Number(totalCriteria);
              });
              if (hasInvalid) {
                setBaremError(true);
                return;
              } else {
                setBaremError(false);
              }
            }
            onFinish();
          }}>
            Hoàn thành
          </Button>
        )}
      </div>
    </>
  );
};

export default CreateAssessmentStepper;
