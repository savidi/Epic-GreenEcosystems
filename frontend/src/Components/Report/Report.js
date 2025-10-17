import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, Typography, Divider, Row, Col, Statistic, InputNumber, DatePicker, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { DownloadOutlined, BarChartOutlined, CalculatorOutlined, BranchesOutlined, FileExcelOutlined } from '@ant-design/icons';
import HarvestReport from './HarvestReport';
import './Report.css';
import Navfield from "../Navfield/Navfield";

const { Title, Text } = Typography;
const { Option } = Select;

function Report() {
    const [plants, setPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHarvestReport, setShowHarvestReport] = useState(false);
    const [harvestRows, setHarvestRows] = useState([]);
    
    // Debounce timeouts
    const harvestTimeoutRef = React.useRef(null);
    const dateTimeoutRef = React.useRef(null);

    // Static yield ratios per spice (expectedHarvestKg = plantedKg * ratio)
    const YIELD_RATIO = {
        CINNAMON: 0.5,
        PEPPER: 2.8,
        CHILI: 3.5,
        CARDAMOM: 2.8,
        TURMERIC: 4.2,
    };

    // Static expected harvest durations (days) per spice (same as Plant.js/PlantForm)
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

    const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchHarvests = async () => {
        try {
            const res = await fetch(`${API_BASE}/harvests`);
            const data = await res.json();
            return data.harvests || [];
        } catch (e) {
            console.error('Failed to load harvests', e);
            return [];
        }
    };

    const exportToPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const charts = [
            { id: 'efficiency-chart', title: 'EFFICIENCY ANALYSIS' },
            { id: 'accuracy-chart', title: 'QUANTITY ACCURACY METRICS' },
            { id: 'harvest-comparison-chart', title: 'HARVEST COMPARISON REPORT' }
        ];

        // Add header function
        const addHeader = (pdf, pageNum, totalPages) => {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            const headerHeight = 45;
            const startY = 20;
            
            // Add background color block
            pdf.setFillColor(1, 50, 32); // Dark green
            pdf.rect(0, 0, pageWidth, headerHeight, 'F');
            
            // Add logo (using a placeholder - replace with your logo)
            try {


                const logoUrl = './Images/Elogo.png';
                pdf.addImage(logoUrl, 'PNG', margin, 5, 30, 30);
            } catch (e) {
                console.log('Logo not found, using text only');
            }
            
            // Add company info
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Epic Green EcoSystems', pageWidth / 2, 15, { align: 'center' });
            
            // Add tagline
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text('Excellence in Spice Cultivation & Harvest Analytics', pageWidth / 2, 22, { align: 'center' });
            
            // Add contact info
            const contactInfo = 'www.Epicgreen.com | info@epicgreen.com | +94 76 123 4567';
            pdf.text(contactInfo, pageWidth / 2, 30, { align: 'center' });
            
            // Add report title section
            const reportTitleY = headerHeight + 10;
            pdf.setFillColor(245, 245, 245);
            pdf.rect(0, headerHeight, pageWidth, 15, 'F');
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(1, 50, 32); // Dark green
            pdf.text('HARVEST PERFORMANCE ANALYSIS', pageWidth / 2, reportTitleY + 10, { align: 'center' });
            
            // Add report details
            const detailsY = reportTitleY + 15;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            
            // Left-aligned details
            const reportInfo = `Report Generated: ${today}`;
            pdf.text(reportInfo, margin, detailsY);
            
            // Right-aligned page info
            const pageText = `Page ${pageNum} of ${totalPages}`;
            pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), detailsY);
            
            // Add a decorative line
            pdf.setDrawColor(1, 50, 32);
            pdf.setLineWidth(0.3);
            pdf.line(margin, detailsY + 3, pageWidth - margin, detailsY + 3);
            
            // Add a brief description paragraph
            const description = "This report provides a comprehensive analysis of harvest performance, efficiency metrics, " +
                             "and production analytics. The data presented here is generated based on real-time " +
                             "harvest records and is intended for management review and decision-making purposes.";
            
            const descriptionLines = pdf.splitTextToSize(description, pageWidth - (2 * margin));
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            pdf.text(descriptionLines, margin, detailsY + 10);
            
            return detailsY + 10 + (descriptionLines.length * 4) + 10; // Return Y position after header and description
        };
        
        for (let i = 0; i < charts.length; i++) {
            const chart = charts[i];
            const element = document.getElementById(chart.id);
            
            if (element) {
                // Add new page for each chart (except first)
                if (i > 0) {
                    pdf.addPage();
                }
                
                // Add header
                const startY = addHeader(pdf, i + 1, charts.length);
                
                // Add chart title
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.text(chart.title, 20, startY);
                
                // Convert chart to image
                const canvas = await html2canvas(element, {
                    scale: 1.5, // Slightly reduced scale for better quality
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    onclone: (clonedDoc) => {
                        // Make charts smaller in the PDF
                        const chartElements = clonedDoc.querySelectorAll('.recharts-wrapper');
                        chartElements.forEach(el => {
                            el.style.transform = 'scale(0.7)';
                            el.style.transformOrigin = 'top left';
                        });
                    }
                });
                
                // Calculate image dimensions (smaller than before)
                const imgData = canvas.toDataURL('image/png');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = pageWidth - 40; // 20mm margins on each side
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // Add chart image to PDF
                pdf.addImage(imgData, 'PNG', 20, startY + 10, imgWidth, imgHeight);
            }
        }
        
        // Save the PDF
        pdf.save(`harvest-report-${today.replace(/\//g, '-')}.pdf`);
    };

    
    const saveHarvest = async (plantId, actualHarvestKg, actualDate) => {
        try {
            // First check if a harvest record already exists for this plant
            const getRes = await fetch(`${API_BASE}/harvests?plantId=${plantId}`);
            const getData = await getRes.json();
            
            const existingHarvest = getData.harvests?.find(h => h.plantId === plantId);
            
            if (existingHarvest) {
                // Update existing harvest record
                const updateData = {
                    actualHarvestKg: actualHarvestKg !== undefined ? actualHarvestKg : existingHarvest.actualHarvestKg,
                    actualDate: actualDate !== undefined ? actualDate : existingHarvest.actualDate
                };
                
                const res = await fetch(`${API_BASE}/harvests/${existingHarvest._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Update failed');
                return data.harvest;
            } else {
                // Create new harvest record if we have at least one value
                const shouldCreate = (actualHarvestKg !== null && actualHarvestKg !== undefined) || actualDate;
                
                if (shouldCreate) {
                    const res = await fetch(`${API_BASE}/harvests`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plantId, actualHarvestKg, actualDate })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Save failed');
                    return data.harvest;
                }
                // If we don't have any values yet, just return null (no save needed)
                return null;
            }
        } catch (e) {
            console.error('Save harvest error', e);
            throw e;
        }
    };

    const fetchPlants = async () => {
        try {
            setLoading(true);
            const [plantsRes, harvests] = await Promise.all([
                fetch(`${API_BASE}/plants`),
                fetchHarvests()
            ]);
            const plantsData = await plantsRes.json();
            const list = plantsData.plants || [];
            setPlants(list);
            
            // create a map of plantId -> harvest record
            const harvestMap = {};
            harvests.forEach(h => {
                if (h.plantId?._id) {
                    harvestMap[h.plantId._id] = h;
                }
            });
            
            // build rows for table
            const rows = list.map((p, idx) => {
                const ratio = YIELD_RATIO[p.name] || 1;
                const planted = Number(p.plantedKg || 0);
                const expected = +(planted * ratio).toFixed(2);
                const expectedDate = p.plantingDate && HARVEST_DAYS[p.name]
                    ? addDays(p.plantingDate, HARVEST_DAYS[p.name])
                    : '';
                // get existing harvest record for this plant, if any
                const harvest = harvestMap[p._id];
                const actualHarvest = harvest ? harvest.actualHarvestKg : null;
                const actualDate = harvest ? new Date(harvest.actualDate).toISOString().slice(0,10) : null;
                
                // compute efficiency and accuracy
                const eff = actualHarvest != null && expected > 0
                    ? `${((actualHarvest / expected) * 100).toFixed(1)}%`
                    : '';
                const qtyAcc = actualHarvest != null && expected > 0
                    ? `${(Math.min(actualHarvest, expected) / Math.max(actualHarvest, expected) * 100).toFixed(1)}%`
                    : '';
                
                // compute date delta
                let dateDeltaDays = '';
                if (actualDate && expectedDate) {
                    const d1 = new Date(expectedDate);
                    const d2 = new Date(actualDate);
                    dateDeltaDays = Math.round((d2 - d1) / (1000*60*60*24));
                }
                
                return {
                    key: p._id || String(idx),
                    date: p.plantingDate ? new Date(p.plantingDate).toISOString().slice(0,10) : '',
                    plantName: p.name,
                    division: p.plantingDivision || '',
                    plantedKg: planted,
                    actualHarvest,
                    expectedHarvest: expected,
                    expectedDate,
                    actualDate,
                    efficiency: eff,
                    dateDeltaDays,
                    qtyAccuracy: qtyAcc,
                };
            });
            setHarvestRows(rows);
        } catch (e) {
            console.error('Failed to load plants for report', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlants();
    }, []);

    const handlePlantSelect = (plantId) => {
        const plant = plants.find(p => p.id === plantId);
        setSelectedPlant(plant);
    };

    const handleGenerateReport = () => {
        if (selectedPlant) {
            setShowHarvestReport(true);
        }
    };

    const handleCloseReport = () => {
        setShowHarvestReport(false);
    };

    // handle user entering actual harvest
    const onChangeActual = (value, recordKey) => {
        const actual = value != null ? Number(value) : null;
        const row = harvestRows.find(r => r.key === recordKey);
        if (!row) return;
        
        // Clear existing timeout
        if (harvestTimeoutRef.current) {
            clearTimeout(harvestTimeoutRef.current);
        }
        
        // Set new timeout for debouncing
        harvestTimeoutRef.current = setTimeout(async () => {
            try {
                // Save individual value after debounce
                if (actual != null) {
                    await saveHarvest(recordKey, actual, row.actualDate);
                }
            } catch (e) {
                console.error('Failed to save harvest', e);
            }
        }, 1000); // 1 second debounce
        
        // update UI state immediately
        setHarvestRows(prev => prev.map(r => {
            if (r.key !== recordKey) return r;
            const eff = actual != null && r.expectedHarvest > 0
                ? `${((actual / r.expectedHarvest) * 100).toFixed(1)}%`
                : '';
            const qtyAcc = actual != null && r.expectedHarvest > 0
                ? `${(Math.min(actual, r.expectedHarvest) / Math.max(actual, r.expectedHarvest) * 100).toFixed(1)}%`
                : '';
            return { ...r, actualHarvest: actual, efficiency: eff, qtyAccuracy: qtyAcc };
        }));
    };

    // handle user entering actual harvest date
    const onChangeActualDate = (momentVal, _str, recordKey) => {
        const iso = momentVal ? momentVal.format('YYYY-MM-DD') : null;
        const row = harvestRows.find(r => r.key === recordKey);
        if (!row) return;
        
        // Clear existing timeout
        if (dateTimeoutRef.current) {
            clearTimeout(dateTimeoutRef.current);
        }
        
        // Set new timeout for debouncing
        dateTimeoutRef.current = setTimeout(async () => {
            try {
                // Save individual value after debounce
                if (iso != null) {
                    await saveHarvest(recordKey, row.actualHarvest, iso);
                }
            } catch (e) {
                console.error('Failed to save harvest date', e);
            }
        }, 1000); // 1 second debounce
        
        // update UI state immediately
        setHarvestRows(prev => prev.map(r => {
            if (r.key !== recordKey) return r;
            let delta = '';
            if (iso && r.expectedDate) {
                const d1 = new Date(r.expectedDate);
                const d2 = new Date(iso);
                delta = Math.round((d2 - d1) / (1000*60*60*24));
            }
            return { ...r, actualDate: iso, dateDeltaDays: delta };
        }));
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Plant Name',
            dataIndex: 'plantName',
            key: 'plantName',
        },
        {
            title: 'Division',
            dataIndex: 'division',
            key: 'division',
        },
        {
            title: 'Expected Date',
            dataIndex: 'expectedDate',
            key: 'expectedDate',
        },
        {
            title: 'Actual Date',
            dataIndex: 'actualDate',
            key: 'actualDate',
            render: (val, record) => (
                <DatePicker
                    value={val ? dayjs(val, 'YYYY-MM-DD') : null}
                    onChange={(v, s) => onChangeActualDate(v, s, record.key)}
                    style={{ width: 150 }}
                />
            )
        },
        {
            title: 'Δ Days',
            dataIndex: 'dateDeltaDays',
            key: 'dateDeltaDays',
            render: (v) => v === '' ? '' : `${v}d`,
        },
        {
            title: 'Planted (kg)',
            dataIndex: 'plantedKg',
            key: 'plantedKg',
        },
        {
            title: 'Actual Harvest (kg)',
            dataIndex: 'actualHarvest',
            key: 'actualHarvest',
            render: (val, record) => (
                <InputNumber
                    min={0}
                    step={0.1}
                    value={val}
                    onChange={(v) => onChangeActual(v, record.key)}
                    style={{ width: 120 }}
                />
            )
        },
        {
            title: 'Expected Harvest (kg)',
            dataIndex: 'expectedHarvest',
            key: 'expectedHarvest',
        },
        {
            title: 'Qty Accuracy',
            dataIndex: 'qtyAccuracy',
            key: 'qtyAccuracy',
        },
        {
            title: 'Efficiency',
            dataIndex: 'efficiency',
            key: 'efficiency',
            render: (text) => (
                <span style={{ color: parseFloat(text) >= 80 ? 'green' : parseFloat(text) >= 60 ? 'orange' : 'red' }}>
                    {text}
                </span>
            ),
            sorter: (a, b) => parseFloat(a.efficiency) - parseFloat(b.efficiency),
        },
    ];

    const totalPlanted = harvestRows.reduce((sum, item) => sum + (item.plantedKg || 0), 0);
    const totalHarvested = harvestRows.reduce((sum, item) => sum + (item.actualHarvest || 0), 0);
    const effValues = harvestRows.map(r => parseFloat(r.efficiency)).filter(v => !isNaN(v));
    const averageEfficiency = effValues.length ? (effValues.reduce((a,b)=>a+b,0)/effValues.length).toFixed(1) : 0;
    
    // Prepare data for charts
    const efficiencyData = harvestRows
        .filter(r => r.efficiency && r.plantName)
        .map(r => ({
            name: r.plantName,
            efficiency: parseFloat(r.efficiency),
            accuracy: parseFloat(r.qtyAccuracy) || 0,
            dateDelta: r.dateDeltaDays || 0
        }));
    
    const harvestComparisonData = harvestRows
        .filter(r => r.expectedHarvest && r.actualHarvest != null)
        .map(r => ({
            name: r.plantName,
            expected: r.expectedHarvest,
            actual: r.actualHarvest
        }));

    if (loading) {
        return (
            <div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <Text>Loading plants...</Text>
                </div>
            </div>
        );
    }

    return (
        <div className="report-report-page">
             <Navfield />
            <div className="report-report-content">
                <div className="report-page-header">
                    <Title level={2}>
                        <BarChartOutlined /> Harvest Reports
                    </Title>
                    <Text type="secondary">Manage and analyze harvest data for all plants</Text>
                </div>

                <Divider />

                {/* Summary Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Plants"
                                value={plants.length}
                                prefix={<BranchesOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Avg Efficiency"
                                value={averageEfficiency}
                                suffix="%"
                                valueStyle={{ color: averageEfficiency >= 80 ? '#3f8600' : averageEfficiency >= 60 ? '#fa8c16' : '#cf1322' }}
                            />
                        </Card>
                    </Col>
                </Row>


                {/* Harvest Data Table */}
                <Card 
                    title="Harvest Records" 
                    extra={
                        <Button 
                            icon={<FileExcelOutlined />}
                            onClick={() => {
                                try {
                                    // Prepare data for Excel export
                                    const dataForExport = harvestRows.map(row => ({
                                        'Date': row.date || 'N/A',
                                        'Plant Name': row.plantName || 'N/A',
                                        'Division': row.division || 'N/A',
                                        'Planted (kg)': row.plantedKg != null ? Number(row.plantedKg).toFixed(2) : 'N/A',
                                        'Expected Harvest (kg)': row.expectedHarvest != null ? Number(row.expectedHarvest).toFixed(2) : 'N/A',
                                        'Actual Harvest (kg)': row.actualHarvest != null ? Number(row.actualHarvest).toFixed(2) : 'N/A',
                                        'Efficiency (%)': row.efficiency || 'N/A',
                                        'Quantity Accuracy (%)': row.qtyAccuracy || 'N/A',
                                        'Expected Harvest Date': row.expectedDate || 'N/A',
                                        'Actual Harvest Date': row.actualDate || 'N/A',
                                        'Days Difference': row.dateDeltaDays ? `${row.dateDeltaDays}d` : 'N/A',
                                        'Status': row.actualHarvest ? 'Harvested' : 'Pending'
                                    }));

                                    // Create worksheet and workbook
                                    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
                                    const workbook = XLSX.utils.book_new();
                                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Harvest Records');

                                    // Generate Excel file
                                    const excelBuffer = XLSX.write(workbook, { 
                                        bookType: 'xlsx', 
                                        type: 'array',
                                        bookSST: true 
                                    });
                                    
                                    // Create and trigger download
                                    const data = new Blob([excelBuffer], { 
                                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                                    });
                                    const url = URL.createObjectURL(data);
                                    const link = document.createElement('a');
                                    const today = new Date().toISOString().split('T')[0];
                                    
                                    link.href = url;
                                    link.download = `harvest-records-${today}.xlsx`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    
                                    message.success('Harvest records exported to Excel successfully!');
                                } catch (error) {
                                    console.error('Error exporting to Excel:', error);
                                    message.error('Failed to export harvest records to Excel');
                                }
                            }}
                            style={{ 
                                backgroundColor: '#1890ff',
                                color: 'white',
                                borderColor: '#1890ff'
                            }}
                        >
                            Export All Data
                        </Button>
                    }
                >
                    <Table
                        dataSource={harvestRows}
                        columns={columns}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                        rowClassName={(record) => 
                            parseFloat(record.efficiency) >= 80 ? 'report-high-efficiency-row' : 
                            parseFloat(record.efficiency) >= 60 ? 'report-medium-efficiency-row' : 'report-low-efficiency-row'
                        }
                    />
                </Card>

                {/* Charts Section */}                <Divider orientation="left">Expected vs Actual Harvest</Divider>
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Harvest Comparison (kg)" id="harvest-comparison-chart">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={harvestComparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="expected" fill="#8884d8" name="Expected (kg)" />
                                    <Bar dataKey="actual" fill="#82ca9d" name="Actual (kg)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                <Divider orientation="left">Harvest Efficiency & Accuracy</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Efficiency by Plant (%)" id="efficiency-chart">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={efficiencyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Quantity Accuracy vs Efficiency" id="accuracy-chart">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={efficiencyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="efficiency" stroke="#8884d8" name="Efficiency %" />
                                    <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="Accuracy %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
                

                {/* PDF Export Button */}
                <Row style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <Col span={24} style={{ textAlign: 'center' }}>
                        <Button 
                            type="primary" 
                            icon={<DownloadOutlined />} 
                            onClick={exportToPDF}
                            size="large"
                            
                        >
                            Export Charts as PDF
                        </Button>
                    </Col>
                </Row>

                {/* Harvest Report Modal */}
                {showHarvestReport && selectedPlant && (
                    <div className="report-harvest-report-modal">
                        <HarvestReport 
                            plant={selectedPlant} 
                            onClose={handleCloseReport} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Report;
