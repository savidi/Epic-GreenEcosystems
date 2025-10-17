import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Form, Input, DatePicker, Table, Typography, Space, Divider, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';
import './Report.css';
import PDFDocument from './PDFDocument';
import ReportLetterhead from './ReportLetterhead';
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

  const handleGeneratePDF = () => {
    setIsGenerating(true);
  };

  const onDownloadComplete = () => {
    setIsGenerating(false);
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
    <div className="harvest-report-container">
      <Navfield />
      <div className="report-content">
        <div id="harvest-report-content" className="harvest-report-card">
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Harvest Report</span>
                <PDFDownloadLink
                  document={
                    <PDFDocument 
                      data={harvestData} 
                      plantName={plant?.name || 'Harvest'}
                    />
                  }
                  fileName={`${plant?.name || 'harvest'}-report-${new Date().toISOString().split('T')[0]}.pdf`}
                  onClick={handleGeneratePDF}
                  onDownloadComplete={onDownloadComplete}
                >
                  {({ loading }) => (
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />} 
                      loading={loading || isGenerating}
                    >
                      {loading || isGenerating ? 'Generating PDF...' : 'Export PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            }
          >
            <ReportLetterhead 
              title={`${plant?.name || 'Harvest'} Report`} 
              date={new Date().toLocaleDateString()} 
            />
            
            <Form form={form} onFinish={handleAddHarvest} layout="vertical">
              <Form.Item
                name="harvestDate"
                label="Harvest Date"
                rules={[{ required: true, message: 'Please select harvest date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="plantedKg"
                label="Planted (kg)"
                rules={[{ required: true, message: 'Please enter planted amount' }]}
              >
                <Input type="number" step="0.1" min="0" />
              </Form.Item>
              
              <Form.Item
                name="actualHarvest"
                label="Actual Harvest (kg)"
                rules={[{ required: true, message: 'Please enter actual harvest amount' }]}
              >
                <Input type="number" step="0.1" min="0" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add Harvest Record
                </Button>
              </Form.Item>
            </Form>
            
            <Divider>Harvest History</Divider>
            
            {harvestData.length > 0 ? (
              <Table 
                columns={columns} 
                dataSource={harvestData} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                <Text type="secondary">No harvest records found. Add your first harvest record above.</Text>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HarvestReport;

