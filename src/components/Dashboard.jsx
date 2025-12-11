// src/components/Dashboard.jsx
import { Card, Row, Col, Badge } from "react-bootstrap";
import { useMemo, useState } from "react";
import useSWR from "swr";

import Bar from "./Bar";
import Donut from "./Donut";
import NetWorth from "./NetWorth";
import useTransactions from "../hooks/useTransactions";
import { fetchFxRate } from "../api/currencyApi.js";
import CryptoOverview from "./CryptoOverview.jsx";

// Icons (you already use lucide-react elsewhere)
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Globe2,
} from "lucide-react";

const CURRENCY_LIST = ["INR", "EUR", "GBP", "JPY", "AUD", "CAD"];

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Dashboard() {
  const { grouped, isLoading, error } = useTransactions();

  const [targetCurrency, setTargetCurrency] = useState("INR");

  // Fetch currency rate once per currency
  const { data: fxData, error: fxError } = useSWR(
    ["fx-rate", targetCurrency],
    ([, currency]) => fetchFxRate({ base: "USD", symbols: currency }),
    { revalidateOnFocus: false }
  );

  const exchangeRate = fxData?.rates?.[targetCurrency] || null;
  const convert = (usd) => (exchangeRate ? usd * exchangeRate : 0);

  // -----------------------------
  // Summary computation
  // -----------------------------
  const summary = useMemo(() => {
    if (!grouped?.length) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        currentNetWorth: 0,
        thisMonthLabel: null,
        thisMonthNet: 0,
        lastMonthLabel: null,
        lastMonthNet: 0,
        bestMonthLabel: null,
        bestMonthNet: 0,
        worstMonthLabel: null,
        worstMonthNet: 0,
      };
    }

    const result = grouped.reduce(
      (acc, m) => {
        const income = m.totalIncome || 0;
        const expense = m.totalExpense || 0;
        const net = income - expense;

        return {
          totalIncome: acc.totalIncome + income,
          totalExpense: acc.totalExpense + expense,
          currentNetWorth: acc.currentNetWorth + net,

          bestMonthNet: net > acc.bestMonthNet ? net : acc.bestMonthNet,
          bestMonthLabel: net > acc.bestMonthNet ? m.month : acc.bestMonthLabel,

          worstMonthNet: net < acc.worstMonthNet ? net : acc.worstMonthNet,
          worstMonthLabel:
            net < acc.worstMonthNet ? m.month : acc.worstMonthLabel,

          monthNets: [...acc.monthNets, { month: m.month, net }],
        };
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        currentNetWorth: 0,
        bestMonthNet: Number.NEGATIVE_INFINITY,
        bestMonthLabel: null,
        worstMonthNet: Number.POSITIVE_INFINITY,
        worstMonthLabel: null,
        monthNets: [],
      }
    );

    const lastIndex = result.monthNets.length - 1;
    const thisMonth = result.monthNets[lastIndex];
    const lastMonth = result.monthNets[lastIndex - 1];

    return {
      totalIncome: result.totalIncome,
      totalExpense: result.totalExpense,
      currentNetWorth: result.currentNetWorth,
      thisMonthLabel: thisMonth?.month || null,
      thisMonthNet: thisMonth?.net || 0,
      lastMonthLabel: lastMonth?.month || null,
      lastMonthNet: lastMonth?.net || 0,
      bestMonthLabel: result.bestMonthLabel,
      bestMonthNet: result.bestMonthNet,
      worstMonthLabel: result.worstMonthLabel,
      worstMonthNet: result.worstMonthNet,
    };
  }, [grouped]);

  const {
    totalIncome,
    totalExpense,
    currentNetWorth,
    bestMonthLabel,
    bestMonthNet,
    worstMonthLabel,
    worstMonthNet,
  } = summary;

  // -----------------------------
  // Loading / error
  // -----------------------------
  if (isLoading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-danger">Failed to load dashboard.</p>;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="dashboard-root">
      {/* Header row */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="page-title mb-1">Overview</h2>
          <p className="page-subtitle mb-0">
            Track your income, expenses, and net worth at a glance.
          </p>
        </Col>
        <Col md="auto" className="mt-3 mt-md-0">
          {/* Currency selection inline for a more “control panel” feel */}
          <Card className="dashboard-card shadow-sm">
            <Card.Body className="py-2 px-3 d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <div className="icon-pill">
                  <Globe2 size={16} />
                </div>
                <div className="small">
                  <div className="text-muted">Display currency</div>
                  <div className="text-surface fw-semibold">
                    Base: USD → {targetCurrency}
                  </div>
                </div>
              </div>
              <div className="ms-auto d-flex flex-column align-items-end">
                <select
                  className="form-select form-select-sm fx-select"
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                >
                  {CURRENCY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="small text-muted mt-1">
                  {fxError && <span className="text-danger">Rate unavailable</span>}
                  {!fxError && exchangeRate && (
                    <span>1 USD = {exchangeRate.toFixed(4)} {targetCurrency}</span>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        {/* Income */}
        <Col md={4}>
          <Card className="dashboard-card shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Total Income</span>
                <Badge bg="success" pill className="summary-badge">
                  <ArrowUpCircle size={14} className="me-1" /> Inflow
                </Badge>
              </div>
              <div className="h4 text-success mb-1">
                {formatCurrency(totalIncome)}
              </div>

              {exchangeRate && (
                <div className="small text-muted mt-1">
                  {targetCurrency}:{" "}
                  {convert(totalIncome).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Expense */}
        <Col md={4}>
          <Card className="dashboard-card shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Total Expense</span>
                <Badge bg="danger" pill className="summary-badge">
                  <ArrowDownCircle size={14} className="me-1" /> Outflow
                </Badge>
              </div>
              <div className="h4 text-danger mb-1">
                {formatCurrency(totalExpense)}
              </div>

              {exchangeRate && (
                <div className="small text-muted mt-1">
                  {targetCurrency}:{" "}
                  {convert(totalExpense).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Net Worth */}
        <Col md={4}>
          <Card className="dashboard-card shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Current Net Worth</span>
                <div className="icon-pill icon-pill-soft">
                  <Wallet size={16} />
                </div>
              </div>

              <div
                className={`h4 mb-1 ${
                  currentNetWorth >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {currentNetWorth >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(currentNetWorth))}
              </div>

              {exchangeRate && (
                <div className="small text-muted mt-1">
                  {targetCurrency}:{" "}
                  {convert(currentNetWorth).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              )}

              {/* Best / Worst */}
              <div className="mt-2 small">
                {bestMonthLabel && (
                  <div>
                    <span className="text-muted">Best month: </span>
                    <strong>{bestMonthLabel}</strong>{" "}
                    <span className="text-success">
                      (+{formatCurrency(bestMonthNet)})
                    </span>
                  </div>
                )}
                {worstMonthLabel && (
                  <div>
                    <span className="text-muted">Worst month: </span>
                    <strong>{worstMonthLabel}</strong>{" "}
                    <span className="text-danger">
                      (-{formatCurrency(Math.abs(worstMonthNet))})
                    </span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cashflow + Net Worth */}
      <Row className="mb-4 g-3">
        <Col lg={7}>
          <Card className="dashboard-card shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="dashboard-title mb-0">Cashflow</h5>
                <span className="text-muted small">
                  Monthly income vs expense by category
                </span>
              </div>
              <Bar />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="dashboard-card shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="dashboard-title mb-0">Net Worth Trend</h5>
                <span className="text-muted small">Cumulative over time</span>
              </div>
              <NetWorth />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Donuts */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="dashboard-card shadow-sm h-100">
            <Card.Body>
              <h5 className="dashboard-title mb-2">Income Breakdown</h5>
              <p className="small text-muted mb-3">
                Which income sources contribute most to your inflow.
              </p>
              <Donut type="income" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="dashboard-card shadow-sm h-100">
            <Card.Body>
              <h5 className="dashboard-title mb-2">Expense Breakdown</h5>
              <p className="small text-muted mb-3">
                See where your spending is concentrated each month.
              </p>
              <Donut type="expense" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Crypto Overview (External API: CoinGecko) */}
      <Card className="dashboard-card mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="dashboard-title mb-0">Crypto Overview</h5>
            <small className="text-muted">
              Live prices & BTC trend (data from CoinGecko)
            </small>
          </div>
          <CryptoOverview />
        </Card.Body>
      </Card>
    </div>
  );
}
