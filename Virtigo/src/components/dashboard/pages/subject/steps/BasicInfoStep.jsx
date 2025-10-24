import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Card, message, Row, Col } from 'antd';
import { subjectService } from '../../../../../services/subjectService';

const { TextArea } = Input;

const BasicInfoStep = ({ onNext, form, subjectId, isEditing }) => {
  useEffect(() => {
    if (isEditing && subjectId) {
      const fetchSubjectData = async () => {
        try {
          const response = await subjectService.getSubjectById(subjectId);
          form.setFieldsValue({
            name: response.subjectName,
            description: response.description,
            minAverageScoreToPass: response.minAverageScoreToPass
          });
        } catch (error) {
          console.error('Error fetching subject:', error);
          message.error('Không thể lấy thông tin môn học. Vui lòng thử lại.');
        }
      };
      fetchSubjectData();
    }
  }, [subjectId, isEditing, form]);

  const handleSubmit = async (values) => {
    try {
      const subjectData = {
        subjectName: values.name,
        description: values.description,
        minAverageScoreToPass: values.minAverageScoreToPass
      };

      if (isEditing && subjectId) {
        const updateData = {
          ...subjectData,
          subjectID: subjectId,
          createAt: new Date().toISOString()
        };
        const response = await subjectService.updateSubject(updateData);
        message.success('Cập nhật môn học thành công');
        onNext(response);
      } else {
        const response = await subjectService.createSubject(subjectData);
        message.success('Tạo môn học thành công');
        onNext(response);
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      message.error('Không thể lưu môn học. Vui lòng thử lại.');
    }
  };

  return (
    <Card
      title="Thông tin môn học"
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[
              { required: true, message: 'Vui lòng nhập tên môn học' },
              {
                validator: (_, value) => {
                  const trimmed = value?.trim();
                  if (!trimmed) {
                    return Promise.reject(new Error('Tên không được để trống hoặc chỉ chứa khoảng trắng'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="Nhập tên môn học..."
              onBlur={(e) => form.setFieldValue('name', e.target.value.trim())}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="minAverageScoreToPass"
            label="Điểm đầu ra (Sử dụng thang điểm 10)"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm đầu ra' },
              {
                validator: (_, value) =>
                  value >= 0 && value <= 10
                    ? Promise.resolve()
                    : Promise.reject(new Error('Điểm phải từ 0 đến 10')),
              },
            ]}
          >
            <InputNumber
              min={0}
              // max={10}
              step={0.1}
              className="w-full"
              placeholder="Nhập điểm đầu ra"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          { required: true, message: 'Vui lòng nhập mô tả' },
          {
            validator: (_, value) => {
              const trimmedDescription = value?.trim();
              const nameValue = form.getFieldValue('name')?.trim();

              if (!trimmedDescription) {
                return Promise.reject(new Error('Mô tả không được để trống hoặc chỉ chứa khoảng trắng'));
              }

              if (trimmedDescription === nameValue) {
                return Promise.reject(new Error('Mô tả không được trùng với tên môn học'));
              }

              if (trimmedDescription.length > 255) {
                return Promise.reject(new Error('Mô tả không được vượt quá 255 ký tự'));
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Nhập mô tả chi tiết về môn học..."
          onBlur={(e) => form.setFieldValue('description', e.target.value.trim())}
        />
      </Form.Item>
    </Card>
  );
};

export default BasicInfoStep;
