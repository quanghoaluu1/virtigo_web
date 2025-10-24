import React from 'react';
import { Descriptions, Card, Table, Divider, List } from 'antd';

const AssessmentCategoryLabel = {
  0: 'Quiz',
  1: 'Presentation',
  2: 'Midterm',
  3: 'Final',
  4: 'Attendance',
  5: 'Assignment',
  6: 'Class Participation'
};
const TestTypeEnum = {
  0: 'None',
  1: 'Vocabulary',
  2: 'Grammar',
  3: 'Listening',
  4: 'Reading',
  5: 'Writing',
  6: 'Mix',
  7: 'Other'
};

const ConfirmationStep = ({ form, classSlots = [], assessmentInfo = [] }) => {
  const testSlots = form.getFieldValue('testSlots') || [];
  const criteria = form.getFieldValue('criteria') || assessmentInfo || [];

  // Tính tổng số tuần dựa trên classSlots
  const totalWeeks = classSlots.length > 0 ? Math.max(...classSlots.map(item => item.week)) : 0;

  // Columns for class slots
  const classColumns = [
    {
      title: 'Tuần',
      dataIndex: 'week',
      key: 'week',
      width: '10%',
      render: (value, row, index) => {
        const sameWeekItems = classSlots.filter(item => item.week === value);
        const firstIndex = classSlots.findIndex(item => item.week === value);
        if (index === firstIndex) {
          return {
            children: value,
            props: {
              rowSpan: sameWeekItems.length,
            },
          };
        }
        return {
          children: null,
          props: {
            rowSpan: 0,
          },
        };
      }
    },
    { title: 'Tiết', dataIndex: 'slot', key: 'slot', width: '10%' },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Thời lượng (phút)', dataIndex: 'durationMinutes', key: 'durationMinutes', width: '15%' },
    { title: 'Tài nguyên', dataIndex: 'resources', key: 'resources', ellipsis: true },
  ];

  // Columns for test slots
  const testColumns = [
    {
      title: 'Tuần',
      dataIndex: 'week',
      key: 'week',
      width: '10%',
      render: (value, row, index) => {
        const sameWeekItems = testSlotRows.filter(item => item.week === value);
        const firstIndex = testSlotRows.findIndex(item => item.week === value);
        if (index === firstIndex) {
          return {
            children: value,
            props: {
              rowSpan: sameWeekItems.length,
            },
          };
        }
        return {
          children: null,
          props: {
            rowSpan: 0,
          },
        };
      }
    },
    { title: 'Tiết', dataIndex: 'slot', key: 'slot', width: '10%' },
    { title: 'Bài kiểm tra', dataIndex: 'criteriaId', key: 'criteriaId', render: (val) => AssessmentCategoryLabel[val] || '' },
    { title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration', width: '15%' },
    { title: 'Kỹ năng', dataIndex: 'testType', key: 'testType', render: (val) => TestTypeEnum[val] || '' },
    // { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
  ];

  // Columns for assessment criteria
  const criteriaColumns = [
    {
      title: 'Loại đánh giá',
      dataIndex: 'category',
      key: 'category',
      render: (val) => AssessmentCategoryLabel[val] || '',
    },
    {
      title: 'Trọng số (%)',
      dataIndex: 'weightPercent',
      key: 'weightPercent',
    },
    {
      title: 'Số bài kiểm tra',
      dataIndex: 'requiredTestCount',
      key: 'requiredTestCount',
    },
    // {
    //   title: 'Điểm đạt',
    //   dataIndex: 'minPassingScore',
    //   key: 'minPassingScore',
    // },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (val) => val || '-',
    },
  ];

  // Merge testSlots with classSlots for week/slot info
  const testSlotRows = (testSlots || []).map((slot, idx) => ({
    ...slot,
    week: classSlots[idx]?.week,
    slot: classSlots[idx]?.slot,
    key: idx
  }));

  return (
    <div>
      <Card>
        <Descriptions title="Thông tin môn học" bordered column={3}>
          <Descriptions.Item label="Tên môn học" span={2}>
            {form.getFieldValue('name')}
          </Descriptions.Item>
          <Descriptions.Item label="Điểm đạt" span={1}>
            {form.getFieldValue('minAverageScoreToPass')}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={3}>
            {form.getFieldValue('description')}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số tuần" span={2}>
            {totalWeeks}
          </Descriptions.Item>
          <Descriptions.Item label="Số slot">
            {classSlots.length}
          </Descriptions.Item>
          {/* <Descriptions.Item label="Tổng số bài kiểm tra">
            {form.getFieldValue('totalTests')}
          </Descriptions.Item> */}
        </Descriptions>
      </Card>


      <Divider orientation="left" className="mt-24">Danh sách tiết học</Divider>
      <Table
        dataSource={classSlots}
        columns={classColumns}
        pagination={false}
        size="middle"
        rowKey={(row) => row.slot}
        className="mb-24"
      />

      <Divider orientation="left">Thông tin đánh giá</Divider>
      <Table
        dataSource={criteria}
        columns={criteriaColumns}
        pagination={false}
        size="middle"
        rowKey={(row, idx) => idx}
        className="mb-24"
      />

      <Divider orientation="left">Danh sách slot có bài kiểm tra</Divider>
      <Table
        dataSource={testSlotRows}
        columns={testColumns}
        pagination={false}
        size="middle"
        rowKey={(row) => row.key}
      />
    </div>
  );
};

export default ConfirmationStep; 