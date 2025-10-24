import React, { useState, useEffect } from 'react';
import { Table, Input, Tag, Button } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';
import StudentListModal from './StudentListModal';

const ClassCompletionStatsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}api/DashboardAnalytics/class-completion-statistic`)
      .then(res => {
        setData(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = data.filter(item =>
    item.className?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'classId',
      key: 'classId',
      width: 100,
      fixed: 'left',
    },
    {
      title: 'Tên lớp',
      dataIndex: 'className',
      key: 'className',
      width: 160,
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectName',
      key: 'subjectName',
      width: 140,
    },
    {
      title: 'Sĩ số',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      align: 'center',
      width: 80,
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completedStudents',
      key: 'completedStudents',
      align: 'center',
      width: 90,
      render: (val, row) => `${val}/${row.totalStudents}`,
    },
    {
      title: 'Tỉ lệ chuyên cần',
      dataIndex: 'averageAttendanceRate',
      key: 'averageAttendanceRate',
      align: 'center',
      width: 120,
      render: (val) => <Tag color={val >= 90 ? 'green' : val >= 75 ? 'gold' : 'red'}>{val}%</Tag>,
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
      title: 'Tỉ lệ hoàn thành',
      dataIndex: 'completionRate',
      key: 'completionRate',
      align: 'center',
      width: 120,
      render: (val) => <Tag color={val >= 90 ? 'green' : val >= 75 ? 'gold' : 'red'}>{val}%</Tag>,
    },
    {
      title: '',
      key: 'actions',
      align: 'center',
      width: 80,
      render: (_, row) => (
        <Button size="small" type="link" onClick={() => { setSelectedClass(row); setModalOpen(true); }}>
          Xem DS
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(24,144,255,0.04)', padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#1890ff' }}>Danh sách lớp học</div>
      <Input.Search
        placeholder="Tìm kiếm theo tên lớp..."
        allowClear
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: 320, marginBottom: 18 }}
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="classId"
        pagination={{ pageSize: 6 }}
        scroll={{ x: 900 }}
        bordered
        size="middle"
        loading={loading}
      />
      <StudentListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classId={selectedClass?.classId}
      />
    </div>
  );
};

export default ClassCompletionStatsTable; 