import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Typography, Button } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, MinusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const statusMap = {
  0: { icon: <CheckCircleTwoTone twoToneColor="#52c41a" />, color: 'green' }, // Present
  1: { icon: <CloseCircleTwoTone twoToneColor="#ff4d4f" />, color: 'red' },   // Absence
  2: { icon: <MinusOutlined />, color: 'default' },                           // NotAvailable
};

const AttendancePage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const classId = props.classId || location.state?.classId;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    axios.get(`${API_URL}api/Attendance/get-by-class-id/${classId}`)
      .then(res => {
        setData(res.data.data?.lessonAttendances || []);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  if (!classId) return <div style={{ textAlign: 'center', marginTop: 60, color: 'red' }}>Không tìm thấy classId!</div>;
  if (loading) return <div style={{ textAlign: 'center', marginTop: 60 }}><Spin size="large" /></div>;
  if (!data.length) return <div style={{ textAlign: 'center', marginTop: 60 }}>Không có dữ liệu điểm danh.</div>;

  // 1. Lấy danh sách tất cả học viên (unique)
  const studentMap = {};
  data.forEach(lesson => {
    lesson.studentAttendanceRecords.forEach(record => {
      if (!studentMap[record.studentID]) {
        studentMap[record.studentID] = {
          studentID: record.studentID,
          studentName: record.studentName,
        };
      }
    });
  });
  const students = Object.values(studentMap);

  // 2. Lấy danh sách slot/lesson
  const lessons = data.map((lesson, idx) => ({
    lessonID: lesson.lessonID,
    slot: idx + 1,
  }));

  // 3. Tạo dataSource cho table
  const tableData = students.map(student => {
    const row = {
      key: student.studentID,
      studentName: student.studentName,
    };
    lessons.forEach((lesson, idx) => {
      // Tìm trạng thái điểm danh của học viên này ở slot này
      const lessonObj = data[idx];
      const record = lessonObj.studentAttendanceRecords.find(r => r.studentID === student.studentID);
      row[`slot_${idx}`] = record ? statusMap[record.attendanceStatus].icon : <MinusOutlined />;
    });
    return row;
  });

  // 4. Tạo columns cho table
  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      key: 'studentName',
      fixed: 'left',
      width: 90,
    },
    ...lessons.map((lesson, idx) => ({
      title: `Slot ${lesson.slot}`,
      dataIndex: `slot_${idx}`,
      key: `slot_${idx}`,
      align: 'center',
      width: 60,
    })),
  ];

  return (
    <div style={{ margin: '0 auto', padding: 24, minHeight: '100vh', boxSizing: 'border-box', background: '#fff' }}>
      <Button onClick={() => navigate(-1)} className="mb-24">
        ← Quay lại
      </Button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Title level={3} className="m-0">Bảng điểm danh lớp</Title>
        <Button
          type="primary"
          onClick={async () => {
            try {
              const res = await axios.get(`${API_URL}api/ExportExcel/export-attendance/${classId}`, {
                responseType: 'blob',
              });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `attendance_${classId}.xlsx`);
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (err) {
              alert('Xuất file thất bại!');
            }
          }}
        >
          Xuất file điểm danh
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        bordered
        pagination={false}
        scroll={{ x: true }}
        size="middle"
      />
    </div>
  );
};

export default AttendancePage; 