# FinSight – Personal Finance Dashboard

FinSight is a full-stack personal finance dashboard that helps users track income, expenses, categories, net worth, and financial trends over time.  
The application is built using **React (Vite)** on the frontend, **Express + MongoDB** on the backend, secured with **Clerk authentication**, and deployed on **Google Cloud Run** (API) and **Firebase Hosting** (frontend).

---

## ✨ Features

### 🔐 Secure Authentication
- Google Sign-In powered by **Clerk**
- Protected routes for Dashboard, Transactions, and Categories
- Secure session handling using JWT and cookies

---

### 📊 Interactive Financial Dashboard
- Monthly **Income vs Expense** bar chart
- **Cumulative Net Worth** trend line
- Category-wise income and expense breakdown using donut charts
- Real-time updates when transactions change

---

### 💸 Transaction Management
- Add, edit, and delete transactions
- Transactions grouped **month-wise**
- Fields include:
  - Date (future dates disabled)
  - Income / Expense type
  - Amount
  - Category
  - Optional notes
- Pagination and filters:
  - Filter by type (income / expense)
  - Filter by category
  - Filter by month
- Clear confirmation modal before deleting a transaction

### 🗂️ Category Management
- Create custom **Income** and **Expense** categories
- Upload category icons
- Edit or delete categories
- **Safe delete behavior**:
  - Deleting a category does **not** delete transactions
  - Transactions using a deleted category are shown as **“Uncategorized”**
- Search and filter categories by name and type

---

### 🌍 Multi-Currency Support (External API)
- Convert totals into multiple currencies (INR, EUR, GBP, etc.)
- Uses a live **currency exchange rate API**
- Currency selection updates dashboard values instantly

---

### 📈 Crypto Market Overview (External API)
- Live cryptocurrency prices using **CoinGecko API** (BTC, ETH, DOGE)
- Displays price changes and trends
- Helps users correlate finances with crypto market movements

---

### 📉 Inflation Insights (External API)
- Integrates **World Bank Open Data API** for inflation rates
- Displays latest annual **Consumer Price Inflation (%)** by country
- Helps users understand how inflation impacts real spending power

--- 

## 🧱 Tech Stack
| Layer | Tech |
|-----:|-----------|
|Frontend|	React + Vite + Bootstrap + AG Charts|
|Backend|	Node.js (Express), MongoDB|
|Auth|	Clerk|
|Testing|	Playwright|
|Dev Environment|	VS Code Dev Container|
|Deployment|	Google Cloud Provider, Firebase|

---

## 🏗️ Architecture Overview

FinSight follows a **modern client-server architecture**:

- **Frontend (React + Vite)**  Handles UI, charts, routing, and user interaction.
- **Authentication (Clerk)**   Manages secure login, session handling, and protected routes.
- **Backend (Express API)**    Handles business logic, data validation, and aggregation.
- **Database (MongoDB Atlas)** Stores users’ categories and transactions.
- **External APIs**         
  - Currency exchange rates
  - Crypto prices (CoinGecko)
  - Inflation insights 

---

##  Architecture Diagram

flowchart TB
  %% Clients
  U[User Browser] -->|HTTPS| FE[React + Vite Frontend<br/>Firebase Hosting]
  
  %% Auth
  FE -->|Clerk SDK| CLERK[Clerk Auth Service]
  CLERK -->|JWT / Session| FE

  %% Backend
  FE -->|HTTPS API Calls + Clerk Token| API[Express Backend<br/>Cloud Run]

  %% Database
  API -->|MongoDB Driver| DB[(MongoDB Atlas / MongoDB)]
  
  %% External APIs
  API --> FX[FX Rates API]
  API --> CG[CoinGecko API<br/>Crypto Prices]
  API --> INF[Inflation API<br/>World Bank / Similar]

  %% Notes
  FE -->|Charts| CHARTS[AG Charts]

---

## Sequence Diagram

![sequence diagram](<sequence -finsight-1.png>)

## API Documentation
Detailed API Documentation is available on : [FinSight API](https://github.com/vaishnavi-bachhav/Finsight/blob/main/APIDocumentation.md).


🚀 Getting Started
1. Clone the repo
```
git clone https://github.com/vaishnavi-bachhav/Finsight
cd Finsight 
```

2. Open in VS Code Dev Container

Make sure you have:

- VS Code
- Dev Containers extension
- Docker running

Then press:
```
Ctrl + Shift + P → “Dev Containers: Reopen in Container”
```
All dependencies will auto-install.


🔧 Environment Variables

Create .env in frontend/:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
VITE_API_BASE=http://localhost:3000
```

Create .env in backend/:

```
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
MONGO_URI=your_mongodb_atlas_url
COINGECKO_API_BASE=https://api.coingecko.com/api/v3
CURRENCY_API_BASE=https://api.exchangerate.host
```

▶️ Run Frontend

```
cd frontend
npm install
npm run dev
```

▶️ Run Backend

```
cd backend
npm install
node server.js
```


📚 Attribution of External Sources

Clerk Authentication – https://clerk.dev

CoinGecko API – https://www.coingecko.com

Exchange Rate APIs – public exchange-rate services

AG Charts – https://www.ag-grid.com

React Bootstrap – https://react-bootstrap.github.io