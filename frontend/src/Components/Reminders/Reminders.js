import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Tag, Space, Divider, Badge, Layout, Tabs } from 'antd';
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, SendOutlined, DropboxOutlined, EnvironmentOutlined } from '@ant-design/icons';
import './Reminders.css';
import Navfield from '../Navfield/Navfield';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import toast from 'react-hot-toast';

dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

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

// Helper function to calculate next due date
const calculateNextDueDate = (lastDate, frequency) => {
  const days = parseInt(frequency, 10);

  return dayjs(lastDate).add(days, 'day').format('YYYY-MM-DD');
};

const Reminders = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('watering');
  
  // Fetch plants with watering and fertilizing schedules
  const fetchPlants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/plants`);
      const data = await response.json();
      
      if (data.plants) {
        // Transform plant data to include next watering/fertilizing dates
        const plantsWithSchedules = data.plants.map(plant => ({
          ...plant,
          nextWatering: calculateNextDueDate(plant.lastWatered, plant.wateringFrequency || '3'),
          wateringFrequencyText: formatFrequency(plant.wateringFrequency || '3'),
        }));
        console.log('Fetched plants:', plantsWithSchedules);
        setPlants(plantsWithSchedules);
      }
    } catch (err) {
      console.error('Error fetching plants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark task as completed
  const markTaskComplete = async (plantId, taskType) => {
    try {
      const fieldToUpdate = taskType === 'watering' ? 'lastWatered' : 'lastFertilized';
      const response = await fetch(`${API_BASE}/plants/${plantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [fieldToUpdate]: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast.success(`🌿 Successfully updated`);
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(`❌ Error updating task. Please try again.`);
    }
  };

  // Send reminder - call backend to send SMS (/plants/sms/:id - POST with message)


    const sendReminder = async (pid,dueDateText,name,plantId) => {

    try {
        const response = await fetch(`${API_BASE}/plants/sms/${pid}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            recipient: '94716211200', // Replace with actual recipient number
            message: `This is a reminder that watering your ${name} plant (ID: ${plantId}) is ${dueDateText}.`
        }),
        });
        if (response.ok) {
            toast.success(`🌿 Reminder sent successfully for ${name}!`);
          } else {
            throw new Error('Failed to send reminder');
          }
        } catch (error) {
          console.error('Error sending reminder:', error);
          toast.error(`❌ Error sending reminder for ${name}.`);
        }
      };

  


  // Load plants on component mount
  useEffect(() => {
    fetchPlants();
  }, []);

  // Filter plants based on active tab
  const filteredPlants = plants.filter(plant => {
      return plant
  }).sort((a, b) => {
    const dateA = activeTab === 'watering' ? a.nextWatering : a.nextFertilizing;
    const dateB = activeTab === 'watering' ? b.nextWatering : b.nextFertilizing;
    return new Date(dateA) - new Date(dateB);
  });


  const getReminderIcon = (type) => {
    return type === 'watering' 
      ? <span role="img" aria-label="water">💧</span>
      : <span role="img" aria-label="fertilizer">🌱</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDueStatus = (dueDate) => {
    if (!dueDate) return 'default';
    const daysUntilDue = dayjs(dueDate).diff(dayjs(), 'days');
    
    if (dayjs(dueDate).isBefore(dayjs(), 'day')) return 'error';
    if (daysUntilDue <= 1) return 'warning';
    return 'success';
  };

  const getDueText = (dueDate) => {
    if (!dueDate) return 'Not scheduled';
    console.log(dueDate);
    const daysUntilDue = dayjs(dueDate).diff(dayjs(), 'days');   
    const daysInt = parseInt(daysUntilDue+1, 10); 
      return `Due in ${daysInt} days`;
    
  };

  return (
    <div style={{ display: 'flex' }}>
      <Navfield />
      <div style={{ flex: 1, padding: '24px', marginLeft: '200px' }}>
        <div className="reminders-container">
          <Title level={2} className="reminders-title">
            <BellOutlined /> Plant Maintenance Schedule
          </Title>
          
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            style={{ marginBottom: 24 }}
          >
            <TabPane 
              tab={
                <span>
                  Watering Schedule
                </span>
              } 
              key="watering"
            >
             <Card loading={loading} className="reminders-card">
  <List
    itemLayout="horizontal"
    dataSource={filteredPlants}
    renderItem={plant => (
      <List.Item
        actions={[
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => markTaskComplete(plant._id, 'watering')}
            
          >
            Mark as Watered
          </Button>,

          <Button
            type="default"
            icon={<BellOutlined />}
            onClick={() => sendReminder(plant._id,getDueText(plant.nextWatering),plant.name,plant.plantId)}
          >
            Send Reminder
          </Button>
        ]}
      >
        <List.Item.Meta
          avatar={getReminderIcon('watering')}
          title={
            <Space>
              <Text strong>{plant.name}</Text>
              <Tag color="blue">Division {plant.plantingDivision}</Tag>
              <Tag color={getDueStatus(plant.nextWatering)}>
                {getDueText(plant.nextWatering)}
              </Tag>
            </Space>
          }
          description={
            <Space direction="vertical" size={0}>
              <Text>ID: {plant.plantId || 'N/A'}</Text>

              <Text type="secondary">
                Frequency: {plant.wateringFrequencyText}
              </Text>
              {plant.lastWatered && (
                <Text type="secondary">
                  Last watered: {formatDate(plant.lastWatered)}
                </Text>
              )}
            </Space>
          }
        />
      </List.Item>
    )}
  />
</Card>

            </TabPane>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
