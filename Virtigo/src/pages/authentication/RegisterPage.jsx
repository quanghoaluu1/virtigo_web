import React, { useState } from "react";
import "../../styles/RegisterPage.css";
import { Form, Input, Button, Alert, Select, DatePicker, Modal } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, endpoints } from "../../config/api";
import dayjs from "dayjs";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  // Step 1: Gửi OTP
  const handleSendOtp = async () => {
    try {
      setError("");
      setLoading(true);
      const values = await form.validateFields();

      // Kiểm tra email đã tồn tại chưa
      const checkRes = await axios.get(API_URL + "api/Account/search",{
          params: {
            SearchValue: values.email,
            SearchByEmail: true
          }
        }
      );
      if (checkRes.data && checkRes.data.data && checkRes.data.data.length > 0) {
        form.setFields([
          {
            name: 'email',
            errors: ['Email này đã được sử dụng']
          }
        ]);
        setLoading(false);
        return;
      }

      setEmail(values.email);
      await axios.post(API_URL + endpoints.account.sendOTP, { email: values.email });
      setStep(2);
      setOtp("");
      setOtpModalVisible(true);
    } catch (err) {
      // Nếu lỗi là do validate form thì không hiển thị lỗi chung
      if (err && err.errorFields) {
        // Không setError, Form đã hiển thị lỗi dưới từng trường
      } else {
        setError("Không thể gửi OTP: " + (err.response?.data || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Xác thực OTP và đăng ký
  const handleVerifyAndRegister = async () => {
    try {
      setError("");
      setLoading(true);
      const values = await form.validateFields();
      if (!otp) {
        setError("Vui lòng nhập OTP!");
        setLoading(false);
        return;
      }
      // Xác thực OTP
      await axios.post(API_URL + endpoints.account.verifyOTP, { email: values.email, otp });
      // Đăng ký
      const registerData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        birthDate: values.birthDate ? values.birthDate.format("YYYY-MM-DD") : "",
        gender: values.gender,
        password: values.password,
      };
      await axios.post(API_URL + endpoints.account.register, registerData);
      setSuccess("Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập...");
      setStep(3);
      setOtpModalVisible(false);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      let errorMsg = "Lỗi xác thực hoặc đăng ký!";
      if (err.response && err.response.data) {
        const backendMsg = typeof err.response.data === 'string' ? err.response.data : err.response.data.errorMessage;
        if (backendMsg) {
          errorMsg = backendMsg;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-hero-container">
      <div className="register-illustration">
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
        <div className="register-hero-title">
          <h1>Welcome!</h1>
          <p>Create your account to start learning</p>
        </div>
      </div>
      <Form
        className="register-form"
        name="register"
        layout="vertical"
        form={form}
        autoComplete="off"
      >
        <h2>Đăng ký</h2>
        <div className="register-grid">
          <Form.Item
            label="Họ"
            name="lastName"
            rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#66bb6a' }} />} placeholder="Nhập họ..." size="large" disabled={step !== 1} />
          </Form.Item>
          <Form.Item
            label="Tên"
            name="firstName"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#66bb6a' }} />} placeholder="Nhập tên..." size="large" disabled={step !== 1} />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: "Vui lòng nhập Số điện thoại!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  // Chuẩn hóa: bỏ dấu cách, chỉ lấy số
                  const phone = value.replace(/\s+/g, "");
                  // Regex kiểm tra số điện thoại Việt Nam theo yêu cầu
                  const regex = /^(0|\+84|84)(3[2-9]|5[689]|7[06789]|8[1-9]|9[0-9])\d{7}$/;
                  if (regex.test(phone)) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Số điện thoại không hợp lệ");
                }
              }
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: '#66bb6a' }} />} placeholder="Nhập số điện thoại..." size="large" disabled={step !== 1} />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#66bb6a' }} />} placeholder="Nhập email..." size="large" disabled={step !== 1} />
          </Form.Item>
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select
              placeholder="Chọn giới tính"
              size="large"
              suffixIcon={<UserOutlined style={{ color: '#66bb6a' }} />}
              disabled={step !== 1}
            >
              <Select.Option value="Male">Nam</Select.Option>
              <Select.Option value="Female">Nữ</Select.Option>
              <Select.Option value="Other">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="birthDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sinh!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.reject();
                  const age = dayjs().year() - value.year();
                  return age >= 16 ? Promise.resolve() : Promise.reject("Bạn phải đủ 16 tuổi!");
                }
              }
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              size="large"
              className="w-full"
              disabled={step !== 1}
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }, { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#66bb6a' }} />} placeholder="Nhập mật khẩu..." size="large" disabled={step !== 1} />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#66bb6a' }} />} placeholder="Xác nhận mật khẩu..." size="large" disabled={step !== 1} />
          </Form.Item>
        </div>
        {step === 2 && (
          <Modal
            title={<span style={{ fontWeight: 700, color: '#2e7d32', display: 'flex', alignItems: 'center' }}><SafetyCertificateOutlined style={{ color: '#66bb6a', marginRight: 8, fontSize: 22 }} />Nhập mã OTP xác nhận</span>}
            open={otpModalVisible}
            onCancel={() => setOtpModalVisible(false)}
            footer={null}
            centered
            maskClosable={false}
            bodyStyle={{ background: '#f1f8f4', borderRadius: 12, boxShadow: '0 2px 16px rgba(46, 125, 50, 0.1)' }}
          >
            <Input
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              size="large"
              maxLength={6}
              style={{
                marginBottom: 16,
                background: '#fff',
                borderRadius: 8,
                fontWeight: 600,
                color: '#2e7d32',
                borderColor: '#a5d6a7',
              }}

            />
            {error && (
              <div style={{ color: '#d32f2f', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 6, padding: '6px 12px', marginBottom: 12, fontWeight: 500 }}>
                {error}
              </div>
            )}
            <Button
              type="primary"
              onClick={handleVerifyAndRegister}
              loading={loading}
              block
              style={{
                background: 'linear-gradient(90deg, #66bb6a 0%, #81c784 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.15)',
                marginTop: 4
              }}
            >
              Xác thực & Đăng ký
            </Button>
          </Modal>
        )}
        {/* Không hiển thị lỗi chung khi lỗi email đã được sử dụng, lỗi sẽ hiển thị ở ô email */}
        {error && step !== 1 && <Alert message={error} type="error" showIcon className="mb-12" />}
        {success && <Alert message={success} type="success" showIcon className="mb-12" />}
        {step === 1 && (
          <Button type="primary" onClick={handleSendOtp} className="register-btn" size="large" block loading={loading}>
            Xác Nhận
          </Button>
        )}
        {step === 3 && (
          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <h3>Đăng ký thành công!</h3>
            <p>Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...</p>
          </div>
        )}
        <div className="register-footer">
          <span>Đã có tài khoản?</span>
          <a href="/login">Đăng nhập</a>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;
