import { Card, Row, Col } from "react-bootstrap";
import { useMemo, useState } from "react";
import useSWR from "swr";

import Bar from "./Bar";
import Donut from "./Donut";
import NetWorth from "./NetWorth";
import useTransactions from "../hooks/useTransactions";
import { fetchFxRate } from "../api/currencyApi.js";
import CryptoOverview from "./CryptoOverview.jsx";

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

  // Summary computation
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

  if (isLoading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-danger">Failed to load dashboard.</p>;

  return (
    <>
      {/* Summary Cards */}
      <Row className="mb-4">
        {/* Income */}
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="text-muted small">Total Income</div>
              <div className="h4 text-success">{formatCurrency(totalIncome)}</div>

              {exchangeRate && (
                <div className="small text-muted mt-2">
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
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="text-muted small">Total Expense</div>
              <div className="h4 text-danger">
                {formatCurrency(totalExpense)}
              </div>

              {exchangeRate && (
                <div className="small text-muted mt-2">
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
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="text-muted small">Current Net Worth</div>
              <div
                className={`h4 ${
                  currentNetWorth >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {currentNetWorth >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(currentNetWorth))}
              </div>

              {exchangeRate && (
                <div className="small text-muted mt-2">
                  {targetCurrency}:{" "}
                  {convert(currentNetWorth).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              )}

              {/* Best / Worst */}
              {bestMonthLabel && (
                <div className="small mt-2">
                  Best Month:{" "}
                  <strong>{bestMonthLabel}</strong>{" "}
                  <span className="text-success">
                    (+{formatCurrency(bestMonthNet)})
                  </span>
                </div>
              )}
              {worstMonthLabel && (
                <div className="small">
                  Worst Month:{" "}
                  <strong>{worstMonthLabel}</strong>{" "}
                  <span className="text-danger">
                    (-{formatCurrency(Math.abs(worstMonthNet))})
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Currency Converter UI */}
      <Card className="mb-4 shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Currency Conversion</strong>
            <div className="text-muted small">Base currency: USD</div>

            {fxError && <span className="text-danger small">Failed to load rate</span>}
            {!fxError && exchangeRate && (
              <span className="small text-muted">
                1 USD = {exchangeRate.toFixed(4)} {targetCurrency}
              </span>
            )}
          </div>

          <select
            className="form-select form-select-sm"
            style={{ width: 140 }}
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Card.Body>
      </Card>

      {/* Cashflow */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Cashflow</h5>
          <Bar />
        </Card.Body>
      </Card>

      {/* Net Worth */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Net Worth</h5>
          <NetWorth />
        </Card.Body>
      </Card>

      {/* Donuts */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5>Income Breakdown</h5>
              <Donut type="income" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5>Expense Breakdown</h5>
              <Donut type="expense" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Crypto Overview (External API: CoinGecko) */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Crypto Overview</h5>
            <small className="text-muted">
              Live prices & BTC trend (data from CoinGecko)
            </small>
          </div>
          <CryptoOverview />
        </Card.Body>
      </Card>
    </>
  );
}
