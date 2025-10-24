import React, { useEffect, useState } from 'react';
import { Table, Input, InputNumber, Switch, Button, Typography, Spin } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../../config/api';
import Notification from '../../common/Notification';
import { style } from 'framer-motion/client';

const { Title } = Typography;

const typeMap = {
  int: 'number',
  string: 'text',
  bool: 'switch',
  password: 'password',
};

const SystemConfig = () => {
  const [allConfigs, setAllConfigs] = useState([]);
  const [editingValues, setEditingValues] = useState({});
  const [loadingKeys, setLoadingKeys] = useState([]); // array of keys being saved
  const [fetching, setFetching] = useState(false);
  const [notification, setNotification] = useState({ visible: false, type: 'success', message: '', description: '' });

  useEffect(() => {
    fetchAllConfigs();
  }, []);

  const fetchAllConfigs = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API_URL}${endpoints.systemConfig.getAll}`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setAllConfigs(res.data.data);
        // Khởi tạo giá trị editingValues từ data
        const initialValues = {};
        res.data.data.forEach(cfg => {
          initialValues[cfg.key] = parseValue(cfg.value, cfg.dataType);
        });
        setEditingValues(initialValues);
      } else {
        setAllConfigs([]);
        setNotification({ visible: true, type: 'error', message: 'Lỗi', description: 'Không lấy được danh sách cấu hình!' });
      }
    } catch (err) {
      setAllConfigs([]);
      setNotification({ visible: true, type: 'error', message: 'Lỗi', description: 'Lỗi khi lấy danh sách cấu hình!' });
    } finally {
      setFetching(false);
    }
  };

  // Chuyển đổi giá trị về đúng kiểu input
  const parseValue = (value, dataType) => {
    if (dataType === 'int') return Number(value);
    if (dataType === 'bool') return value === 'true' || value === true;
    return value;
  };

  const handleValueChange = (key, dataType, val) => {
    setEditingValues(prev => ({ ...prev, [key]: dataType === 'bool' ? val : val }));
  };

  const handleSave = async (record) => {
    setLoadingKeys(prev => [...prev, record.key]);
    try {
      const res = await axios.put(`${API_URL}${endpoints.systemConfig.update}`, {
        keyToUpdate: record.key,
        value: editingValues[record.key] !== undefined && editingValues[record.key] !== null ? editingValues[record.key].toString() : ''
      });
      setNotification({
        visible: true,
        type: res.data.success ? 'success' : 'error',
        message: res.data.message || (res.data.success ? 'Cập nhật thành công!' : 'Cập nhật thất bại!'),
        description: '',
      });
      if (res.data.success) {
        fetchAllConfigs(); // reload lại danh sách config để cập nhật value mới
      }
    } catch (err) {
      setNotification({
        visible: true,
        type: 'error',
        message: 'Lỗi',
        description: err?.response?.data?.message || 'Cập nhật thất bại!',
      });
    } finally {
      setLoadingKeys(prev => prev.filter(k => k !== record.key));
    }
  };

  const renderEditableCell = (record) => {
    const type = typeMap[record.dataType] || 'text';
    const value = editingValues[record.key];
    switch (type) {
      case 'number':
        return <InputNumber className="w-full" value={value} onChange={val => handleValueChange(record.key, record.dataType, val)} />;
      case 'switch':
        return <Switch checked={!!value} onChange={val => handleValueChange(record.key, record.dataType, val)} />;
      case 'password':
        return <Input.Password className="w-full" value={value} onChange={e => handleValueChange(record.key, record.dataType, e.target.value)} />;
      default:
        return <Input className="w-full" value={value} onChange={e => handleValueChange(record.key, record.dataType, e.target.value)} />;
    }
  };

  const columns = [
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      width: 180,
      render: (_, record) => renderEditableCell(record),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          loading={loadingKeys.includes(record.key)}
          onClick={() => handleSave(record)}
        >
          Lưu
        </Button>
      ),
    },
  ];

  return (
    <div style={{ margin: '0 auto', padding: 24 }}>
      <Notification
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification(n => ({ ...n, visible: false }))}
      />
      <Title level={2}>Cấu hình hệ thống</Title>
      {fetching ? (
        <Spin style={{ margin: '40px auto', display: 'block' }} />
      ) : (
        <Table
          dataSource={allConfigs}
          columns={columns}
          rowKey="key"
          pagination={false}
          bordered
        />
      )}
    </div>
  );
};

export default SystemConfig; 