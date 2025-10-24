import React, { useEffect, useState } from 'react';
import { Card, Button, Tag, Rate, Spin, Row, Col, Typography, Divider, Tooltip, Avatar, List, Empty } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import '../../styles/ViewClassDetail.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../../components/header/Header';
import FooterBar from '../../components/footer/Footer';
import { UserOutlined, BookOutlined } from '@ant-design/icons';
import Syllabus from '../../components/dashboard/pages/Syllabus';
import { Collapse } from 'antd';
import SyllabusSchedule from '../../components/dashboard/pages/syllabus/SyllabusSchedule';
import { a } from 'framer-motion/client';

const { Title, Text, Paragraph } = Typography;

const ViewClassDetail = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [payOsLink, setPayOsLink] = useState('');

  // Lấy studentId từ localStorage
  const student = JSON.parse(localStorage.getItem('user'));
  const studentId = student?.accountId;

  const createPayOsPayment = async (classId) => {
    try {
      const response = await axios.post(`${API_URL}${endpoints.payment.createPayOs}`, {
        classId: classId,
        accountId: studentId,
      });
      const  paymentUrl = response.data.paymentLink.checkoutUrl;
      if (paymentUrl){
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error('Error creating PayOs payment:', error);
    }
  };

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await axios.get(`${API_URL}api/Class/get-by-id?id=${id}`);
        setClassData(res.data);
        console.log("subjectID:", res.data.subjectID);
      } catch (err) {
        setClassData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  // Lấy danh sách bài học
  useEffect(() => {
    const fetchLessons = async () => {
      setLessonsLoading(true);
      setLessonsError(null);
      try {
        const res = await axios.get(`${API_URL}api/Lesson/get-by-class/${id}`);
        setLessons(res.data.data || []);
      } catch (err) {
        setLessonsError('Không thể tải danh sách bài học.');
      } finally {
        setLessonsLoading(false);
      }
    };
    if (id) fetchLessons();
  }, [id]);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (studentId && id) {
        try {
          const res = await axios.get(`${API_URL}api/Enrollment/check-enrollment/${studentId}/${id}`);
          setIsEnrolled(res.data.isEnrolled);
        } catch (err) {
          setIsEnrolled(false);
        }
      }
    };
    checkEnrollment();
  }, [studentId, id]);

  if (loading || !classData) return <Spin size="large" style={{ margin: '80px auto', display: 'block' }} />;

  return (
    <>
      <div className="class-detail-bg">
        <div className="class-detail-main">
        <Title level={2} 
            className="class-detail-title">{classData.className}
        </Title>
          <Row gutter={[40, 24]} align="top">
            <Col xs={24} md={16}>
              <div className="class-detail-image-wrap">
                <img
                  src={classData.imageURL}
                  alt={classData.className}
                  className="class-detail-image"
                />
              </div>
              {/* Lịch trình học mới: Danh sách bài học */}
              <div className="mt-40">
                <Collapse bordered={false} style={{ background: 'transparent' }}>
                  <Collapse.Panel 
                    header={<span style={{ color: '#222', fontWeight: 700, fontSize: 18 }}>Lịch trình học</span>} 
                    key="1" 
                    style={{ background: '#fff', borderRadius: 12, border: 'none', boxShadow: 'none', marginBottom: 0 }}
                  >
                    {lessonsLoading ? (
                      <Spin style={{ display: 'block', margin: '40px auto' }} size="large" />
                    ) : lessonsError ? (
                      <div style={{ color: 'red', textAlign: 'center', margin: 24 }}>{lessonsError}</div>
                    ) : !lessons.length ? (
                      <Empty description="Chưa có bài học nào cho lớp này." className="m-40" />
                    ) : (
                      <List
                        grid={{ gutter: 24, column: 1 }}
                        dataSource={lessons}
                        renderItem={(lesson, idx) => (
                          <List.Item style={{ padding: 0, marginBottom: 24 }}>
                            <Card
                              bordered={false}
                              style={{
                                borderRadius: 18,
                                boxShadow: '0 4px 16px 0 rgba(24, 144, 255, 0.10)',
                                background: '#f0f5ff',
                                transition: 'box-shadow 0.2s',
                                minHeight: 80,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                border: '1px solid #adc6ff',
                              }}
                              bodyStyle={{ display: 'flex', alignItems: 'center', padding: 20 }}
                              hoverable
                            >
                              <div style={{
                                minWidth: 40,
                                minHeight: 40,
                                borderRadius: '50%',
                                background: '#e6f7ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16,
                                fontWeight: 700,
                                fontSize: 16,
                                color: '#1890ff',
                                boxShadow: '0 2px 8px 0 rgba(24, 144, 255, 0.10)'
                              }}>
                                {idx + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{
                                  fontSize: 15,
                                  fontWeight: 500,
                                  color: '#333',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8
                                }}>
                                  {lesson.lessonTitle}
                                </span>
                              </div>
                            </Card>
                          </List.Item>
                        )}
                      />
                    )}
                  </Collapse.Panel>
                </Collapse>
              </div>
            </Col>
            {/* Thông tin bên phải */}
            <Col xs={24} md={8}>
              <Card className="class-detail-info-card" variant="borderless">
                {/* Giá và Purchase */}
                    <div className="class-detail-price-box">
                  <span className="class-detail-currency">VNĐ</span>
                  <span className="class-detail-price-number">
                    {classData.priceOfClass ? classData.priceOfClass.toLocaleString() : '--'}
                  </span>
                </div>
                {isEnrolled ? (
                  <Button
                    type="primary"
                    size="large"
                    className="class-detail-purchase-btn"
                    block
                    style={{ margin: '18px 0 8px 0', fontSize: 20, height: 48 }}
                    onClick={() => navigate('/student/schedule?simple=true')}
                  >
                    Xem thời khóa biểu
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    className="class-detail-purchase-btn"
                    block
                    style={{ margin: '18px 0 8px 0', fontSize: 20, height: 48 }}
                    onClick={() => createPayOsPayment(classData.classID)}
                  >
                    Đăng ký ngay
                  </Button>
                )}

                {/* Thông tin meta */}
                <div className="class-detail-meta-table">
                  <div className="class-detail-meta-row">
                    <span className="class-detail-meta-label">Khai giảng</span>
                    <span className="class-detail-meta-value">{classData.teachingStartTime?.slice(0, 10) || '-'}</span>
                  </div>
                </div>                

                <div className="class-detail-lecturer-row">
                  <Avatar size={36} icon={<UserOutlined />} style={{ background: '#e6f7ff', color: '#1890ff', marginRight: 10 }} />
                  <div>
                    <div>
                      <span className="class-detail-meta-label mr-6">Giảng viên:</span>
                      <span className="class-detail-meta-value">{classData.lecturerName}</span>
                    </div>
 
                  </div>
                </div>
              </Card>
              <div className="class-detail-guarantee-box">
                  <div className="class-detail-guarantee-item">✔ Created by the Virtigo Team</div>
                  <div className="class-detail-guarantee-item">✔ 6 Months Support</div>
                  <div className="class-detail-guarantee-item">✔ 100% Money Back Guarantee</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      
    </>
  );
};

export default ViewClassDetail;
