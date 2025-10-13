import './utils/axiosConfig'; 
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import ProtectedStaffRoute from './Components/ProtectedStaffRoute';
import StaffLogin from "./Components/Log/StaffLogin";
import ContactUs from "./Components/ContactUs/ContactUs";
import CusHome from './Components/CusHome/CusHome';
import AboutUs from './Components/AboutUs/AboutUs';

import Register from './Components/RegisterCus/CusRegister';
import CustomerLogin from './Components/Login/CustomerLogin';
import LocalOrders from './Components/LocalOrders/LocalOrders';
import OrderView from './Components/LocalOrders/OrderView';
import Customer from './Components/Customer/Customer';
import Success from './Components/LocalOrders/Success';
import Cancel from './Components/LocalOrders/Cancel';
import ExportOrders from './Components/ExportOrders/ExportOrders';
import ProtectedRoute from './Components/ProtectedRoute';
import CartItems from './Components/LocalOrders/CartItems';
import SalesManager from './Components/SalesManager/SalesManager';
import QuotationForm from './Components/SalesManager/QuotationForm';
import OrderStatus from './Components/Customer/OrderStatusModal';

import HomeN from "./Components/HomeN/HomeN.js";
import Addproduct from "./Components/Products/Addproduct";
import FertilizerInv from "./Components/Products/FertilizerInv.js";
import AddFertilizerInv from "./Components/Products/AddFertilizerInv.js";
import Products from "./Components/Products/Products";
import Order from "./Components/Stocks/OrderN.js";
import SupplierProducts from "./Components/Stocks/SupplierProducts";
import PlantationProducts from "./Components/Stocks/PlantationProducts";
import Updatespice from "./Components/UpdateSpice/Updatespice.js";
import Showspice from "./Components/HomeN/Showspice.js";
import Statscards from "./Components/HomeN/Statscards.js";
import ProfileInv from "./Components/ProfileInv/ProfileInv.js";

// Field-side pages
import Plant from "./Components/Plant/Plant";
import Dashboard from "./Components/Dashboard/Dashboard";
import Report from "./Components/Report/Report";
import Account from "./Components/Account/Account";

// Existing pages
import Home from "./Components/Home/Home";
import FWorker from "./Components/FWorker/FWorker";
import AddWorker from "./Components/AddWorker/AddWorker";
import UpdateWorker from "./Components/UpdateWorker/UpdateWorker";
import StaffManagement from "./Components/StaffManagement/StaffManagement";
import AddStaff from "./Components/AddStaff/AddStaff";
import UpdateStaff from "./Components/UpdateStaff/UpdateStaff";
import AttendanceScanner from "./Components/AttendanceScanner/AttendanceScanner";
import AttendanceTable from "./Components/AttendanceTable/AttendanceTable";

import Newhome from "./Components/Newhome/Newhome";
import Supplier from "./Components/Supplierdetails/Supplier";
import AddSupplier from "./Components/AddSuppliers/AddSupplier";
import UpdateSupplier from "./Components/UpdateSupplier/UpdateSupplier";
import AddFertilizer from "./Components/AddFertilizers/AddFertilizers";
import UpdateFertilizer from "./Components/UpdateFertilizers/UpdateFertilizers";
import DownloadSPdetails from "./Components/DownloadPDF/SupplierReviews";
import Payment from "./Components/Payment/Payment";
import Stock from "./Components/Stock/Stock";
import UpdateSpice from "./Components/UpdateSupplier/UpdateSpice";
import PaymentPage from "./Components/PaymentPage/PaymentPage";
import Fertilizers from "./Components/Fertilizers/Fertilizers";
import Notification from "./Components/SupNotification/Notification";
import ViewContactUsMessage from "./Components/DisplayContactUs/ContactMessagesList";


