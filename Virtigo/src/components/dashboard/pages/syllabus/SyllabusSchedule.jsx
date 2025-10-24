import React from 'react';
import { Table, Button, Space, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const SyllabusSchedule = ({ 
  schedules, 
  onAdd, 
  onEdit, 
  onDelete,
  subject,
  canEdit = false,
  testMode = false,
  onBulkUpdate
}) => {
  // Add a sequential slot number for display
  const dataWithSlot = schedules.map((item, idx) => ({ ...item, displaySlot: idx + 1 }));

  // Calculate rowSpan for week merging (only for normal mode)
  let weekRowSpan = [];
  if (!testMode) {
    let lastWeek = null;
    let count = 0;
    dataWithSlot.forEach((item, idx) => {
      if (item.week !== lastWeek) {
        count = dataWithSlot.filter(x => x.week === item.week).length;
        weekRowSpan[idx] = count;
        lastWeek = item.week;
        count = 0;
      } else {
        weekRowSpan[idx] = 0;
      }
    });
  }

  const testColumns = [
    {
      title: 'Slot',
      dataIndex: 'slotIndex',
      key: 'slotIndex',
      width: 80,
    },
    {
      title: 'Hạng mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Loại bài kiểm tra',
      dataIndex: 'testType',
      key: 'testType',
      width: 150,
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'testDurationMinutes',
      key: 'testDurationMinutes',
      width: 120,
    },
    // {
    //   title: 'Cho phép làm lại',
    //   dataIndex: 'allowMultipleAttempts',
    //   key: 'allowMultipleAttempts',
    //   width: 120,
    //   render: (val) => val ? 'Có' : 'Không',
    // },
    // {
    //   title: 'Điểm đạt tối thiểu',
    //   dataIndex: 'minPassingScore',
    //   key: 'minPassingScore',
    //   width: 120,
    // },
  ];

  const columns = [
    {
      title: 'Tuần',
      dataIndex: 'week',
      key: 'Week',
      width: 80,
      sorter: (a, b) => a.week - b.week,
      render: (text, record, index) => {
        const rowSpan = weekRowSpan[index];
        return {
          children: text,
          props: { rowSpan }
        };
      }
    },
    {
      title: 'Slot',
      dataIndex: 'displaySlot',
      key: 'displaySlot',
      width: 100,
    },
    {
      title: 'Tiêu đề bài học',
      dataIndex: 'lessonTitle',
      key: 'LessonTitle',
      width: 200,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'Content',
      width: 300,
    },
    
    {
      title: 'Thời lượng',
      dataIndex: 'durationMinutes',
      key: 'DurationMinutes',
      width: 120,
      render: (duration) => (
        <Space>
          <ClockCircleOutlined />
          <span>{duration} phút</span>
        </Space>
      ),
    },
    {
      title: 'Tài nguyên',
      dataIndex: 'resources',
      key: 'Resources',
      width: 200,
      render: (resources) => (
        <Space wrap>
          {(resources && typeof resources === 'string')
            ? resources.split(';').map((resource, index) => (
                <Tag key={index} color="blue">{resource.trim()}</Tag>
              ))
            : <span>-</span>
          }
        </Space>
      ),
    },
    // Thao tác chỉ hiện nếu không phải Student
    canEdit && {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          {canEdit && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit && onEdit(record)}
            />
          )}
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div style={{ marginBottom: '32px' }}>
      {canEdit && onBulkUpdate && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button type="primary" onClick={() => onBulkUpdate(schedules)}>
            Lưu tất cả thay đổi
          </Button>
        </div>
      )}
      <Table
        columns={testMode ? testColumns : columns}
        dataSource={dataWithSlot}
        rowKey="syllabusScheduleID"
        pagination={false}
      />
    </div>
  );
};

export default SyllabusSchedule; 