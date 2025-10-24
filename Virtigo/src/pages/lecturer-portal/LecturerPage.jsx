import React from 'react';

function LecturerPage() {
  return (
    <div className="lecturer-page">
      <h2>Lecturer Portal</h2>
      <div className="content">
        <h3>Welcome to the Lecturer Portal</h3>
        <p>As a lecturer, you can:</p>
        <ul>
          <li>Manage your courses</li>
          <li>Create and edit course content</li>
          <li>Grade student assignments</li>
          <li>Monitor student progress</li>
          <li>Schedule live sessions</li>
        </ul>
        <p style={{color: '#888', marginTop: 16}}>
          Để xem chi tiết bài kiểm tra, hãy truy cập đường dẫn:<br/>
          <code>/lecturer/view-test/:testEventID</code>
        </p>
      </div>
    </div>
  );
}

export default LecturerPage; 