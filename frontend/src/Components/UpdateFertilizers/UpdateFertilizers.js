import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NavSup from "../NavSup/NavSup";
import "./UpdateFertilizers.css";

function UpdateFertilizer() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [input, setInput] = useState({
    fertilizerName: "",
    fType: "",
    quantity: "",
    price: "",
    date: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fertilizer details
  useEffect(() => {
    const fetchHandler = async () => {
      if (!id) {
        setError("No fertilizer ID provided");
        setLoading(false);
        return;
      }

      try {
        let fertilizer = null;
        const possibleEndpoints = [
          `http://localhost:5000/fertilizers/${id}`,
          `http://localhost:5000/fertilizer/${id}`,
          `http://localhost:5000/fertilizers/get/${id}`
        ];

        // Try different endpoints
        for (let endpoint of possibleEndpoints) {
          try {
            const res = await axios.get(endpoint);
            if (res.data) {
              if (res.data.fertilizer) {
                fertilizer = res.data.fertilizer;
                break;
              } else if (res.data.data) {
                fertilizer = res.data.data;
                break;
              } else if (res.data.fertilizerName || res.data._id || res.data.id) {
                fertilizer = res.data;
                break;
              } else if (Array.isArray(res.data) && res.data.length > 0) {
                fertilizer = res.data[0];
                break;
              }
            }
          } catch {
            continue;
          }
        }

        // If not found, try to get from all fertilizers list
        if (!fertilizer) {
          const allFertilizersRes = await axios.get("http://localhost:5000/fertilizers");
          let allFertilizers = [];

          if (allFertilizersRes.data.fertilizers) {
            allFertilizers = allFertilizersRes.data.fertilizers;
          } else if (Array.isArray(allFertilizersRes.data)) {
            allFertilizers = allFertilizersRes.data;
          } else if (allFertilizersRes.data.data) {
            allFertilizers = Array.isArray(allFertilizersRes.data.data)
              ? allFertilizersRes.data.data
              : [allFertilizersRes.data.data];
          }

          fertilizer = allFertilizers.find(
            (f) =>
              f._id === id ||
              f.id === id ||
              String(f._id) === String(id) ||
              String(f.id) === String(id)
          );
        }

        if (fertilizer) {
          const formattedDate = fertilizer.date
            ? new Date(fertilizer.date).toISOString().split("T")[0]
            : "";

          setInput({
            fertilizerName: fertilizer.fertilizerName || "",
            fType: fertilizer.fType || fertilizer.type || "",
            quantity: fertilizer.quantity || fertilizer.qty || "",
            price: fertilizer.price || "",
            date: formattedDate
          });
          setError(null);
        } else {
          setError(`Fertilizer with ID "${id}" not found. Please check the ID.`);
        }
      } catch (err) {
        setError(`Failed to fetch fertilizer: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHandler();
  }, [id]);

  // Update fertilizer
  const sendRequest = async () => {
    try {
      const possibleEndpoints = [
        `http://localhost:5000/fertilizers/${id}`,
        `http://localhost:5000/fertilizer/${id}`,
        `http://localhost:5000/fertilizers/update/${id}`
      ];

      let response = null;
      for (let endpoint of possibleEndpoints) {
        try {
          response = await axios.put(endpoint, {
            fertilizerName: String(input.fertilizerName),
            fType: String(input.fType),
            quantity: Number(input.quantity),
            price: Number(input.price),
            date: String(input.date)
          });
          break;
        } catch {
          continue;
        }
      }

      if (!response) throw new Error("All update endpoints failed");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const validateDate = () => {
    const today = new Date();
    const selectedDate = new Date(input.date);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Date cannot be in the past. Please select today or a future date.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.fertilizerName || !input.fType || !input.quantity || !input.price || !input.date) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!validateDate()) return;

    try {
      await sendRequest();
      alert("Fertilizer updated successfully!");
      navigate("/fertilizers");
    } catch (error) {
      alert(`Failed to update fertilizer: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="sup-page">
        <NavSup />
        <div className="sup-form-container">
          <p className="sup-loading">Loading fertilizer details... Fertilizer ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sup-page">
        <NavSup />
        <div className="sup-form-container">
          <div className="sup-error">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate("/fertilizers")}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sup-page">
      <NavSup />
      
      <div className="sup-form-container">
        <h1>Update Fertilizer</h1>
        <p style={{ textAlign: 'center', color: "#666", marginBottom: '20px' }}>
          Fertilizer ID: {id}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="sup-form-group">
            <label>Fertilizer Name *</label>
            <select
              name="fertilizerName"
              value={input.fertilizerName}
              onChange={handleChange}
              required
            >
              <option value="">Select Fertilizer</option>
              <option value="Farmyard Manure">Farmyard Manure</option>
              <option value="Compost">Compost</option>
              <option value="Vermicompost">Vermicompost</option>
              <option value="Green Manure">Green Manure</option>
              <option value="Neem Cake">Neem Cake</option>
              <option value="Castor Cake">Castor Cake</option>
              <option value="Groundnut Cake">Groundnut Cake</option>
              <option value="Coconut Cake">Coconut Cake</option>
              <option value="Bone Meal">Bone Meal</option>
              <option value="Fish Meal">Fish Meal</option>
              <option value="Nitrogen (N) Sources">Nitrogen (N) Sources</option>
              <option value="Phosphorus (P) Sources">Phosphorus (P) Sources</option>
              <option value="Micronutrients">Micronutrients</option>
            </select>
          </div>

          <div className="sup-form-group">
            <label>Fertilizer Type *</label>
            <select
              name="fType"
              value={input.fType}
              onChange={handleChange}
              required
            >
              <option value="">Select Fertilizer Type</option>
              <option value="organic">Organic</option>
              <option value="chemical">Chemical</option>
              <option value="bio">Bio Fertilizer</option>
            </select>
          </div>

          <div className="sup-form-group">
            <label>Quantity (kg) *</label>
            <input
              type="number"
              name="quantity"
              value={input.quantity}
              onChange={handleChange}
              min="1"
              step="0.01"
              required
            />
          </div>

          <div className="sup-form-group">
            <label>Price (LKR) *</label>
            <input
              type="number"
              name="price"
              value={input.price}
              onChange={handleChange}
              min="1"
              step="0.01"
              required
            />
          </div>

          <div className="sup-form-group">
            <label>Manufacture / Entry Date *</label>
            <input
              type="date"
              name="date"
              value={input.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="sup-actions">
            <button
              type="button"
              onClick={() => navigate("/fertilizers")}
              className="sup-btn sup-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="sup-btn sup-btn-primary"
            >
              Update Fertilizer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateFertilizer;