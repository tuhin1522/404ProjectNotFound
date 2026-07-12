# 404ProjectNotFound - Frontend

The interactive frontend client for **404ProjectNotFound**, designed to provide a highly performant and intuitive user experience. It encompasses two major applications: a **Kanban-style Task Manager** and an advanced **Image Annotation Workspace**.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components & Icons**: Lucide React, Sonner (Toast Notifications)

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v20.0 or higher
- **Package Manager**: `npm`

### Installation

1. **Clone and Navigate**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env.local` file in the root of the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. API requests are automatically routed via the Axios instance to your local Django backend.

---

## 📂 Project Structure

- `/src/app` - Next.js App Router layout, pages, and global styles.
- `/src/app/components` - Reusable global UI components (e.g., buttons, inputs, modals).
- `/src/app/modules` - Domain-driven feature modules:
  - `/annotations` - Canvas drawing logic, state store, sidebars, and annotation-specific components.
  - `/tasks` - Kanban board drag-and-drop components and services.
  - `/auth` - Login, registration, JWT management, and auth components.
- `/src/app/lib/utils` - Shared utility functions (e.g., file downloads, formatting).
- `/src/app/services` - Global HTTP/Axios interceptors.

---

## 📜 Available Scripts

- `npm run dev`: Runs the app in development mode with hot-reloading.
- `npm run build`: Compiles the application for production deployment.
- `npm run start`: Starts the production server (requires a prior build).
- `npm run lint`: Analyzes the code for style and syntax errors using ESLint.

---

## ✨ Key Features

### 📋 Tasks Management
- **Interactive Kanban Board**: Drag and drop tasks between columns (To Do, In Progress, Done) seamlessly.
- **Detailed Task Tracking**: Manage task titles, descriptions, and due dates to keep projects organized.

### 🖼️ Image Annotation Workspace
- **Advanced Canvas Engine**: Draw, edit, and manage complex polygons, ellipses, and bounding boxes directly on images.
- **Real-time Tools**: Undo/redo stacks, zoom/pan controls, and fullscreen view.
- **Image Filmstrip & Labels**: Navigate through multiple uploaded images easily and manage custom color-coded labels in the sidebar.
- **Theme Support**: Seamless Light and Dark mode integration natively via Tailwind.
- **Export Options**: Export annotations as standard JSON payloads or rasterized PNG images.
