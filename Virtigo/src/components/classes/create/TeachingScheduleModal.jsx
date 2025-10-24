import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Select, Tag, Spin, Alert } from 'antd';
import axios from 'axios';
import { API_URL } from '../../../config/api';

const weekDayMap = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  0: 'Chủ nhật',
};

const weekOrder = [1, 2, 3, 4, 5, 6, 0]; 

const TeachingScheduleModal = ({ open, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState('all');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}api/Account/teaching-schedule`)
      .then(res => setData(res.data.data))
      .catch(() => setError('Lỗi khi tải lịch dạy!'))
      .finally(() => setLoading(false));
  }, [open]);

  const lecturers = useMemo(() => {
    const map = {};
    data.forEach(item => {
      map[item.lecturerID] = item.lecturerName;
    });
    return Object.entries(map).map(([id, name]) => ({ value: id, label: name }));
  }, [data]);

  const selectOptions = [{ value: 'all', label: 'Tất cả giảng viên' }, ...lecturers];

  const timeSlots = useMemo(() => {
    const set = new Set();
    data.forEach(item => {
      set.add(item.startTime);
      set.add(item.endTime);
    });
    return Array.from(set).sort();
  }, [data]);

  const renderCell = (time, day) => {
    let lessons;
    if (selectedLecturer === 'all') {
      lessons = data.filter(
        item => item.teachingDay === Number(day) && item.startTime === time
      );
    } else {
      lessons = data.filter(
        item =>
          item.lecturerID === selectedLecturer &&
          item.teachingDay === Number(day) &&
          item.startTime === time
      );
    }
    if (lessons.length === 0) return null;
    return lessons.map((lesson, idx) => (
      <Tag color="blue" key={idx}>
        {selectedLecturer === 'all'
          ? `${lesson.lecturerName}: ${lesson.startTime} - ${lesson.endTime}`
          : `${lesson.startTime} - ${lesson.endTime}`}
      </Tag>
    ));
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Lịch dạy của giảng viên"
      width={900}
      style={{ top: 30 }}
    >
      {loading ? (
        <Spin tip="Đang tải lịch dạy..." />
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <>
          <div className="mb-16">
            <Select
              className="w-[300px]"
              value={selectedLecturer}
              onChange={setSelectedLecturer}
              options={selectOptions}
              placeholder="Chọn giảng viên"
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #eee', padding: 8, background: '#fafafa' }}>Giờ</th>
                  {weekOrder.map(day => (
                    <th key={day} style={{ border: '1px solid #eee', padding: 8, background: '#fafafa' }}>
                      {weekDayMap[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td style={{ border: '1px solid #eee', padding: 8, fontWeight: 500 }}>{time}</td>
                    {weekOrder.map(day => (
                      <td key={day} style={{ border: '1px solid #eee', padding: 8, minWidth: 100 }}>
                        {renderCell(time, day)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
};

export default TeachingScheduleModal;
