# 🏡 BA Tours & Rentals System

A full-stack **guided tours and  water sport rental  platform** built with **HTML, CSS, JavaScript (Frontend)** and **Node.js, Express, MongoDB (Backend)**.  
It allows clients to browse, book, and report services, while admins manage inventory, bookings, reports, and finances — all through interactive dashboards.

---

## 🌐 Live Demo

[![Frontend - GitHub Pages](https://img.shields.io/badge/Frontend-Live%20Demo-1E90FF?logo=github)](https://codewithshadyy.github.io/BA-tours-rentals/)
[![Backend - Render](https://img.shields.io/badge/Backend-API%20Live-00C853?logo=render)](https://ba-tours-rentals.onrender.com)

> 🟢 **Frontend:** Hosted on GitHub Pages  
> 🟢 **Backend API:** Hosted on Render  

---

## ✨ Features

### 🌍 Public Pages
- **Landing Page:** Engaging grid of services with “Get Started” buttons.  
- **About / Services / Contact Pages:** Include social media links (TikTok, Instagram, Facebook, X).  
- **Contact Form:** Sends messages directly to the admin dashboard.

### 🔐 Authentication
- Secure JWT-based authentication.
- Only two special accounts have **Admin** access (`admin1@email.com`, `admin2@email.com`).
- Everyone else automatically registers as **Client**.

### 👤 Client Dashboard
- 🏠 **Water sport rental :** View, search, and filter available properties.  
- 🧭 **tour guide:** Discover tours and packages.  
- 🗓️ **Bookings:** Book rentals/tours with number of adults, children, and payment method.  
- 🧾 **Reports:** Submit feedback or service issues to the admin.  
- 👨‍💻 **Profiles:** Displays client details and booking history.  
- 📱 **Responsive Design:** Sidebar converts into hamburger menu for mobile users.

### 🧑‍💼 Admin Dashboard
- 📊 **Stats Page:** Graphical analytics for Properties, Bookings, Reports, and Messages.  
- 🏘️ **Inventory:** Add, edit, or delete rental properties and adventures.  
- 📝 **Client Reports:** View and update the status of submitted reports.  
- 💬 **Messages:** Manage all messages from the contact form.  
- 💵 **Finance:** Displays monthly and total revenue with charts.  
- 👥 **Profile:** Lists all registered users in the system.  
- 📱 **Responsive Sidebar:** Auto-hides on mobile, toggleable with a hamburger menu.

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (JSON Web Tokens) |
| Styling | Responsive Flexbox + Grid |
| Hosting | Render (Backend), GitHub Pages (Frontend) |
| Version Control | Git + GitHub |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
https://github.com/codewithshadyy/BA-tours-rentals.git
cd BA-tours-rentals
