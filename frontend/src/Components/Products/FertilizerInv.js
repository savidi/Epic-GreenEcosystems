import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./FertilizerInv.css";
import NavInv from "../NavInv/NavInv";

const URL = "http://localhost:5000/fertilizers"; // backend endpoint

const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    return res.data.fertilizers || [];
  } catch (error) {
    console.error("Error fetching fertilizers:", error);
    return [];
  }
};

function FertilizerInv() {
  const navigate = useNavigate();
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandler().then((data) => {
      setFertilizers(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="supplier-layout">
        <NavInv />
        <div className="supplier-main-content">
          <div className="supplier-loading">
            <div className="supplier-loading-spinner"></div>
            <p>Loading fertilizers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-layout">
      <NavInv /> {/* Sidebar */}

      <div className="supplier-main-content">
        <div className="supplier-header">
          <h1>Fertilizer Details</h1>
          <p>Overview and actions for the selected fertilizers.</p>
          
        </div>

        <div className="supplier-table-container">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fertilizers.length > 0 ? (
                fertilizers.map((f) => (
                  <FertilizerRow key={f._id} fertilizer={f} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="supplier-no-data">
                    No fertilizers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FertilizerRow({ fertilizer }) {
  const navigate = useNavigate();
  const { _id, fertilizerName, fType, quantity, price, date } = fertilizer;

  const formattedDate = date ? new Date(date).toLocaleDateString() : "-";

  const deleteHandler = async () => {
    if (!window.confirm("Are you sure you want to delete this fertilizer?"))
      return;

    try {
      await axios.delete(`http://localhost:5000/fertilizers/${_id}`);
      navigate(0); // refresh page
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete fertilizer.");
    }
  };

  return (
    <tr>
      <td>{fertilizerName || "-"}</td>
      <td>{fType || "-"}</td>
      <td>{quantity ? `${quantity} kg` : "-"}</td>
      <td>{price ? `Rs. ${price}` : "-"}</td>
      <td>{formattedDate}</td>
      <td>
        <div className="supplier-actions">
          <button
            onClick={deleteHandler}
            className="supplier-btn-secondary2 supplier-btn-sm"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default FertilizerInv;