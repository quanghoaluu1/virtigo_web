import React, { useEffect, useState } from 'react';
import { Layout, Menu, Modal } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  ApartmentOutlined,
  ReadOutlined,
  BarChartOutlined,
  CommentOutlined,
  CalendarOutlined,
  IdcardOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import logo from '../../../public/images/logoB.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';
import axios from 'axios';
import { API_URL } from '../../config/api';
//

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy role từ localStorage
  const user = getUser();
  const role = user?.role;
  const accountID = user?.accountId;
  const displayName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : 'User';
  const [avatar, setAvatar] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if ((role === 'Student' || role === 'Manager') && accountID) {
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
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Bảng điều khiển',
    },
    {
      key: '/dashboard/users',
      icon: <TeamOutlined />, // icon người dùng nhóm
      label: 'Quản lí tài khoản',
    },
    {
      key: '/dashboard/subject',
      icon: <BookOutlined />, // icon sách
      label: 'Quản lí môn học',
    },
    {
      key: '/dashboard/assessment',
      icon: <BarChartOutlined />, // icon bài kiểm tra
      label: 'Quản lí đề kiểm tra',
    },

    {
      key: '/dashboard/class',
      icon: <ApartmentOutlined />, // icon sơ đồ lớp/phòng
      label: 'Quản lí lớp học',
    },
    // {
    //   key: '/dashboard/blog',
    //   icon: <ReadOutlined />, // icon đọc bài viết
    //   label: 'Quản lí Blog',
    // },
    {
      key: '/dashboard/analytics',
      icon: <BarChartOutlined />,
      label: 'Phân tích & Đánh giá',
    },
    // {
    //   key: '/dashboard/chat',
    //   icon: <CommentOutlined />, // icon tin nhắn
    //   label: 'Chat',
    // },
    // {
    //   key: '/dashboard/schedule',
    //   icon: <CalendarOutlined />,
    //   label: 'Lịch học',
    // },
    // {
    //   key: '/dashboard/profile',
    //   icon: <IdcardOutlined />, // icon thẻ ID
    //   label: 'Hồ sơ',
    // },
    // {
    //   key: '/dashboard/settings',
    //   icon: <SettingOutlined />,
    //   label: 'Cài đặt',
    // },
  
    {
      key: '/dashboard/income',
      icon: <BarChartOutlined />, // icon thu nhập
      label: 'Quản lí thu nhập',
    },
    {
      key: '/dashboard/lesson-management',
      icon: <ReadOutlined />, // icon quản lý bài học
      label: 'Quản lý chi tiết bài học',
    },
    {
      key: '/dashboard/3d-model-management',
      icon: <ReadOutlined />, // icon quản lý mô hình 3D
      label: 'Quản lý mô hình 3D',
    },
    {
      key: '/dashboard/system-config',
      icon: <SettingOutlined />, // icon cấu hình hệ thống
      label: 'Cấu hình hệ thống',
    },
    {
      key: '/logout',
      icon: <LogoutOutlined />, // icon logout
      label: 'Đăng xuất ',
    }
    
  ];

  const menuItemsStudent = [
    {
      key: '/student/profile',
      icon: <IdcardOutlined />, // icon thẻ ID
      label: 'Thông tin cá nhân',
    },
    {
      key: '/student/test-schedule',
      icon: <BarChartOutlined />, // icon sự kiện
      label: 'Lịch kiểm tra',
    },
    {
      key: '/student/enroll',
      icon: <ReadOutlined />, // icon lịch sử
      label: 'Lớp học đã đăng ký',
    },
    {
      key: '/student/schedule',
      icon: <CalendarOutlined />,
      label: 'Thời khóa biểu',
    },
    // {
    //   key: '/student/certificate',
    //   icon: <BookOutlined />, // icon chứng chỉ
    //   label: 'Chứng chỉ',
    // },
    // {
    //   key: '/student/studying-class',
    //   icon: <ApartmentOutlined />, // icon lớp học
    //   label: 'Lớp đang học',
    // },
    {
      key: '/student/payment-history',
      icon: <BarChartOutlined />, // icon lịch sử thanh toán
      label: 'Lịch sử thanh toán',
    },
    {
      key: '/',
      icon: <DashboardOutlined />, // icon dashboard
      label: 'Về Trang Chủ',
    },
    {
      key: '/logout',
      icon: <LogoutOutlined />, // icon logout
      label: 'Đăng xuất ',
    },
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

  // Chọn menu theo role
  let menuToShow = menuItems;
  if (role === 'Student') menuToShow = menuItemsStudent;

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
          {(role === 'Student' || role === 'Manager') && avatar ? (
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
          <div style={{ fontSize: 12, color: '#b0b7c3', marginTop:8 }}>{role}</div>
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
            items={menuToShow}
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

export default Sidebar;
