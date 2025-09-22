import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link} from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('currentOrderId');
    const token = localStorage.getItem('token');
    
    axios.get('http://localhost:5000/api/orders/pending', {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(()=>{}).finally(()=>{
      
    });
  }, [navigate]);

  return (
     <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Payment Successful!</h1>
      <p>Your order has been placed successfully.</p>
      <Link to='/customer'><button style={{
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        Go to My Dashboard
      </button></Link>
    </div>
  );
}
