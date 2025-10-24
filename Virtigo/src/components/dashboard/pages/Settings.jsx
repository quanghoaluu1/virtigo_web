import React from 'react';
import { Card, Form, Input, Switch, Select, Button, Divider, Space, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <div>
      <h1>Settings</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          language: 'en',
          theme: 'light',
          notifications: true,
          emailNotifications: true,
          soundEnabled: true,
        }}
      >
        <Card title="General Settings" className="mb-16">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="language"
                label="Interface Language"
              >
                <Select>
                  <Option value="en">English</Option>
                  <Option value="ko">Korean</Option>
                  <Option value="vi">Vietnamese</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="theme"
                label="Theme"
              >
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="system">System</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Notification Settings" className="mb-16">
          <Form.Item
            name="notifications"
            label="Enable Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="emailNotifications"
            label="Email Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="soundEnabled"
            label="Sound Effects"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Privacy Settings" className="mb-16">
          <Form.Item
            name="profileVisibility"
            label="Profile Visibility"
          >
            <Select>
              <Option value="public">Public</Option>
              <Option value="private">Private</Option>
              <Option value="friends">Friends Only</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="showProgress"
            label="Show Learning Progress"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Account Settings" className="mb-16">
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
        </Card>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Changes
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default Settings; 