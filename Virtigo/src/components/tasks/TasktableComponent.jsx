import React from 'react';
import { Table, Tag } from 'antd';

const TEST_TYPE_LABELS = {
  0: 'Không xác định',
  1: 'Từ vựng',
  2: 'Ngữ pháp',
  3: 'Nghe hiểu',
  4: 'Đọc hiểu',
  5: 'Viết',
  6: 'Tổng hợp',
  7: 'Trắc nghiệm',
  8: 'Khác'
};
const CATEGORY_LABELS = {
  0: 'Đề kiểm tra đánh giá',
  2: 'Đề thi giữa kì',
  3: 'Đề thi cuối kì',
};

// Hàm xác định trạng thái bài kiểm tra dựa trên thời gian
const getVirtualStatus = (startAt, endAt) => {
  const now = new Date();
  if (!startAt || !endAt) return { text: 'Chưa có thời gian kiểm tra', color: 'orange' };
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (now < start) return { text: 'Sắp diễn ra', color: 'orange' };
  if (now >= start && now <= end) return { text: 'Đang diễn ra', color: 'green' };
  if (now > end) return { text: 'Đã kết thúc', color: 'red' };
  return { text: 'Không xác định', color: 'default' };
};

const TasktableComponent = ({ testEvents }) => {
  const columns = [
    { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
    { title: 'Tên bài kiểm tra', dataIndex: 'description', key: 'description', render: (text) => <b>{text || 'Bài kiểm tra'}</b> },
    { title: 'Loại', dataIndex: 'assessmentCategory', key: 'assessmentCategory', render: (cat) => CATEGORY_LABELS[cat] || 'Không xác định' },
    { title: 'Kĩ năng', dataIndex: 'testType', key: 'testType', render: (type) => TEST_TYPE_LABELS[type] || 'Không xác định' },
    { title: 'Tiết', dataIndex: 'lessonTitle', key: 'lessonTitle' },
    { title: 'Ngày', dataIndex: 'lessonStartTime', key: 'lessonStartTime', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '--' },
    { title: 'Giờ', dataIndex: 'lessonStartTime', key: 'lessonStartTime_time', render: (date) => date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--' },
    { title: 'Thời gian kiểm tra', key: 'testTime', render: (_, item) => item.startAt && item.endAt ? `${new Date(item.startAt).toLocaleString('vi-VN')} - ${new Date(item.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Chưa có thời gian kiểm tra' },
    { title: 'Trạng thái', key: 'status', render: (_, item) => { const status = getVirtualStatus(item.startAt, item.endAt); return <Tag color={status.color}>{status.text}</Tag>; } },
  ];

  return (
    <Table
      columns={columns}
      dataSource={testEvents.map((t, idx) => ({ ...t, key: t.testEventID || idx }))}
      pagination={false}
      locale={{ emptyText: 'Chưa có lịch kiểm tra.' }}
      scroll={{ x: true }}
    />
  );
};

export default TasktableComponent;



