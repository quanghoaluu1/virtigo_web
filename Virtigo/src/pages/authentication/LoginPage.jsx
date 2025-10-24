import React, { useState } from "react";
import "../../styles/LoginPage.css";
import axios from "axios";
import { API_URL, endpoints } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setError(null);
    try {
      const response = await axios.post(API_URL + endpoints.account.login, {
        email: values.email,
        password: values.password,
      });
      if (response.data.token) {
        const token = response.data.token;
        const decodedToken = jwtDecode(token);
        localStorage.setItem("token", token);
        localStorage.setItem("role", decodedToken.Role);
        const user = {
          accountId: decodedToken.AccountID,
          firstName: decodedToken.FirstName,
          lastName: decodedToken.LastName,
          role: decodedToken.Role,
        };
        
        localStorage.setItem("user", JSON.stringify(user));
        switch (decodedToken.Role) {
          case "Manager":
            navigate("/dashboard");
            break;
          case "Lecture":
            navigate("/lecturer");
            break;
          case "Student":
            navigate("/student/enroll");
            break;
          default:
            navigate("/");
            break;
        }
      } else if (response.data.errorMessage) {
        setError(response.data.errorMessage);
      }
    } catch (error) {
      let errorMsg = "Lỗi khi đăng nhập. Vui lòng thử lại sau.";
      if (error.response && error.response.data) {
        // Ưu tiên lấy message/detail từ backend nếu có
        const backendMsg = error.response.data.message || error.response.data.detail || error.response.data.errorMessage;
        if (backendMsg) {
          errorMsg = backendMsg;
        }
      }
      setError(errorMsg);
    }
  };

  return (
    <div className="login-hero-container">
      <div className="login-illustration">
        {/* SVG minh họa Virtigo - Virtual Learning với màu xanh lá */}
        <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base platform/ground */}
          <ellipse cx="170" cy="280" rx="140" ry="40" fill="#c8e6c9"/>
          
          {/* Books stack */}
          <rect x="80" y="210" width="90" height="15" rx="3" fill="#66bb6a"/>
          <rect x="85" y="195" width="80" height="15" rx="3" fill="#81c784"/>
          <rect x="90" y="180" width="70" height="15" rx="3" fill="#a5d6a7"/>
          
          {/* Graduation cap */}
          <polygon points="170,80 220,100 170,120 120,100" fill="#2e7d32"/>
          <rect x="165" y="120" width="10" height="60" fill="#388e3c"/>
          <circle cx="170" cy="125" r="35" fill="#4caf50"/>
          <circle cx="170" cy="125" r="28" fill="#66bb6a"/>
          
          {/* Digital elements - floating dots */}
          <circle cx="240" cy="120" r="8" fill="#81c784" opacity="0.7"/>
          <circle cx="260" cy="150" r="6" fill="#a5d6a7" opacity="0.7"/>
          <circle cx="250" cy="180" r="7" fill="#66bb6a" opacity="0.7"/>
          
          <circle cx="100" cy="130" r="7" fill="#81c784" opacity="0.7"/>
          <circle cx="80" cy="160" r="5" fill="#a5d6a7" opacity="0.7"/>
          <circle cx="90" cy="145" r="6" fill="#66bb6a" opacity="0.7"/>
          
          {/* Virtual screen/monitor */}
          <rect x="190" y="200" width="80" height="60" rx="4" fill="#e8f5e9" stroke="#4caf50" stroke-width="3"/>
          <rect x="195" y="205" width="70" height="45" rx="2" fill="#c8e6c9"/>
          
          {/* Play button on screen */}
          <polygon points="220,220 220,240 235,230" fill="#2e7d32"/>
          
          {/* Virtual connection lines */}
          <line x1="170" y1="160" x2="230" y2="200" stroke="#81c784" stroke-width="2" stroke-dasharray="4,4"/>
          <line x1="170" y1="160" x2="120" y2="180" stroke="#81c784" stroke-width="2" stroke-dasharray="4,4"/>
          
          {/* Small sparkle effects */}
          <circle cx="140" cy="90" r="3" fill="#a5d6a7"/>
          <circle cx="200" cy="85" r="2" fill="#c8e6c9"/>
          <circle cx="175" cy="70" r="2.5" fill="#81c784"/>
        </svg>
        <div className="login-hero-title">
          <h1>Welcome Back!</h1>
          <p>Sign in to continue your learning journey</p>
        </div>
      </div>
      <Form
        className="login-form"
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <h2>Đăng nhập</h2>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email!" }]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#66bb6a' }} />}
            placeholder="Nhập email..." 
            size="large"
          />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#66bb6a' }} />}
            placeholder="Nhập mật khẩu..."
            size="large"
          />
        </Form.Item>
        {error && <Alert message={error} type="error" showIcon className="error-text mb-12" />}
        <Button type="primary" htmlType="submit" className="login-btn" size="large" block>
          Đăng nhập
        </Button>
        <div className="login-footer">
          <span>Chưa có tài khoản?</span>
          <a href="/register">Đăng ký</a>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;
