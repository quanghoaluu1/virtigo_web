import React from 'react';
import { Table, Button, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

// Enums for Category and TestType
const CategoryEnum = {
  0: 'Quiz',
  1: 'Presentation',
  2: 'Midterm',
  3: 'Final',
  4: 'Attendance',
  5: 'Assignment',
  6: 'Class Participation',
};

// Cập nhật cho TestType
const TestTypeEnum = {
  0: 'None',
  1: 'Vocabulary',
  2: 'Grammar',
  3: 'Listening',
  4: 'Reading',
  5: 'Writing',
  6: 'Mix',
  7: 'Other',
};


const AssessmentCriteria = ({ 
  assessmentCriteria, 
  onAdd, 
  onEdit, 
  onDelete,
}) => {
  const columns = [
    {
      title: 'Loại đánh giá',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => CategoryEnum[Number(category)] || category
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      render: (note) => note || '-'
    },
    {
      title: 'Trọng số (%)',
      dataIndex: 'weightPercent',
      key: 'weightPercent',
      width: 120,
    },
    {
      title: 'Số lượng yêu cầu',
      dataIndex: 'requiredTestCount',
      key: 'requiredTestCount',
      width: 150,
    },
    // {
    //   title: 'Thời gian (phút)',
    //   dataIndex: 'duration',
    //   key: 'duration',
    //   width: 150,
    // },
    // {
    //   title: 'Loại bài kiểm tra',
    //   dataIndex: 'testType',
    //   key: 'testType',
    //   width: 150,
    //   render: (testType) => TestTypeEnum[testType] || testType
    // },
    // {
    //   title: 'Điểm đạt tối thiểu',
    //   dataIndex: 'minPassingScore',
    //   key: 'minPassingScore',
    //   width: 150,
    // },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          {/* <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.assessmentCriteriaID)}
          /> */}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3} className="m-0"></Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          Thêm tiêu chí
        </Button>
      </div> */}
      <Table
        columns={columns}
        dataSource={assessmentCriteria}
        rowKey="assessmentCriteriaID"
        pagination={false}
      />
    </div>
  );
};

export default AssessmentCriteria; 