function App() {
  // Suppress ResizeObserver loop error
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(" ");
      if (errorMessage.includes("ResizeObserver loop completed with undelivered notifications")) {
        return;
      }
      originalError.apply(console, args);
    };

    const handleError = (event) => {
      if (event.message && event.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    return () => {
      console.error = originalError;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
    };
  }, []);

  return (
    <React.Fragment>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CusHome/>}/>
        <Route path="/cushome" element={<CusHome/>}/>
        <Route path="/about" element={<AboutUs/>}/>
        <Route path="/ContactUs" element={<ContactUs/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<CustomerLogin/>}/>
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/local-orders" element={<LocalOrders/>}/>
        <Route path="/export-orders" element={<ExportOrders/>}/>
        <Route path="/orderview/:id" element={<OrderView/>}/>
        <Route path="/cart" element={<CartItems/>}/>
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />

        {/* Protected Customer Route */}
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute>
              <Customer/>
            </ProtectedRoute>
          } 
        />
        <Route path="/ViewContactUsMessage" element={<ViewContactUsMessage />} />
        {/* ============================================ */}
        {/* SALES MANAGER PROTECTED ROUTES */}
        {/* ============================================ */}
        <Route 
          path="/sales-manager" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Sales']}>
              <SalesManager />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/sales-manager/quotations/:quotationId" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Sales']}>
              <QuotationForm />
            </ProtectedStaffRoute>
          }
        />

        {/* ============================================ */}
        {/* INVENTORY MANAGER PROTECTED ROUTES */}
        {/* ============================================ */}
        <Route 
          path="/HomeN" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <HomeN/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/Products/addproduct" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <Addproduct/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/Products/products" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <Products/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/fertilizer" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <FertilizerInv/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/addfertilizer" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <AddFertilizerInv/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/Stocks/supplier" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <SupplierProducts/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/Stocks/plantation" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <PlantationProducts/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/Stocks/order" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <Order/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/Products/products/:id" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <Updatespice/>
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/HomeN/Showspice" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <Showspice />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/HomeN/Statscards" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <Statscards />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/ProfileInv" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Inventory']}>
              <ProfileInv />
            </ProtectedStaffRoute>
          }
        />

        {/* ============================================ */}
        {/* HR MANAGER PROTECTED ROUTES */}
        {/* ============================================ */}
        <Route 
          path="/home" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <Home />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/mainFWorker" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <FWorker />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/mainAddWorker" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <AddWorker />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/mainFWorker/:id" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <UpdateWorker />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/addStaff" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <AddStaff />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/updateStaff/:id" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <UpdateStaff />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/staffManagement" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <StaffManagement />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/attendanceScanner" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <AttendanceScanner />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/attendanceTable" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <AttendanceTable />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/paymentPage" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['HR']}>
              <PaymentPage />
            </ProtectedStaffRoute>
          }
        />

        {/* ============================================ */}
        {/* FIELD MANAGER PROTECTED ROUTES */}
        {/* ============================================ */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Field']}>
              <Dashboard />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/plant" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Field']}>
              <Plant />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/report" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Field']}>
              <Report />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/account" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Field']}>
              <Account />
            </ProtectedStaffRoute>
          }
        />

        {/* ============================================ */}
        {/* SUPPLIER MANAGER PROTECTED ROUTES */}
        {/* ============================================ */}
        <Route 
          path="/newhome" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <Newhome />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/addsup" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <AddSupplier />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/supdet" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <Supplier />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/supdet/:id" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <UpdateSupplier />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/updateSpice/:id" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <UpdateSpice />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/fertilizers" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <Fertilizers />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/addfertilizers" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <AddFertilizer />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/updatefertilizers/:id" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <UpdateFertilizer />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/pdfdownloadsp" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <DownloadSPdetails />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/payments" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <Payment />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/stock" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <Stock />
            </ProtectedStaffRoute>
          }
        />
        <Route 
          path="/notification" 
          element={
            <ProtectedStaffRoute allowedStaffTypes={['Supplier']}>
              <Notification />
            </ProtectedStaffRoute>
          }
        />

        {/* Fallback route for undefined paths */}
        <Route path="*" element={<CusHome />} />
      </Routes>
    </React.Fragment>
  );
}

export default App;