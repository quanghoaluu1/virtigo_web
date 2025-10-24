import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Select, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL, endpoints } from '../../../config/api';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    role: undefined,
    gender: undefined,
    status: undefined
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = async (page = 1, pageSize = 10, search = '', roleFilter, genderFilter, statusFilter) => {
    try {
      setLoading(true);

      // Nếu search là accountID (ví dụ: A00000)
      if (/^A\d+$/.test(search)) {
        try {
          const response = await axios.get(`${API_URL}api/Account/${search}`);
          if (response.data && response.data.accountID) {
            const user = response.data;
            const formattedData = [{
              key: 0,
              id: 1,
              accountID: user.accountID,
              name: `${user.lastName} ${user.firstName}`,
              email: user.email,
              phoneNumber: user.phoneNumber,
              role: user.role || getRoleName(user.role),
              status: user.status || getStatusName(user.status),
              gender: user.gender || getGenderName(user.gender),
              birthDate: user.birthDate
            }];
            setUsers(formattedData);
            setPagination({
              current: 1,
              pageSize: 10,
              total: 1
            });
            setLoading(false);
            return;
          } else {
            setUsers([]);
            setPagination({
              current: 1,
              pageSize: 10,
              total: 0
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          setUsers([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0
          });
          setLoading(false);
          return;
        }
      }

      // ...phần còn lại giữ nguyên như cũ
      const response = await axios.get(`${API_URL}${endpoints.manageAccount.getAccount}`, {
        params: {
          page,
          pageSize,
          search,
          role: roleFilter,
          gender: genderFilter,
          status: statusFilter
        }
      });

      if (response.data.success) {
        const formattedData = response.data.data.items.map((user, index) => ({
          key: index,
          id: index + 1,
          accountID: user.accountID,
          name: `${user.lastName} ${user.firstName}`,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: getRoleName(user.role),
          status: getStatusName(user.status),
          gender: getGenderName(user.gender),
          birthDate: user.birthDate
        }));

        setUsers(formattedData);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response.data.data.totalItems || formattedData.length
        });
      } else {
        message.error('Failed to fetch users');
      }
    } catch (error) {
      message.error('Error fetching users');
      setUsers([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 0: return 'Manager';
      case 1: return 'Lecture';
      case 2: return 'Student';
      default: return 'Unknown';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 0: return 'Đang hoạt động';
      case 1: return 'Không hoạt động';
      default: return 'Unknown';
    }
  };

  const getGenderName = (gender) => {
    switch (gender) {
      case 0: return 'Nam';
      case 1: return 'Nữ';
      default: return 'Unknown';
    }
  };

  useEffect(() => {
    fetchUsers(1, pagination.pageSize, searchText, filters.role, filters.gender, filters.status);
  }, [searchText, filters]);

  const handleTableChange = (pagination) => {
    fetchUsers(pagination.current, pagination.pageSize, searchText, filters.role, filters.gender, filters.status);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setPagination({ ...pagination, current: 1 });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      // Giả sử API xoá user là DELETE /api/users/:id
      const deleteUrl = `${API_URL}${endpoints.manageAccount.deleteAccount}${selectedUser.accountID}`;
      await axios.delete(deleteUrl);
      message.success('Xóa người dùng thành công');
      fetchUsers(pagination.current, pagination.pageSize, searchText, filters.role, filters.gender, filters.status);
    } catch (error) {
      message.error('Không thể xóa người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setSelectedUser(null);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'accountID',
      key: 'accountID',
      width: 100,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 140,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EyeOutlined />} onClick={() => {
            navigate(`/dashboard/profile/${record.accountID}`);
          }}>Xem</Button>
          {/* <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setDeleteModalVisible(true);
            }}
          >
            Xóa
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-16 flex justify-between">
        <h1 className="font-bold">Quản lý người dùng</h1>
        <Space>
          <Search
            placeholder="Tìm kiếm người dùng"
            className="w-[200px]"
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            allowClear
          />
          <Select
            placeholder="Vai trò"
            className="w-[120px]"
            allowClear
            onChange={(value) => handleFilterChange('role', value)}
          >
            <Option value={0}>Manager</Option>
            <Option value={1}>Lecture</Option>
            <Option value={2}>Student</Option>
          </Select>
          <Select
            placeholder="Giới tính"
            className="w-[120px]"
            allowClear
            onChange={(value) => handleFilterChange('gender', value)}
          >
            <Option value={0}>Nam</Option>
            <Option value={1}>Nữ</Option>
          </Select>
          <Select
            placeholder="Trạng thái"
            className="w-[120px]"
            allowClear
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value={0}>Đang hoạt động</Option>
            <Option value={1}>Không hoạt động</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/dashboard/users/create')}>
            Thêm người dùng
          </Button>
        </Space>
      </div>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      {/* <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteUser}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedUser(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
      </Modal> */}
    </div>
  );
};

export default Users;
