import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Addproduct({ spice = {}, onDelete }) {
  const { _id, type, name, currentStock, unit, quality, price, source } = spice; // Renamed quantity to currentStock, sup_price to price, added source

  if (!_id) return null; // skip invalid items

  const deleteHandler = async () => {
    if (!_id) return; // extra safety
    try {
      await axios.delete(`http://localhost:5000/spices/${_id}`);
      if (onDelete) onDelete(_id.toString()); // ensure ID is string
    } catch (err) {
      console.error("Error deleting spice:", err);
    }
  };

  return (
    <tr>
      <td>{_id}</td>
      <td>{source}</td> {/* Display source instead of type */}
      <td>{name}</td>
      <td>{currentStock}</td> {/* Use currentStock */}
      <td>{unit}</td>
      <td>{quality}</td>
      <td>{price}</td> {/* Use price */}
      <td>
        <Link to={`/Products/products/${_id}`} className="update-btn">Update</Link>
        <button onClick={deleteHandler} className="delete-btn">Delete</button>
      </td>

      
    </tr>

  );
}

export default Addproduct;


