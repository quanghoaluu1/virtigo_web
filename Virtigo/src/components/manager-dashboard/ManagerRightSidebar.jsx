import React, { useEffect, useState } from "react";
import { Card, List, Typography, Divider, Spin } from "antd";
import {
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL, endpoints } from '../../config/api';

const { Text, Title } = Typography;

const ManagerRightSidebar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}${endpoints.dashboardManager.rightSidebar}`);
        if (response.data && (response.data.success === undefined || response.data.success)) {
          setData(response.data.data || response.data); // tuỳ backend trả về
        } else {
          // message.error(response.data.message || 'Không thể tải dữ liệu sidebar');
          console.error(response.data.message || 'Không thể tải dữ liệu sidebar');
        }
      } catch (error) {
        // message.error('Lỗi khi tải dữ liệu sidebar');
        console.error('Lỗi khi tải dữ liệu sidebar', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div style={{
      width: 320,
      padding: '24px 18px',
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 4px 16px 0 rgba(24, 144, 255, 0.07)',
      minHeight: 400,
      color: '#222',
      fontFamily: 'inherit',
      height: 'fit-content',
      overflowY: 'auto',
      border: '1px solid #f0f0f0',
    }}>
      <Title level={4} style={{ color: '#1890ff', fontWeight: 700, marginBottom: 18,textAlign: 'center' }}>Tổng quan hôm nay</Title>

      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 12,
          border: '1px solid #f0f0f0',
          background: '#f8fbff',
          textAlign: 'center' // Thêm dòng này
        }}
      >
        <Text style={{fontWeight:'bolder', color: '#222' }}>
          <CalendarOutlined className="text-blue-500" /> Số lớp học hôm nay:
        </Text>
        <Title level={3} style={{ color: '#1890ff', margin: 0 }}>{data.todayClasses}</Title>
      </Card>

      <Card size="small" style={{
          marginBottom: 12,
          borderRadius: 12,
          border: '1px solid #f0f0f0',
          background: '#f8fbff',
          textAlign: 'center' // Thêm dòng này
        }}>
        <Text style={{fontWeight:'bolder', color: '#222' }}><FileTextOutlined className="text-blue-500" /> Bài kiểm tra hôm nay:</Text>
        <Title level={3} style={{ color: '#1890ff', margin: 0 }}>{data.todayTests}</Title>
      </Card>

      <Divider orientation="left" style={{ color: '#1890ff', fontWeight: 600, borderColor: '#e6f4ff' }}>
        ⏱ Lớp đủ điều kiện chốt DS
      </Divider>
      <List
        size="small"
        dataSource={data.eligibleClassForOpening}
        locale={{emptyText: <span style={{ color: '#bbb' }}>Không có lớp nào đủ điều kiện</span>}}
        renderItem={(item) => (
          <List.Item key={item.ClassID} style={{ border: 'none', padding: '4px 0' }}>
            <Text style={{ color: '#222' }}>
              <ExclamationCircleOutlined className="text-yellow-500" /> {item.ClassName} - {item.StudentCount} HV (bắt đầu: {item.TeachingStartTime ? new Date(item.TeachingStartTime).toLocaleDateString() : ''})
            </Text>
          </List.Item>
        )}
      />

      <Divider orientation="left" style={{ color: '#1890ff', fontWeight: 600, borderColor: '#e6f4ff' }}>
        📆 Lớp sắp mở chưa đủ sĩ số
      </Divider>
      <List
        size="small"
        dataSource={data.classNearOpenButNotReady}
        locale={{emptyText: <span style={{ color: '#bbb' }}>Không có lớp nào gần tới hạn</span>}}
        renderItem={(item) => (
          <List.Item key={item.ClassID} style={{ border: 'none', padding: '4px 0' }}>
            <Text style={{ color: '#222' }}>
              <ClockCircleOutlined className="text-blue-500" /> {item.ClassName} ({item.StudentCount}/{item.MinStudentAcpt} HV, bắt đầu: {item.TeachingStartTime ? new Date(item.TeachingStartTime).toLocaleDateString() : ''})
            </Text>
          </List.Item>
        )}
      />

      <Divider orientation="left" style={{ color: '#1890ff', fontWeight: 600, borderColor: '#e6f4ff' }}>
        📝 Gán đề cho buổi kiểm tra
      </Divider>
      <List
        size="small"
        dataSource={data.testEventsNeedingTestID}
        locale={{emptyText: <span style={{ color: '#bbb' }}>Không có buổi kiểm tra nào cần gán đề</span>}}
        renderItem={(item) => (
          <List.Item key={item.testEventID} style={{ border: 'none', padding: '4px 0' }}>
            <Text style={{ color: '#222' }}>
              <FileSearchOutlined style={{ color: "#cf1322" }} /> {item.subjectName} ({item.timeLessonStart ? new Date(item.timeLessonStart).toLocaleString() : ''})
            </Text>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ManagerRightSidebar;
