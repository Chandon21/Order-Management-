# 🧱 Sales Order Management (Angular)

A complete **Sales Order Management System** built with **Angular** and **JSON Server** to demonstrate CRUD operations, reactive forms, routing, validation, and data management.

---

## 🚀 Features

✅ View a paginated, searchable, and sortable list of Sales Orders  
✅ Create new sales orders with VAT, discount, and calculated totals  
✅ Update existing orders (edit mode)  
✅ Manage customers (add, select, or use guest customer)  
✅ Manage products (auto-calculation of total)  
✅ Real-time form validation  
✅ Pagination, filtering, and sorting  
✅ JSON Server as mock backend (no real API needed)


## 🧰 Technologies Used
- Angular
- TypeScript
- Bootstrap
- Reactive Forms
- JSON Server (Mock REST API)

---

## ⚙️ Installation & Run Guide

### 1️⃣ Clone the Repository

bash
git clone https://github.com/ChandonGhosh/sales-order-management.git
cd sales-order-management

Start JSON Server:
npx json-server --watch db.json --port 3000

Orders → http://localhost:3000/orders

Customers → http://localhost:3000/customers

Products → http://localhost:3000/products

Your mock data is stored in db.json.

Run Angular Application:

In another terminal window, start the frontend:

ng serve
