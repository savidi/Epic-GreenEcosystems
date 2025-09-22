import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
import './ManhoursChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ManhoursChart() {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const processChartData = useCallback((workers) => {
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const dateManhoursMap = {};
    
    // Initialize days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dateManhoursMap[dateKey] = {
        displayDate: String(day),
        hours: 0,
        sortKey: dateKey
      };
    }
    
    // Add worker hours
    workers.forEach(worker => {
      if (worker.date && worker.workedhoures) {
        const dateParts = worker.date.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1;
          const day = parseInt(dateParts[2]);
          const workerDate = new Date(year, month, day);
          
          if (workerDate.getMonth() === currentMonth.getMonth() && 
              workerDate.getFullYear() === currentMonth.getFullYear()) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hours = parseFloat(worker.workedhoures) || 0;
            if (dateManhoursMap[dateKey]) dateManhoursMap[dateKey].hours += hours;
          }
        }
      }
    });
    
    const dateEntries = Object.values(dateManhoursMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const data = dateEntries.map(entry => entry.hours);
    const maxHours = Math.max(...data);
    
    setChartData({
      labels: dateEntries.map(entry => entry.displayDate),
      datasets: [{
        data: data,
        backgroundColor: data.map((hours) => {
          const intensity = hours / (maxHours || 1);
          if (hours === 0) return 'rgba(239, 235, 233, 0.6)';
          if (intensity < 0.4) return 'rgba(244, 164, 96, 0.8)';
          if (intensity < 0.7) return 'rgba(205, 133, 63, 0.9)';
          return 'rgba(141, 78, 42, 1)';
        }),
        borderColor: data.map((hours) => {
          if (hours === 0) return 'rgba(189, 189, 189, 0.5)';
          return '#8D4E2A';
        }),
        borderWidth: 1,
        borderRadius: 3,
      }],
    });
  }, [currentMonth]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/fieldworkers');
      processChartData(response.data.data || response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setIsLoading(false);
    }
  }, [processChartData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentMonth(newMonth);
  };

  const getTotalHours = () => chartData ? chartData.datasets[0].data.reduce((sum, h) => sum + h, 0) : 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(62, 39, 35, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (ctx) => `Day ${ctx[0].label}`,
          label: (ctx) => ctx.raw === 0 
            ? 'No operations' 
            : `${ctx.raw.toFixed(1)} man-hours worked`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        display: false
      },
      x: {
        ticks: {
          font: { size: 9 },
          color: '#8D4E2A',
          maxRotation: 0
        },
        grid: { display: false }
      },
    },
    animation: { duration: 800 }
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth.getMonth() === now.getMonth() && currentMonth.getFullYear() === now.getFullYear();
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">
            🌿 Field Operations
          </h3>
          <div className="chart-month-display">
            {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
        
        {chartData && (
          <div className="chart-stats-box">
            <div className="chart-stats-label">TOTAL</div>
            <div className="chart-stats-value">
              {getTotalHours().toFixed(0)}h
            </div>
          </div>
        )}
      </div>

      <div className="chart-navigation">
        <button 
          onClick={() => navigateMonth('prev')}
          className="nav-btn"
        >
          ‹
        </button>
        
        <button 
          onClick={() => navigateMonth('next')}
          disabled={isCurrentMonth()}
          className="nav-btn"
        >
          ›
        </button>
        
        <button 
          onClick={fetchData}
          className="refresh-btn"
        >
          ↻
        </button>
      </div>

      {isLoading ? (
        <div className="chart-loading">
          Loading...
        </div>
      ) : error ? (
        <div className="chart-error">
          {error}
        </div>
      ) : chartData ? (
        <>
          <div className="chart-area">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="chart-footer">
            {chartData.labels.length} days
          </div>
        </>
      ) : (
        <div className="chart-no-data">
          No data available
        </div>
      )}
    </div>
  );
}

export default ManhoursChart;
