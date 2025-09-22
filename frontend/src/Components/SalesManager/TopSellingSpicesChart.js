import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './SalesManager.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TopSellingSpicesChart = () => {
    const [topSpices, setTopSpices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchTopSpices = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            const response = await axios.get('http://localhost:5000/api/sales/top-spices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTopSpices(response.data);
        } catch (err) {
            console.error('Error fetching top selling spices:', err);
            if (err.response && err.response.status === 401) {
                setError('Access denied. You may not have permission to access top selling spices data.');
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchTopSpices();
    }, [fetchTopSpices]);

    // NEW: Function to handle CSV export
    const handleExportSpices = () => {
        if (!topSpices || topSpices.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["Spice Name", "Total Sales Quantity"];
        const csvRows = topSpices.map(item => [
            `"${item.spiceName}"`, 
            item.totalQuantity
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', 'top_selling_spices.csv');
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div>Loading top spices data...</div>;
    }

    if (error) {
        return <div>Error: Failed to load top spices data.</div>;
    }

    // Define an array of colors for the different bars
    const barColors = [
      'rgba(233, 87, 14, 0.6)', // Cardamom
      'rgba(142, 78, 14, 0.6)',   // Cloves
      'rgba(177, 94, 58, 0.6)', // Cinnamon
      'rgba(236, 189, 156, 0.6)',  // Nutmeg
      'rgba(57, 38, 29, 0.6)'    // Black Pepper
    ];

    const borderColors = [
      'rgba(226, 60, 14, 1)',
      'rgba(111, 84, 56, 1)',
      'rgba(152, 114, 94, 1)',
      'rgba(210, 174, 148, 1)',
      'rgba(30, 22, 18, 1)'
    ];

    const chartData = {
        labels: topSpices.map(item => item.spiceName),
        datasets: [
            {
                label: 'Sales Quantity',
                data: topSpices.map(item => item.totalQuantity),
                backgroundColor: barColors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y', 
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: false,
                text: 'Top Selling Spices by Sales Quantity',
            },
        },
    };

    return (
        <>
            <div className="salesmanager-chart-header">
                <h2>Top Selling Spices</h2>
                <button className="salesmanager-toggle-button" onClick={handleExportSpices}>
                    Export to CSV
                </button>
            </div>
            <div className="salesmanager-top-spices-chart">
                {topSpices.length > 0 ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <p>No sales data available for top spices.</p>
                )}
            </div>
        </>
    );
};

export default TopSellingSpicesChart;