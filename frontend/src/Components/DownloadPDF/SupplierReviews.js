 // src/Components/StaffManagement/SupplierReviews.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SupplierReviews.css";
import NavSup from "../NavSup/NavSup";

const URL = "http://localhost:5000/suppliers";

const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    return res.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { suppliers: [] };
  }
};

function SupplierReviews() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => {
      const suppliersWithReviews = (data.suppliers || []).map((supplier) => ({
        ...supplier,
        ...calculateSupplierMetrics(supplier),
      }));
      setSuppliers(suppliersWithReviews);
    });
  }, []);

  const calculateSupplierMetrics = (supplier) => {
    const registrationDate = new Date(supplier.date);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate - registrationDate) / (1000 * 60 * 60 * 24)
    );

    let supplyDuration = "New";
    let performanceScore = 0;
    let reviewCategory = "pending";

    if (daysDifference > 365) {
      supplyDuration = "Long-term (1+ years)";
      performanceScore = 95;
      reviewCategory = "excellent";
    } else if (daysDifference > 180) {
      supplyDuration = "Medium-term (6+ months)";
      performanceScore = 85;
      reviewCategory = "good";
    } else if (daysDifference > 90) {
      supplyDuration = "Short-term (3+ months)";
      performanceScore = 75;
      reviewCategory = "average";
    } else if (daysDifference > 30) {
      supplyDuration = "Recent (1+ months)";
      performanceScore = 65;
      reviewCategory = "new";
    } else {
      supplyDuration = "New (< 1 month)";
      performanceScore = 50;
      reviewCategory = "pending";
    }

    const qtyScore =
      supplier.qty > 100
        ? 20
        : supplier.qty > 50
        ? 15
        : supplier.qty > 20
        ? 10
        : 5;

    performanceScore += qtyScore;

    return {
      supplyDuration,
      performanceScore: Math.min(performanceScore, 100),
      reviewCategory,
      daysSinceRegistration: daysDifference,
      qualityRating: Math.ceil(performanceScore / 20),
    };
  };

  return (
    <div className="sup-page">
      <NavSup /> {/* Sidebar Navigation */}

      <div className="sup-content">
        <div className="sup-container">
          <h1 className="sup-title">Supplier Performance Reviews</h1>

          <div className="sup-table-container">
            <table className="sup-table">
              <thead>
                <tr>
                  <th>Supplier Details</th>
                  <th>Spice & Quantity</th>
                  <th>Supply Duration</th>
                  <th>Performance</th>
                  <th>Rating</th>
                  <th>Review Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length > 0 ? (
                  suppliers.map((supplier, i) => (
                    <tr key={i} className={`sup-review-${supplier.reviewCategory}`}>
                      <td>
                        <div className="sup-supplier-info">
                          <strong>{supplier.name || "-"}</strong>
                          <br />
                          <small>{supplier.email || "-"}</small>
                          <br />
                          <small>{supplier.phoneno || "-"}</small>
                        </div>
                      </td>
                      <td>
                        <div className="sup-spice-info">
                          <span className="sup-spice-name">{supplier.spicename || "-"}</span>
                          <br />
                          <span className="sup-quantity">
                            {supplier.qty ? `${supplier.qty} kg` : "-"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="sup-duration-info">
                          <span className="sup-duration">{supplier.supplyDuration}</span>
                          <br />
                          <small>{supplier.daysSinceRegistration} days</small>
                        </div>
                      </td>
                      <td>
                        <div className="sup-performance-info">
                          <div className="sup-performance-bar">
                            <div
                              className="sup-performance-fill"
                              style={{ width: `${supplier.performanceScore}%` }}
                            ></div>
                          </div>
                          <span className="sup-performance-score">
                            {supplier.performanceScore}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="sup-rating-info">
                          <div className="sup-stars">
                            {"★".repeat(supplier.qualityRating)}
                            {"☆".repeat(5 - supplier.qualityRating)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`sup-review-badge sup-${supplier.reviewCategory}`}>
                          {supplier.reviewCategory.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupplierReviews;

