import React, { useEffect, useState } from 'react';
import { Modal, Spin, Alert } from 'antd';
import CreateClassStepper from './CreateClassStepper';
import axios from 'axios';
import { API_URL } from '../../../config/api';

const fetchSubjects = async () => {
  const res = await axios.get(`${API_URL}api/Subject/get-by-status?status=1`);
  return res.data || [];
};

const CreateClassModal = ({ open, onClose, onSuccess, showNotify }) => {
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    basicInfo: {},
    classConfig: {},
    lessons: [],
  });

  useEffect(() => {
    if (!open) return; 
    setLoading(true);
    setError(null);
    fetchLectures()
      .then(setLectures)
      .catch(() => setError('Lỗi khi tải giảng viên'));
    fetchSubjects()
      .then(setSubjects)
      .catch(() => setError('Lỗi khi tải môn học'));
    setLoading(false);
  }, [open]);

  
  useEffect(() => {
    if (!open) {
      setFormData({
        basicInfo: {},
        classConfig: {},
        lessons: [],
      });
    }
  }, [open]);

  const fetchLectures = async () => {
    const res = await axios.get(`${API_URL}api/Account/get-by-role-actived?role=1`);
    return res.data || [];
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      title="Tạo lớp học mới"
    >
      {loading ? (
        <Spin tip="Đang tải dữ liệu..." />
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <CreateClassStepper
          lectures={lectures}
          subjects={subjects}
          formData={formData}
          setFormData={setFormData}
          onFinish={() => {
            onSuccess && onSuccess();
            onClose();
          }}
          showNotify={showNotify}
        />
      )}
    </Modal>
  );
};

export default CreateClassModal;

