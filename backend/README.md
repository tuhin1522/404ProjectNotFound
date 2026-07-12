# 404ProjectNotFound - Backend API

The backend service for the **404ProjectNotFound** application, built using Django 6 and Django REST Framework. This API powers the two core features of the platform: **Tasks Management (Kanban)** and the **Image Annotation Workspace**.

## Tech Stack & Requirements

- **Python Version**: Python 3.10+ (Python 3.12+ recommended)
- **Framework**: Django 6.0.6
- **API**: Django REST Framework 3.17
- **Database**: PostgreSQL (psycopg 3.3.4)
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`

## 📂 Project Structure

- `/apps` - Domain-driven Django applications:
  - `/annotations` - Models, views, and serializers for the image drawing workspace.
  - `/tasks` - Kanban board logic, task models, and reorder endpoints.
  - `/users` - Custom user model and authentication logic.
  - `/common` - Shared utilities, permissions, and pagination logic.
- `/config` - Root Django configuration, settings, and main `urls.py`.
- `/media` - Local storage directory for user-uploaded images.
- `manage.py` - Django CLI entry point.
- `requirements.txt` - Python dependencies.

---

## 🛠️ Local Development Setup

Follow these steps to run the backend server locally.

1. **Clone and Navigate**: Open your terminal and navigate to the backend directory.
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**: It is highly recommended to use an isolated Python environment.
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install Dependencies**: Install the required Python packages from the requirements file.
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**: Create a `.env` file in the root backend directory to configure your environment variables (e.g., `SECRET_KEY`, database credentials).

5. **Database Migrations**: Apply the Django migrations to set up the PostgreSQL database schema.
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Start the Development Server**: Run the local development server.
   ```bash
   python manage.py runserver
   ```
   The API will now be accessible at `http://127.0.0.1:8000/`.

---

## Complete API Documentation

All application API endpoints are served under the `/api/v1/` prefix and require a valid JWT Bearer token in the `Authorization` header, except for user registration and login endpoints.

### 🔐 Authentication (`/api/v1/users/`)

#### 1. Register User
- **Endpoint**: `POST /api/v1/users/register/` (No Auth)
- **Request Body**:
  ```json
  {
    "email": "tuhin@gmail.com",
    "password": "StrongPassword123!",
    "first_name": "Tuhin",
    "last_name": "Molla"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 10,
    "email": "tuhin@gmail.com",
    "first_name": "Tuhin",
    "last_name": "Molla"
  }
  ```

#### 2. Login User
- **Endpoint**: `POST /api/v1/users/login/` (No Auth)
- **Request Body**:
  ```json
  {
    "email": "tuhin@gmail.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
  ```

#### 3. Refresh Token
- **Endpoint**: `POST /api/v1/users/login/refresh/` (No Auth)
- **Request Body**:
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "new_access_token_here..."
  }
  ```

#### 4. Current User Detail (Get)
- **Endpoint**: `GET /api/v1/users/me/`
- **Response (200 OK)**:
  ```json
  {
    "id": 10,
    "email": "tuhin@gmail.com",
    "first_name": "Tuhin",
    "last_name": "Molla"
  }
  ```

#### 5. Replace / Partially Update Current User
- **Endpoints**: `PUT /api/v1/users/me/` | `PATCH /api/v1/users/me/`
- **Request Body**:
  ```json
  {
    "email": "john.new@example.com",
    "first_name": "John",
    "last_name": "Smith"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 10,
    "email": "john.new@example.com",
    "first_name": "John",
    "last_name": "Smith"
  }
  ```

---

### 📋 Tasks Management (`/api/v1/tasks/`)

#### 1. Fetch Tasks (All or Filtered)
- **Endpoint**: `GET /api/v1/tasks/` or `GET /api/v1/tasks/?due_date=YYYY-MM-DD`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 15,
      "title": "Complete Backend Assignment",
      "description": "Finish Django Task API",
      "column": "in_progress",
      "priority": "high",
      "due_date": "2026-07-11",
      "tags": [
          "django",
          "assignment"
      ],
      "order": 0,
      "created_at": "2026-07-11T15:39:18.370420Z",
      "updated_at": "2026-07-11T15:39:18.370433Z"
    },
  ]
  ```

#### 2. Create Task
- **Endpoint**: `POST /api/v1/tasks/`
- **Request Body**:
  ```json
  {
    "title": "Complete Backend Assignment",
    "description": "Finish Django Task API",
    "column": "in_progress",
    "priority": "high",
    "due_date": "2026-07-11",
    "tags": [
        "django",
        "assignment"
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 15,
    "title": "Complete Backend Assignment",
    "description": "Finish Django Task API",
    "column": "in_progress",
    "priority": "high",
    "due_date": "2026-07-11",
    "tags": [
        "django",
        "assignment"
    ],
    "order": 0,
    "created_at": "2026-07-11T15:39:18.370420Z",
    "updated_at": "2026-07-11T15:39:18.370433Z"
  }
  ```

