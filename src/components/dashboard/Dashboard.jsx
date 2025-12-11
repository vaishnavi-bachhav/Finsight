// src/components/Dashboard.jsx
import { Card, Row, Col, Badge } from "react-bootstrap";
import { useMemo, useState } from "react";
import useSWR from "swr";

import Bar from "./Bar.jsx";
import Donut from "./Donut.jsx";
import NetWorth from "./NetWorth.jsx";
import useTransactions from "../../hooks/useTransactions.js";
import { fetchFxRate } from "../../api/currencyApi.js";
import CryptoOverview from "./CryptoOverview.jsx";

// Icons
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Globe2,
  PieChart as PieChartIcon,
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

  // FX rate for currency conversion
  const { data: fxData, error: fxError } = useSWR(
    ["fx-rate", targetCurrency],
    ([, currency]) => fetchFxRate({ base: "USD", symbols: currency }),
    { revalidateOnFocus: false }
  );

  const exchangeRate = fxData?.rates?.[targetCurrency] || null;
  const convert = (usd) => (exchangeRate ? usd * exchangeRate : 0);

  // -----------------------------
  // Global summary computation
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
  // “This month’s snapshot” data
  // (for the new card like your landing preview)
  // -----------------------------
  const snapshot = useMemo(() => {
    if (!grouped?.length) {
      return {
        label: null,
        income: 0,
        expense: 0,
        net: 0,
        topExpenses: [],
      };
    }

    // backend already returns months sorted latest first
    const latest = grouped[0];

    const income = latest.totalIncome || 0;
    const expense = latest.totalExpense || 0;
    const net = income - expense;

    const expenseTotals = {};
    (latest.transactions || []).forEach((tx) => {
      if (tx.type !== "expense") return;
      const cat = tx.category?.name || "Uncategorized";
      const amt = Number(tx.amount || 0);
      expenseTotals[cat] = (expenseTotals[cat] || 0) + amt;
    });

    const topExpenses = Object.entries(expenseTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: expense ? (amount / expense) * 100 : 0,
      }));

    return {
      label: latest.month,
      income,
      expense,
      net,
      topExpenses,
    };
  }, [grouped]);

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
          {/* Currency selection / FX block */}
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

      {/* -------- New Cashflow Snapshot card (like your landing page) -------- */}
      {snapshot.label && (
        <Card className="dashboard-card shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between mb-3">
              <div>
                <div className="small text-muted mb-1">
                  This month&apos;s overview · {snapshot.label}
                </div>
                <div className="fw-bold text-surface">Cashflow Snapshot</div>
              </div>
              <div className="text-end small">
                <div
                  className={
                    snapshot.net >= 0
                      ? "text-success fw-semibold"
                      : "text-danger fw-semibold"
                  }
                >
                  {snapshot.net >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(snapshot.net))}
                </div>
                <div className="text-muted">Net this month</div>
              </div>
            </div>

            <Row className="gy-3 mb-3">
              <Col xs={6}>
                <Card className="border-0 stat-card">
                  <Card.Body className="py-2">
                    <div className="small text-muted">Income</div>
                    <div className="fw-semibold text-success">
                      {formatCurrency(snapshot.income)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="border-0 stat-card stat-card-expense">
                  <Card.Body className="py-2">
                    <div className="small text-muted">Expense</div>
                    <div className="fw-semibold text-danger">
                      {formatCurrency(snapshot.expense)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="gy-3">
              <Col md={6}>
                <div className="d-flex flex-column gap-2 w-100">
                  {snapshot.topExpenses.length > 0 ? (
                    snapshot.topExpenses.map((cat) => (
                      <div key={cat.name}>
                        <div className="d-flex justify-content-between small">
                          <span>{cat.name}</span>
                          <span className="text-danger">
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                        <div className="progress glass-progress">
                          <div
                            className="progress-bar bg-danger"
                            style={{
                              width: `${Math.min(100, cat.pct).toFixed(1)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="small text-muted">
                      No expense categories for this month yet.
                    </div>
                  )}
                </div>
              </Col>

              <Col
                md={6}
                className="d-flex flex-column align-items-center justify-content-center"
              >
                <PieChartIcon size={48} className="mb-2 text-primary" />
                <div className="small text-muted text-center">
                  See where every dollar goes with clear visual breakdowns.
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

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
