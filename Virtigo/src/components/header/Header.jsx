import React, { useState } from 'react';
import { Layout, Menu, Button, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import {HiMenuAlt4, HiX} from 'react-icons/hi';
// eslint-disable-next-line no-unused-vars
import {motion} from 'framer-motion';
import '../../styles/Header.css';
import Logo from '../../assets/virtigo-text.svg';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'; // Thêm icon
import { getUser, logout, getUserRole } from '../../utils/auth';

const { Header } = Layout;

const Items = [
  { label: 'Trang chủ', key: '/' },
  { label: 'Khóa học', key: '/classes' },
  { label: 'Về chúng tôi', key: '/about' },
  { label: 'Tin tức', key: '/news' },
];

const HeaderBar = () => {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleApplyNow = () => {
    navigate('/login');
  };

  const user = getUser();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    window.location.href = '/login'; // Navigate and reload to ensure clean state
  };

  return (
    <nav className="app__navbar-outer">
      <div className='app__navbar'>
        <div className='app__navbar-logo'>
          <img src={Logo} alt="Logo"/>
        </div>
        <div className='app__navlinks'>
          <ul>
            {Items.map((item) => (
              <li
                className={`app__navlink ${item.disabled ? 'disabled' : ''}`}
                key={item.key}
                onClick={() => !item.disabled && navigate(item.key)}
              >
                <a>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className='app__nav-actions'>
          {!user ? (
            <button className='app__navbar-btn' onClick={handleApplyNow}>Đăng Ký Ngay</button>
          ) : (
            <div className="app__navbar-user" >
              <span className="app__navbar-hello  cursor-pointer" onClick={() => {
              const role = getUserRole();
              if (role === 'Manager') navigate('/dashboard');
              else if (role === 'Lecture') navigate('/lecturer');
              else if (role === 'Student') navigate('/student/enroll');
              else navigate('/');
            }} >
                <UserOutlined className="mr-1.5 text-[#1EB2B0]  ml-3" />
                Chào, <span className="mr-1"></span><b>{user.firstName}</b>
              </span>
              <button className="app__navbar-logout" onClick={() => setShowLogoutConfirm(true)} title="Đăng xuất">
                <LogoutOutlined className="text-xl text-[#1EB2B0]" />
              </button>
            </div>
              
          )}
        </div>
        <div className='app__navbar-menu'>
          <HiMenuAlt4 onClick={() => setToggle(true)} />
          {toggle && (
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: 300,
                transition: { duration: 0.5, type: "spring", damping: 10 }
              }}
              exit={{ width: 0 }}
            >
              <HiX onClick={() => setToggle(false)} />
              <ul>
                {Items.map((item) => (
                  <li key={item.key}>
                    <a onClick={() => {
                      if (!item.disabled) {
                        navigate(item.key);
                        setToggle(false);
                      }
                    }}>
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <button className='app__navbar-menu-btn' onClick={handleApplyNow}>
                    Đăng Ký Ngay
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
      <Modal
        title="Xác nhận đăng xuất"
        open={showLogoutConfirm}
        onOk={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        okText="Đăng xuất"
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: '#2e7d32', borderColor: '#00FFA1' }
        }}
      >
        Bạn có chắc chắn muốn đăng xuất không?
      </Modal>
    </nav>
  );
};

export default HeaderBar;