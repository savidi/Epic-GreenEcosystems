import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Slider from '../Slider/Slider';
import { Link } from 'react-router-dom';
import Navfield from "../Navfield/Navfield";
import { MapContainer, TileLayer, Marker, Popup, Rectangle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker images directly
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Import images
import CinnamonImg from '../Images/Cinnamon.png';
import CardamomImg from '../Images/Cardomom.png';
import TurmericImg from '../Images/Turmeric.png';
import PepperImg from '../Images/Pepper.png';
import MapImg from '../Images/map.webp';
import RedCilliImg from '../Images/RedChilli.png';
import CloveImg from '../Images/Clove.png';

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
        { title: "Total Land Area", value: "64 Hectares" },
        { title: "Spices Grown", value: "6 Types" },
        { title: "Active Workers", value: "120+" },
        
    ];

    const activities = [
        "Cinnamon fields fertilized on Aug 30",
        "Pepper irrigation completed on Sep 1",
        "Turmeric harvest expected mid-Sep",
        "New workers assigned to Chili plantation",
    ];

    return (
        <div className="dash-container">

             <Navfield />
            <div className="dash-content">
                {/* Slider Section */}
                <section className="dash-slider-section">
                    <Slider />
                </section>
                {/* Stats Section */}
                <section className="dash-section dash-stats-section">
                    <h2>Farm Overview</h2>
                    <div className="dash-stats-cards">
                        {stats.map((stat, index) => (
                            <div key={index} className="dash-stat-card">
                                <h3>{stat.value}</h3>
                                <p>{stat.title}</p>
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
                                    <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                                        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                                            <strong>{division.name}</strong><br/>
                                            <small>{division.description}</small><br/>
                                            <small>Click to zoom in</small>
                                        </div>
                                    </Tooltip>
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
