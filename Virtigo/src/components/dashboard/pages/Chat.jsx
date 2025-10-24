import React from 'react';
import { Layout, Input, Button, List, Avatar, Space, Typography } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const Chat = () => {
  const conversations = [
    { id: 1, name: 'Kim Min-ji', lastMessage: 'See you in class tomorrow!', time: '10:30 AM' },
    { id: 2, name: 'Park Ji-hoon', lastMessage: 'Can you help me with the homework?', time: 'Yesterday' },
    { id: 3, name: 'Lee Soo-jin', lastMessage: 'Thank you for the feedback', time: 'Yesterday' },
  ];

  const messages = [
    { id: 1, sender: 'Kim Min-ji', content: 'Hello! How can I help you today?', time: '10:30 AM', isUser: false },
    { id: 2, sender: 'You', content: 'I have a question about the lesson', time: '10:31 AM', isUser: true },
    { id: 3, sender: 'Kim Min-ji', content: 'Sure, what would you like to know?', time: '10:32 AM', isUser: false },
  ];

  return (
    <Layout style={{ height: 'calc(100vh - 200px)' }}>
      <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px' }}>
          <Input.Search placeholder="Search conversations" className="mb-16" />
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={item => (
              <List.Item style={{ cursor: 'pointer', padding: '12px' }}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={item.name}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" ellipsis>{item.lastMessage}</Text>
                      <Text type="secondary" className="text-xs">{item.time}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Sider>
      <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={item => (
              <List.Item style={{ 
                justifyContent: item.isUser ? 'flex-end' : 'flex-start',
                padding: '8px 0'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: item.isUser ? '#1890ff' : '#f0f0f0',
                  color: item.isUser ? '#fff' : '#000',
                }}>
                  <div style={{ marginBottom: '4px' }}>{item.sender}</div>
                  <div>{item.content}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: item.isUser ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)',
                    marginTop: '4px'
                  }}>
                    {item.time}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
          <Space.Compact className="w-full">
            <TextArea
              placeholder="Type a message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ marginRight: '8px' }}
            />
            <Button type="primary" icon={<SendOutlined />} />
          </Space.Compact>
        </div>
      </Content>
    </Layout>
  );
};

export default Chat; 