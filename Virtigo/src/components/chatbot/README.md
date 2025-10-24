# AI ChatBot Component

## Overview
A floating bubble chat bot that integrates with Gemini AI to provide real-time assistance to users across all pages of the website.

## Features
- 🎈 **Floating Bubble Button**: Always accessible from the bottom-right corner
- 💬 **Chat Modal**: Clean, responsive chat interface
- 🤖 **AI Integration**: Connected to Gemini AI API
- 🎨 **Themed Design**: Matches website color scheme (#16BEAD, #097083)
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- ⚡ **Real-time**: Instant responses with loading indicators
- 🇻🇳 **Vietnamese Language**: All UI text in Vietnamese
- 🎯 **Role-Based Features**: Special 3D model generation for non-student users
- 📋 **Copy Function**: Easy copy button with visual feedback (icon changes to check + toast notification)
- 💡 **Smart Suggestions**: Quick access to 3D prompt generation mode
- 🔄 **Dual Modes**: Switch between regular chat and 3D model generation

## API Integration

### Regular Chat Mode
- **Endpoint**: `POST /api/Gemini/chat`
- **Request Body**: 
  ```json
  {
    "Prompt": "user message here"
  }
  ```
- **Response**: 
  ```json
  {
    "Reply": "AI response here"
  }
  ```

### 3D Model Generation Mode (Non-Student Users Only)
- **Endpoint**: `POST /api/Gemini/generate-3d-model`
- **Request Body**: 
  ```json
  {
    "Prompt": "object description"
  }
  ```
- **Response**: 
  ```json
  {
    "Reply": "3D model prompt suggestion"
  }
  ```

## Usage
The ChatBot component is automatically included in the main App.jsx and appears on all pages. No additional configuration is needed.

## Files
- `ChatBot.jsx` - Main component logic
- `ChatBot.css` - Styling and animations
- API configuration in `src/config/api.js`

## Customization
You can customize the appearance by modifying the CSS variables or colors in `ChatBot.css`:
- Primary gradient colors
- Border radius
- Animation timing
- Shadow effects

## Features Included
1. Message history with timestamps
2. Smooth animations and transitions
3. Loading states with spinner
4. Auto-scroll to latest message
5. Keyboard support (Enter to send)
6. Disabled state during API calls
7. Error handling for API failures
8. Responsive design for all screen sizes
9. Copy button for AI responses
10. Role-based feature access
11. 3D model prompt generation mode
12. Mode switching with visual indicators
13. Contextual placeholders and hints

## How to Use

### Regular Chat
1. Click the bubble button in the bottom-right corner
2. Type your message in the input field
3. Press Enter or click the send button
4. Click the copy icon to copy AI responses
   - Icon changes to checkmark when copied
   - Small toast "Đã copy" appears below the button
   - Automatically resets after 2 seconds

### 3D Model Generation (Manager, Lecturer, Teacher only)
1. Open the chat modal
2. Click "Gợi ý tạo prompt vật thể 3D" button
3. A banner will appear with instructions
4. Enter object name and details (e.g., "Một chiếc ghế gỗ màu nâu")
5. Get optimized prompts for 3D model generation
6. Click the X button in the banner to return to regular chat mode

## Role-Based Access
- **Student**: Access to regular chat only
- **Manager/Lecturer/Teacher**: Access to both regular chat and 3D model generation

