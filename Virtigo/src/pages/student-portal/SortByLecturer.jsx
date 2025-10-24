import React, { useState, useMemo } from 'react';
import { Select } from 'antd';

const SortByLecturer = ({ classes, children }) => {
  const [selectedLecturer, setSelectedLecturer] = useState('all');

  // Lấy danh sách giáo viên duy nhất
  const lecturers = useMemo(() => {
    const names = Array.from(new Set(classes.map(c => c.lecturerName)));
    return names;
  }, [classes]);

  // Lọc danh sách lớp theo giáo viên
  const filteredClasses = useMemo(() => {
    if (selectedLecturer === 'all') return classes;
    return classes.filter(c => c.lecturerName === selectedLecturer);
  }, [classes, selectedLecturer]);

  return (
    <div className="mb-24">
      <Select
        value={selectedLecturer}
        onChange={setSelectedLecturer}
        style={{ minWidth: 220, marginBottom: 16 }}
        options={[
          { value: 'all', label: 'Tất cả giáo viên' },
          ...lecturers.map(name => ({ value: name, label: name }))
        ]}
      />
      {children(filteredClasses)}
    </div>
  );
};

export default SortByLecturer; 