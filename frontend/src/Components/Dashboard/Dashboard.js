import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Slider from '../Slider/Slider';
import { Link } from 'react-router-dom';
import Navfield from "../Navfield/Navfield";

// react-leaflet
import { MapContainer, TileLayer, Marker, Popup, Rectangle, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// chart.js
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// leaflet marker images
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// app images
import CinnamonImg from '../Images/Cinnamon.png';
import CardamomImg from '../Images/Cardomom.png';
import TurmericImg from '../Images/Turmeric.png';
import PepperImg from '../Images/Pepper.png';
import MapImg from '../Images/map.webp';
import RedCilliImg from '../Images/RedChilli.png';
import CloveImg from '../Images/Clove.png';

// ✅ register chart.js plugins after imports
ChartJS.register(ArcElement, ChartTooltip, Legend);

function Dashboard() {
    // Fix for default markers in react-leaflet
    delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

    // Map state
    const [mapCenter, setMapCenter] = useState([7.4666, 80.5667]);
    const [mapZoom, setMapZoom] = useState(15);
    const [selectedDivision, setSelectedDivision] = useState(null);

    // Farm divisions data
    const farmDivisions = [
        {
            id: 1,
            name: "Cinnamon Section",
            description: "Premium cinnamon cultivation area",
            area: "21 Hectares",
            crops: ["Cinnamon"],
            color: "#D4A574",
            bounds: [[7.4680, 80.5640], [7.4650, 80.5690]],
            center: [7.4665, 80.5665]
        },
        {
            id: 2,
            name: "Cardamom Section",
            description: "Cardamom and mixed spice cultivation",
            area: "22 Hectares",
            crops: ["Cardamom", "Turmeric"],
            color: "#C19A6B",
            bounds: [[7.4640, 80.5640], [7.4610, 80.5690]],
            center: [7.4625, 80.5665]
        },
        {
            id: 3,
            name: "Pepper Section",
            description: "Pepper and chili cultivation area",
            area: "21 Hectares",
            crops: ["Pepper", "Red Chili"],
            color: "#A67C52",
            bounds: [[7.4680, 80.5690], [7.4650, 80.5740]],
            center: [7.4665, 80.5715]
        }
    ];

    // Handle division click
    const handleDivisionClick = (division) => {
        setSelectedDivision(division);
        setMapCenter(division.center);
        setMapZoom(18);
    };

    // Reset map view
    const resetMapView = () => {
        setSelectedDivision(null);
        setMapCenter([7.4666, 80.5667]);
        setMapZoom(15);
    };

    // Handle sidebar collapse state
    useEffect(() => {
        const handleSidebarState = () => {
            // Multiple ways to detect sidebar state
            const isCollapsedFromStorage = localStorage.getItem('sidebar-collapsed') === 'true';
            const sidebarElement = document.querySelector('.navfield-sidebar');
            const isCollapsedFromDOM = sidebarElement && sidebarElement.classList.contains('collapsed');
            
            // Use the most reliable method
            const isCollapsed = isCollapsedFromDOM || isCollapsedFromStorage;
            
            const contentWrappers = document.querySelectorAll('.dash-content');
            
            contentWrappers.forEach(wrapper => {
                if (isCollapsed) {
                    // Add collapsed class
                    wrapper.classList.add('sidebar-collapsed');
                    
                    // Set data attribute for CSS targeting
                    wrapper.setAttribute('data-sidebar-collapsed', 'true');
                    
                    // Set CSS custom properties
                    wrapper.style.setProperty('--sidebar-width', '60px');
                    
                    // Fallback inline styles
                    wrapper.style.marginLeft = '60px';
                    wrapper.style.width = 'calc(100% - 60px)';
                } else {
                    // Remove collapsed class
                    wrapper.classList.remove('sidebar-collapsed');
                    
                    // Remove data attribute
                    wrapper.setAttribute('data-sidebar-collapsed', 'false');
                    
                    // Set CSS custom properties
                    wrapper.style.setProperty('--sidebar-width', '220px');
                    
                    // Fallback inline styles
                    wrapper.style.marginLeft = '220px';
                    wrapper.style.width = 'calc(100% - 220px)';
                }
            });
        };

        // Initial setup
        handleSidebarState();

        // Listen for storage changes (when sidebar is toggled)
        window.addEventListener('storage', handleSidebarState);
        
        // Listen for custom event (more reliable for same-page updates)
        window.addEventListener('sidebarStateChanged', handleSidebarState);
        
        // Also listen for DOM changes as a fallback
        const observer = new MutationObserver((mutations) => {
            // Check if any mutation involves the sidebar
            const hasSidebarChange = mutations.some(mutation => {
                return Array.from(mutation.addedNodes).some(node => 
                    node.classList && node.classList.contains('navfield-sidebar')
                ) || Array.from(mutation.removedNodes).some(node => 
                    node.classList && node.classList.contains('navfield-sidebar')
                ) || (mutation.target.classList && mutation.target.classList.contains('navfield-sidebar'));
            });
            
            if (hasSidebarChange) {
                handleSidebarState();
            }
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true,
            childList: true
        });

        // Cleanup
        return () => {
            window.removeEventListener('storage', handleSidebarState);
            window.removeEventListener('sidebarStateChanged', handleSidebarState);
            observer.disconnect();
        };
    }, []);

    const spices = [
        { name: "Cinnamon", description: "Cinnamon is a spice obtained from the inner bark of several tree species.", image: CinnamonImg },
        { name: "Cardamom", description: "Cardamom is known as the queen of spices, used for its strong flavor and aroma.", image: CardamomImg },
        { name: "Turmeric", description: "Turmeric is a bright yellow spice commonly used in Asian cuisine and traditional medicine.", image: TurmericImg },
        { name: "Pepper", description: "Black pepper is the world’s most traded spice and often called the king of spices.", image: PepperImg },
        { name: "Clove", description: "Clove is a spice made from the flower buds of a tree in the family Myrtaceae.", image: CloveImg }, // replace later
        { name: "Red Chili", description: "Red chili peppers are used to add heat and flavor to dishes worldwide.", image: RedCilliImg }, // replace later
    ];

    const stats = [
        { 
            title: "Total Land Area", 
            value: "64", 
            unit: "Hectares",
            description: "Cultivated land across plantation",
            trend: "+2.5% from last year",
            trendType: "positive"
        },
        { 
            title: "Spices Grown", 
            value: "6", 
            unit: "Types",
            description: "Premium spice varieties",
            trend: "Stable",
            trendType: "stable"
        },
        { 
            title: "Active Workers", 
            value: "120+", 
            unit: "Staff",
            description: "Dedicated plantation team",
            trend: "+15 new hires",
            trendType: "positive"
        },

    ];


    const cropDistributionData = {
        labels: ['Cinnamon', 'Cardamom', 'Turmeric', 'Pepper', 'Clove', 'Red Chili'],
        datasets: [
            {
                data: [25, 20, 18, 15, 12, 10],
                backgroundColor: [
                    '#D2691E', // Cinnamon - Chocolate
                    '#228B22', // Cardamom - Forest Green
                    '#FFD700', // Turmeric - Gold
                    '#2F4F4F', // Pepper - Dark Slate Gray
                    '#8B4513', // Clove - Saddle Brown
                    '#DC143C', // Red Chili - Crimson
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ': ' + context.parsed + '%';
                    }
                }
            }
        },
    };

    const activities = [
        "Cinnamon fields fertilized on Aug 30",
        "Pepper irrigation completed on Sep 1",
        "Turmeric harvest expected mid-Sep",
        "New workers assigned to Chili plantation",
    ];


    const harvestSchedule = [
        { month: "January", crops: ["Cardamom"], status: "completed" },
        { month: "February", crops: [], status: "empty" },
        { month: "March", crops: [], status: "empty" },
        { month: "April", crops: ["Pepper"], status: "completed" },
        { month: "May", crops: [], status: "empty" },
        { month: "June", crops: [], status: "empty" },
        { month: "July", crops: ["Clove"], status: "completed" },
        { month: "August", crops: [], status: "empty" },
        { month: "September", crops: ["Turmeric"], status: "upcoming" },
        { month: "October", crops: ["Cinnamon", "Red Chili"], status: "upcoming" },
        { month: "November", crops: [], status: "empty" },
        { month: "December", crops: [], status: "empty" },
    ];

    return (
        <div className="dash-container">

             <Navfield />
            <div className="dash-content">
                {/* Top slider section */}
        <section className="hr-home-slider-section">
          <Slider />
        </section>
                 {/* Stats Section */}
                 <section className="dash-section dash-stats-section">
                    <h2>Farm Overview</h2>
                    <div className="dash-stats-cards">
                        {stats.map((stat, index) => (
                            <div key={index} className="dash-stat-card">
                                
                                <div className="dash-stat-content">
                                    <div className="dash-stat-value">
                                        <span className="dash-stat-number">{stat.value}</span>
                                        <span className="dash-stat-unit">{stat.unit}</span>
                                    </div>
                                    <h3>{stat.title}</h3>
                                    <p className="dash-stat-description">{stat.description}</p>
                                    <div className={`dash-stat-trend ${stat.trendType}`}>{stat.trend}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Interactive Land Map Section */}
                <section className="dash-map-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Farm Location - Satellite View</h2>
                        {selectedDivision && (
                            <button 
                                onClick={resetMapView}
                                className="back-button"
                            >
                                ← Back to Overview
                            </button>
                        )}
                    </div>
                    
                    <div className="map-container">
                        <MapContainer 
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{ height: '500px', width: '100%', borderRadius: '8px' }}
                        >
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution='&copy; <a href="https://www.esri.com/">Esri</a> contributors'
                            />
                            
                            {/* Farm Division Boundaries */}
                            {farmDivisions.map((division) => (
                                <Rectangle
                                    key={division.id}
                                    bounds={division.bounds}
                                    pathOptions={{
                                        color: '#ffffff',
                                        weight: 3,
                                        fillColor: division.color,
                                        fillOpacity: 0.3,
                                        className: 'division-boundary'
                                    }}
                                    eventHandlers={{
                                        click: () => handleDivisionClick(division)
                                    }}
                                >
                                    <LeafletTooltip direction="top" offset={[0, -20]} opacity={1}>
                                        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                                            <strong>{division.name}</strong><br/>
                                            <small>{division.description}</small><br/>
                                            <small>Click to zoom in</small>
                                        </div>
                                    </LeafletTooltip>
                                </Rectangle>
                            ))}
                            
                            {/* Main Farm Marker */}
                            <Marker position={[7.4666, 80.5667]}>
                                <Popup>
                                    <div>
                                        <strong>EPIC Green Farm</strong><br/>
                                        466, Dimbulgamuwa<br/>
                                        Madawala Ulpotha, Matale<br/>
                                        Sri Lanka<br/>
                                        <em>Spice Plantation</em>
                                    </div>
                                </Popup>
                            </Marker>
                            
                            {/* Division Markers (visible when zoomed in) */}
                            {selectedDivision && (
                                <Marker position={selectedDivision.center}>
                                    <Popup>
                                        <div>
                                            <strong>{selectedDivision.name}</strong><br/>
                                            {selectedDivision.description}<br/>
                                            <strong>Area:</strong> {selectedDivision.area}<br/>
                                            <strong>Crops:</strong> {selectedDivision.crops.join(', ')}
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                </section>

                 {/* Crop Distribution & Harvest Calendar Section */}
                    <section className="dash-section dash-chart-calendar-section">
                        <div className="dash-chart-calendar-grid">
                            {/* Left Side - Chart */}
                            <div className="dash-chart-side">
                        <h2>Crop Distribution</h2>
                        <div className="dash-chart-container">
                            <Doughnut data={cropDistributionData} options={chartOptions} />
                            </div>
                            </div>
                            
                            {/* Right Side - Harvest Calendar */}
                            <div className="dash-calendar-side">
                                <h2>Harvest Calendar</h2>
                                <div className="dash-calendar-grid">
                                    {harvestSchedule.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className={`dash-calendar-month ${item.status}`}
                                        >
                                            <div className="dash-month-name">{item.month}</div>
                                            <div className="dash-month-crops">
                                                {item.crops.length > 0 ? (
                                                    item.crops.map((crop, cropIndex) => (
                                                        <span key={cropIndex} className="dash-crop-tag">
                                                            {crop}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="dash-no-crops">—</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="dash-calendar-legend">
                                    <div className="dash-legend-item">
                                        <div className="dash-legend-color completed"></div>
                                        <span>Completed</span>
                                    </div>
                                    <div className="dash-legend-item">
                                        <div className="dash-legend-color upcoming"></div>
                                        <span>Upcoming</span>
                                    </div>
                                    <div className="dash-legend-item">
                                        <div className="dash-legend-color empty"></div>
                                        <span>No Harvest</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    
                {/* Spices Section */}
                <section className="dash-section dash-spice-section">
                    <h2>Our Spices</h2>
                    <div className="dash-spice-cards">
                        {spices.map((spice, index) => (
                            <Link to={`/spices/${spice.name.toLowerCase()}`} key={index} className="dash-spice-card">
                                <img src={spice.image} alt={spice.name} className="dash-spice-img" />
                                <div className="dash-spice-info">
                                    <h3>{spice.name}</h3>
                                    <p>{spice.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <div className="dash-grid">
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
