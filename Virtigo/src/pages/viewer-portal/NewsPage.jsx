import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../../styles/NewsPage.css';

const NewsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock news data
  const newsData = [
    {
      id: 1,
      title: 'Virtigo ra mắt chương trình học 3D đầu tiên tại Việt Nam',
      excerpt: 'Trung tâm Virtigo chính thức triển khai công nghệ học tập 3D tiên tiến, mang đến trải nghiệm học tập hoàn toàn mới cho học viên...',
      content: 'Trung tâm Virtigo đã chính thức ra mắt chương trình học tập 3D đầu tiên tại Việt Nam, đánh dấu một bước ngoặt quan trọng trong lĩnh vực giáo dục. Công nghệ này cho phép học viên tương tác trực tiếp với nội dung bài học thông qua môi trường 3D sống động, tăng cường khả năng ghi nhớ và hiểu biết sâu sắc về kiến thức.',
      category: 'technology',
      author: 'Nguyễn Văn A',
      date: '2024-01-15',
      readTime: '5 phút đọc',
      image: 'https://via.placeholder.com/600x400/4caf50/ffffff?text=3D+Learning',
      featured: true,
      tags: ['Công nghệ', '3D', 'Giáo dục']
    },
    {
      id: 2,
      title: 'Hơn 1000 học viên trải nghiệm học tập với mô hình 3D',
      excerpt: 'Công nghệ mô hình 3D tương tác đang cách mạng hóa cách học tập tại Virtigo với hơn 1000 học viên tham gia...',
      content: 'Trong một sự kiện đầy ý nghĩa, hơn 1000 học viên đã trải nghiệm phương pháp học tập đột phá với mô hình 3D tương tác tại trung tâm Virtigo. Công nghệ này cho phép học viên quan sát, xoay, phóng to các mô hình 3D, giúp hiểu rõ hơn về cấu trúc và nguyên lý của các đối tượng học tập.',
      category: 'education',
      author: 'Trần Thị B',
      date: '2024-01-10',
      readTime: '4 phút đọc',
      image: 'https://via.placeholder.com/600x400/1EB2B0/ffffff?text=3D+Learning',
      featured: false,
      tags: ['Mô hình 3D', 'Tương tác', 'Công nghệ']
    },
    {
      id: 3,
      title: 'Virtigo triển khai trợ lý AI học tập thông minh',
      excerpt: 'Hệ thống trợ lý AI mới giúp học viên nhận được hỗ trợ học tập 24/7 và tối ưu hóa lộ trình cá nhân...',
      content: 'Trung tâm Virtigo vừa triển khai hệ thống trợ lý AI học tập thông minh, có khả năng trả lời câu hỏi, giải đáp thắc mắc và hướng dẫn học viên 24/7. AI còn phân tích tiến độ học tập, đưa ra gợi ý cải thiện và tùy chỉnh nội dung phù hợp với từng cá nhân.',
      category: 'technology',
      author: 'Lê Văn C',
      date: '2024-01-08',
      readTime: '6 phút đọc',
      image: 'https://via.placeholder.com/600x400/66bb6a/ffffff?text=AI+Assistant',
      featured: false,
      tags: ['AI', 'Trợ lý thông minh', 'Học tập']
    },
    {
      id: 4,
      title: 'Công nghệ AI được tích hợp vào chương trình giảng dạy',
      excerpt: 'Trí tuệ nhân tạo giờ đây hỗ trợ cá nhân hóa quá trình học tập cho từng học viên tại Virtigo...',
      content: 'Virtigo đã tích hợp công nghệ trí tuệ nhân tạo (AI) vào hệ thống giảng dạy, tạo ra một trải nghiệm học tập cá nhân hóa cho mỗi học viên. Hệ thống AI có thể phân tích điểm mạnh, điểm yếu của từng học viên và đưa ra lộ trình học tập tối ưu.',
      category: 'technology',
      author: 'Phạm Thị D',
      date: '2024-01-05',
      readTime: '7 phút đọc',
      image: 'https://via.placeholder.com/600x400/81c784/ffffff?text=AI+Education',
      featured: true,
      tags: ['AI', 'Cá nhân hóa', 'Công nghệ']
    },
    {
      id: 5,
      title: 'Khóa học mới: Học tập qua mô phỏng 3D và thực tế ảo',
      excerpt: 'Khám phá kiến thức thông qua môi trường học tập 3D sống động và thực tế ảo tương tác...',
      content: 'Trung tâm Virtigo ra mắt khóa học mới sử dụng công nghệ mô phỏng 3D và thực tế ảo (VR), giúp học viên trải nghiệm học tập đắm chìm. Học viên có thể khám phá các mô hình 3D phức tạp, tương tác với môi trường ảo và thực hành trong không gian 3D, tạo nên trải nghiệm học tập độc đáo và hiệu quả.',
      category: 'education',
      author: 'Nguyễn Thị E',
      date: '2024-01-03',
      readTime: '3 phút đọc',
      image: 'https://via.placeholder.com/600x400/a5d6a7/ffffff?text=VR+Learning',
      featured: false,
      tags: ['VR', '3D', 'Khóa học mới']
    },
    {
      id: 6,
      title: 'Virtigo đạt chứng nhận ISO 9001:2015',
      excerpt: 'Trung tâm được công nhận về chất lượng quản lý và dịch vụ giáo dục theo tiêu chuẩn quốc tế...',
      content: 'Trung tâm Virtigo vinh dự nhận được chứng nhận ISO 9001:2015 về hệ thống quản lý chất lượng. Đây là minh chứng cho sự cam kết của trung tâm trong việc duy trì và cải thiện liên tục chất lượng dịch vụ giáo dục.',
      category: 'achievement',
      author: 'Trần Văn F',
      date: '2024-01-01',
      readTime: '4 phút đọc',
      image: 'https://via.placeholder.com/600x400/c8e6c9/ffffff?text=ISO+Certification',
      featured: false,
      tags: ['ISO', 'Chứng nhận', 'Chất lượng']
    },
    {
      id: 7,
      title: 'Học viên Virtigo nâng cao hiệu quả học tập 85% nhờ AI',
      excerpt: '95% học viên cải thiện đáng kể kết quả học tập nhờ hệ thống AI cá nhân hóa...',
      content: 'Nghiên cứu mới nhất cho thấy 95% học viên của trung tâm Virtigo đã cải thiện đáng kể hiệu quả học tập, với mức tăng trung bình 85% nhờ hệ thống AI cá nhân hóa. Công nghệ AI phân tích điểm mạnh, điểm yếu và tự động điều chỉnh nội dung phù hợp với từng học viên.',
      category: 'achievement',
      author: 'Lê Thị G',
      date: '2023-12-28',
      readTime: '5 phút đọc',
      image: 'https://via.placeholder.com/600x400/4caf50/ffffff?text=AI+Success',
      featured: true,
      tags: ['AI', 'Thành tích', 'Học viên']
    },
    {
      id: 8,
      title: 'Chương trình học bổng công nghệ 3D mùa xuân 2024',
      excerpt: 'Cơ hội nhận học bổng 100% cho các khóa học công nghệ 3D và AI tại Virtigo...',
      content: 'Trung tâm Virtigo triển khai chương trình học bổng mùa xuân 2024, mang đến cơ hội học tập miễn phí các khóa học công nghệ 3D, AI và thực tế ảo cho những học viên có hoàn cảnh khó khăn nhưng đam mê công nghệ. Chương trình này thể hiện sứ mệnh đào tạo nhân tài công nghệ vì cộng đồng.',
      category: 'scholarship',
      author: 'Phạm Văn H',
      date: '2023-12-25',
      readTime: '3 phút đọc',
      image: 'https://via.placeholder.com/600x400/1EB2B0/ffffff?text=Tech+Scholarship',
      featured: false,
      tags: ['Học bổng', 'Công nghệ 3D', 'AI']
    }
  ];

  const categories = [
    { key: 'all', label: 'Tất cả' },
    { key: 'technology', label: 'Công nghệ' },
    { key: 'education', label: 'Giáo dục' },
    { key: 'partnership', label: 'Hợp tác' },
    { key: 'achievement', label: 'Thành tích' },
    { key: 'scholarship', label: 'Học bổng' }
  ];

  // Filter news based on category and search term
  const filteredNews = newsData.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredNews = newsData.filter(article => article.featured);
  const regularNews = filteredNews.filter(article => !article.featured);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const NewsCard = ({ article, featured = false }) => (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`news-card ${featured ? 'featured' : ''}`}
    >
      <div className="news-image">
        <img src={article.image} alt={article.title} />
        <div className="news-category">{categories.find(cat => cat.key === article.category)?.label}</div>
      </div>
      <div className="news-content">
        <div className="news-meta">
          <span className="news-author">{article.author}</span>
          <span className="news-date">{formatDate(article.date)}</span>
          <span className="news-read-time">{article.readTime}</span>
        </div>
        <h3 className="news-title">{article.title}</h3>
        <p className="news-excerpt">{article.excerpt}</p>
        <div className="news-tags">
          {article.tags.map((tag, index) => (
            <span key={index} className="news-tag">{tag}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );

  return (
    <div className="news-page">
      {/* Hero Section */}
      <section className="news-hero">
        <div className="news-hero-background">
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
            <h1 className="hero-title">Tin tức & Sự kiện</h1>
            <p className="hero-subtitle">
              Cập nhật những tin tức mới nhất về Virtigo, các sự kiện quan trọng 
              và thành tựu của chúng tôi trong lĩnh vực giáo dục
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="news-filters">
        <div className="container">
          <div className="filters-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category.key}
                  className={`category-btn ${selectedCategory === category.key ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured News Section */}
      {featuredNews.length > 0 && selectedCategory === 'all' && (
        <section className="featured-news">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Tin nổi bật</h2>
            </div>
            <div className="featured-grid">
              {featuredNews.map(article => (
                <NewsCard key={article.id} article={article} featured={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular News Section */}
      <section className="regular-news">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {selectedCategory === 'all' ? 'Tất cả tin tức' : 
               categories.find(cat => cat.key === selectedCategory)?.label}
            </h2>
            <p className="section-description">
              {filteredNews.length} bài viết được tìm thấy
            </p>
          </div>
          
          {regularNews.length > 0 ? (
            <div className="news-grid">
              {regularNews.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">📰</div>
              <h3>Không tìm thấy tin tức nào</h3>
              <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="newsletter-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="newsletter-content"
          >
            <h2>Đăng ký nhận tin tức</h2>
            <p>
              Nhận thông báo về tin tức mới nhất, sự kiện và cập nhật từ Virtigo
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Đăng ký</button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
