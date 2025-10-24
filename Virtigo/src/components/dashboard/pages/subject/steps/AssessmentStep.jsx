import React, { useEffect } from 'react';
import { Form, Select, InputNumber, Button, Card, Row, Col, Typography, Space, Input } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const AssessmentCategory = {
  Quiz: 0,
  Presentation: 1,           // RequiredTestCount luôn = 0
  Midterm: 2,
  Final: 3,
  Attendance: 4,             // RequiredTestCount luôn = 0
  Assignment: 5,             // RequiredTestCount luôn = 0
  ClassParticipation: 6      // RequiredTestCount luôn = 0
};

const AssessmentStep = ({ form, configuration }) => {
  const criteria = Form.useWatch('criteria', form) || [];
  const totalWeight = criteria.reduce((sum, item) => sum + (item?.weightPercent || 0), 0);
  const isWeightValid = totalWeight === 100;

  // 🟢 Auto init if needed
  useEffect(() => {
    if (
      configuration &&
      configuration.totalTests &&
      (!form.getFieldValue('criteria') || form.getFieldValue('criteria').length === 0)
    ) {
      const initialCriteria = Array.from({ length: configuration.totalTests }, () => ({
        category: undefined,
        weightPercent: undefined,
      }));
      form.setFieldsValue({ criteria: initialCriteria });
    }
  }, [form, configuration]);

  // 🟡 Force requiredTestCount = 0 nếu là loại không cần test
  useEffect(() => {
    criteria.forEach((item, index) => {
      const isDisabled = [
        AssessmentCategory.Presentation,
        AssessmentCategory.Attendance,
        AssessmentCategory.Assignment,
        AssessmentCategory.ClassParticipation
      ].includes(item?.category);

      if (isDisabled && item?.requiredTestCount !== 0) {
        form.setFieldValue(['criteria', index, 'requiredTestCount'], 0);
      }
    });
  }, [criteria]);

  return (
    <Card title="Thiết lập tiêu chí đánh giá">
      <Form.List name="criteria">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => {
              const currentCategory = form.getFieldValue(['criteria', name, 'category']);
              const isRequiredTestCountDisabled = [
                AssessmentCategory.Presentation,
                AssessmentCategory.Attendance,
                AssessmentCategory.Assignment,
                AssessmentCategory.ClassParticipation
              ].includes(currentCategory);

              const selectedCategories = (form.getFieldValue(['criteria']) || [])
                .map((item, idx) => idx !== name ? item?.category : undefined)
                .filter(v => v !== undefined);

              return (
                <Row key={key} gutter={16} align="middle" className="mb-8">
                  <Col xs={24} sm={6} md={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'category']}
                      rules={[{ required: true, message: 'Chọn loại đánh giá' }]}
                    >
                      <Select placeholder="Loại đánh giá">
                        <Option value={AssessmentCategory.Quiz} disabled={selectedCategories.includes(AssessmentCategory.Quiz)}>Quiz</Option>
                        <Option value={AssessmentCategory.Presentation} disabled={selectedCategories.includes(AssessmentCategory.Presentation)}>Presentation</Option>
                        <Option value={AssessmentCategory.Midterm} disabled={selectedCategories.includes(AssessmentCategory.Midterm)}>Midterm</Option>
                        <Option value={AssessmentCategory.Final} disabled={selectedCategories.includes(AssessmentCategory.Final)}>Final</Option>
                        <Option value={AssessmentCategory.Attendance} disabled={selectedCategories.includes(AssessmentCategory.Attendance)}>Attendance</Option>
                        <Option value={AssessmentCategory.ClassParticipation} disabled={selectedCategories.includes(AssessmentCategory.ClassParticipation)}>ClassParticipation</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={4} md={3}>
                    <Form.Item
                      {...restField}
                      name={[name, 'weightPercent']}
                      rules={[
                        { required: true, message: 'Nhập trọng số' },
                        { type: 'number', min: 0, max: 100, message: 'Trọng số từ 0 đến 100' }
                      ]}
                    >
                      <InputNumber min={0} max={100} step={1} className="w-full" placeholder="%" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={4} md={3}>
                    <Form.Item
                      {...restField}
                      name={[name, 'requiredTestCount']}
                      rules={[
                        { required: true, message: 'Nhập số lượng bài kiểm tra' },
                        { type: 'number', min: 0, message: 'Tối thiểu 0' }
                      ]}
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        placeholder="Số bài"
                        disabled={isRequiredTestCountDisabled}
                        onChange={(val) => {
                          const finalVal = isRequiredTestCountDisabled ? 0 : val;
                          form.setFieldValue(['criteria', name, 'requiredTestCount'], finalVal);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={6} md={6}>
                    <Form.Item
                      {...restField}
                      name={[name, 'note']}
                    >
                      <Input placeholder="Ghi chú" />
                    </Form.Item>
                  </Col>

                  <Col>
                    <Button type="link" danger onClick={() => remove(name)}>
                      Xóa
                    </Button>
                  </Col>
                </Row>
              );
            })}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                disabled={fields.length >= 6}
              >
                Thêm tiêu chí đánh giá
              </Button>
              {fields.length >= 6 && (
                <Typography.Text type="warning" className="text-[12px]">
                  Đã đạt tối đa 6 tiêu chí đánh giá!
                </Typography.Text>
              )}
            </Form.Item>
          </>
        )}
      </Form.List>

      <div className="mt-16">
        <Space>
          {isWeightValid ? (
            <CheckCircleOutlined style={{ color: 'green' }} />
          ) : (
            <ExclamationCircleOutlined className="text-red-500" />
          )}
          <Text strong style={{ color: isWeightValid ? 'green' : 'red' }}>
            Tổng trọng số: {totalWeight}% {isWeightValid ? '' : '(Phải bằng 100%)'}
          </Text>
        </Space>
      </div>
    </Card>
  );
};

export default AssessmentStep;
