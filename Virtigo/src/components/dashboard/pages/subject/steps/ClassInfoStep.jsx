import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Input, Card, Divider, Table, Button, Space, Select } from 'antd';
import Notification from '../../../../common/Notification';
import axios from 'axios';
import { API_URL, endpoints } from '../../../../../config/api';

const { TextArea } = Input;

const ClassInfoStep = ({ classSlots, editingSlot, setEditingSlot, handleEditSlot, handleUpdateSlot, editForm }) => {
  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    type: 'error',
    message: '',
    description: '',
  });

  // Config state
  const [maxWeeks, setMaxWeeks] = useState(null);
  const [maxSlotsPerWeek, setMaxSlotsPerWeek] = useState(null);
  const [maxTotalMinutes, setMaxTotalMinutes] = useState(null);

  // Lesson details state
  const [lessonDetails, setLessonDetails] = useState([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [weeksRes, slotsRes, minutesRes] = await Promise.all([
          axios.get(`${API_URL}${endpoints.systemConfig.getConfigByKey}max_total_weeks_allowed`),
          axios.get(`${API_URL}${endpoints.systemConfig.getConfigByKey}max_weekly_slots_allowed`),
          axios.get(`${API_URL}${endpoints.systemConfig.getConfigByKey}max_total_minutes_allowed`),
        ]);
        setMaxWeeks(Number(weeksRes.data.data.value));
        setMaxSlotsPerWeek(Number(slotsRes.data.data.value));
        setMaxTotalMinutes(Number(minutesRes.data.data.value));
      } catch (err) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Không thể tải cấu hình hệ thống',
          description: err?.message || '',
        });
      }
    };
    fetchConfig();
  }, []);

  // Fetch lesson details
  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}api/LessonDetails`);
        setLessonDetails(response.data.data || response.data || []);
      } catch (err) {
        setNotification({
          visible: true,
          type: 'error',
          message: 'Không thể tải danh sách tài nguyên',
          description: err?.message || '',
        });
      }
    };
    fetchLessonDetails();
  }, []);

  // Tính rowSpan cho cột "Tuần"
  const mergedData = () => {
    const weekRowSpanMap = {};
    classSlots.forEach((item, index) => {
      const week = item.week;
      if (weekRowSpanMap[week] !== undefined) {
        weekRowSpanMap[week]++;
      } else {
        weekRowSpanMap[week] = 1;
      }
    });

    const renderedSlots = [];
    const seenWeeks = new Set();
    let cursor = 0;

    for (let i = 0; i < classSlots.length; i++) {
      const item = { ...classSlots[i] };
      const currentWeek = item.week;

      if (!seenWeeks.has(currentWeek)) {
        item.rowSpan = weekRowSpanMap[currentWeek];
        seenWeeks.add(currentWeek);
      } else {
        item.rowSpan = 0;
      }

      renderedSlots.push(item);
    }

    return renderedSlots;
  };

  // Validate config khi lưu slot
  const validateConfig = (slots) => {
    // Số tuần
    const weeks = [...new Set(slots.map(slot => slot.week))];
    if (maxWeeks && weeks.length > maxWeeks) {
      setNotification({
        visible: true,
        type: 'error',
        message: `Vượt quá số tuần cho phép`,
        description: `Số tuần là ${weeks.length}, tối đa cho phép là ${maxWeeks}`,
      });
      return false;
    }
    // Số slot mỗi tuần
    const weekSlotMap = {};
    slots.forEach(slot => {
      weekSlotMap[slot.week] = (weekSlotMap[slot.week] || 0) + 1;
    });
    const weekSlotErrors = Object.entries(weekSlotMap).filter(([week, count]) => count > maxSlotsPerWeek);
    if (maxSlotsPerWeek && weekSlotErrors.length > 0) {
      setNotification({
        visible: true,
        type: 'error',
        message: `Vượt quá số slot mỗi tuần`,
        description: weekSlotErrors.map(([week, count]) => `Tuần ${week} có ${count} slot, tối đa ${maxSlotsPerWeek}`).join(', '),
      });
      return false;
    }
    // Thời lượng từng slot
    const slotDurationErrors = slots.filter(slot => Number(slot.durationMinutes || 0) > maxTotalMinutes);
    if (maxTotalMinutes && slotDurationErrors.length > 0) {
      setNotification({
        visible: true,
        type: 'error',
        message: `Vượt quá thời lượng cho phép của slot`,
        description: slotDurationErrors.map(slot => `Slot ${slot.slot} có thời lượng ${slot.durationMinutes} phút, tối đa ${maxTotalMinutes} phút`).join(', '),
      });
      return false;
    }
    return true;
  };

  // Sửa lại handleUpdateSlot để validate trước khi lưu
  const handleUpdateSlotWithValidate = () => {
    const updatedValues = editForm.getFieldsValue();
    const updatedSlots = classSlots.map(slot =>
      slot.slot === editingSlot.slot
        ? { ...slot, ...updatedValues }
        : slot
    );
    if (!validateConfig(updatedSlots)) return;
    handleUpdateSlot();
  };

  const columns = [
    {
      title: 'Tuần',
      dataIndex: 'week',
      key: 'week',
      width: '10%',
      render: (text, row) => ({
        children: text,
        props: { rowSpan: row.rowSpan },
      }),
    },
    {
      title: 'Tiết',
      dataIndex: 'slot',
      key: 'slot',
      width: '10%',
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) =>
        editingSlot?.slot === record.slot ? (
          <Form form={editForm} component={false}>
            <Form.Item
              name="title"
              className="m-0"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        ) : (
          text
        ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) =>
        editingSlot?.slot === record.slot ? (
          <Form form={editForm} component={false}>
            <Form.Item
              name="content"
              className="m-0"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        ) : (
          text
        ),
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      width: '15%',
      render: (text, record) =>
        editingSlot?.slot === record.slot ? (
          <Form form={editForm} component={false}>
            <Form.Item
              name="durationMinutes"
              className="m-0"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </Form>
        ) : (
          text
        ),
    },
    {
      title: 'Tài nguyên',
      dataIndex: 'resources',
      key: 'resources',
      ellipsis: true,
      render: (text, record) => {
        // Find the lesson detail title by ID
        const selectedLessonDetail = lessonDetails.find(detail => detail.lessonDetailID === text);
        const displayText = selectedLessonDetail ? selectedLessonDetail.title : text;
        console.log('selectedLessonDetail:', selectedLessonDetail);
        console.log('render Select:', text, lessonDetails.map(d => d.lessonDetailID));
        return editingSlot?.slot === record.slot ? (
          <Form form={editForm} component={false}>
            <Form.Item key={editingSlot?.slot} name="resources" className="m-0" initialValue={text}>
              <Select
                placeholder="Chọn tài nguyên"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={lessonDetails.map(detail => ({
                  value: detail.lessonDetailID,
                  label: detail.title,
                }))}
              />
            </Form.Item>
          </Form>
          
        ) : (
          displayText
        );
        
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space>
          {editingSlot?.slot === record.slot ? (
            <>
              <Button type="primary" onClick={handleUpdateSlotWithValidate}>
                Lưu
              </Button>
              <Button onClick={() => setEditingSlot(null)}>Hủy</Button>
            </>
          ) : (
            <Button type="primary" onClick={() => handleEditSlot(record)}>
              Chỉnh sửa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Divider>Danh sách tiết học</Divider>
      <Table
        dataSource={mergedData()}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="slot"
      />
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification(n => ({ ...n, visible: false }))}
      />
    </Card>
  );
};

export default ClassInfoStep;
