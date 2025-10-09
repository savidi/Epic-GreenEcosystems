import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavInv from "../NavInv/NavInv";
import AddFertilizer from "./AddFertilizerInv";
import './products.css'; 

function Fertilizer() {
  const [fertilizers, setFertilizers] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    getFertilizers();
  }, [updateTrigger]);

  

  const getFertilizers = () => {
    axios.get('http://localhost:5000/fertilizer/')
      .then((res) => {
        setFertilizers(res.data);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const onDelete = (id) => {
    axios.delete(`http://localhost:5000/fertilizer/delete/${id}`)
      .then((res) => {
        alert('Fertilizer Deleted Successfully');
        setUpdateTrigger((prev) => prev + 1); // Trigger re-fetch
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleFertilizerAdded = () => setUpdateTrigger((prev) => prev + 1);

  // const filteredFertilizers = fertilizers.filter(fertilizer => 
  //   selectedType === 'All' || fertilizer.type === selectedType
  // );

  return (
    <div className="fertilizerinv-page-container">
      <NavInv />
      <AddFertilizer onFertilizerAdded={handleFertilizerAdded} />

      <div className="fertilizerinv-content">

      <div className="inv-main-content">
        <div className="fertilizerinv-table-section">
          <h1>Fertilizer Details</h1>
          {/* Removed fertilizer-filter div */}
          {fertilizers.length > 0 ? (
            <table border="1" cellPadding="8" className="fertilizerinv-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fertilizers.map((fertilizer, index) => (
                  <tr key={index}>
                    <td>{fertilizer.fertilizerName}</td>
                    <td>{fertilizer.fType}</td>
                    <td>{fertilizer.price}</td>
                    <td>{fertilizer.quantity}</td>
                    <td>
                      <button onClick={() => onDelete(fertilizer._id)} className='fertilizerinv-btn'>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No fertilizers found. Add one above!</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default Fertilizer;
