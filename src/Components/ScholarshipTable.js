import React from 'react';

const parseCSV = (data) => {
  const lines = data.split('\n');
  const headers = lines[0].split(';').map(header => header.trim());
  const rows = lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values = line.split(/;(?!\s)/).map(value => value.trim().replace(/"/g, ''));
    let rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header] = values[index] || '';  // Ensure we handle missing values
    });
    return rowObject;
  });
  return { headers, rows };
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '20px',
  fontSize: '12px'
};

const thStyle = {
  borderBottom: '2px solid #ddd',
  padding: '10px',
  textAlign: 'left',
  backgroundColor: '#f2f2f2',
  fontSize: '12px'
};

const tdStyle = {
  borderBottom: '1px solid #ddd',
  padding: '10px',
  fontSize: '12px'
};

const ScholarshipTable = ({ data }) => {
  const { headers, rows } = parseCSV(data);

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} style={thStyle}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header, colIndex) => (
              <td key={colIndex} style={tdStyle}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScholarshipTable;
