import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Card, message, Upload, Button } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL, endpoints } from '../../../../../config/api';

const ConfigurationStep = ({ onGenerateClassSlots, onImportError, hasImportedClassSlots, disableConfigEdit }) => {
  const [maxWeeks, setMaxWeeks] = useState(null);
  const [maxSlotsPerWeek, setMaxSlotsPerWeek] = useState(null);
  const [maxTotalMinutes, setMaxTotalMinutes] = useState(null);

  // Hàm xử lý upload file Excel
  const handleExcelUpload = async (file) => {
    const formData = new FormData();
    formData.append('File', file);

    try {
      const res = await axios.post(
        `${API_URL}api/ImportExcel/schedule/import/excel`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message || 'Nhập thời khóa biểu thành công!');
        if (onGenerateClassSlots) {
          onGenerateClassSlots(res.data.data);
        }
      } else {
        if (onImportError) {
          onImportError(res.data.message || 'Có lỗi khi nhập file Excel');
        } else {
          message.error(res.data.message || 'Có lỗi khi nhập file Excel');
        }
      }
    } catch (err) {
      if (onImportError) {
        onImportError('Không thể nhập file Excel');
      } else {
        message.error('Không thể nhập file Excel');
      }
    }
    return false; // Ngăn antd upload mặc định
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [weeksRes, slotsRes, minutesRes] = await Promise.all([
          axios.get(`${API_URL}${endpoints.systemConfig.getConfigByKey}max_total_weeks_allowed`),
          axios.get(`${API_URL}${endpoints.systemConfig.getConfigByKey}max_weekly_slots_allowed`),
          axios.get(`${API_URL}${endpoints.systemConfig.getConfigByKey}max_total_minutes_allowed`),
        ]);
        setMaxWeeks(weeksRes.data.data.value);
        setMaxSlotsPerWeek(slotsRes.data.data.value);
        setMaxTotalMinutes(minutesRes.data.data.value);
        // console.log(weeksRes,slotsRes,minutesRes)
      } catch (err) {
        message.error('Không thể tải cấu hình hệ thống');
      }
    };

    fetchConfig();
  }, []);

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Upload
          beforeUpload={handleExcelUpload}
          showUploadList={false}
          accept=".xlsx,.xls"
        >
          <Button icon={<UploadOutlined />}>Nhập thông tin buổi học từ file Excel</Button>
        </Upload>
        <Button
          type="default"
          icon={<DownloadOutlined />} // Thêm icon download
          onClick={async () => {
            try {
              const response = await fetch('https://9864a210fd0e.ngrok-free.app/api/ImportExcel/schedule/import/guide-doc', {
                method: 'GET',
                headers: {
                  'accept': '*/*',
                },
              });
              if (!response.ok) throw new Error('Không thể tải file hướng dẫn');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'import_schedule_guide.xlsx';
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              message.error('Không thể tải file hướng dẫn');
            }
          }}
        >
          Tải file hướng dẫn Excel
        </Button>
      </div>
      <Card>
        <Form.Item
          name="totalWeeks"
          label={
            maxWeeks !== null
              ? `Tổng số tuần (Tối đa: ${maxWeeks} tuần)`
              : 'Tổng số tuần'
          }
          rules={[
            !hasImportedClassSlots && { required: true, message: 'Vui lòng nhập tổng số tuần' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (maxWeeks !== null && value > maxWeeks) {
                  return Promise.reject(new Error(`Tối đa ${maxWeeks} tuần`));
                }
                return Promise.resolve();
              },
            }),
          ].filter(Boolean)}
        >
          <InputNumber min={1} placeholder="VD: 10" className="w-full" disabled={disableConfigEdit} />
        </Form.Item>

        <Form.Item
          name="slotsPerWeek"
          label={
            maxSlotsPerWeek !== null
              ? `Số slot mỗi tuần (Tối đa: ${maxSlotsPerWeek} slot/tuần)`
              : 'Số slot mỗi tuần'
          }
          rules={[
            !hasImportedClassSlots && { required: true, message: 'Vui lòng nhập số slot mỗi tuần' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (maxSlotsPerWeek !== null && value > maxSlotsPerWeek) {
                  return Promise.reject(new Error(`Tối đa ${maxSlotsPerWeek} slot mỗi tuần`));
                }
                return Promise.resolve();
              },
            }),
          ].filter(Boolean)}
        >
          <InputNumber min={1} placeholder="VD: 3" className="w-full" disabled={disableConfigEdit} />
        </Form.Item>

        <Form.Item
          name="defaultDuration"
          label={
            maxTotalMinutes !== null
              ? `Thời lượng mặc định mỗi tiết (Tổng tối đa: ${maxTotalMinutes} phút/slot)`
              : 'Thời lượng mặc định mỗi tiết'
          }
          rules={[
            !hasImportedClassSlots && { required: true, message: 'Vui lòng nhập thời lượng mặc định cho mỗi tiết' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const slots = getFieldValue('slotsPerWeek');
                if (
                  maxTotalMinutes !== null &&
                  slots &&
                  value > maxTotalMinutes
                ) {
                  return Promise.reject(
                    new Error(`Tổng thời lượng không vượt quá ${maxTotalMinutes} phút`)
                  );
                }
                return Promise.resolve();
              },
            }),
          ].filter(Boolean)}
        >
          <InputNumber min={1} placeholder="VD: 45" className="w-full" disabled={disableConfigEdit} />
        </Form.Item>
      </Card>
    </>
  );
};

export default ConfigurationStep;
