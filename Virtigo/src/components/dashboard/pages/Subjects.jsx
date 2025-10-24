import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Select, Descriptions, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, endpoints } from '../../../config/api';
import { style } from 'framer-motion/client';

const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(1); // 1: Đang hoạt động, 0: Nháp, 2: Đã xóa
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, [statusFilter]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}${endpoints.manageSubject.getSubject}`, {
        params: {
          status: statusFilter
        }
      });
      console.log('API Response:', response.data); // Debug log

      // Check if response.data is an array
      const subjectsData = Array.isArray(response.data) ? response.data : [];

      const formattedSubjects = subjectsData.map(subject => ({
        id: subject.subjectID,
        name: subject.subjectName,
        code: subject.subjectID,
        description: subject.description,
        status: subject.status,
        minAverageScoreToPass: subject.minAverageScoreToPass,
        createAt: new Date(subject.createAt).toLocaleString('vi-VN', {
          hour12: false,
          timeZone: 'Asia/Ho_Chi_Minh',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      }));
      setSubjects(formattedSubjects);
    } catch (error) {
      message.error('Không thể tải danh sách môn học');
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    navigate('/dashboard/subject/create');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubject) return;

    try {
      setLoading(true);
      console.log('Deleting subject with ID:', selectedSubject.id);
      const deleteUrl = `${API_URL}${endpoints.manageSubject.delete}${selectedSubject.id}`;
      console.log('Delete URL:', deleteUrl);

      const response = await axios.delete(deleteUrl);
      console.log('Delete response:', response);

      message.success('Xóa môn học thành công');
      await fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      console.error('Error response:', error.response);
      message.error('Không thể xóa môn học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setSelectedSubject(null);
    }
  };

  const handleView = (record) => {
    navigate(`/dashboard/syllabus?subjectId=${record.code}`);
  };

  const columns = [
    {
      title: 'Mã môn học',
      dataIndex: 'code',
      key: 'code',
      width: '10%',
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      ellipsis: true,
    },
    {
      title: 'Điểm đạt',
      dataIndex: 'minAverageScoreToPass',
      key: 'minAverageScoreToPass',
      width: '5%',
      render: (score) => score.toFixed(1),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      width: '10%',
      sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '8%',
      render: (status) => {
        let color = 'default';
        let text = status;
        if (status === 1 || status === 'Active') { color = 'green'; text = 'Đang hoạt động (Active)'; }
        else if (status === 0 || status === 'Pending') { color = 'silver'; text = 'Nháp (Pending)'; }
        else if (status === 2 || status === 'Deleted') { color = 'red'; text = 'Đã Xóa (Deleted)'; }
        return <span style={{ color }}>{text}</span>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchText.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchText.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Trạng thái:</span>
          <Select
            value={statusFilter}
            className="w-[160px]"
            onChange={setStatusFilter}
          >
            <Option value={1}>Đang hoạt động</Option>
            <Option value={0}>Nháp</Option>
            <Option value={2}>Đã xóa</Option>
          </Select>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search
            placeholder="Nhập mã hoặc tên môn học để tìm kiếm"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: '300px' }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm môn học mới
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSubjects}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedSubject(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa môn học này?</p>
      </Modal>
    </div>
  );
};

export default Subjects; 