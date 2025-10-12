import './utils/axiosConfig'; 
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import ProtectedStaffRoute from './Components/ProtectedStaffRoute';
import StaffLogin from "./Components/Log/StaffLogin";
import ContactUs from "./Components/ContactUs/ContactUs"
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
import Nav from "./Components/NavInv/NavInv.js";
import Showspice from "./Components/HomeN/Showspice.js";
import Statscards from "./Components/HomeN/Statscards.js";




// Field-side pages
import Navfield from "./Components/Navfield/Navfield";
import Plant from "./Components/Plant/Plant";
import Dashboard from "./Components/Dashboard/Dashboard";
import Report from "./Components/Report/Report";
import Account from "./Components/Account/Account";
import Cinnamon from "./Components/Cinnamon/Cinnamon";

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
import NavSup from "./Components/NavSup/NavSup";

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
import Log from "./Components/Log/Log"; // Login page
import PaymentPage from "./Components/PaymentPage/PaymentPage";
import Fertilizers from "./Components/Fertilizers/Fertilizers";
import Notification from "./Components/SupNotification/Notification";
// ---------------- APP ----------------
function App() {
  // Suppress ResizeObserver loop error
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(" ");
      if (
        errorMessage.includes(
          "ResizeObserver loop completed with undelivered notifications"
        )
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    const handleError = (event) => {
      if (
        event.message &&
        event.message.includes(
          "ResizeObserver loop completed with undelivered notifications"
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes(
          "ResizeObserver loop completed with undelivered notifications"
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection,
      true
    );

    return () => {
      console.error = originalError;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
        true
      );
    };
  }, []);

  return (
    <React.Fragment>
      <Routes>


          <Route path="/" element={<CusHome/>}/>
          <Route path="/cushome" element={<CusHome/>}/>
          <Route path="/about" element={<AboutUs/>}/>
          <Route path="/ContactUs" element={<ContactUs/>}/>
          <Route path="/mainhome" element={<Home/>}/>
         
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<CustomerLogin/>}/>
          <Route path="/local-orders" element={<LocalOrders/>}/>
          <Route path="/export-orders" element={<ExportOrders/>}/>
          <Route path="/orderview/:id" element={<OrderView/>}/>
          <Route path="/cart" element={<CartItems/>}/>
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          {/* This is the corrected and protected route for the customer dashboard */}
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute>
                <Customer/>
              </ProtectedRoute>
            } 
          />
          
          {/* This is the protected route for the sales manager dashboard */}
         <Route 
            path="/sales-manager" 
           element={<SalesManager />}
          />
          
          {/* Change this route to remove the ProtectedRoute wrapper */}
          <Route 
            path="/sales-manager/quotations/:quotationId" 
            element={<QuotationForm />}
          />
          
          <Route path ="/HomeN" element={<HomeN/>}/>
          <Route path ="/Products/addproduct" element={<Addproduct/>}/>
          <Route path ="/Products/products" element={<Products/>}/>
          <Route path ="/fertilizer" element={<FertilizerInv/>}/>
          <Route path ="/addfertilizer" element={<AddFertilizerInv/>}/>
          <Route path ="/Stocks/supplier" element={<SupplierProducts/>}/>
          <Route path ="/Stocks/plantation" element={<PlantationProducts/>}/>
          <Route path ="/Stocks/order" element={<Order/>}/>
          <Route path ="/Products/products/:id" element={<Updatespice/>}/>
          <Route path="/HomeN/Showspice" element={<Showspice />} />
          <Route path="/HomeN/Statscards" element={<Statscards />} />



        {/* Auth / Entry */}
       {/* <Route path="/" element={<Log />} />*/}
        <Route path="/home" element={<Home />} />
        <Route path="/newhome" element={<Newhome />} />

        {/* Field-side */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plant" element={<Plant />} />
        <Route path="/report" element={<Report />} />
        <Route path="/account" element={<Account />} />

        {/* Field Worker */}
        <Route path="/mainFWorker" element={<FWorker />} />
        <Route path="/mainAddWorker" element={<AddWorker />} />
        <Route path="/mainFWorker/:id" element={<UpdateWorker />} />

        {/* Staff Management */}
        
        <Route path="/addStaff" element={<AddStaff />} />
        <Route path="/updateStaff/:id" element={<UpdateStaff />} />
        <Route path="/staffManagement" element={<StaffManagement />} />




        {/* Attendance */}
        <Route path="/attendanceScanner" element={<AttendanceScanner />} />
        <Route path="/attendanceTable" element={<AttendanceTable />} />

        {/* Payments */}
        <Route path="/paymentPage" element={<PaymentPage />} />

        {/* Supplier + Fertilizer */}
        <Route path="/addsup" element={<AddSupplier />} />
        <Route path="/supdet" element={<Supplier />} />
        <Route path="/supdet/:id" element={<UpdateSupplier />} />
        <Route path="/updateSpice/:id" element={<UpdateSpice />} />
        <Route path="/fertilizers" element={<Fertilizers />} />
        <Route path="/addfertilizers" element={<AddFertilizer />} />
        <Route path="/updatefertilizers/:id" element={<UpdateFertilizer />} />
        <Route path="/pdfdownloadsp" element={<DownloadSPdetails />} />
        <Route path="/payments" element={<Payment />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/notification" element={<Notification />} />
        

        <Route path="/staff-login" element={<StaffLogin />} />
      </Routes>
    </React.Fragment>
  );
}

export default App;
