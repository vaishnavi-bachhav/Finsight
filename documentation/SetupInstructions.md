## ⚙️ Setup Instructions

This project consists of **two repositories**:

- **Frontend (React + Vite)**  
  https://github.com/vaishnavi-bachhav/Finsight

- **Backend (Express + MongoDB + Clerk)**  
  https://github.com/vaishnavi-bachhav/FinSight.API

Both repositories support **Dev Containers** to ensure the project runs on another machine without manual configuration.

---

## 🧰 Prerequisites

Make sure the following are installed on your system:

- **Git**
- **Docker Desktop**
- **Visual Studio Code**
- **VS Code Extensions**
  - Dev Containers
- **Node.js** (only if not using Dev Containers)
- A **Clerk account**
- A **MongoDB Atlas account**
- A **Google Cloud account** (for deployment)

---

## 🐳 Option 1: Run Using Dev Containers (Recommended)

This is the **preferred setup** for grading and collaboration.

### Frontend Setup (Dev Container)

1. Clone the frontend repository:
   ```bash
   git clone https://github.com/vaishnavi-bachhav/Finsight.git
   cd Finsight
   ```

2. Open the project in VS Code:
```
code .
```
3. When prompted, select: `Reopen in Container`

4. Create a .env file inside the frontend root:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE=https://<cloud-run-backend-url>
```

5. Start the frontend:
```
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Backend Setup (Dev Container)

1. Clone the backend repository:
```
git clone https://github.com/vaishnavi-bachhav/FinSight.API.git
cd FinSight.API
```

2. Open the project in VS Code:
```
code .
```

3. Reopen in Dev Container when prompted.

4. Create a .env file inside the backend root:
```
PORT=8080
MONGO_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=http://localhost:5173
```

4. Start the backend:
```
npm install
npm run dev --prefix backend
```

Backend will be available at: `http://localhost:8080`

---

## Health check:

GET  `http://localhost:8080/health`

---

🔐 Clerk Authentication Setup

Create a Clerk application at:

`https://dashboard.clerk.com`

Enable Google OAuth in Clerk dashboard.

Copy: - Publishable Key → frontend .env
      - Secret Key → backend .env

Configure allowed origins: `http://localhost:5173`

🧪 Running Automated Tests

Frontend includes Playwright end-to-end tests.
```
cd Finsight
npx playwright install
npx playwright test --host 0.0.0.0
```

Test coverage includes:

- Landing page rendering

## ☁️ Deployment (Summary)
Backend (Google Cloud Run)
Frontend (Firebase Hosting)