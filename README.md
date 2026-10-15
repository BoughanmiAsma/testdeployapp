# testdeployapp: Kubernetes & Docker Deployment Test ☸️

This project is a lightweight full-stack application built to test and demonstrate local deployment workflows on Kubernetes. It features a React frontend served by Nginx, a Node.js/Express backend API, and a PostgreSQL database, all containerized with Docker and orchestrated by Docker Compose.

## ✨ Features

- **Frontend**: React 19 with Vite, styled with CSS-in-JS and Tailwind CSS.
- **Backend**: Node.js with Express 5.2, utilizing security middleware (Helmet, Rate Limiter) and logging (Morgan).
- **Database**: PostgreSQL 16, with automatic table initialization and connection testing.
- **Containerization**: Docker and Docker Compose for streamlined local development and deployment.
- **Kubernetes Ready**: Includes Kubernetes manifests for deployment.
- **Health Checks**: Comprehensive health endpoints for monitoring application status.
- **Developer Tools**: ESLint for code quality and Vitest for testing.
- **Interactive UI**: A dynamic frontend provides real-time status updates and allows interaction with the backend API.

## 🚀 Tech Stack

- **Languages**: JavaScript, CSS, HTML, YAML, JSON
- **Frontend**: React 19, Vite, Tailwind CSS (via CSS-in-JS)
- **Backend**: Node.js, Express 5.2
- **Database**: PostgreSQL 16
- **Containerization**: Docker, Docker Compose
- **Testing**: Vitest, Supertest
- **Linting**: ESLint
- **Deployment**: Kubernetes manifests provided

## 📋 Table of Contents

