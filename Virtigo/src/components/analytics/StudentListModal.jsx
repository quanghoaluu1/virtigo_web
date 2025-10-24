import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';

const statusColor = {
  'Hoàn thành': 'green',
  'Chưa hoàn thành': 'red',
};

const columns = [
  {
    title: 'Tên học viên',
    dataIndex: 'studentName',
    key: 'studentName',
    width: 180,
  },
  {
    title: 'Tỉ lệ điểm danh',
    dataIndex: 'attendanceRate',
    key: 'attendanceRate',
    align: 'center',
    width: 120,
    render: (val) => <Tag color={val >= 90 ? 'green' : val >= 70 ? 'gold' : 'red'}>{val}%</Tag>,
  },
  {
    title: 'Điểm TB',
    dataIndex: 'averageScore',
    key: 'averageScore',
    align: 'center',
    width: 90,
    render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 120,
    render: (val) => <Tag color={statusColor[val] || 'default'}>{val}</Tag>,
  },
  {
    title: 'Số buổi vắng',
    dataIndex: 'absentSessions',
    key: 'absentSessions',
    align: 'center',
    width: 110,
  },
];

const StudentListModal = ({ open, onClose, classId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && classId) {
      setLoading(true);
      axios.get(`${API_URL}api/DashboardAnalytics/student-statistic/${classId}`)
        .then(res => {
          setData(Array.isArray(res.data?.data) ? res.data.data : []);
        })
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }
  }, [open, classId]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Danh sách học viên"
      footer={null}
      width={700}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="studentId"
        pagination={{ pageSize: 6 }}
        bordered
        size="middle"
        loading={loading}
      />
    </Modal>
  );
};

export default StudentListModal; 