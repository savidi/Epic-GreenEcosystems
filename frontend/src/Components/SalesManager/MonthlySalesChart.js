// MonthlySalesChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const MonthlySalesChart = ({ data, title }) => {
    const chartData = {
        labels: data.map(item => `${item.month}/${item.year}`),
        datasets: [
            {
                label: 'Revenue (LKR)',
                data: data.map(item => item.totalRevenue),
                borderColor: '#eb6918ff',
                backgroundColor: 'rgba(123, 76, 51, 0.2)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Revenue (LKR)',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Month/Year',
                },
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default MonthlySalesChart;
