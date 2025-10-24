import React from 'react';
import { Descriptions, Button, Space, Tag, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const SubjectInfo = ({ subject, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ textTransform: 'uppercase' }}>{subject.name}</Title>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={onEdit}
            disabled={!(subject.status === 0 || subject.status === 1)}
          >
            Sửa môn học
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onDelete}
            disabled={!(subject.status === 0 || subject.status === 1)}
          >
            Xóa môn học
          </Button>
          {(subject.status === 0 || subject.status === 1) && (
            <Button
              type={subject.status === 0 ? 'primary' : 'default'}
              onClick={onToggleStatus}
            >
              {subject.status === 0 ? 'Công khai môn học' : 'Ẩn môn học'}
            </Button>
          )}
        </Space>
      </div>
      
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã môn học" >{subject.code}</Descriptions.Item>
        {/* <Descriptions.Item label="Cấp độ">{subject.level}</Descriptions.Item> */}
        <Descriptions.Item label="Mô tả" span={2}>
          {subject.description}
        </Descriptions.Item>
        <Descriptions.Item label="Điểm đạt tối thiểu">
          {subject.minAverageScoreToPass}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {(() => {
            let color = 'default';
            let text = subject.status;
            if (subject.status === 1 || subject.status === 'Active') { color = 'green'; text = 'Đang hoạt động (Active)'; }
            else if (subject.status === 0 || subject.status === 'Pending') { color = 'gold'; text = 'Nháp (Pending)'; }
            else if (subject.status === 2 || subject.status === 'Deleted') { color = 'red'; text = 'Đã Xóa (Deleted)'; }
            return <Tag color={color}>{text}</Tag>;
          })()}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          <Space>
            <CalendarOutlined />
            <span>{new Date(subject.createAt).toLocaleString()}</span>
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default SubjectInfo; 