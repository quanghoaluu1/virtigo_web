import React from 'react';
import { Layout, Menu, Modal } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ReadOutlined,
  IdcardOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import logo from '../../../public/images/logoB.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';
import axios from 'axios';
import { API_URL } from '../../config/api';

const { Sider } = Layout;

const LecturerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const displayName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : 'User';
  const accountID = user?.accountId;
  const role = user?.role;
  const [avatar, setAvatar] = React.useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  React.useEffect(() => {
    if ((role === 'Lecture' || role === 'Manager') && accountID) {
      axios.get(`${API_URL}api/Account/${accountID}`).then(res => {
        if (res.data && res.data.img) {
          setAvatar(res.data.img);
        }
      }).catch(err => {
        console.log('Error fetching avatar:', err);
      });
    }
  }, [role, accountID]);

  const menuItems = [
    {
      key: '/lecturer',
      icon: <DashboardOutlined />,
      label: 'Bảng điều khiển',
    },
    // {
    //   key: '/lecturer/overview',
    //   icon: <BarChartOutlined />,
    //   label: 'Bảng ',
    // },
    {
      key: '/lecturer/profile',
      icon: <IdcardOutlined />,
      label: 'Hồ sơ',
    },
    {
      key: '/lecturer/class',
      icon: <ReadOutlined />, // icon lịch sử
      label: 'Lớp học của tôi',
    },
    {
      key: '/lecturer/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch giảng dạy',
    },
    // {
    //   key: '/lecturer/students',
    //   icon: <TeamOutlined />,
    //   label: 'Học viên',
    // },
    // {
    //   key: '/lecturer/settings',
    //   icon: <SettingOutlined />,
    //   label: 'Cài đặt',
    // },
    {
      key: '/lecturer/assessment',
      icon: <FileTextOutlined />,
      label: 'Quản lí đề kiểm tra',
    },
    // {
    //   key: '/lecturer/tasks',
    //   icon: <BarChartOutlined />,
    //   label: 'Quản lí công việc',
    // },
    {
      key: '/logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất ',
    }
  ];

  const handleMenuClick = ({ key }) => {
    if (key === '/logout') {
      setShowLogoutConfirm(true);
      return;
    }
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };
  

  

  return (
    <>
      <Sider
        width={270}
        style={{
          height: '100vh',        // full chiều cao màn hình
          position: 'sticky',     // hoặc 'fixed' nếu muốn Sidebar đứng yên khi scroll
          top: 0,                 // dính sát trên cùng
          left: 0,                // nếu fixed thì cần để dính sát trái
          background: 'linear-gradient(180deg, #f8fbff 0%, #f3f7fa 100%)',
          borderRadius: '0px 30px 30px 0px',  // bo tròn góc phải
          margin: 0,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          zIndex: 1000,           // đảm bảo nổi trên các phần khác
        }}
      >
        <div
          style={{
            padding: '20px 0',
            textAlign: 'center',
            borderBottom: '1px solid #eee',
          }}
        >
          {(role === 'Lecture' || role === 'Manager') && avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              style={{ width: 100, height: 100, margin: '0 auto', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={logo}
              alt="Logo"
              style={{ width: 100, height: 100, margin: '0 auto' }}
            />
          )}
          <div style={{ fontWeight: 700, fontSize: 20, color: '#000', marginTop: 10 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 12, color: '#b0b7c3', marginTop:8 }}>Lecture</div>
        </div>

        <div
          style={{
            flex: 1,                 // phần này chiếm hết chiều cao còn lại
            overflowY: 'auto',       // cuộn bên trong menu nếu dài
            padding: '0 16px',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 16,
              fontWeight: 500,
            }}
          />
        </div>
      </Sider>
      <Modal
        title="Xác nhận đăng xuất"
        open={showLogoutConfirm}
        onOk={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        okText="Đăng xuất"
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }
        }}
      >
        Bạn có chắc chắn muốn đăng xuất không?
      </Modal>
    </>
  );
};

export default LecturerSidebar; 