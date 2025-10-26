import React from 'react';
import { Form, Input, Button, Select, DatePicker, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { API_URL } from '../../../config/api';

const { Option } = Select;

const CreateUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // Chuyển đổi giá trị
      const genderMap = { '0': 'Male', '1': 'Female' };
      const roleMap = { '0': 'Manager', '1': 'Lecture', '2': 'Student' };

      const payload = {
        ...values,
        gender: genderMap[values.gender],
        role: roleMap[values.role],
        birthDate: values.birthDate.format('YYYY-MM-DD'),
      };

      // Gửi API
      const response = await axios.post(`${API_URL}api/Account/create-account`, payload);

      if (response.status === 200 || response.status === 201) {
        message.success('Người dùng đã được tạo thành công!');
        navigate('/dashboard/users');
      } else {
        message.error('Tạo người dùng thất bại!');
      }
    } catch (error) {
      console.error(error);
      message.error('Tạo người dùng thất bại!');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Thêm người dùng mới</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ gender: '0', role: '2' }}
      >
        <Form.Item name="lastName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="firstName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
          <Select>
            <Option value="0">Nam</Option>
            <Option value="1">Nữ</Option>
          </Select>
        </Form.Item>
        <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="birthDate" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
          <Select>
            <Option value="0">Manager</Option>
            <Option value="1">Lecture</Option>
            <Option value="2">Student</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Tạo người dùng</Button>
          <Button className="ml-8" onClick={() => navigate('/dashboard/users')}>Hủy</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateUser;
