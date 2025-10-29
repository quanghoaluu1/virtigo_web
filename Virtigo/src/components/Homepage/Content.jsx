import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';

import ClassCardList from '../class/ClassCardList';

import 'swiper/css';
import 'swiper/css/navigation';
import ModelViewerContent from './ModelViewerContent';
import bronzeDrumModel from './models/trong_ong_ong_son__dong_son_bronze_drum.glb';

const Content = () => {
  const navigate = useNavigate();
  const userIsLoggedIn = isAuthenticated();

  const handleApplyNow = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Home Section */}
      <div id="home" className="app__home">
        {/* Animated Background */}
        <div className="virtigo-background">
          {/* Gradient Background */}
          <div className="bg-gradient"></div>

          {/* Grid Pattern Overlay */}
          <div className="grid-pattern"></div>

          {/* Floating Geometric Shapes */}
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
            <div className="shape shape-6"></div>
            <div className="shape shape-7"></div>
            <div className="shape shape-8"></div>
            <div className="shape shape-9"></div>
            <div className="shape shape-10"></div>
          </div>

          {/* Circular Ripples */}
          <div className="ripple-container">
            <div className="ripple ripple-1"></div>
            <div className="ripple ripple-2"></div>
            <div className="ripple ripple-3"></div>
          </div>

          {/* Floating Symbols */}
          <div className="floating-symbols">
            <div className="symbol symbol-1">📖</div>
            <div className="symbol symbol-2">✏️</div>
            <div className="symbol symbol-3">🏆</div>
            <div className="symbol symbol-4">🎯</div>
            <div className="symbol symbol-5">💡</div>
            <div className="symbol symbol-6">🌟</div>
            <div className="symbol symbol-7">📝</div>
            <div className="symbol symbol-8">🎓</div>
          </div>

          {/* Data Streams */}
          <div className="data-streams">
            <div className="stream stream-1">
              <div className="stream-particle"></div>
              <div className="stream-particle"></div>
              <div className="stream-particle"></div>
            </div>
            <div className="stream stream-2">
              <div className="stream-particle"></div>
              <div className="stream-particle"></div>
              <div className="stream-particle"></div>
            </div>
            <div className="stream stream-3">
              <div className="stream-particle"></div>
              <div className="stream-particle"></div>
              <div className="stream-particle"></div>
            </div>
          </div>

          {/* Animated SVG Elements */}
          <svg className="virtigo-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            {/* Network Connection Lines */}
            <g className="network-lines">
              <line x1="200" y1="150" x2="400" y2="250" stroke="#66bb6a" strokeWidth="2" opacity="0.3" className="line-1" />
              <line x1="400" y1="250" x2="600" y2="200" stroke="#81c784" strokeWidth="2" opacity="0.3" className="line-2" />
              <line x1="600" y1="200" x2="800" y2="350" stroke="#66bb6a" strokeWidth="2" opacity="0.3" className="line-3" />
              <line x1="1200" y1="400" x2="1400" y2="300" stroke="#a5d6a7" strokeWidth="2" opacity="0.3" className="line-4" />
              <line x1="1400" y1="300" x2="1600" y2="450" stroke="#66bb6a" strokeWidth="2" opacity="0.3" className="line-5" />
              <line x1="300" y1="800" x2="500" y2="700" stroke="#81c784" strokeWidth="2" opacity="0.3" className="line-6" />
              <line x1="500" y1="700" x2="700" y2="850" stroke="#66bb6a" strokeWidth="2" opacity="0.3" className="line-7" />
              <line x1="900" y1="600" x2="1100" y2="700" stroke="#a5d6a7" strokeWidth="2" opacity="0.3" className="line-8" />
              <line x1="1100" y1="200" x2="1300" y2="150" stroke="#66bb6a" strokeWidth="2" opacity="0.3" className="line-9" />
              <line x1="800" y1="100" x2="1000" y2="200" stroke="#81c784" strokeWidth="2" opacity="0.3" className="line-10" />
            </g>

            {/* Connection Nodes */}
            <g className="nodes">
              <circle cx="200" cy="150" r="8" fill="#4caf50" className="node pulse-1" />
              <circle cx="400" cy="250" r="6" fill="#66bb6a" className="node pulse-2" />
              <circle cx="600" cy="200" r="7" fill="#81c784" className="node pulse-3" />
              <circle cx="800" cy="350" r="6" fill="#a5d6a7" className="node pulse-1" />
              <circle cx="1200" cy="400" r="8" fill="#4caf50" className="node pulse-2" />
              <circle cx="1400" cy="300" r="6" fill="#66bb6a" className="node pulse-3" />
              <circle cx="1600" cy="450" r="7" fill="#81c784" className="node pulse-1" />
              <circle cx="300" cy="800" r="7" fill="#66bb6a" className="node pulse-2" />
              <circle cx="500" cy="700" r="6" fill="#4caf50" className="node pulse-3" />
              <circle cx="700" cy="850" r="8" fill="#81c784" className="node pulse-1" />
              <circle cx="900" cy="600" r="6" fill="#a5d6a7" className="node pulse-2" />
              <circle cx="1100" cy="700" r="7" fill="#66bb6a" className="node pulse-3" />
              <circle cx="1100" cy="200" r="6" fill="#4caf50" className="node pulse-1" />
              <circle cx="1300" cy="150" r="7" fill="#81c784" className="node pulse-2" />
              <circle cx="800" cy="100" r="6" fill="#66bb6a" className="node pulse-3" />
              <circle cx="1000" cy="200" r="8" fill="#4caf50" className="node pulse-1" />
            </g>

            {/* Floating Education Icons */}
            <g className="edu-icons">
              {/* Book Icon */}
              <g className="float-1" transform="translate(1500, 200)">
                <rect x="0" y="0" width="40" height="30" rx="3" fill="#c8e6c9" opacity="0.6" />
                <rect x="5" y="5" width="30" height="20" rx="2" fill="#a5d6a7" opacity="0.8" />
                <line x1="20" y1="5" x2="20" y2="25" stroke="#66bb6a" strokeWidth="2" />
              </g>

              {/* Graduation Cap */}
              <g className="float-2" transform="translate(300, 600)">
                <polygon points="20,0 40,10 20,20 0,10" fill="#4caf50" opacity="0.7" />
                <rect x="18" y="20" width="4" height="15" fill="#388e3c" opacity="0.7" />
              </g>

              {/* Light Bulb (Ideas) */}
              <g className="float-3" transform="translate(1100, 700)">
                <circle cx="15" cy="15" r="12" fill="#81c784" opacity="0.6" />
                <rect x="12" y="27" width="6" height="8" rx="1" fill="#66bb6a" opacity="0.6" />
              </g>

              {/* Monitor/Screen */}
              <g className="float-4" transform="translate(1700, 600)">
                <rect x="0" y="0" width="50" height="35" rx="3" fill="#e8f5e9" stroke="#4caf50" strokeWidth="2" opacity="0.6" />
                <rect x="5" y="5" width="40" height="25" rx="1" fill="#c8e6c9" opacity="0.8" />
              </g>

              {/* Trophy */}
              <g className="float-5" transform="translate(200, 350)">
                <ellipse cx="20" cy="10" rx="15" ry="8" fill="#ffd54f" opacity="0.6" />
                <rect x="17" y="10" width="6" height="12" fill="#ffb74d" opacity="0.6" />
                <rect x="12" y="22" width="16" height="4" rx="2" fill="#ffa726" opacity="0.6" />
              </g>

              {/* Pencil */}
              <g className="float-6" transform="translate(1300, 500)">
                <rect x="0" y="0" width="8" height="40" rx="2" fill="#81c784" opacity="0.6" />
                <polygon points="4,40 0,50 8,50" fill="#66bb6a" opacity="0.7" />
              </g>

              {/* Certificate */}
              <g className="float-7" transform="translate(600, 100)">
                <rect x="0" y="0" width="45" height="35" rx="2" fill="#e8f5e9" stroke="#4caf50" strokeWidth="2" opacity="0.6" />
                <circle cx="35" cy="28" r="8" fill="#ffd54f" opacity="0.7" />
              </g>

              {/* Cloud (Online Learning) */}
              <g className="float-8" transform="translate(900, 250)">
                <ellipse cx="15" cy="15" rx="12" ry="8" fill="#c8e6c9" opacity="0.5" />
                <ellipse cx="25" cy="15" rx="10" ry="7" fill="#c8e6c9" opacity="0.5" />
                <rect x="5" y="15" width="30" height="8" fill="#c8e6c9" opacity="0.5" />
              </g>

              {/* Globe */}
              <g className="float-9" transform="translate(1600, 150)">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#66bb6a" strokeWidth="2" opacity="0.5" />
                <ellipse cx="20" cy="20" rx="8" ry="18" fill="none" stroke="#81c784" strokeWidth="1.5" opacity="0.5" />
                <line x1="2" y1="20" x2="38" y2="20" stroke="#66bb6a" strokeWidth="1.5" opacity="0.5" />
              </g>
            </g>

            {/* Hexagon Grid Pattern */}
            <g className="hex-pattern" opacity="0.1">
              <polygon points="100,50 125,37.5 150,50 150,75 125,87.5 100,75" fill="none" stroke="#4caf50" strokeWidth="1" />
              <polygon points="400,300 425,287.5 450,300 450,325 425,337.5 400,325" fill="none" stroke="#66bb6a" strokeWidth="1" />
              <polygon points="800,600 825,587.5 850,600 850,625 825,637.5 800,625" fill="none" stroke="#81c784" strokeWidth="1" />
              <polygon points="1300,400 1325,387.5 1350,400 1350,425 1325,437.5 1300,425" fill="none" stroke="#a5d6a7" strokeWidth="1" />
              <polygon points="1500,800 1525,787.5 1550,800 1550,825 1525,837.5 1500,825" fill="none" stroke="#66bb6a" strokeWidth="1" />
            </g>
          </svg>

          {/* Particle Effect */}
          <div className="particles">
            {[...Array(30)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>

          {/* Large Floating Particles */}
          <div className="large-particles">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`large-particle large-particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        {/* <motion.div
          whileInView={{ x: [-100, 0], opacity: [0, 1] }}
          transition={{ duration: 0.5 }}
          className="app__home-intro"
        >
          <h1 className="korean-heading italic">
          Bắt đầu hành trình của bạn để khám phá kho tàng văn hóa Việt Nam mọi lúc, mọi nơi
          </h1>
          <p>
            Chào mừng bạn đến với trung tâm học <br />  đi đôi với thực tế
          </p>
          {!userIsLoggedIn && (
            <button className="app__home-btn" onClick={handleApplyNow}>Đăng nhập để học ngay</button>
          )}
        </motion.div> */}
        <div className="app__home-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
          <motion.div
            whileInView={{ x: [-100, 0], opacity: [0, 1] }}
            transition={{ duration: 0.5 }}
            className="app__home-intro"
            style={{ flex: 1 }}
          >
            <h1 className="korean-heading italic">
              Bắt đầu hành trình của bạn để khám phá kho tàng văn hóa Việt Nam mọi lúc, mọi nơi
            </h1>
            <p>Chào mừng bạn đến với trung tâm học đi đôi với thực tế</p>
            {!userIsLoggedIn && (
              <button className="app__home-btn" onClick={handleApplyNow}>
                Đăng nhập để học ngay
              </button>
            )}
          </motion.div>

          {/* Mô hình 3D */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <ModelViewerContent modelUrl={bronzeDrumModel} />
          </div>
        </div>
      </div>
      {/* Service Section */}
      <div className="app__service">
        <h1 className="head-text">Các Khóa học nổi bật</h1>
        <p className="p-text">
          Hàng trăm học viên đã tin tưởng và lựa chọn các khóa học trung tâm của chúng tôi. Hãy cùng khám phá các khóa học đa dạng và phù hợp với mọi trình độ!
        </p>
        <ClassCardList />
      </div>


      {/* About Us Section (HTML mẫu user thêm) */}
      <div className="app__aboutus-section">
        <div className="aboutus-container">
          {/* Header */}
          <div className="aboutus-header fade-in">
            <h2 className="aboutus-title">Về Chúng Tôi</h2>
            <p className="aboutus-subtitle">
              Trung tâm Hàn ngữ hàng đầu với phương pháp giảng dạy hiện đại,
              đội ngũ giáo viên chuyên nghiệp và môi trường học tập thân thiện
            </p>
          </div>
          {/* Cards Grid */}
          <div className="aboutus-grid">
            <div className="aboutus-card fade-in">
              <div className="card-content">
                <div className="card-icon">🎯</div>
                <h3 className="card-title">Sứ Mệnh Của Chúng Tôi</h3>
                <p className="card-description">
                  Chúng tôi cam kết trở thành cầu nối giúp học viên Việt Nam tiếp cận
                  tri thức, văn hóa thông qua việc học đi đôi với trải nghiệm.
                </p>
                <ul className="card-features">
                  <li>Giảng dạy bằng phương pháp hiện đại và tương tác</li>
                  <li>Kết hợp học tập với trải nghiệm mô hình 3D</li>
                  <li>Hỗ trợ học viên phát triển toàn diện</li>
                  <li>Tạo cơ hội đổi mới và sáng tạo</li>
                </ul>
              </div>
            </div>
            <div className="aboutus-card fade-in">
              <div className="card-content">
                <div className="card-icon">💡</div>
                <h3 className="card-title">Giá Trị Cốt Lõi</h3>
                <p className="card-description">
                  Những giá trị mà chúng tôi luôn theo đuổi và thể hiện
                  trong mọi hoạt động giảng dạy và phục vụ học viên.
                </p>
                <ul className="card-features">
                  <li> Đặt chất lượng bài học lên hàng đầu</li>
                  <li> Luôn sát cánh cùng học viên</li>
                  <li> Không ngừng đổi mới phương pháp</li>
                  <li> Quan tâm đến từng học viên</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Stats Section */}
          <div className="stats-section fade-in">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">4,000+</span>
                <span className="stat-label">Học viên tin tưởng</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">260+</span>
                <span className="stat-label">Khóa học đa dạng</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">400+</span>
                <span className="stat-label">Giảng viên chuyên nghiệp</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Tỷ lệ hài lòng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Content;