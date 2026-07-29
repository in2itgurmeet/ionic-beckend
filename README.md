# Proxima Logistics & Supply Chain System - Project Overview

This document provides a comprehensive end-to-end flow of the Proxima Logistics project. It acts as a guide to understanding the complete user journey and the underlying architecture of both the client applications and the backend server.

## 1. Project Architecture

The platform is split into three main entities:
- **Backend API (Node.js & Express)**: Centralized server managing MongoDB databases, Socket.io real-time connections, dynamic configurations, routing (OSRM), and geocoding (Leaflet/Nominatim).
- **Customer App (Ionic & Angular)**: Used by customers/companies to book trucks (FTL/PTL), track shipments live on a map, view order history, and download/share Invoices and Lorry Receipts (LR).
- **Driver App (Ionic & Angular)**: Used by truck drivers to view assigned orders, update transit status (Gate In, Gate Out, In-Transit, Delivered), stream live GPS locations, and upload Proof of Delivery (POD).

---

## 2. End-to-End User Flow

### Step 1: Authentication & Registration (Customer & Driver)
- **Customer**: Registers providing Name, Email, Phone, and Company Details. Uses JWT-based authentication for subsequent logins.
- **Driver**: Registers providing Vehicle details (Number, Type, Capacity, Dimensions) and License info. 

### Step 2: Order Booking (Customer App)
- **Step 2A (Pickup/Delivery)**: Customer enters Pickup and Delivery locations. The backend dynamically converts these locations into coordinates using **Nominatim API (Geocoding)**, and calculates the exact road distance and estimated time of arrival (ETA) using the **OSRM Routing API**.
- **Step 2B (Vehicle & Cargo)**: The system dynamically fetches available vehicle types from the backend database (Admin controlled). The customer inputs cargo details and explicit charges (Freight, Loading, Unloading).
- **Step 2C (Payment & Checkout)**: Customer selects the payment method. The backend creates an `Order`, and auto-generates a dynamic `Invoice` and `Lorry Receipt` based on the exact submitted charges and the Admin-configured Tax rates (CGST/SGST).

### Step 3: Order Assignment
- The backend matches the requested vehicle type and capacity with active registered drivers.
- Drivers receive real-time notifications via **Socket.io** and Firebase Push Notifications.
- Once a driver accepts the order from the Driver App, the backend dynamically updates the `Lorry Receipt` with the real driver's name, phone, license, and vehicle registration number.

### Step 4: Real-time Transit Tracking (Driver App -> Backend)
- As the driver begins the journey, they update milestones: `Pickup Started` -> `In-Transit`.
- While `In-Transit`, the Driver App uses the **Capacitor Geolocation API** to fetch live GPS coordinates and emits them continuously to the backend via **Socket.io**.

### Step 5: Live Map Tracking (Customer App)
- Customers navigate to the `Track Order` screen.
- Instead of static iframes, the Customer App uses **Leaflet Map** integrated with OpenStreetMap.
- The map automatically draws the **blue polyline route** between the pickup and delivery coordinates using Leaflet Routing Machine / OSRM.
- Real-time GPS markers move along the map as updates are broadcasted from the backend via Socket.io.

### Step 6: Proof of Delivery (POD)
- Upon reaching the destination, the driver marks the order as `Delivered`.
- The driver captures receiver signatures digitally and uploads delivery photos (handled by **Multer**).
- The order status updates universally, halting the live GPS broadcasting.

### Step 7: Document Sharing & Invoicing
- Customers can view their final `Invoice` and `Lorry Receipt` (LR) directly in the app.
- The documents use dynamic layouts to generate Base64 PDF blobs via `html2canvas` and `jspdf`.
- Customers can download the PDFs locally or share them via Email. If shared via email, the backend securely routes the attached PDF using **Nodemailer**.

---

## 3. Key Dynamic Implementations
- **Dynamic Maps & Routing**: No hardcoded API keys or static distances. Fully relies on OpenStreetMap (Leaflet) and OSRM for authentic routing and distance calculation.
- **Dynamic Billing & Taxes**: Taxes (SGST, CGST) and terms are fetched centrally from a `Settings` model. All charges (Freight, Loading, Unloading) are explicit per order, removing any static percentage fallbacks.
- **Dynamic Vehicle Management**: Vehicles are fetched from a MongoDB `Vehicle` model, allowing Admins to add/remove truck options globally via CRUD APIs.
