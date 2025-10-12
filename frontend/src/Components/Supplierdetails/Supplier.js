import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Divider, Row, Col, Statistic, Input } from 'antd';
import { UserOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './Supplier.css';
import NavSup from "../NavSup/NavSup";

const { Title, Text } = Typography;
const { Search } = Input;
const URL = "http://localhost:5000/suppliers";

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

  const tableData = suppliers.map(supplier => ({ ...supplier, key: supplier._id }));

  const totalSuppliers = suppliers.length;
  const totalQuantity = suppliers.reduce((sum, supplier) => sum + (parseFloat(supplier.qty) || 0), 0);
  const averagePrice = suppliers.length > 0
    ? (suppliers.reduce((sum, supplier) => sum + (parseFloat(supplier.price) || 0), 0) / suppliers.length).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="sup-layout">
        <NavSup />
        <div className="sup-main-content">
          <div className="sup-header"><Text>Loading suppliers...</Text></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sup-layout">
      <NavSup />
      <div className="sup-main-content">
        <div className="sup-header">
          <h1><UserOutlined /> Supplier Details</h1>
          <p>Overview and actions for the selected supplier.</p>
          <button className="sup-btn" onClick={() => navigate("/Addsup")}>
            <PlusOutlined /> Add New Supplier
          </button>
        </div>

        <Divider />

        <Row gutter={[16, 16]} className="sup-stats-row">
          <Col xs={24} sm={12} md={8}><Card><Statistic title="Total Suppliers" value={totalSuppliers} prefix={<UserOutlined />} valueStyle={{ color: '#3f8600' }} /></Card></Col>
          <Col xs={24} sm={12} md={8}><Card><Statistic title="Total Quantity" value={totalQuantity} suffix="kg" valueStyle={{ color: '#D2691E' }} /></Card></Col>
          <Col xs={24} sm={12} md={8}><Card><Statistic title="Average Price" value={averagePrice} prefix="Rs." valueStyle={{ color: '#DAA520' }} /></Card></Col>
        </Row>

        <div className="sup-table-container">
          <Search
            placeholder="Search by supplier name"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            style={{ maxWidth: 400, marginBottom: "15px" }}
          />

          <table className="sup-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Spice Type</th>
                <th>Quantity</th>
                <th>Price (LKR)</th>
                <th>Date</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, idx) => (
                  <tr key={row.key} className={idx % 2 === 0 ? "sup-row-light" : "sup-row-dark"}>
                    <td>{row.name || "-"}</td>
                    <td>{row.email || "-"}</td>
                    <td>{row.phoneno || "-"}</td>
                    <td>{row.spicename || "-"}</td>
                    <td>{row.qty ? `${row.qty} kg` : "-"}</td>
                    <td>{row.price ? `Rs. ${row.price}` : "-"}</td>
                    <td>{row.date ? new Date(row.date).toLocaleDateString() : "-"}</td>
                    <td>{row.address || "-"}</td>
                    <td>
                      <div className="sup-actions">
                        <button className="sup-btn1" onClick={() => navigate(`/UpdateSpice/${row._id}`)}><EditOutlined /> Spices</button>
                        <button className="sup-btn11" onClick={() => navigate(`/Supdet/${row._id}`)}><EditOutlined /> Supplier</button>
                        <button className="sup-btn-secondary2" onClick={() => deleteHandler(row._id)}><DeleteOutlined /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={9} className="sup-no-data">{noResults ? "No suppliers found." : "No suppliers available."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Supplier;