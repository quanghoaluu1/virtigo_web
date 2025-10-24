import React from 'react';
import { Card, Descriptions, Tag, Space, Typography, Row, Col } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

const weekDayMap = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

const ConfirmCreateClass = ({ formData }) => {
  const { basicInfo, lessons } = formData;

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card title="Thông tin cơ bản">
        <Row gutter={16}>
          <Col span={12}>
            <Descriptions column={1}>
              <Descriptions.Item label="Tên lớp">{basicInfo.className}</Descriptions.Item>
              <Descriptions.Item label="Giáo viên">{lessons.lecturerName}</Descriptions.Item>
              <Descriptions.Item label="Môn học">{basicInfo.subjectName}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={basicInfo.imageURL} 
                alt="Ảnh lớp" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Cấu hình lớp">
        <Descriptions column={2}>
          <Descriptions.Item label="Số học viên tối thiểu">
            {basicInfo.minStudentAcp}
          </Descriptions.Item>
          <Descriptions.Item label="Số học viên tối đa">
            {basicInfo.maxStudentAcp}
          </Descriptions.Item>
          <Descriptions.Item label="Học phí">
            {basicInfo.priceOfClass?.toLocaleString('vi-VN')} VNĐ
          </Descriptions.Item>
          <Descriptions.Item label="Ngày học chính thức">
            {dayjs(lessons.teachingStartTime).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Lịch học">
        <Descriptions column={1}>
          <Descriptions.Item label="Giờ học">
            {dayjs(lessons.lessonTime).format('HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Các ngày học trong tuần">
            <Space wrap>
              {lessons.weekDays?.map(day => (
                <Tag key={day} color="blue">
                  {weekDayMap[day]}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default ConfirmCreateClass;
