import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Typography, Tag, Input, Select, Modal, Form, InputNumber, DatePicker, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './plant.css';
import PlantForm from './PlantForm';
import Navfield from "../Navfield/Navfield";

const { Option } = Select;

// Helper function to format frequency
const formatFrequency = (days) => {
  const daysInt = parseInt(days, 10);
  if (isNaN(daysInt)) return 'N/A';
  
  if (daysInt === 1) return 'Daily';
  if (daysInt <= 6) return `Every ${days} days`;
  if (daysInt === 7) return 'Weekly';
  if (daysInt === 14) return 'Every 2 weeks';
  if (daysInt === 21) return 'Every 3 weeks';
  if (daysInt === 28) return 'Every 4 weeks';
  if (daysInt === 30 || daysInt === 31) return 'Monthly';
  return `Every ${days} days`;
};

// Static expected harvest durations (days) per spice (keep in sync with PlantForm)
const HARVEST_DAYS = {
  CINNAMON: 16,
  PEPPER: 90,
  CHILI: 60,
  CARDAMOM: 120,
  TURMERIC: 180,
};

const addDays = (isoDateStr, days) => {
  if (!isoDateStr || !days) return null;
  const d = new Date(isoDateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
};

// PlantCard component to display individual plant details
const PlantCard = ({ plant, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: plant.name,
    description: plant.description || '',
    plantingDivision: plant.plantingDivision,
    wateringFrequency: plant.wateringFrequency,
    fertilizingFrequency: plant.fertilizingFrequency
  });

  const divisions = ['A', 'B', 'C'];
  const frequencyOptions = [
    { value: '1', label: 'Daily' },
    { value: '2', label: 'Every 2 days' },
    { value: '3', label: 'Every 3 days' },
    { value: '7', label: 'Weekly' },
    { value: '14', label: 'Every 2 weeks' },
    { value: '30', label: 'Monthly' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(plant._id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating plant:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="plant-card plant-edit-mode">
         <Navfield />
        <form onSubmit={handleSubmit}>
          <div className="plant-form-group-legacy">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="plant-form-input-basic"
            />
          </div>
          
          <div className="form-group">
            <select
              name="plantingDivision"
              value={formData.plantingDivision}
              onChange={handleChange}
              className="plant-form-input-basic"
              required
            >
              {divisions.map(div => (
                <option key={div} value={div}>Division {div}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="wateringFrequency"
              value={formData.wateringFrequency}
              onChange={handleChange}
              className="plant-form-input-basic"
              required
            >
              {frequencyOptions.map(opt => (
                <option key={`water-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="fertilizingFrequency"
              value={formData.fertilizingFrequency}
              onChange={handleChange}
              className="plant-form-input-basic"
              required
            >
              {frequencyOptions.map(opt => (
                <option key={`fert-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="plant-form-group-legacy">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="plant-form-textarea-basic"
              placeholder="Plant description"
            />
          </div>

          <div className="plant-card-actions">
            <button type="submit" className="plant-btn plant-btn-save">Save</button>
            <button 
              type="button" 
              className="plant-btn plant-btn-cancel"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="plant-card plant-card-detailed">
         <Navfield />
      <div className="plant-card-header">
        <h3 className="plant-card-title">{plant.name}</h3>
        <span className="plant-division">Division {plant.plantingDivision || 'N/A'}</span>
      </div>
      <div className="plant-card-body">
        <div className="plant-info-box">
          <div className="plant-info-grid">
            <p className="plant-card-text"><strong>Plant ID:</strong> {plant.plantId || 'N/A'}</p>
            <p className="plant-card-text"><strong>Division:</strong> {plant.plantingDivision || 'N/A'}</p>
            <p className="plant-card-text"><strong>Planted:</strong> {plant.plantingDate ? new Date(plant.plantingDate).toISOString().slice(0,10) : 'N/A'}</p>
            {plant.expectedHarvest && (
              <p className="plant-card-text"><strong>Expected Harvest:</strong> {plant.expectedHarvest}</p>
            )}
            <p className="plant-card-text"><strong>Watering:</strong> {formatFrequency(plant.wateringFrequency)}</p>
            <p className="plant-card-text"><strong>Fertilizing:</strong> {formatFrequency(plant.fertilizingFrequency)}</p>
          </div>

          {plant.description && (
            <div className="plant-description-inline">
              <p className="plant-card-text"><strong>Description:</strong> {plant.description}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="plant-card-actions">
        <button 
          className="plant-btn plant-btn-edit"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
        <button 
          className="plant-btn plant-btn-delete"
          onClick={() => onDelete(plant._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};


function Plant() {
    const { Title } = Typography;
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingPlant, setEditingPlant] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();
    const [photoModalVisible, setPhotoModalVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
    const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';


    // Sidebar state management
    useEffect(() => {
        const updateBodyClass = () => {
            const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
            if (isCollapsed) {
                document.body.classList.add('sidebar-collapsed');
            } else {
                document.body.classList.remove('sidebar-collapsed');
            }
        };

        // Initial update
        updateBodyClass();

        // Set up interval to check localStorage changes
        const interval = setInterval(updateBodyClass, 100);

        // Cleanup
        return () => {
            clearInterval(interval);
        };
    }, []);

    const divisions = ['A', 'B', 'C'];
    const frequencyOptions = [
        { value: '1', label: 'Daily' },
        { value: '2', label: 'Every 2 days' },
        { value: '3', label: 'Every 3 days' },
        { value: '7', label: 'Weekly' },
        { value: '14', label: 'Every 2 weeks' },
        { value: '30', label: 'Monthly' }
    ];

    const handlePlantAdded = () => {
        fetchPlants();
        setShowForm(false);
    };

    const handleUpdatePlant = async (id, updatedData) => {
        try {
            setIsUpdating(true);
            const response = await fetch(`${API_BASE}/plants/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            
            if (response.ok) {
                await fetchPlants();
                setEditModalVisible(false);
                editForm.resetFields();
            } else {
                throw new Error('Failed to update plant');
            }
        } catch (err) {
            console.error('Error updating plant:', err);
            setError('Failed to update plant');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeletePlant = async (id) => {
        if (window.confirm('Are you sure you want to delete this plant?')) {
            try {
                const response = await fetch(`${API_BASE}/plants/${id}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    await fetchPlants();
                } else {
                    throw new Error('Failed to delete plant');
                }
            } catch (err) {
                console.error('Error deleting plant:', err);
                setError('Failed to delete plant');
            }
        }
    };

    const handleEdit = (plant) => {
        setEditingPlant(plant);
        editForm.setFieldsValue({
            name: plant.name,
            description: plant.description || '',
            plantingDivision: plant.plantingDivision,
            wateringFrequency: plant.wateringFrequency,
            fertilizingFrequency: plant.fertilizingFrequency,
            status: plant.status || 'ACTIVE'
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            await handleUpdatePlant(editingPlant._id, values);
        } catch (error) {
            console.error('Error updating plant:', error);
        }
    };

    const handlePhotoUpload = (plant) => {
        setSelectedPlant(plant);
        setPhotoModalVisible(true);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handlePhotoSubmit = async () => {
        if (!selectedFile || !selectedPlant) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadStatus(null); // Reset status before upload
        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('plantId', selectedPlant._id);
        formData.append('plantName', selectedPlant.name);
        formData.append('reason', 'disease_or_wasted'); // You can make this dynamic

        try {
            const response = await fetch(`${API_BASE}/plants/upload-photo`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadStatus('success');
                // Don't close modal immediately, show success status
                setTimeout(() => {
                    setPhotoModalVisible(false);
                    setSelectedFile(null);
                    setSelectedPlant(null);
                    setUploadStatus(null);
                }, 2000); // Close after 2 seconds
            } else {
                throw new Error('Failed to upload photo');
            }
        } catch (err) {
            console.error('Error uploading photo:', err);
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const fetchPlants = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/plants`);
            const data = await response.json();
            
            if (data.plants) {
                const transformedPlants = data.plants.map(plant => ({
                    key: plant._id,
                    _id: plant._id,
                    plantId: plant.plantId,
                    name: plant.name,
                    description: plant.description,
                    plantingDivision: plant.plantingDivision,
                    wateringFrequency: plant.wateringFrequency || '3',
                    fertilizingFrequency: plant.fertilizingFrequency || '14',
                    status: plant.status || 'ACTIVE',
                    growthStage: plant.growthStage || 'PLANTED',
                    plantingDate: plant.plantingDate,
                    expectedHarvest: plant.plantingDate && HARVEST_DAYS[plant.name]
                      ? addDays(plant.plantingDate, HARVEST_DAYS[plant.name])
                      : null,
                    createdAt: plant.createdAt,
                    lastUpdated: plant.lastUpdated,
                    notes: plant.notes || []
                }));
                setPlants(transformedPlants);
            } else {
                setError('No plants found');
            }
        } catch (err) {
            console.error('Error fetching plants:', err);
            setError('Failed to fetch plants from database');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Plant Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <strong>{text}</strong>
                    {record.description && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                            {record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Plant ID',
            dataIndex: 'plantId',
            key: 'plantId',
        },
        {
            title: 'Division',
            dataIndex: 'plantingDivision',
            key: 'plantingDivision',
        },
        {
            title: 'Planted Date',
            dataIndex: 'plantingDate',
            key: 'plantingDate',
            render: (text) => text ? new Date(text).toISOString().slice(0,10) : 'N/A',
        },
        {
            title: 'Expected Harvest',
            dataIndex: 'expectedHarvest',
            key: 'expectedHarvest',
        },
        {
            title: 'Watering',
            dataIndex: 'wateringFrequency',
            key: 'wateringFrequency',
            render: (text) => formatFrequency(text),
        },
        {
            title: 'Fertilizing',
            dataIndex: 'fertilizingFrequency',
            key: 'fertilizingFrequency',
            render: (text) => formatFrequency(text),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text) => (
                <Tag color={text === 'ACTIVE' ? 'green' : 'orange'}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        style={{ marginRight: 8 }}
                    />
                    <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeletePlant(record._id)}
                    />
                </div>
            ),
        },
    ];

    // Second table columns - excluding Planted Date, Expected Harvest, Watering, Fertilizing, Status, Actions
    const secondTableColumns = [
        {
            title: 'Plant Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <strong>{text}</strong>
                    {record.description && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                            {record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Plant ID',
            dataIndex: 'plantId',
            key: 'plantId',
        },
        {
            title: 'Division',
            dataIndex: 'plantingDivision',
            key: 'plantingDivision',
        },
        {
            title: 'Photo',
            key: 'photo',
            render: (_, record) => (
                <div>
                    <Button 
                        type="primary" 
                        size="small"
                        icon={<UploadOutlined />}
                        onClick={() => handlePhotoUpload(record)}
                    >
                        Upload Photo
                    </Button>
                </div>
            ),
        },
    ];

    useEffect(() => {
        fetchPlants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    if (loading) {
        return (
            <div className="plant-loading-container">
                <Navfield />
                <div className="plant-loading">Loading plant data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="plant-error-container">
                <div className="plant-error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="plant-table-page">
            <Navfield />
            <div className="plant-table-header">
                <Title level={2}>Plant Collection</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Add New Plant'}
                </Button>
            </div>
            
            {showForm && (
                <Card style={{ marginBottom: '1rem' }}>
                    <PlantForm onPlantAdded={handlePlantAdded} />
                </Card>
            )}
            
            <Card>
                <Table
                    dataSource={plants}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                    rowClassName={(record) => 
                        record.status === 'ACTIVE' ? 'active-row' : 'inactive-row'
                    }
                />
            </Card>
            
            {/* Disease and Waste Issues Section */}
            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <Typography.Title level={3} style={{ color: '#8B4513', marginBottom: '0.5rem' }}>
                    🚨 Disease & Waste Issues
                </Typography.Title>
                <Typography.Text style={{ color: '#666', fontSize: '0.9rem' }}>
                    Upload photos for plants that have diseases or are wasted for documentation purposes
                </Typography.Text>
            </div>
            
            {/* Second Table - Simplified Version */}
            <Card>
                <Table
                    dataSource={plants}
                    columns={secondTableColumns}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                    rowClassName={(record) => 
                        record.status === 'ACTIVE' ? 'active-row' : 'inactive-row'
                    }
                />
            </Card>

            {/* Edit Modal */}
            <Modal
                title="Edit Plant"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Plant Name"
                        rules={[{ required: true, message: 'Please input plant name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Plant description" />
                    </Form.Item>

                    <Form.Item
                        name="plantingDivision"
                        label="Division"
                        rules={[{ required: true, message: 'Please select division!' }]}
                    >
                        <Select placeholder="Select division">
                            {divisions.map(div => (
                                <Option key={div} value={div}>Division {div}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="wateringFrequency"
                        label="Watering Frequency"
                        rules={[{ required: true, message: 'Please select watering frequency!' }]}
                    >
                        <Select placeholder="Select watering frequency">
                            {frequencyOptions.map(opt => (
                                <Option key={`water-${opt.value}`} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="fertilizingFrequency"
                        label="Fertilizing Frequency"
                        rules={[{ required: true, message: 'Please select fertilizing frequency!' }]}
                    >
                        <Select placeholder="Select fertilizing frequency">
                            {frequencyOptions.map(opt => (
                                <Option key={`fert-${opt.value}`} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status!' }]}
                    >
                        <Select placeholder="Select status">
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button 
                            style={{ marginRight: 8 }}
                            onClick={() => {
                                setEditModalVisible(false);
                                editForm.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isUpdating}>
                            Save
                        </Button>
                    </Form.Item>
                </Form>

            </Modal>

            {/* Photo Upload Modal */}
            <Modal
                title="Upload Plant Photo"
                open={photoModalVisible}
                onCancel={() => {
                    setPhotoModalVisible(false);
                    setSelectedFile(null);
                    setSelectedPlant(null);
                    setUploadStatus(null);
                }}
                footer={null}
                width={500}
            >
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <p><strong>Plant:</strong> {selectedPlant?.name} (ID: {selectedPlant?.plantId})</p>
                    <p><strong>Division:</strong> {selectedPlant?.plantingDivision}</p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Upload photo for disease or wasted plant documentation</p>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                </div>
                
                {selectedFile && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <p><strong>Selected file:</strong> {selectedFile.name}</p>
                        <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                )}
                
                {/* Upload Status Display */}
                {uploadStatus && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        {uploadStatus === 'success' ? (
                            <div>
                                <Tag color="success" icon={<span>✓</span>} style={{ fontSize: '14px', padding: '4px 12px' }}>
                                    Photo Uploaded Successfully!
                                </Tag>
                                <p style={{ color: '#52c41a', marginTop: '8px', fontSize: '0.9rem' }}>
                                    Closing modal in 2 seconds...
                                </p>
                            </div>
                        ) : (
                            <div>
                                <Tag color="error" icon={<span>✗</span>} style={{ fontSize: '14px', padding: '4px 12px' }}>
                                    Upload Failed
                                </Tag>
                                <p style={{ color: '#ff4d4f', marginTop: '8px', fontSize: '0.9rem' }}>
                                    Please try again or check your connection
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                <div style={{ textAlign: 'right' }}>
                    <Button 
                        style={{ marginRight: 8 }}
                        onClick={() => {
                            setPhotoModalVisible(false);
                            setSelectedFile(null);
                            setSelectedPlant(null);
                            setUploadStatus(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handlePhotoSubmit}
                        loading={uploading}
                        disabled={!selectedFile}
                    >
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default Plant;

