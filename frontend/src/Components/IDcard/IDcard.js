// src/Components/StaffManagement/IDCard.js
import React, { forwardRef } from "react";
import "./IDcard.css";

const IDCard = forwardRef(({ staff }, ref) => {
  const logo = process.env.PUBLIC_URL + "/favicon.ico";

  return (
    <div
      className="idcard-id-card"
      ref={ref}
      style={{ backgroundColor: "#fff" }} // Force white background
    >
      {/* Header */}
      <div className="idcard-id-card-header">
        <img src={logo} alt="Logo" className="idcard-id-card-logo" />
        <div className="idcard-header-text">
          <h3 className="idcard-id-card-title">Staff ID</h3>
          <p className="idcard-company-name">Epic Green</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="idcard-id-card-content">
        {/* Staff Photo */}
        <div className="idcard-id-card-photo-section">
          {staff.photo ? (
            <img
              src={staff.photo}
              alt="Staff"
              className="idcard-staff-photo"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="idcard-no-photo">📷</div>
          )}
        </div>

        {/* Staff Info */}
        <div className="idcard-id-card-info">
          <h3 className="idcard-staff-name">{staff.name}</h3>
          <div className="idcard-info-row">
            <span className="idcard-label">ID:</span>
            <span className="idcard-value">{staff.nationalId}</span>
          </div>
          <div className="idcard-info-row">
            <span className="idcard-label">position:</span>
            <span className="idcard-value">{staff.staffType}</span>
            <span className="idcard-value">{staff.position}</span>
          </div>
          {/*<div className="info-row">
            <span className="label">Email:</span>
            <span className="value email">{staff.email}</span>
          </div>*/}
        </div>

        {/* QR Code */}
        {staff.qrCode && (
          <div className="idcard-id-card-qr-section">
            <img
              src={staff.qrCode}
              alt="QR"
              className="idcard-id-card-qr"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="idcard-id-card-footer">
        <p className="website">www.epicgreen.com</p>
      </div>
    </div>
  );
});

export default IDCard;
