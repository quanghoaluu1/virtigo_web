import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import PaymentTable from './PaymentTable';
import IncomeBySubjectPieChart from '../charts/IncomeBySubjectPieChart';
import RevenueByMonthLineChart from '../charts/RevenueByMonthLineChart';
import AnalyticsSection from './AnalyticsSection';
import ClassCompletionStatsTable from './ClassCompletionStatsTable';
import ClassCompletionRateByMonthChart from '../charts/ClassCompletionRateByMonthChart';
import AttendanceRateByClassBarChart from '../charts/AttendanceRateByClassBarChart';
import TopAverageScoreClassesChart from '../charts/TopAverageScoreClassesChart';
import LecturerClassCountBarChart from '../charts/LecturerClassCountBarChart';
import LecturerRevenuePieChart from '../charts/LecturerRevenuePieChart';
import LecturerStatisticTable from './LecturerStatisticTable';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';

const Analytics = () => {
  const [lecturerStats, setLecturerStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLecturerStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL + endpoints.analytic.lecturerStatistic);
        setLecturerStats(res.data.data || []);
        console.log(res.data);
      } catch (err) {
        setLecturerStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLecturerStats();
  }, []);
  const [expanded, setExpanded] = useState({
    income: true,
    class: false,
    student: false,
    lecturer: false,
  });

  const handleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-32">
      <h1>Phân tích và đánh giá</h1>
      <Row gutter={[32, 32]}>
        <Col xs={24} md={24}>
          <AnalyticsSection
            title="Phân tích thu nhập"
            expanded={expanded.income}
            onToggle={() => handleExpand('income')}
          >
            <PaymentTable />
            <div style={{ margin: '32px 0 0 0' }}>
              <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                  <IncomeBySubjectPieChart />
                </Col>
                <Col xs={24} md={12}>
                  <RevenueByMonthLineChart />
                </Col>
              </Row>
            </div>
          </AnalyticsSection>
        </Col>
        <Col xs={24} md={24}>
          <AnalyticsSection
            title="Hiệu quả lớp học"
            expanded={expanded.class}
            onToggle={() => handleExpand('class')}
          >
            <ClassCompletionStatsTable/>
            {/* <div style={{ margin: '32px 0 0 0' }}>
              <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                
                </Col>
                <Col xs={24} md={12}>
                  <AttendanceRateByClassBarChart />
                </Col>
              </Row>
            </div> */}
            <div style={{ margin: '32px 0 0 0' }}>
              {/* <TopAverageScoreClassesChart/> */}
              <ClassCompletionRateByMonthChart />
            </div>
          </AnalyticsSection>
        </Col>
        {/* <Col xs={24} md={24}>
          <AnalyticsSection
            title="Đánh giá học viên"
            expanded={expanded.student}
            onToggle={() => handleExpand('student')}
          >
            <div style={{ color: '#bbb', fontStyle: 'italic' }}>
              (Nội dung sẽ được bổ sung sau)
            </div>
          </AnalyticsSection>
        </Col> */}
        <Col xs={24} md={24}>
          <AnalyticsSection
            title="Thống kê giảng viên"
            expanded={expanded.lecturer}
            onToggle={() => handleExpand('lecturer')}
          >
             <LecturerStatisticTable data={lecturerStats} loading={loading} />
             <div style={{ margin: '32px 0 0 0' }}>
              <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                <LecturerClassCountBarChart data={lecturerStats} loading={loading} />
                </Col>
                <Col xs={24} md={12}>
                <LecturerRevenuePieChart data={lecturerStats} loading={loading} />
                </Col>
              </Row>
            </div>
          </AnalyticsSection>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics; 