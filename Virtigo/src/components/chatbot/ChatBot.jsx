import React, { useState, useRef, useEffect } from 'react';
import { MessageOutlined, SendOutlined, CloseOutlined, RobotOutlined, CopyOutlined, BulbOutlined, CloseCircleOutlined, CheckOutlined } from '@ant-design/icons';
import { Spin, message as antMessage } from 'antd';
import axios from 'axios';
import { API_URL, endpoints } from '../../config/api';
import { getUserRole } from '../../utils/auth';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Get user role on component mount
    const role = getUserRole();
    setUserRole(role);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Choose endpoint based on mode
      const endpoint = is3DMode 
        ? API_URL + endpoints.chatGemini.generate3DModel
        : API_URL + endpoints.chatGemini.chat;

      const response = await axios.post(endpoint, {
        Prompt: inputValue,
      });

      const botMessage = {
        type: 'bot',
        text: response.data.reply || 'Xin lỗi, tôi không thể xử lý yêu cầu này.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'bot',
        text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    }).catch(() => {
      antMessage.error('Không thể sao chép tin nhắn');
    });
  };

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
    if (!is3DMode) {
      antMessage.info('Đã chuyển sang chế độ tạo prompt 3D');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <div
        className={`chat-bubble ${isOpen ? 'chat-bubble-hidden' : ''}`}
        onClick={toggleChat}
      >
        <MessageOutlined className="chat-bubble-icon" />
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="chat-modal">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <RobotOutlined className="chat-header-icon" />
              <div>
                <h3 className="chat-header-title">Trợ Lý AI</h3>
                <p className="chat-header-subtitle">Đang hoạt động</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={toggleChat}>
              <CloseOutlined />
            </button>
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {/* 3D Mode Suggestion Button for non-students */}
            {userRole && userRole !== 'Student' && !is3DMode && (
              <div className="chat-suggestion-container">
                <button className="chat-suggestion-btn" onClick={toggle3DMode}>
                  <BulbOutlined className="suggestion-icon" />
                  <span>Gợi ý tạo prompt vật thể 3D</span>
                </button>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.type === 'user' ? 'chat-message-user' : 'chat-message-bot'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="chat-message-avatar">
                    <RobotOutlined />
                  </div>
                )}
                <div className="chat-message-content-wrapper">
                  <div
                    className={`chat-message-bubble ${
                      message.type === 'user'
                        ? 'chat-message-bubble-user'
                        : 'chat-message-bubble-bot'
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className="chat-message-footer">
                    <span className="chat-message-time">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.type === 'bot' && (
                      <div className="chat-copy-wrapper">
                        <button 
                          className={`chat-copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                          onClick={() => handleCopyMessage(message.text, index)}
                          title="Sao chép"
                        >
                          {copiedIndex === index ? <CheckOutlined /> : <CopyOutlined />}
                        </button>
                        {copiedIndex === index && (
                          <div className="chat-copy-toast">Đã copy</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message chat-message-bot">
                <div className="chat-message-avatar">
                  <RobotOutlined />
                </div>
                <div className="chat-message-content-wrapper">
                  <div className="chat-message-bubble chat-message-bubble-bot">
                    <Spin size="small" />
                    <span className="chat-loading-text">Đang soạn tin...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="chat-input-container">
            {/* 3D Mode Info Banner */}
            {is3DMode && (
              <div className="chat-3d-mode-banner">
                <button 
                  className="chat-3d-mode-close"
                  onClick={toggle3DMode}
                  title="Thoát chế độ 3D"
                >
                  <CloseCircleOutlined />
                </button>
                <span className="chat-3d-mode-text">
                  Gợi ý để tạo prompt vật thể, bạn chỉ cần nhập tên vật thể và 1 vài thông tin chi tiết
                </span>
              </div>
            )}
            
            <div className="chat-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder={is3DMode ? "Ví dụ: Một chiếc ghế gỗ màu nâu..." : "Nhập tin nhắn của bạn..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <SendOutlined />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

