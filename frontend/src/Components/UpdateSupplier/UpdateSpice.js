 import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./UpdateSpice.css";
import NavSup from "../NavSup/NavSup";

function UpdateSpice() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [input, setInput] = useState({
    name: "",
    phoneno: "",
    address: "",
    email: "",
    date: "",
    spicename: "",
    qty: "",
    price: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch supplier details
  useEffect(() => {
    const fetchHandler = async () => {
      if (!id) {
        setError("No supplier ID provided");
        setLoading(false);
        return;
      }

      try {
        let supplier = null;
        const possibleEndpoints = [
          `http://localhost:5000/suppliers/${id}`,
          `http://localhost:5000/supplier/${id}`,
          `http://localhost:5000/suppliers/get/${id}`
        ];

        for (let endpoint of possibleEndpoints) {
          try {
            const res = await axios.get(endpoint);
            if (res.data) {
              if (res.data.supplier) {
                supplier = res.data.supplier;
                break;
              } else if (res.data.data) {
                supplier = res.data.data;
                break;
              } else if (res.data.name || res.data._id || res.data.id) {
                supplier = res.data;
                break;
              } else if (Array.isArray(res.data) && res.data.length > 0) {
                supplier = res.data[0];
                break;
              }
            }
          } catch {
            continue;
          }
        }

        if (!supplier) {
          const allSuppliersRes = await axios.get("http://localhost:5000/suppliers");
          let allSuppliers = [];

          if (allSuppliersRes.data.suppliers) {
            allSuppliers = allSuppliersRes.data.suppliers;
          } else if (Array.isArray(allSuppliersRes.data)) {
            allSuppliers = allSuppliersRes.data;
          } else if (allSuppliersRes.data.data) {
            allSuppliers = Array.isArray(allSuppliersRes.data.data)
              ? allSuppliersRes.data.data
              : [allSuppliersRes.data.data];
          }

          supplier = allSuppliers.find(
            (s) =>
              s._id === id ||
              s.id === id ||
              String(s._id) === String(id) ||
              String(s.id) === String(id)
          );
        }

        if (supplier) {
          const formattedDate = supplier.date
            ? new Date(supplier.date).toISOString().split("T")[0]
            : "";

          setInput({
            name: supplier.name || "",
            phoneno: supplier.phoneno || supplier.phone || "",
            address: supplier.address || "",
            email: supplier.email || "",
            date: formattedDate,
            spicename: supplier.spicename || supplier.spice || "",
            qty: supplier.qty || supplier.quantity || "",
            price: supplier.price || ""
          });
          setError(null);
        } else {
          setError(`Supplier with ID "${id}" not found. Please check the ID.`);
        }
      } catch (err) {
        setError(`Failed to fetch supplier: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHandler();
  }, [id]);

  // Update supplier
  const sendRequest = async () => {
    try {
      const possibleEndpoints = [
        `http://localhost:5000/suppliers/${id}`,
        `http://localhost:5000/supplier/${id}`,
        `http://localhost:5000/suppliers/update/${id}`
      ];

      let response = null;
      for (let endpoint of possibleEndpoints) {
        try {
          response = await axios.put(endpoint, {
            name: String(input.name),
            phoneno: Number(input.phoneno),
            address: String(input.address),
            email: String(input.email),
            date: String(input.date),
            spicename: String(input.spicename),
            qty: Number(input.qty),
            price: Number(input.price)
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

    if (!input.name || !input.phoneno || !input.address || !input.email || !input.date || !input.spicename || !input.qty || !input.price) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!validateDate()) return;

    try {
      await sendRequest();
      alert("Supplier updated successfully!");
      navigate("/Supdet");
    } catch (error) {
      alert(`Failed to update supplier: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="updatespice-page">
        <NavSup />
        <div className="updatespice-content">
          <p className="updatespice-loading">Loading supplier details... Supplier ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="updatespice-page">
        <NavSup />
        <div className="updatespice-content">
          <div className="updatespice-error">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate("/Supdet")}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="updatespice-page">
      <NavSup />
      
      <div className="updatespice-content">
        <div className="updatespice-form-container">
          <h1>Update Supplier Spice Stock</h1>
          <p style={{ textAlign: 'center', color: "#666", marginBottom: '20px' }}>Supplier ID: {id}</p>

          <form onSubmit={handleSubmit}>
            <div className="updatespice-form-group">
              <label>Supplier Name *</label>
              <input 
                type="text" 
                name="name" 
                value={input.name} 
                readOnly 
              />
            </div>

            <div className="updatespice-form-group">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                name="phoneno" 
                value={input.phoneno} 
                readOnly 
              />
            </div>

            <div className="updatespice-form-group">
              <label>Address *</label>
              <textarea 
                name="address" 
                rows="3" 
                value={input.address} 
                readOnly 
              />
            </div>

            <div className="updatespice-form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                value={input.email} 
                readOnly 
              />
            </div>

            <div className="updatespice-form-group">
              <label>Registration Date *</label>
              <input 
                type="date" 
                name="date" 
                onChange={handleChange} 
                value={input.date} 
                min={new Date().toISOString().split("T")[0]} 
                required 
              />
            </div>

            <div className="updatespice-form-group">
              <label>Spice Type *</label>
              <select 
                name="spicename" 
                onChange={handleChange} 
                value={input.spicename} 
                required
              >
                <option value="">Select Spice Type</option>
                <option value="cinnamon">Cinnamon</option>
                <option value="black-pepper">Black Pepper</option>
                <option value="cardamom">Cardamom</option>
                <option value="cloves">Cloves</option>
                <option value="nutmeg">Nutmeg</option>
                <option value="turmeric">Turmeric</option>
              </select>
            </div>

            <div className="updatespice-form-group">
              <label>Quantity (kg) *</label>
              <input 
                type="number" 
                name="qty" 
                onChange={handleChange} 
                value={input.qty} 
                min="1" 
                step="0.01" 
                required 
              />
            </div>

            <div className="updatespice-form-group">
              <label>Price (LKR) *</label>
              <input 
                type="number" 
                name="price" 
                onChange={handleChange} 
                value={input.price} 
                min="1" 
                step="0.01" 
                required 
              />
            </div>

            <div className="updatespice-actions">
              <button 
                type="button" 
                onClick={() => navigate("/Supdet")} 
                className="updatespice-btn updatespice-btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="updatespice-btn updatespice-btn-primary"
              >
                Update Spice Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateSpice;
