// OrderStatusChart.js (Revised)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Removed 'useNavigate' import
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const OrderStatusChart = () => {
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Removed the useNavigate hook

    const fetchOrderStatusCounts = useCallback(async () => {
        setLoading(true);
        try {
            // Removed token check and navigation
            // Removed the headers object from the axios call
            const response = await axios.get('http://localhost:5000/api/sales/order-status-counts');
            setStatusData(response.data);
        } catch (err) {
            console.error('Error fetching order status data:', err);
            // Removed 401 error handling and redirect
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []); // Removed 'navigate' from the dependency array

    useEffect(() => {
        fetchOrderStatusCounts();
    }, [fetchOrderStatusCounts]);

    if (loading) {
        return <div>Loading order status chart...</div>;
    }

    if (error) {
        return <div>Error: Failed to load order status data.</div>;
    }

    const labels = statusData.map(item => item._id);
    const data = statusData.map(item => item.count);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Number of Orders',
                data: data,
                backgroundColor: [
                    'rgba(230, 157, 47, 0.8)',   // Pending
                    'rgba(36, 166, 44, 0.8)',   // Paid
                    'rgba(153, 102, 255, 0.8)',   // Shipped
                    'rgba(78, 55, 13, 0.8)',   // Delivered
                    'rgba(206, 46, 24, 0.8)',  // Cancelled
                    'rgba(255, 159, 64, 0.8)',   // Quotation statuses
                    'rgba(199, 199, 199, 0.8)',
                ],
                borderColor: [
                    'rgba(230, 157, 47, 0.8)',
                    'rgba(36, 166, 44, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(78, 55, 13, 0.8)',
                    'rgba(206, 46, 24, 0.8)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    padding: 20,
                },
            },
            title: {
                display: true,
                text: 'Distribution of Order Status',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const hasData = statusData.some(item => item.count > 0);

    return (
        <div className="order-status-chart-container">
            <h2>Order Status Distribution</h2>
            {hasData ? (
                <div className="chart-wrapper">
                    <Doughnut data={chartData} options={options} />
                </div>
            ) : (
                <p>No order status data available.</p>
            )}
        </div>
    );
};

export default OrderStatusChart;