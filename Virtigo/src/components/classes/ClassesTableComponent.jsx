import React from 'react';
import { Tag, Space, Button } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { EyeOutlined, EditOutlined, DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const classStatusMap = {
  0: { text: 'Chưa công khai', color: 'default' },
  1: { text: 'Đang tuyển sinh', color: 'blue' },
  2: { text: 'Đang hoạt động', color: 'green' },
  3: { text: 'Hoàn thành', color: 'gold' },
  4: { text: 'Không hoạt động', color: 'red' },
  5: { text: 'Lớp bị hủy vì không đủ sĩ số', color: 'red'},
};

export function getClassesTableColumns(statusFilter, handlers) {
  const { onView, onEdit, onDelete, onOpenRecruit, onFinalize, onCompleted } = handlers;
  const baseColumns = [
    {
      title: 'Mã lớp',
      dataIndex: 'classID',
      key: 'classID',
    },
    {
      title: 'Tên lớp',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Giáo viên',
      dataIndex: 'lecturerName',
      key: 'lecturerName',
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
  ];

  const siSoColumn = {
    title: 'Sĩ số',
    key: 'students',
    render: (_, record) => `${record.numberStudentEnroll}`,
  };

  const hocPhiColumn = {
    title: 'Học phí',
    dataIndex: 'priceOfClass',
    key: 'priceOfClass',
    render: (price) => `${price.toLocaleString('vi-VN')} VNĐ`,
  };

  const teachingStartTimeColumn = {
    title: 'Ngày mở lớp dự kiến',
    dataIndex: 'teachingStartTime',
    key: 'teachingStartTime',
    render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '',
  };

  const trangThaiColumn = {
    title: 'Trạng thái',
    key: 'status',
    render: (_, record) => {
      const { status, numberStudentEnroll, minStudentAcp, maxStudentAcp, teachingStartTime } = record;
      const { text, color } = classStatusMap[status] || { text: status, color: 'default' };
      const now = dayjs();
      let extraTag = null;
      if (status === 1 && teachingStartTime) {
        const start = dayjs(teachingStartTime);
        const diffDays = start.diff(now, 'day');
        if (diffDays >= 0 && diffDays <= 10) {
          extraTag = <Tag color="gold">Lớp sắp bắt đầu khai giảng</Tag>;
        } else if (now.isAfter(start, 'minute')) {
          extraTag = <Tag color="red">Lớp đã qua ngày khai giảng dự tính</Tag>;
        }
      }
      if (statusFilter === 1) {
        return (
          <Space>
            <Tag color={color}>{text}</Tag>
            {numberStudentEnroll < minStudentAcp && (
              <Tag color="red">Thiếu học viên</Tag>
            )}
            {numberStudentEnroll >= maxStudentAcp && (
              <Tag color="blue">Đã đầy</Tag>
            )}
            {extraTag}
          </Space>
        );
      }
      return (
        <Space>
          <Tag color={color}>{text}</Tag>
          {extraTag}
        </Space>
      );
    },
  };

  const actionsColumn = {
    title: 'Thao tác',
    key: 'actions',
    render: (_, record) => {
      const { status, endDateClass } = record;
      const actions = [];
      if (statusFilter === 'all' || status === 0 || status === 1 || status === 5) {
        actions.push(
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            key="view"
          >
            {/* Xem */}
          </Button>
        );
      }
      if ((statusFilter === 'all' || status === 0 || status === 1 || status === 5) && status !== 2 && status !== 3 && status !== 4) {
        actions.push(
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            key="edit"
          >
            {/* Sửa */}
          </Button>
        );
        actions.push(
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
            key="delete"
          >
            {/* Xóa */}
          </Button>
        );
      }
      if (status === 0) {
        actions.push(
          <Button
            type="primary"
            icon={<RocketOutlined />}
            onClick={() => onOpenRecruit(record)}
            key="openRecruit"
            style={{ padding: '0 8px' }}
          >
            Bật tuyển sinh
          </Button>
        );
      }
      if (status === 1 && typeof onFinalize === 'function') {
        actions.push(
          <Button
            type="primary"
            key="finalize"
            style={{ background: '#faad14', borderColor: '#faad14', color: '#fff' }}
            onClick={() => onFinalize(record)}
          >
            Chốt danh sách
          </Button>
        );
      }
      if (status === 2 && endDateClass && dayjs(endDateClass).isBefore(dayjs())) {
        actions.push(
          <Button
            type="primary"
            size="small"
            key="completeClass"
            style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
            onClick={() => onCompleted(record)}
          >
            Đánh dấu hoàn thành
          </Button>
        );
      }
      if ((status === 2 || status === 3 || status === 4 || status === 5) && statusFilter !== 'all') {
        actions.length = 0;
        actions.push(
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            key="view"
          >
            Xem
          </Button>
        );
      }
      return <Space size="middle">{actions}</Space>;
    },
  };

  let columns = [...baseColumns];
  if (statusFilter === 'all') {
    columns.push(siSoColumn, hocPhiColumn, trangThaiColumn, actionsColumn);
  } else if (statusFilter === 0) {
    columns.push(hocPhiColumn, teachingStartTimeColumn, trangThaiColumn, actionsColumn);
  } else if (statusFilter === 1) {
    columns.push(siSoColumn, hocPhiColumn, teachingStartTimeColumn, trangThaiColumn, actionsColumn);
  } else if ([2, 3, 4].includes(statusFilter)) {
    columns.push(siSoColumn, hocPhiColumn, trangThaiColumn, actionsColumn);
  }
  return columns;
}
