// src/components/SalesManager/OrderByTypeChart.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import jsPDF from 'jspdf';
import './SalesManager.css';

// Register Chart.js components for the donut chart
ChartJS.register(ArcElement, Tooltip, Legend);

const OrderByTypeChart = () => {
    const [orderTypeData, setOrderTypeData] = useState({ local: 0, global: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const chartRef = useRef(null);

    const fetchOrderTypeCounts = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            const response = await axios.get('http://localhost:5000/api/sales/order-type-counts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderTypeData(response.data);
        } catch (err) {
            console.error('Error fetching order type data:', err);
            if (err.response && err.response.status === 401) {
                setError('Access denied. You may not have permission to access order type data.');
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchOrderTypeCounts();
    }, [fetchOrderTypeCounts]);

    const handleExportPdf = () => {
        if (chartRef.current) {
            const doc = new jsPDF();
            const chartImage = chartRef.current.toBase64Image();

            doc.setFontSize(18);
            doc.text('Order Type Distribution Report', 14, 22);
            doc.addImage(chartImage, 'PNG', 15, 30, 180, 180);
            doc.save('order-type-chart.pdf');
        }
    };

    if (loading) {
        return <div>Loading order type chart...</div>;
    }

    if (error) {
        return <div>Error: Failed to load order type data.</div>;
    }

    const chartData = {
        labels: ['Local Orders', 'Global Orders'],
        datasets: [
            {
                label: 'Number of Orders',
                data: [orderTypeData.local, orderTypeData.global],
                backgroundColor: [
                    'rgba(236, 156, 44, 0.8)',
                    'rgba(158, 80, 58, 0.8)',
                ],
                borderColor: [
                    'rgba(236, 156, 44, 0.8)',
                    'rgba(158, 80, 58, 0.8)',
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
                    boxWidth: 10,
                    padding: 20,
                },
            },
            title: {
                display: true,
                text: 'Proportion of Local vs. Global Orders',
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

    return (
        <div className="salesmanager-order-type-chart-container">
            <h2>Order Type Distribution</h2>
            {orderTypeData.local > 0 || orderTypeData.global > 0 ? (
                <>
                    <div className="salesmanager-chart-wrapper">
                        <Doughnut ref={chartRef} data={chartData} options={options} />
                    </div>
                    <button onClick={handleExportPdf} className="salesmanager-export-pdf-button">
                        Export Report (PDF)
                    </button>
                </>
            ) : (
                <p>No order data available for this chart.</p>
            )}
        </div>
    );
};

export default OrderByTypeChart;