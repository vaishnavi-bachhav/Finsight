## FinSight – Personal Finance Dashboard

A full-stack financial tracking app with authentication, charts, transactions, and testing.

✨ Features

- Google/Clerk Authentication
- Add/Edit/Delete Transactions
- Add/Edit/Delete Categories
- Monthly breakdowns & summaries
- Beautiful charts (AG Charts)
- Dark theme UI
- Currency conversion (external API)
- Crypto overview via CoinGecko API
- Playwright E2E Testing
- Fully configured Dev Container

🧱 Tech Stack
| Layer | Tech |
|-----:|-----------|
|Frontend|	React + Vite + Bootstrap + AG Charts|
|Backend|	Node.js (Express), MongoDB|
|Auth|	Clerk|
|Testing|	Playwright|
|Dev Environment|	VS Code Dev Container|
|Deployment|	Google Cloud Provider|

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