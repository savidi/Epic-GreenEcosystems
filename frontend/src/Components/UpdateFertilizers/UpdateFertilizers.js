import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NavSup from "../NavSup/NavSup";

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

  // Fetch fertilizer details
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/fertilizers/${id}`);
        if (res.data && res.data.fertilizer) {
          setInput({
            fertilizerName: res.data.fertilizer.fertilizerName || "",
            fType: res.data.fertilizer.fType || "",
            quantity: res.data.fertilizer.quantity || "",
            price: res.data.fertilizer.price || "",
            date: res.data.fertilizer.date
              ? res.data.fertilizer.date.substring(0, 10)
              : ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch fertilizer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHandler();
  }, [id]);

  // Update fertilizer
  const sendRequest = async () => {
    return await axios.put(`http://localhost:5000/fertilizers/${id}`, {
      fertilizerName: String(input.fertilizerName),
      fType: String(input.fType),
      quantity: Number(input.quantity),
      price: Number(input.price),
      date: String(input.date)
    });
  };

  const handleChange = (e) => {
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ✅ Date validation
  const validateDate = () => {
    const today = new Date().toISOString().split("T")[0];
    if (input.date < today) {
      alert("Date cannot be in the past. Please select a valid date.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateDate()) return;
    sendRequest().then(() => navigate("/fertilizers"));
  };

  if (loading) return <p>Loading fertilizer details...</p>;

  return (

    <div className="updatefertilizers-nav">
                <NavSup /> {/* Sidebar */}

    <div>
      <h1>Update Fertilizer</h1>
      <form onSubmit={handleSubmit}>
        <div className="updatefertilizers-form-group">
          <label htmlFor="fertilizerName">Fertilizer Name</label>
          <select
            id="fertilizerName"
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

        <div className="updatefertilizers-form-group">
          <label htmlFor="fType">Fertilizer Type</label>
          <select
            id="fType"
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

        <div className="updatefertilizers-form-group">
          <label htmlFor="quantity">Quantity (kg)</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={input.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="updatefertilizers-form-group">
          <label htmlFor="price">Price (LKR)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={input.price}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="updatefertilizers-form-group">
          <label htmlFor="date">Manufacture / Entry Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={input.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="updatefertilizers-modal-actions">
          <button type="submit" className="updatefertilizers-btn">
            Update Fertilizer
          </button>
        </div>
      </form>
    </div>

    </div>
  );
}

export default UpdateFertilizer;
