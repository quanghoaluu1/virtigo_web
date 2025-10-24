# Lesson Detail Creator

A comprehensive rich-text editor for creating detailed lesson content with multiple block types.

## Features

### 📝 Rich Text Editor
- Full-featured WYSIWYG editor using React Quill
- Support for headers (H1-H6)
- Text formatting: Bold, Italic, Underline, Strikethrough
- Text and background colors
- Ordered and unordered lists
- Text alignment
- Code blocks
- Embedded links and images
- Clean formatting option

### 🎯 Block Types

#### 1. Text Block
- Rich text editing with full formatting capabilities
- Supports headers, lists, links, embedded images
- Code block support for technical content

#### 2. Video Block
- Add videos via URL
- Upload video files directly
- Video preview in editor
- Supports common video formats

#### 3. Image Block
- Add images via URL
- Upload image files directly
- Image preview in editor
- Supports all common image formats (jpg, png, gif, webp, etc.)

#### 4. 3D Model Block
- Support for .glb and .gltf 3D model formats
- Add models via URL
- Upload model files directly
- Ideal for interactive educational content

### ✨ Advanced Features

#### Drag and Drop Reordering
- Reorder blocks by dragging and dropping
- Visual feedback during drag operations
- Automatic index updating

#### Manual Reordering
- Move blocks up or down using arrow buttons
- Precise control over block order

#### Block Management
- Add unlimited blocks
- Edit any block after creation
- Delete blocks with confirmation
- Each block maintains its order index

#### Preview Mode
- Full preview of the lesson as students will see it
- Modal preview with proper styling
- Test your content before saving

#### Auto-Save Support
- Data structure ready for auto-save implementation
- JSON serialization for database storage

### 🎨 User Interface

#### Intuitive Design
- Clean, modern interface
- Clear visual distinction between block types
- Color-coded icons for each block type:
  - 🔵 Text (Blue)
  - 🟢 Video (Green)
  - 🟡 Image (Yellow)
  - 🟣 3D Model (Purple)

#### Responsive Layout
- Works on desktop and tablet devices
- Scrollable content areas
- Modal dialogs for editing

#### Visual Feedback
- Loading states
- Success/error messages
- Confirmation dialogs for destructive actions

### 💾 Data Management

#### API Integration
- Create new lesson details
- Update existing lesson details
- Fetch lesson details for editing
- Support for file uploads

#### Data Structure
```json
{
  "lessonDetailID": "guid",
  "title": "Lesson Title",
  "blocksJson": "[{\"type\":\"text\",\"content\":\"...\",\"orderIndex\":0}]",
  "isActive": true
}
```

#### Block Structure
```json
{
  "type": "text|video|image|model3d",
  "content": "Rich text content (for text blocks)",
  "url": "URL for media (for video/image/model3d blocks)",
  "orderIndex": 0
}
```

### 🔧 Technical Details

#### Dependencies
- **react-quill**: Rich text editor
- **react-beautiful-dnd**: Drag and drop functionality
- **antd**: UI components
- **axios**: API requests

#### File Upload Support
- Image uploads to `/api/Upload/image`
- File uploads to `/api/Upload/file`
- Automatic URL assignment after upload

#### Navigation
- Create new lesson detail: `/dashboard/lesson-management/create`
- Edit existing lesson detail: `/dashboard/lesson-management/edit/:lessonDetailId`
- Pass lessonId in route state for context

### 📋 Usage

#### Creating a New Lesson Detail
1. Click "Tạo chi tiết bài học" button
2. Enter a title
3. Add blocks using the "Thêm khối nội dung" button
4. Choose block type (Text, Video, Image, or 3D Model)
5. Edit each block to add content
6. Reorder blocks as needed
7. Preview to verify layout
8. Save to database

#### Editing an Existing Lesson Detail
1. Click "Sửa" button on a lesson in the management table
2. Existing content loads automatically
3. Modify title, blocks, or active status
4. Add, remove, or reorder blocks
5. Save changes

#### Managing Blocks
- **Add Block**: Click "Thêm khối nội dung" and select type
- **Edit Block**: Click "Chỉnh sửa" on any block card
- **Delete Block**: Click red delete button (with confirmation)
- **Reorder**: Drag blocks or use arrow buttons
- **Preview**: Click "Xem trước" to see final result

### 🎓 Best Practices

1. **Content Organization**
   - Start with a text block for introduction
   - Use headers to structure content
   - Alternate between text and media for engagement
   - End with a summary or practice exercise

2. **Media Usage**
   - Optimize images before upload
   - Use appropriate video formats
   - Test 3D models before adding
   - Provide alt text descriptions

3. **Block Ordering**
   - Maintain logical flow
   - Group related content
   - Use consistent styling
   - Preview frequently

4. **Accessibility**
   - Use semantic headers
   - Provide text alternatives for media
   - Ensure sufficient color contrast
   - Test with screen readers

### 🔐 Permissions

- Only Manager role can access
- Create, edit, and delete capabilities
- Full control over lesson content

### 🚀 Future Enhancements

Potential additions:
- Auto-save functionality
- Version history
- Collaborative editing
- More block types (Quiz, Audio, PDF, etc.)
- Template system
- Content duplication
- Bulk operations
- Advanced search and filtering

