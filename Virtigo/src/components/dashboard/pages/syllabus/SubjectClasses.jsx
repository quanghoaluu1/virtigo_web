import React from 'react';
import { Table, Tag, Space, Typography } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const SubjectClasses = ({ classes }) => {
  // Class status enum
  const ClassStatus = {
    Pending: 0,
    Open: 1,
    Ongoing: 2,
    Completed: 3,
    Deleted: 4
  };

  // Function to get tag color based on status
  const getStatusTagColor = (status) => {
    switch (status) {
      case ClassStatus.Pending:
        return 'orange';
      case ClassStatus.Open:
        return 'blue';
      case ClassStatus.Ongoing:
        return 'green';
      case ClassStatus.Completed:
        return 'purple';
      case ClassStatus.Deleted:
        return 'red';
      default:
        return 'default';
    }
  };

  // Function to get status text based on status code
  const getStatusText = (status) => {
    switch (status) {
      case ClassStatus.Pending:
        return 'Chờ duyệt';
      case ClassStatus.Open:
        return 'Đang mở';
      case ClassStatus.Ongoing:
        return 'Đang diễn ra';
      case ClassStatus.Completed:
        return 'Đã hoàn thành';
      case ClassStatus.Deleted:
        return 'Đã xóa';
      default:
        return 'Không xác định';
    }
  };

  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'classID',
      key: 'classID',
      width: 100,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'className',
      key: 'className',
      width: 200,
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturerName',
      key: 'lecturerName',
      width: 150,
      render: (name) => (
        <Space>
          <UserOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Số học viên',
      key: 'students',
      width: 150,
      render: (_, record) => (
        <span>{record.minStudentAcp} - {record.maxStudentAcp}</span>
      ),
    },
    {
      title: 'Học phí',
      dataIndex: 'priceOfClass',
      key: 'priceOfClass',
      width: 120,
      render: (price) => (
        <span>{price.toLocaleString('vi-VN')} VNĐ</span>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'teachingStartTime',
      key: 'teachingStartTime',
      width: 150,
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusTagColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3} className="m-0"></Title>
      </div>
      <Table
        columns={columns}
        dataSource={classes}
        rowKey="classID"
        pagination={false}
      />
    </div>
  );
};

export default SubjectClasses; 