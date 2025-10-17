import React from 'react';
import './ReportLetterhead.css';

const ReportLetterhead = ({ title, date, farmName = 'Your Farm Name' }) => {
  return (
    <div className="report-letterhead">
      <div className="letterhead-header">
        <div className="farm-logo">
          {/* Replace with your logo or farm name */}
          <h1>{farmName}</h1>
          <p className="farm-tagline">Sustainable Farming Excellence</p>
        </div>
        <div className="report-title">
          <h2>{title}</h2>
          <p className="report-date">Generated on: {date || new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <hr className="divider" />
    </div>
  );
};

export default ReportLetterhead;
