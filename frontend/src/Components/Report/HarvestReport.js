import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, DatePicker, Table, Typography, Space, Divider, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import './Report.css';
import Navfield from "../Navfield/Navfield";
const { Title, Text } = Typography;

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const HarvestReport = ({ plant, onClose }) => {
  const [form] = Form.useForm();
  const [harvestData, setHarvestData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local crop yield multipliers
  const cropYieldMultipliers = {
    'Cinnamon': 3.5,  // 3.5 kg harvest per kg planted
    'Cardamom': 2.8,
    'Turmeric': 4.2,
    'Pepper': 2.5,
    'default': 3.0
  };

  const calculateExpectedHarvest = (planted, cropType) => {
    const multiplier = cropYieldMultipliers[cropType] || cropYieldMultipliers.default;
    return (planted * multiplier).toFixed(2);
  };

  // API functions
  const saveHarvestToDatabase = async (plantId, actualHarvestKg, actualDate, plantedKg) => {
    try {
      const response = await axios.post(`${API_BASE}/harvests`, {
        plantId,
        actualHarvestKg,
        actualDate,
        plantedKg
      });
      return response.data.harvest;
    } catch (error) {
      console.error('Error saving harvest:', error);
      throw error;
    }
  };

  const fetchHarvestsFromDatabase = async (plantId) => {
    try {
      const response = await axios.get(`${API_BASE}/harvests`);
      const allHarvests = response.data.harvests || [];
      // Filter harvests for the specific plant
      return allHarvests.filter(harvest => harvest.plantId === plantId);
    } catch (error) {
      console.error('Error fetching harvests:', error);
      throw error;
    }
  };

  const handleAddHarvest = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const expected = calculateExpectedHarvest(parseFloat(values.plantedKg), plant.name);
      
      // Save to database
      const savedHarvest = await saveHarvestToDatabase(
        plant._id,
        parseFloat(values.actualHarvest),
        values.harvestDate.format('YYYY-MM-DD'),
        parseFloat(values.plantedKg)
      );
      
      // Create harvest object for local state
      const newHarvest = {
        id: savedHarvest._id || Date.now(),
        date: savedHarvest.actualDate || values.harvestDate.format('YYYY-MM-DD'),
        plantedKg: parseFloat(values.plantedKg),
        actualHarvest: parseFloat(values.actualHarvest),
        expectedHarvest: expected,
        cropType: plant.name,
        efficiency: ((parseFloat(values.actualHarvest) / expected) * 100).toFixed(2)
      };
      
      setHarvestData([...harvestData, newHarvest]);
      form.resetFields();
      message.success('Harvest record saved successfully!');
    } catch (error) {
      setError('Failed to save harvest record. Please try again.');
      message.error('Failed to save harvest record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('harvest-report-content');
      if (!element) {
        throw new Error('Report content element not found');
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${plant.name}-Harvest-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load harvest data from database
  useEffect(() => {
    const loadHarvestData = async () => {
      if (plant && plant._id) {
        try {
          setLoading(true);
          setError(null);
          const harvests = await fetchHarvestsFromDatabase(plant._id);
          
          // Transform database data to match local format
          const transformedHarvests = harvests.map(harvest => {
            const expected = calculateExpectedHarvest(harvest.plantedKg, plant.name);
            return {
              id: harvest._id,
              date: harvest.actualDate,
              plantedKg: harvest.plantedKg,
              actualHarvest: harvest.actualHarvestKg,
              expectedHarvest: expected,
              cropType: plant.name,
              efficiency: ((harvest.actualHarvestKg / expected) * 100).toFixed(2)
            };
          });
          
          setHarvestData(transformedHarvests);
        } catch (error) {
          setError('Failed to load harvest data. Please try again.');
          console.error('Error loading harvest data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadHarvestData();
  }, [plant._id]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Planted (kg)',
      dataIndex: 'plantedKg',
      key: 'plantedKg',
    },
    {
      title: 'Actual (kg)',
      dataIndex: 'actualHarvest',
      key: 'actualHarvest',
    },
    {
      title: 'Expected (kg)',
      dataIndex: 'expectedHarvest',
      key: 'expectedHarvest',
    },
    {
      title: 'Efficiency (%)',
      dataIndex: 'efficiency',
      key: 'efficiency',
    },
  ];

  return (

    <div className="report-report-page">
                 <Navfield />
    <div className="report-harvest-report-container">
      
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              Harvest Report - {plant.name}
            </Title>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleGeneratePDF}
                loading={isGenerating}
                disabled={harvestData.length === 0}
              >
                Download PDF
              </Button>
              <Button onClick={onClose}>Close</Button>
            </Space>
          </div>
        }
        style={{ width: '100%', marginBottom: '20px' }}
      >
        <div id="harvest-report-content">
          {/* Error Message */}
          {error && (
            <div style={{ 
              backgroundColor: '#fff2f0', 
              border: '1px solid #ffccc7', 
              padding: '12px', 
              marginBottom: '16px', 
              borderRadius: '6px',
              color: '#ff4d4f'
            }}>
              {error}
            </div>
          )}
          
          <Divider orientation="left">Add Harvest Data</Divider>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddHarvest}
            style={{ marginBottom: '20px' }}
          >
            <Form.Item
              label="Plant Date"
              name="harvestDate"
              rules={[{ required: true, message: 'Please select harvest date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label="Amount Planted (kg)"
              name="plantedKg"
              rules={[{ required: true, message: 'Please enter planted amount!' }]}
            >
              <Input type="number" step="0.1" placeholder="Enter amount planted in kg" />
            </Form.Item>
            
            <Form.Item
              label="Actual Harvest (kg)"
              name="actualHarvest"
              rules={[{ required: true, message: 'Please enter actual harvest!' }]}
            >
              <Input type="number" step="0.1" placeholder="Enter actual harvest in kg" />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                Add Harvest Record
              </Button>
            </Form.Item>
          </Form>

          {harvestData.length > 0 ? (
            <>
              <Divider orientation="left">Harvest Summary</Divider>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <Card>
                  <Text strong>Total Records:</Text>
                  <div style={{ fontSize: '24px', color: '#1890ff' }}>{harvestData.length}</div>
                </Card>
                <Card>
                  <Text strong>Total Planted:</Text>
                  <div style={{ fontSize: '24px', color: '#52c41a' }}>
                    {harvestData.reduce((sum, h) => sum + h.plantedKg, 0).toFixed(2)} kg
                  </div>
                </Card>
                <Card>
                  <Text strong>Total Harvested:</Text>
                  <div style={{ fontSize: '24px', color: '#722ed1' }}>
                    {harvestData.reduce((sum, h) => sum + h.actualHarvest, 0).toFixed(2)} kg
                  </div>
                </Card>
                <Card>
                  <Text strong>Average Efficiency:</Text>
                  <div style={{ fontSize: '24px', color: '#fa8c16' }}>
                    {(harvestData.reduce((sum, h) => sum + parseFloat(h.efficiency), 0) / harvestData.length).toFixed(2)}%
                  </div>
                </Card>
              </div>

              <Divider orientation="left">Harvest Data Table</Divider>
              <Table 
                dataSource={harvestData} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
                style={{ marginBottom: '20px' }}
              />

            </>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text>Loading harvest data...</Text>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <Text type="secondary">No harvest records found. Add your first harvest record above.</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
    </div>
  );
};

export default HarvestReport;
