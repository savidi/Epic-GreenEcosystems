import React, { useState, useEffect } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaSun, FaMoon, FaShieldAlt, FaBell, FaLock, FaPalette } from 'react-icons/fa';
import './profile.css'; // Renamed CSS file

function Profile() {
    const [darkTheme, setDarkTheme] = useState(false);
    
    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setDarkTheme(savedTheme === 'dark');
            document.body.className = savedTheme === 'dark' ? 'dark-theme' : 'light-theme';
        }
    }, []);
    
    const toggleTheme = () => {
        const newTheme = !darkTheme;
        setDarkTheme(newTheme);
        // Apply theme to body
        document.body.className = newTheme ? 'dark-theme' : 'light-theme';
        // Save theme preference
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };
    
    const handleLogout = () => {
        // Implement logout logic here
        console.log('Logging out...');
        // Clear localStorage/sessionStorage
        localStorage.clear();
        // Redirect to login page
        window.location.href = '/login';
    };
    
    return (
        // Renamed component class to profile-page
        <div className={`profile-page ${darkTheme ? 'profile-dark-theme' : 'profile-light-theme'}`}>
            {/* Main Content */}
            <div className="account-content-wrapper">
                {/* Enhanced Header */}
                <div className="account-header">
                    <div className="account-header-icon">
                        <FaUser />
                    </div>
                    <h1>User Profile</h1> {/* Updated Header Text */}
                    <p>Manage your profile, security, and preferences</p>
                    <div className="account-header-badge">
                        <FaShieldAlt className="account-badge-icon" />
                        <span>Secure Account</span>
                    </div>
                </div>
                
                <div className="account-content">
                    {/* Profile Information Card */}
                    <div className="account-settings-card account-profile-card">
                        <div className="account-card-header">
                            <div className="account-card-icon">
                                <FaUser />
                            </div>
                            <div>
                                <h3>Profile Information</h3>
                                <p>Update your personal details and contact information</p>
                            </div>
                        </div>
                        <div className="account-form-grid">
                            <div className="account-form-group">
                                <label>
                                    <FaUser className="account-field-icon" />
                                    Full Name
                                </label>
                                {/* Updated Full Name */}
                                <input type="text" defaultValue="Patali Tennakoon" placeholder="Enter your full name" />
                            </div>
                            <div className="account-form-group">
                                <label>
                                    <FaUser className="account-field-icon" />
                                    Email Address
                                </label>
                                {/* Updated Email Address */}
                                <input type="email" defaultValue="patalitennakoon@gmail.com" placeholder="Enter your email" />
                            </div>
                            <div className="account-form-group">
                                <label>
                                    <FaShieldAlt className="account-field-icon" />
                                    Role
                                </label>
                                {/* Updated Role */}
                                <input type="text" defaultValue="Sales Manager" disabled />
                                <small className="account-field-hint">Role assigned by system administrator</small>
                            </div>
                        </div>
                        <div className="account-card-actions">
                            <button className="account-save-btn">
                                <FaCog className="account-btn-icon" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                    
                    {/* Appearance Card */}
                    <div className="account-settings-card account-appearance-card">
                        <div className="account-card-header">
                            <div className="account-card-icon">
                                <FaPalette />
                            </div>
                            <div>
                                <h3>Appearance</h3>
                                <p>Customize your interface and display preferences</p>
                            </div>
                        </div>
                        <div className="account-theme-section">
                            <h4>Theme Selection</h4>
                            <div className="account-theme-selector">
                                <div 
                                    className={`account-theme-option ${!darkTheme ? 'account-active' : ''}`}
                                    onClick={() => setDarkTheme(false)}
                                >
                                    <div className="account-theme-preview account-light-preview"></div>
                                    <div className="account-theme-info">
                                        <FaSun className="account-theme-icon" />
                                        <div>
                                            <strong>Light Theme</strong>
                                            <span>Clean and bright interface</span>
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    className={`account-theme-option ${darkTheme ? 'account-active' : ''}`}
                                    onClick={() => setDarkTheme(true)}
                                >
                                    <div className="account-theme-preview account-dark-preview"></div>
                                    <div className="account-theme-info">
                                        <FaMoon className="account-theme-icon" />
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
                    <div className="account-settings-card account-security-card">
                        <div className="account-card-header">
                            <div className="account-card-icon">
                                <FaLock />
                            </div>
                            <div>
                                <h3>Security</h3>
                                <p>Manage your account security and authentication</p>
                            </div>
                        </div>
                        <div className="account-security-options">
                            <div className="account-security-item">
                                <div className="account-security-info">
                                    <h4>Password</h4>
                                    <p>Last changed 3 months ago</p>
                                </div>
                                <button className="account-security-btn">Change Password</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Logout Button at Bottom */}
                <div className="account-footer">
                    <div className="account-footer-content">
                        <p>Need to leave? Your session will be securely terminated.</p>
                        <button className="account-logout-btn" onClick={handleLogout}>
                            <FaSignOutAlt className="account-logout-icon" />
                            Secure Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;