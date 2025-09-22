import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavInv from '../NavInv/NavInv';
//import './Products.css';
import './Addspice.css';
//import './AddFertilizerInv.css'
function Addspice({ onSpiceAdded }) {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ 
        type: "", 
        name: "",
        currentStock: "", 
        unit: "",
        quality: "",
        price: "", 
    });
    
    // Initialize spices as empty array to prevent map error
    const [spices, setSpices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalSpices: 0,
        totalStock: 0,
        avgPrice: 0,
        highQuality: 0
    });

    useEffect(() => {
        fetchSpices();
    }, []);

    const fetchSpices = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await axios.get('http://localhost:5000/spices');
            console.log('API Response:', response.data); // Debug log
            
            // Handle different response formats
            let spicesData = [];
            if (Array.isArray(response.data)) {
                spicesData = response.data;
            } else if (response.data && Array.isArray(response.data.spices)) {
                spicesData = response.data.spices;
            } else if (response.data && Array.isArray(response.data.data)) {
                spicesData = response.data.data;
            } else {
                console.warn('Unexpected API response format:', response.data);
                spicesData = [];
            }
            
            setSpices(spicesData);
            
            // Calculate statistics safely
            const totalSpices = spicesData.length;
            const totalStock = spicesData.reduce((sum, spice) => sum + (spice.currentStock || 0), 0);
            
            
            setStats({ totalSpices, totalStock });
            
        } catch (error) {
            console.error('Failed to fetch spices:', error);
            setError('Failed to load spices. Please check your connection and try again.');
            setSpices([]); // Ensure spices is always an array
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prevState) => {
            const newState = { ...prevState, [name]: value };
            // If source type changes to Plantation, clear price
            if (name === "type" && value === "Plantation") {
                newState.price = "";
            }
            return newState;
        });
    };

    const isPriceReadOnly = inputs.type === "Plantation";

    const handlePriceChange = (e) => {
        if (!isPriceReadOnly) {
            handleChange(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/spices", {
                type: "General Spice",
                name: String(inputs.name),
                currentStock: Number(inputs.currentStock),
                unit: String(inputs.unit),
                quality: String(inputs.quality),
                source: String(inputs.type),
                price: Number(inputs.price),
            });
            
            console.log('Add spice response:', response.data); // Debug log
            
            if (onSpiceAdded) {
                onSpiceAdded();
            }

            setInputs({
                type: "",
                name: "",
                currentStock: "",
                unit: "",
                quality: "",
                price: "",
            });

            // Refresh the spices list
            await fetchSpices();
            alert("Spice added successfully!");

        } catch (error) {
            console.error("Failed to add spice:", error);
            const errorMessage = error.response && error.response.data && error.response.data.message 
                ? error.response.data.message 
                : "Error adding spice. Check the console for details.";
            alert(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this spice?')) {
            try {
                await axios.delete(`http://localhost:5000/spices/${id}`);
                await fetchSpices(); // Refresh the list
                alert('Spice deleted successfully!');
            } catch (error) {
                console.error('Failed to delete spice:', error);
                alert('Error deleting spice');
            }
        }
    };

    const getQualityClass = (quality) => {
        switch (quality?.toLowerCase()) {
            case 'high': return 'quality-high';
            case 'low': return 'quality-low';
            default: return '';
        }
    };

    const getRowClass = (quality) => {
        switch (quality?.toLowerCase()) {
            case 'high': return 'high-quality-row';
            case 'low': return 'low-quality-row';
            default: return '';
        }
    };

   
    // Loading state
    if (loading) {
        return (
            <div className="addspice-products-container">
                <NavInv />
                <div className="addspice-products-content">
                    
                    <div className="addspice-loading">
                        <div className="addspice-loading-spinner"></div>
                        <p>Loading spices...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="addspice-products-container">
            <NavInv />
            
                {/* Error Alert */}
                {error && (
                    <div className="addspice-alert addspice-alert-error">
                        <strong>Error:</strong> {error}
                        <button 
                            onClick={() => setError('')} 
                            style={{ float: 'right', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="addspice-main-spice-content">
                    {/* Statistics Cards */}
                    <div className="inv-main-content">
                    <div className="addspice-stats-container">
                        <div className="stat-card">
                            <h3>Total Spices&nbsp; </h3>
                            <div className="stat-details">
                                <div className="addspice-value"> 6</div>
                                <div className="addspice-unit">varieties</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h3>Total Stock&nbsp;&nbsp;</h3>
                            <div className="stat-details">
                                <div className="addspice-value"> {stats.totalStock}</div>
                                <div className="addspice-unit">kg</div>
                            </div>
                        </div>
                      
                    </div>

                    {/* Add Spice Form */}
                    <div className="addspice-form-section">
                        <h2>Add Spice</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="addspice-field">
                                <label htmlFor="type">Source Type <span>*</span></label>
                                <select id="type" name="type" onChange={handleChange} value={inputs.type} required>
                                    <option value="" disabled>Select a type</option>
                                    <option value="Supplier">Supplier</option>
                                    <option value="Plantation">Plantation</option>
                                </select>
                            </div>

                            <div className="addspice-field">
                                <label htmlFor="name">Spice Name <span>*</span></label>
                                <select id="name" name="name" onChange={handleChange} value={inputs.name} required>
                                    <option value="" disabled>Select a Spice</option>
                                    <option value="Cinnamon">Cinnamon</option>
                                    <option value="Turmeric">Turmeric</option>
                                    <option value="Cloves">Cloves</option>
                                    <option value="Cardamom">Cardamom</option>
                                    <option value="Black Pepper">Black Pepper</option>
                                    <option value="Nutmeg">Nutmeg</option>
                                </select>
                            </div>

                            <div className="addspice-row">
                                <div className="addspice-field">
                                    <label htmlFor="currentStock">Quantity <span>*</span></label>
                                    <input 
                                        id="currentStock" 
                                        name="currentStock" 
                                        type="number" 
                                        min="1" 
                                        step="1" 
                                        placeholder="e.g., 25" 
                                        onChange={handleChange} 
                                        value={inputs.currentStock} 
                                        required 
                                    />
                                </div>

                                <div className="addspice-field">
                                    <label htmlFor="unit">Unit <span>*</span></label>
                                    <select id="unit" name="unit" onChange={handleChange} value={inputs.unit} required>
                                        <option value="" disabled>Select unit</option>
                                        <option value="g">g</option>
                                        <option value="kg">kg</option>
                                    </select>
                                </div>
                            </div>

                            <div className="addspice-field">
                                <label htmlFor="quality">Quality <span>*</span></label>
                                <select id="quality" name="quality" onChange={handleChange} value={inputs.quality} required>
                                    <option value="" disabled>Select quality</option>
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="addspice-field">
                                <label htmlFor="price">Price (Per 100g) <span>*</span></label>
                                <input 
                                    id="price" 
                                    name="price" 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    placeholder="e.g., 1250.00" 
                                    onChange={handlePriceChange} 
                                    value={inputs.price} 
                                    required={!isPriceReadOnly}
                                    readOnly={isPriceReadOnly} 
                                    style={isPriceReadOnly ? { backgroundColor: '#e9e9e9', cursor: 'not-allowed' } : {}}
                                />
                            </div>

                            <button type="submit">ADD SPICE</button>
                        </form>
                    </div>
                    </div>
                </div>
                
            </div>
        
    );
}

export default Addspice;