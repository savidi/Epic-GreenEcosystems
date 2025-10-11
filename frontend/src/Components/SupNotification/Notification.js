 import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Typography,
  Divider,
  List,
  Tag,
  Row,
  Col,
  Alert,
  Statistic,
  message,
} from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  FireOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import NavSup from "../NavSup/NavSup";
import "./Notification.css";

const { Title, Text } = Typography;

const Notification = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // API endpoints
  const groceriesURL = "http://localhost:5000/suppliers"; // groceries/spices
  const fertURL = "http://localhost:5000/fertilizers"; // fertilizers
  const powderURL = "http://localhost:5000/powders"; // powder items

  const LOW_STOCK_LIMIT = 50;

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const [groceryRes, fertRes, powderRes] = await Promise.allSettled([
          axios.get(groceriesURL),
          axios.get(fertURL),
          axios.get(powderURL),
        ]);

        const groceries =
          groceryRes.status === "fulfilled" ? groceryRes.value.data.suppliers || [] : [];
        const fertilizers =
          fertRes.status === "fulfilled" ? fertRes.value.data.fertilizers || [] : [];
        const powders =
          powderRes.status === "fulfilled" ? powderRes.value.data.powders || [] : [];

        // 🧮 Group by item type and sum quantities
        const groupedTotals = {};

        groceries.forEach((g) => {
          const type = g.spicename?.trim() || "Unknown Grocery";
          groupedTotals[type] = (groupedTotals[type] || 0) + parseFloat(g.qty || 0);
        });

        fertilizers.forEach((f) => {
          const type = f.fertilizerName?.trim() || "Unknown Fertilizer";
          groupedTotals[type] = (groupedTotals[type] || 0) + parseFloat(f.quantity || 0);
        });

        powders.forEach((p) => {
          const type = p.powderName?.trim() || "Unknown Powder";
          groupedTotals[type] = (groupedTotals[type] || 0) + parseFloat(p.quantity || 0);
        });

        // ⚠️ Identify low or missing stock
        const lowItems = Object.entries(groupedTotals)
          .filter(([_, total]) => total <= LOW_STOCK_LIMIT)
          .map(([name, total]) => ({
            name,
            qty: total,
            type: name.includes("Fertilizer")
              ? "Fertilizer"
              : name.includes("Powder")
              ? "Powder"
              : "Grocery",
          }));

        // ⚠️ If all categories are empty → show critical low stock
        if (
          groceries.length === 0 &&
          fertilizers.length === 0 &&
          powders.length === 0
        ) {
          lowItems.push({
            name: "No Items Found",
            qty: 0,
            type: "System",
          });
        }

        setLowStockItems(lowItems);

        // 🔔 Notifications
        if (lowItems.length > 0) {
          message.warning({
            content: `⚠️ Low Stock Alert: ${lowItems.length} item type(s) are missing or below ${LOW_STOCK_LIMIT} kg!`,
            duration: 6,
          });
        } else {
          message.success({
            content: "✅ All stock levels are sufficient.",
            duration: 3,
          });
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        message.error("Failed to load stock data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStockData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="notif-layout">
        <NavSup />
        <div className="notif-main-content">
          <Text>Loading stock notifications...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="notif-layout">
      <NavSup />
      <div className="notif-main-content">
        {/* Header */}
        <div className="notif-header">
          <Title level={2}>Low Stock Notifications</Title>
          <Text>
            Get notified when any grocery, fertilizer, or powder item’s total stock
            falls below <strong>{LOW_STOCK_LIMIT} kg</strong> or when no data exists.
          </Text>
        </div>

        <Divider />

        {/* Summary */}
        <Row gutter={[16, 16]} className="notif-summary">
          <Col xs={24} sm={8}>
            <Card className="notif-card" bordered={false}>
              <Statistic
                title="Low / Missing Stock Items"
                value={lowStockItems.length}
                valueStyle={{
                  color: lowStockItems.length > 0 ? "#cf1322" : "#3f8600",
                }}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
        </Row>
                
        <Divider />

        {/* Alerts List */}
        <Card title="Low Stock Alerts" bordered={false} className="notif-card-section">
          {lowStockItems.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={lowStockItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{item.name}</Text>}
                    description={`Type: ${item.type} | Total Quantity: ${item.qty.toFixed(
                      2
                    )} kg`}
                  />
                  <Tag
                    color={
                      item.type === "System"
                        ? "volcano"
                        : item.type === "Fertilizer"
                        ? "orange"
                        : item.type === "Powder"
                        ? "gold"
                        : "red"
                    }
                    icon={<ExclamationCircleOutlined />}
                  >
                    {item.type === "System" ? "No Items Found" : `Low ${item.type}`}
                  </Tag>
                </List.Item>
              )}
            />
          ) : (
            <Alert
              message="✅ All grocery, fertilizer, and powder stocks are sufficient."
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Notification;