#### 3. Retrieve a Single Task
- **Endpoint**: `GET /api/v1/tasks/<id>/`
- **Response (200 OK)**:
  ```json
  {
    "id": 15,
    "title": "Complete Backend Assignment",
    "description": "Finish Django Task API",
    "column": "in_progress",
    "priority": "high",
    "due_date": "2026-07-11",
    "tags": [
        "django",
        "assignment"
    ],
    "order": 0,
    "created_at": "2026-07-11T15:39:18.370420Z",
    "updated_at": "2026-07-11T15:39:18.370433Z"
  }
  ```

#### 4. Update / Replace Task
- **Endpoints**: `PATCH /api/v1/tasks/<id>/` | `PUT /api/v1/tasks/<id>/`
- **Request Body**:
  ```json
  {
    "column": "in_progress"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 15,
    "title": "Complete Backend Assignment",
    "description": "Finish Django Task API",
    "column": "in_progress",
    "priority": "high",
    "due_date": "2026-07-11",
    "tags": [
        "django",
        "assignment"
    ],
    "order": 0,
    "created_at": "2026-07-11T15:39:18.370420Z",
    "updated_at": "2026-07-11T16:13:14.449550Z"
  }
  ```

#### 5. Delete Task
- **Endpoint**: `DELETE /api/v1/tasks/<id>/`
- **Response (204 No Content)**: *(Empty Body)*

#### 6. Bulk Reorder Tasks
- **Endpoint**: `PATCH /api/v1/tasks/reorder/`
- **Request Body**:
  ```json
  [
    {
      "id": 14,
      "column": "todo",
      "order": 0
    },
    {
      "id": 16,
      "column": "todo",
      "order": 1
    }
  ]
  ```
- **Response (200 OK)**:
  ```json
  {
    "updated": [
      14,
      16
    ]
  }
  ```

---

### 🖼️ Annotation Workspace - Images (`/api/v1/annotations/images/`)

