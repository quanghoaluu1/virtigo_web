import React from 'react';
import { Card, Avatar, Row, Col, Button, Form, Input, Upload, Tabs } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const Profile = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <div>
      <h1>Profile</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={120} icon={<UserOutlined />} />
              <h2 className="mt-16">John Doe</h2>
              <p style={{ color: '#666' }}>Korean Language Student</p>
            </div>
            <div className="mb-16">
              <p><MailOutlined /> john.doe@example.com</p>
              <p><PhoneOutlined /> +1 234 567 890</p>
            </div>
            <Upload>
              <Button icon={<UploadOutlined />}>Change Avatar</Button>
            </Upload>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Personal Information" key="1">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '+1 234 567 890',
                    bio: 'Korean language enthusiast and student.',
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: 'email' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="language"
                        label="Native Language"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              <TabPane tab="Learning Progress" key="2">
                <div style={{ padding: '24px 0' }}>
                  <h3>Current Level: Intermediate (B1)</h3>
                  <div className="mt-16">
                    <h4>Completed Courses</h4>
                    <ul>
                      <li>Beginner Korean A1</li>
                      <li>Beginner Korean A2</li>
                    </ul>
                  </div>
                  <div className="mt-16">
                    <h4>Current Courses</h4>
                    <ul>
                      <li>Intermediate Korean B1 (In Progress)</li>
                    </ul>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Settings" key="3">
                <div style={{ padding: '24px 0' }}>
                  <h3>Notification Settings</h3>
                  <Form layout="vertical">
                    <Form.Item label="Email Notifications">
                      <Input type="checkbox" defaultChecked />
                    </Form.Item>
                    <Form.Item label="Class Reminders">
                      <Input type="checkbox" defaultChecked />
                    </Form.Item>
                    <Form.Item label="New Messages">
                      <Input type="checkbox" defaultChecked />
                    </Form.Item>
                  </Form>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile; 