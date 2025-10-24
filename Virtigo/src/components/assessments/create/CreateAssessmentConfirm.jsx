import React from 'react';
import { Descriptions, Card, Collapse, List, Modal } from 'antd';

const { Panel } = Collapse;

const CATEGORY_LABELS = {
  Quiz: 'Kiểm tra 15 phút',
  Midterm: 'Thi giữa kì',
  Final: 'Thi cuối kì',
};

// Hàm xử lý src ảnh (url hoặc base64)
function getImageSrc(img) {
  if (!img) return '';
  if (img.startsWith('data:image')) return img;
  // Nếu là base64 không có prefix
  if (/^[A-Za-z0-9+/=]+$/.test(img) && img.length > 100) return 'data:image/png;base64,' + img;
  return img;
}

const CreateAssessmentConfirm = ({ basicInfo, sections }) => {
  // Lấy fullname từ localStorage
  let fullname = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    fullname =
      user?.fullname ||
      user?.fullName ||
      ((user?.firstName || '') + ' ' + (user?.lastName || '')).trim();
  } catch {}

  // State cho preview ảnh
  const [previewImage, setPreviewImage] = React.useState(null);
  const [previewVisible, setPreviewVisible] = React.useState(false);

  const handlePreview = (src) => {
    setPreviewImage(src);
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
    setPreviewImage(null);
  };

  return (
    <div>
      <h3>Thông tin cơ bản</h3>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Tên bài kiểm tra">{basicInfo?.TestName}</Descriptions.Item>
        <Descriptions.Item label="Môn học">{basicInfo?.SubjectName || basicInfo?.SubjectID}</Descriptions.Item>
        <Descriptions.Item label="Loại">{basicInfo?.testType}</Descriptions.Item>
        <Descriptions.Item label="Phân loại">{CATEGORY_LABELS[basicInfo?.Category] || basicInfo?.Category}</Descriptions.Item>
        <Descriptions.Item label="Người tạo">{fullname}</Descriptions.Item>
      </Descriptions>

      <h3 className="mt-24">Danh sách section & câu hỏi</h3>
      <Collapse accordion>
        {sections?.map((section, idx) => (
          <Panel header={`Section ${idx + 1}: ${section.name || ''}`} key={idx}>
            
            <p><b>Loại:</b> {section.type}</p>
            <p><b>Điểm:</b> {section.score}</p>
            {/* Hiển thị ảnh/audio tổng của section */}
            {(section.imageURL || section.audioURL) && (
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                {section.imageURL && (
                  <img
                    src={getImageSrc(section.imageURL)}
                    alt="img"
                    style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #eee', boxShadow: '0 2px 8px #0001', cursor: 'pointer' }}
                    onClick={() => handlePreview(getImageSrc(section.imageURL))}
                  />
                )}
                {section.audioURL && (
                  <audio controls src={section.audioURL} style={{ height: 36, borderRadius: 6, background: '#fff' }} />
                )}
              </div>
            )}
            <List
              header={<b>Danh sách câu hỏi</b>}
              dataSource={section.questions?.slice().reverse()}
              renderItem={(q, qIdx) => (
                <List.Item>
                  <Card
                    title={`Câu ${qIdx + 1}`}
                    className="w-full"
                    size="small"
                  >
                    <div><b>Nội dung:</b> {q.content}
                      {(q.previewImage || q.imageURL) && (
                        <img
                          src={getImageSrc(q.previewImage || q.imageURL)}
                          alt="img"
                          style={{ maxWidth: 300, marginLeft: 8, verticalAlign: 'middle', cursor: 'pointer' }}
                          onClick={() => handlePreview(getImageSrc(q.previewImage || q.imageURL))}
                        />
                      )}
                      {(q.previewAudio || q.audioURL) && (
                        <audio src={q.previewAudio || q.audioURL} controls style={{ marginLeft: 8, verticalAlign: 'middle' }} />
                      )}
                    </div>
                    {/* Hiển thị barem điểm cho câu hỏi viết */}
                    {section.type === 'Writing' && Array.isArray(q.criteriaList) && q.criteriaList.length > 0 && (
                      <div style={{ marginTop: 12, marginBottom: 8 }}>
                        <b>Barem chấm điểm:</b>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid #eee', padding: 4 }}>Tiêu chí</th>
                              <th style={{ border: '1px solid #eee', padding: 4 }}>Điểm</th>
                              <th style={{ border: '1px solid #eee', padding: 4 }}>Mô tả</th>
                            </tr>
                          </thead>
                          <tbody>
                            {q.criteriaList.map((c, cIdx) => (
                              <tr key={cIdx}>
                                <td style={{ border: '1px solid #eee', padding: 4 }}>{c.criteriaName}</td>
                                <td style={{ border: '1px solid #eee', padding: 4 }}>{c.maxScore}</td>
                                <td style={{ border: '1px solid #eee', padding: 4 }}>{c.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {section.type === 'MCQ' && (
                      <>
                        <div>
                          <b>Đáp án:</b>
                          <ul>
                            {q.answers?.map((a, aIdx) => (
                              <li key={a.key}>
                                {String.fromCharCode(65 + aIdx)}. {a.text}
                                {(a.previewImage || a.imageURL) && (
                                  <img
                                    src={getImageSrc(a.previewImage || a.imageURL)}
                                    alt="img"
                                    style={{ maxWidth: 120, marginLeft: 8, verticalAlign: 'middle', cursor: 'pointer' }}
                                    onClick={() => handlePreview(getImageSrc(a.previewImage || a.imageURL))}
                                  />
                                )}
                                {(a.previewAudio || a.audioURL) && (
                                  <audio src={a.previewAudio || a.audioURL} controls style={{ marginLeft: 8, verticalAlign: 'middle' }} />
                                )}
                                {q.correct === aIdx && <b style={{ color: 'green' }}> (Đúng)</b>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    {section.type === 'TrueFalse' && (
                      <div className="mt-8">
                        <b>Đáp án đúng:</b> <span style={{ color: 'green', fontWeight: 500 }}>
                          {q.correct === 0 ? 'True' : 'False'}
                        </span>
                      </div>
                    )}
                  </Card>
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
      {/* Modal preview ảnh */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={handleClosePreview}
        centered
        bodyStyle={{
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
          minHeight: 0,
          minWidth: 0,
          overflow: 'visible'
        }}
        style={{
          background: 'rgba(0,0,0,0.15)',
          boxShadow: 'none',
          top: 0,
          padding: 0,
          margin: 0,
        }}
        maskStyle={{
          background: 'rgba(0,0,0,0.35)'
        }}
        width="auto"
      >
        {previewImage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40vh',
              minWidth: '40vw',
              maxWidth: '90vw',
              maxHeight: '80vh',
              margin: '0 auto',
              padding: 0,
              background: 'transparent'
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                padding: 16,
                maxWidth: '90vw',
                maxHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'zoomIn 0.25s'
              }}
            >
              <img
                src={previewImage}
                alt="preview"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '70vh',
                  borderRadius: 12,
                  boxShadow: '0 2px 12px #0002',
                  background: '#fff',
                  display: 'block'
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreateAssessmentConfirm;
