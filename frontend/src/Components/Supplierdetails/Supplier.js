import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, Button, Table, Typography, Divider, Row, Col, Statistic, Input } from 'antd';
import { UserOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './Supplier.css';
import NavSup from "../NavSup/NavSup";

const { Title, Text } = Typography;
const { Search } = Input;
const URL = "http://localhost:5000/suppliers";

// Fetch suppliers
const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    return res.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { suppliers: [] };
  }
};

function Supplier() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHandler().then((data) => {
      setSuppliers(data.suppliers || []);
      setAllSuppliers(data.suppliers || []);
      setLoading(false);
    });
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSuppliers(allSuppliers);
      setNoResults(false);
      return;
    }

    const filtered = allSuppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuppliers(filtered);
    setNoResults(filtered.length === 0);
  };

  const deleteHandler = async (supplierId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this supplier?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/suppliers/${supplierId}`);
      const data = await fetchHandler();
      setSuppliers(data.suppliers || []);
      setAllSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete supplier — check console for details.');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (text) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '-',
    },
    {
      title: 'Phone',
      dataIndex: 'phoneno',
      key: 'phoneno',
      render: (text) => text || '-',
    },
    {
      title: 'Spice Type',
      dataIndex: 'spicename',
      key: 'spicename',
      render: (text) => text || '-',
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      render: (text) => text ? `${text} kg` : '-',
    },
    {
      title: 'Price (LKR)',
      dataIndex: 'price',
      key: 'price',
      render: (text) => text ? `Rs. ${text}` : '-',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
      sorter: (a, b) => new Date(a.date || 0) - new Date(b.date || 0),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text) => text || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="supplierdetails-action-buttons">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/UpdateSpice/${record._id}`)}
            style={{ marginRight: 8, marginBottom: 4 }}
          >
            Update Spices
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/Supdet/${record._id}`)}
            style={{ marginRight: 8, marginBottom: 4 }}
          >
            Update Details
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => deleteHandler(record._id)}
            style={{ marginBottom: 4 }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tableData = suppliers.map(supplier => ({
    ...supplier,
    key: supplier._id,
  }));

  const totalSuppliers = suppliers.length;
  const totalQuantity = suppliers.reduce((sum, supplier) => sum + (parseFloat(supplier.qty) || 0), 0);
  const averagePrice = suppliers.length > 0 
    ? (suppliers.reduce((sum, supplier) => sum + (parseFloat(supplier.price) || 0), 0) / suppliers.length).toFixed(2)
    : 0;

  if (loading) {
    return (
<div className="Nav">
            <NavSup /> {/* Sidebar */}

      <div className="supplierdetails-page">
        <div className="supplierdetails-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Text>Loading suppliers...</Text>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (

<div className="Nav">
            <NavSup /> {/* Sidebar */}
    <div className="supplierdetails-page">
      <div className="supplierdetails-content">
        <div className="supplierdetails-page-header">
          <Title level={2}><UserOutlined /> Supplier Details</Title>
          <Text type="secondary">Overview and actions for the selected supplier.</Text>
          <div className="supplierdetails-header-actions">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate("/Addsup")}
              size="large"
            >
              Add New Supplier
            </Button>
          </div>
        </div>

        <Divider />

        <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Suppliers"
                value={totalSuppliers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Quantity"
                value={totalQuantity}
                suffix="kg"
                valueStyle={{ color: '#D2691E' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Average Price"
                value={averagePrice}
                prefix="Rs."
                valueStyle={{ color: '#DAA520' }}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginBottom: '2rem' }}>
          <Row>
            <Col span={24}>
              <Search
                placeholder="Search by supplier name"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                style={{ maxWidth: 400 }}
              />
            </Col>
          </Row>
        </Card>

        <Card title="Supplier Records">
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} suppliers`
            }}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: noResults ? 'No suppliers found.' : 'No suppliers available.'
            }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? 'supplierdetails-table-row-light' : 'supplierdetails-table-row-dark'
            }
          />
        </Card>
      </div>
    </div>
    </div>
  );
}

export default Supplier;
