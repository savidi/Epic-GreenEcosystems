// TopSellingSpicesChart.js (Revised)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Remove the useNavigate import
// import { useNavigate } from 'react-router-dom';
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
    // Remove the useNavigate hook
    // const navigate = useNavigate();

    const fetchTopSpices = useCallback(async () => {
        setLoading(true);
        try {

            const response = await axios.get('http://localhost:5000/api/sales/top-spices');
            setTopSpices(response.data);
        } catch (err) {
            console.error('Error fetching top selling spices:', err);
            setError(err); // Keep a generic error handler
        } finally {
            setLoading(false);
        }
    }, []); // Removed [navigate] from the dependency array

    useEffect(() => {
        fetchTopSpices();
    }, [fetchTopSpices]);

    // ... (rest of the component is the same) ...

        // NEW IMPLEMENTATION FOR EXPORT
    const handleExportSpices = () => {
        if (!topSpices || topSpices.length === 0) {
            alert("No data to export.");
            return;
        }

        // 1. Define the CSV headers
        const headers = ["Spice Name", "Total Quantity Sold"];

        // 2. Map the data to CSV rows
        const csvRows = topSpices.map(item => [
            // Ensure any commas in the spice name are handled (e.g., by wrapping in quotes)
            `"${item.spiceName.replace(/"/g, '""')}"`, 
            item.totalQuantity
        ]);

        // 3. Combine headers and rows into the final CSV content
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        // 4. Create a Blob and trigger the download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'top_selling_spices.csv');
        link.style.display = 'none';
        
        // Append to body, click, and clean up
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

    // ... (rest of the component is the same, including chart data and options) ...

    const barColors = [
      'rgba(233, 87, 14, 0.6)', 
      'rgba(142, 78, 14, 0.6)', 
      'rgba(177, 94, 58, 0.6)', 
      'rgba(236, 189, 156, 0.6)',
      'rgba(57, 38, 29, 0.6)'
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
            <div className="chart-header">
                <h2>Top Selling Spices</h2>
                <button className="toggle-button" onClick={handleExportSpices}>
                    Export to CSV
                </button>
            </div>
            <div className="top-spices-chart">
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