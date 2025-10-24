import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';

const { Content } = Layout;

const DashboardLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout className="ml-20">
        <Content style={{ 
          margin: '10px 16px', 
          padding: 24, 
          background: 'transparent',  
          minHeight: '70%',
        //   width: '100%',
          borderRadius: '8px'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
