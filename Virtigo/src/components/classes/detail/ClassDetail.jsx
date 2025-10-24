import React, { useState } from 'react';
import BasicInfoSection from './BasicInfoSection';
import StudentListSection from './StudentListSection';
import MonthlyTimetableSection from './MonthlyTimetableSection';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import LessonDetailModal from './lesson/LessonDetailModal';
import PendingAssessmentCardList from './PendingAssessmentCardList';

const ClassDetail = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const classId = props.classId || location.state?.classId;
  const assessments = props.assessments || location.state?.assessments;
  const availableTests = props.availableTests || location.state?.availableTests;
  const subjectId = props.subjectId || location.state?.subjectId;
  const [reloadTimetable, setReloadTimetable] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenLessonDetail = (lesson) => {
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  const handleLessonUpdate = () => {
    setReloadTimetable(r => r + 1);
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', padding: 24, gap: 24, alignItems: 'flex-start' }}>
      {/* Main content */}
      <div style={{ flex: 1 }}>
        <Button
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          type="primary"
        >
          Quay lại
        </Button>
        <h1 className="font-bold">Chi tiết lớp học</h1>
        <div className="mb-24">
          <BasicInfoSection classId={classId} />
        </div>
        <div className="mb-24">
          <StudentListSection classId={classId} subjectId={subjectId} />
        </div>
        <div>
          <MonthlyTimetableSection classId={classId} reload={reloadTimetable} onLessonClick={handleOpenLessonDetail} />
        </div>
      </div>
      {/* Sidebar */}
      <div style={{ width: 340, minWidth: 260 }}>
        <PendingAssessmentCardList classId={classId} assessments={assessments} availableTests={availableTests} subjectId={subjectId} />
      </div>
      <LessonDetailModal
        open={modalOpen}
        lesson={selectedLesson}
        onClose={() => setModalOpen(false)}
        onUpdate={handleLessonUpdate}
      />
    </div>
  );
};

export default ClassDetail;
