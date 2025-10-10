import React, { useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import "./AttendanceScanner.css";
import Nav from "../Nav/Nav";

function AttendanceScanner() {
  const [scannedData, setScannedData] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScannedRef = useRef("");
  const lastScanTimeRef = useRef(0);

  const handleScan = async (results) => {
    if (!results || !results[0]) return;

    let qrValue = results[0].rawValue;
    if (!qrValue) return;

    qrValue = qrValue.trim().toLowerCase();

    // Debounce duplicate scans
    const now = Date.now();
    if (qrValue === lastScannedRef.current && now - lastScanTimeRef.current < 5000) return;

    lastScannedRef.current = qrValue;
    lastScanTimeRef.current = now;

    setScannedData(qrValue);
    setIsProcessing(true);
    setMessage("Processing...");

    try {
      // ✅ POST scanned email (server decides whether to set arrival or leaving)
      const res = await axios.post(
        "http://localhost:5000/attendance",
        { email: qrValue },
        { timeout: 10000, headers: { "Content-Type": "application/json" } }
      );

      if (res.data.status === "success") {
        setMessage(`✅ ${res.data.message || "Attendance updated successfully"}`);
      } else {
        setMessage(`❌ ${res.data.message || "Failed to update attendance"}`);
      }
    } catch (err) {
      console.error("⚠️ Attendance error:", err);

      if (err.code === "ECONNREFUSED") {
        setMessage("❌ Cannot connect to backend. Make sure server is running on port 5000.");
      } else if (err.response) {
        setMessage(`❌ Backend responded with status ${err.response.status}: ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        setMessage("❌ No response from backend. Check server logs.");
      } else {
        setMessage(`❌ Unexpected error: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="attendancescanner-page">
      <Nav /> {/* Sidebar */}

      <div className="attendancescanner-containers">
        <h2 className="attendancescanner-header">Attendance Scanner</h2>
        
        <div className="attendancescanner-layout">
          <div className="attendancescanner-section">
            <div className="attendancescanner-overlay">
              <Scanner
                onScan={handleScan}
                onError={(err) => {
                  console.error("Scanner error:", err);
                  setMessage("❌ Scanner error: " + err.message);
                }}
                styles={{ 
                  container: { width: "100%", height: "100%", borderRadius: "8px", overflow: "hidden" },
                  video: { width: "100%", height: "100%", objectFit: "cover" }
                }}
              />
              <div className="attendancescanner-scan-line"></div>
              <div className="attendancescanner-frame">
                <div className="attendancescanner-corner top-left"></div>
                <div className="attendancescanner-corner top-right"></div>
                <div className="attendancescanner-corner bottom-left"></div>
                <div className="attendancescanner-corner bottom-right"></div>
              </div>
            </div>
          </div>

          <div className="attendancescanner-instructions-section">
            <div className="attendancescanner-instructions-card">
              <h3>How to Use the Scanner</h3>
              <div className="attendancescanner-instructions-list">
                <div className="attendancescanner-instruction-step">
                  <div className="attendancescanner-step-number">1</div>
                  <div className="attendancescanner-step-content">
                    <h4>Position the QR Code</h4>
                    <p>Place the QR code within the scanner frame</p>
                  </div>
                </div>
                
                <div className="attendancescanner-instruction-step">
                  <div className="attendancescanner-step-number">2</div>
                  <div className="attendancescanner-step-content">
                    <h4>Hold Steady</h4>
                    <p>Keep the code steady until it's recognized</p>
                  </div>
                </div>
                
                <div className="attendancescanner-instruction-step">
                  <div className="attendancescanner-step-number">3</div>
                  <div className="attendancescanner-step-content">
                    <h4>Wait for Confirmation</h4>
                    <p>Look for the success message below</p>
                  </div>
                </div>
              </div>

              {/* ✅ Scan Status Panel under instructions */}
              <div className="attendancescanner-status-panel-instructions">
                <h3 className="attendancescanner-status-title">Scan Status:</h3>
                {scannedData && (
                  <div className="attendancescanner-scanned-data">
                    <strong>Scanned Data:</strong> {scannedData}
                  </div>
                )}
                {message && (
                  <div
                    className={`attendancescanner-status-message ${
                      message.includes("✅")
                        ? "attendancescanner-status-success"
                        : message.includes("❌")
                        ? "attendancescanner-status-error"
                        : "attendancescanner-status-info"
                    }`}
                  >
                    {message}
                  </div>
                )}
                {isProcessing && (
                  <div className="attendancescanner-status-message attendancescanner-status-processing">Processing...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceScanner;
