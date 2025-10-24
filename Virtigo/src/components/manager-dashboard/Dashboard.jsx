import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, MessageOutlined } from '@ant-design/icons';
import SystemConfig from '../dashboard/pages/SystemConfig';
import ManagerRightSidebar from './ManagerRightSidebar';
import DashboardSummaryCards from './DashboardSummaryCards'
import ClassCountBySubjectBarChart from '../charts/ClassCountBySubjectBarChart';
import StudentSignupMonthlyAreaChart from '../charts/StudentSignupMonthlyAreaChart';
import RevenueByMonthLineChart from '../charts/RevenueByMonthLineChart';
import ClassStatusDistributionPieChart from '../charts/ClassStatusDistributionPieChart';
import ManagerAlertTasksList from './ManagerAlertTasksList';
const Dashboard = () => {
  return (
    <div style={{ padding: '24px 0 0 0' }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 24 }}>Bảng điều khiển</h1>
      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <DashboardSummaryCards/>
          {/* Charts Grid */}
          <div className="mt-32">
            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
              <RevenueByMonthLineChart />
             
              </Col>
              <Col xs={24} md={12}>
              <ClassCountBySubjectBarChart />
               
              </Col>
              <Col xs={24} md={12}>
              <ClassStatusDistributionPieChart />
              </Col>
              <Col xs={24} md={12}>
              <StudentSignupMonthlyAreaChart />
              </Col>
            </Row>
          </div>
          {/* <ManagerAlertTasksList/> */}
        </div>
        {/* Right Sidebar */}
        <div style={{ minWidth: 320 }}>
          <ManagerRightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 