"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [qrValue, setQrValue] = useState("");

  const generateQR = () => {
    if (!name && !phone && !address && !birthday) {
      alert("Please fill in at least one field.");
      return;
    }

    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${name || ""}
TEL:${phone || ""}
ADR:;;${address || ""};;;;
BDAY:${birthday || ""}
END:VCARD`.replace(/\n/g, "\n"); // Keep line breaks

    setQrValue(vCard.trim());
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        QR Code Contact Generator
      </h1>
      <p style={{ textAlign: "center", color: "#555", marginBottom: "2rem" }}>
        Enter your details and generate a scannable vCard QR code.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Address (e.g., 123 Main St, City, Country)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button onClick={generateQR} style={buttonStyle}>
        Generate QR Code
      </button>

      {qrValue && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h3>Your QR Code:</h3>
          <div
            style={{
              background: "white",
              padding: "16px",
              display: "inline-block",
              borderRadius: "8px",
            }}
          >
            <QRCode value={qrValue} size={256} />
          </div>
          <p style={{ marginTop: "1rem", color: "#333", fontSize: "0.9rem" }}>
            Scan with your phone to save as a contact.
          </p>
        </div>
      )}
    </div>
  );
}

// Simple inline styles
const inputStyle = {
  padding: "12px",
  fontSize: "1rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  outline: "none",
};

const buttonStyle = {
  marginTop: "1rem",
  padding: "12px 24px",
  fontSize: "1rem",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};
