import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Typography, Card, Empty, Pagination, Input, Select, Button, Tag } from 'antd';
import { SearchOutlined, BookOutlined, FilterOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../config/api';
import ClassCard from '../../components/class/ClassCard';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Định nghĩa enum ClassStatus
const ClassStatus = {
  Pending: 0,
  Open: 1,
  Ongoing: 2,
  Completed: 3,
  Deleted: 4,
  Cancelled: 5,
};

const ViewClasses = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}api/Class/get-all-paginated`, {
          params: {
            page: 1,
            pageSize: 1000, // Lấy tất cả để filter phía client
          },
        });
        const items = Array.isArray(res.data.items) ? res.data.items : [];
        
        // Chỉ lấy các lớp đang mở (Open status)
        const openClasses = items.filter(cls => cls.status === ClassStatus.Open);
        
        setClasses(openClasses);
        setFilteredClasses(openClasses);
        setTotal(openClasses.length);
      } catch (e) {
        console.error('Error fetching classes:', e);
        setClasses([]);
        setFilteredClasses([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Filter và search logic
  useEffect(() => {
    let filtered = [...classes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.lecturerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(cls => {
        const price = cls.priceOfClass;
        switch (priceFilter) {
          case 'free':
            return price === 0;
          case 'under-1m':
            return price > 0 && price < 1000000;
          case '1m-2m':
            return price >= 1000000 && price < 2000000;
          case 'over-2m':
            return price >= 2000000;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceOfClass - b.priceOfClass;
        case 'price-high':
          return b.priceOfClass - a.priceOfClass;
        case 'name':
          return a.className.localeCompare(b.className);
        default:
          return b.classID - a.classID; // newest first
      }
    });

    setFilteredClasses(filtered);
    setTotal(filtered.length);
    setPage(1); // Reset to first page when filtering
  }, [classes, searchTerm, priceFilter, sortBy]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredClasses.slice(startIndex, endIndex);
  };



  const resetFilters = () => {
    setSearchTerm('');
    setPriceFilter('all');
    setSortBy('newest');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f4f1e8 0%, #e8dcc0 100%)',
        padding: '0',
      }}
    >
      {/* Header Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '60px 16px 40px 16px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1EB2B0, #1EB2B0)',
            borderRadius: '50px',
            padding: '12px 24px',
            marginBottom: '20px'
          }}>
            <BookOutlined style={{ fontSize: 24, color: '#ffffff', marginRight: 8 }} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 600 }}>
              Các khóa học
            </Text>
          </div>
          
          <Title level={1} style={{ 
            margin: '0 0 12px 0', 
            fontWeight: 800, 
            color: '#1a1a1a',
            fontSize: '3rem',
            lineHeight: '1.2'
          }}>
            Khám phá các khóa học
          </Title>
          
          <Text style={{ 
            color: '#666', 
            fontSize: 18, 
            display: 'block',
            maxWidth: 600,
            margin: '0 auto'
          }}>
            Tham gia ngay các khóa học chất lượng cao với giảng viên giàu kinh nghiệm
          </Text>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 16px' }}>
        {/* Filter Section */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: '#fff',
            marginBottom: 32,
            border: 'none',
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={8} lg={8}>
              <Search
                placeholder="Tìm kiếm khóa học hoặc giảng viên..."
                allowClear
                enterButton={<SearchOutlined style={{ color: '#1EB2B0' }} />}
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </Col>
            
            <Col xs={24} sm={12} md={5} lg={5}>
              <Select
                placeholder="Mức giá"
                size="large"
                value={priceFilter}
                onChange={setPriceFilter}
                className="w-full"
                suffixIcon={<DollarOutlined style={{ color: '#1EB2B0' }} />}
              >
                <Option value="all">Tất cả mức giá</Option>
                <Option value="under-1m">Dưới 1 triệu</Option>
                <Option value="1m-2m">1 - 2 triệu</Option>
                <Option value="over-2m">Trên 2 triệu</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={5} lg={5}>
              <Select
                placeholder="Sắp xếp"
                size="large"
                value={sortBy}
                onChange={setSortBy}
                className="w-full"
                suffixIcon={<FilterOutlined style={{ color: '#1EB2B0' }} />}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="price-low">Giá thấp đến cao</Option>
                <Option value="price-high">Giá cao đến thấp</Option>
                <Option value="name">Tên A-Z</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={24} md={6} lg={6}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button onClick={resetFilters} size="large">
                  Đặt lại
                </Button>
                <Tag color="gold" style={{ margin: 0, padding: '4px 8px' }}>
                  {total} khóa học
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Content Section */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: '#fff',
            border: 'none',
            minHeight: 600,
          }}
          bodyStyle={{ padding: '32px' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#666' }}>
                Đang tải khóa học...
              </div>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text style={{ color: '#888', fontSize: 18, display: 'block', marginBottom: 8 }}>
                      {searchTerm || priceFilter !== 'all' ? 
                        'Không tìm thấy khóa học phù hợp' : 
                        'Hiện tại chưa có khóa học nào đang mở'
                      }
                    </Text>
                    {(searchTerm || priceFilter !== 'all') && (
                      <Button type="primary" onClick={resetFilters} style={{
                        background: 'linear-gradient(135deg, #1EB2B0, #1EB2B0)',
                        borderColor: '#1EB2B0',
                        borderRadius: '8px'
                      }}>
                        Xem tất cả khóa học
                      </Button>
                    )}
                  </div>
                }
              />
            </div>
          ) : (
            <>
              <Row gutter={[48, 48]} justify="start">
                {getCurrentPageItems().map(cls => (
                  <Col key={cls.classID} xs={24} sm={12} md={8} lg={8} xl={6}>
                    <div style={{ padding: '8px' }}>
                      <ClassCard
                        imageURL={cls.imageURL}
                        className={cls.className}
                        lecturerName={cls.lecturerName}
                        priceOfClass={cls.priceOfClass}
                        status={cls.status}
                        id={cls.classID}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
              
              {total > pageSize && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginTop: 48,
                  paddingTop: 32,
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(p, ps) => {
                      setPage(p);
                      setPageSize(ps || pageSize);
                    }}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} của ${total} khóa học`
                    }
                    pageSizeOptions={['12', '24', '48']}
                  />
                </div>
              )}
            </>
          )}
        </Card>

        {/* Stats Section */}
        {!loading && filteredClasses.length > 0 && (
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(29, 178, 176, 0.2)',
              background: 'linear-gradient(135deg, #1EB2B0, #1EB2B0)',
              border: 'none',
              marginTop: 32,
              color: '#fff'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                  {total}
                </div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Khóa học đang mở
                </Text>
              </Col>
              <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                  {new Set(filteredClasses.map(cls => cls.lecturerName)).size}
                </div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Giảng viên
                </Text>
              </Col>
              <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                  {filteredClasses.filter(cls => cls.priceOfClass === 0).length}
                </div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Khóa học miễn phí
                </Text>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewClasses;