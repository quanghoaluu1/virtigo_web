import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import RevenueByMonthLineChart from '../../components/charts/RevenueByMonthLineChart';
import LecturerRevenuePieChart from '../../components/charts/LecturerRevenuePieChart';
import PaymentTable from '../../components/analytics/PaymentTable';

const { Title } = Typography;

const mockLecturerRevenue = [
  { lecturerName: 'Nguyen Van A', totalRevenue: 12000000 },
  { lecturerName: 'Tran Thi B', totalRevenue: 9000000 },
  { lecturerName: 'Le Van C', totalRevenue: 7000000 },
  { lecturerName: 'Pham Thi D', totalRevenue: 5000000 },
];

const IncomeManagement = () => {
  return (
    <div>
      <Title level={2} className="mb-24">Quản lí thu nhập</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu theo tháng" bordered={false}>
            <RevenueByMonthLineChart />
          </Card>
        </Col>
        {/* <Col xs={24} lg={8}>
          <Card title="Yêu cầu hoàn tiền (RequestRefund)" bordered={false}>
            <PaymentTable onlyRequestRefund />
          </Card>
        </Col> */}
      </Row>
      <div className="mt-32">
        <PaymentTable />
      </div>
    </div>
  );
};

export default IncomeManagement; 