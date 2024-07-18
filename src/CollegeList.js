// src/CollegeList.js
import React, { useState } from 'react';
import './CollegeList.css';

const CollegeList = () => {
  const [college, setCollege] = useState('');
  const [colleges, setColleges] = useState([]);

  const handleAddCollege = () => {
    if (college.trim() !== '') {
      setColleges([...colleges, college]);
      setCollege('');
    }
  };

  return (
    <div className="college-list">
      <input
        type="text"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
        placeholder="Enter college name"
      />
      <button onClick={handleAddCollege}>Add</button>
      <ul>
        {colleges.map((college, index) => (
          <li key={index}>{college}</li>
        ))}
      </ul>
    </div>
  );
};

export default CollegeList;
