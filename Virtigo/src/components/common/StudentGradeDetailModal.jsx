import React from 'react';
import { Modal, Tag, Descriptions, Progress, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const StudentGradeDetailModal = ({
  visible,
  onCancel,
  studentRecord,
  showClassInfo = false
}) => {
  if (!studentRecord) return null;

  const getStatusColor = (status) => {
    return status === 'Pass' ? 'green' : 'red';
  };

  const getScoreColor = (score) => {
    if (score >= 9.0) return '#52c41a';
    if (score >= 8.0) return '#1890ff';
    if (score >= 7.0) return '#faad14';
    return '#ff4d4f';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 80) return '#52c41a';
    if (attendance >= 70) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Modal
      title={`Chi tiết điểm của ${studentRecord.fullName}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        {/* Student Information */}
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #e9ecef'
        }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
            Thông tin học sinh
          </Title>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã học sinh">
              <Text strong>{studentRecord.studentId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              <Text strong>{studentRecord.fullName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Text>{studentRecord.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Text>{studentRecord.phoneNumber}</Text>
            </Descriptions.Item>
            {showClassInfo && studentRecord.className && (
              <Descriptions.Item label="Lớp" span={2}>
                <Text strong>{studentRecord.className}</Text>
              </Descriptions.Item>
            )}
            {showClassInfo && studentRecord.lecturerName && (
              <Descriptions.Item label="Giảng viên" span={2}>
                <Text strong>{studentRecord.lecturerName}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Grade Information */}
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          backgroundColor: '#fff', 
          borderRadius: 8,
          border: '1px solid #d9d9d9'
        }}>
          <Title level={4} style={{ margin: '0 0 16px 0', color: '#722ed1' }}>
            Thông tin điểm
          </Title>
          
          {/* Attendance */}
          <div className="mb-16">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Điểm danh:</Text>
              <Text strong style={{ color: getAttendanceColor(studentRecord.attendance) }}>
                {studentRecord.attendance}%
              </Text>
            </div>
            <Progress 
              percent={studentRecord.attendance} 
              strokeColor={getAttendanceColor(studentRecord.attendance)}
              showInfo={false}
            />
          </div>

          {/* Grades */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ 
              padding: 12, 
              backgroundColor: '#f6ffed', 
              borderRadius: 6, 
              border: '1px solid #b7eb8f',
              textAlign: 'center'
            }}>
              <Text type="secondary">Điểm giữa kỳ</Text>
              <div>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '24px', 
                    color: getScoreColor(studentRecord.midterm) 
                  }}
                >
                  {studentRecord.midterm}
                </Text>
                <Text type="secondary"> / 10</Text>
              </div>
            </div>

            <div style={{ 
              padding: 12, 
              backgroundColor: '#f0f5ff', 
              borderRadius: 6, 
              border: '1px solid #91d5ff',
              textAlign: 'center'
            }}>
              <Text type="secondary">Điểm cuối kỳ</Text>
              <div>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '24px', 
                    color: getScoreColor(studentRecord.final) 
                  }}
                >
                  {studentRecord.final}
                </Text>
                <Text type="secondary"> / 10</Text>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div style={{ 
            marginTop: 16, 
            padding: 16, 
            backgroundColor: '#fff7e6', 
            borderRadius: 6, 
            border: '1px solid #ffd591',
            textAlign: 'center'
          }}>
            <Text type="secondary">Điểm trung bình</Text>
            <div>
              <Text 
                strong 
                style={{ 
                  fontSize: '32px', 
                  color: getScoreColor(studentRecord.average) 
                }}
              >
                {studentRecord.average.toFixed(1)}
              </Text>
              <Text type="secondary" className="text-base"> / 10</Text>
            </div>
          </div>

          {/* Status */}
          <div style={{ 
            marginTop: 16, 
            textAlign: 'center',
            padding: 12,
            backgroundColor: getStatusColor(studentRecord.status) === 'green' ? '#f6ffed' : '#fff2f0',
            borderRadius: 6,
            border: `1px solid ${getStatusColor(studentRecord.status) === 'green' ? '#b7eb8f' : '#ffccc7'}`
          }}>
            <Text strong className="text-base">Trạng thái: </Text>
            <Tag 
              color={getStatusColor(studentRecord.status)} 
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              {studentRecord.status === 'Pass' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
            </Tag>
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ 
          padding: 12, 
          backgroundColor: '#f0f9ff', 
          borderRadius: 6, 
          border: '1px solid #91d5ff'
        }}>
          <Text type="secondary">
            <strong>Cập nhật lần cuối:</strong> {dayjs(studentRecord.lastUpdated).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default StudentGradeDetailModal; 