#### 1. List Images
- **Endpoint**: `GET /api/v1/annotations/images/`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 42,
      "name": "sample_image.png",
      "image_url": "/media/images/sample_image.png",
      "order": 0,
      "polygons": [
        {
          "id": 101,
          "label": "Car",
          "color": "#ef4444",
          "points": [{"x": 10.5, "y": 20.1}],
          "created_at": "2026-07-11T12:00:00Z"
        }
      ]
    }
  ]
  ```

#### 2. Upload Image
- **Endpoint**: `POST /api/v1/annotations/images/`
- **Request (multipart/form-data)**:
  - `file`: (binary image file)
- **Response (201 Created)**:
  ```json
  {
    "id": 52,
    "name": "Gemini_Generated_Image_z2e7u1z2e7u1z2e7.png",
    "image_url": "http://localhost:8000/media/annotations/10/Gemini_Generated_Image_z2e7u1z2e7u1z2e7.png",
    "order": 0,
    "polygon_count": 0,
    "polygons": [],
    "created_at": "2026-07-11T17:18:00.860078Z",
    "updated_at": "2026-07-11T17:18:00.860094Z"
  }
  ```

#### 3. Get Image Details
- **Endpoint**: `GET /api/v1/annotations/images/<id>/`
- **Response (200 OK)**:
  ```json
  {
    "id": 52,
    "name": "Gemini_Generated_Image_z2e7u1z2e7u1z2e7.png",
    "image_url": "http://localhost:8000/media/annotations/10/Gemini_Generated_Image_z2e7u1z2e7u1z2e7.png",
    "order": 0,
    "polygon_count": 0,
    "polygons": [],
    "created_at": "2026-07-11T17:18:00.860078Z",
    "updated_at": "2026-07-11T17:18:00.860094Z"
  }
  ```

<!-- #### 4. Update/Rename Image
- **Endpoint**: `PATCH /api/v1/annotations/images/<id>/`
- **Request Body**:
  ```json
  {
    "name": "new_name.png"
  }
  ```
- **Response (200 OK)**: (Returns updated image object) -->

#### 4. Delete Image
- **Endpoint**: `DELETE /api/v1/annotations/images/<id>/`
- **Response (204 No Content)**: *(Empty Body)*

#### 5. Bulk Reorder Images
- **Endpoint**: `PATCH /api/v1/annotations/images/reorder/`
- **Request Body**:
  ```json
  [
    { "id": 42, "order": 1 },
    { "id": 43, "order": 0 }
  ]
  ```
- **Response (200 OK)**:
  ```json
  {
    "updated": [42, 43]
  }
  ```

---

### 🔺 Annotation Workspace - Polygons (`/api/v1/annotations/polygons/`)

#### 1. List Polygons (All or Filtered)
- **Endpoint**: `GET /api/v1/annotations/polygons/` or `GET /api/v1/annotations/polygons/?image=<id>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 220,
      "image": 53,
      "points": [
          {
              "x": 0.22281397077037401,
              "y": 0.10762942779291552
          },
          {
              "x": 0.3067872182313599,
              "y": 0.10762942779291552
          },
          {
              "x": 0.3067872182313599,
              "y": 0.24250681198910082
          },
          {
              "x": 0.22281397077037401,
              "y": 0.24250681198910082
          }
      ],
      "label": "Bird",
      "color": "#6366f1",
      "label_position": null,
      "created_at": "2026-07-11T17:26:58.224503Z",
      "updated_at": "2026-07-11T17:29:42.567245Z"
    }
  ]
  ```

#### 2. Create Polygon
- **Endpoint**: `POST /api/v1/annotations/polygons/`
- **Request Body**:
  ```json
  {
    "image": 51,
    "label": "Car",
    "color": "#ff0000",
    "points": [{"x": 0.10, "y": 0.20}, {"x": 0.30, "y": 0.40}]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 227,
    "image": 51,
    "points": [
        {
            "x": 0.1,
            "y": 0.2
        },
        {
            "x": 0.3,
            "y": 0.4
        }
    ],
    "label": "Car",
    "color": "#ff0000",
    "label_position": null,
    "created_at": "2026-07-11T17:54:39.332488Z",
    "updated_at": "2026-07-11T17:54:39.332507Z"
  }
  ```

#### 3. Get Polygon
- **Endpoint**: `GET /api/v1/annotations/polygons/<id>/`
- **Response (200 OK)**:
  ```json
  {
    "id": 220,
    "image": 53,
    "points": [
        {
            "x": 0.22281397077037401,
            "y": 0.10762942779291552
        },
        {
            "x": 0.3067872182313599,
            "y": 0.10762942779291552
        },
        {
            "x": 0.3067872182313599,
            "y": 0.24250681198910082
        },
        {
            "x": 0.22281397077037401,
            "y": 0.24250681198910082
        }
    ],
    "label": "Bird",
    "color": "#6366f1",
    "label_position": null,
    "created_at": "2026-07-11T17:26:58.224503Z",
    "updated_at": "2026-07-11T17:29:42.567245Z"
  }
  ```

<!-- #### 4. Replace / Update Polygon
- **Endpoints**: `PUT /api/v1/annotations/polygons/<id>/` | `PATCH /api/v1/annotations/polygons/<id>/`
- **Request Body**:
  ```json
  {
    "points": [{"x": 0.20, "y": 0.30}, {"x": 0.40, "y": 0.50}]
  }
  ```
- **Response (200 OK)**: 
  ```json
  {
    "id": 220,
    "image": 53,
    "points": [
        {
            "x": 0.3067872182313599,
            "y": 0.24250681198910082
        },
        {
            "x": 0.22281397077037401,
            "y": 0.24250681198910082
        }
    ],
    "label": "Bird",
    "color": "#6366f1",
    "label_position": null,
    "created_at": "2026-07-11T17:26:58.224503Z",
    "updated_at": "2026-07-11T18:08:20.027492Z"
  } -->

#### 4. Delete Polygon
- **Endpoint**: `DELETE /api/v1/annotations/polygons/<id>/`
- **Response (204 No Content)**: *(Empty Body)*

#### 5. Clear Polygons for Image
- **Endpoint**: `DELETE /api/v1/annotations/polygons/clear/?image=<id>`
- **Response (200 OK)**:
  ```json
  {
    "deleted": 5
  }
  ```

---

### 🏷️ Annotation Workspace - Labels (`/api/v1/annotations/labels/`)

#### 1. List Labels
- **Endpoint**: `GET /api/v1/annotations/labels/`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Tree",
      "color": "#16a34a"
    }
  ]
  ```

#### 2. Create Custom Label
- **Endpoint**: `POST /api/v1/annotations/labels/`
- **Request Body**:
  ```json
  {
    "name": "Tree",
    "color": "#16a34a"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "name": "Tree",
    "color": "#16a34a",
    "created_at": "2026-07-12T04:35:11.463610Z"
  }
  ```

#### 3. Get Label
- **Endpoint**: `GET /api/v1/annotations/labels/<id>/`
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Tree",
    "color": "#16a34a",
    "created_at": "2026-07-12T04:35:11.463610Z"
  }
  ```

#### 4. Update Custom Label
- **Endpoints**: `PUT /api/v1/annotations/labels/<id>/` | `PATCH /api/v1/annotations/labels/<id>/`
- **Request Body**:
  ```json
  {
    "color": "#ff0000"
  }
  ```
- **Response (200 OK)**: 
  ```json
  {
    "id": 1,
    "name": "Tree",
    "color": "#ff0000"
    "created_at": "2026-07-12T04:35:11.463610Z"
  }
  ```

#### 5. Delete Label
- **Endpoint**: `DELETE /api/v1/annotations/labels/<id>/`
- **Response (204 No Content)**: *(Empty Body)*
