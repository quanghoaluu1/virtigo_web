import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Modal,
  message,
  Typography,
  Divider,
  Row,
  Col,
  Upload,
  Tabs,
  Switch,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  BoxPlotOutlined,
  DragOutlined,
  EyeOutlined,
  UploadOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';
import './RichTextEditor.css';
import { API_URL } from '../../../../config/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ModelSelector from './ModelSelector.jsx';
import ModelViewer from '../3d-component/ModelViewer.jsx';

const { Title, Text } = Typography;
const { TextArea } = Input;

const LessonDetailCreator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lessonDetailId = location.state?.lessonDetailId;
  const lessonId = location.state?.lessonId;

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [addBlockModalVisible, setAddBlockModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Load existing lesson detail if editing
  useEffect(() => {
    const loadLessonDetail = async () => {
      if (!lessonDetailId) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}api/LessonDetails/${lessonDetailId}`);
        console.log('Loaded lesson detail:', response.data);

        if (response.data) {
          const data = response.data.data || response.data;
          setTitle(data.title || '');

          // Parse blocks - priority: blocks array > blocksJson string
          let parsedBlocks = [];

          // First try to use blocks array if available
          if (Array.isArray(data.blocks) && data.blocks.length > 0) {
            parsedBlocks = data.blocks;
          }
          // Fallback to blocksJson string
          else if (data.blocksJson && typeof data.blocksJson === 'string') {
            try {
              const parsed = JSON.parse(data.blocksJson);
              // Convert PascalCase to camelCase
              parsedBlocks = parsed.map(block => ({
                type: (block.Type || block.type || '').toLowerCase(),
                content: block.Content || block.content || null,
                url: block.Url || block.url || null,
                orderIndex: block.OrderIndex ?? block.orderIndex ?? 0,
              }));
            } catch (e) {
              console.error('Error parsing blocksJson:', e);
              parsedBlocks = [];
            }
          }
          // Last resort: try blocks as string
          else if (typeof data.blocks === 'string') {
            try {
              parsedBlocks = JSON.parse(data.blocks);
            } catch (e) {
              console.error('Error parsing blocks string:', e);
              parsedBlocks = [];
            }
          }

          console.log('Parsed blocks:', parsedBlocks);

          // Add unique IDs to blocks if they don't have them
          const blocksWithIds = parsedBlocks.map((block, index) => ({
            type: block.type,
            content: block.content,
            url: block.url,
            orderIndex: block.orderIndex ?? index,
            id: block.id || `block-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          }));

          setBlocks(blocksWithIds);
          setIsActive(data.isActive !== false);
        }
      } catch (error) {
        message.error('Không thể tải chi tiết bài học');
        console.error('Error fetching lesson detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLessonDetail();
  }, [lessonDetailId]);

  const handleSave = async () => {
    if (!title.trim()) {
      message.error('Vui lòng nhập tiêu đề bài học');
      return;
    }

    if (blocks.length === 0) {
      message.error('Vui lòng thêm ít nhất một khối nội dung');
      return;
    }

    try {
      setLoading(true);
      // Remove the 'id' field from blocks before saving (it's only for drag-drop)
      // Keep blocks as array, not JSON string
      const blocksToSave = blocks.map((block) => ({
        type: block.type,
        content: block.content || null,
        url: block.url || null,
        orderIndex: block.orderIndex
      }));

      const data = {
        title: title.trim(),
        blocks: blocksToSave, // Send as array, not JSON string
        isActive,
      };

      console.log('Saving lesson detail:', data);

      if (lessonDetailId) {
        console.log("update existing: lessonDetailId", lessonDetailId);
        // Update existing
        await axios.put(`${API_URL}api/LessonDetails/${lessonDetailId}`, {
          lessonDetailID: lessonDetailId,
          ...data,
        });
        message.success('Cập nhật chi tiết bài học thành công');

      } else {
        // Create new
        console.log("create new: lessonId", lessonId);
        await axios.post(`${API_URL}api/LessonDetails`, data);
        message.success('Tạo chi tiết bài học thành công');
      }

      navigate(-1);
    } catch (error) {
      message.error('Lỗi khi lưu chi tiết bài học');
      console.error('Error saving lesson detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = (type) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: type === 'text' ? '' : null,
      url: type !== 'text' ? '' : null,
      orderIndex: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
    setAddBlockModalVisible(false);
  };

  const handleEditBlock = (index) => {
    setEditingBlock({ ...blocks[index], index });
    setEditModalVisible(true);
  };

  const handleUpdateBlock = () => {
    if (editingBlock === null) return;

    const updatedBlocks = [...blocks];
    updatedBlocks[editingBlock.index] = {
      id: editingBlock.id,
      type: editingBlock.type,
      content: editingBlock.content,
      url: editingBlock.url,
      orderIndex: editingBlock.index,
    };
    setBlocks(updatedBlocks);
    setEditModalVisible(false);
    setEditingBlock(null);
    message.success('Cập nhật khối nội dung thành công');
  };

  const handleDeleteBlock = (index) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    // Re-index
    const reindexedBlocks = updatedBlocks.map((block, idx) => ({
      ...block,
      orderIndex: idx,
    }));
    setBlocks(reindexedBlocks);
    message.success('Xóa khối nội dung thành công');
  };

  const handleMoveBlock = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const updatedBlocks = [...blocks];
    const temp = updatedBlocks[index];
    updatedBlocks[index] = updatedBlocks[newIndex];
    updatedBlocks[newIndex] = temp;

    // Update orderIndex
    updatedBlocks.forEach((block, idx) => {
      block.orderIndex = idx;
    });

    setBlocks(updatedBlocks);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update orderIndex
    const reindexedItems = items.map((item, index) => ({
      ...item,
      orderIndex: index,
    }));

    setBlocks(reindexedItems);
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}api/Upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url || response.data;
    } catch (error) {
      message.error('Lỗi khi tải ảnh lên');
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}api/Upload/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url || response.data;
    } catch (error) {
      message.error('Lỗi khi tải file lên');
      console.error('Upload error:', error);
      return null;
    }
  };

  const renderBlockIcon = (type) => {
    switch (type) {
      case 'text':
        return <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'video':
        return <VideoCameraOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'image':
        return <PictureOutlined style={{ fontSize: 24, color: '#faad14' }} />;
      case 'model3d':
        return <BoxPlotOutlined style={{ fontSize: 24, color: '#722ed1' }} />;
      default:
        return null;
    }
  };

  const renderBlockPreview = (block) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            className="rich-text-editor-content"
            dangerouslySetInnerHTML={{ __html: block.content || '<p>Chưa có nội dung</p>' }}
            style={{ maxHeight: 200, overflow: 'auto', padding: 12, background: '#fafafa', borderRadius: 4 }}
          />
        );
      case 'video':
        return block.url ? (
          <video
            src={block.url}
            controls
            style={{ width: '100%', maxHeight: 300, borderRadius: 4 }}
          />
        ) : (
          <Text type="secondary">Chưa có video</Text>
        );
      case 'image':
        return block.url ? (
          <img
            src={block.url}
            alt="Block content"
            style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 4 }}
          />
        ) : (
          <Text type="secondary">Chưa có hình ảnh</Text>
        );
      case 'model3d':
        return block.url ? (
          <div
            style={{
              padding: 10,
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #eee',
            }}
          >
            <ModelViewer meshUrl={block.url} />
          </div>
        ) : (
          <Text type="secondary">Chưa có mô hình 3D</Text>
        );
      default:
        return <Text type="secondary">Không xác định</Text>;
    }
  };

  const renderEditBlockContent = () => {
    if (!editingBlock) return null;

    switch (editingBlock.type) {
      case 'text':
        return (
          <div>
            <Text strong>Nội dung văn bản:</Text>
            <div style={{ marginTop: 10 }}>
              <RichTextEditor
                value={editingBlock.content || ''}
                onChange={(value) => setEditingBlock({ ...editingBlock, content: value })}
                placeholder="Nhập nội dung văn bản..."
              />
            </div>
          </div>
        );
      case 'video':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>URL Video:</Text>
              <Input
                value={editingBlock.url || ''}
                onChange={(e) => setEditingBlock({ ...editingBlock, url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                prefix={<LinkOutlined />}
                style={{ marginTop: 5 }}
              />
            </div>
            <Divider>HOẶC</Divider>
            <Upload
              beforeUpload={async (file) => {
                const url = await handleFileUpload(file);
                if (url) {
                  setEditingBlock({ ...editingBlock, url });
                }
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Tải video lên</Button>
            </Upload>
            {editingBlock.url && (
              <div style={{ marginTop: 10 }}>
                <Text strong>Xem trước:</Text>
                <video src={editingBlock.url} controls style={{ width: '100%', marginTop: 10 }} />
              </div>
            )}
          </Space>
        );
      case 'image':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>URL Hình ảnh:</Text>
              <Input
                value={editingBlock.url || ''}
                onChange={(e) => setEditingBlock({ ...editingBlock, url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                prefix={<LinkOutlined />}
                style={{ marginTop: 5 }}
              />
            </div>
            <Divider>HOẶC</Divider>
            <Upload
              beforeUpload={async (file) => {
                const url = await handleImageUpload(file);
                if (url) {
                  setEditingBlock({ ...editingBlock, url });
                }
                return false;
              }}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Tải hình ảnh lên</Button>
            </Upload>
            {editingBlock.url && (
              <div style={{ marginTop: 10 }}>
                <Text strong>Xem trước:</Text>
                <img src={editingBlock.url} alt="Preview" style={{ width: '100%', marginTop: 10 }} />
              </div>
            )}
          </Space>
        );
      // case 'model3d':
      //   return (
      //     <Space direction="vertical" style={{ width: '100%' }}>
      //       <div>
      //         <Text strong>URL Mô hình 3D (.glb, .gltf):</Text>
      //         <Input
      //           value={editingBlock.url || ''}
      //           onChange={(e) => setEditingBlock({ ...editingBlock, url: e.target.value })}
      //           placeholder="https://example.com/model.glb"
      //           prefix={<LinkOutlined />}
      //           style={{ marginTop: 5 }}
      //         />
      //       </div>
      //       <Divider>HOẶC</Divider>
      //       <Upload
      //         beforeUpload={async (file) => {
      //           const url = await handleFileUpload(file);
      //           if (url) {
      //             setEditingBlock({ ...editingBlock, url });
      //           }
      //           return false;
      //         }}
      //         showUploadList={false}
      //         accept=".glb,.gltf"
      //       >
      //         <Button icon={<UploadOutlined />}>Tải mô hình 3D lên</Button>
      //       </Upload>
      //       {editingBlock.url && (
      //         <div style={{ marginTop: 10 }}>
      //           <Text strong>URL:</Text>
      //           <div style={{ padding: 10, background: '#f0f0f0', borderRadius: 4, marginTop: 5 }}>
      //             <a href={editingBlock.url} target="_blank" rel="noopener noreferrer">
      //               {editingBlock.url}
      //             </a>
      //           </div>
      //         </div>
      //       )}
      //     </Space>
      //   );
      case 'model3d':
        return (
          <div>
            <Text strong>Chọn mô hình 3D:</Text>
            <div style={{ marginTop: 12 }}>
              <ModelSelector
                onSelect={({ original, refine }) => {
                  const chosen = refine || original; // Nếu có refine thì ưu tiên refine
                  if (chosen.meshUrl) {
                    setEditingBlock({
                      ...editingBlock,
                      url: chosen.meshUrl,
                      modelName: chosen.name,
                      originalModelId: original.id,
                      refineId: refine?.id || null, // lưu luôn id refine nếu có
                    });
                    message.success(
                      refine
                        ? `Đã chọn refine của mô hình: ${original.name}`
                        : `Đã chọn mô hình gốc: ${original.name}`
                    );
                  } else {
                    message.warning("Mô hình này chưa sẵn sàng (chưa có meshUrl)");
                  }
                }}
              />

            </div>

            {editingBlock.url && (
              <>
                <Divider />
                <Text strong>Xem trước mô hình:</Text>
                <div style={{ marginTop: 10 }}>
                  <ModelViewer meshUrl={editingBlock.url} />
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    return (
      <div style={{ padding: 20 }}>
        <Title level={2}>{title || 'Tiêu đề bài học'}</Title>
        <Divider />
        {blocks.length === 0 ? (
          <Text type="secondary">Chưa có nội dung</Text>
        ) : (
          blocks.map((block, index) => (
            <div key={index} style={{ marginBottom: 30 }}>
              {renderBlockPreview(block)}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '0 24px' }}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>{lessonDetailId ? 'Chỉnh sửa chi tiết bài học' : 'Tạo chi tiết bài học mới'}</span>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Xem trước">
              <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>
                Xem trước
              </Button>
            </Tooltip>
            <Button onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Title and Active Status */}
          <Row gutter={16}>
            <Col span={18}>
              <div>
                <Text strong>Tiêu đề bài học: *</Text>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài học"
                  size="large"
                  style={{ marginTop: 5 }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text strong>Trạng thái:</Text>
                <div style={{ marginTop: 5 }}>
                  <Switch
                    checked={isActive}
                    onChange={setIsActive}
                    checkedChildren="Kích hoạt"
                    unCheckedChildren="Không kích hoạt"
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Divider />

          {/* Blocks Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Nội dung bài học</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddBlockModalVisible(true)}
              >
                Thêm khối nội dung
              </Button>
            </div>

            {blocks.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 40, background: '#fafafa' }}>
                <Text type="secondary">Chưa có khối nội dung nào. Nhấn "Thêm khối nội dung" để bắt đầu.</Text>
              </Card>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="blocks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {blocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                marginBottom: 16,
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                              styles={{ body: { padding: 16 } }}
                            >
                              <Row gutter={16} align="middle">
                                <Col span={1}>
                                  <div {...provided.dragHandleProps}>
                                    <DragOutlined style={{ fontSize: 20, cursor: 'grab', color: '#999' }} />
                                  </div>
                                </Col>
                                <Col span={1}>
                                  {renderBlockIcon(block.type)}
                                </Col>
                                <Col span={3}>
                                  <Text strong>
                                    {block.type === 'text' && 'Văn bản'}
                                    {block.type === 'video' && 'Video'}
                                    {block.type === 'image' && 'Hình ảnh'}
                                    {block.type === 'model3d' && 'Mô hình 3D'}
                                  </Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: 12 }}>Thứ tự: {index + 1}</Text>
                                </Col>
                                <Col span={13}>
                                  {renderBlockPreview(block)}
                                </Col>
                                <Col span={6} style={{ textAlign: 'right' }}>
                                  <Space>
                                    <Tooltip title="Di chuyển lên">
                                      <Button
                                        icon={<ArrowUpOutlined />}
                                        size="small"
                                        disabled={index === 0}
                                        onClick={() => handleMoveBlock(index, 'up')}
                                      />
                                    </Tooltip>
                                    <Tooltip title="Di chuyển xuống">
                                      <Button
                                        icon={<ArrowDownOutlined />}
                                        size="small"
                                        disabled={index === blocks.length - 1}
                                        onClick={() => handleMoveBlock(index, 'down')}
                                      />
                                    </Tooltip>
                                    <Button
                                      type="primary"
                                      size="small"
                                      onClick={() => handleEditBlock(index)}
                                    >
                                      Chỉnh sửa
                                    </Button>
                                    <Popconfirm
                                      title="Bạn có chắc chắn muốn xóa khối này?"
                                      onConfirm={() => handleDeleteBlock(index)}
                                      okText="Xóa"
                                      cancelText="Hủy"
                                    >
                                      <Button type="primary" danger size="small" icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </Space>
                                </Col>
                              </Row>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </Space>
      </Card>

      {/* Add Block Modal */}
      <Modal
        title="Thêm khối nội dung"
        open={addBlockModalVisible}
        onCancel={() => setAddBlockModalVisible(false)}
        footer={null}
        width={600}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              hoverable
              onClick={() => handleAddBlock('text')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <Title level={4} style={{ marginTop: 16 }}>Văn bản</Title>
              <Text type="secondary">Thêm nội dung văn bản với trình soạn thảo rich text</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              hoverable
              onClick={() => handleAddBlock('video')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <VideoCameraOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              <Title level={4} style={{ marginTop: 16 }}>Video</Title>
              <Text type="secondary">Thêm video từ URL hoặc tải lên</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              hoverable
              onClick={() => handleAddBlock('image')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <PictureOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <Title level={4} style={{ marginTop: 16 }}>Hình ảnh</Title>
              <Text type="secondary">Thêm hình ảnh từ URL hoặc tải lên</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              hoverable
              onClick={() => handleAddBlock('model3d')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <BoxPlotOutlined style={{ fontSize: 48, color: '#722ed1' }} />
              <Title level={4} style={{ marginTop: 16 }}>Mô hình 3D</Title>
              <Text type="secondary">Thêm mô hình 3D (.glb, .gltf)</Text>
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Edit Block Modal */}
      <Modal
        title={`Chỉnh sửa khối ${editingBlock?.type === 'text' ? 'văn bản' : editingBlock?.type === 'video' ? 'video' : editingBlock?.type === 'image' ? 'hình ảnh' : 'mô hình 3D'}`}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingBlock(null);
        }}
        onOk={handleUpdateBlock}
        okText="Cập nhật"
        cancelText="Hủy"
        width={800}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {renderEditBlockContent()}
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Xem trước bài học"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
        styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      >
        {renderPreview()}
      </Modal>
    </div>
  );
};

export default LessonDetailCreator;

