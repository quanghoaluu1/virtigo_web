import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import ClassCard from '../class/ClassCard';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const ClassCardList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL + endpoints.manageClass.getAll);
        const items = Array.isArray(res.data) ? res.data : res.data.items || [];
        console.log('📚 Classes fetched:', items.length, 'items');
        console.log('📊 Status breakdown:', items.map(c => ({ id: c.classID, name: c.className, status: c.status })));
        setClasses(items);
      } catch (err) {
        console.error('❌ Error fetching classes:', err);
        setError('Không thể tải danh sách lớp học.');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <div>Đang tải lớp học...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Chỉ lấy các class có status là 1 (Open/Mở tuyển sinh)
  // Kiểm tra cả number và string để tránh lỗi type mismatch
  const openClasses = classes.filter(item => item.status === 1 || item.status === "1");

  // Nếu không có class nào, hiển thị thông báo
  if (openClasses.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
      Hiện chưa có lớp học nào đang mở tuyển sinh.
    </div>;
  }

  // Chia nhóm mỗi 3 class
  const groupClasses = [];
  for (let i = 0; i < openClasses.length; i += 3) {
    groupClasses.push(openClasses.slice(i, i + 3));
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}
    >
      <Carousel ref={carouselRef} dots={false}>
        {groupClasses.map((group, index) => (
          <div key={index}>
            <div
              style={{
                display: 'flex',
                justifyContent: group.length < 3 ? 'center' : 'space-between',
                gap: '32px',
                padding: '20px 0',
                minHeight: 420,
              }}
            >
              {group.map((item) => (
                <div key={item.classID} style={{ flex: '1 1 0', minWidth: 280, maxWidth: 340 }}>
                  <ClassCard
                    id={item.classID}
                    imageURL={item.imageURL}
                    className={item.className}
                    lecturerName={item.lecturerName}
                    priceOfClass={item.priceOfClass}
                    status={item.status}
                    onView={() => alert(`Xem chi tiết lớp ${item.className}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Carousel>

      {/* Nút trái */}
      <LeftOutlined
        onClick={() => carouselRef.current.prev()}
        style={{
          position: 'absolute',
          top: '50%',
          left: -40,
          transform: 'translateY(-50%)',
          fontSize: 36,
          cursor: 'pointer',
          color: '#555',
          zIndex: 2,
        }}
      />

      {/* Nút phải */}
      <RightOutlined
        onClick={() => carouselRef.current.next()}
        style={{
          position: 'absolute',
          top: '50%',
          right: -40,
          transform: 'translateY(-50%)',
          fontSize: 36,
          cursor: 'pointer',
          color: '#555',
          zIndex: 2,
        }}
      />
    </div>
  );
};

export default ClassCardList;
