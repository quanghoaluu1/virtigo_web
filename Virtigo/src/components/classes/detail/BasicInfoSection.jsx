import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Alert, Row, Col } from 'antd';
import axios from 'axios';
import { API_URL } from '../../../config/api';

const statusMap = {
  0: 'Chưa công khai',
  1: 'Đang tuyển sinh',
  2: 'Đang dạy',
  3: 'Hoàn thành',
  4: 'Không hoạt động',
};

const fetchClassDetail = async (classId) => {
  const res = await axios.get(`${API_URL}api/Class/get-by-id?id=${classId}`);
  return res.data;
};

const BasicInfoSection = ({ classId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    fetchClassDetail(classId)
      .then(res => {
        setData(res);
        console.log('Class detail:', res);
      })
      .catch(() => setError('Không thể tải thông tin lớp học'))
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <Card
      className="mb-16"
      bodyStyle={{ padding: collapsed ? 0 : 24 }}
      title={
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <span>Thông tin cơ bản</span>
          <span>{collapsed ? '▼' : '▲'}</span>
        </div>
      }
    >
      {!collapsed && (
        loading ? (
          <Spin tip="Đang tải thông tin lớp..." />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : !data ? null : (
          <Row gutter={16}>
            <Col span={16}>
              <Descriptions column={1}>
                <Descriptions.Item label="Tên lớp">{data.className}</Descriptions.Item>
                <Descriptions.Item label="Giáo viên">{data.lecturerName}</Descriptions.Item>
                <Descriptions.Item label="Môn học">{data.subjectName}</Descriptions.Item>
                <Descriptions.Item label="Sĩ số">
                  {data.numberStudentEnroll} / {data.maxStudentAcp}
                </Descriptions.Item>
                <Descriptions.Item label="Học phí">
                  {data.priceOfClass?.toLocaleString('vi-VN')} VNĐ
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu dự kiến">
                  {new Date(data.teachingStartTime).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {statusMap[data.status] || 'Không xác định'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={data.imageURL}
                  alt="Ảnh lớp"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                />
              </div>
            </Col>
          </Row>
        )
      )}
    </Card>
  );
};

export default BasicInfoSection; 