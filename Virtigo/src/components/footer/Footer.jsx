import React, { useEffect, useState } from 'react';
import { Layout, Row, Col } from 'antd';
import {
  FacebookFilled,
  LinkedinOutlined,
  TwitterOutlined,
  MailOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import Logo from '../../assets/virtigo-text.svg';
import '../../styles/Footer.css';
import { API_URL } from '../../config/api';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [emailRes, addressRes, phoneRes] = await Promise.all([
          axios.get(`${API_URL}api/SystemConfig/get-config-by-key/support_email`),
          axios.get(`${API_URL}api/SystemConfig/get-config-by-key/support_address`),
          axios.get(`${API_URL}api/SystemConfig/get-config-by-key/support_phone`),
        ]);

        setContactInfo({
          email: emailRes.data?.data?.value || '',
          address: addressRes.data?.data?.value || '',
          phone: phoneRes.data?.data?.value || '',
        });
      } catch (error) {
        console.error('Lỗi khi tải thông tin liên hệ:', error);
      }
    };

    fetchConfigs();
  }, []);

  return (
    <AntFooter className="footer">
      <div className="footer__container">
        <Row gutter={[32, 24]}>
          <Col xs={24} md={8} className="footer__logo-col">
            <img src={Logo} alt="logo" className="footer__logo" />
            <p className="footer__desc">
              Virtigo - Nền tảng học đi đôi với trải nghiệm hiện đại, thân thiện và hiệu quả.
            </p>
          </Col>
          <Col xs={24} md={8}>
            <h4 className="footer__title">Liên kết nhanh</h4>
            <ul className="footer__list">
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/courses">Khóa học</a></li>
              <li><a href="/about">Về chúng tôi</a></li>
              <li><a href="/news">Tin tức</a></li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <h4 className="footer__title">Liên hệ</h4>
            <div className="footer__contact">
              {contactInfo.email && (
                <a href={`mailto:${contactInfo.email}`}>
                  <MailOutlined /> {contactInfo.email}
                </a>
              )}
              {contactInfo.phone && <p><b>Điện thoại:</b> {contactInfo.phone}</p>}
              {contactInfo.address && <p><b>Địa chỉ:</b> {contactInfo.address}</p>}
            </div>
            <div className="footer__social-icons">
              <a href="#"><FacebookFilled /></a>
              <a href="#"><LinkedinOutlined /></a>
              <a href="#"><TwitterOutlined /></a>
            </div>
          </Col>
        </Row>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Virtigo</span>
          <ul className="footer__policy-list">
            <li><a href="#">Site Map</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
