import React from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import dayjs from 'dayjs';

const EditGradeModal = ({
  visible,
  onCancel,
  onOk,
  selectedRecord,
  form,
  title = "Chỉnh sửa điểm",
  showClassInfo = false
}) => {
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newAverage = ((values.midterm + values.final) / 2).toFixed(1);
      const newStatus = newAverage >= 7.0 ? 'Pass' : 'Fail';
      
      const updatedRecord = {
        ...selectedRecord,
        ...values,
        average: parseFloat(newAverage),
        status: newStatus,
        lastUpdated: dayjs().format('YYYY-MM-DD')
      };
      
      onOk(updatedRecord);
      message.success('Cập nhật điểm thành công!');
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Vui lòng kiểm tra lại thông tin!');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Lưu"
      cancelText="Hủy"
      width={500}
      destroyOnClose
    >
      {selectedRecord && (
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
            Học sinh: {selectedRecord.fullName}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            Mã HS: {selectedRecord.studentId}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            Email: {selectedRecord.email}
          </p>
          {showClassInfo && selectedRecord.className && (
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              Lớp: {selectedRecord.className}
            </p>
          )}
          {showClassInfo && selectedRecord.lecturerName && (
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              Giảng viên: {selectedRecord.lecturerName}
            </p>
          )}
        </div>
      )}
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="attendance"
          label="Điểm danh (%)"
          rules={[
            { required: true, message: 'Vui lòng nhập điểm danh!' },
            { type: 'number', min: 0, max: 100, message: 'Điểm danh phải từ 0-100%!' }
          ]}
        >
          <InputNumber 
            min={0} 
            max={100} 
            className="w-full" 
            placeholder="Nhập tỷ lệ điểm danh"
            addonAfter="%"
          />
        </Form.Item>
        
        <Form.Item
          name="midterm"
          label="Điểm giữa kỳ"
          rules={[
            { required: true, message: 'Vui lòng nhập điểm giữa kỳ!' },
            { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0-10!' }
          ]}
        >
          <InputNumber 
            min={0} 
            max={10} 
            step={0.1} 
            className="w-full" 
            placeholder="Nhập điểm giữa kỳ"
            addonAfter="/ 10"
          />
        </Form.Item>
        
        <Form.Item
          name="final"
          label="Điểm cuối kỳ"
          rules={[
            { required: true, message: 'Vui lòng nhập điểm cuối kỳ!' },
            { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0-10!' }
          ]}
        >
          <InputNumber 
            min={0} 
            max={10} 
            step={0.1} 
            className="w-full" 
            placeholder="Nhập điểm cuối kỳ"
            addonAfter="/ 10"
          />
        </Form.Item>
        
        <div style={{ 
          padding: 12, 
          backgroundColor: '#e6f7ff', 
          borderRadius: 6, 
          border: '1px solid #91d5ff',
          marginTop: 16
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
            <strong>Lưu ý:</strong> Điểm trung bình sẽ được tính tự động = (Giữa kỳ + Cuối kỳ) / 2
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
            Học sinh đạt khi điểm trung bình ≥ 7.0
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default EditGradeModal; 