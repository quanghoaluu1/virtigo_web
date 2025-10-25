import React, { useState, useEffect } from 'react';
import { Card, Spin, Typography, Divider, Button, Space, message, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  BoxPlotOutlined,
  BookOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../../config/api';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './RichTextEditor.css';
import ModelViewer from '../3d-component/ModelViewer';

const { Title, Text, Paragraph } = Typography;

const LessonDetailPreview = () => {
  const { lessonDetailId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonDetail();
  }, [lessonDetailId]);

  const fetchLessonDetail = async () => {
    try {
      setLoading(true);
      const id = lessonDetailId || location.state?.lessonDetailId;
      
      if (!id) {
        message.error('Không tìm thấy ID bài học');
        navigate(-1);
        return;
      }

      const response = await axios.get(`${API_URL}api/LessonDetails/${id}`);
      console.log('Fetched lesson detail:', response.data);

      if (response.data) {
        const data = response.data.data || response.data;
        
        // Parse blocks - could be array or JSON string
        let parsedBlocks = [];
        if (Array.isArray(data.blocks) && data.blocks.length > 0) {
          parsedBlocks = data.blocks;
        } else if (data.blocksJson && typeof data.blocksJson === 'string') {
          try {
            const parsed = JSON.parse(data.blocksJson);
            parsedBlocks = parsed.map(block => ({
              type: (block.Type || block.type || '').toLowerCase(),
              content: block.Content || block.content || null,
              url: block.Url || block.url || null,
              orderIndex: block.OrderIndex ?? block.orderIndex ?? 0,
            }));
          } catch (e) {
            console.error('Error parsing blocksJson:', e);
          }
        }

        // Sort blocks by orderIndex
        parsedBlocks.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

        setLessonDetail({
          ...data,
          blocks: parsedBlocks,
        });
      }
    } catch (error) {
      console.error('Error fetching lesson detail:', error);
      message.error('Không thể tải chi tiết bài học');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const renderBlockIcon = (type) => {
    switch (type) {
      case 'text':
        return <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />;
      case 'video':
        return <VideoCameraOutlined style={{ fontSize: 20, color: '#52c41a' }} />;
      case 'image':
        return <PictureOutlined style={{ fontSize: 20, color: '#faad14' }} />;
      case 'model3d':
        return <BoxPlotOutlined style={{ fontSize: 20, color: '#722ed1' }} />;
      default:
        return null;
    }
  };

  const renderBlock = (block, index) => {
    const blockStyle = {
      marginBottom: 40,
      padding: 24,
      background: '#ffffff',
      borderRadius: 8,
      border: '1px solid #f0f0f0',
    };

    switch (block.type) {
      case 'text':
        return (
          <div key={index} style={blockStyle}>
            <Space style={{ marginBottom: 16 }}>
              {renderBlockIcon('text')}
              <Tag color="blue">Khối văn bản #{index + 1}</Tag>
            </Space>
            <div 
              className="rich-text-editor-content" 
              dangerouslySetInnerHTML={{ __html: block.content || '<p>Chưa có nội dung</p>' }}
              style={{ fontSize: 16, lineHeight: 1.8 }}
            />
          </div>
        );

      case 'video':
        const embedUrl = block.url && (block.url.includes('youtube.com') || block.url.includes('youtu.be')) 
          ? getYouTubeEmbedUrl(block.url) 
          : null;
        
        return (
          <div key={index} style={blockStyle}>
            <Space style={{ marginBottom: 16 }}>
              {renderBlockIcon('video')}
              <Tag color="green">Khối video #{index + 1}</Tag>
            </Space>
            {block.url ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <video 
                    src={block.url} 
                    controls 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>
            ) : (
              <Text type="secondary">Chưa có video</Text>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={index} style={blockStyle}>
            <Space style={{ marginBottom: 16 }}>
              {renderBlockIcon('image')}
              <Tag color="orange">Khối hình ảnh #{index + 1}</Tag>
            </Space>
            {block.url ? (
              <img 
                src={block.url} 
                alt={`Block ${index + 1}`} 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  maxHeight: 600,
                  objectFit: 'contain',
                  borderRadius: 8,
                  display: 'block',
                }}
              />
            ) : (
              <Text type="secondary">Chưa có hình ảnh</Text>
            )}
          </div>
        );

      case 'model3d':
  return (
    <div key={index} style={blockStyle}>
      <Space style={{ marginBottom: 16 }}>
        {renderBlockIcon('model3d')}
        <Tag color="purple">Khối mô hình 3D #{index + 1}</Tag>
      </Space>

      {block.url ? (
        <div
          style={{
            padding: 20,
            background: '#f7f9fc',
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          {/* Hiển thị mô hình 3D trực tiếp */}
          <div style={{ width: '100%', height: 400, borderRadius: 8, overflow: 'hidden' }}>
            <ModelViewer meshUrl={block.url} />
          </div>

          <div style={{ marginTop: 12 }}>
            <Button type="primary" href={block.url} download target="_blank" rel="noopener noreferrer">
  Tải file
</Button>

          </div>
        </div>
      ) : (
        <Text type="secondary">Chưa có mô hình 3D</Text>
      )}
    </div>
  );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" tip="Đang tải bài học..." />
      </div>
    );
  }

  if (!lessonDetail) {
    return (
      <Card style={{ textAlign: 'center', padding: 60 }}>
        <Title level={3}>Không tìm thấy bài học</Title>
        <Button type="primary" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Quay lại
        </Button>
      </Card>
    );
  }

  // Check if we're on a public route (for students) or dashboard route (for managers/lecturers)
  const isPublicRoute = window.location.pathname.includes('/lesson-preview/') && 
                        !window.location.pathname.includes('/dashboard/') && 
                        !window.location.pathname.includes('/student/') && 
                        !window.location.pathname.includes('/lecturer/');

  return (
    <div style={{ 
      maxWidth: 1000, 
      margin: '0 auto', 
      padding: isPublicRoute ? '80px 24px 60px' : '24px 24px 60px',
      background: '#f5f7fa',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Space style={{ marginBottom: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            type="text"
          >
            Quay lại
          </Button>
        </Space>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <BookOutlined style={{ fontSize: 32, color: '#1890ff' }} />
          <Title level={1} style={{ margin: 0 }}>
            {lessonDetail.title || 'Chưa có tiêu đề'}
          </Title>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Space size="large">
          <div>
            <Text type="secondary">Trạng thái:</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color={lessonDetail.isActive ? 'green' : 'red'}>
                {lessonDetail.isActive ? 'Đang kích hoạt' : 'Không kích hoạt'}
              </Tag>
            </div>
          </div>
          <div>
            <Text type="secondary">Tổng số khối:</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">{lessonDetail.blocks?.length || 0} khối nội dung</Tag>
            </div>
          </div>
        </Space>
      </Card>

      {/* Content Blocks */}
      {lessonDetail.blocks && lessonDetail.blocks.length > 0 ? (
        <div>
          {lessonDetail.blocks.map((block, index) => renderBlock(block, index))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <Title level={4}>Bài học chưa có nội dung</Title>
          <Text type="secondary">Vui lòng quay lại sau khi giảng viên đã thêm nội dung</Text>
        </Card>
      )}

      {/* Footer Navigation */}
      {lessonDetail.blocks && lessonDetail.blocks.length > 0 && (
        <Card 
          style={{ 
            marginTop: 40,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <Title level={4}>Hoàn thành bài học</Title>
          <Paragraph type="secondary">
            Bạn đã xem hết {lessonDetail.blocks.length} khối nội dung của bài học này
          </Paragraph>
          <Space>
            <Button type="primary" size="large" onClick={() => navigate(-1)}>
              Quay lại danh sách
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default LessonDetailPreview;

