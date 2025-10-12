import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Fertilizers.css";
import NavSup from "../NavSup/NavSup";

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

function Fertilizer() {
  const navigate = useNavigate();
  const [fertilizers, setFertilizers] = useState([]);

  useEffect(() => {
    fetchHandler().then(setFertilizers);
  }, []);

  return (
    <div className="sup-layout">
      <NavSup /> {/* Sidebar */}

      <div className="sup-main-content">
        <div className="sup-header">
          <h1>Fertilizer Details</h1>
          <p>Overview and actions for the selected fertilizers.</p>
          <button
            className="sup-btn"
            onClick={() => navigate("/addfertilizers")}
          >
            Add Fertilizer
          </button>
        </div>

        <div className="sup-table-container">
          <table className="sup-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {fertilizers.length > 0 ? (
                fertilizers.map((f) => (
                  <FertilizerRow key={f._id} fertilizer={f} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="sup-no-data">
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
        <div className="sup-actions">
          <Link to={`/updatefertilizers/${_id}`} className="sup-btn2 sup-btn-sm">
            Update
          </Link>
          <button
            onClick={deleteHandler}
            className="sup-btn-secondary2 sup-btn-sm"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default Fertilizer;