- [Project Title & Badges](#testdeployapp-kubernetes--docker-deployment-test-)
- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Table of Contents](#table-of-contents)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Kubernetes Deployment Guide](#kubernetes-deployment-guide)
- [Contributing](#contributing)
- [License](#license)
- [Important Links](#important-links)
- [Footer](#footer)

## 📝 Description

A lightweight full-stack application specifically designed to test and demonstrate local deployment workflows on Kubernetes. It serves as a practical example for understanding containerization, orchestration, and full-stack application deployment in a cloud-native environment. The application features a clear separation between the frontend and backend, robust health check mechanisms, and interactive elements for validating API and database operations.

## 🔧 Prerequisites

- **Node.js**: v18 or later recommended.
- **Docker**: Installed and running.
- **Docker Compose**: Installed.
- **Git**: For cloning the repository.
- **kubectl**: For Kubernetes interactions.

## 📦 Installation

### Using the Setup Script

This is the recommended and easiest way to set up the project:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/BoughanmiAsma/testdeployapp.git
    cd testdeployapp
    ```

2.  **Run the setup script:**
    ```bash
    npm run setup
    ```

    This script will:
    - Install dependencies for both frontend and backend using pnpm.
    - Generate necessary `.env` files with default configurations.
    - Set up Dockerfiles and Nginx configurations if they don't exist.
    - Configure ESLint for the backend.

### Manual Setup

If you prefer a manual approach:

1.  **Install Dependencies:**
    ```bash
    # For the backend
    cd backend
    pnpm install
    cd ..

    # For the frontend
    cd frontend
    pnpm install
    cd ..
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` directory based on `.env.example` and configure your database connection details.
    ```bash
    # In backend directory
    cp .env.example .env
    ```
    The `frontend/.env.example` file is minimal, as the `VITE_API_URL` is often handled by environment variables during the build or runtime in a containerized environment.

## ▶️ Usage

### Development Environment with Docker Compose

Start the entire application stack (PostgreSQL, backend, frontend) using Docker Compose:

```bash
# From the root directory
npm run start:dev
```

This command will build and run all services defined in `docker-compose.yml`. The application will be accessible at:

-   **Frontend**: `http://localhost:3000`
-   **Backend API**: Accessible via the frontend proxy or directly at `http://localhost:5000` (though direct access might require CORS configuration adjustments).

### Running Individual Services (Development)

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build (Frontend)

To build the production-ready frontend assets:

```bash
# From the root directory
npm run build:frontend
```

This command uses `vite build` to create optimized static files in the `frontend/dist` directory.

## 💡 How to Use

The primary purpose of this application is to serve as a **deployment validator**. Once deployed (locally via Docker Compose or on Kubernetes), you can interact with the frontend to:

1.  **Verify Connectivity**: The frontend dashboard displays the real-time status of the backend API and PostgreSQL database connection, including latency and uptime.
2.  **Test API Endpoints**: Add new messages to the PostgreSQL database via the input field or the pre-configured test buttons. This validates:
    -   The frontend's ability to communicate with the backend API (`/api/todos`).
    -   The backend's ability to connect to and perform CRUD operations on the PostgreSQL database.
    -   Data persistence: Newly added items should appear in the list and persist across container restarts (if volumes are correctly configured).
3.  **Test Ingress Routing**: Accessing `http://testdeployapp.com:3000` (after configuring your local hosts file and deploying with Kubernetes Ingress) will route traffic through an Ingress controller to the frontend, which then proxies API requests to the backend.
4.  **Check Kubernetes Deployment**: Use the provided Kubernetes manifests to deploy the application to a Kubernetes cluster and verify resource creation, networking, and service discovery.

This application effectively acts as a self-testing deployment artifact.

## 📁 Project Structure

```
testdeployapp/
├── .dockerignore
├── .git/
├── CONTRIBUTING.md
├── Dockerfile       # Root Dockerfile (if any, though primarily per-service)
├── README.md        # Main README
├── docker-compose.prod.yml
├── docker-compose.yml
├── frontend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── README.md
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── setupTests.js
│   ├── vite.config.js
│   └── dist/        # Built frontend assets (generated)
├── k8s/
│   ├── Ingress.yaml
│   ├── Role-developer.yaml
│   ├── RoleBinding.yaml
│   ├── deploiement-backend.yaml
│   ├── deploiement-bd.yaml
│   ├── deploiement-front.yaml
│   ├── postgres-pvc.yaml
│   └── secret-db.yaml
├── backend/
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── db/connect.js
│   │   ├── index.js
│   │   ├── middleware/errorHandler.js
│   │   └── routes/api.js
│   │   └── test/api.test.js
│   └── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── scripts/setup.js
```

## 💡 API Reference

### Health Check

-   **Endpoint**: `GET /api/health`
-   **Description**: Checks the status of the backend API and its connection to the PostgreSQL database. Returns detailed information about the connection status, database version, and API uptime.
-   **Success Response**: Status code `200 OK` with a JSON body:
    ```json
    {
      "status": "ok",
      "database": "connected",
      "dbVersion": "PostgreSQL 16",
      "uptime": 1234,
      "timestamp": "2023-10-27T10:00:00.000Z"
    }
    ```
-   **Error Response**: Status code `500 Internal Server Error` if the database connection fails:
    ```json
    {
      "status": "error",
      "database": "disconnected",
      "message": "Connection refused"
    }
    ```

### Todos API

-   **`GET /api/todos`**: Retrieves all to-do items from the database.
    Returns an array of to-do objects.

-   **`POST /api/todos`**: Creates a new to-do item.
    Requires a JSON body with a `title` field.
    Example Body: `{"title": "Learn Docker"}`
    Returns the newly created to-do item with status `201 Created`.

-   **`PATCH /api/todos/:id`**: Toggles the `completed` status of a specific to-do item.
    Requires the item's `id` in the URL path.
    Returns the updated to-do item.

-   **`DELETE /api/todos/:id`**: Deletes a specific to-do item.
    Requires the item's `id` in the URL path.
    Returns a success message upon deletion.

## 🚀 Kubernetes Deployment Guide

This section provides a high-level guide for deploying the application to a Kubernetes cluster. Ensure you have `kubectl` installed and configured.

1.  **Apply Secrets and Persistent Volume Claim (PVC):**
    First, create the necessary secrets for database credentials and the PVC for PostgreSQL data persistence.
    ```bash
    kubectl apply -f k8s/secret-db.yaml -f k8s/postgres-pvc.yaml
    ```

2.  **Deploy PostgreSQL and Backend Services:**
    Deploy the PostgreSQL database and the backend API using their respective deployment manifests.
    ```bash
    kubectl apply -f k8s/deploiement-bd.yaml -f k8s/deploiement-backend.yaml
    ```

3.  **Deploy Frontend and Ingress Controller:**
    Deploy the frontend application and configure an Ingress resource to route external traffic to the frontend and backend services.
    ```bash
    kubectl apply -f k8s/deploiement-front.yaml -f k8s/Ingress.yaml
    ```

4.  **Configure Local Hosts File:**
    To test the Ingress locally, add the following line to your system's `hosts` file (`/etc/hosts` on Linux/macOS, `C:\Windows\System32\drivers\etc\hosts` on Windows):
    ```
    127.0.0.1 testdeployapp.com
    ```
    After this setup, you should be able to access the application via `http://testdeployapp.com` (or the port specified in your Ingress configuration).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

Refer to the `CONTRIBUTING.md` file for more detailed guidelines (if available).

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🔗 Important Links

-   **Repository**: [https://github.com/BoughanmiAsma/testdeployapp](https://github.com/BoughanmiAsma/testdeployapp)

## 🍪 Footer

© 2023 [BoughanmiAsma](https://github.com/BoughanmiAsma)

Repository: [testdeployapp](https://github.com/BoughanmiAsma/testdeployapp)

Made with ❤️ and ☕.

> If you find this project helpful, please consider forking, starring, or opening an issue!


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**