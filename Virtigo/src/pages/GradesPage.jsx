import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Select, Input, Space, Typography, Form, Alert, Modal } from 'antd';
import { DownloadOutlined, FilterOutlined, EditOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentGradeDetailModal from '../components/common/StudentGradeDetailModal';
import { API_URL, endpoints } from '../config/api';
import Notification from '../components/common/Notification';

const { Title, Text } = Typography;
const { Option } = Select;

// Mapping assessmentCategory to label
const CATEGORY_MAP = {
  0: 'Quiz',
  1: 'Presentation',
  2: 'Midterm',
  3: 'Final',
  4: 'Attendance',
  5: 'Assignment',
  6: 'Class Participation',
};

const CATEGORY_ORDER = [4, 6, 1, 0, 5, 2, 3]; // Attendance, Class Participation, Presentation, Quiz, Assignment, Midterm, Final

const GradesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { classId, subjectId } = location.state || {};
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;
  const isManager = role === 'Manager';

  // State for API data
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [dynamicData, setDynamicData] = useState([]);
  const [criteriaList, setCriteriaList] = useState([]);
  const [criteriaWeightMap, setCriteriaWeightMap] = useState({}); // <--- NEW
  const [studentMarkIdMap, setStudentMarkIdMap] = useState({}); // <--- NEW: { [studentName]: { [criteriaKey]: studentMarkID } }

  // State for modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTableData, setEditTableData] = useState([]);

  // State for notifications
  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });

  // State cho chốt sổ điểm
  const [isGradesFinalized, setIsGradesFinalized] = useState(false);
  const [confirmFinalizeVisible, setConfirmFinalizeVisible] = useState(false);

  // Fetch API data when classId or subjectId changes
  useEffect(() => {
    // if (!classId || !subjectId) return;
    setApiLoading(true);
    setApiError(null);
    // Fetch assessment criteria for weightPercent
    axios.get(`${API_URL}${endpoints.syllabus.getAssessmentCriteria}/${subjectId}`)
      .then((criteriaRes) => {
        const criteriaArr = criteriaRes.data.data || [];
        // Map: { [category]: weightPercent }
        const weightMap = {};
        criteriaArr.forEach(item => {
          // If multiple criteria per category, store as array by index
          if (!weightMap[item.category]) weightMap[item.category] = [];
          weightMap[item.category].push(item.weightPercent);
        });
        setCriteriaWeightMap(weightMap);
      })
      .catch(() => setCriteriaWeightMap({}));
    // Fetch marks
    axios.get(`${API_URL}api/StudentMarks/get-student-mark-detail-by-class/${classId}`)
      .then((marksRes) => {
        const apiData = marksRes.data.data;
        const { criteria, dataSource, markIdMap } = buildDynamicTable(apiData);
        setCriteriaList(criteria);
        setDynamicData(dataSource);
        setStudentMarkIdMap(markIdMap); // <--- NEW
      })
      .catch(() => setApiError('Không thể tải bảng điểm từ hệ thống!'))
      .finally(() => setApiLoading(false));
  }, [classId, subjectId]);

  // Build columns and dataSource from API data
  function buildDynamicTable(apiData) {
    if (!Array.isArray(apiData) || apiData.length === 0) return { criteria: [], dataSource: [], markIdMap: {} };
    // 1. Gom tất cả học sinh từ mọi tiêu chí (dựa vào studentName)
    const studentMap = {};
    const markIdMap = {}; // { [studentName]: { [criteriaKey]: studentMarkID } }
    apiData.forEach(item => {
      item.studentMarks.forEach(s => {
        if (!studentMap[s.studentName]) {
          studentMap[s.studentName] = {
            key: s.studentName, // dùng studentName làm key
            studentName: s.studentName,
          };
        }
        // Build markIdMap
        const colKey = `${item.assessmentCategory}_${item.assessmentIndex}`;
        if (!markIdMap[s.studentName]) markIdMap[s.studentName] = {};
        markIdMap[s.studentName][colKey] = s.studentMarkID;
      });
    });
    const students = Object.values(studentMap);
    // 2. Lấy tất cả các tiêu chí (category + index)
    const categoryCount = {};
    apiData.forEach(item => {
      const cat = item.assessmentCategory;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const criteriaList = apiData.map(item => {
      const label = CATEGORY_MAP[item.assessmentCategory] || `Tiêu chí ${item.assessmentCategory}`;
      const colKey = `${item.assessmentCategory}_${item.assessmentIndex}`;
      const showIndex = categoryCount[item.assessmentCategory] > 1;
      return {
        key: colKey,
        label: showIndex ? `${label} ${item.assessmentIndex}` : label,
        category: item.assessmentCategory,
        index: item.assessmentIndex,
      };
    });
    // Sắp xếp theo thứ tự ưu tiên
    criteriaList.sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(Number(a.category));
      const idxB = CATEGORY_ORDER.indexOf(Number(b.category));
      return idxA - idxB;
    });
    // 3. Build dataSource: mỗi học sinh là 1 dòng, mỗi cột là điểm của tiêu chí đó
    const dataSource = students.map((student, idx) => {
      const row = {
        key: student.key,
        stt: idx + 1,
        studentName: student.studentName,
      };
      apiData.forEach(item => {
        const colKey = `${item.assessmentCategory}_${item.assessmentIndex}`;
        const found = item.studentMarks.find(s => s.studentName === student.studentName);
        row[colKey] = found ? found.mark : null;
      });
      return row;
    });
    return { criteria: criteriaList, dataSource, markIdMap };
  }

  // Modal handlers
  const [editForm] = Form.useForm();
  const [editCriteria, setEditCriteria] = useState([]);
  const handleEditGrade = (record) => {
    setSelectedRecord(record);
    // Lấy danh sách tiêu chí hiện tại từ dynamicColumns (bỏ STT, Tên học sinh, Thao tác)
    const criteria = dynamicColumns.filter(col => col.key !== 'stt' && col.key !== 'studentName' && col.key !== 'action');
    setEditCriteria(criteria);
    // Set giá trị form cho từng tiêu chí
    const values = {};
    criteria.forEach(col => {
      values[col.key] = record[col.key];
    });
    editForm.setFieldsValue(values);
    setEditModalVisible(true);
  };
  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      // Cập nhật lại dynamicData
      const newData = dynamicData.map(row => {
        if (row.key === selectedRecord.key) {
          return { ...row, ...values };
        }
        return row;
      });
      setDynamicData(newData);
      setEditModalVisible(false);
      setSelectedRecord(null);
      message.success('Cập nhật điểm thành công (chỉ trên UI)!');
    } catch (err) {
      message.error('Vui lòng nhập đúng định dạng điểm!');
    }
  };
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleExportGrades = async () => {
    if (!classId) {
      message.error('Không tìm thấy mã lớp!');
      return;
    }
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token') || (userStr ? JSON.parse(userStr).token : undefined);
      const response = await axios.get(
        `${API_URL}api/ExportExcel/export-student-mark/${classId}`,
        {
          responseType: 'blob',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );
      // Lấy tên file từ header nếu có
      let filename = `BangDiem_Lop_${classId}.xlsx`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = decodeURIComponent(disposition.split('filename=')[1].replace(/['\"]/g, ''));
      }
      // Tạo link tải file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success('Đã xuất file bảng điểm!');
    } catch (err) {
      message.error('Không thể xuất bảng điểm!');
    }
  };
  const handleBack = () => {
    navigate(-1);
  };

  // Khi bấm Chỉnh sửa
  const handleStartEdit = () => {
    setEditTableData(dynamicData.map(row => ({ ...row })));
    setIsEditing(true);
  };
  // Khi bấm Hủy
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTableData([]);
  };
  // Khi bấm Lưu
  const handleSaveEdit = async () => {
    // Validate all marks in editTableData are between 0 and 10 and only 1 decimal place
    for (const row of editTableData) {
      for (const c of criteriaList) {
        const colKey = c.key;
        const mark = row[colKey];
        if (
          mark !== null &&
          mark !== undefined &&
          mark !== '' && // <--- allow empty string (not entered)
          (
            isNaN(mark) ||
            mark < 0 ||
            mark > 10 ||
            !/^\d+(\.\d{1})?$/.test(mark.toString())
          )
        ) {
          setNotification({
            visible: true,
            type: 'error',
            message: 'Lỗi nhập điểm',
            description: 'Vui lòng nhập điểm từ 0 đến 10 và chỉ tối đa 1 số sau dấu phẩy!',
          });
          return;
        }
      }
    }
    setDynamicData(editTableData);
    setIsEditing(false);
    setEditTableData([]);

    // Build inputMarks array for API
    const inputMarks = [];
    for (const row of editTableData) {
      const studentName = row.studentName;
      for (const c of criteriaList) {
        const colKey = c.key;
        const mark = row[colKey];
        const studentMarkID = studentMarkIdMap?.[studentName]?.[colKey];
        if (studentMarkID !== undefined && mark !== null && mark !== undefined) {
          inputMarks.push({
            studentMarkID,
            mark,
            comment: '', // You can add comment support if needed
          });
        }
      }
    }
    // Get lecturerId and token
    const userStr = localStorage.getItem('user');
    const lecturerId = userStr ? JSON.parse(userStr).accountId : undefined;
    const token = localStorage.getItem('token') || (userStr ? JSON.parse(userStr).token : undefined);
    if (!lecturerId || !token) {
      setNotification({
        visible: true,
        type: 'error',
        message: 'Lỗi xác thực',
        description: 'Không tìm thấy thông tin giảng viên hoặc token!',
      });
      return;
    }
    try {
      await axios.put(
        `${API_URL}api/StudentMarks/input-marks-by-lecturer`,
        {
          lecturerId,
          inputMarks,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setNotification({
        visible: true,
        type: 'success',
        message: 'Lưu điểm thành công',
        description: 'Đã lưu bảng điểm lên hệ thống!',
      });
    } catch (err) {
      setNotification({
        visible: true,
        type: 'error',
        message: 'Lưu điểm thất bại',
        description: 'Lỗi khi lưu bảng điểm lên hệ thống!',
      });
    }
  };

  // Hàm xử lý chốt sổ điểm
  const handleFinalizeGrades = () => {
    setIsGradesFinalized(true);
    setConfirmFinalizeVisible(false);
    setNotification({
      visible: true,
      type: 'success',
      message: 'Đã chốt sổ điểm',
      description: 'Bảng điểm đã được chốt. Bạn không thể chỉnh sửa nữa!',
    });
  };

  // Render cell editable
  function renderEditableCell(row, col) {
    return (
      <Input
        type="number"
        min={0}
        max={10}
        step={0.1}
        value={row[col.key] ?? ''}
        onChange={e => {
          const value = e.target.value === '' ? '' : Number(e.target.value);
          setEditTableData(prev => prev.map(r =>
            r.key === row.key ? { ...r, [col.key]: value } : r
          ));
        }}
        className="w-[60px]"
      />
    );
  }

  // Nếu chưa có classId, yêu cầu chọn lớp
  if (!classId) {
    return (
      <div className="p-32">
        <Alert type="info" message="Vui lòng chọn lớp để xem bảng điểm." showIcon />
      </div>
    );
  }

  // Build columns for table
  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Tên học sinh', dataIndex: 'studentName', key: 'studentName', width: 200 },
    ...criteriaList.map(c => {
      let weight = null;
      if (criteriaWeightMap[c.category]) {
        // Tổng weight của category (lấy phần tử đầu tiên)
        const totalWeight = criteriaWeightMap[c.category][0];
        // Số lượng tiêu chí cùng category
        const count = criteriaList.filter(item => item.category === c.category).length;
        // Chia đều
        weight = count > 0 ? (totalWeight / count).toFixed(2) : null;
      }
      return {
        title: (
          <div style={{ textAlign: 'center' }}>
            <div>{c.label}</div>
            {weight !== null && (
              <div style={{ fontSize: 12, color: '#888' }}>{weight}%</div>
            )}
          </div>
        ),
        dataIndex: c.key,
        key: c.key,
        width: 120,
        align: 'center',
        render: (mark, row) =>
          isEditing ? renderEditableCell(row, c) : (mark !== null && mark !== undefined ? mark : '-'),
      };
    }),
    {
      title: <div style={{ textAlign: 'center' }}>Trung bình</div>,
      dataIndex: 'average',
      key: 'average',
      width: 120,
      align: 'center',
      render: (avg) => avg !== null && avg !== undefined ? avg : '-',
    },
    // Bỏ cột Trung bình vì không còn tiêu chí trọng số
  ];

  // Tính trung bình cho từng học sinh dựa trên điểm và trọng số
  function calculateAverages(dataRows) {
    return dataRows.map(row => {
      let total = 0;
      let hasAnyMark = false;
      criteriaList.forEach(c => {
        let weight = null;
        if (criteriaWeightMap[c.category]) {
          const catWeight = criteriaWeightMap[c.category][0];
          const count = criteriaList.filter(item => item.category === c.category).length;
          weight = count > 0 ? catWeight / count : 0;
        }
        const mark = row[c.key];
        if (mark !== null && mark !== undefined && mark !== '') {
          hasAnyMark = true;
          total += mark * weight;
        }
      });
      // Nếu có ít nhất 1 điểm (kể cả 0), thì hiển thị 0 hoặc số, chỉ '-' nếu không có điểm nào
      const avg = hasAnyMark ? (total / 100).toFixed(2) : '-';
      return { ...row, average: avg };
    });
  }

  // Dữ liệu hiển thị bảng: nếu đang chỉnh sửa thì dùng editTableData, ngược lại tính average cho dynamicData
  const tableData = isEditing ? editTableData : calculateAverages(dynamicData);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button onClick={handleBack} style={{ marginBottom: '16px' }}>
          ← Quay lại
        </Button>
        <Title level={2}>Bảng điểm lớp học</Title>
        <Text type="secondary">Bảng điểm chi tiết theo từng tiêu chí đánh giá</Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportGrades} type="primary">
            Xuất bảng điểm
          </Button>
          {/* <Button icon={<FilterOutlined />} onClick={() => message.info('Tính năng nhập bảng điểm sẽ được cập nhật sau!')}>
            Nhập bảng điểm
          </Button> */}
          {/* Move edit/finalize buttons here */}
          {!isEditing ? (
            <Button type="primary" icon={<EditOutlined />} onClick={handleStartEdit}>
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button type="primary" onClick={handleSaveEdit}>Lưu</Button>
              <Button onClick={handleCancelEdit}>Hủy</Button>
            </>
          )}
          {/* <Button
            type="primary"
            danger
            disabled={isGradesFinalized}
            onClick={() => setConfirmFinalizeVisible(true)}
          >
            Chốt sổ điểm
          </Button> */}
        </Space>
      </div>
      {apiError && <Alert type="error" message={apiError} showIcon className="mb-16" />}

      <Card>
        <Table
          columns={columns}
          dataSource={tableData}
          loading={apiLoading}
          pagination={false}
          scroll={{ x: true }}
        />
      </Card>
      {/* Modal xác nhận chốt sổ điểm */}
      {/* <Modal
        title={<div style={{fontSize:'25px',fontWeight:'bolder', textAlign: 'center', width: '100%' }}>Xác nhận chốt sổ điểm</div>}
        open={confirmFinalizeVisible}
        onOk={handleFinalizeGrades}
        onCancel={() => setConfirmFinalizeVisible(false)}
        okText="Chốt sổ"
        cancelText="Hủy"
        destroyOnClose
        centered
      >
        <div>
          <p>Bạn có chắc chắn muốn <b className="text-red-500">chốt sổ điểm</b>?<br/>Sau khi chốt, bạn sẽ không thể chỉnh sửa bảng điểm nữa.</p>
        </div>
      </Modal> */}

      {/* Edit Grade Modal (tùy chỉnh sau nếu cần) */}
      <Modal
        title={`Chỉnh sửa điểm: ${selectedRecord?.studentName || ''}`}
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedRecord(null);
        }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          {editCriteria.map(col => (
            <Form.Item
              key={col.key}
              name={col.key}
              label={col.title}
              // Allow empty, but if filled, must be number 0-10
              rules={[{ pattern: /^$|^\d+(\.\d{1})?$/, message: 'Điểm phải là số hoặc để trống' }, { type: 'number', min: 0, max: 10, message: 'Điểm từ 0-10', transform: v => v === '' ? undefined : Number(v) }]}
            >
              <Input type="number" min={0} max={10} step={0.1} />
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* Student Grade Detail Modal (tùy chỉnh sau nếu cần) */}
      <StudentGradeDetailModal
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        studentRecord={selectedRecord}
        showClassInfo={isManager}
      />
      <Notification {...notification} onClose={() => setNotification(n => ({ ...n, visible: false }))} />
    </div>
  );
};

export default GradesPage; 