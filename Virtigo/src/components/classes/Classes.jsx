import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Tag, Select, Modal, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { getClassesTableColumns } from './ClassesTableComponent';
import CreateClassModal from './create/CreateClassModal';
import DeleteConfirm from '../common/DeleteConfirm';
import Notification from '../common/Notification';
import { useNavigate } from 'react-router-dom';
import './ClassesTableComponent.css';
import dayjs from 'dayjs';
import ActionConfirm from '../common/ActionConfirm';
import InfoModal from '../common/InfoModal';
import UpdateClassModal from './UpdateClassModal';
const { Search } = Input;
const { Option } = Select;

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 0, label: 'Chưa công khai' },
  { value: 1, label: 'Đang tuyển sinh' },
  { value: 2, label: 'Đang hoạt động' },
  { value: 3, label: 'Hoàn thành' },
  { value: 4, label: 'Không hoạt động' },
  { value: 5, label: 'Đã hủy' },
];

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [data, setData] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, record: null });
  const [notify, setNotify] = useState({
    visible: false,
    type: 'success',
    message: '',
    description: ''
  });
  const [finalizeModal, setFinalizeModal] = useState({ open: false, record: null, content: '', allowConfirm: true });
  const [infoModal, setInfoModal] = useState({ open: false, content: '' });
  const [classAssessments, setClassAssessments] = useState({});
  const [availableTestsMap, setAvailableTestsMap] = useState({});
  const [editingClass, setEditingClass] = useState(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [completeModal, setCompleteModal] = useState({ open: false, record: null });
  const [completing, setCompleting] = useState(false);

  const navigate = useNavigate();

  const showNotify = (notifyProps, duration = 3) => {
    const notifKey = Math.random().toString(36).substr(2, 9);
    setNotify(n => ({ ...n, visible: false }));
    setTimeout(() => {
      setNotify({ ...notifyProps, visible: true, duration, notifKey });
    }, 0);
  };

  const fetchData = async (status = statusFilter, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      let url = '';
      if (status === 'all') {
        url = `${API_URL}api/Class/get-all-paginated?page=${page}&pageSize=${pageSize}`;
      } else {
        url = `${API_URL}api/Class/get-by-status?status=${status}&page=${page}&pageSize=${pageSize}`;
      }
      const res = await axios.get(url);
      setData(res.data.items);
      setPagination({
        current: page,
        pageSize,
        total: res.data.totalItems || 0,
      });
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData(statusFilter, pagination.current, pagination.pageSize);
  }, [statusFilter, pagination.current, pagination.pageSize]);

  const handleTableChange = (pagination) => {
    fetchData(statusFilter, pagination.current, pagination.pageSize);
  };

  const fetchAssessmentsForClass = async (classId, subjectId) => {
    try {
      console.log('[fetchAssessmentsForClass] classId:', classId);
      const res = await axios.get(`${API_URL}api/TestEvent/get-by-class-id/${classId}`);
      console.log('[fetchAssessmentsForClass] response:', res.data);
      const assessments = Array.isArray(res.data?.data) ? res.data.data : [];
      setClassAssessments(prev => ({ ...prev, [classId]: assessments }));
      const testsMap = {};
      console.log('y');
      for (const assessment of assessments) {
        console.log('x');
        if (assessment.assessmentCategory !== undefined && assessment.testType !== undefined && subjectId) {
          try {
            const testRes = await axios.get(`${API_URL}api/Test/advanced-search`, {
              params: {
                category: assessment.assessmentCategory,
                subjectId: subjectId,
                testType: assessment.testType,
                status: 3,
              }
            });
            console.log(10 + testRes.data);
            testsMap[assessment.testEventID] = Array.isArray(testRes.data) ? testRes.data : (testRes.data?.data || []);
          } catch {
            testsMap[assessment.testEventID] = [];
          }
        }
      }
      setAvailableTestsMap(prev => {
        const newMap = { ...prev, ...testsMap };
        console.log('[fetchAssessmentsForClass] availableTestsMap:', newMap);
        return newMap;
      });
      return assessments;
    } catch (err) {
      console.error('[fetchAssessmentsForClass] ERROR:', err);
      setClassAssessments(prev => ({ ...prev, [classId]: [] }));
      setAvailableTestsMap(prev => ({ ...prev }));
      return [];
    }
  };

  const handleView = async (record) => {
    const assessments = await fetchAssessmentsForClass(record.classID, record.subjectID || record.subjectId);
    console.log('[handleView] navigate detail with:', { classId: record.classID, assessments, availableTests: availableTestsMap });
    navigate('detail', { state: { classId: record.classID, assessments, availableTests: availableTestsMap, subjectId: record.subjectID || record.subjectId } });
  };

  const handleEdit = async (record) => {
    setOpenUpdateModal(true);
    try {
      const res = await axios.get(`${API_URL}api/Class/get-class-for-update/${record.classID}`);
      if (res.data && res.data.success && res.data.data) {
        setEditingClass(res.data.data);
      } else {
        setEditingClass(null);
        showNotify({ type: 'error', message: 'Không lấy được dữ liệu lớp học!', description: res.data.message || '' });
        setOpenUpdateModal(false);
      }
    } catch (err) {
      setEditingClass(null);
      showNotify({ type: 'error', message: 'Lỗi khi lấy dữ liệu lớp học!', description: err.message });
      setOpenUpdateModal(false);
    }
  };
  const handleDelete = (record) => {
    setDeleteModal({ open: true, record });
  };
  const handleDeleteConfirm = async () => {
    const record = deleteModal.record;
    try {
      var noti = await axios.delete(`${API_URL}api/Class/delete/${record.classID}`);
      await axios.delete(`${API_URL}api/Lesson/delete-by-class-id/${record.classID}`);
      showNotify({
        type: 'success',
        message: noti.data.message,
        description: ''
      });
      fetchData();
    } catch (error) {
      showNotify({
        type: 'error',
        message: 'Xoá lớp học thất bại!',
        description: noti.data.message || '',
      });
    } finally {
      setDeleteModal({ open: false, record: null });
    }
  };
  const handleOpenRecruit = async (record) => {
    if (!record.classID) {
      showNotify({
        type: 'error',
        message: 'Không thể mở tuyển sinh!',
        description: 'Lớp học chưa được tạo thành công'
      });
      return;
    }

    try {
      await axios.put(`${API_URL}api/Class/update-status`, {
        classId: record.classID,
        classStatus: 1
      });
      showNotify({
        type: 'success',
        message: 'Mở tuyển sinh thành công!',
        description: `Lớp "${record.className}" đã được mở tuyển sinh`
      });
      fetchData();
    } catch (error) {
      showNotify({
        type: 'error',
        message: 'Mở tuyển sinh thất bại!',
        description: error?.message || 'Có lỗi xảy ra khi mở tuyển sinh'
      });
    }
  };

  const handleFinalize = (record) => {
    const numberStudentEnroll = record.numberStudentEnroll;
    const minStudent = record.minStudentAcp;
    const maxStudent = record.maxStudentAcp;
    // Nếu sĩ số hiện tại bé hơn min thì báo lỗi
    if (numberStudentEnroll < minStudent) {
      setInfoModal({ open: true, content: `Sĩ số hiện tại bé hơn ${minStudent} số học sinh tối thiểu để mở lớp. Không được phép chốt danh sách lớp!` });
      return;
    }
    setFinalizeModal({ open: true, record, content: 'Bạn có chắc chắn muốn chốt danh sách và bắt đầu lớp học này?', allowConfirm: true });
  };

  const handleFinalizeConfirm = async () => {
    const record = finalizeModal.record;
    setFinalizeModal({ open: false, record: null, content: '', allowConfirm: true });
    if (!record) {
      fetchData();
      return;
    }
    const numberStudentEnroll = record.numberStudentEnroll;
    const minStudent = record.minStudentAcp;
    const maxStudent = record.maxStudentAcp;
    if (numberStudentEnroll < minStudent || numberStudentEnroll > maxStudent) {
      setInfoModal({ open: true, content: `Chỉ được phép chốt danh sách khi sĩ số nằm trong khoảng từ ${minStudent} đến ${maxStudent} học viên.` });
      fetchData();
      return;
    }
    try {
      await axios.put(`${API_URL}api/Class/update-status`, {
        classId: record.classID,
        classStatus: 2
      });
      await axios.post(`${API_URL}api/TestEvent/setup-test-event/${record.classID}`);
      await axios.post(`${API_URL}api/StudentMarks/setup-by-class-id/${record.classID}`)
      await axios.post(`${API_URL}api/Attendance/setup-attendace-by-class-id/${record.classID}`)
    
      showNotify({
        type: 'success',
        message: 'Cập nhật thành công',
        description: 'Trạng thái lớp học đã được chuyển sang "Đang hoạt động".'
      });
      try {
        var notiEmail = await axios.post(`${API_URL}api/Email/classes/notify-students-start/${record.classID}`);
        showNotify({
          type: 'success',
          message: 'Gửi email thành công',
          description: notiEmail.data.message || 'Đã gửi thông báo bắt đầu lớp học đến các học viên.'
        });
      } catch (emailError) {
        showNotify({
          type: 'error',
          message: 'Gửi email thất bại',
          description: notiEmail.data?.message || 'Không thể gửi thông báo đến học viên. Vui lòng kiểm tra lại cấu hình.'
        });
      }
    } catch (err) {
      showNotify({
        type: 'error',
        message: 'Cập nhật thất bại',
        description: 'Không thể thay đổi trạng thái lớp học. Vui lòng thử lại.'
      });
    } finally {
      fetchData();
    }
  };

  // Sửa handleComplete để chỉ mở modal xác nhận
  const handleComplete = (record) => {
    setCompleteModal({ open: true, record });
  };

  // Hàm xác nhận hoàn thành thực sự
  const handleCompleteConfirm = async () => {
    const record = completeModal.record;
    if (!record) return;
    setCompleting(true);
    try {
      await axios.get(`${API_URL}api/Class/is-completed/${record.classID}`);
      await axios.put(`${API_URL}api/Class/update-status`, {
        classId: record.classID,
        classStatus: 3
      });
      await axios.post(`${API_URL}api/Email/send-certificate/class/${record.classID}`)
      showNotify({
        type: 'success',
        message: 'Đã đánh dấu hoàn thành lớp học!',
        description: `Lớp "${record.className}" đã chuyển sang trạng thái Hoàn thành.`
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Lớp vẫn đang diễn ra hoặc chưa đủ điều kiện để hoàn thành.';
      showNotify({
        type: 'error',
        message: 'Không thể hoàn thành lớp học',
        description: msg
      });
    } finally {
      setCompleting(false);
      setCompleteModal({ open: false, record: null }); // Đóng modal sau khi xử lý xong
      fetchData();
    }
  };
  

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1>Quản lí lớp học</h1>
        <Space>
          <Select
            value={statusFilter}
            onChange={value => {
              setStatusFilter(value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            className="w-45"
          >
            {statusOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
          <Search
            placeholder="Tìm kiếm lớp học"
            className="w-50"
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={() => setOpenCreateModal(true)}>
            Tạo lớp mới
          </Button>
        </Space>
      </div>
      <Table
        columns={getClassesTableColumns(statusFilter, {
          onView: handleView,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onOpenRecruit: handleOpenRecruit,
          onFinalize: handleFinalize,
          onCompleted: handleComplete,
        })}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
        }}
        rowKey="classID"
        scroll={{ x: 1200 }}
        rowClassName={(record) => {
          const now = dayjs();
          const start = dayjs(record.teachingStartTime);
          if (record.status === 1 && now.isAfter(start, 'minute')) {
            return 'row-expired';
          }
          const diffDays = start.diff(now, 'day');
          if (record.status === 1 && diffDays >= 0 && diffDays <= 10) {
            return 'row-warning';
          }
          return '';
        }}
      />
      <CreateClassModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => {
          fetchData();
        }}
        showNotify={showNotify}
      />
      <DeleteConfirm
        open={deleteModal.open}
        title="Xác nhận xoá"
        content={deleteModal.record ? `Bạn có chắc chắn muốn xoá lớp "${deleteModal.record.className}"?` : ''}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, record: null })}
      />
      <Notification
        visible={notify.visible}
        type={notify.type}
        message={notify.message}
        description={notify.description}
        onClose={() => setNotify(n => ({ ...n, visible: false }))}
        duration={notify.duration}
        notifKey={notify.notifKey}
      />
      <ActionConfirm
        open={finalizeModal.open}
        onCancel={() => setFinalizeModal({ open: false, record: null, content: '', allowConfirm: true })}
        onOk={finalizeModal.allowConfirm === false ? undefined : handleFinalizeConfirm}
        okText={finalizeModal.allowConfirm === false ? undefined : 'Xác nhận'}
        cancelText="Đóng"
        title="Xác nhận chốt danh sách"
        content={finalizeModal.content}
      />
      <InfoModal
        open={infoModal.open}
        onClose={() => setInfoModal({ open: false, content: '' })}
        title="Không thể chốt danh sách"
        content={infoModal.content}
      />
      <UpdateClassModal
        open={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        classData={editingClass}
        onSuccess={() => {
          setOpenUpdateModal(false);
          fetchData();
        }}
        showNotify={showNotify}
      />
      <ActionConfirm
        open={completeModal.open}
        onCancel={() => setCompleteModal({ open: false, record: null })}
        onOk={handleCompleteConfirm}
        okText="Xác nhận"
        cancelText="Đóng"
        title="Xác nhận hoàn thành lớp học"
        content="Bạn có chắc chắn muốn đánh dấu lớp học này là hoàn thành? Sau khi hoàn thành, học viên sẽ nhận được chứng chỉ."
        confirmLoading={completing}
      />
    </div>
  );
};

export default Classes;  
