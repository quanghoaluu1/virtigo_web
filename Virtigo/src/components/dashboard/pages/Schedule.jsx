import React from 'react';
import { Calendar, Badge, Card, Row, Col, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const Schedule = () => {
  const getListData = (value) => {
    const listData = [];
    switch (value.date()) {
      case 8:
        listData.push(
          { type: 'success', content: 'Beginner Korean A1 - 10:00 AM' },
          { type: 'warning', content: 'Intermediate Korean B1 - 2:00 PM' },
        );
        break;
      case 10:
        listData.push(
          { type: 'success', content: 'Advanced Korean C1 - 11:00 AM' },
        );
        break;
      case 15:
        listData.push(
          { type: 'warning', content: 'Beginner Korean A2 - 3:00 PM' },
        );
        break;
      default:
    }
    return listData;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events" className="list-none p-0 m-0">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const upcomingClasses = [
    {
      title: 'Beginner Korean A1',
      time: '10:00 AM - 11:30 AM',
      date: 'March 8, 2024',
      teacher: 'Kim Min-ji',
    },
    {
      title: 'Intermediate Korean B1',
      time: '2:00 PM - 3:30 PM',
      date: 'March 8, 2024',
      teacher: 'Park Ji-hoon',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Schedule</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Class
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Calendar dateCellRender={dateCellRender} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Upcoming Classes">
            {upcomingClasses.map((class_, index) => (
              <Card
                key={index}
                type="inner"
                className="mb-16"
                title={class_.title}
              >
                <p><strong>Time:</strong> {class_.time}</p>
                <p><strong>Date:</strong> {class_.date}</p>
                <p><strong>Teacher:</strong> {class_.teacher}</p>
                <Space>
                  <Button type="primary">Join Class</Button>
                  <Button size="small">View Details</Button>
                </Space>
              </Card>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Schedule; 