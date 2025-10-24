import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Tag, Select, Modal, message, Card, Row, Col, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [classes, setClasses] = useState([]);

  const navigate = useNavigate();

  // Fetch classes for filter dropdown
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_URL}api/Class/get-all`);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Fetch lessons data
  const fetchLessons = async (page = 1, pageSize = 10, search = '', classId = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}api/LessonDetails`);
      console.log('Fetched lesson details:', response.data);
      
      let lessonDetailsData = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        lessonDetailsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        lessonDetailsData = response.data.data;
      } else if (response.data && response.data.items) {
        lessonDetailsData = response.data.items;
      }

      // Format the data for display
      const formattedData = lessonDetailsData.map((lessonDetail, index) => ({
        key: index,
        lessonDetailID: lessonDetail.lessonDetailID,
        lessonID: lessonDetail.lessonID || `LD-${index}`,
        lessonName: lessonDetail.title || 'Chưa có tiêu đề',
        lessonNumber: index + 1,
        description: lessonDetail.description || '',
        classID: lessonDetail.classID || '',
        className: lessonDetail.className || 'N/A',
        subjectName: lessonDetail.subjectName || 'N/A',
        startTime: lessonDetail.startTime || lessonDetail.createdAt,
        endTime: lessonDetail.endTime,
        status: lessonDetail.isActive ? 1 : 0,
        createdAt: lessonDetail.createdAt,
        blocks: lessonDetail.blocks || [],
      }));

      // Apply client-side filtering
      let filteredData = formattedData;
      
      if (search) {
        filteredData = filteredData.filter(item => 
          item.lessonName.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (classId !== 'all') {
        filteredData = filteredData.filter(item => item.classID === classId);
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setLessons(paginatedData);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: filteredData.length,
      });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      message.error('Không thể tải danh sách chi tiết bài học');
      setLessons([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchLessons();
  }, []);

  useEffect(() => {
    fetchLessons(pagination.current, pagination.pageSize, searchText, classFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, classFilter]);

  const handleTableChange = (pagination) => {
    fetchLessons(pagination.current, pagination.pageSize, searchText, classFilter);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleClassFilterChange = (value) => {
    setClassFilter(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleEditLesson = (record) => {
    // Navigate to edit lesson detail if lessonDetailID exists
    if (record.lessonDetailID) {
      navigate(`/dashboard/lesson-management/edit/${record.lessonDetailID}`, { 
        state: { 
          lessonDetailId: record.lessonDetailID,
          lessonId: record.lessonID,
          classId: record.classID 
        } 
      });
    } else {
      // Navigate to create new lesson detail
      navigate('/dashboard/lesson-management/create', { 
        state: { 
          lessonId: record.lessonID,
          classId: record.classID 
        } 
      });
    }
  };

  const handleDeleteLesson = async (record) => {
    try {
      await axios.delete(`${API_URL}api/LessonDetails/${record.lessonDetailID}`);
      message.success('Xóa chi tiết bài học thành công');
      fetchLessons(pagination.current, pagination.pageSize, searchText, classFilter);
    } catch (error) {
      message.error('Không thể xóa chi tiết bài học');
      console.error('Delete error:', error);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      0: { color: 'red', text: 'Không kích hoạt' },
      1: { color: 'green', text: 'Đang kích hoạt' },
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: 'Không xác định' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'lessonNumber',
      key: 'lessonNumber',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'lessonName',
      key: 'lessonName',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Số khối nội dung',
      key: 'blockCount',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const count = record.blocks?.length || 0;
        return <Tag color="blue">{count} khối</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            size="small"
            onClick={() => navigate(`/dashboard/lesson-management/preview/${record.lessonDetailID}`)}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Xem
          </Button>
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditLesson(record)}
          >
            Sửa
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteLesson(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title level={2} style={{ margin: 0 }}>
          <BookOutlined className="mr-2" />
          Quản lý chi tiết bài học
        </Title>
        <Space>
          <Select
            placeholder="Chọn lớp học"
            className="w-48"
            value={classFilter}
            onChange={handleClassFilterChange}
            allowClear
          >
            <Option value="all">Tất cả lớp học</Option>
            {classes.map((cls) => (
              <Option key={cls.classID} value={cls.classID}>
                {cls.className}
              </Option>
            ))}
          </Select>
          <Search
            placeholder="Tìm kiếm bài học"
            className="w-64"
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/dashboard/lesson-management/create')}
          >
            Tạo chi tiết bài học
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={lessons}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bài học`,
          }}
          onChange={handleTableChange}
          rowKey="lessonDetailID"
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default LessonManagement;
