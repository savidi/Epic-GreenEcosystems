// src/components/SalesManager/OrderByTypeChart.js (Revised)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
// Removed 'useNavigate' import
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import jsPDF from 'jspdf';

// Register Chart.js components for the donut chart
ChartJS.register(ArcElement, Tooltip, Legend);

const OrderByTypeChart = () => {
    const [orderTypeData, setOrderTypeData] = useState({ local: 0, global: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Removed the useNavigate hook
    const chartRef = useRef(null);

    const fetchOrderTypeCounts = useCallback(async () => {
        setLoading(true);
        try {
            // Removed token check and navigation
            // Removed the headers object from the axios call
            const response = await axios.get('http://localhost:5000/api/sales/order-type-counts');
            setOrderTypeData(response.data);
        } catch (err) {
            console.error('Error fetching order type data:', err);
            // Removed 401 error handling and redirect
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []); // Removed 'navigate' from the dependency array

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
        <div className="order-type-chart-container">
            <h2>Order Type Distribution</h2>
            {orderTypeData.local > 0 || orderTypeData.global > 0 ? (
                <>
                    <div className="chart-wrapper">
                        <Doughnut ref={chartRef} data={chartData} options={options} />
                    </div>
                    <button onClick={handleExportPdf} className="export-pdf-button">
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