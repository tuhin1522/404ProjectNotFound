<div align="center">
  <h1>🚀 404ProjectNotFound</h1>
  <p><strong>A comprehensive, full-stack Image Annotation and Task Management platform.</strong></p>

  ![React](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
  ![Django](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
  ![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql)
</div>

---

## 📖 Overview

**404ProjectNotFound** is an advanced, production-ready web application built on a decoupled architecture. It provides an intuitive **Kanban-style Task Management** system seamlessly integrated with a powerful **Canvas-based Image Annotation Workspace**. 

Whether you are assigning data labeling tasks to a team or drawing complex polygons on images, this platform delivers a fast, secure, and modern experience.

---

## 🏗️ Architecture

This project is split into two primary services:

- **Frontend Client (`/frontend`)**: A high-performance React 19 application built with Next.js 16. It handles complex canvas rendering, undo/redo states via Zustand, and provides a beautiful UI powered by TailwindCSS.
- **Backend API (`/backend`)**: A robust REST API built with Django 6 and Django REST Framework. It manages PostgreSQL data persistence, handles JWT authentication, and securely serves image processing routes.

---

## ✨ Key Features

- **🔐 Secure Authentication**: Stateless JWT-based authentication using `djangorestframework-simplejwt`.
- **📋 Kanban Task Management**: Create, assign, and drag-and-drop tasks across customizable columns in real-time.
- **🖌️ Image Annotation Engine**: 
  - Draw Polygons, Bounding Boxes, and Ellipses directly on uploaded images.
  - Interactive zooming, panning, and fullscreen workspace modes.
  - Custom color-coded labels mapped to specific objects.
- **📤 Export & Integration**: Download raw JSON annotation data or export rasterized PNG images instantly.
- **🌓 Dark Mode**: First-class support for Light and Dark modes.

---

## 🚀 Quick Start

To run the entire platform locally, you will need to run the backend and frontend servers simultaneously in separate terminals.

### 1. Start the Backend API
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
The Django API will run at `http://127.0.0.1:8000/`.

### 2. Start the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
The Next.js application will run at `http://localhost:3000/`.

---

## 📚 Detailed Documentation

For deep dives into the API endpoints, environment configurations, and folder structures, please refer to the dedicated documentation for each service:

- 🔗 **[Frontend Documentation](./frontend/README.md)**
- 🔗 **[Backend API Documentation](./backend/README.md)**

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#) if you want to contribute.

## 🧑‍💻 Author

- **Tuhin** - *Initial work & architecture* - [GitHub](https://github.com/tuhin1522)

## 📝 License

This project is proprietary and confidential. All rights reserved.
