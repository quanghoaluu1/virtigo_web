import React, { useEffect, useState } from 'react';
import { Form, Input, Select } from 'antd';

const { Option } = Select;

// Enum cho nội dung kiểm tra
const TEST_CONTENT_OPTIONS = [
  { value: 'Vocabulary', label: 'Từ vựng' }, // 1
  { value: 'Grammar', label: 'Ngữ pháp' },   // 2
  { value: 'Listening', label: 'Nghe hiểu' }, // 3
  { value: 'Reading', label: 'Đọc hiểu' },   // 4
  { value: 'Writing', label: 'Viết' },       // 5
  { value: 'Mix', label: 'Tổng hợp' },       // 6
  { value: 'MCQ', label: 'Trắc nghiệm' },    // 7
  { value: 'Other', label: 'Khác' },         // 8
];

// Mapping enum value to label
const CATEGORY_LABELS = {
  Quiz: 'Đề kiểm tra đánh giá',
  Midterm: 'Đề thi giữa kì',
  Final: 'Đề thi cuối kì',
};

const ALLOWED_CATEGORIES = ['Quiz', 'Midterm', 'Final'];

// Map số sang enum string
const CATEGORY_ENUM_MAP = {
  0: 'Quiz',
  2: 'Midterm',
  3: 'Final'
};

const AssessmentBasicForm = React.forwardRef(({ subjects = [], formData = {}, onChange, categoryOptions = [], onSubjectChange }, ref) => {
  const [form] = Form.useForm();
  const [category, setCategory] = useState(formData.Category || undefined);

  useEffect(() => {
    form.setFieldsValue(formData || {});
    setCategory(formData.Category || undefined);
  }, [formData, form]);

  const handleValuesChange = (_, allValues) => {
    onChange && onChange(allValues);
    if (allValues.Category !== undefined) {
      setCategory(allValues.Category);
      if (allValues.Category === 'Final' || allValues.Category === 'Midterm') {
        form.setFieldsValue({ testType: 'Mix' });
      }
    }
  };

  React.useImperativeHandle(ref, () => ({
    validate: () => form.validateFields(),
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formData}
      onValuesChange={handleValuesChange}
      ref={ref}
    >
      {/* Môn học lên trên */}
      <Form.Item
        label="Tên bài kiểm tra"
        name="TestName"
        rules={[{ required: true, message: 'Vui lòng nhập tên bài kiểm tra' }]}
      >
        <Input placeholder="Nhập tên bài kiểm tra" />
      </Form.Item>

      <Form.Item
        label="Môn học"
        name="SubjectID"
        rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
      >
        <Select placeholder="Chọn môn học" onChange={onSubjectChange} allowClear>
          {subjects && subjects.map(sub => (
            <Option key={sub.SubjectID || sub.subjectID} value={sub.SubjectID || sub.subjectID}>
              {sub.SubjectName || sub.subjectName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Phân loại"
        name="Category"
        rules={[{ required: true, message: 'Vui lòng chọn phân loại' }]}
      >
        <Select placeholder="Chọn phân loại" disabled={categoryOptions.length === 0} allowClear>
          {categoryOptions.map(cat => (
            <Option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</Option>
          ))}
        </Select>
      </Form.Item>

      

      <Form.Item
        label="Nội dung kiểm tra"
        name="testType"
        rules={[{ required: true, message: 'Vui lòng chọn nội dung kiểm tra' }]}
      >
        <Select placeholder="Chọn nội dung kiểm tra">
          {(category === 'Final' || category === 'Midterm') ? (
            <Option key="Mix" value="Mix">Tổng hợp</Option>
          ) : (
            TEST_CONTENT_OPTIONS.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))
          )}
        </Select>
      </Form.Item>

      
    </Form>
  );
});

export default AssessmentBasicForm;

