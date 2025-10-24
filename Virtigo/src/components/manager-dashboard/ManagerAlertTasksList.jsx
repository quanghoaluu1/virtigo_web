import React, { useEffect, useState } from 'react';
import { List, Tag, Tooltip, Skeleton } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const severityColor = {
  info: 'blue',
  warning: 'gold',
  urgent: 'red',
};

const ManagerAlertTasksList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlertTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + endpoints.dashboardManager.alertTask);
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching alert tasks:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertTasks();
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(24,144,255,0.04)', padding: 20, minHeight: 220 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#1890ff' }}>Danh sách cảnh báo</div>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(24,144,255,0.04)', padding: 20, minHeight: 220 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#1890ff' }}>Danh sách cảnh báo</div>
      <List
        dataSource={data}
        locale={{ emptyText: <span style={{ color: '#bbb' }}>Không có cảnh báo nào</span> }}
        renderItem={item => (
          <List.Item style={{ alignItems: 'flex-start', padding: '12px 0', border: 'none' }}>
            <div style={{ flex: 1 }}>
              <span className="text-[16px]">{item.message}</span>
              {item.deadline && (
                <Tooltip title="Hạn xử lý">
                  <Tag color="volcano" style={{ marginLeft: 8, fontWeight: 500 }}>
                    Hạn: {item.deadline}
                  </Tag>
                </Tooltip>
              )}
            </div>
            <Tag color={severityColor[item.severity]} style={{ fontWeight: 600, minWidth: 70, textAlign: 'center' }}>
              {item.severity === 'urgent' ? 'Khẩn cấp' : item.severity === 'warning' ? 'Cảnh báo' : 'Thông báo'}
            </Tag>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ManagerAlertTasksList; 