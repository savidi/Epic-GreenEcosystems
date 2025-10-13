import React, { useState, useEffect } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaSun, FaMoon, FaShieldAlt, FaLock, FaPalette } from 'react-icons/fa';
import './profileInv.css';
import NavInv from "../NavInv/NavInv";

function ProfileInv() {
    const [darkTheme, setDarkTheme] = useState(false);
    
    // Function to handle theme change and save preference
    const applyTheme = (isDark) => {
        setDarkTheme(isDark);
        document.body.className = isDark ? 'dark-theme' : 'light-theme';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
    
    useEffect(() => {
        // Check for saved theme preference on mount
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme === 'dark');
        } else {
            // Apply default theme if none saved (light theme in this case)
            document.body.className = 'light-theme';
        }
    }, []);
    

    
    return (
        <div className={`profileinv-page ${darkTheme ? 'profileinv-dark-theme' : 'profileinv-light-theme'}`}>
            <NavInv /> {/* Sidebar */}
            
            {/* Main Content */}
            <div className="profileinv-content-wrapper">
                {/* Enhanced Header */}
                <div className="profileinv-header">
                    <div className="profileinv-header-icon">
                        <FaUser />
                    </div>
                    <h1>Profile Settings</h1>
                    <p>Manage your profile, security, and preferences</p>
                    <div className="profileinv-header-badge">
                        <FaShieldAlt className="profileinv-badge-icon" />
                        <span>Secure Profile</span>
                    </div>
                </div>
                
                <div className="profileinv-content">
                    {/* Profile Information Card */}
                    <div className="profileinv-settings-card profileinv-profile-card">
                        <div className="profileinv-card-header">
                            <div className="profileinv-card-icon">
                                <FaUser />
                            </div>
                            <div>
                                <h3>Profile Information</h3>
                                <p>Update your personal details and contact information</p>
                            </div>
                        </div>
                        <div className="profileinv-form-grid">
                            <div className="profileinv-form-group">
                                <label>
                                    <FaUser className="profileinv-field-icon" />
                                    Full Name
                                </label>
                                <input type="text" defaultValue="Nithya Waidyarathne" placeholder="Enter your full name" />
                            </div>
                            <div className="profileinv-form-group">
                                <label>
                                    <FaUser className="profileinv-field-icon" />
                                    Email Address
                                </label>
                                <input type="email" defaultValue="nithya@epicgreen.com" placeholder="Enter your email" />
                            </div>
                            <div className="profileinv-form-group">
                                <label>
                                    <FaShieldAlt className="profileinv-field-icon" />
                                    Role
                                </label>
                                <input type="text" defaultValue="Stock Manager" disabled />
                                <small className="profileinv-field-hint">Role assigned by system administrator</small>
                            </div>
                        </div>
                        <div className="profileinv-card-actions">
                            <button className="profileinv-save-btn">
                                <FaCog className="profileinv-btn-icon" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                    
                    {/* Appearance Card */}
                    <div className="profileinv-settings-card profileinv-appearance-card">
                        <div className="profileinv-card-header">
                            <div className="profileinv-card-icon">
                                <FaPalette />
                            </div>
                            <div>
                                <h3>Appearance</h3>
                                <p>Customize your interface and display preferences</p>
                            </div>
                        </div>
                        <div className="profileinv-theme-section">
                            <h4>Theme Selection</h4>
                            <div className="profileinv-theme-selector">
                                <div 
                                    className={`profileinv-theme-option ${!darkTheme ? 'profileinv-active' : ''}`}
                                    onClick={() => applyTheme(false)} // Use applyTheme
                                >
                                    <div className="profileinv-theme-preview profileinv-light-preview"></div>
                                    <div className="profileinv-theme-info">
                                        <FaSun className="profileinv-theme-icon" />
                                        <div>
                                            <strong>Light Theme</strong>
                                            <span>Clean and bright interface</span>
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    className={`profileinv-theme-option ${darkTheme ? 'profileinv-active' : ''}`}
                                    onClick={() => applyTheme(true)} // Use applyTheme
                                >
                                    <div className="profileinv-theme-preview profileinv-dark-preview"></div>
                                    <div className="profileinv-theme-info">
                                        <FaMoon className="profileinv-theme-icon" />
                                        <div>
                                            <strong>Dark Theme</strong>
                                            <span>Easy on the eyes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Security Card */}
                    <div className="profileinv-settings-card profileinv-security-card">
                        <div className="profileinv-card-header">
                            <div className="profileinv-card-icon">
                                <FaLock />
                            </div>
                            <div>
                                <h3>Security</h3>
                                <p>Manage your profile security and authentication</p>
                            </div>
                        </div>
                        <div className="profileinv-security-options">
                            <div className="profileinv-security-item">
                                <div className="profileinv-security-info">
                                    <h4>Password</h4>
                                    <p>Last changed 3 months ago</p>
                                </div>
                                <button className="profileinv-security-btn">Change Password</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Logout Button at Bottom */}
                <div className="profileinv-footer">
                    <div className="profileinv-footer-content">
                        <p>Need to leave? Your session will be securely terminated.</p>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileInv;