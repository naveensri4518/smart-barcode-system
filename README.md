# 🛒 SmartBarcode (Velora)
**An Enterprise-Grade Retail Inventory Management and Intelligent POS Billing Platform**

SmartBarcode (Velora) is a complete, production-grade SaaS-style platform designed to unify inventory management, barcode-driven point-of-sale (POS) billing, staff management, and real-time analytics into a single, seamless web application.

It solves modern retail inefficiencies such as slow checkout queues, inaccurate stock counts, lack of real-time sales insights, and security vulnerabilities by providing a fast, secure, and data-driven ecosystem.

---

## 🏗️ System Architecture

The application is built using a modern decoupled architecture:

`ReactJS (Frontend) ➔ REST APIs (JSON) ➔ Spring Boot (Backend) ➔ Spring Security (JWT) ➔ MySQL (Database)`

* **Presentation Layer (Frontend):** Highly responsive Single Page Application (SPA) built with **React** and **Vite**. It enables fast POS billing without page reloads.
* **Business Logic Layer (Backend):** Powered by **Java Spring Boot**, handling business rules like tax calculation, stock deduction, and invoice generation.
* **Security Layer:** **Spring Security** combined with stateless **JWT (JSON Web Tokens)** strictly enforces Role-Based Access Control (RBAC) ensuring Staff cannot access Admin functionalities.
* **Data Persistence Layer:** **MySQL 8.0** guarantees ACID compliance, ensuring that financial transactions (invoicing and stock reduction) are processed reliably.

---

## 🌟 Core Modules

### 1. 🔐 Authentication & Security
* Secure login via BCrypt password hashing.
* Stateless session management utilizing JWT.
* Full Audit Logs tracing every critical action (Login, Invoice Generation, Product Update).

### 2. ⚡ POS Billing Module
* Rapid checkout interface designed for cashiers.
* Supports physical USB barcode scanners simulating keyboard input for instant cart additions.
* Automatically calculates subtotals, applies tax (GST), and processes discounts.

### 3. 📦 Inventory & Product Management
* Centralized catalog for all items, mapping barcodes to specific product IDs.
* Automatic stock deduction upon invoice generation.
* Real-time automated low-stock alerts triggered when inventory drops below the predefined `min_stock_level`.

### 4. 📊 Admin Dashboard & Reports
* Apple-style premium dashboard offering a bird's-eye view of the business.
* Visualizes daily/monthly sales trends, active stock levels, and revenue metrics.
* Reports can be instantly exported to Excel/CSV formats.

### 5. 👥 Staff Management
* Admins can create, manage, and deactivate employee accounts (`ROLE_STAFF`).
* Enforces accountability by tying every generated invoice to the specific cashier who processed it.

---

## 🗄️ Database Schema Overview

The system uses a highly normalized relational database structure consisting of key tables:

1. **`users`**: Employee credentials, hashed passwords, and roles.
2. **`categories`**: Product classifications (One-to-Many with products).
3. **`suppliers`**: Vendor details for stock tracking.
4. **`products`**: The core catalog (`barcode`, `name`, `selling_price`, `current_stock`).
5. **`invoices`**: Bill headers (Total amount, Date, Cashier ID).
6. **`invoice_items`**: Individual line items linked to an invoice (Many-to-One).
7. **`audit_logs`**: Security trails recording system events and user actions.
8. **`inventory_logs`**: Tracks adjustments, restocking, and automated deductions.
9. **`returns` / `return_logs`**: Manages product returns and stock re-adjustment.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite |
| **Routing & State** | React Router DOM, Context API |
| **UI / Styling** | Custom CSS / Tailwind, Framer Motion, Lucide React |
| **Charting & Barcodes**| Recharts, html5-qrcode, @zxing/browser |
| **Backend Framework** | Java 21, Spring Boot 3.2.x |
| **Security** | Spring Security, JJWT |
| **Database & ORM** | MySQL 8.0, Spring Data JPA / Hibernate |
| **Build Tools** | Maven (Backend), npm (Frontend) |

---

## 🚀 Installation & Local Setup

### Prerequisites
* Java 21+
* Node.js 18+
* MySQL 8.0 Server

### 1. Database Setup
Create a new MySQL database for the application:
```sql
CREATE DATABASE smartbarcode_db;
