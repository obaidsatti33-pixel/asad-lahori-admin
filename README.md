# Asad Lahori Nashta Centre — Admin Panel

> A professional admin dashboard for managing the Asad Lahori Nashta Centre's menu, orders, customers, sales, availability, and restaurant settings.

The Admin Panel is the management interface of the **Asad Lahori Nashta Centre Full-Stack Restaurant System**.

It connects with the Node.js/Express backend and provides restaurant staff with a centralized dashboard to manage daily restaurant operations efficiently.

---

## 🚀 Live Admin Panel

**Admin Dashboard:**  
https://admin-tau-five-rql50vj1kw.vercel.app

---

## 📌 Project Overview

The Asad Lahori Nashta Centre Admin Panel was developed as part of a complete full-stack restaurant management system.

The goal was to create a practical and professional dashboard that can be used by restaurant management to monitor and control important business operations from one place.

The panel communicates with the production backend through REST APIs and uses authenticated sessions for protected admin functionality.

---

## ✨ Key Features

### 📊 Dashboard

- Overview of restaurant activity
- Menu item count
- Order statistics
- Customer statistics
- Sales information
- Quick access to management sections

---

### 🍽️ Menu Management

Admin users can manage restaurant menu items directly from the dashboard.

Features include:

- Add new menu items
- Edit existing products
- Delete menu items
- Update prices
- Manage categories
- Control item availability
- View current menu data

---

### 📦 Order Management

The order management system allows restaurant staff to monitor and process customer orders.

Order workflow includes:

```text
Pending
   ↓
Confirmed
   ↓
Preparing
   ↓
Ready
   ↓
Completed
For delivery orders:

```text
Pending
   ↓
Confirmed
   ↓
Preparing
   ↓
Ready
   ↓
Out for Delivery
   ↓
Completed
