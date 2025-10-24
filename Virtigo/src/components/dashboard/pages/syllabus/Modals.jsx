import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const CategoryEnum = {
  0: 'Midterm',
  1: 'FifteenMinutes',
  2: 'Final',
  3: 'Other',
};

const TestTypeEnum = {
  0: 'MCQ',
  1: 'Writing',
  2: 'Speaking',
  3: 'Listening',
  4: 'Reading',
  5: 'Mix',
  6: 'Other'
};

export const SubjectModal = ({ visible, onOk, onCancel, form, initialValues }) => (
  <Modal
    title="Sửa môn học"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="Tên môn học"
        rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
      >
        <Input.TextArea rows={4} maxLength={255} />
      </Form.Item>
      <Form.Item
        name="minAverageScoreToPass"
        label="Điểm đạt"
        rules={[
          { required: true, message: 'Vui lòng nhập điểm đạt' },
          {
            validator: (_, value) =>
              value >= 0 && value <= 10
                ? Promise.resolve()
                : Promise.reject(new Error('Điểm phải nằm trong khoảng từ 0 đến 10')),
          },
        ]}
      >
        <Input
          type="number"
          min={0}
          max={10}
          step={0.1}
          onKeyDown={(e) => {
            // Ngăn nhập ký tự không hợp lệ như e, +, -
            if (['e', 'E', '+', '-'].includes(e.key)) {
              e.preventDefault();
            }
          }}
        />
      </Form.Item>
    </Form>
  </Modal>
);

export const SyllabusModal = ({ visible, onOk, onCancel, form, initialValues }) => (
  <Modal
    title="Sửa thông tin giáo trình"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
      >
        <TextArea rows={4} maxLength={255} />
      </Form.Item>
      <Form.Item
        name="note"
        label="Ghi chú"
      >
        <TextArea rows={4} maxLength={255} />
      </Form.Item>
      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
      >
        <Select>
          <Option value="Drafted">Bản nháp</Option>
          <Option value="Published">Đã xuất bản</Option>
          <Option value="Archived">Đã lưu trữ</Option>
        </Select>
      </Form.Item>
    </Form>
  </Modal>
);

export const AssessmentModal = ({ visible, onOk, onCancel, form, initialValues }) => {
  return (
    <Modal
      title={initialValues ? "Chỉnh sửa tiêu chí đánh giá" : "Thêm tiêu chí đánh giá"}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          name="category"
          label="Loại đánh giá"
          rules={[{ required: true, message: 'Vui lòng chọn loại đánh giá' }]}
        >
          <Select>
            {Object.entries(CategoryEnum).map(([value, label]) => (
              <Option key={value} value={parseInt(value)}>{label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="weightPercent"
          label="Trọng số (%)"
          rules={[{ required: true, message: 'Vui lòng nhập trọng số' }]}
        >
          <InputNumber min={0} max={100} className="w-full" />
        </Form.Item>

        <Form.Item
          name="requiredCount"
          label="Số lượng yêu cầu"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng yêu cầu' }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item
          name="duration"
          label="Thời gian (phút)"
          rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item
          name="testType"
          label="Loại bài kiểm tra"
          rules={[{ required: true, message: 'Vui lòng chọn loại bài kiểm tra' }]}
        >
          <Select>
            {Object.entries(TestTypeEnum).map(([value, label]) => (
              <Option key={value} value={parseInt(value)}>{label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="minPassingScore"
          label="Điểm đạt tối thiểu"
          rules={[{ required: true, message: 'Vui lòng nhập điểm đạt tối thiểu' }]}
        >
          <InputNumber min={0} max={10} className="w-full" />
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú"
        >
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const ScheduleModal = ({ visible, onOk, onCancel, form, initialValues, assessmentCriteriaOptions = [], testTypeOptions = [] }) => {
  const hasTest = Form.useWatch('hasTest', form);
  return (
    <Modal
      title={initialValues ? 'Sửa lịch trình' : 'Thêm lịch trình mới'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        {!(initialValues && initialValues.syllabusScheduleID) && (
          <>
            <Form.Item
              name="week"
              label="Tuần"
              rules={[{ required: true, message: 'Vui lòng nhập tuần' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item
              name="slot"
              label="Slot"
              rules={[{ required: true, message: 'Vui lòng nhập slot' }]}
            >
              <Input maxLength={50} />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="lessonTitle"
          label="Tiêu đề bài học"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài học' }]}
        >
          <Input maxLength={200} />
        </Form.Item>
        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <TextArea rows={4} maxLength={500} />
        </Form.Item>
        <Form.Item
          name="durationMinutes"
          label="Thời lượng (phút)"
          rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>
        <Form.Item
          name="resources"
          label="Tài nguyên"
          rules={[]}
        >
          <TextArea rows={2} placeholder="Nhập các tài nguyên, phân cách bằng dấu chấm phẩy (;)" />
        </Form.Item>
        <Form.Item
          name="hasTest"
          label="Có bài kiểm tra"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        {hasTest && (
          <>
            <Form.Item
              name="assessmentCriteriaID"
              label="Tiêu chí đánh giá"
              rules={[{ required: true, message: 'Vui lòng chọn tiêu chí đánh giá' }]}
            >
              <Select placeholder="Chọn tiêu chí">
                {assessmentCriteriaOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="testDurationMinutes"
              label="Thời lượng kiểm tra (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng kiểm tra' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item
              name="testType"
              label="Loại bài kiểm tra"
              rules={[{ required: true, message: 'Vui lòng chọn loại bài kiểm tra' }]}
            >
              <Select placeholder="Chọn loại bài kiểm tra">
                {testTypeOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

// Xóa môn học 
export const DeleteConfirmModal = ({ visible, onOk, onCancel }) => (
  <Modal
    title="Xác nhận xóa"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    okText="Xóa"
    cancelText="Hủy"
    okButtonProps={{ danger: true }}
  >
    <p>Bạn có chắc chắn muốn xóa môn học này?</p>
  </Modal>
); 