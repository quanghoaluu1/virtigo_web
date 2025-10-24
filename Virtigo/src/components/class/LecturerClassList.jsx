import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { Table, Avatar, Button, Tag, Select } from 'antd';
import { getUser } from '../../utils/auth';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

const statusColor = (status) => {
  switch (status) {
    case 0: return 'default'; // Pending
    case 1: return 'blue';    // Open
    case 2: return 'green';   // Ongoing
    case 3: return 'gold';    // Completed
    case 4: return 'red';     // Deleted
    case 5: return 'volcano'; // Cancelled
    default: return 'default';
  }
};
const statusText = (status) => {
  switch (status) {
    case 0: return 'Chờ xử lý';
    case 1: return 'Mở tuyển sinh';
    case 2: return 'Đang dạy';
    case 3: return 'Hoàn thành';
    case 4: return 'Đã xóa';
    case 5: return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const { Option } = Select;

const LecturerClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const user = getUser();
  const lecturerID = user?.accountId;
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState(null); // null = tất cả

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}api/Class/get-all-paginated`, {
          params: {
            page,
            pageSize: PAGE_SIZE,
          },
        });
        const items = Array.isArray(res.data) ? res.data : res.data.items || [];
        // Lọc theo lecturerID và status (1,2,3 hoặc theo selectedStatus)
        const validStatuses = [1, 2, 3];
        const filtered = items.filter(
          (item) =>
            item.lecturerID === lecturerID &&
            (selectedStatus === null
              ? validStatuses.includes(item.status)
              : item.status === selectedStatus)
        );
        setClasses(filtered);
        setTotal(res.data.totalItems || filtered.length);
      } catch (err) {
        setError('Không thể tải danh sách lớp.');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [page, lecturerID, selectedStatus]);

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageURL',
      key: 'imageURL',
      render: (url) => <Avatar shape="square" size={64} src={url} />,
      width: 90,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'className',
      key: 'className',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Số học viên',
      dataIndex: 'numberStudentEnroll',
      key: 'numberStudentEnroll',
      align: 'center',
    },
    // {
    //   title: 'Giá',
    //   dataIndex: 'priceOfClass',
    //   key: 'priceOfClass',
    //   render: (price) => price ? price.toLocaleString() + ' VNĐ' : '--',
    //   align: 'right',
    // },
    {
      title: 'Ngày bắt đầu dự kiến',
      dataIndex: 'teachingStartTime',
      key: 'teachingStartTime',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '--',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{statusText(status)}</Tag>,
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/lecturer/class/${record.classID}`)}
        >
          Xem
        </Button>
      ),
      align: 'center',
      width: 140,
    },
  ];

  return (
    <div>
      <h1 style={{fontWeight:'bolder', marginBottom: 24 }}>Danh sách lớp</h1>
      <div className="mb-16">
        <span className="mr-8">Lọc theo trạng thái:</span>
        <Select
          value={selectedStatus}
          onChange={value => { setSelectedStatus(value); setPage(1); }}
          className="w-[180px]"
        >
          <Option value={null}>Tất cả</Option>
          <Option value={1}>Mở tuyển sinh</Option>
          <Option value={2}>Đang dạy</Option>
          <Option value={3}>Hoàn thành</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={classes}
        loading={loading}
        rowKey="classID"
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: total,
          onChange: setPage,
          showSizeChanger: false,
        }}
        locale={{ emptyText: error || 'Không có lớp nào.' }}
        bordered
      />
    </div>
  );
};

export default LecturerClassList; 