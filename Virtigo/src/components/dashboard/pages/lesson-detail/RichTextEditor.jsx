import React, { useRef, useState, useEffect } from 'react';
import { Button, Space, Tooltip, Divider } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung...', style = {} }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleChange();
  };

  const handleChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleChange();
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatBlock = (tag) => {
    execCommand('formatBlock', tag);
  };

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, ...style }}>
      {/* Toolbar */}
      <div
        style={{
          padding: '8px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        <Space size="small" wrap>
          {/* Text Formatting */}
          <Tooltip title="Đậm (Ctrl+B)">
            <Button
              size="small"
              icon={<BoldOutlined />}
              onClick={() => execCommand('bold')}
            />
          </Tooltip>
          <Tooltip title="Nghiêng (Ctrl+I)">
            <Button
              size="small"
              icon={<ItalicOutlined />}
              onClick={() => execCommand('italic')}
            />
          </Tooltip>
          <Tooltip title="Gạch chân (Ctrl+U)">
            <Button
              size="small"
              icon={<UnderlineOutlined />}
              onClick={() => execCommand('underline')}
            />
          </Tooltip>

          <Divider type="vertical" />

          {/* Headers */}
          <select
            onChange={(e) => formatBlock(e.target.value)}
            defaultValue=""
            style={{
              padding: '4px 8px',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            <option value="">Đoạn văn</option>
            <option value="h1">Tiêu đề 1</option>
            <option value="h2">Tiêu đề 2</option>
            <option value="h3">Tiêu đề 3</option>
            <option value="h4">Tiêu đề 4</option>
            <option value="h5">Tiêu đề 5</option>
            <option value="h6">Tiêu đề 6</option>
          </select>

          <Divider type="vertical" />

          {/* Lists */}
          <Tooltip title="Danh sách có thứ tự">
            <Button
              size="small"
              icon={<OrderedListOutlined />}
              onClick={() => execCommand('insertOrderedList')}
            />
          </Tooltip>
          <Tooltip title="Danh sách không thứ tự">
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => execCommand('insertUnorderedList')}
            />
          </Tooltip>

          <Divider type="vertical" />

          {/* Alignment */}
          <Tooltip title="Căn trái">
            <Button
              size="small"
              icon={<AlignLeftOutlined />}
              onClick={() => execCommand('justifyLeft')}
            />
          </Tooltip>
          <Tooltip title="Căn giữa">
            <Button
              size="small"
              icon={<AlignCenterOutlined />}
              onClick={() => execCommand('justifyCenter')}
            />
          </Tooltip>
          <Tooltip title="Căn phải">
            <Button
              size="small"
              icon={<AlignRightOutlined />}
              onClick={() => execCommand('justifyRight')}
            />
          </Tooltip>

          <Divider type="vertical" />

          {/* Link */}
          <Tooltip title="Chèn liên kết">
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={insertLink}
            />
          </Tooltip>

          <Divider type="vertical" />

          {/* Undo/Redo */}
          <Tooltip title="Hoàn tác">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={() => execCommand('undo')}
            />
          </Tooltip>
          <Tooltip title="Làm lại">
            <Button
              size="small"
              icon={<RedoOutlined />}
              onClick={() => execCommand('redo')}
            />
          </Tooltip>

          {/* Colors */}
          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            title="Màu chữ"
            style={{
              width: 30,
              height: 26,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          />
          <input
            type="color"
            onChange={(e) => execCommand('backColor', e.target.value)}
            title="Màu nền"
            style={{
              width: 30,
              height: 26,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          />
        </Space>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="rich-text-editor-content"
        onInput={handleChange}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          minHeight: 300,
          padding: 16,
          outline: 'none',
          fontSize: 14,
          lineHeight: 1.6,
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '0 0 4px 4px',
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;

