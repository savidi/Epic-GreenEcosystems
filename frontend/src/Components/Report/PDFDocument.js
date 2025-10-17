import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2px solid #2c7a3e',
    paddingBottom: 10,
  },
  farmInfo: {
    flex: 2,
  },
  reportInfo: {
    flex: 1,
    textAlign: 'right',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c7a3e',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
  },
  content: {
    marginTop: 20,
  },
  table: {
    width: '100%',
    marginTop: 20,
    border: '1px solid #EEEEEE',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #EEEEEE',
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    flex: 1,
    textAlign: 'left',
    borderRight: '1px solid #EEEEEE',
  },
  logo: {
    width: 120,
    marginBottom: 10,
  },
});

const PDFDocument = ({ data, plantName }) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.farmInfo}>
            <Text style={styles.title}>Farm Management</Text>
            <Text style={styles.subtitle}>Sustainable Farming Excellence</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.title}>{plantName} Harvest Report</Text>
            <Text style={styles.date}>Generated on: {currentDate}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCell}>Planted (kg)</Text>
            <Text style={styles.tableCell}>Actual (kg)</Text>
            <Text style={styles.tableCell}>Expected (kg)</Text>
            <Text style={styles.tableCell}>Efficiency (%)</Text>
          </View>
          
          {data.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{row.date}</Text>
              <Text style={styles.tableCell}>{row.plantedKg}</Text>
              <Text style={styles.tableCell}>{row.actualHarvest}</Text>
              <Text style={styles.tableCell}>{row.expectedHarvest}</Text>
              <Text style={styles.tableCell}>{row.efficiency}%</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;
