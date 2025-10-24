import React from 'react';
import { Table, Button, Space, Input, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Search } = Input;

const Blog = () => {
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Published' ? 'green' : 'orange'}>
          {status === 'Published' ? 'Đã đăng' : 'Nháp'}
        </Tag>
      ),
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">Xem</Button>
          <Button icon={<EditOutlined />} type="primary" size="small">Sửa</Button>
          <Button icon={<DeleteOutlined />} danger size="small">Xóa</Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      title: 'Giới thiệu bảng chữ cái Hàn Quốc',
      author: 'Kim Min-ji',
      category: 'Học tập',
      status: 'Published',
      date: '2024-03-15',
    },
    // Thêm dữ liệu khác nếu cần
  ];

  return (
    <div>
      <div className="mb-16 flex justify-between">
        <h1>Quản lý bài viết</h1>
        <Space>
          <Search
            placeholder="Tìm kiếm bài viết"
            className="w-[200px]"
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm bài viết
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Blog;
