// src/App.jsx
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import Category from "./components/category/Category";
import Transaction from "./components/transaction/Transaction";
import Layout from "./components/Layout";

import { SignedIn, SignedOut } from "@clerk/clerk-react";

// Protect routes using Clerk
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/" replace />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Authenticated routes inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transaction />} />
          <Route path="category" element={<Category />} />
        </Route>

        {/* Catch-all → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
