import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../../styles/AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/classes');
  };

  const teamMembers = [
    {
      name: 'Trần Kim Nhã',
      position: 'CEO - Giám đốc Điều hành',
      description: 'Hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục và phát triển công nghệ',
      image: 'images/female.png'
    },
    {
      name: 'Mai Phạm Nồng Hậu',
      position: 'CTO - Giám đốc Công nghệ',
      description: 'Chuyên gia phát triển hệ thống học tập 3D và ứng dụng công nghệ thực tế ảo',
      image: 'images/male.png'
    },
    {
      name: 'Lưu Quang Hòa',
      position: 'CFO - Giám đốc Tài chính',
      description: 'Chuyên gia quản lý tài chính và chiến lược đầu tư cho doanh nghiệp giáo dục',
      image: 'images/male.png'
    },
    {
      name: 'Nguyễn Lê Kim Ngân',
      position: 'CDO - Giám đốc Dữ liệu',
      description: 'Chuyên gia phân tích dữ liệu và tối ưu hóa trải nghiệm học tập cá nhân hóa',
      image: 'images/female.png'
    },
    {
      name: 'Nguyễn Hoàng Tuyết Như',
      position: 'CMO - Giám đốc Marketing',
      description: 'Chuyên gia truyền thông và xây dựng thương hiệu trong lĩnh vực giáo dục',
      image: 'images/female.png'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Thành lập Virtigo',
      description: 'Khởi tạo với tầm nhìn mang đến phương pháp học tập tiên tiến'
    },
    {
      year: '2021',
      title: 'Ra mắt nền tảng học tập',
      description: 'Triển khai hệ thống học tập trực tuyến đầu tiên với công nghệ 3D'
    },
    {
      year: '2022',
      title: 'Mở rộng quy mô',
      description: 'Đạt 1,000 học viên đầu tiên và mở rộng đội ngũ giảng viên'
    },
    {
      year: '2023',
      title: 'Đổi mới công nghệ',
      description: 'Tích hợp AI và VR vào chương trình giảng dạy'
    },
    {
      year: '2024',
      title: 'Phát triển toàn diện',
      description: 'Vượt mốc 4,000 học viên và mở rộng sang nhiều lĩnh vực mới'
    }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Chất lượng',
      description: 'Cam kết mang đến chất lượng giáo dục tốt nhất với phương pháp giảng dạy hiện đại'
    },
    {
      icon: '🤝',
      title: 'Đồng hành',
      description: 'Luôn sát cánh cùng học viên trong suốt hành trình học tập và phát triển'
    },
    {
      icon: '💡',
      title: 'Đổi mới',
      description: 'Không ngừng đổi mới và áp dụng công nghệ tiên tiến vào giảng dạy'
    },
    {
      icon: '❤️',
      title: 'Quan tâm',
      description: 'Quan tâm đến từng học viên và tạo môi trường học tập thân thiện'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-background">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <h1 className="hero-title">Về Virtigo</h1>
            <p className="hero-subtitle">
              Chúng tôi là trung tâm giáo dục tiên tiến, kết hợp công nghệ hiện đại 
              với phương pháp giảng dạy sáng tạo để mang đến trải nghiệm học tập 
              độc đáo và hiệu quả.
            </p>
            <button className="cta-button" onClick={handleGetStarted}>
              Khám phá ngay
            </button>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sứ mệnh & Tầm nhìn</h2>
            <p className="section-description">
              Định hướng và giá trị cốt lõi của chúng tôi
            </p>
          </div>
          
          <div className="mission-grid">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mission-card"
            >
              <div className="card-icon">🎯</div>
              <h3>Sứ mệnh</h3>
              <p>
                Chúng tôi cam kết trở thành cầu nối giúp học viên Việt Nam tiếp cận 
                tri thức và văn hóa thông qua việc học đi đôi với trải nghiệm. 
                Chúng tôi tin rằng mỗi học viên đều có tiềm năng vô hạn và xứng đáng 
                được tiếp cận với nền giáo dục chất lượng cao.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mission-card"
            >
              <div className="card-icon">👁️</div>
              <h3>Tầm nhìn</h3>
              <p>
                Trở thành trung tâm giáo dục hàng đầu Việt Nam, tiên phong trong việc 
                ứng dụng công nghệ hiện đại vào giảng dạy. Chúng tôi mong muốn tạo ra 
                một thế hệ học viên tự tin, sáng tạo và có khả năng thích ứng với 
                những thay đổi của thế giới.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Giá trị cốt lõi</h2>
            <p className="section-description">
              Những giá trị mà chúng tôi luôn theo đuổi và thể hiện trong mọi hoạt động
            </p>
          </div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="value-card"
              >
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="stat-item"
            >
              <div className="stat-number">4,000+</div>
              <div className="stat-label">Học viên tin tưởng</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="stat-item"
            >
              <div className="stat-number">260+</div>
              <div className="stat-label">Khóa học đa dạng</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="stat-item"
            >
              <div className="stat-number">400+</div>
              <div className="stat-label">Giảng viên chuyên nghiệp</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="stat-item"
            >
              <div className="stat-number">95%</div>
              <div className="stat-label">Tỷ lệ hài lòng</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Hành trình phát triển</h2>
            <p className="section-description">
              Những cột mốc quan trọng trong quá trình xây dựng và phát triển Virtigo
            </p>
          </div>
          
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
              >
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Đội ngũ lãnh đạo</h2>
            <p className="section-description">
              Những con người tài năng đứng sau sự thành công của Virtigo
            </p>
          </div>
          
          {/* CEO Featured Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="team-card team-card-ceo"
          >
            <div className="team-image team-image-ceo">
              <img src={teamMembers[0].image} alt={teamMembers[0].name} />
            </div>
            <div className="team-info team-info-ceo">
              <h3>{teamMembers[0].name}</h3>
              <h4>{teamMembers[0].position}</h4>
              <p>{teamMembers[0].description}</p>
            </div>
          </motion.div>

          {/* Other Team Members */}
          <div className="team-grid">
            {teamMembers.slice(1).map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                className="team-card"
              >
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <h4>{member.position}</h4>
                  <p>{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="cta-content"
          >
            <h2>Sẵn sàng bắt đầu hành trình học tập?</h2>
            <p>
              Tham gia cùng hàng nghìn học viên khác và trải nghiệm phương pháp 
              học tập tiên tiến của chúng tôi
            </p>
            <div className="cta-buttons">
              <button className="primary-button" onClick={handleGetStarted}>
                Xem khóa học
              </button>
              <button className="secondary-button" onClick={() => navigate('/login')}>
                Đăng ký ngay
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
