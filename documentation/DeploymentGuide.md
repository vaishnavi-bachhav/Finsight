## 🚀 Deployment Guide

FinSight is deployed using **Google Cloud Platform** for the backend and **Firebase Hosting** for the frontend.

---

## ☁️ Backend Deployment (Google Cloud Run)

### 🔧 Prerequisites
- Google Cloud account
- Google Cloud CLI installed
- Docker enabled
- MongoDB Atlas cluster
- Clerk application (Publishable & Secret keys)

---

### 📦 Steps to Deploy Backend

1. **Clone the backend repository**
   ```bash
   git clone https://github.com/vaishnavi-bachhav/FinSight.API.git
   cd FinSight.API
   ```

2. **Authenticate with Google Cloud**
    ```bash
    gcloud auth login
    gcloud config set project finsight-120798
    ```

3. **Enable required services**
    ```bash
    gcloud services enable run.googleapis.com
    ```

4. **Deploy to Cloud Run**
    ```bash
    gcloud run deploy finsight-api \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars \
    PORT=8080,\
    MONGO_URI=your_mongodb_uri,\
    CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key,\
    CLERK_SECRET_KEY=your_clerk_secret_key,\
    FRONTEND_URL=https://finsight-120798-77dca.web.app
    ```

5. **Verify deployment**

Health check:

GET `/health`

Example:`https://finsight-api-834761250594.us-central1.run.app/health`

---

## 🔐 Notes on Security

- All protected routes require a valid Clerk session
- Backend enforces user-level data isolation
- CORS is restricted to the deployed frontend URL

---

## 🌐 Frontend Deployment (Firebase Hosting)

### 🔧 Prerequisites
- Firebase CLI installed
- Firebase project linked to Google Cloud project

### 📦 Steps to Deploy Frontend

1. **Clone the frontend repository**
    ```bash
    git clone https://github.com/vaishnavi-bachhav/Finsight.git
    cd Finsight
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Create production environment file**
    ```bash
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_API_BASE=https://finsight-api-834761250594.us-central1.run.app
    ````

4. **Build the frontend**
    ```bash
    npm run build
    ```

5. **Deploy to Firebase**
    ```bash
    firebase deploy
    ```

6. **Verify deployment**

Live URL: `https://finsight-120798-77dca.web.app/`

---

## 🔁 Redeploying Changes
**Backend**
```bash
gcloud run deploy finsight-api --source .
```

**Frontend**
```bash
npm run build
firebase deploy
```
---

## ✅ Post-Deployment Checklist

- Frontend loads successfully
- Google login works (Clerk)
- Dashboard loads user-specific data
- Categories and transactions persist correctly
- Charts render with live data
- External APIs (Currency, Crypto, Inflation) respond correctly
- /health endpoint returns 200 OK