import React from 'react';
import { Form, Input, Card, Table, Select, InputNumber } from 'antd';

const { Option } = Select;

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

const AssessmentCategoryLabel = {
  0: 'Quiz',
  1: 'Presentation',
  2: 'Midterm',
  3: 'Final',
  4: 'Attendance',
  5: 'Assignment',
  6: 'Class Participation'
};

const TestSlotsStep = ({ classSlots, form, assessmentInfo }) => {
  const criteria = assessmentInfo || [];

  const testSlots = Form.useWatch('testSlots', form) || [];

  const getUsedCounts = () => {
    const countMap = {};
    testSlots.forEach(slot => {
      const category = slot?.criteriaId;
      if (category !== undefined && category !== null) {
        countMap[category] = (countMap[category] || 0) + 1;
      }
    });
    return countMap;
  };

  // Tìm index slot đầu tiên có Midterm
  const midtermIndex = testSlots.findIndex(slot => slot?.criteriaId === 2);

  const usedCounts = getUsedCounts();

  const columns = [
    {
      title: 'Tuần',
      dataIndex: 'week',
      key: 'week',
      width: '10%',
    },
    {
      title: 'Tiết',
      dataIndex: 'slot',
      key: 'slot',
      width: '10%',
    },
    {
      title: 'Bài kiểm tra',
      key: 'testCriteria',
      width: '30%',
      render: (_, record) => {
        const currentSlotIndex = record.slot - 1;
        const currentSelected = testSlots[currentSlotIndex]?.criteriaId;

        return (
          <Form.Item
            name={['testSlots', currentSlotIndex, 'criteriaId']}
            className="m-0"
          >
            <Select
              placeholder="Chọn bài kiểm tra"
              allowClear
              className="w-full"
            >
              {criteria.map((criterion, index) => {
                const used = usedCounts[criterion.category] || 0;
                const limit = criterion.requiredTestCount;
                let isDisabled = used >= limit && currentSelected !== criterion.category;
                // Disable Final nếu trước Midterm
                if (
                  criterion.category === 3 && // Final
                  midtermIndex !== -1 && // Có Midterm
                  currentSlotIndex < midtermIndex // Slot này trước Midterm
                ) {
                  isDisabled = true;
                }
                return (
                  <Option
                    key={index}
                    value={criterion.category}
                    disabled={isDisabled}
                  >
                    {AssessmentCategoryLabel[criterion.category]} ({used}/{limit})
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        );
      }
    }
    ,
    {
      title: 'Thời lượng (phút)',
      key: 'duration',
      width: '15%',
      render: (_, record) => {
        const slotIndex = record.slot - 1;
        const criteriaId = testSlots[slotIndex]?.criteriaId;
        const isDisabled = criteriaId === undefined || criteriaId === null;
        const lessonDuration = classSlots[slotIndex]?.durationMinutes || 0;
        return (
          <Form.Item
            name={['testSlots', slotIndex, 'duration']}
            className="m-0"
            rules={[
              {
                validator: (_, value) => {
                  if (isDisabled) return Promise.resolve();
                  if (value === undefined || value === null) {
                    return Promise.reject(new Error('Vui lòng nhập thời lượng kiểm tra'));
                  }
                  if (value > lessonDuration) {
                    return Promise.reject(new Error(`Thời lượng kiểm tra không được lớn hơn thời lượng buổi học (${lessonDuration} phút)`));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              min={1}
              className="w-full"
              placeholder="Thời lượng"
              disabled={isDisabled}
            />
          </Form.Item>
        );
      }
    },
    {
      title: 'Kỹ năng',
      key: 'testType',
      width: '20%',
      render: (_, record) => {
        const criteriaId = testSlots[record.slot - 1]?.criteriaId;
        const isDisabled = criteriaId === undefined || criteriaId === null;
        return (
          <Form.Item name={['testSlots', record.slot - 1, 'testType']} className="m-0">
            <Select placeholder="Chọn kỹ năng" disabled={isDisabled} className="w-full">
              {Object.entries(TestTypeEnum).map(([value, label]) => (
                <Option key={value} value={Number(value)}>{label}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      }
    }
  ];

  return (
    <Card>
      <div className="mb-16">
        <h3>Danh sách slot kiểm tra</h3>
        <Table
          dataSource={classSlots}
          columns={columns}
          pagination={false}
          size="small"
          rowKey="slot"
        />
      </div>
    </Card>
  );
};

export default TestSlotsStep;
